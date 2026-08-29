import { LitElement, html, nothing, type TemplateResult } from "lit";
import { state } from "lit/decorators.js";

import { INTEGRATION } from "./discovery";
import { language, localize } from "./localize";
import type { CardConfig, Hass } from "./types";

interface FormSchemaItem {
  name: string;
  required?: boolean;
  selector: Record<string, unknown>;
}

const SCHEMA: FormSchemaItem[] = [
  {
    name: "device_id",
    required: true,
    selector: { device: { integration: INTEGRATION } },
  },
  { name: "title", selector: { text: {} } },
  { name: "clamp_percent", selector: { boolean: {} } },
  { name: "show_contract_year", selector: { boolean: {} } },
  { name: "show_forecast", selector: { boolean: {} } },
];

const LABELS: Record<string, string> = {
  device_id: "editorDevice",
  title: "editorTitle",
  clamp_percent: "editorClamp",
  show_contract_year: "editorContractYear",
  show_forecast: "editorForecast",
};

export class LeasingKmCardEditor extends LitElement {
  @state() private _config?: CardConfig;

  public hass?: Hass;

  setConfig(config: CardConfig): void {
    this._config = config;
  }

  private _label = (item: FormSchemaItem): string =>
    localize(language(this.hass), LABELS[item.name] ?? item.name);

  private _changed(event: CustomEvent): void {
    this.dispatchEvent(
      new CustomEvent("config-changed", {
        detail: { config: { ...this._config, ...event.detail.value } },
        bubbles: true,
        composed: true,
      }),
    );
  }

  override render(): TemplateResult | typeof nothing {
    if (!this.hass || !this._config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this._config}
        .schema=${SCHEMA}
        .computeLabel=${this._label}
        @value-changed=${this._changed}
      ></ha-form>
    `;
  }
}

if (!customElements.get("leasing-km-card-editor")) {
  customElements.define("leasing-km-card-editor", LeasingKmCardEditor);
}
