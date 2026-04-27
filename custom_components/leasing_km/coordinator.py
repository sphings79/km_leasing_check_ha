"""DataUpdateCoordinator for Leasing KM-Rechner."""
from __future__ import annotations

import calendar
import logging
from dataclasses import dataclass
from datetime import date, timedelta

from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .const import (
    CONF_KM_ENTITY,
    CONF_KM_GESAMT,
    CONF_LAUFZEIT,
    CONF_START_DATE,
    DOMAIN,
    UPDATE_INTERVAL_MINUTES,
)

_LOGGER = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data container
# ---------------------------------------------------------------------------

@dataclass
class LeasingKmData:
    """All calculated leasing values."""

    km_aktuell: float
    km_gesamt: float
    ist_day: float
    soll_day: float
    soll_heute: float
    diff_heute: float
    soll_monatsende: float
    diff_monatsende: float
    verbl_jahresende: float
    verbl_laufzeitende: float
    noch_erlaubt: float
    prog_jahresende: float
    prog_laufzeitende: float
    km_pct: float
    lauf_pct: float
    jahres_soll: float
    jahres_over: bool
    ende_over: bool
    is_over_soll: bool
    vertragsende: str
    elapsed_days: int
    total_days: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _add_months(d: date, months: int) -> date:
    """Add months to a date, clamping to the last day of the target month."""
    month = d.month - 1 + months
    year  = d.year + month // 12
    month = month % 12 + 1
    day   = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def _get_cfg(entry: ConfigEntry) -> dict:
    """Merge entry.data with entry.options (options override data)."""
    return {**entry.data, **entry.options}


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------

class LeasingKmCoordinator(DataUpdateCoordinator[LeasingKmData]):
    """Coordinator that reads the odometer entity and computes all KM metrics."""

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass,
            _LOGGER,
            name=DOMAIN,
            update_interval=timedelta(minutes=UPDATE_INTERVAL_MINUTES),
        )
        self.entry = entry

    async def _async_update_data(self) -> LeasingKmData:
        cfg = _get_cfg(self.entry)

        start     = date.fromisoformat(cfg[CONF_START_DATE])
        laufzeit  = int(cfg[CONF_LAUFZEIT])
        km_gesamt = float(cfg[CONF_KM_GESAMT])
        km_entity = cfg[CONF_KM_ENTITY]

        # --- Read current odometer from entity ---
        state = self.hass.states.get(km_entity)
        if state is None or state.state in ("unknown", "unavailable", ""):
            raise UpdateFailed(
                f"KM-Entität '{km_entity}' ist nicht verfügbar (state={state})"
            )
        try:
            km_aktuell = float(state.state)
        except ValueError as exc:
            raise UpdateFailed(
                f"Ungültiger Wert der KM-Entität '{km_entity}': {state.state}"
            ) from exc

        # --- Base date arithmetic ---
        today      = date.today()
        vertr_end  = _add_months(start, laufzeit)
        total_days = (vertr_end - start).days
        elapsed    = (today - start).days

        if elapsed <= 0:
            raise UpdateFailed("Startdatum liegt in der Zukunft – noch keine Auswertung möglich.")
        if total_days <= 0:
            raise UpdateFailed("Laufzeit ergibt 0 Tage – bitte Startdatum und Laufzeit prüfen.")

        # --- Core rates ---
        soll_day = km_gesamt / total_days
        ist_day  = km_aktuell / elapsed

        # --- Today ---
        soll_heute = soll_day * elapsed
        diff_heute = km_aktuell - soll_heute

        # --- End of current month ---
        mon_end  = date(today.year, today.month,
                        calendar.monthrange(today.year, today.month)[1])
        soll_mon = soll_day * (mon_end - start).days
        diff_mon = km_aktuell - soll_mon

        # --- End of current year ---
        year_end   = date(today.year, 12, 31)
        d_to_year  = (year_end - today).days
        verbl_jahr = soll_day * d_to_year
        prog_jahr  = km_aktuell + ist_day * d_to_year

        # --- End of contract ---
        d_to_end  = max(0, (vertr_end - today).days)
        verbl_end = soll_day * d_to_end
        prog_end  = km_aktuell + ist_day * d_to_end

        # --- Annual check ---
        jahres_soll  = km_gesamt / (laufzeit / 12)
        jahres_over  = (ist_day * 365) > jahres_soll
        ende_over    = prog_end > km_gesamt

        return LeasingKmData(
            km_aktuell          = round(km_aktuell, 1),
            km_gesamt           = round(km_gesamt, 1),
            ist_day             = round(ist_day, 2),
            soll_day            = round(soll_day, 2),
            soll_heute          = round(soll_heute, 1),
            diff_heute          = round(diff_heute, 1),
            soll_monatsende     = round(soll_mon, 1),
            diff_monatsende     = round(diff_mon, 1),
            verbl_jahresende    = round(verbl_jahr, 1),
            verbl_laufzeitende  = round(verbl_end, 1),
            noch_erlaubt        = round(max(0.0, km_gesamt - km_aktuell), 1),
            prog_jahresende     = round(prog_jahr, 1),
            prog_laufzeitende   = round(prog_end, 1),
            km_pct              = round(min((km_aktuell / km_gesamt) * 100, 100.0), 1),
            lauf_pct            = round(min((elapsed / total_days) * 100, 100.0), 1),
            jahres_soll         = round(jahres_soll, 1),
            jahres_over         = jahres_over,
            ende_over           = ende_over,
            is_over_soll        = diff_heute > 0,
            vertragsende        = vertr_end.isoformat(),
            elapsed_days        = elapsed,
            total_days          = total_days,
        )
