"""Constants for the Leasing KM-Rechner integration."""

DOMAIN = "leasing_km"

CONF_START_DATE = "start_date"
CONF_LAUFZEIT   = "laufzeit_monate"
CONF_KM_GESAMT  = "km_gesamt"
CONF_KM_ENTITY  = "km_entity"

# Optional cost calculation
CONF_KOSTEN_AKTIV      = "kosten_aktiv"
CONF_MEHR_CENT         = "mehrkilometer_cent"
CONF_MINDER_CENT       = "minderkilometer_cent"
CONF_TOLERANZ_KM       = "toleranz_km"
CONF_TOLERANZ_RICHTUNG = "toleranz_richtung"

TOLERANZ_MEHR   = "mehr"
TOLERANZ_MINDER = "minder"
TOLERANZ_BEIDES = "beides"

UPDATE_INTERVAL_MINUTES = 30
