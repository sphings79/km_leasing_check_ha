"""Sensor platform for Leasing KM-Rechner."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    ENTITY_ID_FORMAT,
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity import async_generate_entity_id
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import LeasingKmCoordinator, LeasingKmData


# ---------------------------------------------------------------------------
# Entity description with typed value accessor
# ---------------------------------------------------------------------------

@dataclass(frozen=True, kw_only=True)
class LeasingKmSensorDescription(SensorEntityDescription):
    value_fn: Callable[[LeasingKmData], float | None] = lambda _: None
    # Fixed object id, so the entity_id never depends on the UI language.
    # The visible name comes from translation_key; only the name is translated.
    object_id: str = ""


# ---------------------------------------------------------------------------
# Sensor definitions
# ---------------------------------------------------------------------------

SENSORS: tuple[LeasingKmSensorDescription, ...] = (
    # ── Tagesbasis ──────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="tagesleistung_ist",
        translation_key="tagesleistung_ist",
        object_id="tagesleistung_ist",
        icon="mdi:speedometer",
        native_unit_of_measurement="km",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.ist_day,
    ),
    LeasingKmSensorDescription(
        key="tagesleistung_soll",
        translation_key="tagesleistung_soll",
        object_id="tagesleistung_soll",
        icon="mdi:speedometer-slow",
        native_unit_of_measurement="km",
        suggested_display_precision=1,
        value_fn=lambda d: d.soll_day,
    ),
    # ── Soll-Ist-Vergleich ───────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="soll_km_heute",
        translation_key="soll_km_heute",
        object_id="soll_km_heute",
        icon="mdi:map-marker-check",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.soll_heute,
    ),
    LeasingKmSensorDescription(
        key="differenz_heute",
        translation_key="differenz_heute",
        object_id="differenz_heute",
        icon="mdi:delta",
        native_unit_of_measurement="km",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=0,
        value_fn=lambda d: d.diff_heute,
    ),
    LeasingKmSensorDescription(
        key="soll_km_monatsende",
        translation_key="soll_km_monatsende",
        object_id="soll_km_monatsende",
        icon="mdi:calendar-end",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.soll_monatsende,
    ),
    LeasingKmSensorDescription(
        key="differenz_monatsende",
        translation_key="differenz_monatsende",
        object_id="differenz_monatsende",
        icon="mdi:delta",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.diff_monatsende,
    ),
    # ── Restkilometer ────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="verbleibend_jahresende",
        translation_key="verbleibend_jahresende",
        object_id="verbleibend_bis_jahresende",
        icon="mdi:calendar-today",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.verbl_jahresende,
    ),
    LeasingKmSensorDescription(
        key="verbleibend_laufzeitende",
        translation_key="verbleibend_laufzeitende",
        object_id="verbleibend_bis_laufzeitende",
        icon="mdi:calendar-check",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.verbl_laufzeitende,
    ),
    LeasingKmSensorDescription(
        key="noch_erlaubt",
        translation_key="noch_erlaubt",
        object_id="noch_erlaubt_gesamt",
        icon="mdi:road-variant",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.noch_erlaubt,
    ),
    LeasingKmSensorDescription(
        key="jahres_soll",
        translation_key="jahres_soll",
        object_id="km_limit_pro_jahr",
        icon="mdi:car-speed-limiter",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.jahres_soll,
    ),
    # ── Prognose ─────────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="prognose_jahresende",
        translation_key="prognose_jahresende",
        object_id="prognose_jahresende",
        icon="mdi:chart-timeline-variant",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.prog_jahresende,
    ),
    LeasingKmSensorDescription(
        key="prognose_laufzeitende",
        translation_key="prognose_laufzeitende",
        object_id="prognose_laufzeitende",
        icon="mdi:chart-bell-curve-cumulative",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.prog_laufzeitende,
    ),
    # ── Prozent ──────────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="km_absolviert",
        translation_key="km_absolviert",
        object_id="km_absolviert",
        icon="mdi:percent",
        native_unit_of_measurement="%",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.km_pct,
    ),
    LeasingKmSensorDescription(
        key="laufzeit_absolviert",
        translation_key="laufzeit_absolviert",
        object_id="laufzeit_absolviert",
        icon="mdi:percent-circle",
        native_unit_of_measurement="%",
        suggested_display_precision=1,
        value_fn=lambda d: d.lauf_pct,
    ),
)


# ---------------------------------------------------------------------------
# Platform setup
# ---------------------------------------------------------------------------

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up sensor entities from a config entry."""
    coordinator: LeasingKmCoordinator = entry.runtime_data
    async_add_entities(
        LeasingKmSensor(coordinator, entry, desc) for desc in SENSORS
    )


# ---------------------------------------------------------------------------
# Entity class
# ---------------------------------------------------------------------------

class LeasingKmSensor(CoordinatorEntity[LeasingKmCoordinator], SensorEntity):
    """A single numeric sensor derived from the leasing KM coordinator."""

    _attr_has_entity_name = True

    def __init__(
        self,
        coordinator: LeasingKmCoordinator,
        entry: ConfigEntry,
        description: LeasingKmSensorDescription,
    ) -> None:
        super().__init__(coordinator)
        self.entity_description = description
        self._attr_unique_id = f"{entry.entry_id}_{description.key}"
        # Pin the entity_id to the object id above. Existing entities keep the
        # id already stored in the entity registry; this only governs new ones,
        # so a German and an English instance end up with identical ids.
        self.entity_id = async_generate_entity_id(
            ENTITY_ID_FORMAT,
            f"{entry.title} {description.object_id}",
            hass=coordinator.hass,
        )
        self._attr_device_info = DeviceInfo(
            identifiers={(DOMAIN, entry.entry_id)},
            name=entry.title,
            manufacturer="Leasing KM-Rechner",
            model="Custom Integration",
        )

    @property
    def native_value(self) -> float | None:
        if self.coordinator.data is None:
            return None
        return self.entity_description.value_fn(self.coordinator.data)

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        data = self.coordinator.data
        if data is None:
            return {}
        return {
            "vertragsende":  data.vertragsende,
            "elapsed_days":  data.elapsed_days,
            "total_days":    data.total_days,
            "ueber_soll":    data.is_over_soll,
        }
