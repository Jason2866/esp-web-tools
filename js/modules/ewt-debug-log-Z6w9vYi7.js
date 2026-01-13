import{i,_ as o,t as e,e as t,s,x as d}from"./query-assigned-elements-BVtl4XDv.js";let r=class extends s{constructor(){super(...arguments),this._logs=[],this._minimized=!1,this._maxLogs=200}_toggleMinimize(){this._minimized=!this._minimized}addLog(i,o){const e=(new Date).toLocaleTimeString("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"});this._logs=[...this._logs.slice(1-this._maxLogs),`[${e}] ${i.toUpperCase()}: ${o}`],this.requestUpdate(),this._minimized||setTimeout(()=>{var i;const o=null===(i=this.shadowRoot)||void 0===i?void 0:i.querySelector(".logs");o&&(o.scrollTop=o.scrollHeight)},10)}render(){return d`
      <div class="header" @click=${this._toggleMinimize}>
        <span>🐛 Debug (${this._logs.length})</span>
        <span class="toggle">${this._minimized?"▲":"▼"}</span>
      </div>
      <div class="logs ${this._minimized?"minimized":""}">
        ${this._logs.map(i=>{const o=i.includes("ERROR:")?"error":i.includes("WARN:")?"warn":"log";return d`<div class="log-entry ${o}">${i}</div>`})}
      </div>
    `}};r.styles=i`
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
  `,o([e()],r.prototype,"_logs",void 0),o([e()],r.prototype,"_minimized",void 0),r=o([t("ewt-debug-log")],r);export{r as EwtDebugLog};
