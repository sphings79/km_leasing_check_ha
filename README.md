# 🚗 Leasing KM-Rechner – Home Assistant Integration

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://github.com/hacs/integration)
[![HA Version](https://img.shields.io/badge/Home%20Assistant-2026.4%2B-blue)](https://www.home-assistant.io/)

Eine Home-Assistant-Integration zur Überwachung des Kilometerstands bei Leasingfahrzeugen.  
Sie vergleicht den tatsächlichen Kilometerstand mit dem vertraglich erlaubten Soll-Wert, berechnet Restkilometer und erstellt eine Prognose für Jahres- und Laufzeitende.

---

## ✨ Features

- **Soll-Ist-Vergleich** – täglich und zum Monatsende
- **Restkilometer** – bis Jahresende und bis Laufzeitende (Soll-Basis)
- **Prognose** – Hochrechnung des Kilometerstands bei aktuellem Fahrtempo
- **Binärsensoren** – sofortige Warnung bei drohender Überschreitung
- **Live-Update** – aktualisiert sich sofort, wenn die Kilometerstands-Entität einen neuen Wert bekommt
- **Konfigurierbar** – alle Parameter über die UI änderbar (kein YAML nötig)
- **Vollständig lokale Verarbeitung** – keine externen APIs, keine Cloud

---

## 📋 Voraussetzungen

| Anforderung | Details |
|---|---|
| Home Assistant | 2026.4 oder neuer |
| HACS | für komfortable Installation (optional) |
| Kilometerstands-Entität | ein `sensor` oder `input_number`, der den aktuellen Tachostand in **km** liefert |

Typische Quellen für die Kilometerstands-Entität:
- Fahrzeug-Integrationen (BMW Connected Drive, Tesla, Volkswagen We Connect, Skoda Connect …)
- OBD-II-Adapter (z. B. über MQTT oder der `obd`-Integration)
- Manueller `input_number`-Helfer (für manuelle Eingabe)

---

## 🚀 Installation

### Option A – HACS (empfohlen)

1. HACS öffnen → **Integrationen** → Drei-Punkte-Menü → **Benutzerdefinierte Repositories**
2. URL dieses Repos eintragen, Kategorie **Integration** wählen → **Hinzufügen**
3. Integration „Leasing KM-Rechner" suchen und installieren
4. Home Assistant neu starten

### Option B – Manuell

1. Den Ordner `custom_components/leasing_km` aus diesem Repository herunterladen
2. In `config/custom_components/leasing_km` auf dem HA-Host kopieren
3. Home Assistant neu starten

---

## ⚙️ Einrichtung

1. **Einstellungen → Integrationen → + Integration hinzufügen → „Leasing KM-Rechner"**
2. Im Setup-Dialog ausfüllen:

| Feld | Beschreibung | Beispiel |
|---|---|---|
| **Vertragsbeginn** | Erster Tag des Leasingvertrags | `01.11.2023` |
| **Laufzeit (Monate)** | Vertragsdauer in Monaten | `48` |
| **Gesamtlaufleistung (km)** | Im Vertrag enthaltene Kilometer | `80000` |
| **Kilometerstands-Entität** | Sensor/input_number mit dem aktuellen Tachostand | `sensor.auto_kilometerstand` |

3. **Speichern** – alle Entitäten werden sofort angelegt.

Einstellungen lassen sich jederzeit über das **Zahnrad-Icon** der Integration ändern.

---

## 📊 Entitäten

Alle Entitäten erscheinen unter einem gemeinsamen **Gerät** mit dem Namen des Leasingvertrags.

### Sensoren (numerisch)

| Entität | Beschreibung | Einheit |
|---|---|---|
| `sensor.…_tagesleistung_ist` | Tatsächlicher Tagesdurchschnitt seit Vertragsbeginn | km |
| `sensor.…_tagesleistung_soll` | Vertraglich erlaubter Tagesdurchschnitt | km |
| `sensor.…_soll_km_heute` | Erwarteter Kilometerstand zum heutigen Tag | km |
| `sensor.…_differenz_heute` | Abweichung vom Tages-Soll (+ = über, − = unter) | km |
| `sensor.…_soll_km_monatsende` | Erwarteter Kilometerstand am Monatsende | km |
| `sensor.…_differenz_monatsende` | Abweichung vom Monats-Soll | km |
| `sensor.…_verbleibend_bis_jahresende` | Noch erlaubte Soll-KM bis 31.12. | km |
| `sensor.…_verbleibend_bis_laufzeitende` | Noch erlaubte Soll-KM bis Vertragsende | km |
| `sensor.…_noch_erlaubt_gesamt` | Absolut verbleibende KM bis zum Limit | km |
| `sensor.…_km_limit_pro_jahr` | Jährliches KM-Kontingent laut Vertrag | km |
| `sensor.…_prognose_jahresende` | Hochgerechneter KM-Stand am 31.12. | km |
| `sensor.…_prognose_laufzeitende` | Hochgerechneter KM-Stand am Vertragsende | km |
| `sensor.…_km_absolviert` | Verbrauchte KM in Prozent des Gesamtlimits | % |
| `sensor.…_laufzeit_absolviert` | Verstrichene Laufzeit in Prozent | % |

### Binärsensoren (Ja/Nein)

| Entität | Beschreibung | `on` bedeutet |
|---|---|---|
| `binary_sensor.…_ueber_soll` | Aktuell über dem Tages-Soll | Zu viel gefahren |
| `binary_sensor.…_jahres_km_prognose_ueberschritten` | Jährliches KM-Limit wird bei aktuellem Tempo überschritten | Warnung |
| `binary_sensor.…_laufzeit_km_prognose_ueberschritten` | Gesamtlimit wird bei aktuellem Tempo überschritten | Warnung |

---

## 🔄 Update-Verhalten

- Automatische Aktualisierung alle **30 Minuten**
- **Sofortiges Update**, sobald die Kilometerstands-Entität einen neuen Wert meldet
- Manuelle Aktualisierung jederzeit über **Einstellungen → Integrationen → Neu laden**

---

## 💡 Beispiele

### Automation: Benachrichtigung bei Überschreitung

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
          title: "⚠️ Leasing KM-Warnung"
          message: >
            Prognose Laufzeitende: {{ states('sensor.leasing_prognose_laufzeitende') }} km
            (Limit: {{ states('sensor.leasing_km_limit_pro_jahr') | float * (states('sensor.leasing_laufzeit_absolviert') | float / 100 * 4) | round(0) }} km)
```

### Dashboard-Karte (Entities Card)

```yaml
type: entities
title: Leasing KM-Übersicht
entities:
  - sensor.leasing_differenz_heute
  - sensor.leasing_prognose_laufzeitende
  - sensor.leasing_noch_erlaubt_gesamt
  - sensor.leasing_km_absolviert
  - binary_sensor.leasing_ueber_soll
  - binary_sensor.leasing_laufzeit_km_prognose_ueberschritten
```

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

## 🔧 Mehrere Fahrzeuge

Die Integration unterstützt mehrere Instanzen. Für jedes Leasingfahrzeug einfach eine weitere Instanz über **„+ Integration hinzufügen"** anlegen – jede bekommt ein eigenes Gerät und eigene Entitäten.

---

## 📐 Berechnungsgrundlagen

| Wert | Formel |
|---|---|
| Soll-KM/Tag | `km_gesamt ÷ Vertrags-Gesamttage` |
| Ist-KM/Tag | `aktueller_km ÷ vergangene Tage` |
| Soll-KM heute | `Soll-KM/Tag × vergangene Tage` |
| Differenz | `aktueller_km − Soll-KM heute` |
| Prognose | `aktueller_km + (Ist-KM/Tag × verbleibende Tage)` |
| Verbleibend (Soll) | `Soll-KM/Tag × verbleibende Tage` |

---

## 📝 Changelog

### 1.0.0
- Erstveröffentlichung
- 14 Sensoren + 3 Binärsensoren
- Config Flow mit Datum-, Zahlen- und Entitäts-Picker
- Options Flow und Reconfigure-Unterstützung
- Live-Update bei Zustandsänderung der Kilometerstands-Entität
- Deutsche und englische UI-Übersetzung

---

## 📄 Lizenz

MIT License – siehe [LICENSE](LICENSE)
