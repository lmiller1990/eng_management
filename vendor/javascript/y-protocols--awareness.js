// y-protocols/awareness@1.0.6 downloaded from https://ga.jspm.io/npm:y-protocols@1.0.6/awareness.js

import*as t from"lib0/encoding";import*as e from"lib0/decoding";import*as s from"lib0/time";import*as a from"lib0/math";import{Observable as n}from"lib0/observable";import*as i from"lib0/function";import"yjs";const o=3e4;
/**
 * @typedef {Object} MetaClientState
 * @property {number} MetaClientState.clock
 * @property {number} MetaClientState.lastUpdated unix timestamp
 */class Awareness extends n{
/**
   * @param {Y.Doc} doc
   */
constructor(t){super();this.doc=t;
/**
     * @type {number}
     */this.clientID=t.clientID;
/**
     * Maps from client id to client state
     * @type {Map<number, Object<string, any>>}
     */this.states=new Map;
/**
     * @type {Map<number, MetaClientState>}
     */this.meta=new Map;this._checkInterval=/** @type {any} */setInterval((()=>{const t=s.getUnixTime();null!==this.getLocalState()&&o/2<=t-/** @type {{lastUpdated:number}} */this.meta.get(this.clientID).lastUpdated&&this.setLocalState(this.getLocalState())
/**
       * @type {Array<number>}
       */;const e=[];this.meta.forEach(((s,a)=>{a!==this.clientID&&o<=t-s.lastUpdated&&this.states.has(a)&&e.push(a)}));e.length>0&&removeAwarenessStates(this,e,"timeout")}),a.floor(o/10));t.on("destroy",(()=>{this.destroy()}));this.setLocalState({})}destroy(){this.emit("destroy",[this]);this.setLocalState(null);super.destroy();clearInterval(this._checkInterval)}getLocalState(){return this.states.get(this.clientID)||null}
/**
   * @param {Object<string,any>|null} state
   */setLocalState(t){const e=this.clientID;const a=this.meta.get(e);const n=void 0===a?0:a.clock+1;const o=this.states.get(e);null===t?this.states.delete(e):this.states.set(e,t);this.meta.set(e,{clock:n,lastUpdated:s.getUnixTime()});const l=[];const r=[];const c=[];const d=[];if(null===t)d.push(e);else if(null==o)null!=t&&l.push(e);else{r.push(e);i.equalityDeep(o,t)||c.push(e)}(l.length>0||c.length>0||d.length>0)&&this.emit("change",[{added:l,updated:c,removed:d},"local"]);this.emit("update",[{added:l,updated:r,removed:d},"local"])}
/**
   * @param {string} field
   * @param {any} value
   */setLocalStateField(t,e){const s=this.getLocalState();null!==s&&this.setLocalState({...s,[t]:e})}getStates(){return this.states}}
/**
 * Mark (remote) clients as inactive and remove them from the list of active peers.
 * This change will be propagated to remote clients.
 *
 * @param {Awareness} awareness
 * @param {Array<number>} clients
 * @param {any} origin
 */const removeAwarenessStates=(t,e,a)=>{const n=[];for(let a=0;a<e.length;a++){const i=e[a];if(t.states.has(i)){t.states.delete(i);if(i===t.clientID){const e=/** @type {MetaClientState} */t.meta.get(i);t.meta.set(i,{clock:e.clock+1,lastUpdated:s.getUnixTime()})}n.push(i)}}if(n.length>0){t.emit("change",[{added:[],updated:[],removed:n},a]);t.emit("update",[{added:[],updated:[],removed:n},a])}};
/**
 * @param {Awareness} awareness
 * @param {Array<number>} clients
 * @return {Uint8Array}
 */const encodeAwarenessUpdate=(e,s,a=e.states)=>{const n=s.length;const i=t.createEncoder();t.writeVarUint(i,n);for(let o=0;o<n;o++){const n=s[o];const l=a.get(n)||null;const r=/** @type {MetaClientState} */e.meta.get(n).clock;t.writeVarUint(i,n);t.writeVarUint(i,r);t.writeVarString(i,JSON.stringify(l))}return t.toUint8Array(i)};
/**
 * Modify the content of an awareness update before re-encoding it to an awareness update.
 *
 * This might be useful when you have a central server that wants to ensure that clients
 * cant hijack somebody elses identity.
 *
 * @param {Uint8Array} update
 * @param {function(any):any} modify
 * @return {Uint8Array}
 */const modifyAwarenessUpdate=(s,a)=>{const n=e.createDecoder(s);const i=t.createEncoder();const o=e.readVarUint(n);t.writeVarUint(i,o);for(let s=0;s<o;s++){const s=e.readVarUint(n);const o=e.readVarUint(n);const l=JSON.parse(e.readVarString(n));const r=a(l);t.writeVarUint(i,s);t.writeVarUint(i,o);t.writeVarString(i,JSON.stringify(r))}return t.toUint8Array(i)};
/**
 * @param {Awareness} awareness
 * @param {Uint8Array} update
 * @param {any} origin This will be added to the emitted change event
 */const applyAwarenessUpdate=(t,a,n)=>{const o=e.createDecoder(a);const l=s.getUnixTime();const r=[];const c=[];const d=[];const h=[];const u=e.readVarUint(o);for(let s=0;s<u;s++){const s=e.readVarUint(o);let a=e.readVarUint(o);const n=JSON.parse(e.readVarString(o));const u=t.meta.get(s);const g=t.states.get(s);const m=void 0===u?0:u.clock;if(m<a||m===a&&null===n&&t.states.has(s)){null===n?s===t.clientID&&null!=t.getLocalState()?a++:t.states.delete(s):t.states.set(s,n);t.meta.set(s,{clock:a,lastUpdated:l});if(void 0===u&&null!==n)r.push(s);else if(void 0!==u&&null===n)h.push(s);else if(null!==n){i.equalityDeep(n,g)||d.push(s);c.push(s)}}}(r.length>0||d.length>0||h.length>0)&&t.emit("change",[{added:r,updated:d,removed:h},n]);(r.length>0||c.length>0||h.length>0)&&t.emit("update",[{added:r,updated:c,removed:h},n])};export{Awareness,applyAwarenessUpdate,encodeAwarenessUpdate,modifyAwarenessUpdate,o as outdatedTimeout,removeAwarenessStates};

