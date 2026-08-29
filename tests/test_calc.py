"""Tests for the pure leasing mileage arithmetic."""

from datetime import date

import pytest

from custom_components.leasing_km.calc import (
    Contract,
    ForecastBasis,
    Readings,
    add_months,
    contract_year_bounds,
    evaluate,
    month_end,
)

# A 48 month / 80,000 km contract on a car that had 40,000 km on the clock when
# the contract started -- the case the first version got wrong.
CONTRACT = Contract(start=date(2025, 3, 1), months=48, total_km=80_000, start_km=40_000)
TODAY = date(2025, 5, 30)  # 90 days into the contract


def test_add_months_clamps_to_shorter_month():
    assert add_months(date(2025, 1, 31), 1) == date(2025, 2, 28)
    assert add_months(date(2024, 1, 31), 1) == date(2024, 2, 29)
    assert add_months(date(2025, 3, 1), 48) == date(2029, 3, 1)


def test_month_end():
    assert month_end(date(2025, 2, 10)) == date(2025, 2, 28)
    assert month_end(date(2025, 12, 1)) == date(2025, 12, 31)


def test_contract_basics():
    assert CONTRACT.end == date(2029, 3, 1)
    assert CONTRACT.total_days == 1461  # includes the 2028 leap day
    assert CONTRACT.annual_allowance == 20_000
    assert CONTRACT.daily_target == pytest.approx(80_000 / 1461)


def test_start_km_is_subtracted():
    """The odometer offset must not count against the contract allowance."""
    result = evaluate(CONTRACT, Readings(odometer=45_000), TODAY)

    assert result.km_driven == 5_000
    assert result.elapsed_days == 90
    assert result.daily_actual == pytest.approx(5_000 / 90)
    assert result.mileage_used_pct == pytest.approx(6.25)


def test_target_and_deviation():
    result = evaluate(CONTRACT, Readings(odometer=45_000), TODAY)
    daily = 80_000 / 1461

    assert result.target_today == pytest.approx(daily * 90)
    assert result.deviation_today == pytest.approx(5_000 - daily * 90)
    assert result.above_target is True
    # May has 31 days, so month end is one day further out than today.
    assert result.target_month_end == pytest.approx(daily * 91)
    assert result.deviation_month_end == pytest.approx(5_000 - daily * 91)


def test_month_end_is_capped_at_contract_end():
    """A contract ending mid-month must not be projected past its last day."""
    contract = Contract(start=date(2025, 3, 1), months=4, total_km=5_000)
    result = evaluate(contract, Readings(odometer=1_000), date(2025, 7, 1))

    assert contract.end == date(2025, 7, 1)
    assert result.target_month_end == pytest.approx(contract.total_km)


def test_contract_years_roll_from_the_start_date():
    _, first_start, first_end = contract_year_bounds(CONTRACT, date(2025, 5, 30))
    assert (first_start, first_end) == (date(2025, 3, 1), date(2026, 3, 1))

    number, start, end = contract_year_bounds(CONTRACT, date(2026, 3, 1))
    assert (number, start, end) == (2, date(2026, 3, 1), date(2027, 3, 1))


def test_partial_final_contract_year_is_cut_off_and_years_add_up():
    contract = Contract(start=date(2025, 3, 1), months=40, total_km=50_000)
    number, start, end = contract_year_bounds(contract, date(2028, 6, 1))

    assert (number, start, end) == (4, date(2028, 3, 1), date(2028, 7, 1))
    assert end == contract.end

    spans = []
    for index in range(4):
        day = add_months(contract.start, 12 * index)
        _, year_start, year_end = contract_year_bounds(contract, day)
        spans.append((year_end - year_start).days)
    assert sum(spans) == contract.total_days


def test_first_contract_year_needs_no_history():
    result = evaluate(CONTRACT, Readings(odometer=45_000), TODAY)

    assert result.contract_year == 1
    assert result.contract_year_driven == 5_000
    assert result.contract_year_allowance == pytest.approx(80_000 / 1461 * 365)


