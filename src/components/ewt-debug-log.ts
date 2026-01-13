import { LitElement, html, css } from "lit";
import { customElement, state } from "lit/decorators.js";

interface LogEntry {
  timestamp: Date;
  level: "log" | "error" | "warn";
  message: string;
}

@customElement("ewt-debug-log")
export class EwtDebugLog extends LitElement {
  @state() private _logs: LogEntry[] = [];
  @state() private _expanded = false;
  private _maxLogs = 100;

  static styles = css`
    :host {
      display: block;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: rgba(0, 0, 0, 0.95);
      color: #fff;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
      max-height: 40vh;
      overflow: hidden;
      border-top: 2px solid #333;
    }

    .header {
      padding: 8px 12px;
      background: #222;
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      user-select: none;
    }

    .header:hover {
      background: #333;
    }

    .title {
      font-weight: bold;
      color: #4CAF50;
    }

    .count {
      color: #999;
      font-size: 11px;
    }

    .logs {
      max-height: calc(40vh - 40px);
      overflow-y: auto;
      padding: 8px;
    }

    .log-entry {
      padding: 4px 8px;
      margin: 2px 0;
      border-left: 3px solid #666;
      word-wrap: break-word;
    }

    .log-entry.error {
      border-left-color: #f44336;
      background: rgba(244, 67, 54, 0.1);
    }

    .log-entry.warn {
      border-left-color: #ff9800;
      background: rgba(255, 152, 0, 0.1);
    }

    .log-entry.log {
      border-left-color: #2196F3;
      background: rgba(33, 150, 243, 0.05);
    }

    .timestamp {
      color: #666;
      font-size: 10px;
      margin-right: 8px;
    }

    .message {
      color: #fff;
    }

    .error .message {
      color: #ff6b6b;
    }

    .warn .message {
      color: #ffa726;
    }

    .buttons {
      display: flex;
      gap: 8px;
    }

    button {
      background: #444;
      color: #fff;
      border: none;
      padding: 4px 12px;
      border-radius: 3px;
      cursor: pointer;
      font-size: 11px;
    }

    button:hover {
      background: #555;
    }

    .collapsed .logs {
      display: none;
    }
  `;

  addLog(level: "log" | "error" | "warn", message: string) {
    this._logs = [
      ...this._logs.slice(-this._maxLogs + 1),
      {
        timestamp: new Date(),
        level,
        message,
      },
    ];
    this.requestUpdate();
  }

  clear() {
    this._logs = [];
    this.requestUpdate();
  }

  private _formatTime(date: Date): string {
    return date.toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      fractionalSecondDigits: 3,
    });
  }

  private _toggleExpanded() {
    this._expanded = !this._expanded;
  }

  private _copyLogs() {
    const text = this._logs
      .map(
        (log) =>
          `[${this._formatTime(log.timestamp)}] ${log.level.toUpperCase()}: ${log.message}`,
      )
      .join("\n");
    navigator.clipboard.writeText(text).then(() => {
      alert("Logs copied to clipboard!");
    });
  }

  render() {
    const errorCount = this._logs.filter((l) => l.level === "error").length;
    const warnCount = this._logs.filter((l) => l.level === "warn").length;

    return html`
      <div class=${this._expanded ? "expanded" : "collapsed"}>
        <div class="header" @click=${this._toggleExpanded}>
          <div class="title">
            🐛 Debug Log
            ${errorCount > 0 ? html`<span style="color: #f44336"> (${errorCount} errors)</span>` : ""}
            ${warnCount > 0 ? html`<span style="color: #ff9800"> (${warnCount} warnings)</span>` : ""}
          </div>
          <div class="buttons" @click=${(e: Event) => e.stopPropagation()}>
            <button @click=${this._copyLogs}>Copy</button>
            <button @click=${this.clear}>Clear</button>
            <span class="count">${this._logs.length} entries</span>
          </div>
        </div>
        <div class="logs">
          ${this._logs.map(
            (log) => html`
              <div class="log-entry ${log.level}">
                <span class="timestamp">${this._formatTime(log.timestamp)}</span>
                <span class="message">${log.message}</span>
              </div>
            `,
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ewt-debug-log": EwtDebugLog;
  }
}
