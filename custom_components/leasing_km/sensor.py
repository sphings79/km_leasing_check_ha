"""Sensor platform for the Leasing KM integration."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from datetime import date
from enum import Enum
from typing import Any

from homeassistant.components.sensor import (
    ENTITY_ID_FORMAT,
    SensorDeviceClass,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import PERCENTAGE, UnitOfTime
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .calc import Result
from .coordinator import LeasingKmCoordinator
from .entity import LeasingKmEntity


class Unit(Enum):
    """How a sensor derives its unit from the odometer entity."""

    DISTANCE = "distance"
    RATE = "rate"
    PERCENT = "percent"
    DURATION = "duration"
    DATE = "date"


@dataclass(frozen=True, kw_only=True)
class LeasingKmSensorDescription(SensorEntityDescription):
    """Description of a single calculated sensor."""

    value_fn: Callable[[Result], float | date | None]
    unit: Unit = Unit.DISTANCE
    attributes_fn: Callable[[Result], dict[str, Any]] | None = None


def _contract_attributes(data: Result) -> dict[str, Any]:
    """Contract metadata the card needs without enabling extra entities."""
    return {
        "contract_end": data.contract_end_date.isoformat(),
        "elapsed_days": data.elapsed_days,
        "total_days": data.total_days,
        "days_remaining": data.days_remaining,
        "contract_year": data.contract_year,
        "contract_year_start": data.contract_year_start.isoformat(),
        "contract_year_end": data.contract_year_end.isoformat(),
    }


SENSORS: tuple[LeasingKmSensorDescription, ...] = (
    # --- What has been driven -------------------------------------------
    LeasingKmSensorDescription(
        key="km_driven",
        translation_key="km_driven",
        state_class=SensorStateClass.TOTAL_INCREASING,
        suggested_display_precision=0,
        value_fn=lambda d: d.km_driven,
    ),
    # --- Daily rates ------------------------------------------------------
    LeasingKmSensorDescription(
        key="daily_actual",
        translation_key="daily_actual",
        unit=Unit.RATE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.daily_actual,
    ),
    LeasingKmSensorDescription(
        key="daily_target",
        translation_key="daily_target",
        unit=Unit.RATE,
        suggested_display_precision=1,
        value_fn=lambda d: d.daily_target,
    ),
    LeasingKmSensorDescription(
        key="daily_actual_30d",
        translation_key="daily_actual_30d",
        unit=Unit.RATE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        entity_registry_enabled_default=False,
        value_fn=lambda d: d.daily_actual_30d,
    ),
    LeasingKmSensorDescription(
        key="daily_actual_90d",
        translation_key="daily_actual_90d",
        unit=Unit.RATE,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        entity_registry_enabled_default=False,
        value_fn=lambda d: d.daily_actual_90d,
    ),
    # --- Target vs. actual ------------------------------------------------
    LeasingKmSensorDescription(
        key="target_today",
        translation_key="target_today",
        suggested_display_precision=0,
        value_fn=lambda d: d.target_today,
    ),
    LeasingKmSensorDescription(
        key="deviation_today",
        translation_key="deviation_today",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=0,
        value_fn=lambda d: d.deviation_today,
    ),
    LeasingKmSensorDescription(
        key="target_month_end",
        translation_key="target_month_end",
        suggested_display_precision=0,
        value_fn=lambda d: d.target_month_end,
    ),
    LeasingKmSensorDescription(
        key="deviation_month_end",
        translation_key="deviation_month_end",
        suggested_display_precision=0,
        value_fn=lambda d: d.deviation_month_end,
    ),
    # --- Running contract year -------------------------------------------
    LeasingKmSensorDescription(
        key="contract_year_driven",
        translation_key="contract_year_driven",
        suggested_display_precision=0,
        value_fn=lambda d: d.contract_year_driven,
    ),
    LeasingKmSensorDescription(
        key="contract_year_deviation",
        translation_key="contract_year_deviation",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=0,
        value_fn=lambda d: d.contract_year_deviation,
    ),
    LeasingKmSensorDescription(
        key="contract_year_allowance",
        translation_key="contract_year_allowance",
        suggested_display_precision=0,
        entity_registry_enabled_default=False,
        value_fn=lambda d: d.contract_year_allowance,
    ),
    LeasingKmSensorDescription(
        key="annual_allowance",
        translation_key="annual_allowance",
        suggested_display_precision=0,
        value_fn=lambda d: d.annual_allowance,
    ),
    # --- Remaining mileage on target basis --------------------------------
    LeasingKmSensorDescription(
        key="remaining_contract_year",
        translation_key="remaining_contract_year",
        suggested_display_precision=0,
        value_fn=lambda d: d.remaining_contract_year,
    ),
    LeasingKmSensorDescription(
        key="remaining_calendar_year",
        translation_key="remaining_calendar_year",
        suggested_display_precision=0,
        entity_registry_enabled_default=False,
        value_fn=lambda d: d.remaining_calendar_year,
    ),
    LeasingKmSensorDescription(
        key="remaining_contract_end",
        translation_key="remaining_contract_end",
        suggested_display_precision=0,
        value_fn=lambda d: d.remaining_contract_end,
    ),
    LeasingKmSensorDescription(
        key="remaining_total",
        translation_key="remaining_total",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=0,
        value_fn=lambda d: d.remaining_total,
    ),
    # --- Forecasts --------------------------------------------------------
    LeasingKmSensorDescription(
        key="forecast_contract_year_end",
        translation_key="forecast_contract_year_end",
        suggested_display_precision=0,
        value_fn=lambda d: d.forecast_contract_year_end,
    ),
    LeasingKmSensorDescription(
        key="forecast_calendar_year_end",
        translation_key="forecast_calendar_year_end",
        suggested_display_precision=0,
        entity_registry_enabled_default=False,
        value_fn=lambda d: d.forecast_calendar_year_end,
    ),
    LeasingKmSensorDescription(
        key="forecast_contract_end",
        translation_key="forecast_contract_end",
        suggested_display_precision=0,
        value_fn=lambda d: d.forecast_contract_end,
    ),
    LeasingKmSensorDescription(
        key="forecast_deviation_contract_end",
        translation_key="forecast_deviation_contract_end",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=0,
        value_fn=lambda d: d.forecast_deviation_contract_end,
    ),
    # --- Percentages ------------------------------------------------------
    LeasingKmSensorDescription(
        key="mileage_used",
        translation_key="mileage_used",
        unit=Unit.PERCENT,
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.mileage_used_pct,
    ),
    LeasingKmSensorDescription(
        key="contract_elapsed",
        translation_key="contract_elapsed",
        unit=Unit.PERCENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.contract_elapsed_pct,
        attributes_fn=_contract_attributes,
    ),
    # --- Contract timeline ------------------------------------------------
    LeasingKmSensorDescription(
        key="contract_end_date",
        translation_key="contract_end_date",
        unit=Unit.DATE,
        device_class=SensorDeviceClass.DATE,
        entity_registry_enabled_default=False,
        value_fn=lambda d: d.contract_end_date,
    ),
    LeasingKmSensorDescription(
        key="days_remaining",
        translation_key="days_remaining",
        unit=Unit.DURATION,
        device_class=SensorDeviceClass.DURATION,
        entity_registry_enabled_default=False,
        value_fn=lambda d: d.days_remaining,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the calculated sensors for one contract."""
    coordinator: LeasingKmCoordinator = entry.runtime_data
    async_add_entities(
        LeasingKmSensor(coordinator, entry, description) for description in SENSORS
    )


