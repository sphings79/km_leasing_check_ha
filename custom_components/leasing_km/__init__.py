"""Leasing KM-Rechner – Home Assistant Integration."""
from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers.event import async_track_state_change_event

from .const import CONF_KM_ENTITY, DOMAIN
from .coordinator import LeasingKmCoordinator

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]

# Type alias for a typed config entry (HA 2024.6+)
type LeasingKmConfigEntry = ConfigEntry[LeasingKmCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: LeasingKmConfigEntry) -> bool:
    """Set up Leasing KM-Rechner from a config entry."""
    coordinator = LeasingKmCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    # Immediately refresh whenever the odometer entity changes state
    km_entity = (entry.options or entry.data).get(CONF_KM_ENTITY, entry.data[CONF_KM_ENTITY])

    async def _on_km_state_change(_event) -> None:
        await coordinator.async_request_refresh()

    entry.async_on_unload(
        async_track_state_change_event(hass, [km_entity], _on_km_state_change)
    )

    # Reload integration when options are changed so the new entity listener
    # is re-registered with the correct entity id.
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry when options change."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: LeasingKmConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
