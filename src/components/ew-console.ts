import { ColoredConsole, coloredConsoleStyles } from "../util/console-color";
import { sleep } from "../util/sleep";
import { LineBreakTransformer } from "../util/line-break-transformer";
import { TimestampTransformer } from "../util/timestamp-transformer";
import { Logger } from "../const";

export class EwtConsole extends HTMLElement {
  public port!: SerialPort;
  public logger!: Logger;
  public allowInput = true;
  public onReset?: () => Promise<void>;

  private _console?: ColoredConsole;
  private _cancelConnection?: () => Promise<void>;
  private _commandHistory: string[] = [];
  private _historyIndex = -1;
  private _currentInput = "";

  public logs(): string {
    return this._console?.logs() || "";
  }

  public connectedCallback() {
    if (this._console) {
      return;
    }
    // attachShadow throws if a shadow root already exists; reuse it on reattach
    const shadowRoot = this.shadowRoot ?? this.attachShadow({ mode: "open" });

    shadowRoot.innerHTML = `
      <style>
        :host, input {
          background-color: #1c1c1c;
          color: #ddd;
          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
            monospace;
          line-height: 1.45;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        form {
          display: flex;
          align-items: center;
          padding: 0 8px 0 16px;
          flex-shrink: 0;
        }
        input {
          flex: 1;
          padding: 4px;
          margin: 0 8px;
          border: 0;
          outline: none;
        }
        ${coloredConsoleStyles}
      </style>
      <div class="log"></div>
      ${
        this.allowInput
          ? `<form>
                >
                <input autofocus>
              </form>
            `
          : ""
      }
    `;

    this._console = new ColoredConsole(this.shadowRoot!.querySelector("div")!);

    if (this.allowInput) {
      const input = this.shadowRoot!.querySelector("input")!;

      this.addEventListener("click", () => {
        // Only focus input if user didn't select some text
        if (getSelection()?.toString() === "") {
          input.focus();
        }
      });

      input.addEventListener("keydown", (ev) => {
        if (ev.key === "Enter") {
          ev.preventDefault();
          ev.stopPropagation();
          this._sendCommand();
        } else if (ev.key === "ArrowUp") {
          ev.preventDefault();
          this._navigateHistory(input, 1);
        } else if (ev.key === "ArrowDown") {
          ev.preventDefault();
          this._navigateHistory(input, -1);
        } else {
          // User is editing — reset history navigation
          this._historyIndex = -1;
        }
      });
    }

    const abortController = new AbortController();
    const connection = this._connect(abortController.signal);
    this._cancelConnection = () => {
      abortController.abort();
      return connection;
    };
  }

  private async _connect(signal: AbortSignal) {
    this.logger.debug("Starting console read loop");
    // Capture a stable reference; addLine() becomes a no-op after destroy()
    const consoleView = this._console;
    if (!this.port.readable) {
      consoleView?.addLine("");
      consoleView?.addLine("");
      consoleView?.addLine(
        "Terminal disconnected: Port readable stream not available",
      );
      this.logger.error(
        "Port readable stream not available - port may need to be reopened at correct baudrate",
      );
      return;
    }

    try {
      await this.port.readable
        .pipeThrough(
          new TextDecoderStream() as ReadableWritablePair<string, Uint8Array>,
          { signal },
        )
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .pipeThrough(new TransformStream(new TimestampTransformer()))
        .pipeTo(
          new WritableStream({
            write: (line: string) => {
              consoleView?.addLine(line);
            },
          }),
        );
      if (!signal.aborted) {
        consoleView?.addLine("");
        consoleView?.addLine("");
        consoleView?.addLine("Terminal disconnected");
      }
    } catch (err) {
      if (!signal.aborted) {
        consoleView?.addLine("");
        consoleView?.addLine("");
        consoleView?.addLine(`Terminal disconnected: ${err}`);
      }
    } finally {
      await sleep(100);
      this.logger.debug("Finished console read loop");
    }
  }

  private _navigateHistory(input: HTMLInputElement, direction: 1 | -1) {
    if (this._commandHistory.length === 0) return;

    // Save current input before navigating away
    if (this._historyIndex === -1) {
      this._currentInput = input.value;
    }

    const newIndex = this._historyIndex + direction;

    if (newIndex < 0) {
      // Back to current (unsent) input
      this._historyIndex = -1;
      input.value = this._currentInput;
    } else if (newIndex < this._commandHistory.length) {
      this._historyIndex = newIndex;
      input.value = this._commandHistory[this._historyIndex];
    }

    // Move cursor to end
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }

  private async _sendCommand() {
    const input = this.shadowRoot?.querySelector("input");
    if (!input || !this.port.writable) return;

    const value = input.value;
    const writer = this.port.writable.getWriter();
    try {
      await writer.write(new TextEncoder().encode(`${value}\r\n`));
      this._console?.addLine(`> ${value}\r\n`);
      if (input.isConnected) {
        // Add to history (skip empty, skip consecutive duplicates, cap at 100)
        if (value && value !== this._commandHistory[0]) {
          this._commandHistory.unshift(value);
          if (this._commandHistory.length > 100) {
            this._commandHistory.pop();
          }
        }
        this._historyIndex = -1;
        this._currentInput = "";
        input.value = "";
        input.focus();
      }
    } finally {
      try {
        writer.releaseLock();
      } catch (err) {
        console.error("Ignoring release lock error", err);
      }
    }
  }

  public async disconnect() {
    if (this._cancelConnection) {
      await this._cancelConnection();
      this._cancelConnection = undefined;
    }
    this._console?.destroy();
    this._console = undefined;
  }

  public disconnectedCallback() {
    if (this._cancelConnection) {
      this._cancelConnection();
      this._cancelConnection = undefined;
    }
    this._console?.destroy();
    this._console = undefined;
  }

  public async reset() {
    this.logger.debug("Triggering reset.");
    if (this.onReset) {
      try {
        await this.onReset();
      } catch (err) {
        this.logger.error("Reset callback failed:", err);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

customElements.define("ew-console", EwtConsole);

declare global {
  interface HTMLElementTagNameMap {
    "ew-console": EwtConsole;
  }
}
