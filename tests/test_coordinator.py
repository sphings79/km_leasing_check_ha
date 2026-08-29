"""Tests for the coordinator's reading of the odometer entity."""

from datetime import timedelta

from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from homeassistant.helpers import issue_registry as ir
from homeassistant.setup import async_setup_component
import pytest
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.leasing_km.const import DOMAIN
from custom_components.leasing_km.repairs import async_create_fix_flow

DATA = {
    "name": "Testwagen",
    "start_date": "2025-03-01",
    "months": 48,
    "total_km": 80000.0,
    "start_km": 40000.0,
    "odometer_entity": "sensor.odometer",
    "forecast_basis": "total",
}


async def _setup(hass: HomeAssistant, odometer: str, unit: str = "km"):
    """Set up one contract against an odometer entity in the given state."""
    hass.states.async_set("sensor.odometer", odometer, {"unit_of_measurement": unit})
    entry = MockConfigEntry(domain=DOMAIN, version=2, title="Testwagen", data=DATA)
    entry.add_to_hass(hass)
    await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    return entry


async def test_mileage_uses_the_unit_of_the_odometer(hass: HomeAssistant):
    await _setup(hass, "45000")

    driven = hass.states.get("sensor.testwagen_km_driven")
    assert driven.state == "5000.0"
    assert driven.attributes["unit_of_measurement"] == "km"
    assert driven.attributes["device_class"] == "distance"
    assert (
        hass.states.get("sensor.testwagen_daily_target").attributes[
            "unit_of_measurement"
        ]
        == "km/d"
    )


async def test_a_miles_odometer_is_converted_to_the_user_unit_system(
    hass: HomeAssistant,
):
    """A contract stated in miles is readable on a metric installation."""
    await _setup(hass, "45000", unit="mi")

    driven = hass.states.get("sensor.testwagen_km_driven")
    assert driven.attributes["unit_of_measurement"] == "km"
    assert float(driven.state) == pytest.approx(5000 * 1.609344, abs=0.01)


async def test_new_odometer_value_updates_immediately(hass: HomeAssistant):
    await _setup(hass, "45000")

    hass.states.async_set("sensor.odometer", "46000", {"unit_of_measurement": "km"})
    await hass.async_block_till_done()

    assert hass.states.get("sensor.testwagen_km_driven").state == "6000.0"


async def test_odometer_rollback_is_ignored(hass: HomeAssistant):
    await _setup(hass, "45000")

    # A vehicle integration briefly reporting zero must not wipe the averages.
    hass.states.async_set("sensor.odometer", "0", {"unit_of_measurement": "km"})
    await hass.async_block_till_done()

    assert hass.states.get("sensor.testwagen_km_driven").state == "5000.0"


async def test_unavailable_odometer_keeps_the_last_values(hass: HomeAssistant):
    """An offline car must not take every calculated value down with it."""
    await _setup(hass, "45000")

    hass.states.async_set("sensor.odometer", "unavailable")
    await hass.async_block_till_done()

    driven = hass.states.get("sensor.testwagen_km_driven")
    assert driven.state == "5000.0"


async def test_a_contract_without_any_reading_fails_to_set_up(hass: HomeAssistant):
    entry = await _setup(hass, "unavailable")

    assert entry.state is ConfigEntryState.SETUP_RETRY


async def test_contract_starting_in_the_future_still_creates_entities(
    hass: HomeAssistant,
):
    hass.states.async_set("sensor.odometer", "0", {"unit_of_measurement": "km"})
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        title="Neuwagen",
        data={**DATA, "start_date": "2099-01-01", "start_km": 0.0},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert hass.states.get("sensor.neuwagen_km_driven").state == "0.0"
    assert hass.states.get("sensor.neuwagen_daily_actual").state == "unknown"
    assert (
        hass.states.get("binary_sensor.neuwagen_contract_forecast_exceeded").state
        == "off"
    )


async def test_reminder_is_off_for_a_vehicle_sensor(hass: HomeAssistant):
    """A parked car reports nothing for days, which is not a problem."""
    entry = await _setup(hass, "45000")
    hass.config_entries.async_update_entry(entry, data={**DATA, "reminder_days": "7"})
    await hass.async_block_till_done()

    assert entry.runtime_data.reminder_days is None


async def test_reminder_raises_and_clears_a_repair_issue(hass: HomeAssistant, freezer):
    hass.states.async_set("input_number.odo", "45000", {"unit_of_measurement": "km"})
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        title="Testwagen",
        data={**DATA, "odometer_entity": "input_number.odo", "reminder_days": "7"},
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    issue_id = f"odometer_stale_{entry.entry_id}"
    registry = ir.async_get(hass)
    assert registry.async_get_issue(DOMAIN, issue_id) is None

    # Eight days later the value is still the same one.
    freezer.tick(timedelta(days=8))
    await entry.runtime_data.async_refresh()
    await hass.async_block_till_done()

    issue = registry.async_get_issue(DOMAIN, issue_id)
    assert issue is not None
    assert issue.is_fixable is True
    assert issue.translation_placeholders["days"] == "8"

    # Entering a new reading clears it again.
    hass.states.async_set("input_number.odo", "46000", {"unit_of_measurement": "km"})
    await hass.async_block_till_done()
    assert registry.async_get_issue(DOMAIN, issue_id) is None


async def test_the_repair_flow_writes_the_new_reading(hass: HomeAssistant):
    assert await async_setup_component(
        hass,
        "input_number",
        {"input_number": {"odo": {"min": 0, "max": 500000, "initial": 45000}}},
    )
    await hass.async_block_till_done()

    flow = await async_create_fix_flow(
        hass, "odometer_stale_abc", {"entity_id": "input_number.odo"}
    )
    flow.hass = hass
    form = await flow.async_step_init()
    assert form["step_id"] == "confirm"

    result = await flow.async_step_confirm({"odometer": 46500})
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert hass.states.get("input_number.odo").state == "46500.0"
