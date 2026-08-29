import type { Hass } from "./types";
import en from "./translations/en.json";

type Catalog = Record<string, string>;

/**
 * The catalogs are loaded on demand: only English is part of the bundle, every
 * other language is a chunk of its own that the browser fetches once the UI
 * language is known.
 */
const LOADERS = import.meta.glob<{ default: Catalog }>([
  "./translations/*.json",
  "!./translations/en.json",
]);

const loaded: Record<string, Catalog> = { en };

const path = (lang: string) => `./translations/${lang}.json`;

export const LANGUAGES = [
  "en",
  ...Object.keys(LOADERS).map((file) =>
    file.slice("./translations/".length, -".json".length),
  ),
].sort();

/** Resolve the Home Assistant UI language to one the card ships. */
export function language(hass?: Hass): string {
  const raw = hass?.locale?.language || hass?.language || "en";
  const short = raw.toLowerCase().split("-")[0];
  return LANGUAGES.includes(short) ? short : "en";
}

/**
 * Make sure the catalog for `lang` is available. Resolves to true when
 * something new was loaded and the caller should render again.
 */
export async function ensureCatalog(lang: string): Promise<boolean> {
  if (loaded[lang] || !LOADERS[path(lang)]) return false;
  try {
    loaded[lang] = (await LOADERS[path(lang)]()).default;
    return true;
  } catch {
    // Keep running in English rather than breaking the card over a language.
    return false;
  }
}

/** Translate `key`, substituting {placeholders} from `vars`. */
export function localize(
  lang: string,
  key: string,
  vars?: Record<string, string | number>,
): string {
  const catalog = loaded[lang] ?? loaded.en;
  let out = catalog[key] ?? loaded.en[key] ?? key;
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
