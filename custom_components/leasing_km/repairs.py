"""Repair flows for the Leasing KM integration.

The odometer reminder is fixable: because it only applies to a manually
maintained input_number, the repair can ask for the current reading and write
it straight into that entity, which resolves the issue in one step.
"""

from __future__ import annotations

from typing import Any

from homeassistant.components.input_number import (
    ATTR_VALUE,
    DOMAIN as INPUT_NUMBER_DOMAIN,
    SERVICE_SET_VALUE,
)
from homeassistant.components.repairs import RepairsFlow
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant
from homeassistant.data_entry_flow import FlowResult
from homeassistant.helpers import selector
import voluptuous as vol

from .const import DOMAIN

CONF_ODOMETER = "odometer"


class OdometerReminderFlow(RepairsFlow):
    """Ask for the current odometer reading and store it."""

    def __init__(self, entity_id: str) -> None:
        """Remember which entity the new reading belongs to."""
        self._entity_id = entity_id

    async def async_step_init(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Show the single step of this flow."""
        return await self.async_step_confirm()

    async def async_step_confirm(
        self, user_input: dict[str, Any] | None = None
    ) -> FlowResult:
        """Write the reading the user entered into the odometer entity."""
        if user_input is not None:
            await self.hass.services.async_call(
                INPUT_NUMBER_DOMAIN,
                SERVICE_SET_VALUE,
                {
                    ATTR_ENTITY_ID: self._entity_id,
                    ATTR_VALUE: float(user_input[CONF_ODOMETER]),
                },
                blocking=True,
            )
            return self.async_create_entry(data={})

        state = self.hass.states.get(self._entity_id)
        try:
            current = float(state.state) if state else 0.0
        except ValueError:
            current = 0.0

        return self.async_show_form(
            step_id="confirm",
            data_schema=vol.Schema(
                {
                    vol.Required(
                        CONF_ODOMETER, default=current
                    ): selector.NumberSelector(
                        selector.NumberSelectorConfig(
                            min=0,
                            max=2_000_000,
                            step=1,
                            mode=selector.NumberSelectorMode.BOX,
                        )
                    )
                }
            ),
            description_placeholders={"entity_id": self._entity_id},
        )


async def async_create_fix_flow(
    hass: HomeAssistant, issue_id: str, data: dict[str, str] | None
) -> RepairsFlow:
    """Return the flow that fixes `issue_id`."""
    if issue_id.startswith("odometer_stale_") and data:
        return OdometerReminderFlow(data["entity_id"])
    raise ValueError(f"{DOMAIN} has no fix flow for {issue_id}")
