"""Constants for the Leasing KM-Rechner integration."""

DOMAIN = "leasing_km"

CONF_START_DATE = "start_date"
CONF_LAUFZEIT   = "laufzeit_monate"
CONF_KM_GESAMT  = "km_gesamt"
CONF_KM_ENTITY  = "km_entity"

# Optional cost calculation
CONF_KOSTEN_AKTIV       = "kosten_aktiv"
CONF_MEHR_CENT          = "mehrkilometer_cent"      # Nachbelastungssatz Mehr-km Service
CONF_MINDER_CENT        = "minderkilometer_cent"    # Erstattungssatz Minder-km Service
CONF_TOLERANZ_MEHR_KM   = "toleranz_mehr_km"        # Toleranzgrenze Mehr (0 = deaktiviert)
CONF_TOLERANZ_MINDER_KM = "toleranz_minder_km"      # Toleranzgrenze Minder (0 = deaktiviert)
CONF_MINDER_GRENZE_KM   = "minder_grenze_km"        # Max. erstattbare Minder-KM (0 = unbegrenzt)

UPDATE_INTERVAL_MINUTES = 30
