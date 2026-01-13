import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("ewt-debug-log")
export class EwtDebugLog extends LitElement {
  @state() private _logs: string[] = [];
  @state() private _minimized = false;
  private _maxLogs = 200;

  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 10px;
      right: 10px;
      width: 300px;
      background: white;
      border: 2px solid #333;
      border-radius: 4px;
      overflow: hidden;
      z-index: 999999;
      font-family: monospace;
      font-size: 10px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .header {
      padding: 6px 8px;
      background: #333;
      color: white;
      font-weight: bold;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .header:hover {
      background: #444;
    }

    .toggle {
      font-size: 14px;
    }

    .logs {
      max-height: 200px;
      overflow-y: auto;
      padding: 6px;
      background: #f5f5f5;
      display: block;
    }

    .logs.minimized {
      display: none;
    }

    .log-entry {
      padding: 2px;
      margin: 1px 0;
      word-wrap: break-word;
      white-space: pre-wrap;
      border-bottom: 1px solid #ddd;
      font-size: 9px;
    }

    .log-entry.error {
      color: #d32f2f;
      font-weight: bold;
    }

    .log-entry.warn {
      color: #f57c00;
    }

    .log-entry.log {
      color: #333;
    }

    @media (max-width: 600px) {
      :host {
        width: 250px;
        bottom: 60px;
      }

      .logs {
        max-height: 150px;
      }
    }
  `;

  private _toggleMinimize() {
    this._minimized = !this._minimized;
  }

  addLog(level: "log" | "error" | "warn", message: string) {
    const timestamp = new Date().toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    this._logs = [
      ...this._logs.slice(-this._maxLogs + 1),
      `[${timestamp}] ${level.toUpperCase()}: ${message}`,
    ];
    this.requestUpdate();

    // Auto-scroll to bottom
    if (!this._minimized) {
      setTimeout(() => {
        const logsDiv = this.shadowRoot?.querySelector(".logs");
        if (logsDiv) {
          logsDiv.scrollTop = logsDiv.scrollHeight;
        }
      }, 10);
    }
  }

  render() {
    return html`
      <div class="header" @click=${this._toggleMinimize}>
        <span>🐛 Debug (${this._logs.length})</span>
        <span class="toggle">${this._minimized ? "▲" : "▼"}</span>
      </div>
      <div class="logs ${this._minimized ? "minimized" : ""}">
        ${this._logs.map((log) => {
          const level = log.includes("ERROR:")
            ? "error"
            : log.includes("WARN:")
              ? "warn"
              : "log";
          return html`<div class="log-entry ${level}">${log}</div>`;
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ewt-debug-log": EwtDebugLog;
  }
}
