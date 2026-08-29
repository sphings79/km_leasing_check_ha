"""DataUpdateCoordinator for the Leasing KM integration."""

from __future__ import annotations

from datetime import date, datetime, timedelta
import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_UNIT_OF_MEASUREMENT, UnitOfLength
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed
from homeassistant.util import dt as dt_util

from .calc import (
    Contract,
    ForecastBasis,
    Readings,
    Result,
    contract_year_bounds,
    evaluate,
)
from .const import (
    CONF_FORECAST_BASIS,
    CONF_MONTHS,
    CONF_ODOMETER_ENTITY,
    CONF_START_DATE,
    CONF_START_KM,
    CONF_TOTAL_KM,
    DOMAIN,
    HISTORY_INTERVAL,
    ODOMETER_ROLLBACK_TOLERANCE,
    UPDATE_INTERVAL,
)
from .history import async_odometer_at

_LOGGER = logging.getLogger(__name__)

UNUSABLE_STATES = ("unknown", "unavailable", "")


class LeasingKmCoordinator(DataUpdateCoordinator[Result]):
    """Read the odometer entity and derive every leasing figure from it."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        """Set up the coordinator for one leasing contract."""
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            config_entry=entry,
            update_interval=UPDATE_INTERVAL,
        )
        self._unit: str | None = None
        self._last_odometer: float | None = None
        self._rollback_logged = False
        self._history: dict[str, float | None] = {}
        self._history_fetched: datetime | None = None
        self._history_year_start: date | None = None

    @property
    def native_unit(self) -> str:
        """Return the unit the odometer entity reports, defaulting to kilometres."""
        return self._unit or UnitOfLength.KILOMETERS

    @property
    def is_distance_unit(self) -> bool:
        """Return whether the unit is one Home Assistant can convert."""
        return self.native_unit in set(UnitOfLength)

    @property
    def contract(self) -> Contract:
        """Return the contract as currently configured."""
        cfg = self.config_entry.data
        return Contract(
            start=date.fromisoformat(cfg[CONF_START_DATE]),
            months=int(cfg[CONF_MONTHS]),
            total_km=float(cfg[CONF_TOTAL_KM]),
            start_km=float(cfg[CONF_START_KM]),
        )

    @property
    def odometer_entity(self) -> str:
        """Return the entity id the odometer is read from."""
        return self.config_entry.data[CONF_ODOMETER_ENTITY]

    async def _async_update_data(self) -> Result:
        """Read the odometer and recalculate every value."""
        contract = self.contract
        today = dt_util.now().date()
        odometer = self._read_odometer()

        readings = Readings(
            odometer=odometer,
            **await self._async_history(contract, today),
        )
        basis = ForecastBasis(
            self.config_entry.data.get(CONF_FORECAST_BASIS, ForecastBasis.TOTAL)
        )
        return evaluate(contract, readings, today, basis)

    def _read_odometer(self) -> float:
        """Return the current odometer reading, ignoring implausible values.

        A car is offline for most of the day, so an odometer that turns
        unavailable is normal operation, not a failure: the last known reading
        is kept and the targets keep moving on. Only a contract that has never
        seen a reading fails, which is what makes the setup retry.
        """
        entity_id = self.odometer_entity
        state = self.hass.states.get(entity_id)
        if state is None or state.state in UNUSABLE_STATES:
            return self._fallback(f"Odometer entity {entity_id} is not available")
        try:
            value = float(state.state)
        except ValueError:
            return self._fallback(
                f"Odometer entity {entity_id} reports a non-numeric value: "
                f"{state.state}"
            )

        self._unit = state.attributes.get(ATTR_UNIT_OF_MEASUREMENT)

        last = self._last_odometer
        if last is not None and value < last - ODOMETER_ROLLBACK_TOLERANCE:
            if not self._rollback_logged:
                _LOGGER.warning(
                    "Odometer %s dropped from %s to %s and is being ignored. "
                    "Reconfigure the contract if the vehicle or the odometer "
                    "source really changed",
                    entity_id,
                    last,
                    value,
                )
                self._rollback_logged = True
            return last

        self._rollback_logged = False
        self._last_odometer = value
        return value

    def _fallback(self, reason: str) -> float:
        """Fall back to the last known reading, or fail if there is none."""
        if self._last_odometer is None:
            raise UpdateFailed(reason)
        _LOGGER.debug("%s, keeping the last known reading", reason)
        return self._last_odometer

    async def _async_history(
        self, contract: Contract, today: date
    ) -> dict[str, float | None]:
        """Return the past odometer readings, refreshed at most every few hours.

        A missing value is not an error: the odometer entity may be excluded
        from recording, or the contract may be older than this installation.
        """
        _, year_start, _ = contract_year_bounds(contract, today)
        now = dt_util.utcnow()
        is_stale = (
            self._history_fetched is None
            or now - self._history_fetched > HISTORY_INTERVAL
            or self._history_year_start != year_start
        )
        if not is_stale:
            return dict(self._history)

        entity_id = self.odometer_entity
        history = {
            "odometer_30d_ago": await async_odometer_at(
                self.hass, entity_id, now - timedelta(days=30)
            ),
            "odometer_90d_ago": await async_odometer_at(
                self.hass, entity_id, now - timedelta(days=90)
            ),
            "odometer_at_contract_year_start": None,
        }
        if year_start > contract.start:
            history["odometer_at_contract_year_start"] = await async_odometer_at(
                self.hass,
                entity_id,
                dt_util.start_of_local_day(year_start),
            )

        self._history = history
        self._history_fetched = now
        self._history_year_start = year_start
        return dict(history)
