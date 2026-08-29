/** The slice of the Home Assistant frontend object this card uses. */
export interface HassEntity {
  entity_id: string;
  state: string;
  attributes: Record<string, unknown>;
}

export interface HassEntityRegistryEntry {
  entity_id: string;
  device_id?: string | null;
  platform?: string;
  translation_key?: string;
}

export interface HassDevice {
  id: string;
  name?: string | null;
  name_by_user?: string | null;
}

export interface Hass {
  states: Record<string, HassEntity>;
  entities: Record<string, HassEntityRegistryEntry>;
  devices: Record<string, HassDevice>;
  language?: string;
  locale?: { language?: string };
}

export interface CardConfig {
  type: string;
  device_id?: string;
  /** Configuration written by version 1 of the card. */
  entity_prefix?: string;
  title?: string;
  clamp_percent?: boolean;
  show_contract_year?: boolean;
  show_forecast?: boolean;
}

/** One leasing contract discovered in Home Assistant. */
export interface Instance {
  deviceId: string;
  label: string;
  entities: Record<string, string>;
}