class LeasingKmSensor(LeasingKmEntity, SensorEntity):
    """One calculated value of a leasing contract."""

    entity_description: LeasingKmSensorDescription

    def __init__(
        self,
        coordinator: LeasingKmCoordinator,
        entry: ConfigEntry,
        description: LeasingKmSensorDescription,
    ) -> None:
        """Derive unit and device class from the odometer entity."""
        super().__init__(coordinator, entry, description, ENTITY_ID_FORMAT)

        match description.unit:
            case Unit.DISTANCE:
                self._attr_native_unit_of_measurement = coordinator.native_unit
                if coordinator.is_distance_unit:
                    self._attr_device_class = SensorDeviceClass.DISTANCE
            case Unit.RATE:
                self._attr_native_unit_of_measurement = f"{coordinator.native_unit}/d"
            case Unit.PERCENT:
                self._attr_native_unit_of_measurement = PERCENTAGE
            case Unit.DURATION:
                self._attr_native_unit_of_measurement = UnitOfTime.DAYS
            case Unit.DATE:
                pass

    @property
    def native_value(self) -> float | date | None:
        """Return the calculated value."""
        if self.coordinator.data is None:
            return None
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any] | None:
        """Return contract metadata for the sensors that carry it."""
        if (
            self.coordinator.data is None
            or self.entity_description.attributes_fn is None
        ):
            return None
        return self.entity_description.attributes_fn(self.coordinator.data)
