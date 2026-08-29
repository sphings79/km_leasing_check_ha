"""Config flow for the Leasing KM integration."""

from __future__ import annotations

from typing import Any

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.helpers import selector
import voluptuous as vol

from .calc import ForecastBasis
from .const import (
    CONF_FORECAST_BASIS,
    CONF_MONTHS,
    CONF_ODOMETER_ENTITY,
    CONF_START_DATE,
    CONF_START_KM,
    CONF_TOTAL_KM,
    DEFAULT_MONTHS,
    DEFAULT_START_KM,
    DEFAULT_TOTAL_KM,
    DOMAIN,
)

ODOMETER_DOMAINS = ["sensor", "input_number", "number"]


def _schema(defaults: dict[str, Any]) -> vol.Schema:
    """Build the contract form, pre-filled with `defaults`."""
    return vol.Schema(
        {
            vol.Required(
                CONF_NAME, default=defaults.get(CONF_NAME, "")
            ): selector.TextSelector(),
            vol.Required(
                CONF_START_DATE, default=defaults.get(CONF_START_DATE, "")
            ): selector.DateSelector(),
            vol.Required(
                CONF_MONTHS, default=defaults.get(CONF_MONTHS, DEFAULT_MONTHS)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=1, max=120, step=1, mode=selector.NumberSelectorMode.BOX
                )
            ),
            vol.Required(
                CONF_TOTAL_KM, default=defaults.get(CONF_TOTAL_KM, DEFAULT_TOTAL_KM)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=1, max=1_000_000, step=1, mode=selector.NumberSelectorMode.BOX
                )
            ),
            vol.Required(
                CONF_START_KM, default=defaults.get(CONF_START_KM, DEFAULT_START_KM)
            ): selector.NumberSelector(
                selector.NumberSelectorConfig(
                    min=0, max=2_000_000, step=1, mode=selector.NumberSelectorMode.BOX
                )
            ),
            vol.Required(
                CONF_ODOMETER_ENTITY, default=defaults.get(CONF_ODOMETER_ENTITY, "")
            ): selector.EntitySelector(
                selector.EntitySelectorConfig(domain=ODOMETER_DOMAINS)
            ),
            vol.Required(
                CONF_FORECAST_BASIS,
                default=defaults.get(CONF_FORECAST_BASIS, ForecastBasis.TOTAL.value),
            ): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=[basis.value for basis in ForecastBasis],
                    translation_key="forecast_basis",
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
        }
    )


class LeasingKmConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle setting up and reconfiguring a leasing contract."""

    VERSION = 2

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Ask for the contract details."""
        if user_input is not None:
            await self.async_set_unique_id(
                f"{user_input[CONF_ODOMETER_ENTITY]}_{user_input[CONF_START_DATE]}"
            )
            self._abort_if_unique_id_configured()
            return self.async_create_entry(
                title=user_input[CONF_NAME], data=_normalise(user_input)
            )

        return self.async_show_form(step_id="user", data_schema=_schema({}))

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Let the user edit every contract detail in place."""
        entry = self._get_reconfigure_entry()
        if user_input is not None:
            return self.async_update_reload_and_abort(
                entry,
                title=user_input[CONF_NAME],
                data=_normalise(user_input),
            )

        return self.async_show_form(
            step_id="reconfigure", data_schema=_schema(dict(entry.data))
        )


def _normalise(user_input: dict[str, Any]) -> dict[str, Any]:
    """Store the numeric fields with the types the calculation expects."""
    data = dict(user_input)
    data[CONF_MONTHS] = int(data[CONF_MONTHS])
    data[CONF_TOTAL_KM] = float(data[CONF_TOTAL_KM])
    data[CONF_START_KM] = float(data[CONF_START_KM])
    return data
