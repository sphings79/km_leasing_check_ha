import type { Hass, Instance } from "./types";

export const INTEGRATION = "leasing_km";

/**
 * Entity keys the card reads. They double as the suffix of the generated
 * entity ids, which is the fallback when the entity registry does not expose a
 * translation key.
 */
export const KEYS = [
  "km_driven",
  "daily_actual",
  "daily_target",
  "daily_actual_30d",
  "daily_actual_90d",
  "target_today",
  "deviation_today",
  "target_month_end",
  "deviation_month_end",
  "contract_year_driven",
  "contract_year_deviation",
  "contract_year_allowance",
  "annual_allowance",
  "remaining_contract_year",
  "remaining_calendar_year",
  "remaining_contract_end",
  "remaining_total",
  "forecast_contract_year_end",
  "forecast_calendar_year_end",
  "forecast_contract_end",
  "forecast_deviation_contract_end",
  "mileage_used",
  "contract_elapsed",
  "contract_end_date",
  "days_remaining",
  "above_target",
  "annual_forecast_exceeded",
  "contract_forecast_exceeded",
] as const;

// Longest first, so `daily_actual_30d` never matches as `daily_actual`.
const BY_LENGTH = [...KEYS].sort((a, b) => b.length - a.length);

function keyOf(entityId: string, translationKey?: string): string | undefined {
  if (translationKey && (KEYS as readonly string[]).includes(translationKey)) {
    return translationKey;
  }
  return BY_LENGTH.find((key) => entityId.endsWith(`_${key}`));
}

function deviceLabel(hass: Hass, deviceId: string): string {
  const device = hass.devices?.[deviceId];
  return device?.name_by_user || device?.name || deviceId;
}

/** Find every leasing contract set up in Home Assistant, one per device. */
export function discover(hass: Hass): Instance[] {
  const found = new Map<string, Instance>();

  for (const entry of Object.values(hass.entities ?? {})) {
    if (entry.platform !== INTEGRATION || !entry.device_id) continue;
    const key = keyOf(entry.entity_id, entry.translation_key);
    if (!key) continue;

    let instance = found.get(entry.device_id);
    if (!instance) {
      instance = {
        deviceId: entry.device_id,
        label: deviceLabel(hass, entry.device_id),
        entities: {},
      };
      found.set(entry.device_id, instance);
    }
    instance.entities[key] = entry.entity_id;
  }

  return [...found.values()].sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Resolve the instance a card config points at. Version 1 of the card stored
 * an entity id prefix instead of a device, which is still accepted.
 */
export function resolve(
  hass: Hass,
  config: { device_id?: string; entity_prefix?: string },
): Instance | undefined {
  const instances = discover(hass);
  if (config.device_id) {
    return instances.find((i) => i.deviceId === config.device_id);
  }
  if (config.entity_prefix) {
    const prefix = `sensor.${config.entity_prefix}_`;
    return instances.find((i) =>
      Object.values(i.entities).some((id) => id.startsWith(prefix)),
    );
  }
  return instances[0];
}