def test_later_contract_year_uses_the_recorded_odometer():
    today = date(2026, 6, 1)
    result = evaluate(
        CONTRACT,
        Readings(odometer=53_000, odometer_at_contract_year_start=50_000),
        today,
    )
    elapsed_in_year = (today - date(2026, 3, 1)).days

    assert result.contract_year == 2
    assert result.contract_year_driven == 3_000
    assert result.contract_year_deviation == pytest.approx(
        3_000 - 80_000 / 1461 * elapsed_in_year
    )


def test_later_contract_year_without_history_stays_unknown():
    result = evaluate(CONTRACT, Readings(odometer=53_000), date(2026, 6, 1))

    assert result.contract_year_driven is None
    assert result.contract_year_deviation is None
    # The forecast itself still works, it only loses the per-year comparison.
    assert result.forecast_contract_end is not None


def test_forecast_uses_the_selected_window():
    readings = Readings(odometer=45_000, odometer_30d_ago=44_000)
    days_left = 1461 - 90

    total = evaluate(CONTRACT, readings, TODAY, ForecastBasis.TOTAL)
    windowed = evaluate(CONTRACT, readings, TODAY, ForecastBasis.DAYS_30)

    assert total.daily_actual_30d == pytest.approx(1_000 / 30)
    assert total.forecast_rate == pytest.approx(5_000 / 90)
    assert total.forecast_contract_end == pytest.approx(5_000 + 5_000 / 90 * days_left)
    assert total.contract_forecast_exceeded is True

    assert windowed.forecast_rate == pytest.approx(1_000 / 30)
    assert windowed.forecast_contract_end == pytest.approx(
        5_000 + 1_000 / 30 * days_left
    )
    assert windowed.contract_forecast_exceeded is False


def test_forecast_falls_back_when_the_recorder_has_no_data():
    result = evaluate(CONTRACT, Readings(odometer=45_000), TODAY, ForecastBasis.DAYS_90)

    assert result.daily_actual_90d is None
    assert result.forecast_rate == pytest.approx(5_000 / 90)


def test_contract_starting_in_the_future_reports_zero_instead_of_failing():
    contract = Contract(start=date(2026, 1, 1), months=48, total_km=80_000)
    result = evaluate(contract, Readings(odometer=0), date(2025, 12, 1))

    assert result.elapsed_days == 0
    assert result.km_driven == 0
    assert result.daily_actual is None
    assert result.forecast_contract_end is None
    assert result.forecast_deviation_contract_end is None
    assert result.above_target is False
    assert result.annual_forecast_exceeded is False
    assert result.contract_forecast_exceeded is False


def test_overrun_is_reported_instead_of_being_clamped():
    result = evaluate(CONTRACT, Readings(odometer=125_000), TODAY)

    assert result.km_driven == 85_000
    assert result.mileage_used_pct == pytest.approx(106.25)
    assert result.remaining_total == -5_000


def test_after_contract_end_nothing_is_projected_any_further():
    result = evaluate(CONTRACT, Readings(odometer=120_000), date(2029, 6, 1))

    assert result.days_remaining == 0
    assert result.contract_elapsed_pct == 100.0
    assert result.remaining_contract_end == 0
    assert result.forecast_contract_end == pytest.approx(result.km_driven)


def test_odometer_below_start_km_never_goes_negative():
    result = evaluate(CONTRACT, Readings(odometer=39_000), TODAY)

    assert result.km_driven == 0


def test_annual_warning_uses_the_running_contract_year():
    today = date(2026, 6, 1)
    heavy = evaluate(
        CONTRACT,
        Readings(odometer=75_000, odometer_at_contract_year_start=50_000),
        today,
    )
    light = evaluate(
        CONTRACT,
        Readings(odometer=52_000, odometer_at_contract_year_start=50_000),
        today,
    )

    assert heavy.annual_forecast_exceeded is True
    assert light.annual_forecast_exceeded is False
