"""Odometer lookups in the past, backed by the recorder.

The windowed averages and the mileage driven in the running contract year need
to know what the odometer read at some point in the past. Long term statistics
are the primary source because they survive the recorder purge; plain state
history is used as a fallback for entities that have no statistics.

Every lookup may legitimately come back empty -- the odometer entity can be
excluded from recording, or the contract can predate the Home Assistant
installation. Callers must handle None.
"""

from __future__ import annotations

from datetime import datetime, timedelta
from functools import partial
import logging

from homeassistant.components.recorder import get_instance, history, statistics
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

# How far back a lookup may reach when nothing was recorded at the exact time.
# A parked car can easily go a few weeks without a state change.
LOOKBACK = timedelta(days=45)

# Statistic columns in the order they are preferred. Odometers are usually
# `total_increasing`, which yields `state`; `max` covers `measurement`.
_STAT_TYPES = ("state", "max", "mean")


async def async_odometer_at(
    hass: HomeAssistant, entity_id: str, when: datetime
) -> float | None:
    """Return the odometer reading at `when`, or None if it cannot be found."""
    if "recorder" not in hass.config.components:
        return None

    value = await _async_from_statistics(hass, entity_id, when)
    if value is None:
        value = await _async_from_history(hass, entity_id, when)
    if value is None:
        _LOGGER.debug("No recorded odometer value for %s at %s", entity_id, when)
    return value


async def _async_from_statistics(
    hass: HomeAssistant, entity_id: str, when: datetime
) -> float | None:
    """Read the last statistics row at or before `when`."""
    rows = await get_instance(hass).async_add_executor_job(
        statistics.statistics_during_period,
        hass,
        when - LOOKBACK,
        when,
        {entity_id},
        "hour",
        None,
        set(_STAT_TYPES),
    )
    for row in reversed(rows.get(entity_id, [])):
        for key in _STAT_TYPES:
            value = row.get(key)
            if value is not None:
                return float(value)
    return None


async def _async_from_history(
    hass: HomeAssistant, entity_id: str, when: datetime
) -> float | None:
    """Read the last recorded state at or before `when`."""
    states = await get_instance(hass).async_add_executor_job(
        partial(
            history.state_changes_during_period,
            hass,
            when - LOOKBACK,
            when,
            entity_id,
            no_attributes=True,
            include_start_time_state=True,
        )
    )
    for state in reversed(states.get(entity_id, [])):
        try:
            return float(state.state)
        except (TypeError, ValueError):
            continue
    return None
