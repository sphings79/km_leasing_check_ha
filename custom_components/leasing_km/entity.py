"""Shared entity plumbing for the Leasing KM platforms."""

from __future__ import annotations

from homeassistant.config_entries import ConfigEntry
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import EntityDescription, async_generate_entity_id
from homeassistant.helpers.update_coordinator import CoordinatorEntity
from homeassistant.util import slugify

from .const import DOMAIN
from .coordinator import LeasingKmCoordinator


class LeasingKmEntity(CoordinatorEntity[LeasingKmCoordinator]):
    """Base class binding an entity to one leasing contract."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: LeasingKmCoordinator,
        entry: ConfigEntry,
        description: EntityDescription,
        entity_id_format: str,
    ) -> None:
        """Pin the entity id to the English key, independent of the UI language."""
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        self.entity_id = async_generate_entity_id(
            entity_id_format,
            f"{slugify(entry.title)}_{description.key}",
            hass=coordinator.hass,
        )
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Leasing KM",
            model="Leasing contract",
            configuration_url="https://github.com/sphings79/leasing-km-home-assistant",
        )
