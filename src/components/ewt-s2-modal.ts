import { LitElement, html, css } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import "./ewt-dialog";
import "./ewt-button";

/**
 * Modal dialog for ESP32-S2 port selection
 * Shows when USB port changes during mode switching
 */
@customElement("ewt-s2-modal")
export class EwtS2Modal extends LitElement {
  @property() public title = "Port Selection Required";
  @property() public message = "Please select the serial port.";
  @state() private _open = false;

  private _resolvePromise?: () => void;

  static styles = css`
    :host {
      display: contents;
    }

    .content {
      padding: 16px 24px;
    }

    h2 {
      margin: 0 0 16px 0;
      font-size: 20px;
      font-weight: 500;
      color: var(--primary-text-color, #212121);
    }

    p {
      margin: 0 0 24px 0;
      color: var(--secondary-text-color, #727272);
      line-height: 1.5;
    }

    .icon {
      font-size: 48px;
      text-align: center;
      margin-bottom: 16px;
    }

    .actions {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      padding: 16px 24px;
      border-top: 1px solid var(--divider-color, #e0e0e0);
    }
  `;

  /**
   * Show the modal and return a promise that resolves when user clicks reconnect
   */
  public show(): Promise<void> {
    this._open = true;
    return new Promise((resolve) => {
      this._resolvePromise = resolve;
    });
  }

  /**
   * Close the modal
   */
  public close(): void {
    this._open = false;
    if (this._resolvePromise) {
      this._resolvePromise();
      this._resolvePromise = undefined;
    }
  }

  private _handleReconnect(): void {
    this.close();
  }

  protected render() {
    return html`
      <ewt-dialog
        .open=${this._open}
        .heading=${this.title}
        scrimClickAction=""
        escapeKeyAction=""
      >
        <div class="content">
          <div class="icon">🔌</div>
          <p>${this.message}</p>
        </div>
        <div class="actions">
          <ewt-button
            label="Reconnect"
            @click=${this._handleReconnect}
          ></ewt-button>
        </div>
      </ewt-dialog>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ewt-s2-modal": EwtS2Modal;
  }
}
