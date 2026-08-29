# Leasing KM Calculator

Tells you whether your leased car is heading for its mileage limit, long before the contract ends.

Point it at any entity that holds an odometer reading — a vehicle integration, or an
`input_number` you keep yourself — and tell it when the contract started, how long it runs, how
many kilometres it includes and what the odometer read on day one. From there you get:

- **Target versus actual**: where you should be today and at the end of the month, and by how much
  you are off
- **Contract years** that roll from the contract start date, not from January
- **Forecasts** to the end of the contract year and to the last day of the contract, optionally
  based on the last 30 or 90 days instead of the whole contract average
- **Status flags** for automations, so you get a notification instead of a surprise at handover
- **A Lovelace card**, included and registered automatically

Everything is calculated locally. The integration makes no network requests at all, has no
`requirements` and needs no account.

Typing the odometer in by hand? The integration can watch that entity and raise a repair notice
after 7, 14 or 30 days without a change — with a field to enter the current reading right there.

Available in Czech, Danish, Dutch, English, French, German, Italian, Polish, Portuguese, Spanish
and Swedish.

## Disclaimer

A community project, not affiliated with or endorsed by any leasing company or manufacturer. The
figures are an estimate from a linear model, not a legal statement about your contract.
