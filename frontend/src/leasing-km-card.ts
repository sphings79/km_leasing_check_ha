import { LitElement, html, nothing, svg, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import { discover, resolve } from "./discovery";
import { ensureCatalog, language, locale, localize } from "./localize";
import { styles } from "./styles";
import type { CardConfig, Hass, HassEntity, Instance } from "./types";

import "./editor";

const VERSION = "2.1.2";

const ARC_START = 180;
const ARC_SWEEP = 180;
const UNAVAILABLE = ["unknown", "unavailable", ""];

function arc(cx: number, cy: number, r: number, from: number, to: number): string {
  const point = (deg: number) => {
    const rad = (deg * Math.PI) / 180;
    return `${cx + r * Math.cos(rad)} ${cy + r * Math.sin(rad)}`;
  };
  return `M ${point(from)} A ${r} ${r} 0 ${to - from > 180 ? 1 : 0} 1 ${point(to)}`;
}

const clamp = (value: number, low: number, high: number) =>
  Math.min(Math.max(value, low), high);

export class LeasingKmCard extends LitElement {
  static override styles = styles;

  @state() private _config!: CardConfig;
  @state() private _instance?: Instance;

  private _hass?: Hass;
  private _catalog?: string;

  static getConfigElement(): HTMLElement {
    return document.createElement("leasing-km-card-editor");
  }

  static getStubConfig(hass: Hass): Partial<CardConfig> {
    const [first] = hass ? discover(hass) : [];
    return { device_id: first?.deviceId };
  }

  set hass(hass: Hass) {
    const previous = this._hass;
    this._hass = hass;
    this._instance = resolve(hass, this._config ?? {});
    this._loadCatalog(language(hass));
    if (!previous || this._watchedChanged(previous, hass)) {
      this.requestUpdate();
    }
  }

  /** Fetch the catalog for the UI language and repaint once it is there. */
  private _loadCatalog(lang: string): void {
    if (lang === this._catalog) return;
    this._catalog = lang;
    void ensureCatalog(lang).then((loaded) => loaded && this.requestUpdate());
  }

  get hass(): Hass | undefined {
    return this._hass;
  }

  setConfig(config: CardConfig): void {
    this._config = { ...config };
    if (this._hass) {
      this._instance = resolve(this._hass, this._config);
    }
  }

  getCardSize(): number {
    return 10;
  }

  getGridOptions(): Record<string, number> {
    return { columns: 12, min_columns: 6, rows: 10, min_rows: 6 };
  }

  /**
   * Home Assistant hands the card a new `hass` object on every state change in
   * the system. Re-rendering only when one of the entities actually shown has
   * changed keeps a busy instance from repainting the card constantly.
   */
  private _watchedChanged(previous: Hass, next: Hass): boolean {
    if (!this._instance) return true;
    for (const entityId of Object.values(this._instance.entities)) {
      if (previous.states[entityId] !== next.states[entityId]) return true;
    }
    return false;
  }

  /** Contract metadata carried on the "contract elapsed" sensor. */
  private _meta<T>(name: string): T | undefined {
    return this._entity("contract_elapsed")?.attributes[name] as T | undefined;
  }

  private _entity(key: string): HassEntity | undefined {
    const entityId = this._instance?.entities[key];
    return entityId ? this._hass?.states[entityId] : undefined;
  }

  private _value(key: string): number | null {
    const entity = this._entity(key);
    if (!entity || UNAVAILABLE.includes(entity.state)) return null;
    const value = Number(entity.state);
    return Number.isFinite(value) ? value : null;
  }

  private _flag(key: string): boolean | null {
    const entity = this._entity(key);
    if (!entity || UNAVAILABLE.includes(entity.state)) return null;
    return entity.state === "on";
  }

  private _unit(key: string): string {
    return (this._entity(key)?.attributes.unit_of_measurement as string) ?? "";
  }

  private _number(value: number | null, digits = 0): string {
    if (value === null) return localize(language(this._hass), "unknown");
    return value.toLocaleString(locale(this._hass), {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
  }

  /** Format a settlement value in the currency the sensor reports. */
  private _money(key: string): string {
    const value = this._value(key);
    if (value === null) return localize(language(this._hass), "unknown");
    const currency = this._unit(key);
    try {
      return value.toLocaleString(locale(this._hass), {
        style: "currency",
        currency,
      });
    } catch {
      // An unusual currency code is better shown plainly than not at all.
      return `${this._number(value, 2)} ${currency}`.trim();
    }
  }

  /** Format a value with the unit of the entity it came from. */
  private _quantity(key: string, digits = 0, signed = false): string {
    const value = this._value(key);
    if (value === null) return localize(language(this._hass), "unknown");
    const sign = signed && value > 0 ? "+" : "";
    return `${sign}${this._number(value, digits)} ${this._unit(key)}`.trim();
  }

  override render(): TemplateResult | typeof nothing {
    const hass = this._hass;
    const lang = language(hass);
    if (!hass || !this._config) {
      return html`<ha-card
        ><div class="message">${localize(lang, "loading")}</div></ha-card
      >`;
    }
    if (!this._instance) {
      const known = discover(hass).length > 0;
      return html`<ha-card>
        <div class="message">
          ${known
            ? localize(lang, "missing")
            : html`${localize(lang, "noInstanceTitle")}<br />${localize(
                  lang,
                  "noInstanceBody",
                )}`}
        </div>
      </ha-card>`;
    }

    const used = this._value("mileage_used");
    const elapsed = this._value("contract_elapsed");
    const overTarget = this._flag("above_target") ?? false;
    const contractRisk = this._flag("contract_forecast_exceeded") ?? false;

    return html`
      <ha-card>
        ${this._renderHeader(lang, overTarget, contractRisk)}
        ${this._renderGauge(lang, used, elapsed, overTarget)}
        ${this._renderTargetActual(lang, overTarget)}
        ${this._config.show_contract_year === false
          ? nothing
          : this._renderContractYear(lang)}
        ${this._config.show_forecast === false
          ? nothing
          : this._renderForecast(lang, contractRisk)}
        ${this._renderRemaining(lang)}
        ${this._config.show_costs === false ? nothing : this._renderCosts(lang)}
        ${this._renderPills(lang, overTarget, contractRisk)}
      </ha-card>
    `;
  }

  private _renderHeader(
    lang: string,
    overTarget: boolean,
    contractRisk: boolean,
  ): TemplateResult {
    const end = this._meta<string>("contract_end");
    const endLabel = end
      ? new Date(end).toLocaleDateString(locale(this._hass))
      : localize(lang, "unknown");
    const badge = contractRisk
      ? { text: localize(lang, "badgeRisk"), cls: "bad" }
      : overTarget
        ? { text: localize(lang, "badgeOver"), cls: "warn" }
        : { text: localize(lang, "badgeOk"), cls: "good" };

    return html`
      <div class="header">
        <ha-icon icon="mdi:car-clock"></ha-icon>
        <div class="titles">
          <div class="title">${this._config.title || this._instance!.label}</div>
          <div class="subtitle">
            ${localize(lang, "contractEnd", { date: endLabel })}
          </div>
        </div>
        <span class="badge ${badge.cls}">${badge.text}</span>
      </div>
    `;
  }

  private _renderGauge(
    lang: string,
    used: number | null,
    elapsed: number | null,
    overTarget: boolean,
  ): TemplateResult {
    const shown =
      used === null
        ? 0
        : this._config.clamp_percent
          ? clamp(used, 0, 100)
          : used;
    const fill = clamp(used ?? 0, 0, 100);
    const target = clamp(elapsed ?? 0, 0, 100);
    const markerAngle = ((ARC_START + (target / 100) * ARC_SWEEP) * Math.PI) / 180;
    const colour = overTarget ? "var(--lkm-bad)" : "var(--lkm-ok)";

    return html`
      <svg class="gauge" viewBox="0 8 220 128" role="img">
        ${svg`
          <path class="gauge-track" d="${arc(110, 110, 88, ARC_START, 360)}" />
          <path
            class="gauge-fill"
            style="stroke: ${colour}"
            d="${arc(110, 110, 88, ARC_START, ARC_START + (fill / 100) * ARC_SWEEP)}"
          />
          <line
            class="gauge-marker"
            x1="${110 + 78 * Math.cos(markerAngle)}"
            y1="${110 + 78 * Math.sin(markerAngle)}"
            x2="${110 + 98 * Math.cos(markerAngle)}"
            y2="${110 + 98 * Math.sin(markerAngle)}"
          />
          <text class="gauge-value" x="110" y="100">${this._number(shown, 1)} %</text>
          <text class="gauge-sub" x="110" y="120">
            ${localize(lang, "gaugeSub", { p: this._number(elapsed, 1) })}
          </text>
          <text class="gauge-scale" x="22" y="128">0 %</text>
          <text class="gauge-scale" x="198" y="128">100 %</text>
        `}
      </svg>

      <div class="bar-wrap">
        <div class="bar target" style="width: ${target}%"></div>
        <div
          class="bar"
          style="width: ${fill}%; background: ${colour}"
        ></div>
      </div>
      <div class="bar-legend">
        <span>${localize(lang, "progressLabel")}</span>
        <span>${this._days(lang)}</span>
      </div>
    `;
  }

  private _days(lang: string): string {
    const elapsed = this._meta<number>("elapsed_days");
    const total = this._meta<number>("total_days");
    if (elapsed === undefined || total === undefined) return "";
    return localize(lang, "progressDays", {
      a: this._number(elapsed),
      b: this._number(total),
    });
  }

  private _renderTargetActual(lang: string, overTarget: boolean): TemplateResult {
    const monthOver = (this._value("deviation_month_end") ?? 0) > 0;
    const left = this._value("remaining_total");
    return html`
      <div class="section">${localize(lang, "sectionTargetActual")}</div>
      <div class="grid">
        ${this._tile(
          localize(lang, "mDeviationToday"),
          this._quantity("deviation_today", 0, true),
          localize(lang, "subTarget", { v: this._quantity("target_today") }),
          overTarget ? "bad" : "good",
        )}
        ${this._tile(
          localize(lang, "mDeviationMonth"),
          this._quantity("deviation_month_end", 0, true),
          localize(lang, "subTarget", { v: this._quantity("target_month_end") }),
          monthOver ? "bad" : "good",
        )}
        ${this._tile(
          localize(lang, "mDailyActual"),
          this._quantity("daily_actual", 1),
          localize(lang, "subTarget", { v: this._quantity("daily_target", 1) }),
        )}
        ${this._tile(
          localize(lang, "mRemainingTotal"),
          this._quantity("remaining_total"),
          localize(lang, "subUntilContractEnd"),
          left !== null && left < 0 ? "bad" : undefined,
        )}
      </div>
    `;
  }

  private _renderContractYear(lang: string): TemplateResult | typeof nothing {
    const driven = this._value("contract_year_driven");
    if (driven === null) return nothing;
    const deviation = this._value("contract_year_deviation");

    return html`
      <div class="section">
        ${localize(lang, "sectionContractYear", { n: this._contractYear() })}
      </div>
      <div class="grid">
        ${this._tile(
          localize(lang, "mContractYearDriven"),
          this._quantity("contract_year_driven"),
        )}
        ${this._tile(
          localize(lang, "mContractYearDeviation"),
          this._quantity("contract_year_deviation", 0, true),
          undefined,
          (deviation ?? 0) > 0 ? "bad" : "good",
        )}
      </div>
    `;
  }

  private _contractYear(): string {
    return String(this._meta<number>("contract_year") ?? "");
  }

  private _renderForecast(lang: string, risk: boolean): TemplateResult {
    const annualRisk = this._flag("annual_forecast_exceeded") ?? false;
    const deviation = this._value("forecast_deviation_contract_end");

    return html`
      <div class="section">${localize(lang, "sectionForecast")}</div>
      <div class="grid">
        ${this._tile(
          localize(lang, "mForecastContractYear"),
          this._quantity("forecast_contract_year_end"),
          localize(lang, annualRisk ? "overLimit" : "withinLimit"),
          annualRisk ? "bad" : "good",
        )}
        ${this._tile(
          localize(lang, "mForecastContractEnd"),
          this._quantity("forecast_contract_end"),
          localize(lang, risk ? "overLimit" : "withinLimit"),
          risk ? "bad" : "good",
        )}
        ${this._tile(
          localize(lang, "mForecastDeviation"),
          this._quantity("forecast_deviation_contract_end", 0, true),
          undefined,
          (deviation ?? 0) > 0 ? "bad" : "good",
        )}
      </div>
    `;
  }

  private _renderRemaining(lang: string): TemplateResult {
    return html`
      <div class="section">${localize(lang, "sectionRemaining")}</div>
      <div class="grid">
        ${this._tile(
          localize(lang, "mRemainingContractYear"),
          this._quantity("remaining_contract_year"),
        )}
        ${this._tile(
          localize(lang, "mRemainingContractEnd"),
          this._quantity("remaining_contract_end"),
        )}
      </div>
    `;
  }

  private _renderCosts(lang: string): TemplateResult | typeof nothing {
    const forecast = this._value("cost_forecast_contract_end");
    if (forecast === null) return nothing;
    const hint =
      forecast > 0 ? "costPay" : forecast < 0 ? "costRefund" : "costNone";
    const atTarget = this._value("cost_at_target_pace");

    return html`
      <div class="section">${localize(lang, "sectionCosts")}</div>
      <div class="grid">
        ${this._tile(
          localize(lang, "mCostForecast"),
          this._money("cost_forecast_contract_end"),
          localize(lang, hint),
          forecast > 0 ? "bad" : forecast < 0 ? "good" : undefined,
        )}
        ${this._tile(
          localize(lang, "mCostAtTarget"),
          this._money("cost_at_target_pace"),
          undefined,
          (atTarget ?? 0) > 0 ? "bad" : (atTarget ?? 0) < 0 ? "good" : undefined,
        )}
        ${this._tile(
          localize(lang, "mKmToTolerance"),
          this._quantity("km_to_excess_tolerance"),
        )}
      </div>
    `;
  }

  private _renderPills(
    lang: string,
    overTarget: boolean,
    risk: boolean,
  ): TemplateResult {
    const annualRisk = this._flag("annual_forecast_exceeded") ?? false;
    const pill = (bad: boolean, badKey: string, goodKey: string) => html`
      <span class="pill">
        <span class="dot ${bad ? "bad" : "good"}"></span>
        ${localize(lang, bad ? badKey : goodKey)}
      </span>
    `;
    const tolerance = this._flag("excess_tolerance_exceeded");
    return html`
      <div class="pills">
        ${pill(overTarget, "pillOverDaily", "pillUnderDaily")}
        ${pill(annualRisk, "pillYearRisk", "pillYearSafe")}
        ${pill(risk, "pillLimitExceeded", "pillLimitOk")}
        ${tolerance === null
          ? nothing
          : pill(tolerance, "pillToleranceExceeded", "pillToleranceOk")}
      </div>
    `;
  }

  private _tile(
    label: string,
    value: string,
    hint?: string,
    cls?: string,
  ): TemplateResult {
    return html`
      <div class="tile">
        <div class="label">${label}</div>
        <div class="value ${cls ?? ""}">${value}</div>
        ${hint ? html`<div class="hint">${hint}</div>` : nothing}
      </div>
    `;
  }
}

// Guarded so an installation that still has the standalone card from version 1
// does not break both of them with a duplicate definition.
if (!customElements.get("leasing-km-card")) {
  customElements.define("leasing-km-card", LeasingKmCard);
}

interface CustomCard {
  type: string;
  name: string;
  description: string;
  preview: boolean;
  documentationURL: string;
}
const registry = ((window as unknown as { customCards?: CustomCard[] }).customCards ??=
  []);
if (!registry.some((card) => card.type === "leasing-km-card")) {
  registry.push({
    type: "leasing-km-card",
    name: "Leasing KM Card",
    description:
      "Leasing mileage at a glance: gauge, target versus actual and forecast.",
    preview: true,
    documentationURL: "https://github.com/sphings79/leasing-km-home-assistant",
  });
}

console.info(
  `%c LEASING-KM-CARD %c v${VERSION} `,
  "background:#03a9f4;color:#fff;font-weight:600;padding:2px 6px;border-radius:3px 0 0 3px",
  "background:#333;color:#03a9f4;font-weight:600;padding:2px 6px;border-radius:0 3px 3px 0",
);
