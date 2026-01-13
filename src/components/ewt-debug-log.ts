import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

@customElement("ewt-debug-log")
export class EwtDebugLog extends LitElement {
  @state() private _logs: string[] = [];
  private _maxLogs = 200;

  static styles = css`
    :host {
      display: block;
      position: fixed;
      top: 10px;
      right: 10px;
      width: 400px;
      max-height: 80vh;
      background: white;
      border: 2px solid #333;
      border-radius: 4px;
      overflow: hidden;
      z-index: 999999;
      font-family: monospace;
      font-size: 11px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .header {
      padding: 8px;
      background: #333;
      color: white;
      font-weight: bold;
      text-align: center;
    }

    .logs {
      max-height: calc(80vh - 40px);
      overflow-y: auto;
      padding: 8px;
      background: #f5f5f5;
    }

    .log-entry {
      padding: 4px;
      margin: 2px 0;
      word-wrap: break-word;
      white-space: pre-wrap;
      border-bottom: 1px solid #ddd;
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
  `;

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
    setTimeout(() => {
      const logsDiv = this.shadowRoot?.querySelector(".logs");
      if (logsDiv) {
        logsDiv.scrollTop = logsDiv.scrollHeight;
      }
    }, 10);
  }

  render() {
    return html`
      <div class="header">🐛 Debug Log (${this._logs.length})</div>
      <div class="logs">
        ${this._logs.map(
          (log) => {
            const level = log.includes("ERROR:") ? "error" : log.includes("WARN:") ? "warn" : "log";
            return html`<div class="log-entry ${level}">${log}</div>`;
          }
        )}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ewt-debug-log": EwtDebugLog;
  }
}
