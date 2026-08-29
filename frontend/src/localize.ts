import type { Hass } from "./types";
import de from "./translations/de.json";
import en from "./translations/en.json";

type Catalog = Record<string, string>;

const CATALOGS: Record<string, Catalog> = { en, de };

/** Resolve the Home Assistant UI language to one the card ships. */
export function language(hass?: Hass): string {
  const raw = hass?.locale?.language || hass?.language || "en";
  const short = raw.toLowerCase().split("-")[0];
  return short in CATALOGS ? short : "en";
}

/** Translate `key`, substituting {placeholders} from `vars`. */
export function localize(
  lang: string,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const catalog = CATALOGS[lang] ?? CATALOGS.en;
  let out = catalog[key] ?? CATALOGS.en[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      out = out.split(`{${name}}`).join(String(value));
    }
  }
  return out;
}

/** Locale used for number and date formatting. */
export function locale(hass?: Hass): string {
  return hass?.locale?.language || hass?.language || "en";
}
