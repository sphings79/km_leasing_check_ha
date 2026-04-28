"""Binary sensor platform for Leasing KM-Rechner."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass

from homeassistant.components.binary_sensor import (
    BinarySensorEntity,
    BinarySensorEntityDescription,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import LeasingKmCoordinator, LeasingKmData


# ---------------------------------------------------------------------------
# Entity description
# ---------------------------------------------------------------------------

@dataclass(frozen=True, kw_only=True)
class LeasingKmBinaryDescription(BinarySensorEntityDescription):
    value_fn: Callable[[LeasingKmData], bool] = lambda _: False


# ---------------------------------------------------------------------------
# Binary sensor definitions
# ---------------------------------------------------------------------------

BINARY_SENSORS: tuple[LeasingKmBinaryDescription, ...] = (
    LeasingKmBinaryDescription(
        key="ueber_soll",
        name="Über Soll",
        icon="mdi:car-arrow-right",
        value_fn=lambda d: d.is_over_soll,
    ),
    LeasingKmBinaryDescription(
        key="jahres_km_ueberschritten",
        name="Jahres-KM Prognose überschritten",
        icon="mdi:car-speed-limiter",
        value_fn=lambda d: d.jahres_over,
    ),
    LeasingKmBinaryDescription(
        key="laufzeit_km_ueberschritten",
        name="Laufzeit-KM Prognose überschritten",
        icon="mdi:shield-car",
        value_fn=lambda d: d.ende_over,
    ),
    LeasingKmBinaryDescription(
        key="toleranz_ueberschritten",
        name="Toleranzgrenze überschritten",
        icon="mdi:alert-circle-outline",
        # Nur True wenn Kostenberechnung aktiv UND außerhalb Toleranz.
        # Wenn Kostenberechnung deaktiviert, bleibt der Sensor immer False.
        value_fn=lambda d: d.kosten_aktiv and d.toleranz_ueberschritten,
    ),
)


# ---------------------------------------------------------------------------
# Platform setup
# ---------------------------------------------------------------------------

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up binary sensor entities from a config entry."""
    coordinator: LeasingKmCoordinator = entry.runtime_data
    async_add_entities(
        LeasingKmBinarySensor(coordinator, entry, desc) for desc in BINARY_SENSORS
    )


# ---------------------------------------------------------------------------
# Entity class
# ---------------------------------------------------------------------------

class LeasingKmBinarySensor(CoordinatorEntity[LeasingKmCoordinator], BinarySensorEntity):
    """A boolean status sensor derived from the leasing KM coordinator."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: LeasingKmCoordinator,
        entry: ConfigEntry,
        description: LeasingKmBinaryDescription,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Leasing KM-Rechner",
            model="Custom Integration",
        )

    @property
    def is_on(self) -> bool | None:
        if self.coordinator.data is None:
            return None
        return self.entity_description.value_fn(self.coordinator.data)
