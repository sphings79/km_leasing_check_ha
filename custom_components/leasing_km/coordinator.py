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
    CONF_KOSTEN_AKTIV,
    CONF_LAUFZEIT,
    CONF_MEHR_CENT,
    CONF_MINDER_CENT,
    CONF_MINDER_GRENZE_KM,
    CONF_START_DATE,
    CONF_TOLERANZ_MEHR_KM,
    CONF_TOLERANZ_MINDER_KM,
    DOMAIN,
    UPDATE_INTERVAL_MINUTES,
)

_LOGGER = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Data container
# ---------------------------------------------------------------------------

@dataclass
class LeasingKmData:
    # ── Stammdaten ───────────────────────────────────────────────────────────
    km_aktuell: float
    km_gesamt: float
    # ── Tagesbasis ───────────────────────────────────────────────────────────
    ist_day: float
    soll_day: float
    # ── Soll-Ist-Vergleich ────────────────────────────────────────────────────
    soll_heute: float
    diff_heute: float
    soll_monatsende: float
    diff_monatsende: float
    # ── Restkilometer ─────────────────────────────────────────────────────────
    verbl_jahresende: float
    verbl_laufzeitende: float
    noch_erlaubt: float
    # ── Prognose ─────────────────────────────────────────────────────────────
    prog_jahresende: float
    prog_laufzeitende: float
    abweichung_laufzeitende: float   # prog_end − km_gesamt  (+= Mehr, −= Minder)
    # ── Prozent ──────────────────────────────────────────────────────────────
    km_pct: float
    lauf_pct: float
    jahres_soll: float
    # ── Flags ────────────────────────────────────────────────────────────────
    jahres_over: bool
    ende_over: bool
    is_over_soll: bool
    # ── Kostenberechnung (optional) ───────────────────────────────────────────
    kosten_aktiv: bool
    kosten_prognose: float | None    # > 0 = Nachzahlung, < 0 = Erstattung, None = deaktiviert
    toleranz_ueberschritten: bool    # True = außerhalb der Toleranzgrenze
    # ── Meta ─────────────────────────────────────────────────────────────────
    vertragsende: str
    elapsed_days: int
    total_days: int


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _add_months(d: date, months: int) -> date:
    month = d.month - 1 + months
    year  = d.year + month // 12
    month = month % 12 + 1
    day   = min(d.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def _get_cfg(entry: ConfigEntry) -> dict:
    return {**entry.data, **entry.options}


def _calc_kosten(
    abweichung: float,
    mehr_cent: float,
    minder_cent: float,
    toleranz_mehr_km: float,
    toleranz_minder_km: float,
    minder_grenze_km: float,
) -> tuple[float, bool]:
    """
    Berechnet prognostizierte Kosten/Erstattung und ob die Toleranz überschritten ist.

    Rückgabe: (kosten_eur, toleranz_ueberschritten)
      kosten_eur > 0  → Nachzahlung (Mehr-KM)
      kosten_eur < 0  → Erstattung  (Minder-KM)
      kosten_eur = 0  → innerhalb Toleranz oder keine Abweichung

    Mehr-KM:   Alle km werden berechnet sobald die Toleranz überschritten ist (kein Cap).
    Minder-KM: Nur km IM Band werden erstattet:
               Band = (toleranz_minder_km, toleranz_minder_km + minder_grenze_km]
               Erstattete km = min(minder_km − toleranz, minder_grenze)
               (minder_grenze_km = 0 → unbegrenzt)
    """
    if abweichung > 0:
        # ── Mehrkilometer ────────────────────────────────────────────────────
        hat_toleranz = toleranz_mehr_km > 0
        if hat_toleranz and abweichung <= toleranz_mehr_km:
            return 0.0, False                                  # innerhalb Toleranz
        kosten = round(abweichung * mehr_cent / 100, 2)        # alle km berechnet
        return kosten, hat_toleranz                            # toleranz_ueberschritten nur wenn Toleranz gesetzt

    if abweichung < 0:
        # ── Minderkilometer ──────────────────────────────────────────────────
        minder_km = abs(abweichung)
        hat_toleranz = toleranz_minder_km > 0

        if hat_toleranz and minder_km <= toleranz_minder_km:
            return 0.0, False                                  # innerhalb Toleranz

        # Erstattungsfähige km = Überschuss über Toleranz, gedeckelt durch Grenze
        excess = minder_km - toleranz_minder_km if hat_toleranz else minder_km
        if minder_grenze_km > 0:
            erstattbar = min(excess, minder_grenze_km)
        else:
            erstattbar = excess                                # unbegrenzt

        erstattung = round(-(erstattbar * minder_cent / 100), 2)
        return erstattung, hat_toleranz

    return 0.0, False


# ---------------------------------------------------------------------------
# Coordinator
# ---------------------------------------------------------------------------

class LeasingKmCoordinator(DataUpdateCoordinator[LeasingKmData]):

    def __init__(self, hass: HomeAssistant, entry: ConfigEntry) -> None:
        super().__init__(
            hass, _LOGGER, name=DOMAIN,
            update_interval=timedelta(minutes=UPDATE_INTERVAL_MINUTES),
        )
        self.entry = entry

    async def _async_update_data(self) -> LeasingKmData:
        cfg = _get_cfg(self.entry)

        start     = date.fromisoformat(cfg[CONF_START_DATE])
        laufzeit  = int(cfg[CONF_LAUFZEIT])
        km_gesamt = float(cfg[CONF_KM_GESAMT])
        km_entity = cfg[CONF_KM_ENTITY]

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

        today      = date.today()
        vertr_end  = _add_months(start, laufzeit)
        total_days = (vertr_end - start).days
        elapsed    = (today - start).days

        if elapsed <= 0:
            raise UpdateFailed("Startdatum liegt in der Zukunft – noch keine Auswertung möglich.")
        if total_days <= 0:
            raise UpdateFailed("Laufzeit ergibt 0 Tage – bitte Startdatum und Laufzeit prüfen.")

        soll_day = km_gesamt / total_days
        ist_day  = km_aktuell / elapsed

        soll_heute = soll_day * elapsed
        diff_heute = km_aktuell - soll_heute

        mon_end  = date(today.year, today.month,
                        calendar.monthrange(today.year, today.month)[1])
        soll_mon = soll_day * (mon_end - start).days
        diff_mon = km_aktuell - soll_mon

        year_end   = date(today.year, 12, 31)
        d_to_year  = (year_end - today).days
        verbl_jahr = soll_day * d_to_year
        prog_jahr  = km_aktuell + ist_day * d_to_year

        d_to_end  = max(0, (vertr_end - today).days)
        verbl_end = soll_day * d_to_end
        prog_end  = km_aktuell + ist_day * d_to_end

        jahres_soll = km_gesamt / (laufzeit / 12)
        jahres_over = (ist_day * 365) > jahres_soll
        ende_over   = prog_end > km_gesamt

        # --- Kostenberechnung (optional) ------------------------------------
        abweichung_end = round(prog_end - km_gesamt, 1)
        kosten_aktiv   = bool(cfg.get(CONF_KOSTEN_AKTIV, False))
        kosten_prognose: float | None = None
        toleranz_ueberschritten = False

        if kosten_aktiv:
            kosten_prognose, toleranz_ueberschritten = _calc_kosten(
                abweichung        = abweichung_end,
                mehr_cent         = float(cfg.get(CONF_MEHR_CENT, 0)),
                minder_cent       = float(cfg.get(CONF_MINDER_CENT, 0)),
                toleranz_mehr_km  = float(cfg.get(CONF_TOLERANZ_MEHR_KM, 0)),
                toleranz_minder_km= float(cfg.get(CONF_TOLERANZ_MINDER_KM, 0)),
                minder_grenze_km  = float(cfg.get(CONF_MINDER_GRENZE_KM, 0)),
            )

        return LeasingKmData(
            km_aktuell              = round(km_aktuell, 1),
            km_gesamt               = round(km_gesamt, 1),
            ist_day                 = round(ist_day, 2),
            soll_day                = round(soll_day, 2),
            soll_heute              = round(soll_heute, 1),
            diff_heute              = round(diff_heute, 1),
            soll_monatsende         = round(soll_mon, 1),
            diff_monatsende         = round(diff_mon, 1),
            verbl_jahresende        = round(verbl_jahr, 1),
            verbl_laufzeitende      = round(verbl_end, 1),
            noch_erlaubt            = round(max(0.0, km_gesamt - km_aktuell), 1),
            prog_jahresende         = round(prog_jahr, 1),
            prog_laufzeitende       = round(prog_end, 1),
            abweichung_laufzeitende = abweichung_end,
            km_pct                  = round(min((km_aktuell / km_gesamt) * 100, 100.0), 1),
            lauf_pct                = round(min((elapsed / total_days) * 100, 100.0), 1),
            jahres_soll             = round(jahres_soll, 1),
            jahres_over             = jahres_over,
            ende_over               = ende_over,
            is_over_soll            = diff_heute > 0,
            kosten_aktiv            = kosten_aktiv,
            kosten_prognose         = kosten_prognose,
            toleranz_ueberschritten = toleranz_ueberschritten,
            vertragsende            = vertr_end.isoformat(),
            elapsed_days            = elapsed,
            total_days              = total_days,
        )
