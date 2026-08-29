"""The Leasing KM integration."""

from __future__ import annotations

import logging

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import CONF_NAME
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_track_state_change_event
from homeassistant.util import slugify

from .calc import ForecastBasis
from .const import (
    CONF_FORECAST_BASIS,
    CONF_MONTHS,
    CONF_ODOMETER_ENTITY,
    CONF_START_DATE,
    CONF_START_KM,
    CONF_TOTAL_KM,
    DEFAULT_START_KM,
    LEGACY_CONF_MONTHS,
    LEGACY_CONF_ODOMETER_ENTITY,
    LEGACY_CONF_TOTAL_KM,
    PLATFORMS,
)
from .coordinator import LeasingKmCoordinator
from .migration import async_migrate_entities

_LOGGER = logging.getLogger(__name__)

type LeasingKmConfigEntry = ConfigEntry[LeasingKmCoordinator]


async def async_setup_entry(hass: HomeAssistant, entry: LeasingKmConfigEntry) -> bool:
    """Set up one leasing contract from a config entry."""
    coordinator = LeasingKmCoordinator(hass, entry)
    await coordinator.async_config_entry_first_refresh()
    entry.runtime_data = coordinator

    async def _odometer_changed(_event) -> None:
        """Recalculate as soon as the odometer reports a new value."""
        await coordinator.async_request_refresh()

    entry.async_on_unload(
        async_track_state_change_event(
            hass, [entry.data[CONF_ODOMETER_ENTITY]], _odometer_changed
        )
    )
    entry.async_on_unload(entry.add_update_listener(_async_reload_entry))

    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
    return True


async def _async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """Reload the entry so a changed odometer entity is tracked again."""
    await hass.config_entries.async_reload(entry.entry_id)


async def async_unload_entry(hass: HomeAssistant, entry: LeasingKmConfigEntry) -> bool:
    """Unload a config entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_migrate_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Migrate a version 1 entry to the version 2 layout.

    Version 1 derived everything from the raw odometer reading and used German
    configuration keys and entity ids. The values are carried over unchanged --
    `start_km` defaults to zero, so the numbers stay exactly as they were until
    the user fills in the real odometer reading at contract start.
    """
    if entry.version > 2:
        # Downgrading is not supported.
        return False
    if entry.version == 2:
        return True

    legacy = {**entry.data, **entry.options}
    data = {
        CONF_NAME: entry.title,
        CONF_START_DATE: legacy[CONF_START_DATE],
        CONF_MONTHS: int(legacy[LEGACY_CONF_MONTHS]),
        CONF_TOTAL_KM: float(legacy[LEGACY_CONF_TOTAL_KM]),
        CONF_START_KM: DEFAULT_START_KM,
        CONF_ODOMETER_ENTITY: legacy[LEGACY_CONF_ODOMETER_ENTITY],
        CONF_FORECAST_BASIS: ForecastBasis.TOTAL.value,
    }

    renames = async_migrate_entities(
        hass, er.async_get(hass), entry.entry_id, slugify(entry.title)
    )

    hass.config_entries.async_update_entry(
        entry,
        data=data,
        options={},
        version=2,
        unique_id=f"{data[CONF_ODOMETER_ENTITY]}_{data[CONF_START_DATE]}",
    )
    _LOGGER.info(
        "Migrated %s to version 2, renamed %s entities", entry.title, len(renames)
    )
    return True
