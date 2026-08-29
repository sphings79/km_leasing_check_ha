"""Pure leasing mileage calculations.

This module deliberately contains no Home Assistant imports. Everything here is
a pure function of the contract parameters, the current date and the odometer
readings handed in, which keeps the arithmetic testable without a Home
Assistant installation -- and the arithmetic is where the subtle bugs live.

All mileage values are expressed in the unit of the odometer entity (km for
every supported configuration); unit conversion is a display concern and is
left to Home Assistant.
"""

from __future__ import annotations

import calendar
from dataclasses import dataclass
from datetime import date
from enum import StrEnum


class ForecastBasis(StrEnum):
    """Average daily rate the forecasts and warnings are based on."""

    TOTAL = "total"
    DAYS_30 = "d30"
    DAYS_90 = "d90"


def add_months(day: date, months: int) -> date:
    """Add `months` to `day`, clamping to the last day of the target month."""
    month = day.month - 1 + months
    year = day.year + month // 12
    month = month % 12 + 1
    return date(year, month, min(day.day, calendar.monthrange(year, month)[1]))


def month_end(day: date) -> date:
    """Return the last day of the month `day` falls into."""
    return date(day.year, day.month, calendar.monthrange(day.year, day.month)[1])


@dataclass(frozen=True, slots=True)
class Contract:
    """The leasing contract as the user configured it."""

    start: date
    months: int
    total_km: float
    start_km: float = 0.0

    @property
    def end(self) -> date:
        """Return the last day covered by the contract."""
        return add_months(self.start, self.months)

    @property
    def total_days(self) -> int:
        """Return the contract duration in days."""
        return (self.end - self.start).days

    @property
    def daily_target(self) -> float:
        """Return the mileage the contract allows per day."""
        return self.total_km / self.total_days

    @property
    def annual_allowance(self) -> float:
        """Return the contractual mileage allowance per full year."""
        return self.total_km / (self.months / 12)


@dataclass(frozen=True, slots=True)
class Readings:
    """Odometer readings the calculation works with.

    Everything but `odometer` comes from the recorder and may be missing, for
    instance because the odometer entity is excluded from recording or its
    history has already been purged.
    """

    odometer: float
    odometer_30d_ago: float | None = None
    odometer_90d_ago: float | None = None
    odometer_at_contract_year_start: float | None = None


@dataclass(frozen=True, slots=True)
class Result:
    """Every value the integration exposes, in contract units."""

    # Base figures
    km_driven: float
    elapsed_days: int
    total_days: int
    days_remaining: int
    contract_end_date: date

    # Rates
    daily_target: float
    daily_actual: float | None
    daily_actual_30d: float | None
    daily_actual_90d: float | None
    forecast_rate: float | None

    # Target vs. actual
    target_today: float
    deviation_today: float
    target_month_end: float
    deviation_month_end: float

    # Contract year
    contract_year: int
    contract_year_start: date
    contract_year_end: date
    contract_year_allowance: float
    contract_year_target_to_date: float
    contract_year_driven: float | None
    contract_year_deviation: float | None
    annual_allowance: float

    # Remaining mileage on target basis
    remaining_contract_year: float
    remaining_calendar_year: float
    remaining_contract_end: float
    remaining_total: float

    # Forecasts
    forecast_contract_year_end: float | None
    forecast_calendar_year_end: float | None
    forecast_contract_end: float | None
    forecast_deviation_contract_end: float | None

    # Percentages
    mileage_used_pct: float
    contract_elapsed_pct: float

    # Status
    above_target: bool
    annual_forecast_exceeded: bool
    contract_forecast_exceeded: bool


def contract_year_bounds(contract: Contract, today: date) -> tuple[int, date, date]:
    """Return the 1-based number, first and last day of the current contract year.

    Contract years roll from the contract start date, not from January. A final
    partial year is cut off at the contract end, so the individual year spans
    always add up to the full contract duration.
    """
    index = 0
    while (
        index + 1 < (contract.months + 11) // 12
        and add_months(contract.start, 12 * (index + 1)) <= today
    ):
        index += 1

    year_start = add_months(contract.start, 12 * index)
    year_end = min(add_months(contract.start, 12 * (index + 1)), contract.end)
    return index + 1, year_start, year_end


def _days_between(start: date, end: date) -> int:
    """Return the number of days from `start` to `end`, never below zero."""
    return max(0, (end - start).days)


def _rate(driven: float | None, days: int) -> float | None:
    """Return the average daily mileage, or None if the window is empty."""
    if driven is None or days <= 0:
        return None
    return driven / days


