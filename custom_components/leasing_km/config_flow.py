"""Config flow for the Leasing KM integration."""

from __future__ import annotations

from typing import Any

from homeassistant import config_entries
from homeassistant.const import CONF_NAME
from homeassistant.helpers import selector
import voluptuous as vol

from .calc import ChargeMode, ForecastBasis
from .const import (
    CONF_COSTS_ENABLED,
    CONF_EXCESS_MODE,
    CONF_EXCESS_RATE,
    CONF_EXCESS_TOLERANCE_KM,
    CONF_FORECAST_BASIS,
    CONF_MONTHS,
    CONF_ODOMETER_ENTITY,
    CONF_REFUND_LIMIT_KM,
    CONF_REFUND_MODE,
    CONF_REFUND_RATE,
    CONF_REFUND_TOLERANCE_KM,
    CONF_REMINDER_DAYS,
    CONF_START_DATE,
    CONF_START_KM,
    CONF_TOTAL_KM,
    DEFAULT_EXCESS_RATE,
    DEFAULT_MONTHS,
    DEFAULT_REFUND_LIMIT_KM,
    DEFAULT_REFUND_RATE,
    DEFAULT_REMINDER_DAYS,
    DEFAULT_START_KM,
    DEFAULT_TOLERANCE_KM,
    DEFAULT_TOTAL_KM,
    DOMAIN,
    MANUAL_DOMAIN,
    REMINDER_CHOICES,
    REMINDER_OFF,
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
            vol.Required(
                CONF_COSTS_ENABLED,
                default=defaults.get(CONF_COSTS_ENABLED, False),
            ): selector.BooleanSelector(),
            vol.Required(
                CONF_REMINDER_DAYS,
                default=defaults.get(CONF_REMINDER_DAYS, DEFAULT_REMINDER_DAYS),
            ): selector.SelectSelector(
                selector.SelectSelectorConfig(
                    options=list(REMINDER_CHOICES),
                    translation_key="reminder_days",
                    mode=selector.SelectSelectorMode.DROPDOWN,
                )
            ),
        }
    )


def _cost_schema(defaults: dict[str, Any]) -> vol.Schema:
    """Build the settlement form, pre-filled with `defaults`."""

    def rate(key: str, fallback: float) -> Any:
        return vol.Required(
            key, default=defaults.get(key, fallback)
        ), selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=0, max=500, step=0.01, mode=selector.NumberSelectorMode.BOX
            )
        )

    def kilometres(key: str, fallback: float) -> Any:
        # Free steps on purpose: tolerances like 2,750 km do exist.
        return vol.Required(
            key, default=defaults.get(key, fallback)
        ), selector.NumberSelector(
            selector.NumberSelectorConfig(
                min=0, max=500_000, step=1, mode=selector.NumberSelectorMode.BOX
            )
        )

    def mode(key: str, fallback: ChargeMode) -> Any:
        return vol.Required(
            key, default=defaults.get(key, fallback.value)
        ), selector.SelectSelector(
            selector.SelectSelectorConfig(
                options=[choice.value for choice in ChargeMode],
                translation_key="charge_mode",
                mode=selector.SelectSelectorMode.DROPDOWN,
            )
        )

    fields = [
        rate(CONF_EXCESS_RATE, DEFAULT_EXCESS_RATE),
        kilometres(CONF_EXCESS_TOLERANCE_KM, DEFAULT_TOLERANCE_KM),
        mode(CONF_EXCESS_MODE, ChargeMode.FROM_FIRST),
        rate(CONF_REFUND_RATE, DEFAULT_REFUND_RATE),
        kilometres(CONF_REFUND_TOLERANCE_KM, DEFAULT_TOLERANCE_KM),
        mode(CONF_REFUND_MODE, ChargeMode.ABOVE_TOLERANCE),
        kilometres(CONF_REFUND_LIMIT_KM, DEFAULT_REFUND_LIMIT_KM),
    ]
    return vol.Schema(dict(fields))


def _validate(user_input: dict[str, Any]) -> dict[str, str]:
    """Return the field errors for a submitted form."""
    reminder = user_input.get(CONF_REMINDER_DAYS, REMINDER_OFF)
    entity_id = user_input[CONF_ODOMETER_ENTITY]
    if reminder != REMINDER_OFF and not entity_id.startswith(f"{MANUAL_DOMAIN}."):
        # A vehicle sensor is quiet whenever the car is parked, so a reminder
        # would only ever produce false alarms.
        return {CONF_REMINDER_DAYS: "reminder_needs_manual_entity"}
    return {}


class LeasingKmConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle setting up and reconfiguring a leasing contract."""

    VERSION = 2

    def __init__(self) -> None:
        """Hold the contract until the optional cost step is done."""
        self._contract: dict[str, Any] = {}

    async def async_step_user(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Ask for the contract details."""
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate(user_input)
            if not errors:
                await self.async_set_unique_id(
                    f"{user_input[CONF_ODOMETER_ENTITY]}_{user_input[CONF_START_DATE]}"
                )
                self._abort_if_unique_id_configured()
                self._contract = _normalise(user_input)
                if user_input[CONF_COSTS_ENABLED]:
                    return await self.async_step_costs()
                return self.async_create_entry(
                    title=user_input[CONF_NAME], data=self._contract
                )

        return self.async_show_form(
            step_id="user",
            data_schema=_schema(user_input or {}),
            errors=errors,
        )

    async def async_step_costs(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Ask for the settlement terms of the contract."""
        if user_input is not None:
            data = {**self._contract, **_normalise_costs(user_input)}
            if self.source == config_entries.SOURCE_RECONFIGURE:
                entry = self._get_reconfigure_entry()
                return self.async_update_reload_and_abort(
                    entry, title=data[CONF_NAME], data=data
                )
            return self.async_create_entry(title=data[CONF_NAME], data=data)

        return self.async_show_form(
            step_id="costs", data_schema=_cost_schema(self._contract)
        )

    async def async_step_reconfigure(
        self, user_input: dict[str, Any] | None = None
    ) -> config_entries.ConfigFlowResult:
        """Let the user edit every contract detail in place."""
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}
        if user_input is not None:
            errors = _validate(user_input)
            if not errors:
                self._contract = {**dict(entry.data), **_normalise(user_input)}
                if user_input[CONF_COSTS_ENABLED]:
                    return await self.async_step_costs()
                return self.async_update_reload_and_abort(
                    entry, title=user_input[CONF_NAME], data=self._contract
                )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_schema(user_input or dict(entry.data)),
            errors=errors,
        )


def _normalise(user_input: dict[str, Any]) -> dict[str, Any]:
    """Store the numeric fields with the types the calculation expects."""
    data = dict(user_input)
    data[CONF_MONTHS] = int(data[CONF_MONTHS])
    data[CONF_TOTAL_KM] = float(data[CONF_TOTAL_KM])
    data[CONF_START_KM] = float(data[CONF_START_KM])
    return data


def _normalise_costs(user_input: dict[str, Any]) -> dict[str, Any]:
    """Store the settlement terms as plain numbers."""
    numeric = (
        CONF_EXCESS_RATE,
        CONF_EXCESS_TOLERANCE_KM,
        CONF_REFUND_RATE,
        CONF_REFUND_TOLERANCE_KM,
        CONF_REFUND_LIMIT_KM,
    )
    data = dict(user_input)
    for key in numeric:
        data[key] = float(data[key])
    return data
