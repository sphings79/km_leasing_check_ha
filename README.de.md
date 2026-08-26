<div align="center">

<img src="assets/banner.svg" alt="Leasing KM-Rechner — Home-Assistant-Integration zur Überwachung der Leasing-Kilometer" width="100%">

# Leasing KM-Rechner für Home Assistant

**Monate im Voraus wissen, ob das Leasingfahrzeug über die vereinbarte Laufleistung fährt — und um wie viel.**

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=flat-square)](https://hacs.xyz)
[![License: MIT](https://img.shields.io/badge/license-MIT-3DDC97.svg?style=flat-square)](LICENSE)
[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2026.4%2B-41BDF5.svg?style=flat-square)](https://www.home-assistant.io)
[![Lokal](https://img.shields.io/badge/lokal-ohne%20Cloud-3DDC97.svg?style=flat-square)](#datenschutz)

[English](README.md) · **Deutsch**

</div>

---

## Was diese Integration macht

Ein Leasingvertrag gibt eine feste Kilometerzahl über eine feste Laufzeit vor — zum Beispiel
80.000 km über 48 Monate. Jeder Kilometer darüber wird am Ende abgerechnet, meist pro Kilometer,
und dann lässt sich nichts mehr daran ändern.

Diese Custom-Integration für [Home Assistant](https://www.home-assistant.io) nimmt die
Vertragsdaten und eine Kilometerstands-Entität und beantwortet fortlaufend drei Fragen:

- **Wo müsste ich heute stehen?** Der vertragliche Soll-Kilometerstand für das heutige Datum und
  wie weit man tatsächlich darüber oder darunter liegt.
- **Wo lande ich?** Eine Prognose des Kilometerstands zum Jahresende und zum Vertragsende,
  hochgerechnet aus dem bisher gefahrenen Tempo.
- **Wie viel ist noch übrig?** Restkilometer bis Jahresende und bis Vertragsende — sowohl auf
  Soll-Basis als auch absolut gegen das Vertragslimit.

Angelegt werden **14 Sensoren** und **3 Binärsensoren** auf einem Gerät. Die Binärsensoren sind
das, worauf man Automationen baut: Sie schalten ein, sobald das aktuelle Tempo eine
Überschreitung erwarten lässt.

Alles wird lokal aus Daten berechnet, die ohnehin in Home Assistant liegen. Keine API, kein
Konto, kein Cloud-Dienst.

---

## Ansichten

> Die folgenden Bilder sind Illustrationen der Dialoge, keine Fotos einer laufenden Instanz.

<div align="center">
<img src="assets/setup.de.svg" alt="Home-Assistant-Einrichtungsdialog des Leasing KM-Rechners: Vertragsbeginn, Laufzeit, Gesamtlaufleistung und Kilometerstands-Entität" width="70%">
</div>

Vier Felder, komplett in der UI — kein YAML. Die Kilometerstands-Entität wird aus einer Auswahl
der vorhandenen Sensoren gewählt.

<div align="center">
<img src="assets/entities.svg" alt="Geräteseite in Home Assistant mit den Entitäten des Leasing KM-Rechners" width="70%">
</div>

Alle Entitäten hängen an einem Gerät mit dem Vertragsnamen — ein zweites Leasingfahrzeug bleibt
damit sauber vom ersten getrennt.

---

## Voraussetzungen

| Anforderung | Details |
|---|---|
| Home Assistant | 2026.4 oder neuer |
| HACS | Optional, für komfortable Installation und Updates |
| Kilometerstands-Entität | Ein `sensor` oder `input_number` mit dem aktuellen Tachostand **in km** |

Die Kilometerstands-Entität ist das Einzige, was die Integration nicht selbst erzeugen kann.
Übliche Quellen:

- **Fahrzeug-Integrationen** — BMW Connected Drive, Tesla, Volkswagen We Connect, Skoda Connect,
  Mercedes me, Renault, Kia/Hyundai Bluelink und andere liefern einen Kilometerstands-Sensor.
- **OBD-II-Adapter** — über die `obd`-Integration oder eine MQTT-Brücke.
- **Ein manueller `input_number`-Helfer** — völlig ausreichend, wenn man den Tachostand alle paar
  Wochen einträgt. Die Prognose wird genauer, je öfter man aktualisiert, tägliche Werte braucht
  sie aber nicht.

---

## Installation

### Variante A — HACS (empfohlen)

1. HACS öffnen → **Integrationen** → Drei-Punkte-Menü → **Benutzerdefinierte Repositories**
2. URL dieses Repositories eintragen, Kategorie **Integration** → **Hinzufügen**
3. Nach **„Leasing KM-Rechner“** suchen und installieren
4. Home Assistant neu starten

### Variante B — manuell

1. Den Ordner `custom_components/leasing_km` aus diesem Repository herunterladen
2. Nach `config/custom_components/leasing_km` auf dem Home-Assistant-Host kopieren
3. Home Assistant neu starten

---

## Einrichtung

1. **Einstellungen → Geräte & Dienste → + Integration hinzufügen → „Leasing KM-Rechner“**
2. Dialog ausfüllen:

| Feld | Bedeutung | Beispiel |
|---|---|---|
| **Vertragsbeginn** | Erster Tag des Leasingvertrags | `01.11.2023` |
| **Laufzeit (Monate)** | Vertragsdauer in Monaten | `48` |
| **Gesamtlaufleistung (km)** | Im Vertrag enthaltene Kilometer | `80000` |
| **Entität für aktuellen Kilometerstand** | Sensor oder `input_number` mit dem Tachostand | `sensor.auto_kilometerstand` |

3. **Bestätigen** — alle Entitäten werden sofort angelegt.

Alle vier Werte lassen sich später über das **Zahnrad-Symbol** der Integration ändern; die
Entitäten behalten ihre IDs und ihre Historie.

> **Hinweis zur Sprache.** Sowohl der Einrichtungsdialog als auch die **Entitätsnamen** folgen der
> Sprache von Home Assistant, auf Deutsch und Englisch. Die Entitäts-**IDs** sind bewusst fest und
> ändern sich mit der Sprache nicht — sie bleiben die unten aufgeführten deutschen IDs. Dashboards,
> Automationen und die [passende Karte](https://github.com/sphings79/leasing_km_card) laufen also
> beim Sprachwechsel unverändert weiter.

---

## Entitäten

Alle Entitäten liegen auf einem Gerät mit dem Vertragsnamen. Das `…` in den folgenden IDs ist der
Slug dieses Gerätenamens — bei einem Gerät namens *Leasing VW Golf* wird aus
`sensor.…_differenz_heute` also `sensor.leasing_vw_golf_differenz_heute`.

### Sensoren

| Entität | Was sie aussagt | Einheit |
|---|---|---|
| `sensor.…_tagesleistung_ist` | Tatsächlicher Tagesdurchschnitt seit Vertragsbeginn | km |
| `sensor.…_tagesleistung_soll` | Vertraglich erlaubter Tagesdurchschnitt | km |
| `sensor.…_soll_km_heute` | Kilometerstand, auf dem man heute stehen *sollte* | km |
| `sensor.…_differenz_heute` | Abweichung vom Tages-Soll (+ = darüber, − = darunter) | km |
| `sensor.…_soll_km_monatsende` | Soll-Kilometerstand am Monatsende | km |
| `sensor.…_differenz_monatsende` | Abweichung vom Monats-Soll | km |
| `sensor.…_verbleibend_bis_jahresende` | Noch verfügbare Soll-Kilometer bis 31. Dezember | km |
| `sensor.…_verbleibend_bis_laufzeitende` | Noch verfügbare Soll-Kilometer bis Vertragsende | km |
| `sensor.…_noch_erlaubt_gesamt` | Absolut verbleibende Kilometer bis zum Vertragslimit | km |
| `sensor.…_km_limit_pro_jahr` | Jährliches Kilometerkontingent laut Vertrag | km |
| `sensor.…_prognose_jahresende` | Hochgerechneter Kilometerstand am 31. Dezember | km |
| `sensor.…_prognose_laufzeitende` | Hochgerechneter Kilometerstand am Vertragsende | km |
| `sensor.…_km_absolviert` | Anteil des Gesamtkontingents, der verbraucht ist | % |
| `sensor.…_laufzeit_absolviert` | Anteil der Laufzeit, der verstrichen ist | % |

Der Vergleich dieser beiden letzten Werte ist die schnellste Kontrolle überhaupt: Solange
**KM absolviert** unter **Laufzeit absolviert** liegt, fährt man im Rahmen des Vertrags.

### Binärsensoren

| Entität | `an` bedeutet |
|---|---|
| `binary_sensor.…_ueber_soll` | Aktuell über dem Tages-Soll — bisher zu viel gefahren |
| `binary_sensor.…_jahres_km_prognose_ueberschritten` | Beim aktuellen Tempo wird das Jahreskontingent überschritten |
| `binary_sensor.…_laufzeit_km_prognose_ueberschritten` | Beim aktuellen Tempo wird das Gesamtlimit überschritten |

Der erste reagiert auf die Momentaufnahme von heute; die beiden anderen sind Prognosen — und die
sind es wert, eine Benachrichtigung auszulösen.

---

## Aktualisierung

- Automatisch alle **30 Minuten**
- **Sofort**, sobald die Kilometerstands-Entität einen neuen Wert meldet
- Manuell über **Einstellungen → Geräte & Dienste → Neu laden**

Da es sich um reine Rechenoperationen auf bereits vorhandenen Werten handelt, kostet eine
Aktualisierung praktisch nichts — es ist keine Netzwerkanfrage beteiligt.

---

## Beispiele

### Automation: Benachrichtigung bei drohender Überschreitung

```yaml
automation:
  - alias: "Leasing KM Warnung"
    trigger:
      - platform: state
        entity_id: binary_sensor.leasing_laufzeit_km_prognose_ueberschritten
        to: "on"
    action:
      - service: notify.notify
        data:
          title: "⚠️ Leasing-KM-Warnung"
          message: >
            Prognose Laufzeitende:
            {{ states('sensor.leasing_prognose_laufzeitende') }} km —
            aktuell {{ states('sensor.leasing_differenz_heute') }} km vom Soll entfernt.
```

### Dashboard: Entities-Karte

```yaml
type: entities
title: Leasing-Kilometer
entities:
  - sensor.leasing_differenz_heute
  - sensor.leasing_prognose_laufzeitende
  - sensor.leasing_noch_erlaubt_gesamt
  - sensor.leasing_km_absolviert
  - binary_sensor.leasing_ueber_soll
  - binary_sensor.leasing_laufzeit_km_prognose_ueberschritten
```

Für eine eigens gebaute Dashboard-Karte mit Gauge, Fortschrittsbalken und Prognose-Kacheln siehe
**[Leasing KM Card](https://github.com/sphings79/leasing_km_card)**.

### Template-Sensor: Ampelstatus

```yaml
template:
  - sensor:
      - name: "Leasing Status"
        state: >
          {% if is_state('binary_sensor.leasing_laufzeit_km_prognose_ueberschritten', 'on') %}
            Rot
          {% elif is_state('binary_sensor.leasing_ueber_soll', 'on') %}
            Gelb
          {% else %}
            Grün
          {% endif %}
        icon: >
          {% if is_state('binary_sensor.leasing_laufzeit_km_prognose_ueberschritten', 'on') %}
            mdi:alert-circle
          {% elif is_state('binary_sensor.leasing_ueber_soll', 'on') %}
            mdi:alert
          {% else %}
            mdi:check-circle
          {% endif %}
```

---

## Mehrere Fahrzeuge

Die Integration unterstützt mehrere Instanzen. Für jedes Leasingfahrzeug eine weitere über
**„+ Integration hinzufügen“** anlegen — jede Instanz bekommt ein eigenes Gerät, eigene Entitäten
und eigene Vertragsdaten.

---

## Berechnungsgrundlagen

| Wert | Formel |
|---|---|
| Soll-km/Tag | `km_gesamt ÷ Vertrags-Gesamttage` |
| Ist-km/Tag | `aktueller_km ÷ vergangene Tage` |
| Soll-km heute | `Soll-km/Tag × vergangene Tage` |
| Differenz | `aktueller_km − Soll-km heute` |
| Prognose | `aktueller_km + (Ist-km/Tag × verbleibende Tage)` |
| Verbleibend (Soll) | `Soll-km/Tag × verbleibende Tage` |

Das Modell geht bewusst von einem **konstanten Tagesdurchschnitt** aus, statt Saisonalität
abbilden zu wollen. Für einen Leasingvertrag ist das genau richtig: Es ist dieselbe lineare
Grundlage, die auch die Leasinggesellschaft verwendet, und die Prognose bleibt nachvollziehbar.
Das heißt allerdings auch, dass die Prognose in den ersten Wochen eines Vertrags stark schwankt —
eine einzelne lange Fahrt verschiebt den Tagesschnitt dann deutlich — und mit fortschreitender
Laufzeit ruhiger wird.

---

## Datenschutz

Alles läuft lokal in Home Assistant. Die Integration stellt **überhaupt keine Netzwerkanfragen** —
sie hat keine `requirements`, spricht keine API an und sendet nichts nach außen. Vertragsdaten und
Kilometerstand verlassen die eigene Instanz nicht.

---

## Häufige Fragen

**Brauche ich dafür eine Fahrzeug-Integration?**
Nein. Jede Entität mit einer Zahl in Kilometern genügt, auch ein `input_number`, den man von Hand
pflegt.

**Meine Kilometerstands-Entität liefert Meilen. Geht das?**
Nicht direkt — die Integration erwartet Kilometer. Einen Template-Sensor anlegen, der umrechnet
(`{{ states('sensor.odometer') | float * 1.609344 }}`), und die Integration darauf zeigen lassen.

**Was passiert, wenn die Kilometerstands-Entität kurz nicht verfügbar ist?**
Die letzten bekannten Werte bleiben stehen, und die Sensoren aktualisieren erst wieder, wenn eine
gültige Zahl vorliegt. Es werden keine Ausreißer in die Historie geschrieben.

**Kann ich einen Vertrag erfassen, der schon vor Jahren begonnen hat?**
Ja. Einfach den echten Vertragsbeginn eintragen; die vergangenen Tage ergeben sich daraus. Der
Ist-km/Tag-Wert stammt aus dem aktuellen Tachostand und stimmt daher ab der ersten Aktualisierung.

**Was, wenn die Laufleistung pro Jahr statt gesamt vereinbart ist?**
Den Gesamtwert eintragen — bei 3 Jahren mit 20.000 km/Jahr also `60000` und `36` Monate. Der
Sensor `sensor.…_km_limit_pro_jahr` meldet den Jahreswert dann zurück.

---

## Verwandte Projekte

- **[Leasing KM Card](https://github.com/sphings79/leasing_km_card)** — die passende
  Lovelace-Karte zu dieser Integration: Gauge, Fortschrittsbalken, Prognose-Kacheln und
  Status-Pills.
- **[Weitere Projekte und Tools](https://sphings-dev.de/)**

---

## Changelog

### 1.1.0
- **Entitätsnamen werden jetzt übersetzt**, auf Deutsch und Englisch, passend zur
  Home-Assistant-Sprache
- Entitäts-IDs sind fest verankert und hängen nicht mehr von der Oberflächensprache ab; bestehende
  Dashboards und Automationen bleiben unberührt

### 1.0.0
- Erstveröffentlichung
- 14 Sensoren und 3 Binärsensoren
- Config Flow mit Datums-, Zahlen- und Entitäts-Auswahl
- Options Flow und Reconfigure-Unterstützung
- Sofortige Aktualisierung bei Zustandsänderung der Kilometerstands-Entität
- Deutsche und englische Übersetzung des Einrichtungsdialogs

---

---

## Sponsor this project

Diese Tools entstehen in meiner Freizeit und bleiben kostenlos, quelloffen und cloudfrei.
Wenn dir eines davon einen Nachmittag gespart hat, kannst du mir [einen Kaffee ausgeben](https://buymeacoffee.com/sphings).

[![Buy Me A Coffee](https://img.shields.io/badge/Buy%20Me%20A%20Coffee-sphings-FFDD00?style=for-the-badge&logo=buymeacoffee&logoColor=000000)](https://buymeacoffee.com/sphings)

## Lizenz

MIT — siehe [LICENSE](LICENSE).
