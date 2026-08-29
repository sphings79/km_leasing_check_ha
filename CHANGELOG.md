# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.1] - 2026-08-29

Documentation only. The integration itself is unchanged from 2.1.0.

### Fixed

- The illustrations showed the state before the cost calculation: the card preview had no
  settlement section, the setup dialog was missing the switch that opens it, and the entity
  overview stopped before the four entities it adds.
- The footnote under the entity overview ran off the canvas in German.

## [2.1.0] - 2026-08-29

### Added

- **Cost calculation.** Switching it on opens a second setup step for the settlement terms of the
  contract: the charge for extra kilometres, the refund for unused ones, a tolerance for each and
  an upper limit on the refund.
- **How a tolerance is applied is selectable**, separately for extra and unused kilometres,
  because contracts differ: either every kilometre is settled once the tolerance is passed, or
  only the kilometres beyond it. The difference between the two is 225.09 against 0.09 on a
  2,501 kilometre overrun at nine hundredths per kilometre.
- Three sensors and one status flag: the forecast settlement at contract end, what it would cost
  if the target line is followed from today on, the kilometres left before the tolerance is used
  up, and a flag for the forecast passing that tolerance.
- The card gained a settlement section, with amounts formatted in the currency Home Assistant is
  configured with, and a fourth status pill.

## [2.0.0] - 2026-08-29

A rewrite around one correction: mileage is now measured against the odometer reading at the start
of the contract, not against the raw odometer. Existing contracts are migrated automatically.

### Added

- **Odometer reading at contract start.** Until now every calculation assumed the odometer stood
  at zero on day one, which is wrong for every used car and every contract taken over.
- **Contract years**, rolling from the contract start date rather than from January, with the
  mileage driven and the deviation within the running year.
- **Forecast basis**: the whole contract average as before, or the last 30 or 90 days, which
  reacts to a change in driving habits.
- **Reminder for a manually kept odometer.** When an `input_number` is used, a repair notice can
  appear after 7, 14 or 30 days without a change, with a field to enter the current reading.
- **The Lovelace card ships with the integration**, is served by it and registers its own resource.
  It was previously a separate repository, `sphings79/leasing_km_card`.
- Nine more languages: Czech, Danish, Dutch, French, Italian, Polish, Portuguese, Spanish and
  Swedish, next to English and German.
- New sensors for the mileage driven, the contract year figures, the expected difference at
  contract end, and, disabled by default, the windowed averages, the calendar year figures, the
  contract end date, the days remaining and the days since the last odometer update.
- Brand assets under `custom_components/leasing_km/brand/`.

### Changed

- **Entity ids are language independent.** `sensor.…_km_absolviert` became
  `sensor.…_mileage_used`. Home Assistant renames them during the upgrade and raises a repair
  issue listing every change. Ids you renamed yourself are left alone.
- **Overruns are visible.** `mileage_used` may exceed 100 % and `remaining_total` may go negative
  instead of both stopping at the limit.
- Mileage entities carry the `distance` device class and take their unit from the odometer entity,
  so a contract stated in miles works natively.
- An unavailable odometer no longer takes the calculated values down with it: the last known
  reading is kept and the targets keep moving on.
- A reading below the last known one is ignored and logged, so a vehicle integration briefly
  reporting zero does not wipe the averages.
- A contract whose start date lies in the future sets up and reports zero instead of failing.
- Monthly, calendar year and contract year figures are capped at the contract end.
- Dates are evaluated in the Home Assistant timezone instead of the system timezone.
- The options flow is gone; everything is edited through **Reconfigure**.
- The contract is named by you, and that name becomes the device name.
- Log messages are in English; user facing text is translated.

### Fixed

- The annual warning compares the running contract year against that year's allowance rather than
  extrapolating the lifetime average across a calendar year.
- Reconfiguring no longer leaves stale values behind: version 1 kept editing the options while the
  data still held the original values, and the options silently won.
- Duplicate contracts on the same odometer entity and start date are rejected.

## [1.1.0] - never released

Present on `main` but never tagged as a release, so HACS users never received it. The changes are
part of 2.0.0.

### Added

- English and German translations of the entity names.
- README illustrations, English as the primary README.

## [1.0.1] - 2026-04-28

### Added

- Icons for all entities.

## [1.0.0] - 2026-04-27

First release: fourteen sensors and three binary sensors for target versus actual, remaining
mileage and a forecast to the end of the contract.

[2.1.1]: https://github.com/sphings79/leasing-km-home-assistant/releases/tag/v2.1.1
[2.1.0]: https://github.com/sphings79/leasing-km-home-assistant/releases/tag/v2.1.0
[2.0.0]: https://github.com/sphings79/leasing-km-home-assistant/releases/tag/v2.0.0
[1.0.1]: https://github.com/sphings79/leasing-km-home-assistant/releases/tag/v1.0.1
[1.0.0]: https://github.com/sphings79/leasing-km-home-assistant/releases/tag/v1.0.0
