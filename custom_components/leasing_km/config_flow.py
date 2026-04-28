"""Config flow for Leasing KM-Rechner."""
from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.helpers import selector

from .const import (
    CONF_KM_ENTITY,
    CONF_KM_GESAMT,
    CONF_KOSTEN_AKTIV,
    CONF_LAUFZEIT,
    CONF_MEHR_CENT,
    CONF_MINDER_CENT,
    CONF_START_DATE,
    CONF_TOLERANZ_KM,
    CONF_TOLERANZ_RICHTUNG,
    DOMAIN,
    TOLERANZ_BEIDES,
    TOLERANZ_MEHR,
    TOLERANZ_MINDER,
)

# ---------------------------------------------------------------------------
# Shared schema factory
# ---------------------------------------------------------------------------

def _build_schema(defaults: dict) -> vol.Schema:
    return vol.Schema(
        {
            # ── Vertragsdaten ────────────────────────────────────────────────
            vol.Required(
                CONF_START_DATE,
                default=defaults.get(CONF_START_DATE, ""),
            ): selector.selector({"date": {}}),

            vol.Required(
                CONF_LAUFZEIT,
                default=defaults.get(CONF_LAUFZEIT, 48),
            ): selector.selector(
                {
                    "number": {
                        "min": 1,
                        "max": 120,
                        "step": 1,
                        "mode": "box",
                        "unit_of_measurement": "Monate",
                    }
                }
            ),

            vol.Required(
                CONF_KM_GESAMT,
                default=defaults.get(CONF_KM_GESAMT, 80000),
            ): selector.selector(
                {
                    "number": {
                        "min": 1,
                        "max": 500000,
                        "step": 1,
                        "mode": "box",
                        "unit_of_measurement": "km",
                    }
                }
            ),

            vol.Required(
                CONF_KM_ENTITY,
                default=defaults.get(CONF_KM_ENTITY, ""),
            ): selector.selector(
                {
                    "entity": {
                        "domain": ["sensor", "input_number"],
                    }
                }
            ),

            # ── Optionale Kostenberechnung ───────────────────────────────────
            vol.Optional(
                CONF_KOSTEN_AKTIV,
                default=defaults.get(CONF_KOSTEN_AKTIV, False),
            ): selector.selector({"boolean": {}}),

            vol.Optional(
                CONF_MEHR_CENT,
                default=defaults.get(CONF_MEHR_CENT, 10),
            ): selector.selector(
                {
                    "number": {
                        "min": 0,
                        "max": 200,
                        "step": 0.1,
                        "mode": "box",
                        "unit_of_measurement": "ct/km",
                    }
                }
            ),

            vol.Optional(
                CONF_MINDER_CENT,
                default=defaults.get(CONF_MINDER_CENT, 0),
            ): selector.selector(
                {
                    "number": {
                        "min": 0,
                        "max": 200,
                        "step": 0.1,
                        "mode": "box",
                        "unit_of_measurement": "ct/km",
                    }
                }
            ),

            vol.Optional(
                CONF_TOLERANZ_KM,
                default=defaults.get(CONF_TOLERANZ_KM, 0),
            ): selector.selector(
                {
                    "number": {
                        "min": 0,
                        "max": 10000,
                        "step": 100,
                        "mode": "box",
                        "unit_of_measurement": "km",
                    }
                }
            ),

            vol.Optional(
                CONF_TOLERANZ_RICHTUNG,
                default=defaults.get(CONF_TOLERANZ_RICHTUNG, TOLERANZ_BEIDES),
            ): selector.selector(
                {
                    "select": {
                        "options": [
                            {"label": "Nur Mehrkilometer",   "value": TOLERANZ_MEHR},
                            {"label": "Nur Minderkilometer", "value": TOLERANZ_MINDER},
                            {"label": "Mehr & Minder",       "value": TOLERANZ_BEIDES},
                        ]
                    }
                }
            ),
        }
    )


# ---------------------------------------------------------------------------
# Config flow (initial setup)
# ---------------------------------------------------------------------------

class LeasingKmConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle the initial configuration dialog."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            km = int(user_input[CONF_KM_GESAMT])
            lz = int(user_input[CONF_LAUFZEIT])
            title = f"Leasing · {km:,} km / {lz} Monate".replace(",", ".")

            return self.async_create_entry(title=title, data=user_input)

        return self.async_show_form(
            step_id="user",
            data_schema=_build_schema({}),
            errors=errors,
        )

    # ------------------------------------------------------------------
    # Reconfigure (HA 2024.6+)
    # ------------------------------------------------------------------

    async def async_step_reconfigure(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        entry = self._get_reconfigure_entry()
        errors: dict[str, str] = {}

        if user_input is not None:
            return self.async_update_reload_and_abort(
                entry,
                data=user_input,
            )

        return self.async_show_form(
            step_id="reconfigure",
            data_schema=_build_schema({**entry.data, **entry.options}),
            errors=errors,
        )

    # ------------------------------------------------------------------
    # Options flow (gear icon)
    # ------------------------------------------------------------------

    @staticmethod
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> LeasingKmOptionsFlow:
        return LeasingKmOptionsFlow(config_entry)


# ---------------------------------------------------------------------------
# Options flow
# ---------------------------------------------------------------------------

class LeasingKmOptionsFlow(config_entries.OptionsFlow):
    """Allow the user to reconfigure all settings after initial setup."""

    def __init__(self, entry: config_entries.ConfigEntry) -> None:
        self._entry = entry

    async def async_step_init(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        errors: dict[str, str] = {}

        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        current = {**self._entry.data, **self._entry.options}

        return self.async_show_form(
            step_id="init",
            data_schema=_build_schema(current),
            errors=errors,
        )
