"""Tests for the config and reconfigure flows."""

from homeassistant import config_entries
from homeassistant.config_entries import ConfigEntryState
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResultType
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.leasing_km.const import DOMAIN

USER_INPUT = {
    "name": "Testwagen",
    "start_date": "2025-03-01",
    "months": 48,
    "total_km": 80000,
    "start_km": 40000,
    "odometer_entity": "sensor.odometer",
    "forecast_basis": "total",
    "costs_enabled": False,
    "reminder_days": "off",
}

COST_INPUT = {
    "excess_rate": 9.0,
    "excess_tolerance_km": 2500,
    "excess_mode": "from_first",
    "refund_rate": 5.0,
    "refund_tolerance_km": 2500,
    "refund_mode": "above_tolerance",
    "refund_limit_km": 10000,
}


async def test_user_flow_creates_entry(hass: HomeAssistant):
    hass.states.async_set("sensor.odometer", "45000", {"unit_of_measurement": "km"})

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    assert result["type"] is FlowResultType.FORM

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], USER_INPUT
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["title"] == "Testwagen"
    assert result["data"]["months"] == 48
    assert result["data"]["total_km"] == 80000.0
    assert result["data"]["start_km"] == 40000.0


async def test_second_contract_on_the_same_car_is_rejected(hass: HomeAssistant):
    hass.states.async_set("sensor.odometer", "45000", {"unit_of_measurement": "km"})
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        data=USER_INPUT,
        unique_id="sensor.odometer_2025-03-01",
    )
    entry.add_to_hass(hass)

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], USER_INPUT
    )

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "already_configured"


async def test_reconfigure_updates_the_contract(hass: HomeAssistant):
    hass.states.async_set("sensor.odometer", "45000", {"unit_of_measurement": "km"})
    entry = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        title="Testwagen",
        data=USER_INPUT,
        unique_id="sensor.odometer_2025-03-01",
    )
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    result = await entry.start_reconfigure_flow(hass)
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {**USER_INPUT, "name": "Neuer Name", "total_km": 100000}
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.ABORT
    assert result["reason"] == "reconfigure_successful"
    assert entry.title == "Neuer Name"
    assert entry.data["total_km"] == 100000.0


async def test_the_cost_step_only_appears_when_it_is_switched_on(hass: HomeAssistant):
    hass.states.async_set("sensor.odometer", "45000", {"unit_of_measurement": "km"})

    result = await hass.config_entries.flow.async_init(
        DOMAIN, context={"source": config_entries.SOURCE_USER}
    )
    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], {**USER_INPUT, "costs_enabled": True}
    )
    assert result["type"] is FlowResultType.FORM
    assert result["step_id"] == "costs"

    result = await hass.config_entries.flow.async_configure(
        result["flow_id"], COST_INPUT
    )
    await hass.async_block_till_done()

    assert result["type"] is FlowResultType.CREATE_ENTRY
    assert result["data"]["excess_rate"] == 9.0
    assert result["data"]["excess_mode"] == "from_first"
    assert result["data"]["refund_limit_km"] == 10000.0
    # The contract details from the first step survive the second one.
    assert result["data"]["total_km"] == 80000.0


async def test_settlement_entities_exist_only_with_terms(hass: HomeAssistant):
    hass.states.async_set("sensor.odometer", "45000", {"unit_of_measurement": "km"})
    plain = MockConfigEntry(
        domain=DOMAIN, version=2, title="Ohne", data=USER_INPUT, unique_id="a"
    )
    plain.add_to_hass(hass)
    settling = MockConfigEntry(
        domain=DOMAIN,
        version=2,
        title="Mit",
        data={**USER_INPUT, "costs_enabled": True, **COST_INPUT},
        unique_id="b",
    )
    settling.add_to_hass(hass)
    for entry in (plain, settling):
        if entry.state is not ConfigEntryState.LOADED:
            assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()

    assert hass.states.get("sensor.ohne_cost_forecast_contract_end") is None
    assert hass.states.get("binary_sensor.ohne_excess_tolerance_exceeded") is None

    forecast = hass.states.get("sensor.mit_cost_forecast_contract_end")
    assert forecast is not None
    assert forecast.attributes["device_class"] == "monetary"
    assert forecast.attributes["unit_of_measurement"] == hass.config.currency
    assert hass.states.get("binary_sensor.mit_excess_tolerance_exceeded") is not None
