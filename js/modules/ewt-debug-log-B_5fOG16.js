import{i as o,_ as e,t,e as r,s,x as i}from"./query-assigned-elements-BVtl4XDv.js";let d=class extends s{constructor(){super(...arguments),this._logs=[],this._maxLogs=200}addLog(o,e){const t=(new Date).toLocaleTimeString("en-US",{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"});this._logs=[...this._logs.slice(1-this._maxLogs),`[${t}] ${o.toUpperCase()}: ${e}`],this.requestUpdate(),setTimeout(()=>{var o;const e=null===(o=this.shadowRoot)||void 0===o?void 0:o.querySelector(".logs");e&&(e.scrollTop=e.scrollHeight)},10)}render(){return i`
      <div class="header">🐛 Debug Log (${this._logs.length})</div>
      <div class="logs">
        ${this._logs.map(o=>{const e=o.includes("ERROR:")?"error":o.includes("WARN:")?"warn":"log";return i`<div class="log-entry ${e}">${o}</div>`})}
      </div>
    `}};d.styles=o`
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
  `,e([t()],d.prototype,"_logs",void 0),d=e([r("ewt-debug-log")],d);export{d as EwtDebugLog};
