"""Sensor platform for Leasing KM-Rechner."""
from __future__ import annotations

from collections.abc import Callable
from dataclasses import dataclass
from typing import Any

from homeassistant.components.sensor import (
    SensorEntity,
    SensorEntityDescription,
    SensorStateClass,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.device_registry import DeviceInfo
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import LeasingKmCoordinator, LeasingKmData


@dataclass(frozen=True, kw_only=True)
class LeasingKmSensorDescription(SensorEntityDescription):
    value_fn: Callable[[LeasingKmData], float | None] = lambda _: None


SENSORS: tuple[LeasingKmSensorDescription, ...] = (
    # ── Tagesbasis ───────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="tagesleistung_ist",
        name="Tagesleistung Ist",
        icon="mdi:speedometer",
        native_unit_of_measurement="km",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.ist_day,
    ),
    LeasingKmSensorDescription(
        key="tagesleistung_soll",
        name="Tagesleistung Soll",
        icon="mdi:speedometer-slow",
        native_unit_of_measurement="km",
        suggested_display_precision=1,
        value_fn=lambda d: d.soll_day,
    ),
    # ── Soll-Ist-Vergleich ────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="soll_km_heute",
        name="Soll-KM heute",
        icon="mdi:map-marker-check",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.soll_heute,
    ),
    LeasingKmSensorDescription(
        key="differenz_heute",
        name="Differenz heute",
        icon="mdi:delta",
        native_unit_of_measurement="km",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=0,
        value_fn=lambda d: d.diff_heute,
    ),
    LeasingKmSensorDescription(
        key="soll_km_monatsende",
        name="Soll-KM Monatsende",
        icon="mdi:calendar-end",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.soll_monatsende,
    ),
    LeasingKmSensorDescription(
        key="differenz_monatsende",
        name="Differenz Monatsende",
        icon="mdi:delta",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.diff_monatsende,
    ),
    # ── Restkilometer ─────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="verbleibend_jahresende",
        name="Verbleibend bis Jahresende",
        icon="mdi:calendar-today",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.verbl_jahresende,
    ),
    LeasingKmSensorDescription(
        key="verbleibend_laufzeitende",
        name="Verbleibend bis Laufzeitende",
        icon="mdi:calendar-check",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.verbl_laufzeitende,
    ),
    LeasingKmSensorDescription(
        key="noch_erlaubt",
        name="Noch erlaubt gesamt",
        icon="mdi:road-variant",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.noch_erlaubt,
    ),
    LeasingKmSensorDescription(
        key="jahres_soll",
        name="KM-Limit pro Jahr",
        icon="mdi:car-speed-limiter",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.jahres_soll,
    ),
    # ── Prognose ─────────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="prognose_jahresende",
        name="Prognose Jahresende",
        icon="mdi:chart-timeline-variant",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.prog_jahresende,
    ),
    LeasingKmSensorDescription(
        key="prognose_laufzeitende",
        name="Prognose Laufzeitende",
        icon="mdi:chart-bell-curve-cumulative",
        native_unit_of_measurement="km",
        suggested_display_precision=0,
        value_fn=lambda d: d.prog_laufzeitende,
    ),
    LeasingKmSensorDescription(
        key="abweichung_laufzeitende",
        name="Prognose Abweichung Laufzeitende",
        icon="mdi:delta",
        native_unit_of_measurement="km",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=0,
        value_fn=lambda d: d.abweichung_laufzeitende,
    ),
    # ── Prozent ──────────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="km_absolviert",
        name="KM absolviert",
        icon="mdi:percent",
        native_unit_of_measurement="%",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=1,
        value_fn=lambda d: d.km_pct,
    ),
    LeasingKmSensorDescription(
        key="laufzeit_absolviert",
        name="Laufzeit absolviert",
        icon="mdi:percent-circle",
        native_unit_of_measurement="%",
        suggested_display_precision=1,
        value_fn=lambda d: d.lauf_pct,
    ),
    # ── Kosten ───────────────────────────────────────────────────────────────
    LeasingKmSensorDescription(
        key="kosten_prognose",
        name="Prognose Kosten/Erstattung Laufzeitende",
        icon="mdi:currency-eur",
        native_unit_of_measurement="€",
        state_class=SensorStateClass.MEASUREMENT,
        suggested_display_precision=2,
        value_fn=lambda d: d.kosten_prognose,
    ),
)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    coordinator: LeasingKmCoordinator = entry.runtime_data
    async_add_entities(
        LeasingKmSensor(coordinator, entry, desc) for desc in SENSORS
    )


class LeasingKmSensor(CoordinatorEntity[LeasingKmCoordinator], SensorEntity):
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
        attrs: dict[str, Any] = {
            "vertragsende": data.vertragsende,
            "elapsed_days": data.elapsed_days,
            "total_days":   data.total_days,
            "ueber_soll":   data.is_over_soll,
        }
        if data.kosten_aktiv:
            attrs["kosten_aktiv"]          = True
            attrs["toleranz_ueberschritten"]= data.toleranz_ueberschritten
            # Expose cost config so the Lovelace card can read them
            if data.mehr_cent_cfg is not None:
                attrs["mehr_cent"]          = data.mehr_cent_cfg
            if data.minder_cent_cfg is not None:
                attrs["minder_cent"]        = data.minder_cent_cfg
            if data.toleranz_mehr_km_cfg is not None:
                attrs["toleranz_mehr_km"]   = data.toleranz_mehr_km_cfg
            if data.toleranz_minder_km_cfg is not None:
                attrs["toleranz_minder_km"] = data.toleranz_minder_km_cfg
            if data.minder_grenze_km_cfg is not None:
                attrs["minder_grenze_km"]   = data.minder_grenze_km_cfg
        return attrs