def evaluate(
    contract: Contract,
    readings: Readings,
    today: date,
    basis: ForecastBasis = ForecastBasis.TOTAL,
) -> Result:
    """Calculate every exposed value for one contract on a given day."""
    km_driven = max(0.0, readings.odometer - contract.start_km)

    total_days = contract.total_days
    elapsed_days = _days_between(contract.start, today)
    days_remaining = _days_between(today, contract.end)

    daily_target = contract.daily_target
    daily_actual = _rate(km_driven, elapsed_days)
    daily_actual_30d = _rate(
        None
        if readings.odometer_30d_ago is None
        else max(0.0, readings.odometer - readings.odometer_30d_ago),
        30,
    )
    daily_actual_90d = _rate(
        None
        if readings.odometer_90d_ago is None
        else max(0.0, readings.odometer - readings.odometer_90d_ago),
        90,
    )

    # The selected basis falls back to the lifetime average whenever the
    # recorder could not supply the windowed value.
    forecast_rate = {
        ForecastBasis.TOTAL: daily_actual,
        ForecastBasis.DAYS_30: daily_actual_30d,
        ForecastBasis.DAYS_90: daily_actual_90d,
    }[basis]
    if forecast_rate is None:
        forecast_rate = daily_actual

    # --- Target vs. actual ------------------------------------------------
    target_today = daily_target * elapsed_days
    deviation_today = km_driven - target_today

    month_end_day = min(month_end(today), contract.end)
    target_month_end = daily_target * _days_between(contract.start, month_end_day)
    deviation_month_end = km_driven - target_month_end

    # --- Contract year ----------------------------------------------------
    year_no, year_start, year_end = contract_year_bounds(contract, today)
    year_days = _days_between(year_start, year_end)
    contract_year_allowance = daily_target * year_days
    contract_year_elapsed = min(_days_between(year_start, today), year_days)
    contract_year_target_to_date = daily_target * contract_year_elapsed

    contract_year_driven: float | None = None
    if year_start <= contract.start:
        # First contract year: no history needed, everything driven counts.
        contract_year_driven = km_driven
    elif readings.odometer_at_contract_year_start is not None:
        contract_year_driven = max(
            0.0, readings.odometer - readings.odometer_at_contract_year_start
        )
    contract_year_deviation = (
        None
        if contract_year_driven is None
        else contract_year_driven - contract_year_target_to_date
    )

    # --- Remaining mileage on target basis --------------------------------
    calendar_year_end = min(date(today.year, 12, 31), contract.end)
    remaining_contract_year = daily_target * _days_between(today, year_end)
    remaining_calendar_year = daily_target * _days_between(today, calendar_year_end)
    remaining_contract_end = daily_target * days_remaining
    remaining_total = contract.total_km - km_driven

    # --- Forecasts --------------------------------------------------------
    def forecast(until: date) -> float | None:
        """Project the mileage driven by `until` at the selected rate."""
        if forecast_rate is None:
            return None
        return km_driven + forecast_rate * _days_between(today, until)

    forecast_contract_year_end = forecast(year_end)
    forecast_calendar_year_end = forecast(calendar_year_end)
    forecast_contract_end = forecast(contract.end)
    forecast_deviation_contract_end = (
        None
        if forecast_contract_end is None
        else forecast_contract_end - contract.total_km
    )

    # --- Status -----------------------------------------------------------
    if contract_year_driven is not None and forecast_rate is not None:
        year_projection = contract_year_driven + forecast_rate * _days_between(
            today, year_end
        )
        annual_forecast_exceeded = year_projection > contract_year_allowance
    elif forecast_rate is not None:
        # Without history for the running contract year, fall back to comparing
        # the annualised rate against the contractual annual allowance.
        annual_forecast_exceeded = forecast_rate * 365 > contract.annual_allowance
    else:
        annual_forecast_exceeded = False

    return Result(
        km_driven=km_driven,
        elapsed_days=elapsed_days,
        total_days=total_days,
        days_remaining=days_remaining,
        contract_end_date=contract.end,
        daily_target=daily_target,
        daily_actual=daily_actual,
        daily_actual_30d=daily_actual_30d,
        daily_actual_90d=daily_actual_90d,
        forecast_rate=forecast_rate,
        target_today=target_today,
        deviation_today=deviation_today,
        target_month_end=target_month_end,
        deviation_month_end=deviation_month_end,
        contract_year=year_no,
        contract_year_start=year_start,
        contract_year_end=year_end,
        contract_year_allowance=contract_year_allowance,
        contract_year_target_to_date=contract_year_target_to_date,
        contract_year_driven=contract_year_driven,
        contract_year_deviation=contract_year_deviation,
        annual_allowance=contract.annual_allowance,
        remaining_contract_year=remaining_contract_year,
        remaining_calendar_year=remaining_calendar_year,
        remaining_contract_end=remaining_contract_end,
        remaining_total=remaining_total,
        forecast_contract_year_end=forecast_contract_year_end,
        forecast_calendar_year_end=forecast_calendar_year_end,
        forecast_contract_end=forecast_contract_end,
        forecast_deviation_contract_end=forecast_deviation_contract_end,
        mileage_used_pct=km_driven / contract.total_km * 100,
        contract_elapsed_pct=min(elapsed_days / total_days * 100, 100.0),
        above_target=deviation_today > 0,
        annual_forecast_exceeded=annual_forecast_exceeded,
        contract_forecast_exceeded=(
            forecast_contract_end is not None
            and forecast_contract_end > contract.total_km
        ),
    )
