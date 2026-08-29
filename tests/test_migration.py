"""Tests for the version 1 to version 2 migration."""

from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er, issue_registry as ir
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.leasing_km.const import DOMAIN

LEGACY_DATA = {
    "start_date": "2024-01-15",
    "laufzeit_monate": 36,
    "km_gesamt": 60000,
    "km_entity": "sensor.odometer",
}


def _legacy_entry() -> MockConfigEntry:
    """Build a config entry the way version 1 stored it."""
    return MockConfigEntry(
        domain=DOMAIN,
        version=1,
        title="Altvertrag",
        data=LEGACY_DATA,
        # Version 1 wrote later edits into the options instead of the data.
        options={"km_gesamt": 65000},
    )


async def test_migration_moves_options_into_data(hass: HomeAssistant):
    hass.states.async_set("sensor.odometer", "12000", {"unit_of_measurement": "km"})
    entry = _legacy_entry()
    entry.add_to_hass(hass)

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert entry.version == 2
    assert entry.options == {}
    assert entry.data["months"] == 36
    # The options value wins, as it did in version 1.
    assert entry.data["total_km"] == 65000.0
    assert entry.data["odometer_entity"] == "sensor.odometer"
    assert entry.data["start_km"] == 0
    assert entry.data["forecast_basis"] == "total"


async def test_migration_renames_entities_and_reports_it(hass: HomeAssistant):
    hass.states.async_set("sensor.odometer", "12000", {"unit_of_measurement": "km"})
    entry = _legacy_entry()
    entry.add_to_hass(hass)

    registry = er.async_get(hass)
    old = registry.async_get_or_create(
        "sensor",
        DOMAIN,
        f"{entry.entry_id}_km_absolviert",
        config_entry=entry,
        suggested_object_id="altvertrag_km_absolviert",
    )
    renamed_by_user = registry.async_get_or_create(
        "sensor",
        DOMAIN,
        f"{entry.entry_id}_noch_erlaubt",
        config_entry=entry,
        suggested_object_id="my_own_name",
    )
    assert old.entity_id == "sensor.altvertrag_km_absolviert"

    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    # A default entity id is rewritten ...
    assert (
        registry.async_get_entity_id("sensor", DOMAIN, f"{entry.entry_id}_mileage_used")
        == "sensor.altvertrag_mileage_used"
    )
    # ... an entity id the user chose themselves is left alone, but its unique
    # id still moves to the new key so the entity keeps working.
    assert (
        registry.async_get_entity_id(
            "sensor", DOMAIN, f"{entry.entry_id}_remaining_total"
        )
        == renamed_by_user.entity_id
    )

    issue = ir.async_get(hass).async_get_issue(
        DOMAIN, f"entity_ids_renamed_{entry.entry_id}"
    )
    assert issue is not None
    assert "sensor.altvertrag_mileage_used" in issue.translation_placeholders["renames"]
    assert renamed_by_user.entity_id not in issue.translation_placeholders["renames"]
