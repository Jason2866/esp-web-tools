interface ConsoleState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  foregroundColor: string | null;
  backgroundColor: string | null;
  carriageReturn: boolean;
  lines: string[];
  secret: boolean;
  blink: boolean;
  rapidBlink: boolean;
}

const MAX_LINES = 2000;

export class ColoredConsole {
  public state: ConsoleState = {
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    foregroundColor: null,
    backgroundColor: null,
    carriageReturn: false,
    lines: [],
    secret: false,
    blink: false,
    rapidBlink: false,
  };

  private _destroyed = false;
  private _rafId = 0;
  private _timeoutId = 0;
  private _atBottom = true;
  private _intersectionObserver?: IntersectionObserver;
  private _sentinel: HTMLElement | null = null;
  // Full history for log export — never trimmed, unlike the DOM cap
  private _exportLines: string[] = [];
  private _visibilityHandler: (() => void) | null = null;

  constructor(public targetElement: HTMLElement) {
    // Track whether the user is scrolled to the bottom via IntersectionObserver
    // on a sentinel element, avoiding forced reflows on every processLines call.
    const sentinel = document.createElement("div");
    sentinel.style.height = "1px";
    this._sentinel = sentinel;
    targetElement.appendChild(sentinel);

    this._intersectionObserver = new IntersectionObserver(
      (entries) => {
        this._atBottom = entries[0].isIntersecting;
      },
      { root: targetElement, threshold: 0 },
    );
    this._intersectionObserver.observe(sentinel);

    // When the page becomes hidden, rAF is paused. Switch any pending rAF to
    // a timeout so state.lines doesn't accumulate unbounded while backgrounded.
    this._visibilityHandler = () => {
      if (document.hidden && this._rafId) {
        cancelAnimationFrame(this._rafId);
        this._rafId = 0;
        if (!this._timeoutId) {
          this._timeoutId = window.setTimeout(() => this.processLines(), 50);
        }
      }
    };
    document.addEventListener("visibilitychange", this._visibilityHandler);
  }

  logs(): string {
    // Strip ANSI/CSI escape sequences (SGR colour codes, cursor moves, etc.)
    // before exporting so the downloaded log file contains plain text.
    const ansiRe = /(?:\x1B|\x9B)(?:\[[0-?]*[ -/]*[@-~]|\][^\x07]*(?:\x07|\x1B\\))/g;
    return this._exportLines.map((l) => l.replace(ansiRe, "")).join("");
  }

