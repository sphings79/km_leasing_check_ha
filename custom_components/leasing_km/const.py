"""Constants for the Leasing KM integration."""

from __future__ import annotations

from datetime import timedelta

from homeassistant.const import Platform

DOMAIN = "leasing_km"

PLATFORMS: list[Platform] = [Platform.SENSOR, Platform.BINARY_SENSOR]

# --- Configuration keys ---------------------------------------------------
CONF_START_DATE = "start_date"
CONF_MONTHS = "months"
CONF_TOTAL_KM = "total_km"
CONF_START_KM = "start_km"
CONF_ODOMETER_ENTITY = "odometer_entity"
CONF_FORECAST_BASIS = "forecast_basis"
CONF_REMINDER_DAYS = "reminder_days"

# Reserved for the cost calculation that lands in a later release. The keys are
# defined here so the config entry does not need another migration then.
CONF_COSTS_ENABLED = "costs_enabled"
CONF_EXCESS_RATE = "excess_rate"
CONF_REFUND_RATE = "refund_rate"
CONF_EXCESS_TOLERANCE_KM = "excess_tolerance_km"
CONF_REFUND_TOLERANCE_KM = "refund_tolerance_km"
CONF_REFUND_LIMIT_KM = "refund_limit_km"

# --- Configuration keys used by version 1, kept for the migration ---------
LEGACY_CONF_MONTHS = "laufzeit_monate"
LEGACY_CONF_TOTAL_KM = "km_gesamt"
LEGACY_CONF_ODOMETER_ENTITY = "km_entity"

# How long the odometer may stay untouched before the integration asks for a
# new reading. Only meaningful for a manually maintained input_number.
REMINDER_OFF = "off"
REMINDER_CHOICES = (REMINDER_OFF, "7", "14", "30")
MANUAL_DOMAIN = "input_number"

STORAGE_VERSION = 1

DEFAULT_MONTHS = 48
DEFAULT_TOTAL_KM = 80_000
DEFAULT_START_KM = 0
DEFAULT_REMINDER_DAYS = REMINDER_OFF

UPDATE_INTERVAL = timedelta(minutes=30)

# How often the recorder is asked for past odometer readings. They move slowly
# and the queries are the only expensive part of an update.
HISTORY_INTERVAL = timedelta(hours=6)

# A drop larger than this many units is treated as a new odometer source
# (vehicle swap, instrument cluster replacement) rather than a glitch.
ODOMETER_ROLLBACK_TOLERANCE = 1.0
