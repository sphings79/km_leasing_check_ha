"""Binary sensor platform for the Leasing KM integration."""

from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.binary_sensor import (
    ENTITY_ID_FORMAT,
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddConfigEntryEntitiesCallback

from .calc import Result
from .coordinator import LeasingKmCoordinator
from .entity import LeasingKmEntity


@dataclass(frozen=True, kw_only=True)
class LeasingKmBinarySensorDescription(BinarySensorEntityDescription):
    """Description of a single status flag."""

    value_fn: Callable[[Result], bool]


BINARY_SENSORS: tuple[LeasingKmBinarySensorDescription, ...] = (
    LeasingKmBinarySensorDescription(
        key="above_target",
        translation_key="above_target",
        value_fn=lambda d: d.above_target,
    ),
    LeasingKmBinarySensorDescription(
        key="annual_forecast_exceeded",
        translation_key="annual_forecast_exceeded",
        value_fn=lambda d: d.annual_forecast_exceeded,
    ),
    LeasingKmBinarySensorDescription(
        key="contract_forecast_exceeded",
        translation_key="contract_forecast_exceeded",
        value_fn=lambda d: d.contract_forecast_exceeded,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddConfigEntryEntitiesCallback,
) -> None:
    """Set up the status flags for one contract."""
    coordinator: LeasingKmCoordinator = entry.runtime_data
    async_add_entities(
        LeasingKmBinarySensor(coordinator, entry, description)
        for description in BINARY_SENSORS
    )


class LeasingKmBinarySensor(LeasingKmEntity, BinarySensorEntity):
    """One status flag of a leasing contract."""

    entity_description: LeasingKmBinarySensorDescription

    def __init__(
        self,
        coordinator: LeasingKmCoordinator,
        entry: ConfigEntry,
        description: LeasingKmBinarySensorDescription,
    ) -> None:
        """Register the flag with the shared entity id scheme."""
        super().__init__(coordinator, entry, description, ENTITY_ID_FORMAT)

    @property
    def is_on(self) -> bool | None:
        """Return whether the flag is raised."""
        if self.coordinator.data is None:
            return None
        return self.entity_description.value_fn(self.coordinator.data)