  destroy() {
    this._destroyed = true;
    this.state.carriageReturn = false;
    this.state.lines = [];
    this._intersectionObserver?.disconnect();
    if (this._visibilityHandler) {
      document.removeEventListener("visibilitychange", this._visibilityHandler);
      this._visibilityHandler = null;
    }
    // Remove the sentinel from the DOM to avoid leaking it on teardown
    if (this._sentinel) {
      this._sentinel.remove();
      this._sentinel = null;
    }
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = 0;
    }
    if (this._timeoutId) {
      clearTimeout(this._timeoutId);
      this._timeoutId = 0;
    }
  }

  processLine(line: string): Element {
    const re = /(?:\x1B|\\x1B)(?:\[(.*?)[@-~]|\].*?(?:\x07|\x1B\\))/g;
    let i = 0;

    const lineSpan = document.createElement("span");
    lineSpan.classList.add("line");

    const addSpan = (content: string) => {
      if (content === "") return;

      const span = document.createElement("span");
      if (this.state.bold) span.classList.add("log-bold");
      if (this.state.italic) span.classList.add("log-italic");
      if (this.state.underline) span.classList.add("log-underline");
      if (this.state.strikethrough) span.classList.add("log-strikethrough");
      if (this.state.secret) span.classList.add("log-secret");
      if (this.state.blink) span.classList.add("log-blink");
      if (this.state.rapidBlink) span.classList.add("log-rapid-blink");
      if (this.state.foregroundColor !== null)
        span.classList.add(`log-fg-${this.state.foregroundColor}`);
      if (this.state.backgroundColor !== null)
        span.classList.add(`log-bg-${this.state.backgroundColor}`);
      span.appendChild(document.createTextNode(content));
      lineSpan.appendChild(span);

      if (this.state.secret) {
        const redacted = document.createElement("span");
        redacted.classList.add("log-secret-redacted");
        redacted.appendChild(document.createTextNode("[redacted]"));
        lineSpan.appendChild(redacted);
      }
    };

    while (true) {
      const match = re.exec(line);
      if (match === null) break;

      const j = match.index;
      addSpan(line.substring(i, j));
      i = j + match[0].length;

      if (match[1] === undefined) continue;

      for (const colorCode of match[1].split(";")) {
        switch (parseInt(colorCode)) {
          case 0:
            this.state.bold = false;
            this.state.italic = false;
            this.state.underline = false;
            this.state.strikethrough = false;
            this.state.foregroundColor = null;
            this.state.backgroundColor = null;
            this.state.secret = false;
            this.state.blink = false;
            this.state.rapidBlink = false;
            break;
          case 1:
            this.state.bold = true;
            break;
          case 3:
            this.state.italic = true;
            break;
          case 4:
            this.state.underline = true;
            break;
          case 5:
            this.state.blink = true;
            break;
          case 6:
            this.state.rapidBlink = true;
            break;
          case 8:
            this.state.secret = true;
            break;
          case 9:
            this.state.strikethrough = true;
            break;
          case 22:
            this.state.bold = false;
            break;
          case 23:
            this.state.italic = false;
            break;
          case 24:
            this.state.underline = false;
            break;
          case 25:
            this.state.blink = false;
            this.state.rapidBlink = false;
            break;
          case 28:
            this.state.secret = false;
            break;
          case 29:
            this.state.strikethrough = false;
            break;
          case 30:
            this.state.foregroundColor = "black";
            break;
          case 31:
            this.state.foregroundColor = "red";
            break;
          case 32:
            this.state.foregroundColor = "green";
            break;
          case 33:
            this.state.foregroundColor = "yellow";
            break;
          case 34:
            this.state.foregroundColor = "blue";
            break;
          case 35:
            this.state.foregroundColor = "magenta";
            break;
          case 36:
            this.state.foregroundColor = "cyan";
            break;
          case 37:
            this.state.foregroundColor = "white";
            break;
          case 39:
            this.state.foregroundColor = null;
            break;
          case 41:
            this.state.backgroundColor = "red";
            break;
          case 42:
            this.state.backgroundColor = "green";
            break;
          case 43:
            this.state.backgroundColor = "yellow";
            break;
          case 44:
            this.state.backgroundColor = "blue";
            break;
          case 45:
            this.state.backgroundColor = "magenta";
            break;
          case 46:
            this.state.backgroundColor = "cyan";
            break;
          case 47:
            this.state.backgroundColor = "white";
            break;
          case 40:
          case 49:
            this.state.backgroundColor = null;
            break;
        }
      }
    }
    addSpan(line.substring(i));
    return lineSpan;
  }

  processLines() {
    this._rafId = 0;
    this._timeoutId = 0;

    if (this._destroyed || this.state.lines.length === 0) {
      return;
    }

    const prevCarriageReturn = this.state.carriageReturn;
    const fragment = document.createDocumentFragment();

    for (const line of this.state.lines) {
      if (this.state.carriageReturn && line !== "\n") {
        if (fragment.childElementCount) {
          fragment.removeChild(fragment.lastChild!);
        }
      }
      const hadCarriageReturn = line.endsWith("\r");
      fragment.appendChild(this.processLine(line.replace(/\r/g, "")));
      this.state.carriageReturn = hadCarriageReturn;
    }

    const sentinel = this._sentinel;
    if (!sentinel) {
      this.state.lines = [];
      return;
    }

    if (
      prevCarriageReturn &&
      this.state.lines[0] !== "\n" &&
      sentinel.previousSibling
    ) {
      this.targetElement.replaceChild(fragment, sentinel.previousSibling);
    } else {
      this.targetElement.insertBefore(fragment, sentinel);
    }

    this.state.lines = [];

    // Trim oldest line-spans when DOM grows too large
    const children = this.targetElement.children;
    const excess = children.length - 1 - MAX_LINES;
    if (excess > 0) {
      if (!this._atBottom) {
        let removedHeight = 0;
        for (let i = 0; i < excess; i++) {
          removedHeight += (children[i] as HTMLElement).getBoundingClientRect()
            .height;
        }
        for (let i = 0; i < excess; i++) {
          this.targetElement.removeChild(children[0]);
        }
        this.targetElement.scrollTop -= removedHeight;
      } else {
        for (let i = 0; i < excess; i++) {
          this.targetElement.removeChild(children[0]);
        }
      }
    }

    if (this._atBottom) {
      this.targetElement.scrollTop = this.targetElement.scrollHeight;
    }
  }

  addLine(line: string) {
    if (this._destroyed) return;
    this._exportLines.push(line);
    this.state.lines.push(line);
    if (!this._rafId && !this._timeoutId) {
      if (document.hidden) {
        this._timeoutId = window.setTimeout(() => this.processLines(), 50);
      } else {
        this._rafId = requestAnimationFrame(() => this.processLines());
      }
    }
  }
}

export const coloredConsoleStyles = `
  .log {
    flex: 1;
    background-color: #1c1c1c;
    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,
      monospace;
    font-size: 12px;
    padding: 16px;
    overflow: auto;
    line-height: 1.45;
    border-radius: 3px;
    white-space: pre-wrap;
    overflow-wrap: break-word;
    color: #ddd;
  }

  .log-bold { font-weight: bold; }
  .log-italic { font-style: italic; }
  .log-underline { text-decoration: underline; }
  .log-strikethrough { text-decoration: line-through; }
  .log-underline.log-strikethrough { text-decoration: underline line-through; }
  .log-blink { animation: blink 1s step-end infinite; }
  .log-rapid-blink { animation: blink 0.4s step-end infinite; }
  @keyframes blink { 50% { opacity: 0; } }
  .log-secret {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
  }
  .log-secret-redacted { opacity: 0; width: 1px; font-size: 1px; }
  .log-fg-black { color: rgb(128, 128, 128); }
  .log-fg-red { color: rgb(255, 0, 0); }
  .log-fg-green { color: rgb(0, 255, 0); }
  .log-fg-yellow { color: rgb(255, 255, 0); }
  .log-fg-blue { color: rgb(0, 0, 255); }
  .log-fg-magenta { color: rgb(255, 0, 255); }
  .log-fg-cyan { color: rgb(0, 255, 255); }
  .log-fg-white { color: rgb(187, 187, 187); }
  .log-bg-black { background-color: rgb(0, 0, 0); }
  .log-bg-red { background-color: rgb(255, 0, 0); }
  .log-bg-green { background-color: rgb(0, 255, 0); }
  .log-bg-yellow { background-color: rgb(255, 255, 0); }
  .log-bg-blue { background-color: rgb(0, 0, 255); }
  .log-bg-magenta { background-color: rgb(255, 0, 255); }
  .log-bg-cyan { background-color: rgb(0, 255, 255); }
  .log-bg-white { background-color: rgb(255, 255, 255); }
`;
