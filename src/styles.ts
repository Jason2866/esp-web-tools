import { css } from "lit";

export const dialogStyles = css`
  :host {
    --roboto-font: Roboto, system-ui;
    --text-color: rgba(0, 0, 0, 0.6);
    --danger-color: #db4437;

    --md-sys-color-primary: #03a9f4;
    --md-sys-color-on-primary: #fff;
    --md-ref-typeface-brand: var(--roboto-font);
    --md-ref-typeface-plain: var(--roboto-font);

    --md-sys-color-surface: #fff;
    --md-sys-color-surface-container: #fff;
    --md-sys-color-surface-container-high: #fff;
    --md-sys-color-surface-container-highest: #f5f5f5;
    --md-sys-color-secondary-container: #e0e0e0;

    --md-sys-typescale-headline-font: var(--roboto-font);
    --md-sys-typescale-title-font: var(--roboto-font);

    text-align: left;
    font-size: 16px;
  }

  a {
    color: var(--md-sys-color-primary);
  }
`;
