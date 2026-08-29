"""Entity migration from the German version 1 ids to the English ones.

Version 1 named its entities in German, which meant the entity ids of a German
and an English installation differed and none of them said what they meant to a
non-German speaker. Version 2 uses English ids for everyone.

The unique ids are rewritten unconditionally -- they are internal. An entity id
is only rewritten while it still matches what version 1 generated; anything the
user renamed themselves is left alone.
"""

from __future__ import annotations

import logging

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er, issue_registry as ir

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# old unique id suffix -> (old entity id slug, new unique id suffix and slug)
SENSOR_MIGRATION: dict[str, tuple[str, str]] = {
    "tagesleistung_ist": ("tagesleistung_ist", "daily_actual"),
    "tagesleistung_soll": ("tagesleistung_soll", "daily_target"),
    "soll_km_heute": ("soll_km_heute", "target_today"),
    "differenz_heute": ("differenz_heute", "deviation_today"),
    "soll_km_monatsende": ("soll_km_monatsende", "target_month_end"),
    "differenz_monatsende": ("differenz_monatsende", "deviation_month_end"),
    "verbleibend_jahresende": (
        "verbleibend_bis_jahresende",
        "remaining_calendar_year",
    ),
    "verbleibend_laufzeitende": (
        "verbleibend_bis_laufzeitende",
        "remaining_contract_end",
    ),
    "noch_erlaubt": ("noch_erlaubt_gesamt", "remaining_total"),
    "jahres_soll": ("km_limit_pro_jahr", "annual_allowance"),
    "prognose_jahresende": ("prognose_jahresende", "forecast_calendar_year_end"),
    "prognose_laufzeitende": ("prognose_laufzeitende", "forecast_contract_end"),
    "km_absolviert": ("km_absolviert", "mileage_used"),
    "laufzeit_absolviert": ("laufzeit_absolviert", "contract_elapsed"),
}

BINARY_SENSOR_MIGRATION: dict[str, tuple[str, str]] = {
    "ueber_soll": ("ueber_soll", "above_target"),
    "jahres_km_ueberschritten": (
        "jahres_km_prognose_ueberschritten",
        "annual_forecast_exceeded",
    ),
    "laufzeit_km_ueberschritten": (
        "laufzeit_km_prognose_ueberschritten",
        "contract_forecast_exceeded",
    ),
}

MIGRATION: dict[str, dict[str, tuple[str, str]]] = {
    "sensor": SENSOR_MIGRATION,
    "binary_sensor": BINARY_SENSOR_MIGRATION,
}


def async_migrate_entities(
    hass: HomeAssistant,
    registry: er.EntityRegistry,
    entry_id: str,
    title_slug: str,
) -> list[tuple[str, str]]:
    """Rewrite the version 1 entities and report every entity id that moved."""
    renames: list[tuple[str, str]] = []

    for platform, table in MIGRATION.items():
        for old_key, (old_slug, new_key) in table.items():
            entity_id = registry.async_get_entity_id(
                platform, DOMAIN, f"{entry_id}_{old_key}"
            )
            if entity_id is None:
                continue

            new_entity_id = None
            if entity_id == f"{platform}.{title_slug}_{old_slug}":
                new_entity_id = registry.async_get_available_entity_id(
                    platform,
                    f"{title_slug}_{new_key}",
                    current_entity_id=entity_id,
                )

            registry.async_update_entity(
                entity_id,
                new_unique_id=f"{entry_id}_{new_key}",
                **({"new_entity_id": new_entity_id} if new_entity_id else {}),
            )
            if new_entity_id:
                renames.append((entity_id, new_entity_id))

    if renames:
        _async_report(hass, entry_id, renames)
    return renames


def _async_report(
    hass: HomeAssistant, entry_id: str, renames: list[tuple[str, str]]
) -> None:
    """Tell the user which entity ids changed, so they can fix references."""
    ir.async_create_issue(
        hass,
        DOMAIN,
        f"entity_ids_renamed_{entry_id}",
        is_fixable=False,
        is_persistent=True,
        severity=ir.IssueSeverity.WARNING,
        translation_key="entity_ids_renamed",
        translation_placeholders={
            "renames": "\n".join(f"- `{old}` → `{new}`" for old, new in renames)
        },
    )
    _LOGGER.info("Renamed %s entity ids to their English equivalents", len(renames))
