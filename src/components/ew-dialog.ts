import { Dialog } from "@material/web/dialog/internal/dialog.js";
import { styles } from "@material/web/dialog/internal/dialog-styles.js";
import { css } from "lit";

export class EwDialog extends Dialog {
  static override styles = [
    styles,
    css`
      :host {
        max-height: var(--ew-dialog-max-height, min(560px, 100% - 48px));
        max-width: var(--ew-dialog-max-width, min(560px, 100% - 48px));
        min-height: var(--ew-dialog-min-height, 140px);
        min-width: var(--ew-dialog-min-width, 280px);
      }
    `,
  ];
}

customElements.define("ew-dialog", EwDialog);

declare global {
  interface HTMLElementTagNameMap {
    "ew-dialog": EwDialog;
  }
}
