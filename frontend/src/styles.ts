import { css } from "lit";

/**
 * Only Home Assistant's own CSS variables are used, so the card follows every
 * theme and both colour schemes without a second palette of its own.
 */
export const styles = css`
  :host {
    display: block;
    --lkm-ok: var(--success-color, #4caf50);
    --lkm-bad: var(--error-color, #f44336);
    --lkm-warn: var(--warning-color, #ff9800);
    --lkm-muted: var(--secondary-text-color);
    --lkm-line: var(--divider-color);
    --lkm-tile: var(--secondary-background-color);
  }

  ha-card {
    overflow: hidden;
    padding-bottom: 8px;
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 12px;
    border-bottom: 1px solid var(--lkm-line);
  }
  .header ha-icon {
    color: var(--primary-color);
    flex: none;
  }
  .titles {
    flex: 1;
    min-width: 0;
  }
  .title {
    font-size: 1.05rem;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .subtitle {
    font-size: 0.8rem;
    color: var(--lkm-muted);
  }
  .badge {
    flex: none;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 4px 10px;
    border-radius: 999px;
    border: 1px solid currentColor;
  }

  .gauge {
    display: block;
    width: 100%;
    max-width: 320px;
    margin: 8px auto 0;
  }
  .gauge-track {
    fill: none;
    stroke: var(--lkm-line);
    stroke-width: 14;
    stroke-linecap: round;
  }
  .gauge-fill {
    fill: none;
    stroke-width: 14;
    stroke-linecap: round;
  }
  .gauge-marker {
    stroke: var(--primary-text-color);
    stroke-width: 3;
    stroke-linecap: round;
    opacity: 0.55;
  }
  .gauge-value {
    fill: var(--primary-text-color);
    font-size: 26px;
    font-weight: 600;
    text-anchor: middle;
  }
  .gauge-sub,
  .gauge-scale {
    fill: var(--lkm-muted);
    font-size: 11px;
    text-anchor: middle;
  }

  .bar-wrap {
    position: relative;
    height: 8px;
    margin: 4px 16px 0;
    border-radius: 4px;
    background: var(--lkm-line);
    overflow: hidden;
  }
  .bar {
    position: absolute;
    inset: 0 auto 0 0;
    border-radius: 4px;
  }
  .bar.target {
    background: var(--lkm-muted);
    opacity: 0.45;
  }
  .bar-legend {
    display: flex;
    justify-content: space-between;
    margin: 6px 16px 0;
    font-size: 0.75rem;
    color: var(--lkm-muted);
  }

  .section {
    margin: 14px 16px 0;
    font-size: 0.72rem;
    font-weight: 600;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--lkm-muted);
  }
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 8px;
    margin: 8px 16px 0;
  }
  .tile {
    background: var(--lkm-tile);
    border-radius: var(--ha-card-border-radius, 12px);
    padding: 10px 12px;
  }
  .tile .label {
    font-size: 0.75rem;
    color: var(--lkm-muted);
  }
  .tile .value {
    font-size: 1.15rem;
    font-weight: 500;
    margin-top: 2px;
  }
  .tile .hint {
    font-size: 0.72rem;
    color: var(--lkm-muted);
    margin-top: 2px;
  }

  .pills {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin: 14px 16px 4px;
  }
  .pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 0.72rem;
    padding: 4px 10px;
    border-radius: 999px;
    background: var(--lkm-tile);
    color: var(--lkm-muted);
  }
  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: currentColor;
    flex: none;
  }

  .good {
    color: var(--lkm-ok);
  }
  .bad {
    color: var(--lkm-bad);
  }
  .warn {
    color: var(--lkm-warn);
  }

  .message {
    padding: 24px 16px;
    text-align: center;
    color: var(--lkm-muted);
  }
`;
