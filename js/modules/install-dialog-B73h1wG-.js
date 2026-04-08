import{e,i as t,_ as i,n as r,m as o,a as s,b as a,r as l,c as n,d,f as c,g as h,A as p,h as u,j as f,k as g,s as m,o as v,D as b,E as y,t as x,l as _,p as w,q as k,u as S,v as $,w as R,x as E,y as C,z as I}from"./styles-D69gtq6_.js";import{C as T,a as F,b as O,c as A,d as L,e as P,f as D,g as z,h as B,i as U,j as W,k as N}from"./install-button.js";let q;const V=Symbol("createValidator"),M=Symbol("getValidityAnchor"),H=Symbol("privateValidator"),j=Symbol("privateSyncValidity"),G=Symbol("privateCustomValidationMessage");function K(e){var i;class r extends e{constructor(){super(...arguments),this[i]=""}get validity(){return this[j](),this[t].validity}get validationMessage(){return this[j](),this[t].validationMessage}get willValidate(){return this[j](),this[t].willValidate}checkValidity(){return this[j](),this[t].checkValidity()}reportValidity(){return this[j](),this[t].reportValidity()}setCustomValidity(e){this[G]=e,this[j]()}requestUpdate(e,t,i){super.requestUpdate(e,t,i),this[j]()}firstUpdated(e){super.firstUpdated(e),this[j]()}[(i=G,j)](){this[H]||(this[H]=this[V]());const{validity:e,validationMessage:i}=this[H].getValidity(),r=!!this[G],o=this[G]||i;this[t].setValidity({...e,customError:r},o,this[M]()??void 0)}[V](){throw new Error("Implement [createValidator]")}[M](){throw new Error("Implement [getValidityAnchor]")}}return r}const J=Symbol("getFormValue"),Y=Symbol("getFormState");function X(e){class o extends e{get form(){return this[t].form}get labels(){return this[t].labels}get name(){return this.getAttribute("name")??""}set name(e){this.setAttribute("name",e)}get disabled(){return this.hasAttribute("disabled")}set disabled(e){this.toggleAttribute("disabled",e)}attributeChangedCallback(e,t,i){if("name"===e||"disabled"===e){const i="disabled"===e?null!==t:t;return void this.requestUpdate(e,i)}super.attributeChangedCallback(e,t,i)}requestUpdate(e,i,r){super.requestUpdate(e,i,r),this[t].setFormValue(this[J](),this[Y]())}[J](){throw new Error("Implement [getFormValue]")}[Y](){return this[J]()}formDisabledCallback(e){this.disabled=e}}return o.formAssociated=!0,i([r({noAccessor:!0})],o.prototype,"name",null),i([r({type:Boolean,noAccessor:!0})],o.prototype,"disabled",null),o}class Z{constructor(e){this.getCurrentState=e,this.currentValidity={validity:{},validationMessage:""}}getValidity(){const e=this.getCurrentState();if(!(!this.prevState||!this.equals(this.prevState,e)))return this.currentValidity;const{validity:t,validationMessage:i}=this.computeValidity(e);return this.prevState=this.copy(e),this.currentValidity={validationMessage:i,validity:{badInput:t.badInput,customError:t.customError,patternMismatch:t.patternMismatch,rangeOverflow:t.rangeOverflow,rangeUnderflow:t.rangeUnderflow,stepMismatch:t.stepMismatch,tooLong:t.tooLong,tooShort:t.tooShort,typeMismatch:t.typeMismatch,valueMissing:t.valueMissing}},this.currentValidity}}class Q extends Z{computeValidity(e){return this.checkboxControl||(this.checkboxControl=document.createElement("input"),this.checkboxControl.type="checkbox"),this.checkboxControl.checked=e.checked,this.checkboxControl.required=e.required,{validity:this.checkboxControl.validity,validationMessage:this.checkboxControl.validationMessage}}equals(e,t){return e.checked===t.checked&&e.required===t.required}copy({checked:e,required:t}){return{checked:e,required:t}}}const ee=o(K(X(s(a))));class te extends ee{constructor(){super(),this.checked=!1,this.indeterminate=!1,this.required=!1,this.value="on",this.prevChecked=!1,this.prevDisabled=!1,this.prevIndeterminate=!1,this.addEventListener("click",e=>{d(e)&&this.input&&(this.focus(),c(this.input))})}update(e){(e.has("checked")||e.has("disabled")||e.has("indeterminate"))&&(this.prevChecked=e.get("checked")??this.checked,this.prevDisabled=e.get("disabled")??this.disabled,this.prevIndeterminate=e.get("indeterminate")??this.indeterminate),super.update(e)}render(){const e=!this.prevChecked&&!this.prevIndeterminate,t=this.prevChecked&&!this.prevIndeterminate,i=this.prevIndeterminate,r=this.checked&&!this.indeterminate,o=this.indeterminate,s=h({disabled:this.disabled,selected:r||o,unselected:!r&&!o,checked:r,indeterminate:o,"prev-unselected":e,"prev-checked":t,"prev-indeterminate":i,"prev-disabled":this.prevDisabled}),{ariaLabel:a,ariaInvalid:l}=this;return u`
      <div class="container ${s}">
        <input
          type="checkbox"
          id="input"
          aria-checked=${o?"mixed":p}
          aria-label=${a||p}
          aria-invalid=${l||p}
          ?disabled=${this.disabled}
          ?required=${this.required}
          .indeterminate=${this.indeterminate}
          .checked=${this.checked}
          @input=${this.handleInput}
          @change=${this.handleChange} />

        <div class="outline"></div>
        <div class="background"></div>
        <md-focus-ring part="focus-ring" for="input"></md-focus-ring>
        <md-ripple for="input" ?disabled=${this.disabled}></md-ripple>
        <svg class="icon" viewBox="0 0 18 18" aria-hidden="true">
          <rect class="mark short" />
          <rect class="mark long" />
        </svg>
      </div>
    `}handleInput(e){const t=e.target;this.checked=t.checked,this.indeterminate=t.indeterminate}handleChange(e){f(this,e)}[J](){return!this.checked||this.indeterminate?null:this.value}[Y](){return String(this.checked)}formResetCallback(){this.checked=this.hasAttribute("checked")}formStateRestoreCallback(e){this.checked="true"===e}[V](){return new Q(()=>this)}[M](){return this.input}}te.shadowRootOptions={...a.shadowRootOptions,delegatesFocus:!0},i([r({type:Boolean})],te.prototype,"checked",void 0),i([r({type:Boolean})],te.prototype,"indeterminate",void 0),i([r({type:Boolean})],te.prototype,"required",void 0),i([r()],te.prototype,"value",void 0),i([l()],te.prototype,"prevChecked",void 0),i([l()],te.prototype,"prevDisabled",void 0),i([l()],te.prototype,"prevIndeterminate",void 0),i([n("input")],te.prototype,"input",void 0);const ie=g`:host{border-start-start-radius:var(--md-checkbox-container-shape-start-start, var(--md-checkbox-container-shape, 2px));border-start-end-radius:var(--md-checkbox-container-shape-start-end, var(--md-checkbox-container-shape, 2px));border-end-end-radius:var(--md-checkbox-container-shape-end-end, var(--md-checkbox-container-shape, 2px));border-end-start-radius:var(--md-checkbox-container-shape-end-start, var(--md-checkbox-container-shape, 2px));display:inline-flex;height:var(--md-checkbox-container-size, 18px);position:relative;vertical-align:top;width:var(--md-checkbox-container-size, 18px);-webkit-tap-highlight-color:rgba(0,0,0,0);cursor:pointer}:host([disabled]){cursor:default}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--md-checkbox-container-size, 18px))/2)}md-focus-ring{height:44px;inset:unset;width:44px}input{appearance:none;height:48px;margin:0;opacity:0;outline:none;position:absolute;width:48px;z-index:1;cursor:inherit}:host([touch-target=none]) input{height:100%;width:100%}.container{border-radius:inherit;display:flex;height:100%;place-content:center;place-items:center;position:relative;width:100%}.outline,.background,.icon{inset:0;position:absolute}.outline,.background{border-radius:inherit}.outline{border-color:var(--md-checkbox-outline-color, var(--md-sys-color-on-surface-variant, #49454f));border-style:solid;border-width:var(--md-checkbox-outline-width, 2px);box-sizing:border-box}.background{background-color:var(--md-checkbox-selected-container-color, var(--md-sys-color-primary, #6750a4))}.background,.icon{opacity:0;transition-duration:150ms,50ms;transition-property:transform,opacity;transition-timing-function:cubic-bezier(0.3, 0, 0.8, 0.15),linear;transform:scale(0.6)}:where(.selected) :is(.background,.icon){opacity:1;transition-duration:350ms,50ms;transition-timing-function:cubic-bezier(0.05, 0.7, 0.1, 1),linear;transform:scale(1)}md-ripple{border-radius:var(--md-checkbox-state-layer-shape, var(--md-sys-shape-corner-full, 9999px));height:var(--md-checkbox-state-layer-size, 40px);inset:unset;width:var(--md-checkbox-state-layer-size, 40px);--md-ripple-hover-color: var(--md-checkbox-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-hover-opacity: var(--md-checkbox-hover-state-layer-opacity, 0.08);--md-ripple-pressed-color: var(--md-checkbox-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--md-ripple-pressed-opacity: var(--md-checkbox-pressed-state-layer-opacity, 0.12)}.selected md-ripple{--md-ripple-hover-color: var(--md-checkbox-selected-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--md-ripple-hover-opacity: var(--md-checkbox-selected-hover-state-layer-opacity, 0.08);--md-ripple-pressed-color: var(--md-checkbox-selected-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-pressed-opacity: var(--md-checkbox-selected-pressed-state-layer-opacity, 0.12)}.icon{fill:var(--md-checkbox-selected-icon-color, var(--md-sys-color-on-primary, #fff));height:var(--md-checkbox-icon-size, 18px);width:var(--md-checkbox-icon-size, 18px)}.mark.short{height:2px;transition-property:transform,height;width:2px}.mark.long{height:2px;transition-property:transform,width;width:10px}.mark{animation-duration:150ms;animation-timing-function:cubic-bezier(0.3, 0, 0.8, 0.15);transition-duration:150ms;transition-timing-function:cubic-bezier(0.3, 0, 0.8, 0.15)}.selected .mark{animation-duration:350ms;animation-timing-function:cubic-bezier(0.05, 0.7, 0.1, 1);transition-duration:350ms;transition-timing-function:cubic-bezier(0.05, 0.7, 0.1, 1)}.checked .mark,.prev-checked.unselected .mark{transform:scaleY(-1) translate(7px, -14px) rotate(45deg)}.checked .mark.short,.prev-checked.unselected .mark.short{height:5.6568542495px}.checked .mark.long,.prev-checked.unselected .mark.long{width:11.313708499px}.indeterminate .mark,.prev-indeterminate.unselected .mark{transform:scaleY(-1) translate(4px, -10px) rotate(0deg)}.prev-unselected .mark{transition-property:none}.prev-unselected.checked .mark.long{animation-name:prev-unselected-to-checked}@keyframes prev-unselected-to-checked{from{width:0}}:where(:hover) .outline{border-color:var(--md-checkbox-hover-outline-color, var(--md-sys-color-on-surface, #1d1b20));border-width:var(--md-checkbox-hover-outline-width, 2px)}:where(:hover) .background{background:var(--md-checkbox-selected-hover-container-color, var(--md-sys-color-primary, #6750a4))}:where(:hover) .icon{fill:var(--md-checkbox-selected-hover-icon-color, var(--md-sys-color-on-primary, #fff))}:where(:focus-within) .outline{border-color:var(--md-checkbox-focus-outline-color, var(--md-sys-color-on-surface, #1d1b20));border-width:var(--md-checkbox-focus-outline-width, 2px)}:where(:focus-within) .background{background:var(--md-checkbox-selected-focus-container-color, var(--md-sys-color-primary, #6750a4))}:where(:focus-within) .icon{fill:var(--md-checkbox-selected-focus-icon-color, var(--md-sys-color-on-primary, #fff))}:where(:active) .outline{border-color:var(--md-checkbox-pressed-outline-color, var(--md-sys-color-on-surface, #1d1b20));border-width:var(--md-checkbox-pressed-outline-width, 2px)}:where(:active) .background{background:var(--md-checkbox-selected-pressed-container-color, var(--md-sys-color-primary, #6750a4))}:where(:active) .icon{fill:var(--md-checkbox-selected-pressed-icon-color, var(--md-sys-color-on-primary, #fff))}:where(.disabled,.prev-disabled) :is(.background,.icon,.mark){animation-duration:0s;transition-duration:0s}:where(.disabled) .outline{border-color:var(--md-checkbox-disabled-outline-color, var(--md-sys-color-on-surface, #1d1b20));border-width:var(--md-checkbox-disabled-outline-width, 2px);opacity:var(--md-checkbox-disabled-container-opacity, 0.38)}:where(.selected.disabled) .outline{visibility:hidden}:where(.selected.disabled) .background{background:var(--md-checkbox-selected-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));opacity:var(--md-checkbox-selected-disabled-container-opacity, 0.38)}:where(.disabled) .icon{fill:var(--md-checkbox-selected-disabled-icon-color, var(--md-sys-color-surface, #fef7ff))}@media(forced-colors: active){.background{background-color:CanvasText}.selected.disabled .background{background-color:GrayText;opacity:1}.outline{border-color:CanvasText}.disabled .outline{border-color:GrayText;opacity:1}.icon{fill:Canvas}}
`;class re extends te{}re.styles=[ie],customElements.define("ew-checkbox",re);class oe{constructor(e){this.targetElement=e,this.state={bold:!1,italic:!1,underline:!1,strikethrough:!1,foregroundColor:null,backgroundColor:null,carriageReturn:!1,lines:[],secret:!1,blink:!1,rapidBlink:!1},this._destroyed=!1,this._rafId=0,this._timeoutId=0,this._atBottom=!0,this._sentinel=null,this._exportLines=[],this._redactedLines=[],this._visibilityHandler=null;const t=document.createElement("div");t.style.height="1px",this._sentinel=t,e.appendChild(t),this._intersectionObserver=new IntersectionObserver(e=>{this._atBottom=e[0].isIntersecting},{root:e,threshold:0}),this._intersectionObserver.observe(t),this._visibilityHandler=()=>{document.hidden&&this._rafId&&(cancelAnimationFrame(this._rafId),this._rafId=0,this._timeoutId||(this._timeoutId=window.setTimeout(()=>this.processLines(),50)))},document.addEventListener("visibilitychange",this._visibilityHandler)}logs(){return this._redactedLines.join("")}_redactLine(e){const t=/(?:\x1B|\\x1B)(?:\[(.*?)[@-~]|\].*?(?:\x07|\x1B\\))/g;let i=0,r=!1,o="";for(;;){const s=t.exec(e);if(null===s)break;const a=s.index,l=e.substring(i,a);if(l&&(o+=r?"[redacted]":l),i=a+s[0].length,void 0!==s[1])for(const e of s[1].split(";"))switch(parseInt(e)){case 0:case 28:r=!1;break;case 8:r=!0}}const s=e.substring(i);return s&&(o+=r?"[redacted]":s),o}destroy(){var e;this._destroyed=!0,this.state.carriageReturn=!1,this.state.lines=[],null===(e=this._intersectionObserver)||void 0===e||e.disconnect(),this._visibilityHandler&&(document.removeEventListener("visibilitychange",this._visibilityHandler),this._visibilityHandler=null),this._sentinel&&(this._sentinel.remove(),this._sentinel=null),this._rafId&&(cancelAnimationFrame(this._rafId),this._rafId=0),this._timeoutId&&(clearTimeout(this._timeoutId),this._timeoutId=0)}processLine(e){const t=/(?:\x1B|\\x1B)(?:\[(.*?)[@-~]|\].*?(?:\x07|\x1B\\))/g;let i=0;const r=document.createElement("span");r.classList.add("line");const o=e=>{if(""===e)return;if(this.state.secret){const e=document.createElement("span");return e.classList.add("log-secret-redacted"),e.appendChild(document.createTextNode("[redacted]")),void r.appendChild(e)}const t=document.createElement("span");this.state.bold&&t.classList.add("log-bold"),this.state.italic&&t.classList.add("log-italic"),this.state.underline&&t.classList.add("log-underline"),this.state.strikethrough&&t.classList.add("log-strikethrough"),this.state.blink&&t.classList.add("log-blink"),this.state.rapidBlink&&t.classList.add("log-rapid-blink"),null!==this.state.foregroundColor&&t.classList.add(`log-fg-${this.state.foregroundColor}`),null!==this.state.backgroundColor&&t.classList.add(`log-bg-${this.state.backgroundColor}`),t.appendChild(document.createTextNode(e)),r.appendChild(t)};for(;;){const r=t.exec(e);if(null===r)break;const s=r.index;if(o(e.substring(i,s)),i=s+r[0].length,void 0!==r[1])for(const e of r[1].split(";"))switch(parseInt(e)){case 0:this.state.bold=!1,this.state.italic=!1,this.state.underline=!1,this.state.strikethrough=!1,this.state.foregroundColor=null,this.state.backgroundColor=null,this.state.secret=!1,this.state.blink=!1,this.state.rapidBlink=!1;break;case 1:this.state.bold=!0;break;case 3:this.state.italic=!0;break;case 4:this.state.underline=!0;break;case 5:this.state.blink=!0;break;case 6:this.state.rapidBlink=!0;break;case 8:this.state.secret=!0;break;case 9:this.state.strikethrough=!0;break;case 22:this.state.bold=!1;break;case 23:this.state.italic=!1;break;case 24:this.state.underline=!1;break;case 25:this.state.blink=!1,this.state.rapidBlink=!1;break;case 28:this.state.secret=!1;break;case 29:this.state.strikethrough=!1;break;case 30:this.state.foregroundColor="black";break;case 31:this.state.foregroundColor="red";break;case 32:this.state.foregroundColor="green";break;case 33:this.state.foregroundColor="yellow";break;case 34:this.state.foregroundColor="blue";break;case 35:this.state.foregroundColor="magenta";break;case 36:this.state.foregroundColor="cyan";break;case 37:this.state.foregroundColor="white";break;case 39:this.state.foregroundColor=null;break;case 40:this.state.backgroundColor="black";break;case 41:this.state.backgroundColor="red";break;case 42:this.state.backgroundColor="green";break;case 43:this.state.backgroundColor="yellow";break;case 44:this.state.backgroundColor="blue";break;case 45:this.state.backgroundColor="magenta";break;case 46:this.state.backgroundColor="cyan";break;case 47:this.state.backgroundColor="white";break;case 49:this.state.backgroundColor=null}}return o(e.substring(i)),r}processLines(){if(this._rafId=0,this._timeoutId=0,this._destroyed||0===this.state.lines.length)return;const e=this.state.carriageReturn,t=document.createDocumentFragment();for(const e of this.state.lines){this.state.carriageReturn&&"\n"!==e&&t.childElementCount&&t.removeChild(t.lastChild);const i=e.endsWith("\r");t.appendChild(this.processLine(e.replace(/\r/g,""))),this.state.carriageReturn=i}const i=this._sentinel;if(!i)return void(this.state.lines=[]);e&&"\n"!==this.state.lines[0]&&i.previousSibling?this.targetElement.replaceChild(t,i.previousSibling):this.targetElement.insertBefore(t,i),this.state.lines=[];const r=this.targetElement.children,o=r.length-1-2e3;if(o>0)if(this._atBottom)for(let e=0;e<o;e++)this.targetElement.removeChild(r[0]);else{let e=0;for(let t=0;t<o;t++)e+=r[t].getBoundingClientRect().height;for(let e=0;e<o;e++)this.targetElement.removeChild(r[0]);this.targetElement.scrollTop-=e}this._atBottom&&(this.targetElement.scrollTop=this.targetElement.scrollHeight)}addLine(e){this._destroyed||(this._exportLines.push(e),this._redactedLines.push(this._redactLine(e)),this.state.lines.push(e),this._rafId||this._timeoutId||(document.hidden?this._timeoutId=window.setTimeout(()=>this.processLines(),50):this._rafId=requestAnimationFrame(()=>this.processLines())))}}const se=e=>new Promise(t=>setTimeout(t,e));class ae{constructor(){this.chunks=""}transform(e,t){this.chunks+=e;const i=/\r\n|\r|\n/g;let r,o=0;for(;null!==(r=i.exec(this.chunks))&&("\r"!==r[0]||i.lastIndex!==this.chunks.length);){const e=this.chunks.substring(o,r.index),s="\r"===r[0]?"\r":"\n";t.enqueue(e+s),o=i.lastIndex}this.chunks=this.chunks.substring(o)}flush(e){e.enqueue(this.chunks)}}const le=/^\s*(?:\(\d+\)\s|\[\d{2}:\d{2}:\d{2}(?:\.\d+)?\]|[DIWEACV] \(\d+\) \w|(?:\d{2}:){2}\d{2}\.\d)/;class ne{transform(e,t){if(""===e||"\n"===e)return void t.enqueue(e);if(le.test(e))return void t.enqueue(e);const i=new Date,r=i.getHours().toString().padStart(2,"0"),o=i.getMinutes().toString().padStart(2,"0"),s=i.getSeconds().toString().padStart(2,"0");t.enqueue(`[${r}:${o}:${s}]${e}`)}}class de extends HTMLElement{constructor(){super(...arguments),this.allowInput=!0,this._commandHistory=[],this._historyIndex=-1,this._currentInput=""}logs(){var e;return(null===(e=this._console)||void 0===e?void 0:e.logs())||""}connectedCallback(){var e;if(this._console)return;if((null!==(e=this.shadowRoot)&&void 0!==e?e:this.attachShadow({mode:"open"})).innerHTML=`\n      <style>\n        :host, input {\n          background-color: #1c1c1c;\n          color: #ddd;\n          font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,\n            monospace;\n          line-height: 1.45;\n          display: flex;\n          flex-direction: column;\n          overflow: hidden;\n        }\n        form {\n          display: flex;\n          align-items: center;\n          padding: 0 8px 0 16px;\n          flex-shrink: 0;\n        }\n        input {\n          flex: 1;\n          padding: 4px;\n          margin: 0 8px;\n          border: 0;\n          outline: none;\n        }\n        \n  .log {\n    flex: 1;\n    background-color: #1c1c1c;\n    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier,\n      monospace;\n    font-size: 12px;\n    padding: 16px;\n    overflow: auto;\n    line-height: 1.45;\n    border-radius: 3px;\n    white-space: pre-wrap;\n    overflow-wrap: break-word;\n    color: #ddd;\n  }\n\n  .log-bold { font-weight: bold; }\n  .log-italic { font-style: italic; }\n  .log-underline { text-decoration: underline; }\n  .log-strikethrough { text-decoration: line-through; }\n  .log-underline.log-strikethrough { text-decoration: underline line-through; }\n  .log-blink { animation: blink 1s step-end infinite; }\n  .log-rapid-blink { animation: blink 0.4s step-end infinite; }\n  @keyframes blink { 50% { opacity: 0; } }\n  .log-secret {\n    -webkit-user-select: none;\n    -moz-user-select: none;\n    -ms-user-select: none;\n    user-select: none;\n  }\n  .log-secret-redacted { opacity: 0; width: 1px; font-size: 1px; }\n  .log-fg-black { color: rgb(128, 128, 128); }\n  .log-fg-red { color: rgb(255, 0, 0); }\n  .log-fg-green { color: rgb(0, 255, 0); }\n  .log-fg-yellow { color: rgb(255, 255, 0); }\n  .log-fg-blue { color: rgb(0, 0, 255); }\n  .log-fg-magenta { color: rgb(255, 0, 255); }\n  .log-fg-cyan { color: rgb(0, 255, 255); }\n  .log-fg-white { color: rgb(187, 187, 187); }\n  .log-bg-black { background-color: rgb(0, 0, 0); }\n  .log-bg-red { background-color: rgb(255, 0, 0); }\n  .log-bg-green { background-color: rgb(0, 255, 0); }\n  .log-bg-yellow { background-color: rgb(255, 255, 0); }\n  .log-bg-blue { background-color: rgb(0, 0, 255); }\n  .log-bg-magenta { background-color: rgb(255, 0, 255); }\n  .log-bg-cyan { background-color: rgb(0, 255, 255); }\n  .log-bg-white { background-color: rgb(255, 255, 255); }\n\n      </style>\n      <div class="log"></div>\n      ${this.allowInput?"<form>\n                >\n                <input autofocus>\n              </form>\n            ":""}\n    `,this._console=new oe(this.shadowRoot.querySelector("div")),this.allowInput){const e=this.shadowRoot.querySelector("input");this._clickHandler=()=>{var t;""===(null===(t=getSelection())||void 0===t?void 0:t.toString())&&e.focus()},this.addEventListener("click",this._clickHandler),e.addEventListener("keydown",t=>{"Enter"===t.key?(t.preventDefault(),t.stopPropagation(),this._sendCommand()):"ArrowUp"===t.key?(t.preventDefault(),this._navigateHistory(e,1)):"ArrowDown"===t.key?(t.preventDefault(),this._navigateHistory(e,-1)):this._historyIndex=-1})}const t=new AbortController,i=this._connect(t.signal);this._cancelConnection=()=>(t.abort(),i)}async _connect(e){this.logger.debug("Starting console read loop");const t=this._console;if(!this.port.readable)return null==t||t.addLine(""),null==t||t.addLine(""),null==t||t.addLine("Terminal disconnected: Port readable stream not available"),void this.logger.error("Port readable stream not available - port may need to be reopened at correct baudrate");try{await this.port.readable.pipeThrough(new TextDecoderStream,{signal:e}).pipeThrough(new TransformStream(new ae)).pipeThrough(new TransformStream(new ne)).pipeTo(new WritableStream({write:e=>{null==t||t.addLine(e)}})),e.aborted||(null==t||t.addLine(""),null==t||t.addLine(""),null==t||t.addLine("Terminal disconnected"))}catch(i){e.aborted||(null==t||t.addLine(""),null==t||t.addLine(""),null==t||t.addLine(`Terminal disconnected: ${i}`))}finally{await se(100),this.logger.debug("Finished console read loop")}}_navigateHistory(e,t){if(0===this._commandHistory.length)return;-1===this._historyIndex&&(this._currentInput=e.value);const i=this._historyIndex+t;i<0?(this._historyIndex=-1,e.value=this._currentInput):i<this._commandHistory.length&&(this._historyIndex=i,e.value=this._commandHistory[this._historyIndex]);const r=e.value.length;e.setSelectionRange(r,r)}async _sendCommand(){var e,t;const i=null===(e=this.shadowRoot)||void 0===e?void 0:e.querySelector("input");if(!i||!this.port.writable)return;const r=i.value,o=this.port.writable.getWriter();try{await o.write((new TextEncoder).encode(`${r}\r\n`)),null===(t=this._console)||void 0===t||t.addLine(`> ${r}\r\n`),i.isConnected&&(r&&r!==this._commandHistory[0]&&(this._commandHistory.unshift(r),this._commandHistory.length>100&&this._commandHistory.pop()),this._historyIndex=-1,this._currentInput="",i.value="",i.focus())}finally{try{o.releaseLock()}catch(e){this.logger.error("Ignoring release lock error",e)}}}async disconnect(){var e;this._clickHandler&&(this.removeEventListener("click",this._clickHandler),this._clickHandler=void 0),this._cancelConnection&&(await this._cancelConnection(),this._cancelConnection=void 0),null===(e=this._console)||void 0===e||e.destroy(),this._console=void 0}disconnectedCallback(){var e;this._clickHandler&&(this.removeEventListener("click",this._clickHandler),this._clickHandler=void 0),this._cancelConnection&&(this._cancelConnection(),this._cancelConnection=void 0),null===(e=this._console)||void 0===e||e.destroy(),this._console=void 0}async reset(){if(this.logger.debug("Triggering reset."),this.onReset)try{await this.onReset()}catch(e){this.logger.error("Reset callback failed:",e)}await se(1e3)}}customElements.define("ew-console",de);const ce=Symbol.for(""),he=e=>{if(e?.r===ce)return e?._$litStatic$},pe=(e,...t)=>({_$litStatic$:t.reduce((t,i,r)=>t+(e=>{if(void 0!==e._$litStatic$)return e._$litStatic$;throw Error(`Value passed to 'literal' function must be a 'literal' result: ${e}. Use 'unsafeStatic' to pass non-literal values, but\n            take care to ensure page security.`)})(i)+e[r+1],e[0]),r:ce}),ue=new Map,fe=(e=>(t,...i)=>{const r=i.length;let o,s;const a=[],l=[];let n,d=0,c=!1;for(;d<r;){for(n=t[d];d<r&&void 0!==(s=i[d],o=he(s));)n+=o+t[++d],c=!0;d!==r&&l.push(s),a.push(n),d++}if(d===r&&a.push(t[r]),c){const e=a.join("$$lit$$");void 0===(t=ue.get(e))&&(a.raw=a,ue.set(e,t=a)),i=l}return e(t,...i)})(u);function ge(e,t=!0){return t&&"rtl"===getComputedStyle(e).getPropertyValue("direction").trim()}const me=o(s(a));class ve extends me{get name(){return this.getAttribute("name")??""}set name(e){this.setAttribute("name",e)}get form(){return this[t].form}get labels(){return this[t].labels}constructor(){super(),this.disabled=!1,this.softDisabled=!1,this.flipIconInRtl=!1,this.href="",this.download="",this.target="",this.ariaLabelSelected="",this.toggle=!1,this.selected=!1,this.type="submit",this.value="",this.flipIcon=ge(this,this.flipIconInRtl),this.addEventListener("click",this.handleClick.bind(this))}willUpdate(){this.href&&(this.disabled=!1,this.softDisabled=!1)}render(){const e=this.href?pe`div`:pe`button`,{ariaLabel:t,ariaHasPopup:i,ariaExpanded:r}=this,o=t&&this.ariaLabelSelected,s=this.toggle?this.selected:p;let a=p;return this.href||(a=o&&this.selected?this.ariaLabelSelected:t),fe`<${e}
        class="icon-button ${h(this.getRenderClasses())}"
        id="button"
        aria-label="${a||p}"
        aria-haspopup="${!this.href&&i||p}"
        aria-expanded="${!this.href&&r||p}"
        aria-pressed="${s}"
        aria-disabled=${!this.href&&this.softDisabled||p}
        ?disabled="${!this.href&&this.disabled}"
        @click="${this.handleClickOnChild}">
        ${this.renderFocusRing()}
        ${this.renderRipple()}
        ${this.selected?p:this.renderIcon()}
        ${this.selected?this.renderSelectedIcon():p}
        ${this.href?this.renderLink():this.renderTouchTarget()}
  </${e}>`}renderLink(){const{ariaLabel:e}=this;return u`
      <a
        class="link"
        id="link"
        href="${this.href}"
        download="${this.download||p}"
        target="${this.target||p}"
        aria-label="${e||p}">
        ${this.renderTouchTarget()}
      </a>
    `}getRenderClasses(){return{"flip-icon":this.flipIcon,selected:this.toggle&&this.selected}}renderIcon(){return u`<span class="icon"><slot></slot></span>`}renderSelectedIcon(){return u`<span class="icon icon--selected"
      ><slot name="selected"><slot></slot></slot
    ></span>`}renderTouchTarget(){return u`<span class="touch"></span>`}renderFocusRing(){return u`<md-focus-ring
      part="focus-ring"
      for=${this.href?"link":"button"}></md-focus-ring>`}renderRipple(){const e=!this.href&&(this.disabled||this.softDisabled);return u`<md-ripple
      for=${this.href?"link":p}
      ?disabled="${e}"></md-ripple>`}connectedCallback(){this.flipIcon=ge(this,this.flipIconInRtl),super.connectedCallback()}handleClick(e){if(!this.href&&this.softDisabled)return e.stopImmediatePropagation(),void e.preventDefault()}async handleClickOnChild(e){await 0,!this.toggle||this.disabled||this.softDisabled||e.defaultPrevented||(this.selected=!this.selected,this.dispatchEvent(new InputEvent("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0})))}}m(ve),ve.formAssociated=!0,ve.shadowRootOptions={mode:"open",delegatesFocus:!0},i([r({type:Boolean,reflect:!0})],ve.prototype,"disabled",void 0),i([r({type:Boolean,attribute:"soft-disabled",reflect:!0})],ve.prototype,"softDisabled",void 0),i([r({type:Boolean,attribute:"flip-icon-in-rtl"})],ve.prototype,"flipIconInRtl",void 0),i([r()],ve.prototype,"href",void 0),i([r()],ve.prototype,"download",void 0),i([r()],ve.prototype,"target",void 0),i([r({attribute:"aria-label-selected"})],ve.prototype,"ariaLabelSelected",void 0),i([r({type:Boolean})],ve.prototype,"toggle",void 0),i([r({type:Boolean,reflect:!0})],ve.prototype,"selected",void 0),i([r()],ve.prototype,"type",void 0),i([r({reflect:!0})],ve.prototype,"value",void 0),i([l()],ve.prototype,"flipIcon",void 0);const be=g`:host{display:inline-flex;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0);height:var(--_container-height);width:var(--_container-width);justify-content:center}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_container-height))/2) max(0px,(48px - var(--_container-width))/2)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_container-shape-start-start);--md-focus-ring-shape-start-end: var(--_container-shape-start-end);--md-focus-ring-shape-end-end: var(--_container-shape-end-end);--md-focus-ring-shape-end-start: var(--_container-shape-end-start)}:host(:is([disabled],[soft-disabled])){pointer-events:none}.icon-button{place-items:center;background:none;border:none;box-sizing:border-box;cursor:pointer;display:flex;place-content:center;outline:none;padding:0;position:relative;text-decoration:none;user-select:none;z-index:0;flex:1;border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end)}.icon ::slotted(*){font-size:var(--_icon-size);height:var(--_icon-size);width:var(--_icon-size);font-weight:inherit}md-ripple{z-index:-1;border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-start-radius:var(--_container-shape-end-start);border-end-end-radius:var(--_container-shape-end-end)}.flip-icon .icon{transform:scaleX(-1)}.icon{display:inline-flex}.link{display:grid;height:100%;outline:none;place-items:center;position:absolute;width:100%}.touch{position:absolute;height:max(48px,100%);width:max(48px,100%)}:host([touch-target=none]) .touch{display:none}@media(forced-colors: active){:host(:is([disabled],[soft-disabled])){--_disabled-icon-color: GrayText;--_disabled-icon-opacity: 1}}
`,ye=g`:host{--_disabled-icon-color: var(--md-icon-button-disabled-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-icon-opacity: var(--md-icon-button-disabled-icon-opacity, 0.38);--_icon-size: var(--md-icon-button-icon-size, 24px);--_selected-focus-icon-color: var(--md-icon-button-selected-focus-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-hover-icon-color: var(--md-icon-button-selected-hover-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-hover-state-layer-color: var(--md-icon-button-selected-hover-state-layer-color, var(--md-sys-color-primary, #6750a4));--_selected-hover-state-layer-opacity: var(--md-icon-button-selected-hover-state-layer-opacity, 0.08);--_selected-icon-color: var(--md-icon-button-selected-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-pressed-icon-color: var(--md-icon-button-selected-pressed-icon-color, var(--md-sys-color-primary, #6750a4));--_selected-pressed-state-layer-color: var(--md-icon-button-selected-pressed-state-layer-color, var(--md-sys-color-primary, #6750a4));--_selected-pressed-state-layer-opacity: var(--md-icon-button-selected-pressed-state-layer-opacity, 0.12);--_state-layer-height: var(--md-icon-button-state-layer-height, 40px);--_state-layer-shape: var(--md-icon-button-state-layer-shape, var(--md-sys-shape-corner-full, 9999px));--_state-layer-width: var(--md-icon-button-state-layer-width, 40px);--_focus-icon-color: var(--md-icon-button-focus-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-icon-color: var(--md-icon-button-hover-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-icon-button-hover-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-opacity: var(--md-icon-button-hover-state-layer-opacity, 0.08);--_icon-color: var(--md-icon-button-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-icon-color: var(--md-icon-button-pressed-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-state-layer-color: var(--md-icon-button-pressed-state-layer-color, var(--md-sys-color-on-surface-variant, #49454f));--_pressed-state-layer-opacity: var(--md-icon-button-pressed-state-layer-opacity, 0.12);--_container-shape-start-start: 0;--_container-shape-start-end: 0;--_container-shape-end-end: 0;--_container-shape-end-start: 0;--_container-height: 0;--_container-width: 0;height:var(--_state-layer-height);width:var(--_state-layer-width)}:host([touch-target=wrapper]){margin:max(0px,(48px - var(--_state-layer-height))/2) max(0px,(48px - var(--_state-layer-width))/2)}md-focus-ring{--md-focus-ring-shape-start-start: var(--_state-layer-shape);--md-focus-ring-shape-start-end: var(--_state-layer-shape);--md-focus-ring-shape-end-end: var(--_state-layer-shape);--md-focus-ring-shape-end-start: var(--_state-layer-shape)}.standard{background-color:rgba(0,0,0,0);color:var(--_icon-color);--md-ripple-hover-color: var(--_hover-state-layer-color);--md-ripple-hover-opacity: var(--_hover-state-layer-opacity);--md-ripple-pressed-color: var(--_pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_pressed-state-layer-opacity)}.standard:hover{color:var(--_hover-icon-color)}.standard:focus{color:var(--_focus-icon-color)}.standard:active{color:var(--_pressed-icon-color)}.standard:is(:disabled,[aria-disabled=true]){color:var(--_disabled-icon-color)}md-ripple{border-radius:var(--_state-layer-shape)}.standard:is(:disabled,[aria-disabled=true]){opacity:var(--_disabled-icon-opacity)}.selected:not(:disabled,[aria-disabled=true]){color:var(--_selected-icon-color)}.selected:not(:disabled,[aria-disabled=true]):hover{color:var(--_selected-hover-icon-color)}.selected:not(:disabled,[aria-disabled=true]):focus{color:var(--_selected-focus-icon-color)}.selected:not(:disabled,[aria-disabled=true]):active{color:var(--_selected-pressed-icon-color)}.selected{--md-ripple-hover-color: var(--_selected-hover-state-layer-color);--md-ripple-hover-opacity: var(--_selected-hover-state-layer-opacity);--md-ripple-pressed-color: var(--_selected-pressed-state-layer-color);--md-ripple-pressed-opacity: var(--_selected-pressed-state-layer-opacity)}
`;class xe extends ve{}xe.styles=[be,ye],customElements.define("ew-icon-button",xe);const _e=g`:host{--_active-indicator-color: var(--md-filled-text-field-active-indicator-color, var(--md-sys-color-on-surface-variant, #49454f));--_active-indicator-height: var(--md-filled-text-field-active-indicator-height, 1px);--_caret-color: var(--md-filled-text-field-caret-color, var(--md-sys-color-primary, #6750a4));--_container-color: var(--md-filled-text-field-container-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_disabled-active-indicator-color: var(--md-filled-text-field-disabled-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-active-indicator-height: var(--md-filled-text-field-disabled-active-indicator-height, 1px);--_disabled-active-indicator-opacity: var(--md-filled-text-field-disabled-active-indicator-opacity, 0.38);--_disabled-container-color: var(--md-filled-text-field-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-opacity: var(--md-filled-text-field-disabled-container-opacity, 0.04);--_disabled-input-text-color: var(--md-filled-text-field-disabled-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-input-text-opacity: var(--md-filled-text-field-disabled-input-text-opacity, 0.38);--_disabled-label-text-color: var(--md-filled-text-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-text-field-disabled-label-text-opacity, 0.38);--_disabled-leading-icon-color: var(--md-filled-text-field-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-icon-opacity: var(--md-filled-text-field-disabled-leading-icon-opacity, 0.38);--_disabled-supporting-text-color: var(--md-filled-text-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-supporting-text-opacity: var(--md-filled-text-field-disabled-supporting-text-opacity, 0.38);--_disabled-trailing-icon-color: var(--md-filled-text-field-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-icon-opacity: var(--md-filled-text-field-disabled-trailing-icon-opacity, 0.38);--_error-active-indicator-color: var(--md-filled-text-field-error-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-focus-active-indicator-color: var(--md-filled-text-field-error-focus-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-focus-caret-color: var(--md-filled-text-field-error-focus-caret-color, var(--md-sys-color-error, #b3261e));--_error-focus-input-text-color: var(--md-filled-text-field-error-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-focus-label-text-color: var(--md-filled-text-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-leading-icon-color: var(--md-filled-text-field-error-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-supporting-text-color: var(--md-filled-text-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-trailing-icon-color: var(--md-filled-text-field-error-focus-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_error-hover-active-indicator-color: var(--md-filled-text-field-error-hover-active-indicator-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-input-text-color: var(--md-filled-text-field-error-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-label-text-color: var(--md-filled-text-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-leading-icon-color: var(--md-filled-text-field-error-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-hover-state-layer-color: var(--md-filled-text-field-error-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-state-layer-opacity: var(--md-filled-text-field-error-hover-state-layer-opacity, 0.08);--_error-hover-supporting-text-color: var(--md-filled-text-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-hover-trailing-icon-color: var(--md-filled-text-field-error-hover-trailing-icon-color, var(--md-sys-color-on-error-container, #410e0b));--_error-input-text-color: var(--md-filled-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_error-label-text-color: var(--md-filled-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_error-leading-icon-color: var(--md-filled-text-field-error-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-supporting-text-color: var(--md-filled-text-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-trailing-icon-color: var(--md-filled-text-field-error-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_focus-active-indicator-color: var(--md-filled-text-field-focus-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_focus-active-indicator-height: var(--md-filled-text-field-focus-active-indicator-height, 3px);--_focus-input-text-color: var(--md-filled-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_focus-label-text-color: var(--md-filled-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_focus-leading-icon-color: var(--md-filled-text-field-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-supporting-text-color: var(--md-filled-text-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-trailing-icon-color: var(--md-filled-text-field-focus-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-active-indicator-color: var(--md-filled-text-field-hover-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-active-indicator-height: var(--md-filled-text-field-hover-active-indicator-height, 1px);--_hover-input-text-color: var(--md-filled-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-filled-text-field-hover-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-leading-icon-color: var(--md-filled-text-field-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-filled-text-field-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-state-layer-opacity: var(--md-filled-text-field-hover-state-layer-opacity, 0.08);--_hover-supporting-text-color: var(--md-filled-text-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-icon-color: var(--md-filled-text-field-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-color: var(--md-filled-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_input-text-font: var(--md-filled-text-field-input-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_input-text-line-height: var(--md-filled-text-field-input-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_input-text-placeholder-color: var(--md-filled-text-field-input-text-placeholder-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-prefix-color: var(--md-filled-text-field-input-text-prefix-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-size: var(--md-filled-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_input-text-suffix-color: var(--md-filled-text-field-input-text-suffix-color, var(--md-sys-color-on-surface-variant, #49454f));--_input-text-weight: var(--md-filled-text-field-input-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_label-text-color: var(--md-filled-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-font: var(--md-filled-text-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-text-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_label-text-populated-line-height: var(--md-filled-text-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_label-text-populated-size: var(--md-filled-text-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_label-text-size: var(--md-filled-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_label-text-weight: var(--md-filled-text-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_leading-icon-color: var(--md-filled-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_leading-icon-size: var(--md-filled-text-field-leading-icon-size, 24px);--_supporting-text-color: var(--md-filled-text-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_supporting-text-font: var(--md-filled-text-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_supporting-text-line-height: var(--md-filled-text-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_supporting-text-size: var(--md-filled-text-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_supporting-text-weight: var(--md-filled-text-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_trailing-icon-color: var(--md-filled-text-field-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-icon-size: var(--md-filled-text-field-trailing-icon-size, 24px);--_container-shape-start-start: var(--md-filled-text-field-container-shape-start-start, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-start-end: var(--md-filled-text-field-container-shape-start-end, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-end: var(--md-filled-text-field-container-shape-end-end, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-start: var(--md-filled-text-field-container-shape-end-start, var(--md-filled-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_icon-input-space: var(--md-filled-text-field-icon-input-space, 16px);--_leading-space: var(--md-filled-text-field-leading-space, 16px);--_trailing-space: var(--md-filled-text-field-trailing-space, 16px);--_top-space: var(--md-filled-text-field-top-space, 16px);--_bottom-space: var(--md-filled-text-field-bottom-space, 16px);--_input-text-prefix-trailing-space: var(--md-filled-text-field-input-text-prefix-trailing-space, 2px);--_input-text-suffix-leading-space: var(--md-filled-text-field-input-text-suffix-leading-space, 2px);--_with-label-top-space: var(--md-filled-text-field-with-label-top-space, 8px);--_with-label-bottom-space: var(--md-filled-text-field-with-label-bottom-space, 8px);--_focus-caret-color: var(--md-filled-text-field-focus-caret-color, var(--md-sys-color-primary, #6750a4));--_with-leading-icon-leading-space: var(--md-filled-text-field-with-leading-icon-leading-space, 12px);--_with-trailing-icon-trailing-space: var(--md-filled-text-field-with-trailing-icon-trailing-space, 12px);--md-filled-field-active-indicator-color: var(--_active-indicator-color);--md-filled-field-active-indicator-height: var(--_active-indicator-height);--md-filled-field-bottom-space: var(--_bottom-space);--md-filled-field-container-color: var(--_container-color);--md-filled-field-container-shape-end-end: var(--_container-shape-end-end);--md-filled-field-container-shape-end-start: var(--_container-shape-end-start);--md-filled-field-container-shape-start-end: var(--_container-shape-start-end);--md-filled-field-container-shape-start-start: var(--_container-shape-start-start);--md-filled-field-content-color: var(--_input-text-color);--md-filled-field-content-font: var(--_input-text-font);--md-filled-field-content-line-height: var(--_input-text-line-height);--md-filled-field-content-size: var(--_input-text-size);--md-filled-field-content-space: var(--_icon-input-space);--md-filled-field-content-weight: var(--_input-text-weight);--md-filled-field-disabled-active-indicator-color: var(--_disabled-active-indicator-color);--md-filled-field-disabled-active-indicator-height: var(--_disabled-active-indicator-height);--md-filled-field-disabled-active-indicator-opacity: var(--_disabled-active-indicator-opacity);--md-filled-field-disabled-container-color: var(--_disabled-container-color);--md-filled-field-disabled-container-opacity: var(--_disabled-container-opacity);--md-filled-field-disabled-content-color: var(--_disabled-input-text-color);--md-filled-field-disabled-content-opacity: var(--_disabled-input-text-opacity);--md-filled-field-disabled-label-text-color: var(--_disabled-label-text-color);--md-filled-field-disabled-label-text-opacity: var(--_disabled-label-text-opacity);--md-filled-field-disabled-leading-content-color: var(--_disabled-leading-icon-color);--md-filled-field-disabled-leading-content-opacity: var(--_disabled-leading-icon-opacity);--md-filled-field-disabled-supporting-text-color: var(--_disabled-supporting-text-color);--md-filled-field-disabled-supporting-text-opacity: var(--_disabled-supporting-text-opacity);--md-filled-field-disabled-trailing-content-color: var(--_disabled-trailing-icon-color);--md-filled-field-disabled-trailing-content-opacity: var(--_disabled-trailing-icon-opacity);--md-filled-field-error-active-indicator-color: var(--_error-active-indicator-color);--md-filled-field-error-content-color: var(--_error-input-text-color);--md-filled-field-error-focus-active-indicator-color: var(--_error-focus-active-indicator-color);--md-filled-field-error-focus-content-color: var(--_error-focus-input-text-color);--md-filled-field-error-focus-label-text-color: var(--_error-focus-label-text-color);--md-filled-field-error-focus-leading-content-color: var(--_error-focus-leading-icon-color);--md-filled-field-error-focus-supporting-text-color: var(--_error-focus-supporting-text-color);--md-filled-field-error-focus-trailing-content-color: var(--_error-focus-trailing-icon-color);--md-filled-field-error-hover-active-indicator-color: var(--_error-hover-active-indicator-color);--md-filled-field-error-hover-content-color: var(--_error-hover-input-text-color);--md-filled-field-error-hover-label-text-color: var(--_error-hover-label-text-color);--md-filled-field-error-hover-leading-content-color: var(--_error-hover-leading-icon-color);--md-filled-field-error-hover-state-layer-color: var(--_error-hover-state-layer-color);--md-filled-field-error-hover-state-layer-opacity: var(--_error-hover-state-layer-opacity);--md-filled-field-error-hover-supporting-text-color: var(--_error-hover-supporting-text-color);--md-filled-field-error-hover-trailing-content-color: var(--_error-hover-trailing-icon-color);--md-filled-field-error-label-text-color: var(--_error-label-text-color);--md-filled-field-error-leading-content-color: var(--_error-leading-icon-color);--md-filled-field-error-supporting-text-color: var(--_error-supporting-text-color);--md-filled-field-error-trailing-content-color: var(--_error-trailing-icon-color);--md-filled-field-focus-active-indicator-color: var(--_focus-active-indicator-color);--md-filled-field-focus-active-indicator-height: var(--_focus-active-indicator-height);--md-filled-field-focus-content-color: var(--_focus-input-text-color);--md-filled-field-focus-label-text-color: var(--_focus-label-text-color);--md-filled-field-focus-leading-content-color: var(--_focus-leading-icon-color);--md-filled-field-focus-supporting-text-color: var(--_focus-supporting-text-color);--md-filled-field-focus-trailing-content-color: var(--_focus-trailing-icon-color);--md-filled-field-hover-active-indicator-color: var(--_hover-active-indicator-color);--md-filled-field-hover-active-indicator-height: var(--_hover-active-indicator-height);--md-filled-field-hover-content-color: var(--_hover-input-text-color);--md-filled-field-hover-label-text-color: var(--_hover-label-text-color);--md-filled-field-hover-leading-content-color: var(--_hover-leading-icon-color);--md-filled-field-hover-state-layer-color: var(--_hover-state-layer-color);--md-filled-field-hover-state-layer-opacity: var(--_hover-state-layer-opacity);--md-filled-field-hover-supporting-text-color: var(--_hover-supporting-text-color);--md-filled-field-hover-trailing-content-color: var(--_hover-trailing-icon-color);--md-filled-field-label-text-color: var(--_label-text-color);--md-filled-field-label-text-font: var(--_label-text-font);--md-filled-field-label-text-line-height: var(--_label-text-line-height);--md-filled-field-label-text-populated-line-height: var(--_label-text-populated-line-height);--md-filled-field-label-text-populated-size: var(--_label-text-populated-size);--md-filled-field-label-text-size: var(--_label-text-size);--md-filled-field-label-text-weight: var(--_label-text-weight);--md-filled-field-leading-content-color: var(--_leading-icon-color);--md-filled-field-leading-space: var(--_leading-space);--md-filled-field-supporting-text-color: var(--_supporting-text-color);--md-filled-field-supporting-text-font: var(--_supporting-text-font);--md-filled-field-supporting-text-line-height: var(--_supporting-text-line-height);--md-filled-field-supporting-text-size: var(--_supporting-text-size);--md-filled-field-supporting-text-weight: var(--_supporting-text-weight);--md-filled-field-top-space: var(--_top-space);--md-filled-field-trailing-content-color: var(--_trailing-icon-color);--md-filled-field-trailing-space: var(--_trailing-space);--md-filled-field-with-label-bottom-space: var(--_with-label-bottom-space);--md-filled-field-with-label-top-space: var(--_with-label-top-space);--md-filled-field-with-leading-content-leading-space: var(--_with-leading-icon-leading-space);--md-filled-field-with-trailing-content-trailing-space: var(--_with-trailing-icon-trailing-space)}
`;class we extends a{constructor(){super(...arguments),this.disabled=!1,this.error=!1,this.focused=!1,this.label="",this.noAsterisk=!1,this.populated=!1,this.required=!1,this.resizable=!1,this.supportingText="",this.errorText="",this.count=-1,this.max=-1,this.hasStart=!1,this.hasEnd=!1,this.isAnimating=!1,this.refreshErrorAlert=!1,this.disableTransitions=!1}get counterText(){const e=this.count??-1,t=this.max??-1;return e<0||t<=0?"":`${e} / ${t}`}get supportingOrErrorText(){return this.error&&this.errorText?this.errorText:this.supportingText}reannounceError(){this.refreshErrorAlert=!0}update(e){e.has("disabled")&&void 0!==e.get("disabled")&&(this.disableTransitions=!0),this.disabled&&this.focused&&(e.set("focused",!0),this.focused=!1),this.animateLabelIfNeeded({wasFocused:e.get("focused"),wasPopulated:e.get("populated")}),super.update(e)}render(){const e=this.renderLabel(!0),t=this.renderLabel(!1),i=this.renderOutline?.(e),r={disabled:this.disabled,"disable-transitions":this.disableTransitions,error:this.error&&!this.disabled,focused:this.focused,"with-start":this.hasStart,"with-end":this.hasEnd,populated:this.populated,resizable:this.resizable,required:this.required,"no-label":!this.label};return u`
      <div class="field ${h(r)}">
        <div class="container-overflow">
          ${this.renderBackground?.()}
          <slot name="container"></slot>
          ${this.renderStateLayer?.()} ${this.renderIndicator?.()} ${i}
          <div class="container">
            <div class="start">
              <slot name="start"></slot>
            </div>
            <div class="middle">
              <div class="label-wrapper">
                ${t} ${i?p:e}
              </div>
              <div class="content">
                <slot></slot>
              </div>
            </div>
            <div class="end">
              <slot name="end"></slot>
            </div>
          </div>
        </div>
        ${this.renderSupportingText()}
      </div>
    `}updated(e){(e.has("supportingText")||e.has("errorText")||e.has("count")||e.has("max"))&&this.updateSlottedAriaDescribedBy(),this.refreshErrorAlert&&requestAnimationFrame(()=>{this.refreshErrorAlert=!1}),this.disableTransitions&&requestAnimationFrame(()=>{this.disableTransitions=!1})}renderSupportingText(){const{supportingOrErrorText:e,counterText:t}=this;if(!e&&!t)return p;const i=u`<span>${e}</span>`,r=t?u`<span class="counter">${t}</span>`:p,o=this.error&&this.errorText&&!this.refreshErrorAlert;return u`
      <div class="supporting-text" role=${o?"alert":p}>${i}${r}</div>
      <slot
        name="aria-describedby"
        @slotchange=${this.updateSlottedAriaDescribedBy}></slot>
    `}updateSlottedAriaDescribedBy(){for(const e of this.slottedAriaDescribedBy)b(u`${this.supportingOrErrorText} ${this.counterText}`,e),e.setAttribute("hidden","")}renderLabel(e){if(!this.label)return p;let t;t=e?this.focused||this.populated||this.isAnimating:!this.focused&&!this.populated&&!this.isAnimating;const i={hidden:!t,floating:e,resting:!e},r=`${this.label}${this.required&&!this.noAsterisk?"*":""}`;return u`
      <span class="label ${h(i)}" aria-hidden=${!t}
        >${r}</span
      >
    `}animateLabelIfNeeded({wasFocused:e,wasPopulated:t}){if(!this.label)return;e??=this.focused,t??=this.populated;(e||t)!==(this.focused||this.populated)&&(this.isAnimating=!0,this.labelAnimation?.cancel(),this.labelAnimation=this.floatingLabelEl?.animate(this.getLabelKeyframes(),{duration:150,easing:y.STANDARD}),this.labelAnimation?.addEventListener("finish",()=>{this.isAnimating=!1}))}getLabelKeyframes(){const{floatingLabelEl:e,restingLabelEl:t}=this;if(!e||!t)return[];const{x:i,y:r,height:o}=e.getBoundingClientRect(),{x:s,y:a,height:l}=t.getBoundingClientRect(),n=e.scrollWidth,d=t.scrollWidth,c=d/n,h=`translateX(${s-i}px) translateY(${a-r+Math.round((l-o*c)/2)}px) scale(${c})`,p="translateX(0) translateY(0) scale(1)",u=t.clientWidth,f=d>u?u/c+"px":"";return this.focused||this.populated?[{transform:h,width:f},{transform:p,width:f}]:[{transform:p,width:f},{transform:h,width:f}]}getSurfacePositionClientRect(){return this.containerEl.getBoundingClientRect()}}i([r({type:Boolean})],we.prototype,"disabled",void 0),i([r({type:Boolean})],we.prototype,"error",void 0),i([r({type:Boolean})],we.prototype,"focused",void 0),i([r()],we.prototype,"label",void 0),i([r({type:Boolean,attribute:"no-asterisk"})],we.prototype,"noAsterisk",void 0),i([r({type:Boolean})],we.prototype,"populated",void 0),i([r({type:Boolean})],we.prototype,"required",void 0),i([r({type:Boolean})],we.prototype,"resizable",void 0),i([r({attribute:"supporting-text"})],we.prototype,"supportingText",void 0),i([r({attribute:"error-text"})],we.prototype,"errorText",void 0),i([r({type:Number})],we.prototype,"count",void 0),i([r({type:Number})],we.prototype,"max",void 0),i([r({type:Boolean,attribute:"has-start"})],we.prototype,"hasStart",void 0),i([r({type:Boolean,attribute:"has-end"})],we.prototype,"hasEnd",void 0),i([v({slot:"aria-describedby"})],we.prototype,"slottedAriaDescribedBy",void 0),i([l()],we.prototype,"isAnimating",void 0),i([l()],we.prototype,"refreshErrorAlert",void 0),i([l()],we.prototype,"disableTransitions",void 0),i([n(".label.floating")],we.prototype,"floatingLabelEl",void 0),i([n(".label.resting")],we.prototype,"restingLabelEl",void 0),i([n(".container")],we.prototype,"containerEl",void 0);class ke extends we{renderBackground(){return u` <div class="background"></div> `}renderStateLayer(){return u` <div class="state-layer"></div> `}renderIndicator(){return u`<div class="active-indicator"></div>`}}const Se=g`@layer styles{:host{--_active-indicator-color: var(--md-filled-field-active-indicator-color, var(--md-sys-color-on-surface-variant, #49454f));--_active-indicator-height: var(--md-filled-field-active-indicator-height, 1px);--_bottom-space: var(--md-filled-field-bottom-space, 16px);--_container-color: var(--md-filled-field-container-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_content-color: var(--md-filled-field-content-color, var(--md-sys-color-on-surface, #1d1b20));--_content-font: var(--md-filled-field-content-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_content-line-height: var(--md-filled-field-content-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_content-size: var(--md-filled-field-content-size, var(--md-sys-typescale-body-large-size, 1rem));--_content-space: var(--md-filled-field-content-space, 16px);--_content-weight: var(--md-filled-field-content-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_disabled-active-indicator-color: var(--md-filled-field-disabled-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-active-indicator-height: var(--md-filled-field-disabled-active-indicator-height, 1px);--_disabled-active-indicator-opacity: var(--md-filled-field-disabled-active-indicator-opacity, 0.38);--_disabled-container-color: var(--md-filled-field-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-container-opacity: var(--md-filled-field-disabled-container-opacity, 0.04);--_disabled-content-color: var(--md-filled-field-disabled-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-content-opacity: var(--md-filled-field-disabled-content-opacity, 0.38);--_disabled-label-text-color: var(--md-filled-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-label-text-opacity: var(--md-filled-field-disabled-label-text-opacity, 0.38);--_disabled-leading-content-color: var(--md-filled-field-disabled-leading-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-leading-content-opacity: var(--md-filled-field-disabled-leading-content-opacity, 0.38);--_disabled-supporting-text-color: var(--md-filled-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-supporting-text-opacity: var(--md-filled-field-disabled-supporting-text-opacity, 0.38);--_disabled-trailing-content-color: var(--md-filled-field-disabled-trailing-content-color, var(--md-sys-color-on-surface, #1d1b20));--_disabled-trailing-content-opacity: var(--md-filled-field-disabled-trailing-content-opacity, 0.38);--_error-active-indicator-color: var(--md-filled-field-error-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-content-color: var(--md-filled-field-error-content-color, var(--md-sys-color-on-surface, #1d1b20));--_error-focus-active-indicator-color: var(--md-filled-field-error-focus-active-indicator-color, var(--md-sys-color-error, #b3261e));--_error-focus-content-color: var(--md-filled-field-error-focus-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-label-text-color: var(--md-filled-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-leading-content-color: var(--md-filled-field-error-focus-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-focus-supporting-text-color: var(--md-filled-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-focus-trailing-content-color: var(--md-filled-field-error-focus-trailing-content-color, var(--md-sys-color-error, #b3261e));--_error-hover-active-indicator-color: var(--md-filled-field-error-hover-active-indicator-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-content-color: var(--md-filled-field-error-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-label-text-color: var(--md-filled-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_error-hover-leading-content-color: var(--md-filled-field-error-hover-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-hover-state-layer-color: var(--md-filled-field-error-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_error-hover-state-layer-opacity: var(--md-filled-field-error-hover-state-layer-opacity, 0.08);--_error-hover-supporting-text-color: var(--md-filled-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-hover-trailing-content-color: var(--md-filled-field-error-hover-trailing-content-color, var(--md-sys-color-on-error-container, #410e0b));--_error-label-text-color: var(--md-filled-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_error-leading-content-color: var(--md-filled-field-error-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_error-supporting-text-color: var(--md-filled-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_error-trailing-content-color: var(--md-filled-field-error-trailing-content-color, var(--md-sys-color-error, #b3261e));--_focus-active-indicator-color: var(--md-filled-field-focus-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_focus-active-indicator-height: var(--md-filled-field-focus-active-indicator-height, 3px);--_focus-content-color: var(--md-filled-field-focus-content-color, var(--md-sys-color-on-surface, #1d1b20));--_focus-label-text-color: var(--md-filled-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_focus-leading-content-color: var(--md-filled-field-focus-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-supporting-text-color: var(--md-filled-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_focus-trailing-content-color: var(--md-filled-field-focus-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-active-indicator-color: var(--md-filled-field-hover-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-active-indicator-height: var(--md-filled-field-hover-active-indicator-height, 1px);--_hover-content-color: var(--md-filled-field-hover-content-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-label-text-color: var(--md-filled-field-hover-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-leading-content-color: var(--md-filled-field-hover-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-state-layer-color: var(--md-filled-field-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_hover-state-layer-opacity: var(--md-filled-field-hover-state-layer-opacity, 0.08);--_hover-supporting-text-color: var(--md-filled-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_hover-trailing-content-color: var(--md-filled-field-hover-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-color: var(--md-filled-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_label-text-font: var(--md-filled-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_label-text-line-height: var(--md-filled-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_label-text-populated-line-height: var(--md-filled-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_label-text-populated-size: var(--md-filled-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_label-text-size: var(--md-filled-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_label-text-weight: var(--md-filled-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_leading-content-color: var(--md-filled-field-leading-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_leading-space: var(--md-filled-field-leading-space, 16px);--_supporting-text-color: var(--md-filled-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_supporting-text-font: var(--md-filled-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_supporting-text-leading-space: var(--md-filled-field-supporting-text-leading-space, 16px);--_supporting-text-line-height: var(--md-filled-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_supporting-text-size: var(--md-filled-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_supporting-text-top-space: var(--md-filled-field-supporting-text-top-space, 4px);--_supporting-text-trailing-space: var(--md-filled-field-supporting-text-trailing-space, 16px);--_supporting-text-weight: var(--md-filled-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_top-space: var(--md-filled-field-top-space, 16px);--_trailing-content-color: var(--md-filled-field-trailing-content-color, var(--md-sys-color-on-surface-variant, #49454f));--_trailing-space: var(--md-filled-field-trailing-space, 16px);--_with-label-bottom-space: var(--md-filled-field-with-label-bottom-space, 8px);--_with-label-top-space: var(--md-filled-field-with-label-top-space, 8px);--_with-leading-content-leading-space: var(--md-filled-field-with-leading-content-leading-space, 12px);--_with-trailing-content-trailing-space: var(--md-filled-field-with-trailing-content-trailing-space, 12px);--_container-shape-start-start: var(--md-filled-field-container-shape-start-start, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-start-end: var(--md-filled-field-container-shape-start-end, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_container-shape-end-end: var(--md-filled-field-container-shape-end-end, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_container-shape-end-start: var(--md-filled-field-container-shape-end-start, var(--md-filled-field-container-shape, var(--md-sys-shape-corner-none, 0px)))}.background,.state-layer{border-radius:inherit;inset:0;pointer-events:none;position:absolute}.background{background:var(--_container-color)}.state-layer{visibility:hidden}.field:not(.disabled):hover .state-layer{visibility:visible}.label.floating{position:absolute;top:var(--_with-label-top-space)}.field:not(.with-start) .label-wrapper{margin-inline-start:var(--_leading-space)}.field:not(.with-end) .label-wrapper{margin-inline-end:var(--_trailing-space)}.active-indicator{inset:auto 0 0 0;pointer-events:none;position:absolute;width:100%;z-index:1}.active-indicator::before,.active-indicator::after{border-bottom:var(--_active-indicator-height) solid var(--_active-indicator-color);inset:auto 0 0 0;content:"";position:absolute;width:100%}.active-indicator::after{opacity:0;transition:opacity 150ms cubic-bezier(0.2, 0, 0, 1)}.focused .active-indicator::after{opacity:1}.field:not(.with-start) .content ::slotted(*){padding-inline-start:var(--_leading-space)}.field:not(.with-end) .content ::slotted(*){padding-inline-end:var(--_trailing-space)}.field:not(.no-label) .content ::slotted(:not(textarea)){padding-bottom:var(--_with-label-bottom-space);padding-top:calc(var(--_with-label-top-space) + var(--_label-text-populated-line-height))}.field:not(.no-label) .content ::slotted(textarea){margin-bottom:var(--_with-label-bottom-space);margin-top:calc(var(--_with-label-top-space) + var(--_label-text-populated-line-height))}:hover .active-indicator::before{border-bottom-color:var(--_hover-active-indicator-color);border-bottom-width:var(--_hover-active-indicator-height)}.active-indicator::after{border-bottom-color:var(--_focus-active-indicator-color);border-bottom-width:var(--_focus-active-indicator-height)}:hover .state-layer{background:var(--_hover-state-layer-color);opacity:var(--_hover-state-layer-opacity)}.disabled .active-indicator::before{border-bottom-color:var(--_disabled-active-indicator-color);border-bottom-width:var(--_disabled-active-indicator-height);opacity:var(--_disabled-active-indicator-opacity)}.disabled .background{background:var(--_disabled-container-color);opacity:var(--_disabled-container-opacity)}.error .active-indicator::before{border-bottom-color:var(--_error-active-indicator-color)}.error:hover .active-indicator::before{border-bottom-color:var(--_error-hover-active-indicator-color)}.error:hover .state-layer{background:var(--_error-hover-state-layer-color);opacity:var(--_error-hover-state-layer-opacity)}.error .active-indicator::after{border-bottom-color:var(--_error-focus-active-indicator-color)}.resizable .container{bottom:var(--_focus-active-indicator-height);clip-path:inset(var(--_focus-active-indicator-height) 0 0 0)}.resizable .container>*{top:var(--_focus-active-indicator-height)}}@layer hcm{@media(forced-colors: active){.disabled .active-indicator::before{border-color:GrayText;opacity:1}}}
`,$e=g`:host{display:inline-flex;resize:both}.field{display:flex;flex:1;flex-direction:column;writing-mode:horizontal-tb;max-width:100%}.container-overflow{border-start-start-radius:var(--_container-shape-start-start);border-start-end-radius:var(--_container-shape-start-end);border-end-end-radius:var(--_container-shape-end-end);border-end-start-radius:var(--_container-shape-end-start);display:flex;height:100%;position:relative}.container{align-items:center;border-radius:inherit;display:flex;flex:1;max-height:100%;min-height:100%;min-width:min-content;position:relative}.field,.container-overflow{resize:inherit}.resizable:not(.disabled) .container{resize:inherit;overflow:hidden}.disabled{pointer-events:none}slot[name=container]{border-radius:inherit}slot[name=container]::slotted(*){border-radius:inherit;inset:0;pointer-events:none;position:absolute}@layer styles{.start,.middle,.end{display:flex;box-sizing:border-box;height:100%;position:relative}.start{color:var(--_leading-content-color)}.end{color:var(--_trailing-content-color)}.start,.end{align-items:center;justify-content:center}.with-start .start{margin-inline:var(--_with-leading-content-leading-space) var(--_content-space)}.with-end .end{margin-inline:var(--_content-space) var(--_with-trailing-content-trailing-space)}.middle{align-items:stretch;align-self:baseline;flex:1}.content{color:var(--_content-color);display:flex;flex:1;opacity:0;transition:opacity 83ms cubic-bezier(0.2, 0, 0, 1)}.no-label .content,.focused .content,.populated .content{opacity:1;transition-delay:67ms}:is(.disabled,.disable-transitions) .content{transition:none}.content ::slotted(*){all:unset;color:currentColor;font-family:var(--_content-font);font-size:var(--_content-size);line-height:var(--_content-line-height);font-weight:var(--_content-weight);width:100%;overflow-wrap:revert;white-space:revert}.content ::slotted(:not(textarea)){padding-top:var(--_top-space);padding-bottom:var(--_bottom-space)}.content ::slotted(textarea){margin-top:var(--_top-space);margin-bottom:var(--_bottom-space)}:hover .content{color:var(--_hover-content-color)}:hover .start{color:var(--_hover-leading-content-color)}:hover .end{color:var(--_hover-trailing-content-color)}.focused .content{color:var(--_focus-content-color)}.focused .start{color:var(--_focus-leading-content-color)}.focused .end{color:var(--_focus-trailing-content-color)}.disabled .content{color:var(--_disabled-content-color)}.disabled.no-label .content,.disabled.focused .content,.disabled.populated .content{opacity:var(--_disabled-content-opacity)}.disabled .start{color:var(--_disabled-leading-content-color);opacity:var(--_disabled-leading-content-opacity)}.disabled .end{color:var(--_disabled-trailing-content-color);opacity:var(--_disabled-trailing-content-opacity)}.error .content{color:var(--_error-content-color)}.error .start{color:var(--_error-leading-content-color)}.error .end{color:var(--_error-trailing-content-color)}.error:hover .content{color:var(--_error-hover-content-color)}.error:hover .start{color:var(--_error-hover-leading-content-color)}.error:hover .end{color:var(--_error-hover-trailing-content-color)}.error.focused .content{color:var(--_error-focus-content-color)}.error.focused .start{color:var(--_error-focus-leading-content-color)}.error.focused .end{color:var(--_error-focus-trailing-content-color)}}@layer hcm{@media(forced-colors: active){.disabled :is(.start,.content,.end){color:GrayText;opacity:1}}}@layer styles{.label{box-sizing:border-box;color:var(--_label-text-color);overflow:hidden;max-width:100%;text-overflow:ellipsis;white-space:nowrap;z-index:1;font-family:var(--_label-text-font);font-size:var(--_label-text-size);line-height:var(--_label-text-line-height);font-weight:var(--_label-text-weight);width:min-content}.label-wrapper{inset:0;pointer-events:none;position:absolute}.label.resting{position:absolute;top:var(--_top-space)}.label.floating{font-size:var(--_label-text-populated-size);line-height:var(--_label-text-populated-line-height);transform-origin:top left}.label.hidden{opacity:0}.no-label .label{display:none}.label-wrapper{inset:0;position:absolute;text-align:initial}:hover .label{color:var(--_hover-label-text-color)}.focused .label{color:var(--_focus-label-text-color)}.disabled .label{color:var(--_disabled-label-text-color)}.disabled .label:not(.hidden){opacity:var(--_disabled-label-text-opacity)}.error .label{color:var(--_error-label-text-color)}.error:hover .label{color:var(--_error-hover-label-text-color)}.error.focused .label{color:var(--_error-focus-label-text-color)}}@layer hcm{@media(forced-colors: active){.disabled .label:not(.hidden){color:GrayText;opacity:1}}}@layer styles{.supporting-text{color:var(--_supporting-text-color);display:flex;font-family:var(--_supporting-text-font);font-size:var(--_supporting-text-size);line-height:var(--_supporting-text-line-height);font-weight:var(--_supporting-text-weight);gap:16px;justify-content:space-between;padding-inline-start:var(--_supporting-text-leading-space);padding-inline-end:var(--_supporting-text-trailing-space);padding-top:var(--_supporting-text-top-space)}.supporting-text :nth-child(2){flex-shrink:0}:hover .supporting-text{color:var(--_hover-supporting-text-color)}.focus .supporting-text{color:var(--_focus-supporting-text-color)}.disabled .supporting-text{color:var(--_disabled-supporting-text-color);opacity:var(--_disabled-supporting-text-opacity)}.error .supporting-text{color:var(--_error-supporting-text-color)}.error:hover .supporting-text{color:var(--_error-hover-supporting-text-color)}.error.focus .supporting-text{color:var(--_error-focus-supporting-text-color)}}@layer hcm{@media(forced-colors: active){.disabled .supporting-text{color:GrayText;opacity:1}}}
`;let Re=class extends ke{};Re.styles=[$e,Se],Re=i([x("md-filled-field")],Re);const Ee={},Ce=_(class extends w{constructor(e){if(super(e),e.type!==k.PROPERTY&&e.type!==k.ATTRIBUTE&&e.type!==k.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!(e=>void 0===e.strings)(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[t]){if(t===S||t===p)return t;const i=e.element,r=e.name;if(e.type===k.PROPERTY){if(t===i[r])return S}else if(e.type===k.BOOLEAN_ATTRIBUTE){if(!!t===i.hasAttribute(r))return S}else if(e.type===k.ATTRIBUTE&&i.getAttribute(r)===t+"")return S;return((e,t=Ee)=>{e._$AH=t})(e),t}}),Ie="important",Te=" !"+Ie,Fe=_(class extends w{constructor(e){if(super(e),e.type!==k.ATTRIBUTE||"style"!==e.name||e.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(e){return Object.keys(e).reduce((t,i)=>{const r=e[i];return null==r?t:t+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${r};`},"")}update(e,[t]){const{style:i}=e.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(t)),this.render(t);for(const e of this.ft)null==t[e]&&(this.ft.delete(e),e.includes("-")?i.removeProperty(e):i[e]=null);for(const e in t){const r=t[e];if(null!=r){this.ft.add(e);const t="string"==typeof r&&r.endsWith(Te);e.includes("-")||t?i.setProperty(e,t?r.slice(0,-11):r,t?Ie:""):i[e]=r}}return S}}),Oe={fromAttribute:e=>e??"",toAttribute:e=>e||null},Ae=Symbol("onReportValidity"),Le=Symbol("privateCleanupFormListeners"),Pe=Symbol("privateDoNotReportInvalid"),De=Symbol("privateIsSelfReportingValidity"),ze=Symbol("privateCallOnReportValidity");function Be(e){var i,r,o;class s extends e{constructor(...e){super(...e),this[i]=new AbortController,this[r]=!1,this[o]=!1,this.addEventListener("invalid",e=>{!this[Pe]&&e.isTrusted&&this.addEventListener("invalid",()=>{this[ze](e)},{once:!0})},{capture:!0})}checkValidity(){this[Pe]=!0;const e=super.checkValidity();return this[Pe]=!1,e}reportValidity(){this[De]=!0;const e=super.reportValidity();return e&&this[ze](null),this[De]=!1,e}[(i=Le,r=Pe,o=De,ze)](e){const i=e?.defaultPrevented;if(i)return;this[Ae](e);!i&&e?.defaultPrevented&&(this[De]||function(e,t){if(!e)return!0;let i;for(const t of e.elements)if(t.matches(":invalid")){i=t;break}return i===t}(this[t].form,this))&&this.focus()}[Ae](e){throw new Error("Implement [onReportValidity]")}formAssociatedCallback(e){super.formAssociatedCallback&&super.formAssociatedCallback(e),this[Le].abort(),e&&(this[Le]=new AbortController,function(e,t,i,r){const o=function(e){if(!Ue.has(e)){const t=new EventTarget;Ue.set(e,t);for(const i of["reportValidity","requestSubmit"]){const r=e[i];e[i]=function(){t.dispatchEvent(new Event("before"));const e=Reflect.apply(r,this,arguments);return t.dispatchEvent(new Event("after")),e}}}return Ue.get(e)}(t);let s,a=!1,l=!1;o.addEventListener("before",()=>{l=!0,s=new AbortController,a=!1,e.addEventListener("invalid",()=>{a=!0},{signal:s.signal})},{signal:r}),o.addEventListener("after",()=>{l=!1,s?.abort(),a||i()},{signal:r}),t.addEventListener("submit",()=>{l||i()},{signal:r})}(this,e,()=>{this[ze](null)},this[Le].signal))}}return s}const Ue=new WeakMap;class We extends Z{computeValidity({state:e,renderedControl:t}){let i=t;Ne(e)&&!i?(i=this.inputControl||document.createElement("input"),this.inputControl=i):i||(i=this.textAreaControl||document.createElement("textarea"),this.textAreaControl=i);const r=Ne(e)?i:null;if(r&&(r.type=e.type),i.value!==e.value&&(i.value=e.value),i.required=e.required,r){const t=e;t.pattern?r.pattern=t.pattern:r.removeAttribute("pattern"),t.min?r.min=t.min:r.removeAttribute("min"),t.max?r.max=t.max:r.removeAttribute("max"),t.step?r.step=t.step:r.removeAttribute("step")}return(e.minLength??-1)>-1?i.setAttribute("minlength",String(e.minLength)):i.removeAttribute("minlength"),(e.maxLength??-1)>-1?i.setAttribute("maxlength",String(e.maxLength)):i.removeAttribute("maxlength"),{validity:i.validity,validationMessage:i.validationMessage}}equals({state:e},{state:t}){const i=e.type===t.type&&e.value===t.value&&e.required===t.required&&e.minLength===t.minLength&&e.maxLength===t.maxLength;return Ne(e)&&Ne(t)?i&&e.pattern===t.pattern&&e.min===t.min&&e.max===t.max&&e.step===t.step:i}copy({state:e}){return{state:Ne(e)?this.copyInput(e):this.copyTextArea(e),renderedControl:null}}copyInput(e){const{type:t,pattern:i,min:r,max:o,step:s}=e;return{...this.copySharedState(e),type:t,pattern:i,min:r,max:o,step:s}}copyTextArea(e){return{...this.copySharedState(e),type:e.type}}copySharedState({value:e,required:t,minLength:i,maxLength:r}){return{value:e,required:t,minLength:i,maxLength:r}}}function Ne(e){return"textarea"!==e.type}const qe=o(Be(K(X(s(a)))));class Ve extends qe{constructor(){super(...arguments),this.error=!1,this.errorText="",this.label="",this.noAsterisk=!1,this.required=!1,this.value="",this.prefixText="",this.suffixText="",this.hasLeadingIcon=!1,this.hasTrailingIcon=!1,this.supportingText="",this.textDirection="",this.rows=2,this.cols=20,this.inputMode="",this.max="",this.maxLength=-1,this.min="",this.minLength=-1,this.noSpinner=!1,this.pattern="",this.placeholder="",this.readOnly=!1,this.multiple=!1,this.step="",this.type="text",this.autocomplete="",this.dirty=!1,this.focused=!1,this.nativeError=!1,this.nativeErrorText=""}get selectionDirection(){return this.getInputOrTextarea().selectionDirection}set selectionDirection(e){this.getInputOrTextarea().selectionDirection=e}get selectionEnd(){return this.getInputOrTextarea().selectionEnd}set selectionEnd(e){this.getInputOrTextarea().selectionEnd=e}get selectionStart(){return this.getInputOrTextarea().selectionStart}set selectionStart(e){this.getInputOrTextarea().selectionStart=e}get valueAsNumber(){const e=this.getInput();return e?e.valueAsNumber:NaN}set valueAsNumber(e){const t=this.getInput();t&&(t.valueAsNumber=e,this.value=t.value)}get valueAsDate(){const e=this.getInput();return e?e.valueAsDate:null}set valueAsDate(e){const t=this.getInput();t&&(t.valueAsDate=e,this.value=t.value)}get hasError(){return this.error||this.nativeError}select(){this.getInputOrTextarea().select()}setRangeText(...e){this.getInputOrTextarea().setRangeText(...e),this.value=this.getInputOrTextarea().value}setSelectionRange(e,t,i){this.getInputOrTextarea().setSelectionRange(e,t,i)}showPicker(){const e=this.getInput();e&&e.showPicker()}stepDown(e){const t=this.getInput();t&&(t.stepDown(e),this.value=t.value)}stepUp(e){const t=this.getInput();t&&(t.stepUp(e),this.value=t.value)}reset(){this.dirty=!1,this.value=this.getAttribute("value")??"",this.nativeError=!1,this.nativeErrorText=""}attributeChangedCallback(e,t,i){"value"===e&&this.dirty||super.attributeChangedCallback(e,t,i)}render(){const e={disabled:this.disabled,error:!this.disabled&&this.hasError,textarea:"textarea"===this.type,"no-spinner":this.noSpinner};return u`
      <span class="text-field ${h(e)}">
        ${this.renderField()}
      </span>
    `}updated(e){const t=this.getInputOrTextarea().value;this.value!==t&&(this.value=t)}renderField(){return fe`<${this.fieldTag}
      class="field"
      count=${this.value.length}
      ?disabled=${this.disabled}
      ?error=${this.hasError}
      error-text=${this.getErrorText()}
      ?focused=${this.focused}
      ?has-end=${this.hasTrailingIcon}
      ?has-start=${this.hasLeadingIcon}
      label=${this.label}
      ?no-asterisk=${this.noAsterisk}
      max=${this.maxLength}
      ?populated=${!!this.value}
      ?required=${this.required}
      ?resizable=${"textarea"===this.type}
      supporting-text=${this.supportingText}
    >
      ${this.renderLeadingIcon()}
      ${this.renderInputOrTextarea()}
      ${this.renderTrailingIcon()}
      <div id="description" slot="aria-describedby"></div>
      <slot name="container" slot="container"></slot>
    </${this.fieldTag}>`}renderLeadingIcon(){return u`
      <span class="icon leading" slot="start">
        <slot name="leading-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `}renderTrailingIcon(){return u`
      <span class="icon trailing" slot="end">
        <slot name="trailing-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `}renderInputOrTextarea(){const e={direction:this.textDirection},t=this.ariaLabel||this.label||p,i=this.autocomplete,r=(this.maxLength??-1)>-1,o=(this.minLength??-1)>-1;if("textarea"===this.type)return u`
        <textarea
          class="input"
          style=${Fe(e)}
          aria-describedby="description"
          aria-invalid=${this.hasError}
          aria-label=${t}
          autocomplete=${i||p}
          name=${this.name||p}
          ?disabled=${this.disabled}
          maxlength=${r?this.maxLength:p}
          minlength=${o?this.minLength:p}
          placeholder=${this.placeholder||p}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          rows=${this.rows}
          cols=${this.cols}
          .value=${Ce(this.value)}
          @change=${this.redispatchEvent}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          @input=${this.handleInput}
          @select=${this.redispatchEvent}></textarea>
      `;const s=this.renderPrefix(),a=this.renderSuffix(),l=this.inputMode;return u`
      <div class="input-wrapper">
        ${s}
        <input
          class="input"
          style=${Fe(e)}
          aria-describedby="description"
          aria-invalid=${this.hasError}
          aria-label=${t}
          autocomplete=${i||p}
          name=${this.name||p}
          ?disabled=${this.disabled}
          inputmode=${l||p}
          max=${this.max||p}
          maxlength=${r?this.maxLength:p}
          min=${this.min||p}
          minlength=${o?this.minLength:p}
          pattern=${this.pattern||p}
          placeholder=${this.placeholder||p}
          ?readonly=${this.readOnly}
          ?required=${this.required}
          ?multiple=${this.multiple}
          step=${this.step||p}
          type=${this.type}
          .value=${Ce(this.value)}
          @change=${this.redispatchEvent}
          @focus=${this.handleFocusChange}
          @blur=${this.handleFocusChange}
          @input=${this.handleInput}
          @select=${this.redispatchEvent} />
        ${a}
      </div>
    `}renderPrefix(){return this.renderAffix(this.prefixText,!1)}renderSuffix(){return this.renderAffix(this.suffixText,!0)}renderAffix(e,t){if(!e)return p;return u`<span class="${h({suffix:t,prefix:!t})}">${e}</span>`}getErrorText(){return this.error?this.errorText:this.nativeErrorText}handleFocusChange(){this.focused=this.inputOrTextarea?.matches(":focus")??!1}handleInput(e){this.dirty=!0,this.value=e.target.value}redispatchEvent(e){f(this,e)}getInputOrTextarea(){return this.inputOrTextarea||(this.connectedCallback(),this.scheduleUpdate()),this.isUpdatePending&&this.scheduleUpdate(),this.inputOrTextarea}getInput(){return"textarea"===this.type?null:this.getInputOrTextarea()}handleIconChange(){this.hasLeadingIcon=this.leadingIcons.length>0,this.hasTrailingIcon=this.trailingIcons.length>0}[J](){return this.value}formResetCallback(){this.reset()}formStateRestoreCallback(e){this.value=e}focus(){this.getInputOrTextarea().focus()}[V](){return new We(()=>({state:this,renderedControl:this.inputOrTextarea}))}[M](){return this.inputOrTextarea}[Ae](e){e?.preventDefault();const t=this.getErrorText();this.nativeError=!!e,this.nativeErrorText=this.validationMessage,t===this.getErrorText()&&this.field?.reannounceError()}}Ve.shadowRootOptions={...a.shadowRootOptions,delegatesFocus:!0},i([r({type:Boolean,reflect:!0})],Ve.prototype,"error",void 0),i([r({attribute:"error-text"})],Ve.prototype,"errorText",void 0),i([r()],Ve.prototype,"label",void 0),i([r({type:Boolean,attribute:"no-asterisk"})],Ve.prototype,"noAsterisk",void 0),i([r({type:Boolean,reflect:!0})],Ve.prototype,"required",void 0),i([r()],Ve.prototype,"value",void 0),i([r({attribute:"prefix-text"})],Ve.prototype,"prefixText",void 0),i([r({attribute:"suffix-text"})],Ve.prototype,"suffixText",void 0),i([r({type:Boolean,attribute:"has-leading-icon"})],Ve.prototype,"hasLeadingIcon",void 0),i([r({type:Boolean,attribute:"has-trailing-icon"})],Ve.prototype,"hasTrailingIcon",void 0),i([r({attribute:"supporting-text"})],Ve.prototype,"supportingText",void 0),i([r({attribute:"text-direction"})],Ve.prototype,"textDirection",void 0),i([r({type:Number})],Ve.prototype,"rows",void 0),i([r({type:Number})],Ve.prototype,"cols",void 0),i([r({reflect:!0})],Ve.prototype,"inputMode",void 0),i([r()],Ve.prototype,"max",void 0),i([r({type:Number})],Ve.prototype,"maxLength",void 0),i([r()],Ve.prototype,"min",void 0),i([r({type:Number})],Ve.prototype,"minLength",void 0),i([r({type:Boolean,attribute:"no-spinner"})],Ve.prototype,"noSpinner",void 0),i([r()],Ve.prototype,"pattern",void 0),i([r({reflect:!0,converter:Oe})],Ve.prototype,"placeholder",void 0),i([r({type:Boolean,reflect:!0})],Ve.prototype,"readOnly",void 0),i([r({type:Boolean,reflect:!0})],Ve.prototype,"multiple",void 0),i([r()],Ve.prototype,"step",void 0),i([r({reflect:!0})],Ve.prototype,"type",void 0),i([r({reflect:!0})],Ve.prototype,"autocomplete",void 0),i([l()],Ve.prototype,"dirty",void 0),i([l()],Ve.prototype,"focused",void 0),i([l()],Ve.prototype,"nativeError",void 0),i([l()],Ve.prototype,"nativeErrorText",void 0),i([n(".input")],Ve.prototype,"inputOrTextarea",void 0),i([n(".field")],Ve.prototype,"field",void 0),i([v({slot:"leading-icon"})],Ve.prototype,"leadingIcons",void 0),i([v({slot:"trailing-icon"})],Ve.prototype,"trailingIcons",void 0);class Me extends Ve{constructor(){super(...arguments),this.fieldTag=pe`md-filled-field`}}const He=g`:host{display:inline-flex;outline:none;resize:both;text-align:start;-webkit-tap-highlight-color:rgba(0,0,0,0)}.text-field,.field{width:100%}.text-field{display:inline-flex}.field{cursor:text}.disabled .field{cursor:default}.text-field,.textarea .field{resize:inherit}slot[name=container]{border-radius:inherit}.icon{color:currentColor;display:flex;align-items:center;justify-content:center;fill:currentColor;position:relative}.icon ::slotted(*){display:flex;position:absolute}[has-start] .icon.leading{font-size:var(--_leading-icon-size);height:var(--_leading-icon-size);width:var(--_leading-icon-size)}[has-end] .icon.trailing{font-size:var(--_trailing-icon-size);height:var(--_trailing-icon-size);width:var(--_trailing-icon-size)}.input-wrapper{display:flex}.input-wrapper>*{all:inherit;padding:0}.input{caret-color:var(--_caret-color);overflow-x:hidden;text-align:inherit}.input::placeholder{color:currentColor;opacity:1}.input::-webkit-calendar-picker-indicator{display:none}.input::-webkit-search-decoration,.input::-webkit-search-cancel-button{display:none}@media(forced-colors: active){.input{background:none}}.no-spinner .input::-webkit-inner-spin-button,.no-spinner .input::-webkit-outer-spin-button{display:none}.no-spinner .input[type=number]{-moz-appearance:textfield}:focus-within .input{caret-color:var(--_focus-caret-color)}.error:focus-within .input{caret-color:var(--_error-focus-caret-color)}.text-field:not(.disabled) .prefix{color:var(--_input-text-prefix-color)}.text-field:not(.disabled) .suffix{color:var(--_input-text-suffix-color)}.text-field:not(.disabled) .input::placeholder{color:var(--_input-text-placeholder-color)}.prefix,.suffix{text-wrap:nowrap;width:min-content}.prefix{padding-inline-end:var(--_input-text-prefix-trailing-space)}.suffix{padding-inline-start:var(--_input-text-suffix-leading-space)}
`;class je extends Me{constructor(){super(...arguments),this.fieldTag=pe`md-filled-field`}}je.styles=[He,_e],customElements.define("ew-filled-text-field",je);class Ge extends a{connectedCallback(){super.connectedCallback(),this.setAttribute("aria-hidden","true")}render(){return u`<span class="shadow"></span>`}}const Ke=g`:host,.shadow,.shadow::before,.shadow::after{border-radius:inherit;inset:0;position:absolute;transition-duration:inherit;transition-property:inherit;transition-timing-function:inherit}:host{display:flex;pointer-events:none;transition-property:box-shadow,opacity}.shadow::before,.shadow::after{content:"";transition-property:box-shadow,opacity;--_level: var(--md-elevation-level, 0);--_shadow-color: var(--md-elevation-shadow-color, var(--md-sys-color-shadow, #000))}.shadow::before{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 3,1) + 2*clamp(0,var(--_level) - 4,1))) calc(1px*(2*clamp(0,var(--_level),1) + clamp(0,var(--_level) - 2,1) + clamp(0,var(--_level) - 4,1))) 0px var(--_shadow-color);opacity:.3}.shadow::after{box-shadow:0px calc(1px*(clamp(0,var(--_level),1) + clamp(0,var(--_level) - 1,1) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(3*clamp(0,var(--_level),2) + 2*clamp(0,var(--_level) - 2,3))) calc(1px*(clamp(0,var(--_level),4) + 2*clamp(0,var(--_level) - 4,1))) var(--_shadow-color);opacity:.15}
`;let Je=class extends Ge{};function Ye(e,t=rt){const i=Qe(e,t);return i&&(i.tabIndex=0,i.focus()),i}function Xe(e,t=rt){const i=et(e,t);return i&&(i.tabIndex=0,i.focus()),i}function Ze(e,t=rt){for(let i=0;i<e.length;i++){const r=e[i];if(0===r.tabIndex&&t(r))return{item:r,index:i}}return null}function Qe(e,t=rt){for(const i of e)if(t(i))return i;return null}function et(e,t=rt){for(let i=e.length-1;i>=0;i--){const r=e[i];if(t(r))return r}return null}function tt(e,t,i=rt,r=!0){if(t){const o=function(e,t,i=rt,r=!0){for(let o=1;o<e.length;o++){const s=(o+t)%e.length;if(s<t&&!r)return null;const a=e[s];if(i(a))return a}return e[t]?e[t]:null}(e,t.index,i,r);return o&&(o.tabIndex=0,o.focus()),o}return Ye(e,i)}function it(e,t,i=rt,r=!0){if(t){const o=function(e,t,i=rt,r=!0){for(let o=1;o<e.length;o++){const s=(t-o+e.length)%e.length;if(s>t&&!r)return null;const a=e[s];if(i(a))return a}return e[t]?e[t]:null}(e,t.index,i,r);return o&&(o.tabIndex=0,o.focus()),o}return Xe(e,i)}function rt(e){return!e.disabled}Je.styles=[Ke],Je=i([x("md-elevation")],Je);const ot={ArrowDown:"ArrowDown",ArrowLeft:"ArrowLeft",ArrowUp:"ArrowUp",ArrowRight:"ArrowRight",Home:"Home",End:"End"};class st{constructor(e){this.handleKeydown=e=>{const t=e.key;if(e.defaultPrevented||!this.isNavigableKey(t))return;const i=this.items;if(!i.length)return;const r=Ze(i,this.isActivatable);e.preventDefault();const o=this.isRtl();let s=null;switch(t){case ot.ArrowDown:case o?ot.ArrowLeft:ot.ArrowRight:s=tt(i,r,this.isActivatable,this.wrapNavigation());break;case ot.ArrowUp:case o?ot.ArrowRight:ot.ArrowLeft:s=it(i,r,this.isActivatable,this.wrapNavigation());break;case ot.Home:s=Ye(i,this.isActivatable);break;case ot.End:s=Xe(i,this.isActivatable)}s&&r&&r.item!==s&&(r.item.tabIndex=-1)},this.onDeactivateItems=()=>{const e=this.items;for(const t of e)this.deactivateItem(t)},this.onRequestActivation=e=>{this.onDeactivateItems();const t=e.target;this.activateItem(t),t.focus()},this.onSlotchange=()=>{const e=this.items;let t=!1;for(const i of e){!(!i.disabled&&i.tabIndex>-1)||t?i.tabIndex=-1:(t=!0,i.tabIndex=0)}if(t)return;const i=Qe(e,this.isActivatable);i&&(i.tabIndex=0)};const{isItem:t,getPossibleItems:i,isRtl:r,deactivateItem:o,activateItem:s,isNavigableKey:a,isActivatable:l,wrapNavigation:n}=e;this.isItem=t,this.getPossibleItems=i,this.isRtl=r,this.deactivateItem=o,this.activateItem=s,this.isNavigableKey=a,this.isActivatable=l,this.wrapNavigation=n??(()=>!0)}get items(){const e=this.getPossibleItems(),t=[];for(const i of e){if(this.isItem(i)){t.push(i);continue}const e=i.item;e&&this.isItem(e)&&t.push(e)}return t}activateNextItem(){const e=this.items,t=Ze(e,this.isActivatable);return t&&(t.item.tabIndex=-1),tt(e,t,this.isActivatable,this.wrapNavigation())}activatePreviousItem(){const e=this.items,t=Ze(e,this.isActivatable);return t&&(t.item.tabIndex=-1),it(e,t,this.isActivatable,this.wrapNavigation())}}const at=function(e,t){return new CustomEvent("close-menu",{bubbles:!0,composed:!0,detail:{initiator:e,reason:t,itemPath:[e]}})},lt={SPACE:"Space",ENTER:"Enter"},nt="click-selection",dt="keydown",ct={ESCAPE:"Escape",SPACE:lt.SPACE,ENTER:lt.ENTER};function ht(e){return Object.values(ct).some(t=>t===e)}function pt(e,t){const i=new Event("md-contains",{bubbles:!0,composed:!0});let r=[];const o=e=>{r=e.composedPath()};t.addEventListener("md-contains",o),e.dispatchEvent(i),t.removeEventListener("md-contains",o);return r.length>0}const ut="none",ft="list-root",gt="first-item",mt="last-item",vt="end-start",bt="start-start";class yt{constructor(e,t){this.host=e,this.getProperties=t,this.surfaceStylesInternal={display:"none"},this.lastValues={isOpen:!1},this.host.addController(this)}get surfaceStyles(){return this.surfaceStylesInternal}async position(){const{surfaceEl:e,anchorEl:t,anchorCorner:i,surfaceCorner:r,positioning:o,xOffset:s,yOffset:a,disableBlockFlip:l,disableInlineFlip:n,repositionStrategy:d}=this.getProperties(),c=i.toLowerCase().trim(),h=r.toLowerCase().trim();if(!e||!t)return;const p=window.innerWidth,u=window.innerHeight,f=document.createElement("div");f.style.opacity="0",f.style.position="fixed",f.style.display="block",f.style.inset="0",document.body.appendChild(f);const g=f.getBoundingClientRect();f.remove();const m=window.innerHeight-g.bottom,v=window.innerWidth-g.right;this.surfaceStylesInternal={display:"block",opacity:"0"},this.host.requestUpdate(),await this.host.updateComplete,e.popover&&e.isConnected&&e.showPopover();const b=e.getSurfacePositionClientRect?e.getSurfacePositionClientRect():e.getBoundingClientRect(),y=t.getSurfacePositionClientRect?t.getSurfacePositionClientRect():t.getBoundingClientRect(),[x,_]=h.split("-"),[w,k]=c.split("-"),S="ltr"===getComputedStyle(e).direction;let{blockInset:$,blockOutOfBoundsCorrection:R,surfaceBlockProperty:E}=this.calculateBlock({surfaceRect:b,anchorRect:y,anchorBlock:w,surfaceBlock:x,yOffset:a,positioning:o,windowInnerHeight:u,blockScrollbarHeight:m});if(R&&!l){const e="start"===x?"end":"start",t="start"===w?"end":"start",i=this.calculateBlock({surfaceRect:b,anchorRect:y,anchorBlock:t,surfaceBlock:e,yOffset:a,positioning:o,windowInnerHeight:u,blockScrollbarHeight:m});R>i.blockOutOfBoundsCorrection&&($=i.blockInset,R=i.blockOutOfBoundsCorrection,E=i.surfaceBlockProperty)}let{inlineInset:C,inlineOutOfBoundsCorrection:I,surfaceInlineProperty:T}=this.calculateInline({surfaceRect:b,anchorRect:y,anchorInline:k,surfaceInline:_,xOffset:s,positioning:o,isLTR:S,windowInnerWidth:p,inlineScrollbarWidth:v});if(I&&!n){const e="start"===_?"end":"start",t="start"===k?"end":"start",i=this.calculateInline({surfaceRect:b,anchorRect:y,anchorInline:t,surfaceInline:e,xOffset:s,positioning:o,isLTR:S,windowInnerWidth:p,inlineScrollbarWidth:v});Math.abs(I)>Math.abs(i.inlineOutOfBoundsCorrection)&&(C=i.inlineInset,I=i.inlineOutOfBoundsCorrection,T=i.surfaceInlineProperty)}"move"===d&&($-=R,C-=I),this.surfaceStylesInternal={display:"block",opacity:"1",[E]:`${$}px`,[T]:`${C}px`},"resize"===d&&(R&&(this.surfaceStylesInternal.height=b.height-R+"px"),I&&(this.surfaceStylesInternal.width=b.width-I+"px")),this.host.requestUpdate()}calculateBlock(e){const{surfaceRect:t,anchorRect:i,anchorBlock:r,surfaceBlock:o,yOffset:s,positioning:a,windowInnerHeight:l,blockScrollbarHeight:n}=e,d="fixed"===a||"document"===a?1:0,c="document"===a?1:0,h="start"===o?1:0,p="end"===o?1:0,u=(r!==o?1:0)*i.height+s,f=h*i.top+p*(l-i.bottom-n);return{blockInset:d*f+c*(h*window.scrollY-p*window.scrollY)+u,blockOutOfBoundsCorrection:Math.abs(Math.min(0,l-f-u-t.height)),surfaceBlockProperty:"start"===o?"inset-block-start":"inset-block-end"}}calculateInline(e){const{isLTR:t,surfaceInline:i,anchorInline:r,anchorRect:o,surfaceRect:s,xOffset:a,positioning:l,windowInnerWidth:n,inlineScrollbarWidth:d}=e,c="fixed"===l||"document"===l?1:0,h="document"===l?1:0,p=t?1:0,u=t?0:1,f="start"===i?1:0,g="end"===i?1:0,m=(r!==i?1:0)*o.width+a,v=p*(f*o.left+g*(n-o.right-d))+u*(f*(n-o.right-d)+g*o.left);let b="start"===i?"inset-inline-start":"inset-inline-end";return"document"!==l&&"fixed"!==l||(b="start"===i&&t||"end"===i&&!t?"left":"right"),{inlineInset:c*v+m+h*(p*(f*window.scrollX-g*window.scrollX)+u*(g*window.scrollX-f*window.scrollX)),inlineOutOfBoundsCorrection:Math.abs(Math.min(0,n-v-m-s.width)),surfaceInlineProperty:b}}hostUpdate(){this.onUpdate()}hostUpdated(){this.onUpdate()}async onUpdate(){const e=this.getProperties();let t=!1;for(const[i,r]of Object.entries(e))if(t=t||r!==this.lastValues[i],t)break;const i=this.lastValues.isOpen!==e.isOpen,r=!!e.anchorEl,o=!!e.surfaceEl;t&&r&&o&&(this.lastValues.isOpen=e.isOpen,e.isOpen?(this.lastValues=e,await this.position(),e.onOpen()):i&&(await e.beforeClose(),this.close(),e.onClose()))}close(){this.surfaceStylesInternal={display:"none"},this.host.requestUpdate();const e=this.getProperties().surfaceEl;e?.popover&&e?.isConnected&&e.hidePopover()}}const xt=0,_t=1,wt=2;class kt{constructor(e){this.getProperties=e,this.typeaheadRecords=[],this.typaheadBuffer="",this.cancelTypeaheadTimeout=0,this.isTypingAhead=!1,this.lastActiveRecord=null,this.onKeydown=e=>{this.isTypingAhead?this.typeahead(e):this.beginTypeahead(e)},this.endTypeahead=()=>{this.isTypingAhead=!1,this.typaheadBuffer="",this.typeaheadRecords=[]}}get items(){return this.getProperties().getItems()}get active(){return this.getProperties().active}beginTypeahead(e){this.active&&("Space"===e.code||"Enter"===e.code||e.code.startsWith("Arrow")||"Escape"===e.code||(this.isTypingAhead=!0,this.typeaheadRecords=this.items.map((e,t)=>[t,e,e.typeaheadText.trim().toLowerCase()]),this.lastActiveRecord=this.typeaheadRecords.find(e=>0===e[_t].tabIndex)??null,this.lastActiveRecord&&(this.lastActiveRecord[_t].tabIndex=-1),this.typeahead(e)))}typeahead(e){if(e.defaultPrevented)return;if(clearTimeout(this.cancelTypeaheadTimeout),"Enter"===e.code||e.code.startsWith("Arrow")||"Escape"===e.code)return this.endTypeahead(),void(this.lastActiveRecord&&(this.lastActiveRecord[_t].tabIndex=-1));"Space"===e.code&&e.preventDefault(),this.cancelTypeaheadTimeout=setTimeout(this.endTypeahead,this.getProperties().typeaheadBufferTime),this.typaheadBuffer+=e.key.toLowerCase();const t=this.lastActiveRecord?this.lastActiveRecord[xt]:-1,i=this.typeaheadRecords.length,r=e=>(e[xt]+i-t)%i,o=this.typeaheadRecords.filter(e=>!e[_t].disabled&&e[wt].startsWith(this.typaheadBuffer)).sort((e,t)=>r(e)-r(t));if(0===o.length)return clearTimeout(this.cancelTypeaheadTimeout),this.lastActiveRecord&&(this.lastActiveRecord[_t].tabIndex=-1),void this.endTypeahead();const s=1===this.typaheadBuffer.length;let a;a=this.lastActiveRecord===o[0]&&s?o[1]??o[0]:o[0],this.lastActiveRecord&&(this.lastActiveRecord[_t].tabIndex=-1),this.lastActiveRecord=a,a[_t].tabIndex=0,a[_t].focus()}}const St=new Set([ot.ArrowDown,ot.ArrowUp,ot.Home,ot.End]),$t=new Set([ot.ArrowLeft,ot.ArrowRight,...St]);class Rt extends a{get openDirection(){return"start"===this.menuCorner.split("-")[0]?"DOWN":"UP"}get anchorElement(){return this.anchor?this.getRootNode().querySelector(`#${this.anchor}`):this.currentAnchorElement}set anchorElement(e){this.currentAnchorElement=e,this.requestUpdate("anchorElement")}constructor(){super(),this.anchor="",this.positioning="absolute",this.quick=!1,this.hasOverflow=!1,this.open=!1,this.xOffset=0,this.yOffset=0,this.noHorizontalFlip=!1,this.noVerticalFlip=!1,this.typeaheadDelay=200,this.anchorCorner=vt,this.menuCorner=bt,this.stayOpenOnOutsideClick=!1,this.stayOpenOnFocusout=!1,this.skipRestoreFocus=!1,this.defaultFocus=gt,this.noNavigationWrap=!1,this.typeaheadActive=!0,this.isSubmenu=!1,this.pointerPath=[],this.isRepositioning=!1,this.openCloseAnimationSignal=$(),this.listController=new st({isItem:e=>e.hasAttribute("md-menu-item"),getPossibleItems:()=>this.slotItems,isRtl:()=>"rtl"===getComputedStyle(this).direction,deactivateItem:e=>{e.selected=!1,e.tabIndex=-1},activateItem:e=>{e.selected=!0,e.tabIndex=0},isNavigableKey:e=>{if(!this.isSubmenu)return $t.has(e);return e===("rtl"===getComputedStyle(this).direction?ot.ArrowLeft:ot.ArrowRight)||St.has(e)},wrapNavigation:()=>!this.noNavigationWrap}),this.lastFocusedElement=null,this.typeaheadController=new kt(()=>({getItems:()=>this.items,typeaheadBufferTime:this.typeaheadDelay,active:this.typeaheadActive})),this.currentAnchorElement=null,this.internals=this.attachInternals(),this.menuPositionController=new yt(this,()=>({anchorCorner:this.anchorCorner,surfaceCorner:this.menuCorner,surfaceEl:this.surfaceEl,anchorEl:this.anchorElement,positioning:"popover"===this.positioning?"document":this.positioning,isOpen:this.open,xOffset:this.xOffset,yOffset:this.yOffset,disableBlockFlip:this.noVerticalFlip,disableInlineFlip:this.noHorizontalFlip,onOpen:this.onOpened,beforeClose:this.beforeClose,onClose:this.onClosed,repositionStrategy:this.hasOverflow&&"popover"!==this.positioning?"move":"resize"})),this.onWindowResize=()=>{this.isRepositioning||"document"!==this.positioning&&"fixed"!==this.positioning&&"popover"!==this.positioning||(this.isRepositioning=!0,this.reposition(),this.isRepositioning=!1)},this.handleFocusout=async e=>{const t=this.anchorElement;if(this.stayOpenOnFocusout||!this.open||this.pointerPath.includes(t))return;if(e.relatedTarget){if(pt(e.relatedTarget,this)||0!==this.pointerPath.length&&pt(e.relatedTarget,t))return}else if(this.pointerPath.includes(this))return;const i=this.skipRestoreFocus;this.skipRestoreFocus=!0,this.close(),await this.updateComplete,this.skipRestoreFocus=i},this.onOpened=async()=>{this.lastFocusedElement=function(e=document){let t=e.activeElement;for(;t&&t?.shadowRoot?.activeElement;)t=t.shadowRoot.activeElement;return t}();const e=this.items,t=Ze(e);t&&this.defaultFocus!==ut&&(t.item.tabIndex=-1);let i=!this.quick;switch(this.quick?this.dispatchEvent(new Event("opening")):i=!!await this.animateOpen(),this.defaultFocus){case gt:const t=Qe(e);t&&(t.tabIndex=0,t.focus(),await t.updateComplete);break;case mt:const i=et(e);i&&(i.tabIndex=0,i.focus(),await i.updateComplete);break;case ft:this.focus()}i||this.dispatchEvent(new Event("opened"))},this.beforeClose=async()=>{this.open=!1,this.skipRestoreFocus||this.lastFocusedElement?.focus?.(),this.quick||await this.animateClose()},this.onClosed=()=>{this.quick&&(this.dispatchEvent(new Event("closing")),this.dispatchEvent(new Event("closed")))},this.onWindowPointerdown=e=>{this.pointerPath=e.composedPath()},this.onDocumentClick=e=>{if(!this.open)return;const t=e.composedPath();this.stayOpenOnOutsideClick||t.includes(this)||t.includes(this.anchorElement)||(this.open=!1)},this.internals.role="menu",this.addEventListener("keydown",this.handleKeydown),this.addEventListener("keydown",this.captureKeydown,{capture:!0}),this.addEventListener("focusout",this.handleFocusout)}get items(){return this.listController.items}willUpdate(e){e.has("open")&&(this.open?this.removeAttribute("aria-hidden"):this.setAttribute("aria-hidden","true"))}update(e){e.has("open")&&(this.open?this.setUpGlobalEventListeners():this.cleanUpGlobalEventListeners()),e.has("positioning")&&"popover"===this.positioning&&!this.showPopover&&(this.positioning="fixed"),super.update(e)}connectedCallback(){super.connectedCallback(),this.open&&this.setUpGlobalEventListeners()}disconnectedCallback(){super.disconnectedCallback(),this.cleanUpGlobalEventListeners()}getBoundingClientRect(){return this.surfaceEl?this.surfaceEl.getBoundingClientRect():super.getBoundingClientRect()}getClientRects(){return this.surfaceEl?this.surfaceEl.getClientRects():super.getClientRects()}render(){return this.renderSurface()}renderSurface(){return u`
      <div
        class="menu ${h(this.getSurfaceClasses())}"
        style=${Fe(this.menuPositionController.surfaceStyles)}
        popover=${"popover"===this.positioning?"manual":p}>
        ${this.renderElevation()}
        <div class="items">
          <div class="item-padding"> ${this.renderMenuItems()} </div>
        </div>
      </div>
    `}renderMenuItems(){return u`<slot
      @close-menu=${this.onCloseMenu}
      @deactivate-items=${this.onDeactivateItems}
      @request-activation=${this.onRequestActivation}
      @deactivate-typeahead=${this.handleDeactivateTypeahead}
      @activate-typeahead=${this.handleActivateTypeahead}
      @stay-open-on-focusout=${this.handleStayOpenOnFocusout}
      @close-on-focusout=${this.handleCloseOnFocusout}
      @slotchange=${this.listController.onSlotchange}></slot>`}renderElevation(){return u`<md-elevation part="elevation"></md-elevation>`}getSurfaceClasses(){return{open:this.open,fixed:"fixed"===this.positioning,"has-overflow":this.hasOverflow}}captureKeydown(e){e.target===this&&!e.defaultPrevented&&ht(e.code)&&(e.preventDefault(),this.close()),this.typeaheadController.onKeydown(e)}async animateOpen(){const e=this.surfaceEl,t=this.slotEl;if(!e||!t)return!0;const i=this.openDirection;this.dispatchEvent(new Event("opening")),e.classList.toggle("animating",!0);const r=this.openCloseAnimationSignal.start(),o=e.offsetHeight,s="UP"===i,a=this.items,l=250/a.length,n=e.animate([{height:"0px"},{height:`${o}px`}],{duration:500,easing:y.EMPHASIZED}),d=t.animate([{transform:s?`translateY(-${o}px)`:""},{transform:""}],{duration:500,easing:y.EMPHASIZED}),c=e.animate([{opacity:0},{opacity:1}],50),h=[];for(let e=0;e<a.length;e++){const t=a[s?a.length-1-e:e],i=t.animate([{opacity:0},{opacity:1}],{duration:250,delay:l*e});t.classList.toggle("md-menu-hidden",!0),i.addEventListener("finish",()=>{t.classList.toggle("md-menu-hidden",!1)}),h.push([t,i])}let p=e=>{};const u=new Promise(e=>{p=e});return r.addEventListener("abort",()=>{n.cancel(),d.cancel(),c.cancel(),h.forEach(([e,t])=>{e.classList.toggle("md-menu-hidden",!1),t.cancel()}),p(!0)}),n.addEventListener("finish",()=>{e.classList.toggle("animating",!1),this.openCloseAnimationSignal.finish(),p(!1)}),await u}animateClose(){let e;const t=new Promise(t=>{e=t}),i=this.surfaceEl,r=this.slotEl;if(!i||!r)return e(!1),t;const o="UP"===this.openDirection;this.dispatchEvent(new Event("closing")),i.classList.toggle("animating",!0);const s=this.openCloseAnimationSignal.start(),a=i.offsetHeight,l=this.items,n=150,d=50/l.length,c=i.animate([{height:`${a}px`},{height:.35*a+"px"}],{duration:n,easing:y.EMPHASIZED_ACCELERATE}),h=r.animate([{transform:""},{transform:o?`translateY(-${.65*a}px)`:""}],{duration:n,easing:y.EMPHASIZED_ACCELERATE}),p=i.animate([{opacity:1},{opacity:0}],{duration:50,delay:100}),u=[];for(let e=0;e<l.length;e++){const t=l[o?e:l.length-1-e],i=t.animate([{opacity:1},{opacity:0}],{duration:50,delay:50+d*e});i.addEventListener("finish",()=>{t.classList.toggle("md-menu-hidden",!0)}),u.push([t,i])}return s.addEventListener("abort",()=>{c.cancel(),h.cancel(),p.cancel(),u.forEach(([e,t])=>{t.cancel(),e.classList.toggle("md-menu-hidden",!1)}),e(!1)}),c.addEventListener("finish",()=>{i.classList.toggle("animating",!1),u.forEach(([e])=>{e.classList.toggle("md-menu-hidden",!1)}),this.openCloseAnimationSignal.finish(),this.dispatchEvent(new Event("closed")),e(!0)}),t}handleKeydown(e){this.pointerPath=[],this.listController.handleKeydown(e)}setUpGlobalEventListeners(){document.addEventListener("click",this.onDocumentClick,{capture:!0}),window.addEventListener("pointerdown",this.onWindowPointerdown),document.addEventListener("resize",this.onWindowResize,{passive:!0}),window.addEventListener("resize",this.onWindowResize,{passive:!0})}cleanUpGlobalEventListeners(){document.removeEventListener("click",this.onDocumentClick,{capture:!0}),window.removeEventListener("pointerdown",this.onWindowPointerdown),document.removeEventListener("resize",this.onWindowResize),window.removeEventListener("resize",this.onWindowResize)}onCloseMenu(){this.close()}onDeactivateItems(e){e.stopPropagation(),this.listController.onDeactivateItems()}onRequestActivation(e){e.stopPropagation(),this.listController.onRequestActivation(e)}handleDeactivateTypeahead(e){e.stopPropagation(),this.typeaheadActive=!1}handleActivateTypeahead(e){e.stopPropagation(),this.typeaheadActive=!0}handleStayOpenOnFocusout(e){e.stopPropagation(),this.stayOpenOnFocusout=!0}handleCloseOnFocusout(e){e.stopPropagation(),this.stayOpenOnFocusout=!1}close(){this.open=!1;this.slotItems.forEach(e=>{e.close?.()})}show(){this.open=!0}activateNextItem(){return this.listController.activateNextItem()??null}activatePreviousItem(){return this.listController.activatePreviousItem()??null}reposition(){this.open&&this.menuPositionController.position()}}i([n(".menu")],Rt.prototype,"surfaceEl",void 0),i([n("slot")],Rt.prototype,"slotEl",void 0),i([r()],Rt.prototype,"anchor",void 0),i([r()],Rt.prototype,"positioning",void 0),i([r({type:Boolean})],Rt.prototype,"quick",void 0),i([r({type:Boolean,attribute:"has-overflow"})],Rt.prototype,"hasOverflow",void 0),i([r({type:Boolean,reflect:!0})],Rt.prototype,"open",void 0),i([r({type:Number,attribute:"x-offset"})],Rt.prototype,"xOffset",void 0),i([r({type:Number,attribute:"y-offset"})],Rt.prototype,"yOffset",void 0),i([r({type:Boolean,attribute:"no-horizontal-flip"})],Rt.prototype,"noHorizontalFlip",void 0),i([r({type:Boolean,attribute:"no-vertical-flip"})],Rt.prototype,"noVerticalFlip",void 0),i([r({type:Number,attribute:"typeahead-delay"})],Rt.prototype,"typeaheadDelay",void 0),i([r({attribute:"anchor-corner"})],Rt.prototype,"anchorCorner",void 0),i([r({attribute:"menu-corner"})],Rt.prototype,"menuCorner",void 0),i([r({type:Boolean,attribute:"stay-open-on-outside-click"})],Rt.prototype,"stayOpenOnOutsideClick",void 0),i([r({type:Boolean,attribute:"stay-open-on-focusout"})],Rt.prototype,"stayOpenOnFocusout",void 0),i([r({type:Boolean,attribute:"skip-restore-focus"})],Rt.prototype,"skipRestoreFocus",void 0),i([r({attribute:"default-focus"})],Rt.prototype,"defaultFocus",void 0),i([r({type:Boolean,attribute:"no-navigation-wrap"})],Rt.prototype,"noNavigationWrap",void 0),i([v({flatten:!0})],Rt.prototype,"slotItems",void 0),i([l()],Rt.prototype,"typeaheadActive",void 0);const Et=g`:host{--md-elevation-level: var(--md-menu-container-elevation, 2);--md-elevation-shadow-color: var(--md-menu-container-shadow-color, var(--md-sys-color-shadow, #000));min-width:112px;color:unset;display:contents}md-focus-ring{--md-focus-ring-shape: var(--md-menu-container-shape, var(--md-sys-shape-corner-extra-small, 4px))}.menu{border-radius:var(--md-menu-container-shape, var(--md-sys-shape-corner-extra-small, 4px));display:none;inset:auto;border:none;padding:0px;overflow:visible;background-color:rgba(0,0,0,0);color:inherit;opacity:0;z-index:20;position:absolute;user-select:none;max-height:inherit;height:inherit;min-width:inherit;max-width:inherit;scrollbar-width:inherit}.menu::backdrop{display:none}.fixed{position:fixed}.items{display:block;list-style-type:none;margin:0;outline:none;box-sizing:border-box;background-color:var(--md-menu-container-color, var(--md-sys-color-surface-container, #f3edf7));height:inherit;max-height:inherit;overflow:auto;min-width:inherit;max-width:inherit;border-radius:inherit;scrollbar-width:inherit}.item-padding{padding-block:var(--md-menu-top-space, 8px) var(--md-menu-bottom-space, 8px)}.has-overflow:not([popover]) .items{overflow:visible}.has-overflow.animating .items,.animating .items{overflow:hidden}.has-overflow.animating .items{pointer-events:none}.animating ::slotted(.md-menu-hidden){opacity:0}slot{display:block;height:inherit;max-height:inherit}::slotted(:is(md-divider,[role=separator])){margin:8px 0}@media(forced-colors: active){.menu{border-style:solid;border-color:CanvasText;border-width:1px}}
`;let Ct=class extends Rt{};Ct.styles=[Et],Ct=i([x("md-menu")],Ct);class It extends Z{computeValidity(e){return this.selectControl||(this.selectControl=document.createElement("select")),b(u`<option value=${e.value}></option>`,this.selectControl),this.selectControl.value=e.value,this.selectControl.required=e.required,{validity:this.selectControl.validity,validationMessage:this.selectControl.validationMessage}}equals(e,t){return e.value===t.value&&e.required===t.required}copy({value:e,required:t}){return{value:e,required:t}}}var Tt;const Ft=Symbol("value"),Ot=o(Be(K(X(s(a)))));class At extends Ot{get value(){return this[Ft]}set value(e){this.lastUserSetValue=e,this.select(e)}get options(){return this.menu?.items??[]}get selectedIndex(){const[e,t]=(this.getSelectedOptions()??[])[0]??[];return t??-1}set selectedIndex(e){this.lastUserSetSelectedIndex=e,this.selectIndex(e)}get selectedOptions(){return(this.getSelectedOptions()??[]).map(([e])=>e)}get hasError(){return this.error||this.nativeError}constructor(){super(),this.quick=!1,this.required=!1,this.errorText="",this.label="",this.noAsterisk=!1,this.supportingText="",this.error=!1,this.menuPositioning="popover",this.clampMenuWidth=!1,this.typeaheadDelay=200,this.hasLeadingIcon=!1,this.displayText="",this.menuAlign="start",this[Tt]="",this.lastUserSetValue=null,this.lastUserSetSelectedIndex=null,this.lastSelectedOption=null,this.lastSelectedOptionRecords=[],this.nativeError=!1,this.nativeErrorText="",this.focused=!1,this.open=!1,this.defaultFocus=ut,this.prevOpen=this.open,this.selectWidth=0,this.addEventListener("focus",this.handleFocus.bind(this)),this.addEventListener("blur",this.handleBlur.bind(this))}select(e){const t=this.options.find(t=>t.value===e);t&&this.selectItem(t)}selectIndex(e){const t=this.options[e];t&&this.selectItem(t)}reset(){for(const e of this.options)e.selected=e.hasAttribute("selected");this.updateValueAndDisplayText(),this.nativeError=!1,this.nativeErrorText=""}showPicker(){this.open=!0}[(Tt=Ft,Ae)](e){e?.preventDefault();const t=this.getErrorText();this.nativeError=!!e,this.nativeErrorText=this.validationMessage,t===this.getErrorText()&&this.field?.reannounceError()}update(e){if(this.hasUpdated||this.initUserSelection(),this.prevOpen!==this.open&&this.open){const e=this.getBoundingClientRect();this.selectWidth=e.width}this.prevOpen=this.open,super.update(e)}render(){return u`
      <span
        class="select ${h(this.getRenderClasses())}"
        @focusout=${this.handleFocusout}>
        ${this.renderField()} ${this.renderMenu()}
      </span>
    `}async firstUpdated(e){await(this.menu?.updateComplete),this.lastSelectedOptionRecords.length||this.initUserSelection(),this.lastSelectedOptionRecords.length||this.options.length||setTimeout(()=>{this.updateValueAndDisplayText()}),super.firstUpdated(e)}getRenderClasses(){return{disabled:this.disabled,error:this.error,open:this.open}}renderField(){const e=this.ariaLabel||this.label;return fe`
      <${this.fieldTag}
          aria-haspopup="listbox"
          role="combobox"
          part="field"
          id="field"
          tabindex=${this.disabled?"-1":"0"}
          aria-label=${e||p}
          aria-describedby="description"
          aria-expanded=${this.open?"true":"false"}
          aria-controls="listbox"
          class="field"
          label=${this.label}
          ?no-asterisk=${this.noAsterisk}
          .focused=${this.focused||this.open}
          .populated=${!!this.displayText}
          .disabled=${this.disabled}
          .required=${this.required}
          .error=${this.hasError}
          ?has-start=${this.hasLeadingIcon}
          has-end
          supporting-text=${this.supportingText}
          error-text=${this.getErrorText()}
          @keydown=${this.handleKeydown}
          @click=${this.handleClick}>
         ${this.renderFieldContent()}
         <div id="description" slot="aria-describedby"></div>
      </${this.fieldTag}>`}renderFieldContent(){return[this.renderLeadingIcon(),this.renderLabel(),this.renderTrailingIcon()]}renderLeadingIcon(){return u`
      <span class="icon leading" slot="start">
        <slot name="leading-icon" @slotchange=${this.handleIconChange}></slot>
      </span>
    `}renderTrailingIcon(){return u`
      <span class="icon trailing" slot="end">
        <slot name="trailing-icon" @slotchange=${this.handleIconChange}>
          <svg height="5" viewBox="7 10 10 5" focusable="false">
            <polygon
              class="down"
              stroke="none"
              fill-rule="evenodd"
              points="7 10 12 15 17 10"></polygon>
            <polygon
              class="up"
              stroke="none"
              fill-rule="evenodd"
              points="7 15 12 10 17 15"></polygon>
          </svg>
        </slot>
      </span>
    `}renderLabel(){return u`<div id="label">${this.displayText||u`&nbsp;`}</div>`}renderMenu(){const e=this.label||this.ariaLabel;return u`<div class="menu-wrapper">
      <md-menu
        id="listbox"
        .defaultFocus=${this.defaultFocus}
        role="listbox"
        tabindex="-1"
        aria-label=${e||p}
        stay-open-on-focusout
        part="menu"
        exportparts="focus-ring: menu-focus-ring"
        anchor="field"
        style=${Fe({"--__menu-min-width":`${this.selectWidth}px`,"--__menu-max-width":this.clampMenuWidth?`${this.selectWidth}px`:void 0})}
        no-navigation-wrap
        .open=${this.open}
        .quick=${this.quick}
        .positioning=${this.menuPositioning}
        .typeaheadDelay=${this.typeaheadDelay}
        .anchorCorner=${"start"===this.menuAlign?"end-start":"end-end"}
        .menuCorner=${"start"===this.menuAlign?"start-start":"start-end"}
        @opening=${this.handleOpening}
        @opened=${this.redispatchEvent}
        @closing=${this.redispatchEvent}
        @closed=${this.handleClosed}
        @close-menu=${this.handleCloseMenu}
        @request-selection=${this.handleRequestSelection}
        @request-deselection=${this.handleRequestDeselection}>
        ${this.renderMenuContent()}
      </md-menu>
    </div>`}renderMenuContent(){return u`<slot></slot>`}handleKeydown(e){if(this.open||this.disabled||!this.menu)return;const t=this.menu.typeaheadController,i="Space"===e.code||"ArrowDown"===e.code||"ArrowUp"===e.code||"End"===e.code||"Home"===e.code||"Enter"===e.code;if(!t.isTypingAhead&&i){switch(e.preventDefault(),this.open=!0,e.code){case"Space":case"ArrowDown":case"Enter":this.defaultFocus=ut;break;case"End":this.defaultFocus=mt;break;case"ArrowUp":case"Home":this.defaultFocus=gt}return}if(1===e.key.length){t.onKeydown(e),e.preventDefault();const{lastActiveRecord:i}=t;if(!i)return;this.labelEl?.setAttribute?.("aria-live","polite");this.selectItem(i[_t])&&this.dispatchInteractionEvents()}}handleClick(){this.open=!this.open}handleFocus(){this.focused=!0}handleBlur(){this.focused=!1}handleFocusout(e){e.relatedTarget&&pt(e.relatedTarget,this)||(this.open=!1)}getSelectedOptions(){if(!this.menu)return this.lastSelectedOptionRecords=[],null;const e=this.menu.items;return this.lastSelectedOptionRecords=function(e){const t=[];for(let i=0;i<e.length;i++){const r=e[i];r.selected&&t.push([r,i])}return t}(e),this.lastSelectedOptionRecords}async getUpdateComplete(){return await(this.menu?.updateComplete),super.getUpdateComplete()}updateValueAndDisplayText(){const e=this.getSelectedOptions()??[];let t=!1;if(e.length){const[i]=e[0];t=this.lastSelectedOption!==i,this.lastSelectedOption=i,this[Ft]=i.value,this.displayText=i.displayText}else t=null!==this.lastSelectedOption,this.lastSelectedOption=null,this[Ft]="",this.displayText="";return t}async handleOpening(e){if(this.labelEl?.removeAttribute?.("aria-live"),this.redispatchEvent(e),this.defaultFocus!==ut)return;const t=this.menu.items,i=Ze(t)?.item;let[r]=this.lastSelectedOptionRecords[0]??[null];i&&i!==r&&(i.tabIndex=-1),r=r??t[0],r&&(r.tabIndex=0,r.focus())}redispatchEvent(e){f(this,e)}handleClosed(e){this.open=!1,this.redispatchEvent(e)}handleCloseMenu(e){const t=e.detail.reason,i=e.detail.itemPath[0];this.open=!1;let r=!1;var o;"click-selection"===t.kind||"keydown"===t.kind&&(o=t.key,Object.values(lt).some(e=>e===o))?r=this.selectItem(i):(i.tabIndex=-1,i.blur()),r&&this.dispatchInteractionEvents()}selectItem(e){return(this.getSelectedOptions()??[]).forEach(([t])=>{e!==t&&(t.selected=!1)}),e.selected=!0,this.updateValueAndDisplayText()}handleRequestSelection(e){const t=e.target;this.lastSelectedOptionRecords.some(([e])=>e===t)||this.selectItem(t)}handleRequestDeselection(e){const t=e.target;this.lastSelectedOptionRecords.some(([e])=>e===t)&&this.updateValueAndDisplayText()}initUserSelection(){this.lastUserSetValue&&!this.lastSelectedOptionRecords.length?this.select(this.lastUserSetValue):null===this.lastUserSetSelectedIndex||this.lastSelectedOptionRecords.length?this.updateValueAndDisplayText():this.selectIndex(this.lastUserSetSelectedIndex)}handleIconChange(){this.hasLeadingIcon=this.leadingIcons.length>0}dispatchInteractionEvents(){this.dispatchEvent(new Event("input",{bubbles:!0,composed:!0})),this.dispatchEvent(new Event("change",{bubbles:!0}))}getErrorText(){return this.error?this.errorText:this.nativeErrorText}[J](){return this.value}formResetCallback(){this.reset()}formStateRestoreCallback(e){this.value=e}click(){this.field?.click()}[V](){return new It(()=>this)}[M](){return this.field}}At.shadowRootOptions={...a.shadowRootOptions,delegatesFocus:!0},i([r({type:Boolean})],At.prototype,"quick",void 0),i([r({type:Boolean})],At.prototype,"required",void 0),i([r({type:String,attribute:"error-text"})],At.prototype,"errorText",void 0),i([r()],At.prototype,"label",void 0),i([r({type:Boolean,attribute:"no-asterisk"})],At.prototype,"noAsterisk",void 0),i([r({type:String,attribute:"supporting-text"})],At.prototype,"supportingText",void 0),i([r({type:Boolean,reflect:!0})],At.prototype,"error",void 0),i([r({attribute:"menu-positioning"})],At.prototype,"menuPositioning",void 0),i([r({type:Boolean,attribute:"clamp-menu-width"})],At.prototype,"clampMenuWidth",void 0),i([r({type:Number,attribute:"typeahead-delay"})],At.prototype,"typeaheadDelay",void 0),i([r({type:Boolean,attribute:"has-leading-icon"})],At.prototype,"hasLeadingIcon",void 0),i([r({attribute:"display-text"})],At.prototype,"displayText",void 0),i([r({attribute:"menu-align"})],At.prototype,"menuAlign",void 0),i([r()],At.prototype,"value",null),i([r({type:Number,attribute:"selected-index"})],At.prototype,"selectedIndex",null),i([l()],At.prototype,"nativeError",void 0),i([l()],At.prototype,"nativeErrorText",void 0),i([l()],At.prototype,"focused",void 0),i([l()],At.prototype,"open",void 0),i([l()],At.prototype,"defaultFocus",void 0),i([n(".field")],At.prototype,"field",void 0),i([n("md-menu")],At.prototype,"menu",void 0),i([n("#label")],At.prototype,"labelEl",void 0),i([v({slot:"leading-icon",flatten:!0})],At.prototype,"leadingIcons",void 0);class Lt extends At{constructor(){super(...arguments),this.fieldTag=pe`md-filled-field`}}const Pt=g`:host{--_text-field-active-indicator-color: var(--md-filled-select-text-field-active-indicator-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-active-indicator-height: var(--md-filled-select-text-field-active-indicator-height, 1px);--_text-field-container-color: var(--md-filled-select-text-field-container-color, var(--md-sys-color-surface-container-highest, #e6e0e9));--_text-field-disabled-active-indicator-color: var(--md-filled-select-text-field-disabled-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-active-indicator-height: var(--md-filled-select-text-field-disabled-active-indicator-height, 1px);--_text-field-disabled-active-indicator-opacity: var(--md-filled-select-text-field-disabled-active-indicator-opacity, 0.38);--_text-field-disabled-container-color: var(--md-filled-select-text-field-disabled-container-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-container-opacity: var(--md-filled-select-text-field-disabled-container-opacity, 0.04);--_text-field-disabled-input-text-color: var(--md-filled-select-text-field-disabled-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-input-text-opacity: var(--md-filled-select-text-field-disabled-input-text-opacity, 0.38);--_text-field-disabled-label-text-color: var(--md-filled-select-text-field-disabled-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-label-text-opacity: var(--md-filled-select-text-field-disabled-label-text-opacity, 0.38);--_text-field-disabled-leading-icon-color: var(--md-filled-select-text-field-disabled-leading-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-leading-icon-opacity: var(--md-filled-select-text-field-disabled-leading-icon-opacity, 0.38);--_text-field-disabled-supporting-text-color: var(--md-filled-select-text-field-disabled-supporting-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-supporting-text-opacity: var(--md-filled-select-text-field-disabled-supporting-text-opacity, 0.38);--_text-field-disabled-trailing-icon-color: var(--md-filled-select-text-field-disabled-trailing-icon-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-disabled-trailing-icon-opacity: var(--md-filled-select-text-field-disabled-trailing-icon-opacity, 0.38);--_text-field-error-active-indicator-color: var(--md-filled-select-text-field-error-active-indicator-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-active-indicator-color: var(--md-filled-select-text-field-error-focus-active-indicator-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-input-text-color: var(--md-filled-select-text-field-error-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-focus-label-text-color: var(--md-filled-select-text-field-error-focus-label-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-leading-icon-color: var(--md-filled-select-text-field-error-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-focus-supporting-text-color: var(--md-filled-select-text-field-error-focus-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-focus-trailing-icon-color: var(--md-filled-select-text-field-error-focus-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_text-field-error-hover-active-indicator-color: var(--md-filled-select-text-field-error-hover-active-indicator-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-hover-input-text-color: var(--md-filled-select-text-field-error-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-hover-label-text-color: var(--md-filled-select-text-field-error-hover-label-text-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-hover-leading-icon-color: var(--md-filled-select-text-field-error-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-hover-state-layer-color: var(--md-filled-select-text-field-error-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-hover-state-layer-opacity: var(--md-filled-select-text-field-error-hover-state-layer-opacity, 0.08);--_text-field-error-hover-supporting-text-color: var(--md-filled-select-text-field-error-hover-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-hover-trailing-icon-color: var(--md-filled-select-text-field-error-hover-trailing-icon-color, var(--md-sys-color-on-error-container, #410e0b));--_text-field-error-input-text-color: var(--md-filled-select-text-field-error-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-error-label-text-color: var(--md-filled-select-text-field-error-label-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-leading-icon-color: var(--md-filled-select-text-field-error-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-error-supporting-text-color: var(--md-filled-select-text-field-error-supporting-text-color, var(--md-sys-color-error, #b3261e));--_text-field-error-trailing-icon-color: var(--md-filled-select-text-field-error-trailing-icon-color, var(--md-sys-color-error, #b3261e));--_text-field-focus-active-indicator-color: var(--md-filled-select-text-field-focus-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_text-field-focus-active-indicator-height: var(--md-filled-select-text-field-focus-active-indicator-height, 3px);--_text-field-focus-input-text-color: var(--md-filled-select-text-field-focus-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-focus-label-text-color: var(--md-filled-select-text-field-focus-label-text-color, var(--md-sys-color-primary, #6750a4));--_text-field-focus-leading-icon-color: var(--md-filled-select-text-field-focus-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-focus-supporting-text-color: var(--md-filled-select-text-field-focus-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-focus-trailing-icon-color: var(--md-filled-select-text-field-focus-trailing-icon-color, var(--md-sys-color-primary, #6750a4));--_text-field-hover-active-indicator-color: var(--md-filled-select-text-field-hover-active-indicator-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-active-indicator-height: var(--md-filled-select-text-field-hover-active-indicator-height, 1px);--_text-field-hover-input-text-color: var(--md-filled-select-text-field-hover-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-label-text-color: var(--md-filled-select-text-field-hover-label-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-leading-icon-color: var(--md-filled-select-text-field-hover-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-hover-state-layer-color: var(--md-filled-select-text-field-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-hover-state-layer-opacity: var(--md-filled-select-text-field-hover-state-layer-opacity, 0.08);--_text-field-hover-supporting-text-color: var(--md-filled-select-text-field-hover-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-hover-trailing-icon-color: var(--md-filled-select-text-field-hover-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-input-text-color: var(--md-filled-select-text-field-input-text-color, var(--md-sys-color-on-surface, #1d1b20));--_text-field-input-text-font: var(--md-filled-select-text-field-input-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-input-text-line-height: var(--md-filled-select-text-field-input-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_text-field-input-text-size: var(--md-filled-select-text-field-input-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_text-field-input-text-weight: var(--md-filled-select-text-field-input-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-label-text-color: var(--md-filled-select-text-field-label-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-label-text-font: var(--md-filled-select-text-field-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-label-text-line-height: var(--md-filled-select-text-field-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));--_text-field-label-text-populated-line-height: var(--md-filled-select-text-field-label-text-populated-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_text-field-label-text-populated-size: var(--md-filled-select-text-field-label-text-populated-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_text-field-label-text-size: var(--md-filled-select-text-field-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));--_text-field-label-text-weight: var(--md-filled-select-text-field-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-leading-icon-color: var(--md-filled-select-text-field-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-leading-icon-size: var(--md-filled-select-text-field-leading-icon-size, 24px);--_text-field-supporting-text-color: var(--md-filled-select-text-field-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-supporting-text-font: var(--md-filled-select-text-field-supporting-text-font, var(--md-sys-typescale-body-small-font, var(--md-ref-typeface-plain, Roboto)));--_text-field-supporting-text-line-height: var(--md-filled-select-text-field-supporting-text-line-height, var(--md-sys-typescale-body-small-line-height, 1rem));--_text-field-supporting-text-size: var(--md-filled-select-text-field-supporting-text-size, var(--md-sys-typescale-body-small-size, 0.75rem));--_text-field-supporting-text-weight: var(--md-filled-select-text-field-supporting-text-weight, var(--md-sys-typescale-body-small-weight, var(--md-ref-typeface-weight-regular, 400)));--_text-field-trailing-icon-color: var(--md-filled-select-text-field-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f));--_text-field-trailing-icon-size: var(--md-filled-select-text-field-trailing-icon-size, 24px);--_text-field-container-shape-start-start: var(--md-filled-select-text-field-container-shape-start-start, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_text-field-container-shape-start-end: var(--md-filled-select-text-field-container-shape-start-end, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-extra-small, 4px)));--_text-field-container-shape-end-end: var(--md-filled-select-text-field-container-shape-end-end, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--_text-field-container-shape-end-start: var(--md-filled-select-text-field-container-shape-end-start, var(--md-filled-select-text-field-container-shape, var(--md-sys-shape-corner-none, 0px)));--md-filled-field-active-indicator-color: var(--_text-field-active-indicator-color);--md-filled-field-active-indicator-height: var(--_text-field-active-indicator-height);--md-filled-field-container-color: var(--_text-field-container-color);--md-filled-field-container-shape-end-end: var(--_text-field-container-shape-end-end);--md-filled-field-container-shape-end-start: var(--_text-field-container-shape-end-start);--md-filled-field-container-shape-start-end: var(--_text-field-container-shape-start-end);--md-filled-field-container-shape-start-start: var(--_text-field-container-shape-start-start);--md-filled-field-content-color: var(--_text-field-input-text-color);--md-filled-field-content-font: var(--_text-field-input-text-font);--md-filled-field-content-line-height: var(--_text-field-input-text-line-height);--md-filled-field-content-size: var(--_text-field-input-text-size);--md-filled-field-content-weight: var(--_text-field-input-text-weight);--md-filled-field-disabled-active-indicator-color: var(--_text-field-disabled-active-indicator-color);--md-filled-field-disabled-active-indicator-height: var(--_text-field-disabled-active-indicator-height);--md-filled-field-disabled-active-indicator-opacity: var(--_text-field-disabled-active-indicator-opacity);--md-filled-field-disabled-container-color: var(--_text-field-disabled-container-color);--md-filled-field-disabled-container-opacity: var(--_text-field-disabled-container-opacity);--md-filled-field-disabled-content-color: var(--_text-field-disabled-input-text-color);--md-filled-field-disabled-content-opacity: var(--_text-field-disabled-input-text-opacity);--md-filled-field-disabled-label-text-color: var(--_text-field-disabled-label-text-color);--md-filled-field-disabled-label-text-opacity: var(--_text-field-disabled-label-text-opacity);--md-filled-field-disabled-leading-content-color: var(--_text-field-disabled-leading-icon-color);--md-filled-field-disabled-leading-content-opacity: var(--_text-field-disabled-leading-icon-opacity);--md-filled-field-disabled-supporting-text-color: var(--_text-field-disabled-supporting-text-color);--md-filled-field-disabled-supporting-text-opacity: var(--_text-field-disabled-supporting-text-opacity);--md-filled-field-disabled-trailing-content-color: var(--_text-field-disabled-trailing-icon-color);--md-filled-field-disabled-trailing-content-opacity: var(--_text-field-disabled-trailing-icon-opacity);--md-filled-field-error-active-indicator-color: var(--_text-field-error-active-indicator-color);--md-filled-field-error-content-color: var(--_text-field-error-input-text-color);--md-filled-field-error-focus-active-indicator-color: var(--_text-field-error-focus-active-indicator-color);--md-filled-field-error-focus-content-color: var(--_text-field-error-focus-input-text-color);--md-filled-field-error-focus-label-text-color: var(--_text-field-error-focus-label-text-color);--md-filled-field-error-focus-leading-content-color: var(--_text-field-error-focus-leading-icon-color);--md-filled-field-error-focus-supporting-text-color: var(--_text-field-error-focus-supporting-text-color);--md-filled-field-error-focus-trailing-content-color: var(--_text-field-error-focus-trailing-icon-color);--md-filled-field-error-hover-active-indicator-color: var(--_text-field-error-hover-active-indicator-color);--md-filled-field-error-hover-content-color: var(--_text-field-error-hover-input-text-color);--md-filled-field-error-hover-label-text-color: var(--_text-field-error-hover-label-text-color);--md-filled-field-error-hover-leading-content-color: var(--_text-field-error-hover-leading-icon-color);--md-filled-field-error-hover-state-layer-color: var(--_text-field-error-hover-state-layer-color);--md-filled-field-error-hover-state-layer-opacity: var(--_text-field-error-hover-state-layer-opacity);--md-filled-field-error-hover-supporting-text-color: var(--_text-field-error-hover-supporting-text-color);--md-filled-field-error-hover-trailing-content-color: var(--_text-field-error-hover-trailing-icon-color);--md-filled-field-error-label-text-color: var(--_text-field-error-label-text-color);--md-filled-field-error-leading-content-color: var(--_text-field-error-leading-icon-color);--md-filled-field-error-supporting-text-color: var(--_text-field-error-supporting-text-color);--md-filled-field-error-trailing-content-color: var(--_text-field-error-trailing-icon-color);--md-filled-field-focus-active-indicator-color: var(--_text-field-focus-active-indicator-color);--md-filled-field-focus-active-indicator-height: var(--_text-field-focus-active-indicator-height);--md-filled-field-focus-content-color: var(--_text-field-focus-input-text-color);--md-filled-field-focus-label-text-color: var(--_text-field-focus-label-text-color);--md-filled-field-focus-leading-content-color: var(--_text-field-focus-leading-icon-color);--md-filled-field-focus-supporting-text-color: var(--_text-field-focus-supporting-text-color);--md-filled-field-focus-trailing-content-color: var(--_text-field-focus-trailing-icon-color);--md-filled-field-hover-active-indicator-color: var(--_text-field-hover-active-indicator-color);--md-filled-field-hover-active-indicator-height: var(--_text-field-hover-active-indicator-height);--md-filled-field-hover-content-color: var(--_text-field-hover-input-text-color);--md-filled-field-hover-label-text-color: var(--_text-field-hover-label-text-color);--md-filled-field-hover-leading-content-color: var(--_text-field-hover-leading-icon-color);--md-filled-field-hover-state-layer-color: var(--_text-field-hover-state-layer-color);--md-filled-field-hover-state-layer-opacity: var(--_text-field-hover-state-layer-opacity);--md-filled-field-hover-supporting-text-color: var(--_text-field-hover-supporting-text-color);--md-filled-field-hover-trailing-content-color: var(--_text-field-hover-trailing-icon-color);--md-filled-field-label-text-color: var(--_text-field-label-text-color);--md-filled-field-label-text-font: var(--_text-field-label-text-font);--md-filled-field-label-text-line-height: var(--_text-field-label-text-line-height);--md-filled-field-label-text-populated-line-height: var(--_text-field-label-text-populated-line-height);--md-filled-field-label-text-populated-size: var(--_text-field-label-text-populated-size);--md-filled-field-label-text-size: var(--_text-field-label-text-size);--md-filled-field-label-text-weight: var(--_text-field-label-text-weight);--md-filled-field-leading-content-color: var(--_text-field-leading-icon-color);--md-filled-field-supporting-text-color: var(--_text-field-supporting-text-color);--md-filled-field-supporting-text-font: var(--_text-field-supporting-text-font);--md-filled-field-supporting-text-line-height: var(--_text-field-supporting-text-line-height);--md-filled-field-supporting-text-size: var(--_text-field-supporting-text-size);--md-filled-field-supporting-text-weight: var(--_text-field-supporting-text-weight);--md-filled-field-trailing-content-color: var(--_text-field-trailing-icon-color)}[has-start] .icon.leading{font-size:var(--_text-field-leading-icon-size);height:var(--_text-field-leading-icon-size);width:var(--_text-field-leading-icon-size)}.icon.trailing{font-size:var(--_text-field-trailing-icon-size);height:var(--_text-field-trailing-icon-size);width:var(--_text-field-trailing-icon-size)}
`,Dt=g`:host{color:unset;min-width:210px;display:flex}.field{cursor:default;outline:none}.select{position:relative;flex-direction:column}.icon.trailing svg,.icon ::slotted(*){fill:currentColor}.icon ::slotted(*){width:inherit;height:inherit;font-size:inherit}.icon slot{display:flex;height:100%;width:100%;align-items:center;justify-content:center}.icon.trailing :is(.up,.down){opacity:0;transition:opacity 75ms linear 75ms}.select:not(.open) .down,.select.open .up{opacity:1}.field,.select,md-menu{min-width:inherit;width:inherit;max-width:inherit;display:flex}md-menu{min-width:var(--__menu-min-width);max-width:var(--__menu-max-width, inherit)}.menu-wrapper{width:0px;height:0px;max-width:inherit}md-menu ::slotted(:not[disabled]){cursor:pointer}.field,.select{width:100%}:host{display:inline-flex}:host([disabled]){pointer-events:none}
`;class zt extends Lt{}zt.styles=[Dt,Pt],customElements.define("ew-filled-select",zt);const Bt=g`:host{display:flex;--md-ripple-hover-color: var(--md-menu-item-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-hover-opacity: var(--md-menu-item-hover-state-layer-opacity, 0.08);--md-ripple-pressed-color: var(--md-menu-item-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-pressed-opacity: var(--md-menu-item-pressed-state-layer-opacity, 0.12)}:host([disabled]){opacity:var(--md-menu-item-disabled-opacity, 0.3);pointer-events:none}md-focus-ring{z-index:1;--md-focus-ring-shape: 8px}a,button,li{background:none;border:none;padding:0;margin:0;text-align:unset;text-decoration:none}.list-item{border-radius:inherit;display:flex;flex:1;max-width:inherit;min-width:inherit;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0)}.list-item:not(.disabled){cursor:pointer}[slot=container]{pointer-events:none}md-ripple{border-radius:inherit}md-item{border-radius:inherit;flex:1;color:var(--md-menu-item-label-text-color, var(--md-sys-color-on-surface, #1d1b20));font-family:var(--md-menu-item-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-menu-item-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));line-height:var(--md-menu-item-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));font-weight:var(--md-menu-item-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));min-height:var(--md-menu-item-one-line-container-height, 56px);padding-top:var(--md-menu-item-top-space, 12px);padding-bottom:var(--md-menu-item-bottom-space, 12px);padding-inline-start:var(--md-menu-item-leading-space, 16px);padding-inline-end:var(--md-menu-item-trailing-space, 16px)}md-item[multiline]{min-height:var(--md-menu-item-two-line-container-height, 72px)}[slot=supporting-text]{color:var(--md-menu-item-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-menu-item-supporting-text-font, var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-menu-item-supporting-text-size, var(--md-sys-typescale-body-medium-size, 0.875rem));line-height:var(--md-menu-item-supporting-text-line-height, var(--md-sys-typescale-body-medium-line-height, 1.25rem));font-weight:var(--md-menu-item-supporting-text-weight, var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400)))}[slot=trailing-supporting-text]{color:var(--md-menu-item-trailing-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-menu-item-trailing-supporting-text-font, var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-menu-item-trailing-supporting-text-size, var(--md-sys-typescale-label-small-size, 0.6875rem));line-height:var(--md-menu-item-trailing-supporting-text-line-height, var(--md-sys-typescale-label-small-line-height, 1rem));font-weight:var(--md-menu-item-trailing-supporting-text-weight, var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500)))}:is([slot=start],[slot=end])::slotted(*){fill:currentColor}[slot=start]{color:var(--md-menu-item-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f))}[slot=end]{color:var(--md-menu-item-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f))}.list-item{background-color:var(--md-menu-item-container-color, transparent)}.list-item.selected{background-color:var(--md-menu-item-selected-container-color, var(--md-sys-color-secondary-container, #e8def8))}.selected:not(.disabled) ::slotted(*){color:var(--md-menu-item-selected-label-text-color, var(--md-sys-color-on-secondary-container, #1d192b))}@media(forced-colors: active){:host([disabled]),:host([disabled]) slot{color:GrayText;opacity:1}.list-item{position:relative}.list-item.selected::before{content:"";position:absolute;inset:0;box-sizing:border-box;border-radius:inherit;pointer-events:none;border:3px double CanvasText}}
`;class Ut extends a{constructor(){super(...arguments),this.multiline=!1}render(){return u`
      <slot name="container"></slot>
      <slot class="non-text" name="start"></slot>
      <div class="text">
        <slot name="overline" @slotchange=${this.handleTextSlotChange}></slot>
        <slot
          class="default-slot"
          @slotchange=${this.handleTextSlotChange}></slot>
        <slot name="headline" @slotchange=${this.handleTextSlotChange}></slot>
        <slot
          name="supporting-text"
          @slotchange=${this.handleTextSlotChange}></slot>
      </div>
      <slot class="non-text" name="trailing-supporting-text"></slot>
      <slot class="non-text" name="end"></slot>
    `}handleTextSlotChange(){let e=!1,t=0;for(const i of this.textSlots)if(Wt(i)&&(t+=1),t>1){e=!0;break}this.multiline=e}}function Wt(e){for(const t of e.assignedNodes({flatten:!0})){const e=t.nodeType===Node.ELEMENT_NODE,i=t.nodeType===Node.TEXT_NODE&&t.textContent?.match(/\S/);if(e||i)return!0}return!1}i([r({type:Boolean,reflect:!0})],Ut.prototype,"multiline",void 0),i([function(t){return(i,r)=>e(i,r,{get(){return(this.renderRoot??(q??=document.createDocumentFragment())).querySelectorAll(t)}})}(".text slot")],Ut.prototype,"textSlots",void 0);const Nt=g`:host{color:var(--md-sys-color-on-surface, #1d1b20);font-family:var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-body-large-size, 1rem);font-weight:var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400));line-height:var(--md-sys-typescale-body-large-line-height, 1.5rem);align-items:center;box-sizing:border-box;display:flex;gap:16px;min-height:56px;overflow:hidden;padding:12px 16px;position:relative;text-overflow:ellipsis}:host([multiline]){min-height:72px}[name=overline]{color:var(--md-sys-color-on-surface-variant, #49454f);font-family:var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-label-small-size, 0.6875rem);font-weight:var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500));line-height:var(--md-sys-typescale-label-small-line-height, 1rem)}[name=supporting-text]{color:var(--md-sys-color-on-surface-variant, #49454f);font-family:var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-body-medium-size, 0.875rem);font-weight:var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400));line-height:var(--md-sys-typescale-body-medium-line-height, 1.25rem)}[name=trailing-supporting-text]{color:var(--md-sys-color-on-surface-variant, #49454f);font-family:var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto));font-size:var(--md-sys-typescale-label-small-size, 0.6875rem);font-weight:var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500));line-height:var(--md-sys-typescale-label-small-line-height, 1rem)}[name=container]::slotted(*){inset:0;position:absolute}.default-slot{display:inline}.default-slot,.text ::slotted(*){overflow:hidden;text-overflow:ellipsis}.text{display:flex;flex:1;flex-direction:column;overflow:hidden}
`;let qt=class extends Ut{};qt.styles=[Nt],qt=i([x("md-item")],qt);class Vt{constructor(e,t){this.host=e,this.internalTypeaheadText=null,this.onClick=()=>{this.host.keepOpen||this.host.dispatchEvent(at(this.host,{kind:nt}))},this.onKeydown=e=>{if(this.host.href&&"Enter"===e.code){const e=this.getInteractiveElement();e instanceof HTMLAnchorElement&&e.click()}if(e.defaultPrevented)return;const t=e.code;this.host.keepOpen&&"Escape"!==t||ht(t)&&(e.preventDefault(),this.host.dispatchEvent(at(this.host,{kind:dt,key:t})))},this.getHeadlineElements=t.getHeadlineElements,this.getSupportingTextElements=t.getSupportingTextElements,this.getDefaultElements=t.getDefaultElements,this.getInteractiveElement=t.getInteractiveElement,this.host.addController(this)}get typeaheadText(){if(null!==this.internalTypeaheadText)return this.internalTypeaheadText;const e=this.getHeadlineElements(),t=[];return e.forEach(e=>{e.textContent&&e.textContent.trim()&&t.push(e.textContent.trim())}),0===t.length&&this.getDefaultElements().forEach(e=>{e.textContent&&e.textContent.trim()&&t.push(e.textContent.trim())}),0===t.length&&this.getSupportingTextElements().forEach(e=>{e.textContent&&e.textContent.trim()&&t.push(e.textContent.trim())}),t.join(" ")}get tagName(){switch(this.host.type){case"link":return"a";case"button":return"button";default:return"li"}}get role(){return"option"===this.host.type?"option":"menuitem"}hostConnected(){this.host.toggleAttribute("md-menu-item",!0)}hostUpdate(){this.host.href&&(this.host.type="link")}setTypeaheadText(e){this.internalTypeaheadText=e}}class Mt{get role(){return this.menuItemController.role}get typeaheadText(){return this.menuItemController.typeaheadText}setTypeaheadText(e){this.menuItemController.setTypeaheadText(e)}get displayText(){return null!==this.internalDisplayText?this.internalDisplayText:this.menuItemController.typeaheadText}setDisplayText(e){this.internalDisplayText=e}constructor(e,t){this.host=e,this.internalDisplayText=null,this.firstUpdate=!0,this.onClick=()=>{this.menuItemController.onClick()},this.onKeydown=e=>{this.menuItemController.onKeydown(e)},this.lastSelected=this.host.selected,this.menuItemController=new Vt(e,t),e.addController(this)}hostUpdate(){this.lastSelected!==this.host.selected&&(this.host.ariaSelected=this.host.selected?"true":"false")}hostUpdated(){this.lastSelected===this.host.selected||this.firstUpdate||(this.host.selected?this.host.dispatchEvent(new Event("request-selection",{bubbles:!0,composed:!0})):this.host.dispatchEvent(new Event("request-deselection",{bubbles:!0,composed:!0}))),this.lastSelected=this.host.selected,this.firstUpdate=!1}}const Ht=o(a);class jt extends Ht{constructor(){super(...arguments),this.disabled=!1,this.isMenuItem=!0,this.selected=!1,this.value="",this.type="option",this.selectOptionController=new Mt(this,{getHeadlineElements:()=>this.headlineElements,getSupportingTextElements:()=>this.supportingTextElements,getDefaultElements:()=>this.defaultElements,getInteractiveElement:()=>this.listItemRoot})}get typeaheadText(){return this.selectOptionController.typeaheadText}set typeaheadText(e){this.selectOptionController.setTypeaheadText(e)}get displayText(){return this.selectOptionController.displayText}set displayText(e){this.selectOptionController.setDisplayText(e)}render(){return this.renderListItem(u`
      <md-item>
        <div slot="container">
          ${this.renderRipple()} ${this.renderFocusRing()}
        </div>
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        ${this.renderBody()}
      </md-item>
    `)}renderListItem(e){return u`
      <li
        id="item"
        tabindex=${this.disabled?-1:0}
        role=${this.selectOptionController.role}
        aria-label=${this.ariaLabel||p}
        aria-selected=${this.ariaSelected||p}
        aria-checked=${this.ariaChecked||p}
        aria-expanded=${this.ariaExpanded||p}
        aria-haspopup=${this.ariaHasPopup||p}
        class="list-item ${h(this.getRenderClasses())}"
        @click=${this.selectOptionController.onClick}
        @keydown=${this.selectOptionController.onKeydown}
        >${e}</li
      >
    `}renderRipple(){return u` <md-ripple
      part="ripple"
      for="item"
      ?disabled=${this.disabled}></md-ripple>`}renderFocusRing(){return u` <md-focus-ring
      part="focus-ring"
      for="item"
      inward></md-focus-ring>`}getRenderClasses(){return{disabled:this.disabled,selected:this.selected}}renderBody(){return u`
      <slot></slot>
      <slot name="overline" slot="overline"></slot>
      <slot name="headline" slot="headline"></slot>
      <slot name="supporting-text" slot="supporting-text"></slot>
      <slot
        name="trailing-supporting-text"
        slot="trailing-supporting-text"></slot>
    `}focus(){this.listItemRoot?.focus()}}jt.shadowRootOptions={...a.shadowRootOptions,delegatesFocus:!0},i([r({type:Boolean,reflect:!0})],jt.prototype,"disabled",void 0),i([r({type:Boolean,attribute:"md-menu-item",reflect:!0})],jt.prototype,"isMenuItem",void 0),i([r({type:Boolean})],jt.prototype,"selected",void 0),i([r()],jt.prototype,"value",void 0),i([n(".list-item")],jt.prototype,"listItemRoot",void 0),i([v({slot:"headline"})],jt.prototype,"headlineElements",void 0),i([v({slot:"supporting-text"})],jt.prototype,"supportingTextElements",void 0),i([function(t){return(i,r)=>{const{slot:o}=t??{},s="slot"+(o?`[name=${o}]`:":not([name])");return e(i,r,{get(){const e=this.renderRoot?.querySelector(s);return e?.assignedNodes(t)??[]}})}}({slot:""})],jt.prototype,"defaultElements",void 0),i([r({attribute:"typeahead-text"})],jt.prototype,"typeaheadText",null),i([r({attribute:"display-text"})],jt.prototype,"displayText",null);class Gt extends jt{}Gt.styles=[Bt],customElements.define("ew-select-option",Gt);class Kt extends E{}Kt.styles=[R],customElements.define("ew-divider",Kt);const Jt=new Set(Object.values(ot));class Yt extends a{get items(){return this.listController.items}constructor(){super(),this.listController=new st({isItem:e=>e.hasAttribute("md-list-item"),getPossibleItems:()=>this.slotItems,isRtl:()=>"rtl"===getComputedStyle(this).direction,deactivateItem:e=>{e.tabIndex=-1},activateItem:e=>{e.tabIndex=0},isNavigableKey:e=>Jt.has(e),isActivatable:e=>!e.disabled&&"text"!==e.type}),this.internals=this.attachInternals(),this.internals.role="list",this.addEventListener("keydown",this.listController.handleKeydown)}render(){return u`
      <slot
        @deactivate-items=${this.listController.onDeactivateItems}
        @request-activation=${this.listController.onRequestActivation}
        @slotchange=${this.listController.onSlotchange}>
      </slot>
    `}activateNextItem(){return this.listController.activateNextItem()}activatePreviousItem(){return this.listController.activatePreviousItem()}}i([v({flatten:!0})],Yt.prototype,"slotItems",void 0);const Xt=g`:host{background:var(--md-list-container-color, var(--md-sys-color-surface, #fef7ff));color:unset;display:flex;flex-direction:column;outline:none;padding:8px 0;position:relative}
`;class Zt extends Yt{}Zt.styles=[Xt],customElements.define("ew-list",Zt);const Qt=o(a);class ei extends Qt{constructor(){super(...arguments),this.disabled=!1,this.type="text",this.isListItem=!0,this.href="",this.target=""}get isDisabled(){return this.disabled&&"link"!==this.type}willUpdate(e){this.href&&(this.type="link"),super.willUpdate(e)}render(){return this.renderListItem(u`
      <md-item>
        <div slot="container">
          ${this.renderRipple()} ${this.renderFocusRing()}
        </div>
        <slot name="start" slot="start"></slot>
        <slot name="end" slot="end"></slot>
        ${this.renderBody()}
      </md-item>
    `)}renderListItem(e){const t="link"===this.type;let i;switch(this.type){case"link":i=pe`a`;break;case"button":i=pe`button`;break;default:i=pe`li`}const r="text"!==this.type,o=t&&this.target?this.target:p;return fe`
      <${i}
        id="item"
        tabindex="${this.isDisabled||!r?-1:0}"
        ?disabled=${this.isDisabled}
        role="listitem"
        aria-selected=${this.ariaSelected||p}
        aria-checked=${this.ariaChecked||p}
        aria-expanded=${this.ariaExpanded||p}
        aria-haspopup=${this.ariaHasPopup||p}
        class="list-item ${h(this.getRenderClasses())}"
        href=${this.href||p}
        target=${o}
        @focus=${this.onFocus}
      >${e}</${i}>
    `}renderRipple(){return"text"===this.type?p:u` <md-ripple
      part="ripple"
      for="item"
      ?disabled=${this.isDisabled}></md-ripple>`}renderFocusRing(){return"text"===this.type?p:u` <md-focus-ring
      @visibility-changed=${this.onFocusRingVisibilityChanged}
      part="focus-ring"
      for="item"
      inward></md-focus-ring>`}onFocusRingVisibilityChanged(e){}getRenderClasses(){return{disabled:this.isDisabled}}renderBody(){return u`
      <slot></slot>
      <slot name="overline" slot="overline"></slot>
      <slot name="headline" slot="headline"></slot>
      <slot name="supporting-text" slot="supporting-text"></slot>
      <slot
        name="trailing-supporting-text"
        slot="trailing-supporting-text"></slot>
    `}onFocus(){-1===this.tabIndex&&this.dispatchEvent(new Event("request-activation",{bubbles:!0,composed:!0}))}focus(){this.listItemRoot?.focus()}click(){this.listItemRoot?this.listItemRoot.click():super.click()}}ei.shadowRootOptions={...a.shadowRootOptions,delegatesFocus:!0},i([r({type:Boolean,reflect:!0})],ei.prototype,"disabled",void 0),i([r({reflect:!0})],ei.prototype,"type",void 0),i([r({type:Boolean,attribute:"md-list-item",reflect:!0})],ei.prototype,"isListItem",void 0),i([r()],ei.prototype,"href",void 0),i([r()],ei.prototype,"target",void 0),i([n(".list-item")],ei.prototype,"listItemRoot",void 0);const ti=g`:host{display:flex;-webkit-tap-highlight-color:rgba(0,0,0,0);--md-ripple-hover-color: var(--md-list-item-hover-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-hover-opacity: var(--md-list-item-hover-state-layer-opacity, 0.08);--md-ripple-pressed-color: var(--md-list-item-pressed-state-layer-color, var(--md-sys-color-on-surface, #1d1b20));--md-ripple-pressed-opacity: var(--md-list-item-pressed-state-layer-opacity, 0.12)}:host(:is([type=button]:not([disabled]),[type=link])){cursor:pointer}md-focus-ring{z-index:1;--md-focus-ring-shape: 8px}a,button,li{background:none;border:none;cursor:inherit;padding:0;margin:0;text-align:unset;text-decoration:none}.list-item{border-radius:inherit;display:flex;flex:1;max-width:inherit;min-width:inherit;outline:none;-webkit-tap-highlight-color:rgba(0,0,0,0);width:100%}.list-item.interactive{cursor:pointer}.list-item.disabled{opacity:var(--md-list-item-disabled-opacity, 0.3);pointer-events:none}[slot=container]{pointer-events:none}md-ripple{border-radius:inherit}md-item{border-radius:inherit;flex:1;height:100%;color:var(--md-list-item-label-text-color, var(--md-sys-color-on-surface, #1d1b20));font-family:var(--md-list-item-label-text-font, var(--md-sys-typescale-body-large-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-list-item-label-text-size, var(--md-sys-typescale-body-large-size, 1rem));line-height:var(--md-list-item-label-text-line-height, var(--md-sys-typescale-body-large-line-height, 1.5rem));font-weight:var(--md-list-item-label-text-weight, var(--md-sys-typescale-body-large-weight, var(--md-ref-typeface-weight-regular, 400)));min-height:var(--md-list-item-one-line-container-height, 56px);padding-top:var(--md-list-item-top-space, 12px);padding-bottom:var(--md-list-item-bottom-space, 12px);padding-inline-start:var(--md-list-item-leading-space, 16px);padding-inline-end:var(--md-list-item-trailing-space, 16px)}md-item[multiline]{min-height:var(--md-list-item-two-line-container-height, 72px)}[slot=supporting-text]{color:var(--md-list-item-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-list-item-supporting-text-font, var(--md-sys-typescale-body-medium-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-list-item-supporting-text-size, var(--md-sys-typescale-body-medium-size, 0.875rem));line-height:var(--md-list-item-supporting-text-line-height, var(--md-sys-typescale-body-medium-line-height, 1.25rem));font-weight:var(--md-list-item-supporting-text-weight, var(--md-sys-typescale-body-medium-weight, var(--md-ref-typeface-weight-regular, 400)))}[slot=trailing-supporting-text]{color:var(--md-list-item-trailing-supporting-text-color, var(--md-sys-color-on-surface-variant, #49454f));font-family:var(--md-list-item-trailing-supporting-text-font, var(--md-sys-typescale-label-small-font, var(--md-ref-typeface-plain, Roboto)));font-size:var(--md-list-item-trailing-supporting-text-size, var(--md-sys-typescale-label-small-size, 0.6875rem));line-height:var(--md-list-item-trailing-supporting-text-line-height, var(--md-sys-typescale-label-small-line-height, 1rem));font-weight:var(--md-list-item-trailing-supporting-text-weight, var(--md-sys-typescale-label-small-weight, var(--md-ref-typeface-weight-medium, 500)))}:is([slot=start],[slot=end])::slotted(*){fill:currentColor}[slot=start]{color:var(--md-list-item-leading-icon-color, var(--md-sys-color-on-surface-variant, #49454f))}[slot=end]{color:var(--md-list-item-trailing-icon-color, var(--md-sys-color-on-surface-variant, #49454f))}@media(forced-colors: active){.disabled slot{color:GrayText}.list-item.disabled{color:GrayText;opacity:1}}
`;class ii extends ei{}ii.styles=[ti],customElements.define("ew-list-item",ii);let ri=null,oi=null;let si=class extends a{constructor(){super(...arguments),this.logger=console,this._currentPath="/",this._files=[],this._fs=null,this._blockSize=4096,this._usage={capacityBytes:0,usedBytes:0,freeBytes:0},this._diskVersion="",this._busy=!1,this._selectedFile=null,this._flashProgress=0,this._isFlashing=!1,this._flashOperation=null}async connectedCallback(){super.connectedCallback(),this.logger.log("LittleFS Manager: connectedCallback called"),await this._openFilesystem()}disconnectedCallback(){super.disconnectedCallback(),this._cleanup()}async _openFilesystem(){try{if(this._busy=!0,this._isFlashing=!0,this._flashProgress=0,this._flashOperation="reading",this.logger.log(`Reading LittleFS partition "${this.partition.name}" (${this._formatSize(this.partition.size)})...`),!this.espStub.IS_STUB)throw new Error("ESP stub loader is not running. Cannot read flash.");const e=await this.espStub.readFlash(this.partition.offset,this.partition.size,(e,t,i)=>{const r=Math.floor(t/i*100);this._flashProgress=r});if(0===e.length)throw new Error("Read 0 bytes from partition");this.logger.log("Mounting LittleFS filesystem...");const{createLittleFSFromImage:t,formatDiskVersion:i}=await async function(){if(oi)return oi;if(!ri){const e=new URL(import.meta.url),t=e.href.substring(0,e.href.lastIndexOf("/")+1);ri=t+"wasm/littlefs/"}try{const e=ri+"index.js";return console.log("[LittleFS] Loading module from:",e),oi=await import(e),oi}catch(e){console.error("[LittleFS] Failed to load from calculated path:",ri,e);try{return oi=await import("./wasm/littlefs/index.js"),oi}catch(t){throw console.error("[LittleFS] Fallback import also failed:",t),new Error(`Failed to load LittleFS module: ${e}`)}}}(),r=[4096,2048,1024,512];let o=null,s=0;for(const i of r)try{const r={blockSize:i,blockCount:Math.floor(this.partition.size/i)};ri&&(r.wasmURL=new URL("littlefs.wasm",ri).href),o=await t(e,r),o.list("/"),s=i,this.logger.log(`Successfully mounted LittleFS with block size ${i}`);break}catch(e){o=null}if(!o)throw new Error("Failed to mount LittleFS with any block size");this._fs=o,this._blockSize=s;try{const e=o.getDiskVersion();this._diskVersion=e&&0!==e?i(e):"Unknown"}catch(e){this._diskVersion="Unknown"}this._refreshFiles(),this.logger.log("LittleFS filesystem opened successfully")}catch(e){this.logger.error(`Failed to open LittleFS: ${e.message||e}`),this.onClose&&this.onClose()}finally{this._busy=!1,this._isFlashing=!1,this._flashProgress=0,this._flashOperation=null}}_refreshFiles(){if(this._fs)try{const e=this._fs.list("/"),t=this._estimateUsage(e),i=this.partition.size;this._usage={capacityBytes:i,usedBytes:t,freeBytes:i-t};const r=this._fs.list(this._currentPath);r.sort((e,t)=>"dir"===e.type&&"dir"!==t.type?-1:"dir"!==e.type&&"dir"===t.type?1:e.path.localeCompare(t.path)),this._files=r}catch(e){this.logger.error(`Failed to refresh file list: ${e.message||e}`),this._files=[]}}_estimateUsage(e){const t=this._blockSize||4096;let i=2*t;for(const r of e||[])if("dir"===r.type)i+=t;else{i+=Math.max(1,Math.ceil((r.size||0)/t))*t+t}return i}_formatSize(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(2)} KB`:`${(e/1048576).toFixed(2)} MB`}_navigateUp(){if("/"===this._currentPath||!this._currentPath)return;const e=this._currentPath.split("/").filter(Boolean);e.pop(),this._currentPath="/"+e.join("/"),"/"===this._currentPath||this._currentPath.endsWith("/")||(this._currentPath+="/"),this._refreshFiles()}_navigateTo(e){this._currentPath=e,this._refreshFiles()}async _uploadFile(){if(this._fs&&this._selectedFile)try{this._busy=!0,this.logger.log(`Uploading file "${this._selectedFile.name}"...`);const e=await this._selectedFile.arrayBuffer(),t=new Uint8Array(e);let i=this._currentPath;i.endsWith("/")||(i+="/"),i+=this._selectedFile.name;const r=i.split("/").filter(Boolean);if(r.length>1){let e="";for(let t=0;t<r.length-1;t++){e+=`/${r[t]}`;try{this._fs.mkdir(e)}catch(e){}}}"function"==typeof this._fs.writeFile?this._fs.writeFile(i,t):"function"==typeof this._fs.addFile&&this._fs.addFile(i,t);const o=this._fs.readFile(i);this.logger.log(`✓ File written: ${o.length} bytes at ${i}`);const s=this._selectedFile.name;this._selectedFile=null,this._refreshFiles(),this.logger.log(`File "${s}" uploaded successfully`)}catch(e){this.logger.error(`Failed to upload file: ${e.message||e}`)}finally{this._busy=!1}}_createFolder(){if(!this._fs)return;const e=prompt("Enter directory name:");if(e&&e.trim())try{let t=this._currentPath;t.endsWith("/")||(t+="/"),t+=e.trim(),this._fs.mkdir(t),this._refreshFiles(),this.logger.log(`Directory "${e}" created successfully`)}catch(e){this.logger.error(`Failed to create directory: ${e.message||e}`)}}async _downloadFile(e){if(this._fs)try{this.logger.log(`Downloading file "${e}"...`);const t=this._fs.readFile(e),i=e.split("/").filter(Boolean).pop()||"file.bin",r=new Blob([t],{type:"application/octet-stream"}),o=URL.createObjectURL(r),s=document.createElement("a");s.href=o,s.download=i,document.body.appendChild(s),s.click(),document.body.removeChild(s),URL.revokeObjectURL(o),this.logger.log(`File "${i}" downloaded successfully`)}catch(e){this.logger.error(`Failed to download file: ${e.message||e}`)}}_deleteFile(e,t){if(!this._fs)return;const i=e.split("/").filter(Boolean).pop()||e;if(confirm(`Delete ${t} "${i}"?`))try{"dir"===t?this._fs.delete(e,{recursive:!0}):this._fs.deleteFile(e),this._refreshFiles(),this.logger.log(`${"dir"===t?"Directory":"File"} "${i}" deleted successfully`)}catch(e){this.logger.error(`Failed to delete ${t}: ${e.message||e}`)}}async _backupImage(){if(this._fs)try{this.logger.log("Creating LittleFS backup image...");const e=this._fs.toImage(),t=`${this.partition.name}_littlefs_backup.bin`,i=new Blob([e],{type:"application/octet-stream"}),r=URL.createObjectURL(i),o=document.createElement("a");o.href=r,o.download=t,document.body.appendChild(o),o.click(),document.body.removeChild(o),URL.revokeObjectURL(r),this.logger.log(`LittleFS backup saved as "${t}"`)}catch(e){this.logger.error(`Failed to backup LittleFS: ${e.message||e}`)}}async _writeToFlash(){if(!this._fs)return;if(confirm(`Write modified LittleFS to flash?\n\nPartition: ${this.partition.name}\nOffset: 0x${this.partition.offset.toString(16)}\nSize: ${this._formatSize(this.partition.size)}\n\nThis will overwrite the current filesystem on the device!`))try{this._busy=!0,this._isFlashing=!0,this._flashProgress=0,this._flashOperation="writing",this.logger.log("Creating LittleFS image...");const e=this._fs.toImage();if(this.logger.log(`Image created: ${this._formatSize(e.length)}`),e.length>this.partition.size)return void this.logger.error(`Image size (${this._formatSize(e.length)}) exceeds partition size (${this._formatSize(this.partition.size)})`);this.logger.log(`Writing ${this._formatSize(e.length)} to partition "${this.partition.name}" at 0x${this.partition.offset.toString(16)}...`);const t=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);await this.espStub.flashData(t,(e,t)=>{const i=Math.floor(e/t*100);this._flashProgress=i},this.partition.offset),this.logger.log("✓ LittleFS successfully written to flash!"),this.logger.log("To use the new filesystem, reset your device.")}catch(e){this.logger.error(`Failed to write LittleFS to flash: ${e.message||e}`)}finally{this._busy=!1,this._isFlashing=!1,this._flashProgress=0,this._flashOperation=null}}_cleanup(){this._fs&&(this._fs=null)}_handleFileSelect(e){var t;const i=e.target;this._selectedFile=(null===(t=i.files)||void 0===t?void 0:t[0])||null}render(){const e=Math.round(this._usage.usedBytes/this._usage.capacityBytes*100);return u`
      <div class="littlefs-manager">
        <h3>LittleFS Filesystem Manager</h3>

        <div class="littlefs-info">
          <div class="littlefs-partition-info">
            <strong>Partition:</strong> ${this.partition.name}
            <span class="littlefs-size"
              >(${this._formatSize(this.partition.size)})</span
            >
          </div>
          <div class="littlefs-usage">
            <div class="usage-bar">
              <div
                class="usage-fill ${this._isFlashing?"flashing":""}"
                style="width: ${this._isFlashing?this._flashProgress:e}%"
              ></div>
            </div>
            <div class="usage-text">
              ${this._isFlashing?u`<span class="flash-status">
                    ⚡
                    ${"reading"===this._flashOperation?"Reading from":"Writing to"}
                    flash: ${this._flashProgress}%
                  </span>`:u`<span
                      >Used: ${this._formatSize(this._usage.usedBytes)} /
                      ${this._formatSize(this._usage.capacityBytes)}
                      (${e}%)</span
                    >
                    ${this._diskVersion?u`<span class="disk-version"
                          >${this._diskVersion}</span
                        >`:""}`}
            </div>
          </div>
        </div>

        <div class="littlefs-controls">
          <ew-text-button @click=${this._refreshFiles} ?disabled=${this._busy}
            >Refresh</ew-text-button
          >
          <ew-text-button @click=${this._backupImage} ?disabled=${this._busy}
            >Backup Image</ew-text-button
          >
          <ew-text-button @click=${this._writeToFlash} ?disabled=${this._busy}
            >Write to Flash</ew-text-button
          >
          <ew-text-button
            @click=${()=>{this._cleanup(),this.onClose&&this.onClose()}}
            ?disabled=${this._busy}
            >Close</ew-text-button
          >
        </div>

        <div class="littlefs-breadcrumb">
          <ew-text-button
            @click=${this._navigateUp}
            ?disabled=${"/"===this._currentPath||this._busy}
            >↑ Up</ew-text-button
          >
          <span>${this._currentPath||"/"}</span>
        </div>

        <div class="littlefs-file-upload">
          <input
            type="file"
            @change=${this._handleFileSelect}
            ?disabled=${this._busy}
          />
          <ew-text-button
            @click=${this._uploadFile}
            ?disabled=${!this._selectedFile||this._busy}
            >Upload File</ew-text-button
          >
          <ew-text-button @click=${this._createFolder} ?disabled=${this._busy}
            >New Folder</ew-text-button
          >
        </div>

        <div class="littlefs-files">
          <table class="file-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Size</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${0===this._files.length?u`
                    <tr>
                      <td colspan="4" class="empty-state">
                        No files in this directory
                      </td>
                    </tr>
                  `:this._files.map(e=>u`
                      <tr>
                        <td>
                          <div
                            class="file-name ${"dir"===e.type?"clickable":""}"
                            @click=${"dir"===e.type?()=>this._navigateTo(e.path):null}
                          >
                            <span class="file-icon"
                              >${"dir"===e.type?"📁":"📄"}</span
                            >
                            <span
                              >${e.path.split("/").filter(Boolean).pop()||"/"}</span
                            >
                          </div>
                        </td>
                        <td>${"dir"===e.type?"Directory":"File"}</td>
                        <td>
                          ${"file"===e.type?this._formatSize(e.size):"-"}
                        </td>
                        <td>
                          <div class="file-actions">
                            ${"file"===e.type?u`
                                  <ew-text-button
                                    @click=${()=>this._downloadFile(e.path)}
                                    ?disabled=${this._busy}
                                    >Download</ew-text-button
                                  >
                                `:""}
                            <ew-text-button
                              class="danger"
                              @click=${()=>this._deleteFile(e.path,e.type)}
                              ?disabled=${this._busy}
                              >Delete</ew-text-button
                            >
                          </div>
                        </td>
                      </tr>
                    `)}
            </tbody>
          </table>
        </div>
      </div>
    `}};si.styles=g`
    :host {
      display: block;
    }

    .littlefs-manager {
      width: 100%;
      max-width: 100%;
      margin: 0 auto;
      padding: 15px;
      border: 2px solid var(--md-sys-color-primary, #03a9f4);
      border-radius: 10px;
      background-color: rgba(3, 169, 244, 0.05);
      box-sizing: border-box;
    }

    h3 {
      margin: 0 0 15px 0;
      color: var(--md-sys-color-primary, #03a9f4);
      font-size: 18px;
      font-weight: 600;
    }

    .littlefs-info {
      margin-bottom: 15px;
      padding: 12px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
    }

    .littlefs-partition-info {
      margin-bottom: 10px;
      font-size: 13px;
    }

    .littlefs-size {
      color: #666;
      margin-left: 8px;
    }

    .littlefs-usage {
      margin-top: 8px;
    }

    .usage-bar {
      width: 100%;
      height: 18px;
      background-color: #e0e0e0;
      border-radius: 10px;
      overflow: hidden;
      margin-bottom: 6px;
    }

    .usage-fill {
      height: 100%;
      background: linear-gradient(
        90deg,
        var(--md-sys-color-primary, #03a9f4) 0%,
        var(--md-sys-color-primary, #03a9f4) 100%
      );
      transition: width 0.3s ease;
    }

    .usage-fill.flashing {
      background: linear-gradient(90deg, #ff9800 0%, #ff5722 100%);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%,
      100% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
    }

    .flash-status {
      font-weight: 600;
      color: #ff5722;
    }

    .usage-text {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      color: #555;
      flex-wrap: wrap;
      gap: 5px;
    }

    .disk-version {
      font-size: 11px;
      padding: 2px 6px;
      background-color: var(--md-sys-color-primary, #03a9f4);
      color: white;
      border-radius: 4px;
    }

    .littlefs-controls {
      display: flex;
      gap: 8px;
      margin-bottom: 15px;
      flex-wrap: wrap;
    }

    .littlefs-breadcrumb {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 12px;
      padding: 8px;
      background-color: rgba(255, 255, 255, 0.5);
      border-radius: 8px;
    }

    .littlefs-breadcrumb span {
      font-family: monospace;
      font-size: 13px;
      color: #333;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .littlefs-file-upload {
      display: flex;
      gap: 8px;
      margin-bottom: 12px;
      align-items: center;
      flex-wrap: wrap;
    }

    .littlefs-file-upload input[type="file"] {
      flex: 1;
      min-width: 150px;
      padding: 4px;
      border: 2px solid #ccc;
      border-radius: 8px;
      font-size: 13px;
    }

    .littlefs-files {
      max-height: 350px;
      overflow-y: auto;
      overflow-x: auto;
      border: 1px solid #ccc;
      border-radius: 8px;
    }

    .file-table {
      width: 100%;
      min-width: 500px;
      border-collapse: collapse;
    }

    .file-table thead {
      position: sticky;
      top: 0;
      background-color: #f5f5f5;
      z-index: 10;
    }

    .file-table th {
      padding: 8px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid #ccc;
    }

    .file-table td {
      padding: 8px 10px;
      border-bottom: 1px solid #e0e0e0;
    }

    .file-table tbody tr:hover {
      background-color: rgba(3, 169, 244, 0.1);
    }

    .file-table .empty-state {
      text-align: center;
      color: #999;
      padding: 30px;
      font-style: italic;
    }

    .file-name {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .file-name.clickable {
      cursor: pointer;
    }

    .file-name.clickable:hover {
      color: var(--md-sys-color-primary, #03a9f4);
      text-decoration: underline;
    }

    .file-icon {
      font-size: 16px;
    }

    .file-actions {
      display: flex;
      gap: 5px;
    }

    .danger {
      --md-sys-color-primary: var(--danger-color, #db4437);
    }
  `,i([r({type:Object})],si.prototype,"partition",void 0),i([r({type:Object})],si.prototype,"espStub",void 0),i([r({type:Function})],si.prototype,"logger",void 0),i([r({type:Function})],si.prototype,"onClose",void 0),i([l()],si.prototype,"_currentPath",void 0),i([l()],si.prototype,"_files",void 0),i([l()],si.prototype,"_fs",void 0),i([l()],si.prototype,"_blockSize",void 0),i([l()],si.prototype,"_usage",void 0),i([l()],si.prototype,"_diskVersion",void 0),i([l()],si.prototype,"_busy",void 0),i([l()],si.prototype,"_selectedFile",void 0),i([l()],si.prototype,"_flashProgress",void 0),i([l()],si.prototype,"_isFlashing",void 0),i([l()],si.prototype,"_flashOperation",void 0),si=i([x("ewt-littlefs-manager")],si);const ai=o(a);class li extends ai{constructor(){super(...arguments),this.value=0,this.max=1,this.indeterminate=!1,this.fourColor=!1}render(){const{ariaLabel:e}=this;return u`
      <div
        class="progress ${h(this.getRenderClasses())}"
        role="progressbar"
        aria-label="${e||p}"
        aria-valuemin="0"
        aria-valuemax=${this.max}
        aria-valuenow=${this.indeterminate?p:this.value}
        >${this.renderIndicator()}</div
      >
    `}getRenderClasses(){return{indeterminate:this.indeterminate,"four-color":this.fourColor}}}i([r({type:Number})],li.prototype,"value",void 0),i([r({type:Number})],li.prototype,"max",void 0),i([r({type:Boolean})],li.prototype,"indeterminate",void 0),i([r({type:Boolean,attribute:"four-color"})],li.prototype,"fourColor",void 0);class ni extends li{renderIndicator(){return this.indeterminate?this.renderIndeterminateContainer():this.renderDeterminateContainer()}renderDeterminateContainer(){const e=100*(1-this.value/this.max);return u`
      <svg viewBox="0 0 4800 4800">
        <circle class="track" pathLength="100"></circle>
        <circle
          class="active-track"
          pathLength="100"
          stroke-dashoffset=${e}></circle>
      </svg>
    `}renderIndeterminateContainer(){return u` <div class="spinner">
      <div class="left">
        <div class="circle"></div>
      </div>
      <div class="right">
        <div class="circle"></div>
      </div>
    </div>`}}const di=g`:host{--_active-indicator-color: var(--md-circular-progress-active-indicator-color, var(--md-sys-color-primary, #6750a4));--_active-indicator-width: var(--md-circular-progress-active-indicator-width, 10);--_four-color-active-indicator-four-color: var(--md-circular-progress-four-color-active-indicator-four-color, var(--md-sys-color-tertiary-container, #ffd8e4));--_four-color-active-indicator-one-color: var(--md-circular-progress-four-color-active-indicator-one-color, var(--md-sys-color-primary, #6750a4));--_four-color-active-indicator-three-color: var(--md-circular-progress-four-color-active-indicator-three-color, var(--md-sys-color-tertiary, #7d5260));--_four-color-active-indicator-two-color: var(--md-circular-progress-four-color-active-indicator-two-color, var(--md-sys-color-primary-container, #eaddff));--_size: var(--md-circular-progress-size, 48px);display:inline-flex;vertical-align:middle;width:var(--_size);height:var(--_size);position:relative;align-items:center;justify-content:center;contain:strict;content-visibility:auto}.progress{flex:1;align-self:stretch;margin:4px}.progress,.spinner,.left,.right,.circle,svg,.track,.active-track{position:absolute;inset:0}svg{transform:rotate(-90deg)}circle{cx:50%;cy:50%;r:calc(50%*(1 - var(--_active-indicator-width)/100));stroke-width:calc(var(--_active-indicator-width)*1%);stroke-dasharray:100;fill:rgba(0,0,0,0)}.active-track{transition:stroke-dashoffset 500ms cubic-bezier(0, 0, 0.2, 1);stroke:var(--_active-indicator-color)}.track{stroke:rgba(0,0,0,0)}.progress.indeterminate{animation:linear infinite linear-rotate;animation-duration:1568.2352941176ms}.spinner{animation:infinite both rotate-arc;animation-duration:5332ms;animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.left{overflow:hidden;inset:0 50% 0 0}.right{overflow:hidden;inset:0 0 0 50%}.circle{box-sizing:border-box;border-radius:50%;border:solid calc(var(--_active-indicator-width)/100*(var(--_size) - 8px));border-color:var(--_active-indicator-color) var(--_active-indicator-color) rgba(0,0,0,0) rgba(0,0,0,0);animation:expand-arc;animation-iteration-count:infinite;animation-fill-mode:both;animation-duration:1333ms,5332ms;animation-timing-function:cubic-bezier(0.4, 0, 0.2, 1)}.four-color .circle{animation-name:expand-arc,four-color}.left .circle{rotate:135deg;inset:0 -100% 0 0}.right .circle{rotate:100deg;inset:0 0 0 -100%;animation-delay:-666.5ms,0ms}@media(forced-colors: active){.active-track{stroke:CanvasText}.circle{border-color:CanvasText CanvasText Canvas Canvas}}@keyframes expand-arc{0%{transform:rotate(265deg)}50%{transform:rotate(130deg)}100%{transform:rotate(265deg)}}@keyframes rotate-arc{12.5%{transform:rotate(135deg)}25%{transform:rotate(270deg)}37.5%{transform:rotate(405deg)}50%{transform:rotate(540deg)}62.5%{transform:rotate(675deg)}75%{transform:rotate(810deg)}87.5%{transform:rotate(945deg)}100%{transform:rotate(1080deg)}}@keyframes linear-rotate{to{transform:rotate(360deg)}}@keyframes four-color{0%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}15%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}25%{border-top-color:var(--_four-color-active-indicator-two-color);border-right-color:var(--_four-color-active-indicator-two-color)}40%{border-top-color:var(--_four-color-active-indicator-two-color);border-right-color:var(--_four-color-active-indicator-two-color)}50%{border-top-color:var(--_four-color-active-indicator-three-color);border-right-color:var(--_four-color-active-indicator-three-color)}65%{border-top-color:var(--_four-color-active-indicator-three-color);border-right-color:var(--_four-color-active-indicator-three-color)}75%{border-top-color:var(--_four-color-active-indicator-four-color);border-right-color:var(--_four-color-active-indicator-four-color)}90%{border-top-color:var(--_four-color-active-indicator-four-color);border-right-color:var(--_four-color-active-indicator-four-color)}100%{border-top-color:var(--_four-color-active-indicator-one-color);border-right-color:var(--_four-color-active-indicator-one-color)}}
`;class ci extends ni{}ci.styles=[di],customElements.define("ew-circular-progress",ci);class hi extends a{render(){return u`
      <div>
        <ew-circular-progress
          active
          ?indeterminate=${void 0===this.progress}
          .value=${void 0!==this.progress?this.progress/100:void 0}
        ></ew-circular-progress>
        ${void 0!==this.progress?u`<div>${this.progress}%</div>`:""}
      </div>
      ${this.label}
    `}}hi.styles=g`
    :host {
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    ew-circular-progress {
      margin-bottom: 16px;
    }
  `,i([r()],hi.prototype,"label",void 0),i([r()],hi.prototype,"progress",void 0),customElements.define("ewt-page-progress",hi);class pi extends a{render(){return u`
      <div class="icon">${this.icon}</div>
      ${this.label}
    `}}pi.styles=g`
    :host {
      display: flex;
      flex-direction: column;
      text-align: center;
    }
    .icon {
      font-size: 50px;
      line-height: 80px;
      color: black;
    }
    ew-circular-progress {
      margin-bottom: 16px;
    }
  `,i([r()],pi.prototype,"icon",void 0),i([r()],pi.prototype,"label",void 0),customElements.define("ewt-page-message",pi);const ui=C`
  <svg width="24" height="24" viewBox="0 0 24 24">
    <path
      d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z"
    />
  </svg>
`;C`
  <svg viewBox="0 0 24 24" title="Software">
    <path
      fill="currentColor"
      d="M9.5,8.5L11,10L8,13L11,16L9.5,17.5L5,13L9.5,8.5M14.5,17.5L13,16L16,13L13,10L14.5,8.5L19,13L14.5,17.5M21,2H3A2,2 0 0,0 1,4V20A2,2 0 0,0 3,22H21A2,2 0 0,0 23,20V4A2,2 0 0,0 21,2M21,20H3V6H21V20Z"
    />
  </svg>
`,C`
  <svg viewBox="0 0 24 24" title="Chipset">
    <path
      fill="currentColor"
      d="M6,4H18V5H21V7H18V9H21V11H18V13H21V15H18V17H21V19H18V20H6V19H3V17H6V15H3V13H6V11H3V9H6V7H3V5H6V4M11,15V18H12V15H11M13,15V18H14V15H13M15,15V18H16V15H15Z"
    />
  </svg>
`;const fi=["I".charCodeAt(0),"M".charCodeAt(0),"P".charCodeAt(0),"R".charCodeAt(0),"O".charCodeAt(0),"V".charCodeAt(0),1];var gi,mi;!function(e){e[e.CURRENT_STATE=1]="CURRENT_STATE",e[e.ERROR_STATE=2]="ERROR_STATE",e[e.RPC=3]="RPC",e[e.RPC_RESULT=4]="RPC_RESULT"}(gi||(gi={})),function(e){e[e.READY=2]="READY",e[e.PROVISIONING=3]="PROVISIONING",e[e.PROVISIONED=4]="PROVISIONED"}(mi||(mi={}));const vi={0:"NO_ERROR",1:"INVALID_RPC_PACKET",2:"UNKNOWN_RPC_COMMAND",3:"UNABLE_TO_CONNECT",254:"TIMEOUT",255:"UNKNOWN_ERROR"};class bi extends Error{constructor(){super("Port is not ready")}}const yi=e=>"["+e.map(e=>((e,t=2)=>{let i=e.toString(16).toUpperCase();return i.startsWith("-")?"-0x"+i.substring(1).padStart(t,"0"):"0x"+i.padStart(t,"0")})(e)).join(", ")+"]";class xi extends EventTarget{constructor(e,t){if(super(),this.port=e,this.logger=t,this.error=0,null===e.readable)throw new Error("Port is not readable");if(null===e.writable)throw new Error("Port is not writable")}async initialize(e=1e3){var t;if(this.logger.log("Initializing Improv Serial"),this._processInput(),await(t=1e3,new Promise(e=>setTimeout(e,t))),void 0===this._reader)throw new bi;try{await new Promise(async(t,i)=>{setTimeout(()=>i(new Error("Improv Wi-Fi Serial not detected")),e),await this.requestCurrentState(),t(void 0)}),await this.requestInfo()}catch(e){throw await this.close(),e}return this.info}async close(){this._reader&&await new Promise(e=>{this._reader.cancel(),this.addEventListener("disconnect",e,{once:!0})})}async requestCurrentState(){let e;try{await new Promise(async(t,i)=>{this.addEventListener("state-changed",t,{once:!0});e=this._sendRPCWithResponse(2,[]),e.catch(e=>{this.removeEventListener("state-changed",t),i(e)})})}catch(e){throw this._rpcFeedback=void 0,new Error(`Error fetching current state: ${e}`)}if(this.state!==mi.PROVISIONED)return void(this._rpcFeedback=void 0);const t=await e;this.nextUrl=t[0]}async requestInfo(e){const t=await this._sendRPCWithResponse(3,[],e);this.info={firmware:t[0],version:t[1],name:t[3],chipFamily:t[2]}}async provision(e,t,i){const r=new TextEncoder,o=r.encode(e),s=r.encode(t),a=[o.length,...o,s.length,...s],l=await this._sendRPCWithResponse(1,a,i);this.nextUrl=l[0]}async scan(){const e=(await this._sendRPCWithMultipleResponses(4,[])).map(([e,t,i])=>({name:e,rssi:parseInt(t),secured:"YES"===i}));return e.sort((e,t)=>e.name.toLocaleLowerCase().localeCompare(t.name.toLocaleLowerCase())),e}_sendRPC(e,t){this.writePacketToStream(gi.RPC,[e,t.length,...t])}async _sendRPCWithResponse(e,t,i){if(this._rpcFeedback)throw new Error("Only 1 RPC command that requires feedback can be active");return await this._awaitRPCResultWithTimeout(new Promise((i,r)=>{this._rpcFeedback={command:e,resolve:i,reject:r},this._sendRPC(e,t)}),i)}async _sendRPCWithMultipleResponses(e,t,i){if(this._rpcFeedback)throw new Error("Only 1 RPC command that requires feedback can be active");return await this._awaitRPCResultWithTimeout(new Promise((i,r)=>{this._rpcFeedback={command:e,resolve:i,reject:r,receivedData:[]},this._sendRPC(e,t)}),i)}async _awaitRPCResultWithTimeout(e,t){return t?await new Promise((i,r)=>{const o=setTimeout(()=>this._setError(254),t);e.finally(()=>clearTimeout(o)),e.then(i,r)}):await e}async _processInput(){this.logger.debug("Starting read loop"),this._reader=this.port.readable.getReader();try{let e,t=[],i=0;for(;;){const{value:r,done:o}=await this._reader.read();if(o)break;if(r&&0!==r.length)for(const o of r){if(!1===e){10===o&&(e=void 0);continue}if(!0===e){t.push(o),t.length===i&&(this._handleIncomingPacket(t),e=void 0,t=[]);continue}if(10===o){t=[];continue}if(t.push(o),9!==t.length)continue;if(e="IMPROV"===String.fromCharCode(...t.slice(0,6)),!e){t=[];continue}i=9+t[8]+1}}}catch(e){this.logger.error("Error while reading serial port",e)}finally{this._reader.releaseLock(),this._reader=void 0}this.logger.debug("Finished read loop"),this.dispatchEvent(new Event("disconnect"))}_handleIncomingPacket(e){const t=e.slice(6),i=t[0],r=t[1],o=t[2],s=t.slice(3,3+o);if(this.logger.debug("PROCESS",{version:i,packetType:r,packetLength:o,data:yi(s)}),1!==i)return void this.logger.error("Received unsupported version",i);let a=t[3+o],l=0;for(let t=0;t<e.length-1;t++)l+=e[t];if(l&=255,l===a)if(r===gi.CURRENT_STATE)this.state=s[0],this.dispatchEvent(new CustomEvent("state-changed",{detail:this.state}));else if(r===gi.ERROR_STATE)this._setError(s[0]);else if(r===gi.RPC_RESULT){if(!this._rpcFeedback)return void this.logger.error("Received result while not waiting for one");const e=s[0];if(e!==this._rpcFeedback.command)return void this.logger.error(`Received result for command ${e} but expected ${this._rpcFeedback.command}`);const t=[],i=s[1];let r=2;for(;r<2+i;)t.push(String.fromCodePoint(...s.slice(r+1,r+s[r]+1))),r+=s[r]+1;"receivedData"in this._rpcFeedback?t.length>0?this._rpcFeedback.receivedData.push(t):(this._rpcFeedback.resolve(this._rpcFeedback.receivedData),this._rpcFeedback=void 0):(this._rpcFeedback.resolve(t),this._rpcFeedback=void 0)}else this.logger.error("Unable to handle packet",t);else this.logger.error(`Received invalid checksum ${a}. Expected ${l}`)}async writePacketToStream(e,t){const i=new Uint8Array([...fi,e,t.length,...t,0,0]);i[i.length-2]=255&i.reduce((e,t)=>e+t,0),i[i.length-1]=10,this.logger.debug("Writing to stream:",yi(new Array(...i)));const r=this.port.writable.getWriter();await r.write(i);try{r.releaseLock()}catch(e){console.error("Ignoring release lock error",e)}}_setError(e){this.error=e,e>0&&this._rpcFeedback&&(this._rpcFeedback.reject(vi[e]||`UNKNOWN_ERROR (${e})`),this._rpcFeedback=void 0),this.dispatchEvent(new CustomEvent("error-changed",{detail:this.error}))}}const _i=e=>{switch(e.chipFamily){case W:return"ESP32";case U:return"ESP32-S2";case B:return"ESP32-S3";case z:return"ESP32-C2";case D:return"ESP32-C3";case P:return"ESP32-C5";case L:return"ESP32-C6";case A:return"ESP32-C61";case O:return"ESP32-H2";case F:return"ESP32-P4";case T:return"ESP8266";default:return"Unknown Chip"}},wi=async(e,t,i,r,o,s,a)=>{let l,n,d,c=null;const h=t=>e({...t,manifest:l,build:n,chipFamily:d,chipVariant:c});var p=null,u="";try{p=JSON.parse(r)}catch{u=new URL(r,location.toString()).toString(),p=N(u).then(e=>e.json())}if(window.esploader=t,h({state:"initializing",message:"Initializing...",details:{done:!1}}),!t.chipFamily)try{await t.initialize()}catch(e){return i.error(e),h({state:"error",message:"Failed to initialize. Try resetting your device or holding the BOOT button while clicking INSTALL.",details:{error:"failed_initialize",details:e}}),void(t.connected&&await t.disconnect())}d=_i(t),c=t.chipVariant,h({state:"initializing",message:`Initialized. Found ${d}${c?` (${c})`:""}`,details:{done:!0}}),h({state:"manifest",message:"Fetching manifest...",details:{done:!1}});try{l=await p}catch(e){return h({state:"error",message:`Unable to fetch manifest: ${e}`,details:{error:"fetch_manifest_failed",details:e}}),void await t.disconnect()}if(n=l.builds.find(e=>e.chipFamily===d&&(!e.chipVariant||e.chipVariant===c)),!n)return h({state:"error",message:`Your ${d}${c?` (${c})`:""} is not supported by this firmware.`,details:{error:"not_supported",details:d}}),void await t.disconnect();h({state:"manifest",message:"Manifest fetched",details:{done:!0}}),h({state:"preparing",message:"Preparing installation...",details:{done:!1}});const f=t;if(!f.chipFamily)return i.error("Stub missing chipFamily - this should not happen!"),void h({state:"error",message:"Internal error: Stub not properly initialized",details:{error:"failed_initialize",details:"Missing chipFamily"}});const g=n.parts.map(async e=>{const t=new URL(e.path,u||location.toString()).toString(),i=await N(t);if(!i.ok)throw new Error(`Downlading firmware ${e.path} failed: ${i.status}`);return i.arrayBuffer()});s&&g.push(Promise.resolve(s.buffer));const m=[];let v=0;for(const e of g)try{const t=await e;m.push(t),v+=t.byteLength}catch(e){return h({state:"error",message:e.message,details:{error:"failed_firmware_download",details:e}}),void await t.disconnect()}if(h({state:"preparing",message:"Installation prepared",details:{done:!0}}),o){h({state:"erasing",message:"Erasing flash...",details:{done:!1}});try{i.log("Erasing flash memory. Please wait..."),await f.eraseFlash(),i.log("Flash erased successfully"),h({state:"erasing",message:"Flash erased",details:{done:!0}})}catch(e){return i.error(`Flash erase failed: ${e.message}`),h({state:"error",message:`Failed to erase flash: ${e.message}`,details:{error:"write_failed",details:e}}),void await t.disconnect()}}h({state:"writing",message:"Writing progress: 0 %",details:{bytesTotal:v,bytesWritten:0,percentage:0}});let b=0,y=0;try{for(let e=0;e<n.parts.length;e++){const t=n.parts[e],i=m[e];await f.flashData(i,(e,t)=>{const i=Math.floor((y+e)/v*100);i!==b&&(b=i,h({state:"writing",message:`Writing progress: ${i} %`,details:{bytesTotal:v,bytesWritten:y+e,percentage:i}}))},t.offset),y+=i.byteLength}}catch(e){return h({state:"error",message:e.message,details:{error:"write_failed",details:e}}),void await t.disconnect()}h({state:"writing",message:"Writing complete",details:{bytesTotal:v,bytesWritten:v,percentage:100}}),await se(100),h({state:"finished",message:"All done!"})},ki=(e,t="")=>{const i=new Blob([e],{type:"text/plain"}),r=URL.createObjectURL(i);((e,t="")=>{const i=document.createElement("a");i.target="_blank",i.href=e,i.download=t,document.body.appendChild(i),i.dispatchEvent(new MouseEvent("click")),document.body.removeChild(i)})(r,t),setTimeout(()=>URL.revokeObjectURL(r),0)},Si={0:"app",1:"data"},$i={0:"factory",16:"ota_0",17:"ota_1",18:"ota_2",19:"ota_3",20:"ota_4",21:"ota_5",22:"ota_6",23:"ota_7",24:"ota_8",25:"ota_9",26:"ota_10",27:"ota_11",28:"ota_12",29:"ota_13",30:"ota_14",31:"ota_15",32:"test"},Ri={0:"ota",1:"phy",2:"nvs",3:"coredump",4:"nvs_keys",5:"efuse",128:"esphttpd",129:"fat",130:"spiffs"};function Ei(e){if(e.length<32)return null;if(20650!==(65535&(e[0]|e[1]<<8)))return null;const t=e[2],i=e[3],r=e[4]|e[5]<<8|e[6]<<16|e[7]<<24,o=e[8]|e[9]<<8|e[10]<<16|e[11]<<24;let s="";for(let t=12;t<28&&0!==e[t];t++)s+=String.fromCharCode(e[t]);const a=e[28]|e[29]<<8|e[30]<<16|e[31]<<24,l=Si[t]||`unknown(0x${t.toString(16)})`;let n="";return n=0===t?$i[i]||`unknown(0x${i.toString(16)})`:1===t?Ri[i]||`unknown(0x${i.toString(16)})`:`0x${i.toString(16)}`,{name:s,type:t,subtype:i,offset:r,size:o,flags:a,typeName:l,subtypeName:n}}const Ci="⚠️";class Ii extends a{constructor(){super(...arguments),this.logger=console,this._state="DASHBOARD",this._installErase=!1,this._installConfirmed=!1,this._provisionForce=!1,this._wasProvisioned=!1,this._busy=!0,this._selectedSsid=null,this._improvChecked=!1,this._consoleInitialized=!1,this._improvSupported=!1,this._isUsbJtagOrOtgDevice=!1,this._openConsoleAfterReconnect=!1,this._visitDeviceAfterReconnect=!1,this._addToHAAfterReconnect=!1,this._changeWiFiAfterReconnect=!1,this._handleDisconnect=()=>{this._state="ERROR",this._error="Disconnected"}}async _ensureStub(){if(this._espStub&&this._espStub.IS_STUB){if(this.logger.log(`Existing stub: IS_STUB=${this._espStub.IS_STUB}, chipFamily=${_i(this._espStub)}`),this.baudRate&&this.baudRate>115200){const e=this._espStub.currentBaudRate||115200;if(e!==this.baudRate){this.logger.log(`Adjusting baudrate from ${e} to ${this.baudRate}...`);try{await this._espStub.setBaudrate(this.baudRate),this.logger.log(`Baudrate set to ${this.baudRate}`),this._espStub.currentBaudRate=this.baudRate}catch(e){this.logger.log(`Failed to set baudrate: ${e.message}, continuing with current`),this._espStub.currentBaudRate=this.baudRate}}else this.logger.log(`Baudrate already at ${this.baudRate}, skipping`)}return this._espStub}if(!this.esploader.chipFamily){this.logger.log("Initializing ESP loader...");for(let e=1;e<=2;e++)try{e>1&&(this.logger.log(`Retry attempt ${e}/2...`),await se(500)),await this.esploader.initialize(),this.logger.log(`Found ${_i(this.esploader)}`);break}catch(t){if(this.logger.error(`Connection failed to stub (attempt ${e}/2): ${t.message}`),2===e)throw this._state="ERROR",this._error=`Failed to connect to ESP after 2 attempts: ${t.message}`,t}}this.logger.log("Running stub...");const e=await this.esploader.runStub();if(this.logger.log(`Stub created: IS_STUB=${e.IS_STUB}, chipFamily=${_i(e)}`),this._espStub=e,this.baudRate&&this.baudRate>115200){this.logger.log(`Setting baudrate to ${this.baudRate}...`);try{await e.setBaudrate(this.baudRate),this.logger.log(`Baudrate set to ${this.baudRate}`),e.currentBaudRate=this.baudRate}catch(e){this.logger.error(`[DEBUG] setBaudrate() threw error: ${e.message}`),this.logger.log(`Failed to set baudrate: ${e.message}, continuing with default`)}}return this.logger.log(`Returning stub: IS_STUB=${this._espStub.IS_STUB}, chipFamily=${_i(this._espStub)}`),this._espStub}get _port(){return this.esploader.port}async _isUsbJtagOrOtg(){const e=await this.esploader.detectUsbConnectionType();return this.logger.log("USB-JTAG/OTG detection: "+(e?"YES":"NO")),e}async _isWebUsbWithExternalSerial(){if(!(this.esploader.isWebUSB&&this.esploader.isWebUSB()))return!1;const e=!await this._isUsbJtagOrOtg();return this.logger.log("WebUSB with external serial: "+(e?"YES":"NO")),e}async _releaseReaderWriter(){let e=this._espStub||this.esploader;if(e._parent&&(e=e._parent,this.logger.log("Using parent loader for reader/writer")),e._reader){const t=e._reader;try{await t.cancel(),this.logger.log("Reader cancelled on correct object")}catch(e){this.logger.log("Reader cancel failed:",e)}try{t.releaseLock(),this.logger.log("Reader released")}catch(e){this.logger.log("Reader releaseLock failed:",e)}e._reader=void 0}if(e._writer){const t=e._writer;e._writer=void 0;try{t.releaseLock(),this.logger.log("Writer lock released")}catch(e){this.logger.log("Writer releaseLock failed:",e)}}if(this.esploader.isWebUSB&&this.esploader.isWebUSB())try{this.logger.log("WebUSB detected - recreating streams"),await this._port.recreateStreams(),await se(200),this.logger.log("WebUSB streams recreated and ready")}catch(e){this.logger.log(`Failed to recreate WebUSB streams: ${e.message}`)}}async _resetBaudrateForConsole(){if(this._espStub&&115200!==this._espStub.currentBaudRate){this.logger.log(`Resetting baudrate from ${this._espStub.currentBaudRate} to 115200`);try{await this._espStub.setBaudrate(115200),this.logger.log("Baudrate set to 115200 for console")}catch(e){this.logger.log(`Failed to set baudrate to 115200: ${e.message}`)}}}async _prepareForFlashOperations(){await this._resetToBootloaderAndReleaseLocks(),await se(100),this._espStub=void 0,this.esploader.IS_STUB=!1,await this._ensureStub(),this.logger.log("ESP reset, stub loaded - ready for flash operations")}async _handleFlashComplete(){const e=await this._isUsbJtagOrOtg();if(this._isUsbJtagOrOtgDevice=e,e){this.logger.log("USB-JTAG/OTG device - resetting to firmware mode"),await this._releaseReaderWriter();try{await this._port.forget(),this.logger.log("Old port forgotten")}catch(e){this.logger.log(`Port forget failed: ${e.message}`)}try{await this.esploader.resetToFirmware(),this.logger.log("Device reset to firmware mode - port closed")}catch(e){this.logger.debug(`Reset to firmware error (expected): ${e.message}`)}return await se(100),this._espStub=void 0,this.esploader.IS_STUB=!1,this.esploader.chipFamily=null,this._improvChecked=!1,this._client=null,this._improvSupported=!1,this.esploader._reader=void 0,this.logger.log("Flash complete - waiting for user to select new port"),this._state="REQUEST_PORT_SELECTION",this._error="",void this.requestUpdate()}await this._releaseReaderWriter(),this._espStub=void 0,this.esploader.IS_STUB=!1,this.esploader.chipFamily=null,this._improvChecked=!1,this.esploader._reader=void 0,this.logger.log("ESP state reset for Improv test");try{this.logger.log("Reconnecting at 115200 baud for firmware reset...");try{await this.esploader.reconnectToBootloader(),this.logger.log("Port reconnected at 115200 baud")}catch(e){this.logger.log(`Reconnect failed: ${e.message}`)}this.logger.log("Performing hardware reset to start new firmware..."),await this._resetDeviceAndReleaseLocks()}catch(e){this.logger.log(`Hard reset failed: ${e.message}`)}await this._initialize(!0),this.requestUpdate()}async _resetDeviceAndReleaseLocks(){let e=this._espStub||this.esploader;e._parent&&(e=e._parent,this.logger.log("Using parent loader for reader/writer"));try{await this.esploader.hardReset(!1),this.logger.log("Device reset sent")}catch(e){this.logger.log("Reset error (expected):",e)}await se(500),await this._releaseReaderWriter(),this.logger.log("Device reset to firmware mode"),this._espStub=void 0,this.esploader.IS_STUB=!1,this.esploader.chipFamily=null}async _resetToBootloaderAndReleaseLocks(){try{this.logger.log("Resetting ESP to bootloader mode..."),await this.esploader.reconnectToBootloader(),this.logger.log(`ESP in bootloader mode: ${_i(this.esploader)}`)}catch(e){throw this.logger.error(`Failed to reset ESP to bootloader: ${e.message}`),e}this._espStub=void 0,this.esploader.IS_STUB=!1}render(){if(!this.esploader)return u``;if("DASHBOARD"===this._state&&!this._improvChecked)return u`
        <ew-dialog open @cancel=${this._preventDefault}>
          <div slot="headline">Connecting</div>
          <div slot="content">${this._renderProgress("Initializing")}</div>
        </ew-dialog>
      `;let e,t,i=!1;if(void 0!==this._client||this._improvChecked||"INSTALL"===this._state||"LOGS"===this._state||"PARTITIONS"===this._state||"LITTLEFS"===this._state||"REQUEST_PORT_SELECTION"===this._state||"DASHBOARD"===this._state)if("INSTALL"===this._state)[e,t,,i]=this._renderInstall();else if("REQUEST_PORT_SELECTION"===this._state)[e,t]=this._renderRequestPortSelection();else if("ASK_ERASE"===this._state)[e,t]=this._renderAskErase();else if("ERROR"===this._state)[e,t]=this._renderError(this._error);else if("DASHBOARD"===this._state)try{[e,t,,i]=this._improvSupported&&this._info?this._renderDashboard():this._renderDashboardNoImprov()}catch(i){this.logger.error(`Error rendering dashboard: ${i.message}`,i),[e,t]=this._renderError(`Dashboard render error: ${i.message}`)}else"PROVISION"===this._state?[e,t]=this._renderProvision():"LOGS"===this._state?[e,t]=this._renderLogs():"PARTITIONS"===this._state?[e,t]=this._renderPartitions():"LITTLEFS"===this._state?[e,t,,i]=this._renderLittleFS():(this.logger.error(`Unknown state: ${this._state}`),[e,t]=this._renderError(`Unknown state: ${this._state}`));else this._error?[e,t]=this._renderError(this._error):t=this._renderProgress("Connecting");return u`
      <ew-dialog
        open
        @cancel=${this._preventDefault}
        @closed=${this._handleClose}
      >
        ${e?u`
              <div slot="headline">${e}</div>
              ${i?u`
                    <ew-icon-button slot="headline" @click=${this._closeDialog}>
                      ${ui}
                    </ew-icon-button>
                  `:""}
            `:""}
        <div slot="content">${t}</div>
      </ew-dialog>
    `}_renderProgress(e,t){return u`
      <ewt-page-progress
        .label=${e}
        .progress=${t}
      ></ewt-page-progress>
    `}_renderError(e){return["Error",u`
      <ewt-page-message .icon=${Ci} .label=${e}></ewt-page-message>
      <ew-text-button slot="actions" @click=${this._closeDialog}
        >Close</ew-text-button
      >
    `,!1]}_renderRequestPortSelection(){return["Select Port",u`
      <ewt-page-message
        .label=${"Device has been reset to firmware mode. The USB port has changed. Please click the button below to select the new port."}
      ></ewt-page-message>
      <ew-text-button
        slot="actions"
        ?disabled=${this._busy}
        @click=${this._handleSelectNewPort}
        >Select Port</ew-text-button
      >
    `,!1]}_renderDashboard(){const e=this._info.name;let t;return t=u`
      <ew-list>
        <ew-list-item>
          <div slot="headline">Connected to ${this._info.name}</div>
          <div slot="supporting-text">
            ${this._info.firmware}&nbsp;${this._info.version}
            (${this._info.chipFamily})
          </div>
        </ew-list-item>
      </ew-list>
      <div class="dashboard-buttons">
        ${this._isSameVersion?"":u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${()=>{this._isSameFirmware?this._startInstall(!1):this._manifest.new_install_prompt_erase?this._state="ASK_ERASE":this._startInstall(!0)}}
                  >${this._isSameFirmware?`Update ${this._manifest.name}`:`Install ${this._manifest.name}`}</ew-text-button
                >
              </div>
            `}
        ${this._client&&void 0!==this._client.nextUrl?u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${async()=>{this._busy=!0;await this._switchToFirmwareMode("visit")||(this._client&&this._client.nextUrl&&window.open(this._client.nextUrl,"_blank"),this._busy=!1)}}
                  >Visit Device</ew-text-button
                >
              </div>
            `:""}
        ${this._client&&this._manifest.home_assistant_domain&&this._client.state===mi.PROVISIONED?u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${async()=>{this._busy=!0;await this._switchToFirmwareMode("homeassistant")||(this._manifest.home_assistant_domain&&window.open(`https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`,"_blank"),this._busy=!1)}}
                  >Add to Home Assistant</ew-text-button
                >
              </div>
            `:""}
        ${this._client?u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${async()=>{this._busy=!0;if(await this._switchToFirmwareMode("wifi"))return;if(this.logger.log("Device is running firmware for Wi-Fi setup"),this._client){try{await this._closeClientWithoutEvents(this._client),this.logger.log("Improv client closed")}catch(e){this.logger.log("Failed to close Improv client:",e)}this._client=void 0,await se(500)}const e=await this._isWebUsbWithExternalSerial();if(this.esploader.isWebUSB&&this.esploader.isWebUSB()&&!e){this.logger.log("WebUSB CDC: Resetting device for Wi-Fi setup...");try{await this._releaseReaderWriter(),await this.esploader.hardReset(!1),this.logger.log("Device reset completed"),await this._releaseReaderWriter(),this.logger.log("Streams recreated after reset"),await se(500)}catch(e){this.logger.log(`Reset error: ${e.message}`)}}else e?this.logger.log("WebUSB external serial: Preparing port for Wi-Fi setup..."):this.logger.log("WebSerial: Preparing port for Wi-Fi setup..."),await this._releaseReaderWriter(),await se(500);this.logger.log("Port ready for new Improv client"),this.logger.log("Flushing serial buffer before Improv init..."),await this._releaseReaderWriter(),await se(100);const t=new xi(this._port,this.logger);t.addEventListener("state-changed",()=>{this.requestUpdate()}),t.addEventListener("error-changed",()=>this.requestUpdate());try{this._info=await t.initialize(1e4),this._client=t,t.addEventListener("disconnect",this._handleDisconnect),this.logger.log("Improv client ready for Wi-Fi provisioning")}catch(e){try{await this._closeClientWithoutEvents(t)}catch(e){this.logger.log("Failed to close Improv client after init error:",e)}try{await this._releaseReaderWriter(),this.logger.log("Streams recreated after Improv failure")}catch(e){this.logger.log(`Failed to recreate streams: ${e.message}`)}return this.logger.log(`Improv initialization failed: ${e.message}`),this._error=`Improv initialization failed: ${e.message}`,this._state="ERROR",void(this._busy=!1)}this._state="PROVISION",this._provisionForce=!0,this._busy=!1}}
                  >${this._client.state===mi.READY?"Connect to Wi-Fi":"Change Wi-Fi"}</ew-text-button
                >
              </div>
            `:""}
        ${this._isUsbJtagOrOtgDevice?u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${async()=>{if(this._busy=!0,this._client)try{await this._closeClientWithoutEvents(this._client)}catch(e){this.logger.log("Failed to close Improv client:",e)}await this._switchToFirmwareMode("console")||(this.logger.log("Opening console for USB-JTAG/OTG device (in firmware mode)"),this._state="LOGS",this._busy=!1)}}
                  >Open Console</ew-text-button
                >
              </div>
            `:""}
        ${this._isUsbJtagOrOtgDevice?"":u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${async()=>{const e=this._client;e&&await this._closeClientWithoutEvents(e),await this._switchToFirmwareMode("console"),this._state="LOGS"}}
                  >Logs &amp; Console</ew-text-button
                >
              </div>
            `}
        <div>
          <ew-text-button
            ?disabled=${this._busy}
            @click=${async()=>{if(this._client)try{await this._closeClientWithoutEvents(this._client)}catch(e){this.logger.log("Failed to close Improv client:",e)}this.logger.log("Preparing device for filesystem operations (switching to bootloader mode)...");try{await this._prepareForFlashOperations(),await this._ensureStub()}catch(e){return this.logger.log(`Failed to prepare for filesystem: ${e.message}`),this._state="ERROR",void(this._error=`Failed to enter bootloader mode: ${e.message}`)}this._state="PARTITIONS",this._readPartitionTable()}}
            >Manage Filesystem</ew-text-button
          >
        </div>
        ${this._isSameFirmware&&this._manifest.funding_url?u`
              <div>
                <a
                  class="button"
                  href=${this._manifest.funding_url}
                  target="_blank"
                >
                  <ew-text-button>Fund Development</ew-text-button>
                </a>
              </div>
            `:""}
        ${this._isSameVersion?u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  class="danger"
                  @click=${()=>this._startInstall(!0)}
                  >Erase User Data</ew-text-button
                >
              </div>
            `:""}
      </div>
    `,[e,t,!0,!0]}_renderDashboardNoImprov(){let e;return e=u`
      <div class="dashboard-buttons">
        <div>
          <ew-text-button
            ?disabled=${this._busy}
            @click=${()=>{this._manifest.new_install_prompt_erase?this._state="ASK_ERASE":this._startInstall(!0)}}
            >Install ${this._manifest.name}</ew-text-button
          >
        </div>

        ${this._isUsbJtagOrOtgDevice?"":u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${async()=>{this._busy=!0;const e=this._client;e&&await this._closeClientWithoutEvents(e);await this._switchToFirmwareMode("console")||(this._state="LOGS",this._busy=!1)}}
                  >Logs &amp; Console</ew-text-button
                >
              </div>
            `}
        ${this._isUsbJtagOrOtgDevice?u`
              <div>
                <ew-text-button
                  ?disabled=${this._busy}
                  @click=${async()=>{if(this._busy=!0,this._client)try{await this._closeClientWithoutEvents(this._client)}catch(e){this.logger.log("Failed to close Improv client:",e)}await this._switchToFirmwareMode("console")||(this.logger.log("Opening console for USB-JTAG/OTG device (in firmware mode)"),this._state="LOGS",this._busy=!1)}}
                  >Open Console</ew-text-button
                >
              </div>
            `:""}

        <div>
          <ew-text-button
            ?disabled=${this._busy}
            @click=${async()=>{if(this._client)try{await this._closeClientWithoutEvents(this._client)}catch(e){this.logger.log("Failed to close Improv client:",e)}this.logger.log("Preparing device for filesystem operations (switching to bootloader mode)...");try{await this._prepareForFlashOperations(),await this._ensureStub()}catch(e){return this.logger.log(`Failed to prepare for filesystem: ${e.message}`),this._state="ERROR",void(this._error=`Failed to enter bootloader mode: ${e.message}`)}this._state="PARTITIONS",this._readPartitionTable()}}
            >Manage Filesystem</ew-text-button
          >
        </div>
      </div>
    `,["Device Dashboard",e,!0,!0]}_renderProvision(){let e,t="Configure Wi-Fi",i=!1;if(this._busy)return[t,this._renderProgress(void 0===this._ssids?"Scanning for networks":"Trying to connect"),!0];if(this._provisionForce||this._client.state!==mi.PROVISIONED){let t;switch(this._client.error){case 3:t="Unable to connect";break;case 0:case 2:break;default:t=`Unknown error (${this._client.error})`}e=u`
        <div>
          Enter the credentials of the Wi-Fi network that you want your device
          to connect to.
        </div>
        ${t?u`<p class="error">${t}</p>`:""}
        ${null!==this._ssids?u`
              <ew-filled-select
                menu-positioning="fixed"
                label="Network"
                @change=${e=>{const t=e.target.value;this._selectedSsid="-1"===t?null:this._ssids[parseInt(t)].name}}
                @closed=${e=>e.stopPropagation()}
              >
                ${this._ssids.map((e,t)=>u`
                    <ew-select-option
                      .selected=${this._selectedSsid===e.name}
                      .value=${String(t)}
                    >
                      ${e.name}
                    </ew-select-option>
                  `)}
                <ew-divider></ew-divider>
                <ew-select-option
                  .selected=${null===this._selectedSsid}
                  value="-1"
                >
                  Join other…
                </ew-select-option>
              </ew-filled-select>
            `:""}
        ${null===this._selectedSsid?u`
                <ew-filled-text-field
                  label="Network Name"
                  name="ssid"
                ></ew-filled-text-field>
              `:""}
        <ew-filled-text-field
          label="Password"
          name="password"
          type="password"
        ></ew-filled-text-field>
        <ew-text-button slot="actions" @click=${this._doProvision}
          >Connect</ew-text-button
        >
        <ew-text-button
          slot="actions"
          @click=${async()=>{if(this._client)try{await this._closeClientWithoutEvents(this._client),this.logger.log("Improv client closed")}catch(e){this.logger.log("Failed to close Improv client:",e)}await this._releaseReaderWriter(),this.logger.log("Returning to dashboard (device stays in firmware mode)"),this._state="DASHBOARD"}}
          >${this._installState&&this._installErase?"Skip":"Back"}</ew-text-button
        >
      `}else{t=void 0;const r=!this._wasProvisioned&&(void 0!==this._client.nextUrl||"home_assistant_domain"in this._manifest);i=r,e=u`
        <ewt-page-message
          .icon=${"🎉"}
          label="Device connected to the network!"
        ></ewt-page-message>
        ${r?u`
              <div class="dashboard-buttons">
                ${void 0===this._client.nextUrl?"":u`
                      <div>
                        <a
                          href=${this._client.nextUrl}
                          class="has-button"
                          target="_blank"
                          @click=${async e=>{e.preventDefault();const t=this._client.nextUrl,i=window.open("about:blank","_blank");await this._switchToFirmwareMode("visit")?null==i||i.close():(this.logger.log("Following Link (in firmware mode)"),i?i.location.href=t:window.open(t,"_blank"),this._state="DASHBOARD")}}
                        >
                          <ew-text-button>Visit Device</ew-text-button>
                        </a>
                      </div>
                    `}
                ${this._manifest.home_assistant_domain?u`
                      <div>
                        <a
                          href=${`https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`}
                          class="has-button"
                          target="_blank"
                          @click=${async e=>{e.preventDefault();const t=`https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`,i=window.open("about:blank","_blank");await this._switchToFirmwareMode("homeassistant")?null==i||i.close():(this.logger.log("Following Link (in firmware mode)"),i?i.location.href=t:window.open(t,"_blank"),this._state="DASHBOARD")}}
                        >
                          <ew-text-button>Add to Home Assistant</ew-text-button>
                        </a>
                      </div>
                    `:""}
                <div>
                  <ew-text-button
                    @click=${async()=>{if(this._client)try{await this._closeClientWithoutEvents(this._client),this.logger.log("Improv client closed after provisioning")}catch(e){this.logger.log("Failed to close Improv client:",e)}await this._releaseReaderWriter(),this.logger.log("Returning to dashboard (device stays in firmware mode)"),this._state="DASHBOARD"}}
                    >Skip</ew-text-button
                  >
                </div>
              </div>
            `:u`
              <ew-text-button
                slot="actions"
                @click=${async()=>{if(this._client)try{await this._closeClientWithoutEvents(this._client),this.logger.log("Improv client closed after provisioning")}catch(e){this.logger.log("Failed to close Improv client:",e)}await this._releaseReaderWriter(),this.logger.log("Returning to dashboard (device stays in firmware mode)"),this._state="DASHBOARD"}}
                >Continue</ew-text-button
              >
            `}
      `}return[t,e,i]}_renderAskErase(){return["Erase device",u`
      <div>
        Do you want to erase the device before installing
        ${this._manifest.name}? All data on the device will be lost.
      </div>
      <label class="formfield danger">
        <ew-checkbox touch-target="wrapper"></ew-checkbox>
        Erase device
      </label>
      <ew-text-button
        slot="actions"
        @click=${()=>{const e=this.shadowRoot.querySelector("ew-checkbox");this._startInstall(e.checked)}}
        >Next</ew-text-button
      >
      <ew-text-button
        slot="actions"
        @click=${()=>{this._state="DASHBOARD"}}
        >Back</ew-text-button
      >
    `]}_renderInstall(){let e,t,i=!1;const r=!this._installErase&&this._isSameFirmware;if(!this._installConfirmed&&this._isSameVersion)e="Erase User Data",t=u`
        Do you want to reset your device and erase all user data from your
        device?
        <ew-text-button
          class="danger"
          slot="actions"
          @click=${this._confirmInstall}
          >Erase User Data</ew-text-button
        >
      `;else if(this._installConfirmed)if(this._installState&&"initializing"!==this._installState.state&&"manifest"!==this._installState.state&&"preparing"!==this._installState.state)if("erasing"===this._installState.state)e="Installing",t=this._renderProgress("Erasing"),i=!0;else if("writing"===this._installState.state||"finished"===this._installState.state&&void 0===this._client&&!this._isUsbJtagOrOtgDevice){let r,o;e="Installing","finished"===this._installState.state?o="Wrapping up":this._installState.details.percentage<4?o="Installing":r=this._installState.details.percentage,t=this._renderProgress(u`
          ${o?u`${o}<br />`:""}
          <br />
          This will take a minute.<br />
          Keep this page visible until installation is complete.
        `,r),i=!0}else if("finished"!==this._installState.state||this._isUsbJtagOrOtgDevice)"error"===this._installState.state&&(e="Installation failed",t=u`
        <ewt-page-message
          .icon=${Ci}
          .label=${this._installState.message}
        ></ewt-page-message>
        <ew-text-button
          slot="actions"
          @click=${async()=>{this._improvChecked=!1,await this._initialize(),this._state="DASHBOARD"}}
          >Back</ew-text-button
        >
      `);else{e=void 0;const i=null!==this._client;t=u`
        <ewt-page-message
          .icon=${"🎉"}
          label="Installation complete!"
        ></ewt-page-message>
        <ew-text-button
          slot="actions"
          @click=${()=>{this._state=i&&this._installErase?"PROVISION":"DASHBOARD"}}
          >Next</ew-text-button
        >
      `}else e="Installing",t=this._renderProgress("Preparing installation"),i=!0;else{e="Confirm Installation";const i=r?"update to":"install";t=u`
        ${r?u`Your device is running
              ${this._info.firmware}&nbsp;${this._info.version}.<br /><br />`:""}
        Do you want to ${i}
        ${this._manifest.name}&nbsp;${this._manifest.version}?
        ${this._installErase?u`<br /><br />All data on the device will be erased.`:""}
        <ew-text-button slot="actions" @click=${this._confirmInstall}
          >Install</ew-text-button
        >
        <ew-text-button
          slot="actions"
          @click=${()=>{this._state="DASHBOARD"}}
          >Back</ew-text-button
        >
      `}return[e,t,i,!1]}_renderLogs(){let e;return e=u`
      <ew-console
        .port=${this._port}
        .logger=${this.logger}
        .onReset=${async()=>await this.esploader.hardReset(!1)}
      ></ew-console>
      <ew-text-button
        slot="actions"
        @click=${async()=>{await this.shadowRoot.querySelector("ew-console").disconnect(),await this._releaseReaderWriter(),this.logger.log("Returning to dashboard (device stays in firmware mode)"),this._state="DASHBOARD",await this._initialize()}}
        >Back</ew-text-button
      >
      <ew-text-button
        slot="actions"
        @click=${()=>{ki(this.shadowRoot.querySelector("ew-console").logs(),"esp-web-tools-logs.txt"),this.shadowRoot.querySelector("ew-console").reset()}}
        >Download Logs</ew-text-button
      >
      <ew-text-button
        slot="actions"
        @click=${async()=>{await this.shadowRoot.querySelector("ew-console").reset()}}
        >Reset Device</ew-text-button
      >
    `,["Logs",e,!1]}_renderPartitions(){let e;return e=this._busy?this._renderProgress("Reading partition table..."):this._partitions&&0!==this._partitions.length?u`
        <div class="partition-list">
          <table class="partition-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>SubType</th>
                <th>Offset</th>
                <th>Size</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${this._partitions.map(e=>u`
                  <tr>
                    <td>${e.name}</td>
                    <td>${e.typeName}</td>
                    <td>${e.subtypeName}</td>
                    <td>0x${e.offset.toString(16)}</td>
                    <td>${this._formatSize(e.size)}</td>
                    <td>
                      ${1===e.type&&130===e.subtype?u`
                            <ew-text-button
                              @click=${()=>this._openFilesystem(e)}
                              >Open FS</ew-text-button
                            >
                          `:""}
                    </td>
                  </tr>
                `)}
            </tbody>
          </table>
        </div>
        <ew-text-button
          slot="actions"
          @click=${async()=>{try{this._isUsbJtagOrOtgDevice?(this._state="DASHBOARD",await this._initialize()):(this._state="DASHBOARD",this._busy=!1)}catch(e){this.logger.error(`Partitions Back error: ${e.message}`),this._state="ERROR",this._error=`Failed to return to dashboard: ${e.message}`,this._busy=!1}}}
          >Back</ew-text-button
        >
      `:u`
        <ewt-page-message
          .icon=${Ci}
          label="No partitions found"
        ></ewt-page-message>
        <ew-text-button
          slot="actions"
          @click=${async()=>{await this._releaseReaderWriter(),this._state="DASHBOARD"}}
          >Back</ew-text-button
        >
      `,["Partition Table",e,!1]}_renderLittleFS(){return[void 0,u`
      <ewt-littlefs-manager
        .partition=${this._selectedPartition}
        .espStub=${this._espStub}
        .logger=${this.logger}
        .onClose=${()=>{this._state="PARTITIONS"}}
      ></ewt-littlefs-manager>
    `,!0,!0]}async _readPartitionTable(){this._busy=!0,this._partitions=void 0;try{this.logger.log("Reading partition table from 0x8000...");const e=await this._ensureStub();await se(100),this.logger.log("Reading flash data...");const t=function(e){const t=[];for(let i=0;i<e.length;i+=32){const r=Ei(e.slice(i,i+32));if(null===r)break;t.push(r)}return t}(await e.readFlash(32768,4096));0===t.length?(this.logger.log("No valid partition table found"),this._partitions=[]):(this.logger.log(`Found ${t.length} partition(s)`),this._partitions=t)}catch(e){this.logger.error(`Failed to read partition table: ${e.message||e}`),"Port selection cancelled"===e.message?(await this._releaseReaderWriter(),this._error="Port selection cancelled",this._state="ERROR"):e.message&&e.message.includes("Failed to connect")?(await this._releaseReaderWriter(),this._error=e.message,this._state="ERROR"):(this.logger.log("Returning to partition view with no partitions"),this._partitions=[])}finally{this._busy=!1}}async _openFilesystem(e){try{if(this._busy=!0,this.logger.log(`Detecting filesystem type for partition "${e.name}"...`),!this._espStub)throw new Error("ESP stub not available. Please reconnect.");const t=await async function(e,t,i,r=console){try{const o=Math.min(8192,i),s=await e.readFlash(t,o);if(s.length<32)return r.log("Partition too small, assuming SPIFFS"),"spiffs";if(new TextDecoder("ascii",{fatal:!1}).decode(s).includes("littlefs"))return r.log('✓ LittleFS detected: Found "littlefs" signature'),"littlefs";const a=new DataView(s.buffer,s.byteOffset,s.byteLength),l=[4096,2048,1024,512];for(const e of l)if(s.length>=2*e)try{for(let t=0;t<Math.min(e,s.length-4);t+=4){const e=a.getUint32(t,!0),i=1023&e;if((e>>20&4095)<=2047&&i>0&&i<=1022&&t+i+4<=s.length)return r.log("✓ LittleFS detected: Found valid metadata structure"),"littlefs"}}catch(e){}for(let e=0;e<Math.min(4096,s.length-4);e+=4){const t=a.getUint32(e,!0);if(538182953===t||538314025===t)return r.log("✓ SPIFFS detected: Found SPIFFS magic number"),"spiffs"}return r.log("⚠ No clear filesystem signature found, assuming SPIFFS"),"spiffs"}catch(e){return r.error(`Failed to detect filesystem type: ${e.message||e}`),"spiffs"}}(this._espStub,e.offset,e.size,this.logger);this.logger.log(`Detected filesystem: ${t}`),"littlefs"===t?(this._selectedPartition=e,this._state="LITTLEFS"):"spiffs"===t?(this.logger.error("SPIFFS support not yet implemented. Use LittleFS partitions."),this._error="SPIFFS support not yet implemented",this._state="ERROR"):(this.logger.error("Unknown filesystem type. Cannot open partition."),this._error="Unknown filesystem type",this._state="ERROR")}catch(e){this.logger.error(`Failed to open filesystem: ${e.message||e}`),this._error=`Failed to open filesystem: ${e.message||e}`,this._state="ERROR"}finally{this._busy=!1}}_formatSize(e){return e<1024?`${e} B`:e<1048576?`${(e/1024).toFixed(2)} KB`:`${(e/1048576).toFixed(2)} MB`}willUpdate(e){e.has("_state")&&("ERROR"!==this._state&&(this._error=void 0),"PROVISION"===this._state?this._updateSsids():this._provisionForce=!1,"INSTALL"===this._state&&(this._installConfirmed=!1,this._installState=void 0))}async _updateSsids(e=0){let t;this._ssids=void 0,this._busy=!0;try{t=await this._client.scan()}catch(e){return void 0===this._ssids&&(this._ssids=null,this._selectedSsid=null),void(this._busy=!1)}if(0===t.length&&e<3)return this.logger.log(`SSID scan returned empty, scheduling retry ${e+1}/3`),void setTimeout(()=>{"PROVISION"===this._state&&this._updateSsids(e+1)},2e3);this._ssids=t,this._selectedSsid=t.length?t[0].name:null,this._busy=!1}firstUpdated(e){super.firstUpdated(e),this._bodyOverflow=document.body.style.overflow,document.body.style.overflow="hidden";const t=this.logger;this.logger={log:(e,...i)=>{t.log(e,...i)},error:(e,...i)=>{t.error(e,...i)},debug:(e,...i)=>{t.debug&&t.debug(e,...i)}},this.esploader.logger=this.logger,this._initialize()}updated(e){super.updated(e),e.has("_state")&&this.setAttribute("state",this._state),"PROVISION"===this._state&&(e.has("_selectedSsid")&&null===this._selectedSsid?this._focusFormElement("ew-filled-text-field[name=ssid]"):e.has("_ssids")&&this._focusFormElement())}_focusFormElement(e="ew-filled-text-field, ew-filled-select"){const t=this.shadowRoot.querySelector(e);t&&t.updateComplete.then(()=>setTimeout(()=>t.focus(),100))}async _initialize(e=!1,t=!1){if(null===this._port.readable||null===this._port.writable)return this._state="ERROR",void(this._error="Serial port is not readable/writable. Close any other application using it and try again.");this._busy=!0,this.requestUpdate();try{this._manifest=JSON.parse(this.manifestPath)}catch{try{this._manifest=await(async e=>{const t=new URL(e,location.toString()).toString(),i=await N(t);if(!i.ok)throw new Error(`Failed to fetch manifest: ${i.status}`);const r=await i.json();return"new_install_skip_erase"in r&&(console.warn('Manifest option "new_install_skip_erase" is deprecated. Use "new_install_prompt_erase" instead.'),r.new_install_skip_erase&&(r.new_install_prompt_erase=!0)),r})(this.manifestPath)}catch(e){return this._state="ERROR",this._error="Failed to download manifest",void(this._busy=!1)}}if(t)return this.logger.log("Skipping Improv test (not needed for this operation)"),this._client=null,this._improvChecked=!0,void(this._busy=!1);if(0===this._manifest.new_install_improv_wait_time)return this._client=null,this._improvSupported=!1,this._improvChecked=!0,void(this._busy=!1);if(this._improvChecked)return this.logger.log(`Improv already checked - ${this._improvSupported?"supported":"not supported"}, skipping re-test`),this._improvSupported||(this._client=null),this._busy=!1,void this.requestUpdate();if(this._client)return this.logger.log("Improv client already active, skipping initialization"),this._improvSupported=!0,this._improvChecked=!0,void(this._busy=!1);const i=await this._isUsbJtagOrOtg();this._isUsbJtagOrOtgDevice=i;if(null!==this.esploader.chipFamily){if(this.logger.log("Device is in BOOTLOADER mode - switching to FIRMWARE mode for Improv test"),i){this.logger.log("USB-JTAG/OTG device - need to switch to firmware mode");try{this.esploader.chipFamily||(this.logger.log("Detecting chip type..."),await this.esploader.initialize(),this.logger.log(`Chip detected: ${this.esploader.chipFamily}`)),this._espStub||(this.logger.log("Creating stub for firmware mode switch..."),this._espStub=await this.esploader.runStub(),this.logger.log(`Stub created: IS_STUB=${this._espStub.IS_STUB}`));const e=this._espStub._parent||this._espStub;this._savedLoaderBeforeConsole=e,await this._releaseReaderWriter();try{await this._port.forget(),this.logger.log("Old port forgotten")}catch(e){this.logger.log(`Port forget failed: ${e.message}`)}await this.esploader.resetToFirmware(),this.logger.log("Device reset to firmware mode - port closed")}catch(e){this.logger.debug(`Reset to firmware error (expected): ${e.message}`)}return await se(100),this._espStub=void 0,this.esploader.IS_STUB=!1,this.esploader.chipFamily=null,this._improvChecked=!1,this._client=void 0,this._improvSupported=!1,this.esploader._reader=void 0,this.logger.log("Waiting for user to select new port"),this._state="REQUEST_PORT_SELECTION",this._error="",void(this._busy=!1)}this.logger.log("External serial chip - resetting to firmware mode");try{await this._resetDeviceAndReleaseLocks(),await se(500)}catch(e){this.logger.log(`Reset to firmware failed: ${e.message}`)}}else this.logger.log("Device is already in FIRMWARE mode - ready for Improv test");try{await this._releaseReaderWriter(),await se(200),this.logger.log("Streams ready for Improv test")}catch(e){this.logger.log(`Failed to prepare streams: ${e.message}`)}this.logger.log("Testing Improv (device is in firmware mode)");const r=e&&void 0!==this._manifest.new_install_improv_wait_time?1e3*this._manifest.new_install_improv_wait_time:1e4;await this._testImprov(r,!0)}async _switchToFirmwareMode(e=null){if(!(null!==this.esploader.chipFamily)){if(this.logger.log("Device already in firmware mode"),"console"===e&&!this._consoleInitialized){this.logger.log("First console open - resetting device..."),this._consoleInitialized=!0;try{await this.esploader.hardReset(!1),this.logger.log("Device reset completed")}catch(e){this.logger.log(`Reset error (expected): ${e.message}`)}}return await this._releaseReaderWriter(),!1}this.logger.log(`Device is in bootloader mode - switching to firmware for ${e||"operation"}`),this.esploader.chipFamily||(this.logger.log("Detecting chip type..."),await this.esploader.initialize(),this.logger.log(`Chip detected: ${this.esploader.chipFamily}`)),this._espStub||(this.logger.log("Creating stub for firmware mode switch..."),this._espStub=await this.esploader.runStub(),this.logger.log(`Stub created: IS_STUB=${this._espStub.IS_STUB}`)),await this._resetBaudrateForConsole();const t=this._espStub._parent||this._espStub;this._savedLoaderBeforeSwitch=t;if(await this._isUsbJtagOrOtg()){this.logger.log("Releasing reader/writer..."),await this._releaseReaderWriter();try{try{await this._port.forget(),this.logger.log("Old port forgotten")}catch(e){this.logger.log(`Port forget failed: ${e.message}`)}await this.esploader.resetToFirmware(),this.logger.log("Device reset to firmware mode - port closed")}catch(e){this.logger.debug(`Reset to firmware error (expected): ${e.message}`)}return await se(100),this._espStub=void 0,this.esploader.IS_STUB=!1,this.esploader.chipFamily=null,this._improvChecked=!1,this._client=null,this._improvSupported=!1,this.esploader._reader=void 0,"console"===e?this._openConsoleAfterReconnect=!0:"visit"===e?this._visitDeviceAfterReconnect=!0:"homeassistant"===e?this._addToHAAfterReconnect=!0:"wifi"===e&&(this._changeWiFiAfterReconnect=!0),this.logger.log("Waiting for user to select new port"),this._state="REQUEST_PORT_SELECTION",this._error="",this._busy=!1,!0}this.logger.log("External serial chip - resetting to firmware mode");try{await this.esploader.hardReset(!1),this.logger.log("Device reset to firmware mode")}catch(e){this.logger.log(`Reset worked. Expected slip Timeout read error: ${e.message}`)}await se(500),this.logger.log("Releasing reader/writer after reset..."),await this._releaseReaderWriter(),this._espStub=void 0,this.esploader.IS_STUB=!1,this.esploader.chipFamily=null;try{await this.esploader.hardReset(!1),this.logger.log("Device in firmware mode, start firmware with reset")}catch(e){this.logger.log(`Reset error: ${e.message}`)}return!1}_startInstall(e){this._state="INSTALL",this._installErase=e,this._installConfirmed=!1}async _confirmInstall(){this._installConfirmed=!0,this._installState=void 0,this._client&&await this._closeClientWithoutEvents(this._client),this._client=void 0,this.logger.log("Preparing device for flash operations (switching to bootloader mode)...");try{await this._prepareForFlashOperations()}catch(e){return this.logger.log(`Failed to prepare for flash: ${e.message}`),this._state="ERROR",void(this._error=`Failed to enter bootloader mode: ${e.message}`)}try{await this._ensureStub()}catch(e){return this._state="ERROR",void(this._error=e.message)}const e=this._espStub;null!=this.firmwareFile?new Blob([this.firmwareFile]).arrayBuffer().then(e=>this._flashFilebuffer(new Uint8Array(e))):wi(async e=>{if(this._installState=e,"finished"===e.state){await this._isUsbJtagOrOtg()?(this._isUsbJtagOrOtgDevice=!0,await this._handleFlashComplete().catch(e=>{this.logger.error(`Post-flash cleanup failed: ${(null==e?void 0:e.message)||e}`),this._state="ERROR",this._error=`Post-flash cleanup failed: ${(null==e?void 0:e.message)||e}`})):this._handleFlashComplete().catch(e=>{this.logger.error(`Post-flash cleanup failed: ${(null==e?void 0:e.message)||e}`),this._state="ERROR",this._error=`Post-flash cleanup failed: ${(null==e?void 0:e.message)||e}`})}},e,this.logger,this.manifestPath,this._installErase,new Uint8Array(0),this.baudRate).catch(e=>{this.logger.error(`Flash error: ${e.message||e}`),this._state="ERROR",this._error=`Flash failed: ${e.message||e}`,this._busy=!1})}async _flashFilebuffer(e){const t=this._espStub;wi(e=>{this._installState=e,"finished"===e.state&&this._handleFlashComplete().catch(e=>{this.logger.error(`Post-flash cleanup failed: ${(null==e?void 0:e.message)||e}`),this._state="ERROR",this._error=`Post-flash cleanup failed: ${(null==e?void 0:e.message)||e}`})},t,this.logger,this.manifestPath,this._installErase,e,this.baudRate).catch(e=>{this.logger.error(`Flash error: ${e.message||e}`),this._state="ERROR",this._error=`Flash failed: ${e.message||e}`,this._busy=!1})}async _doProvision(){this._busy=!0,this._wasProvisioned=this._client.state===mi.PROVISIONED;const e=null===this._selectedSsid?this.shadowRoot.querySelector("ew-filled-text-field[name=ssid]").value:this._selectedSsid,t=this.shadowRoot.querySelector("ew-filled-text-field[name=password]").value;try{await this._client.provision(e,t)}catch(e){return}finally{this._busy=!1,this._provisionForce=!1}}async _handleSelectNewPort(){if(this._busy)return void this.logger.log("Already processing port selection, ignoring duplicate click");let e;this._busy=!0,this.logger.log("User clicked 'Select Port' button - requesting new port..."),this.logger.log("Dialog in DOM at start: "+(this.parentNode?"yes":"no")),this._state="DASHBOARD",this._improvChecked=!1,this.requestUpdate(),this.parentNode||(document.body.appendChild(this),this.logger.log("Dialog re-added to DOM before port selection"));try{globalThis.requestSerialPort?(this.logger.log("Using WebUSB port selection (Android)"),e=await globalThis.requestSerialPort(e=>this.logger.log("[WebUSB]",e))):(this.logger.log("Using Web Serial port selection (Desktop)"),e=await navigator.serial.requestPort()),await new Promise(e=>setTimeout(e,50)),this.logger.log("Port selected by user"),this.parentNode||(document.body.appendChild(this),this.logger.log("Dialog re-added to DOM after port selection"))}catch(e){return this.logger.error("Port selection error:",e),"NotFoundError"===e.name?(this.logger.log("Port selection cancelled by user"),this._busy=!1,this._state="ERROR",void(this._error="Port selection cancelled")):(this._busy=!1,this._state="ERROR",void(this._error=`Port selection failed: ${e.message}`))}if(!e)return this.logger.error("newPort is null/undefined"),this._busy=!1,this._state="ERROR",void(this._error="Failed to select port");if(this.logger.log("Opening port at 115200 baud for firmware mode..."),this.logger.log("Dialog in DOM before opening port: "+(this.parentNode?"yes":"no")),null!==e.readable||null!==e.writable){this.logger.log("WARNING: Port appears to be open, closing it first...");try{await e.close(),await se(200),this.logger.log("Port closed successfully")}catch(e){this.logger.log(`Port close failed: ${e.message}`)}}try{await e.open({baudRate:115200}),this.logger.log("Port opened successfully at 115200 baud"),this.logger.log("Dialog in DOM after opening port: "+(this.parentNode?"yes":"no"))}catch(e){return this.logger.error("Port open error:",e),this._busy=!1,this._state="ERROR",void(this._error=`Failed to open port: ${e.message}`)}this.logger.log("Updating existing ESPLoader with new port for firmware mode..."),this.logger.log("Updating base loader port"),this.esploader.port=e,this.esploader.connected=!0,this._espStub&&(this.logger.log("Updating STUB port"),this._espStub.port=e,this._espStub.connected=!0,this._espStub._parent&&(this.logger.log("Updating parent loader port"),this._espStub._parent.port=e)),this._savedLoaderBeforeConsole&&(this.logger.log("Updating saved loader port"),this._savedLoaderBeforeConsole.port=e),this.logger.log("ESPLoader port updated for firmware mode (no bootloader sync)"),this.logger.log("Waiting 700ms for device to fully boot and port to be ready..."),await se(700),this.logger.log(`Port state check: readable=${null!==this._port.readable}, writable=${null!==this._port.writable}`),this.logger.log(`Checking for locks: reader=${this.esploader._reader?"LOCKED":"free"}, writer=${this.esploader._writer?"LOCKED":"free"}`),(this.esploader._reader||this.esploader._writer)&&(this.logger.log("WARNING: Port has active locks! Releasing them before Improv test..."),await this._releaseReaderWriter(),this.logger.log("Locks released")),this.logger.log("Device should be ready now"),this.logger.log("Testing Improv at 115200 baud..."),this._state="DASHBOARD",this.requestUpdate(),await this._testImprov(1e3,!1)}async _testImprov(e=1e3,t=!1){var i,r;let o;this._improvChecked=!0;try{this.logger.log(`Port for Improv: readable=${null!==this._port.readable}, writable=${null!==this._port.writable}`);const s=this._port.getInfo();if(this.logger.log(`Port info: VID=0x${null===(i=s.usbVendorId)||void 0===i?void 0:i.toString(16).padStart(4,"0")}, PID=0x${null===(r=s.usbProductId)||void 0===r?void 0:r.toString(16).padStart(4,"0")}`),!t){this.logger.log("Resetting device for Improv detection...");try{await this._releaseReaderWriter(),await this.esploader.hardReset(!1),this.logger.log("Device reset sent, device is rebooting..."),await this._releaseReaderWriter(),this.logger.log("Streams recreated after reset"),this.logger.log("Waiting for firmware running to be ready for Improv test..."),await se(500)}catch(e){this.logger.log(`Failed to reset device: ${e.message}`)}}this.logger.log("Flushing serial buffer before Improv init..."),await this._releaseReaderWriter(),await se(100),o=new xi(this._port,this.logger),o.addEventListener("state-changed",()=>{this.requestUpdate()}),o.addEventListener("error-changed",()=>this.requestUpdate()),this.logger.log("Calling improvSerial.initialize()...");const a=await o.initialize(e);this.logger.log("Waiting for firmware to get valid IP address (checking every 500ms, max 10 seconds)...");const l=Date.now(),n=1e4;let d=!1;for(;Date.now()-l<n;){try{await o.requestCurrentState();const e=o.nextUrl;if(e&&!e.includes("0.0.0.0")){this.logger.log(`Valid IP found: ${e}`),d=!0;break}}catch(e){this.logger.log(`Failed to request current state: ${e.message}`)}await se(500)}d||this.logger.log(`Timeout after ${n/1e3} seconds - continuing with current URL: ${o.nextUrl||"undefined"}`),this._client=o,this._info=a,this._improvSupported=!0,o.addEventListener("disconnect",this._handleDisconnect),this.logger.log("Improv Wi-Fi Serial detected"),this.logger.log(`Improv state: ${o.state}, nextUrl: ${o.nextUrl||"undefined"}`)}catch(e){if(this.logger.log(`Improv Wi-Fi Serial not detected: ${e.message}`),this._client=null,this._info=void 0,this._improvSupported=!1,this.logger.log(`State after Improv failure: _client=${this._client}, _info=${this._info}, _improvSupported=${this._improvSupported}, _improvChecked=${this._improvChecked}`),o)try{this.logger.log("Closing failed Improv client..."),await o.close(),this.logger.log("Failed Improv client closed"),await se(200)}catch(e){this.logger.log(`Failed to close Improv client: ${e.message}`)}try{await this._releaseReaderWriter(),this.logger.log("Streams recreated after Improv failure")}catch(e){this.logger.log(`Failed to recreate streams: ${e.message}`)}}if(this._busy=!1,this._openConsoleAfterReconnect){if(this.logger.log("Opening console as requested by user"),this._openConsoleAfterReconnect=!1,this._client){try{await this._closeClientWithoutEvents(this._client),this.logger.log("Improv client closed before opening console")}catch(e){this.logger.log("Failed to close Improv client:",e)}this._client=void 0,await se(200)}await this._releaseReaderWriter(),this._state="LOGS"}else if(this._visitDeviceAfterReconnect)this.logger.log("Opening Visit Device URL as requested by user"),this._visitDeviceAfterReconnect=!1,this._client&&this._client.nextUrl&&window.open(this._client.nextUrl,"_blank"),this._state="DASHBOARD";else if(this._addToHAAfterReconnect)this.logger.log("Opening Home Assistant URL as requested by user"),this._addToHAAfterReconnect=!1,this._manifest.home_assistant_domain&&window.open(`https://my.home-assistant.io/redirect/config_flow_start/?domain=${this._manifest.home_assistant_domain}`,"_blank"),this._state="DASHBOARD";else if(this._changeWiFiAfterReconnect){if(this.logger.log("Opening Wi-Fi provisioning as requested by user"),this._changeWiFiAfterReconnect=!1,this._client){try{await this._closeClientWithoutEvents(this._client)}catch(e){this.logger.log("Failed to close Improv client:",e)}this._client=void 0,await se(200)}const e=await this._isWebUsbWithExternalSerial();if(this.esploader.isWebUSB&&this.esploader.isWebUSB()&&!e){this.logger.log("WebUSB CDC: Resetting device for Wi-Fi setup...");try{await this.esploader.hardReset(!1),this.logger.log("Device reset completed")}catch(e){this.logger.log(`Reset error: ${e.message}`)}await this._releaseReaderWriter(),await se(200)}else e?this.logger.log("WebUSB external serial: Preparing port for Wi-Fi setup..."):this.logger.log("WebSerial: Preparing port for Wi-Fi setup..."),await this._releaseReaderWriter(),await se(200);this.logger.log("Port ready for Wi-Fi setup"),this.logger.log("Flushing serial buffer before Improv init..."),await this._releaseReaderWriter(),await se(100),this.logger.log("Re-initializing Improv Serial for Wi-Fi setup");const t=new xi(this._port,this.logger);t.addEventListener("state-changed",()=>{this.requestUpdate()}),t.addEventListener("error-changed",()=>this.requestUpdate());try{this._info=await t.initialize(1e4),this._client=t,t.addEventListener("disconnect",this._handleDisconnect),this.logger.log("Improv client ready for Wi-Fi provisioning"),this._state="PROVISION",this._provisionForce=!0}catch(e){try{await this._closeClientWithoutEvents(t)}catch(e){this.logger.log("Failed to close Improv client after init error:",e)}this.logger.log(`Improv initialization failed: ${e.message}`),this._error=`Improv initialization failed: ${e.message}`,this._state="ERROR"}}else this._state="DASHBOARD";this.parentNode||(document.body.appendChild(this),this.logger.log("Dialog re-added to DOM")),this.requestUpdate(),await new Promise(e=>setTimeout(e,100))}_preventDefault(e){e.preventDefault()}_closeDialog(){this._handleClose()}async _handleClose(){var e;this._client&&await this._closeClientWithoutEvents(this._client),document.body.style.overflow=null!==(e=this._bodyOverflow)&&void 0!==e?e:"",((e,t,i,r)=>{r=r||{};const o=new CustomEvent(t,{bubbles:void 0===r.bubbles||r.bubbles,cancelable:Boolean(r.cancelable),composed:void 0===r.composed||r.composed,detail:i});e.dispatchEvent(o)})(this,"closed"),this.parentNode.removeChild(this)}get _isSameFirmware(){var e;return!!this._info&&((null===(e=this.overrides)||void 0===e?void 0:e.checkSameFirmware)?this.overrides.checkSameFirmware(this._manifest,this._info):this._info.firmware===this._manifest.name)}get _isSameVersion(){return this._isSameFirmware&&this._info.version===this._manifest.version}async _closeClientWithoutEvents(e){e.removeEventListener("disconnect",this._handleDisconnect),await e.close()}}Ii.styles=[I,g`
      :host {
        --md-dialog-container-max-inline-size: 390px;
      }
      ew-icon-button {
        position: absolute;
        right: 4px;
        top: 10px;
      }
      ew-filled-text-field,
      ew-filled-select {
        display: block;
        margin-top: 16px;
      }
      .dashboard-buttons {
        margin: 0 0 -16px -8px;
      }
      .dashboard-buttons div {
        display: block;
        margin: 4px 0;
      }
      a.has-button {
        text-decoration: none;
      }
      .error {
        color: var(--danger-color);
      }
      .danger {
        --mdc-theme-primary: var(--danger-color);
        --mdc-theme-secondary: var(--danger-color);
        --md-sys-color-primary: var(--danger-color);
        --md-sys-color-on-surface: var(--danger-color);
      }
      .formfield {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      button.link {
        background: none;
        color: inherit;
        border: none;
        padding: 0;
        font: inherit;
        text-align: left;
        text-decoration: underline;
        cursor: pointer;
      }
      :host([state="LOGS"]) ew-dialog {
        max-width: 90vw;
        max-height: 90vh;
      }
      ew-console {
        width: calc(80vw - 48px);
        height: calc(90vh - 168px);
      }
      :host([state="PARTITIONS"]) ew-dialog {
        max-width: min(800px, 100% - 48px);
        max-height: 80vh;
      }
      :host([state="LITTLEFS"]) ew-dialog {
        max-width: 95vw;
        max-height: 90vh;
      }
      :host([state="LITTLEFS"]) ewt-littlefs-manager {
        display: block;
        max-width: 100%;
      }
      .partition-list {
        max-height: 60vh;
        overflow-y: auto;
      }
      .partition-table {
        width: 100%;
        border-collapse: collapse;
        margin: 16px 0;
      }
      .partition-table th,
      .partition-table td {
        padding: 8px 12px;
        text-align: left;
        border: 1px solid #ccc;
      }
      .partition-table th {
        font-weight: 600;
        background-color: #f0f0f0;
        position: sticky;
        top: 0;
      }
      .partition-table tbody tr:hover {
        background-color: rgba(3, 169, 244, 0.1);
      }
    `],i([l()],Ii.prototype,"_client",void 0),i([l()],Ii.prototype,"_state",void 0),i([l()],Ii.prototype,"_installErase",void 0),i([l()],Ii.prototype,"_installConfirmed",void 0),i([l()],Ii.prototype,"_installState",void 0),i([l()],Ii.prototype,"_provisionForce",void 0),i([l()],Ii.prototype,"_error",void 0),i([l()],Ii.prototype,"_busy",void 0),i([l()],Ii.prototype,"_ssids",void 0),i([l()],Ii.prototype,"_selectedSsid",void 0),i([l()],Ii.prototype,"_partitions",void 0),i([l()],Ii.prototype,"_selectedPartition",void 0),i([l()],Ii.prototype,"_espStub",void 0),i([l()],Ii.prototype,"_isUsbJtagOrOtgDevice",void 0),customElements.define("ewt-install-dialog",Ii);export{Ii as EwtInstallDialog};
