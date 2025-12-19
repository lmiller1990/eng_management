// @tiptap/y-tiptap@3.0.1 downloaded from https://ga.jspm.io/npm:@tiptap/y-tiptap@3.0.1/dist/y-tiptap.js

import*as t from"yjs";import{Item as e,ContentType as n,Text as o,XmlElement as s,UndoManager as r}from"yjs";import{DecorationSet as i,Decoration as a}from"prosemirror-view";import{PluginKey as c,Plugin as l,AllSelection as p,TextSelection as d,NodeSelection as m}from"prosemirror-state";import"y-protocols/awareness";import{createMutex as u}from"lib0/mutex";import*as h from"prosemirror-model";import{Fragment as f,Node as g}from"prosemirror-model";import*as y from"lib0/math";import*as w from"lib0/object";import*as S from"lib0/set";import{simpleDiff as _}from"lib0/diff";import*as b from"lib0/error";import*as v from"lib0/random";import*as A from"lib0/environment";import*as T from"lib0/dom";import*as x from"lib0/eventloop";import*as O from"lib0/map";import*as k from"lib0/hash/sha256";import*as V from"lib0/buffer";const M=new c("y-sync");const F=new c("y-undo");const C=new c("yjs-cursor");
/**
 * Custom function to transform sha256 hash to N byte
 *
 * @param {Uint8Array} digest
 */const E=t=>{const e=6;for(let n=e;n<t.length;n++)t[n%e]=t[n%e]^t[n];return t.slice(0,e)};
/**
 * @param {any} json
 */const R=t=>V.toBase64(E(k.digest(V.encodeAny(t))))
/**
 * @typedef {Object} BindingMetadata
 * @property {ProsemirrorMapping} BindingMetadata.mapping
 * @property {Map<import('prosemirror-model').MarkType, boolean>} BindingMetadata.isOMark - is overlapping mark
 */;const D=()=>({mapping:new Map,isOMark:new Map})
/**
 * @param {Y.Item} item
 * @param {Y.Snapshot} [snapshot]
 */;const U=(e,n)=>n===void 0?!e.deleted:n.sv.has(e.id.client)&&/** @type {number} */
n.sv.get(e.id.client)>e.id.clock&&!t.isDeleted(n.ds,e.id)
/**
 * Either a node if type is YXmlElement or an Array of text nodes if YXmlText
 * @typedef {Map<Y.AbstractType<any>, PModel.Node | Array<PModel.Node>>} ProsemirrorMapping
 */
/**
 * @typedef {Object} ColorDef
 * @property {string} ColorDef.light
 * @property {string} ColorDef.dark
 */
/**
 * @typedef {Object} YSyncOpts
 * @property {Array<ColorDef>} [YSyncOpts.colors]
 * @property {Map<string,ColorDef>} [YSyncOpts.colorMapping]
 * @property {Y.PermanentUserData|null} [YSyncOpts.permanentUserData]
 * @property {ProsemirrorMapping} [YSyncOpts.mapping]
 * @property {function} [YSyncOpts.onFirstRender] Fired when the content from Yjs is initially rendered to ProseMirror
 */
/**
 * @type {Array<ColorDef>}
 */;const I=[{light:"#ecd44433",dark:"#ecd444"}];
/**
 * @param {Map<string,ColorDef>} colorMapping
 * @param {Array<ColorDef>} colors
 * @param {string} user
 * @return {ColorDef}
 */const N=(t,e,n)=>{if(!t.has(n)){if(t.size<e.length){const n=S.create();t.forEach((t=>n.add(t)));e=e.filter((t=>!n.has(t)))}t.set(n,v.oneOf(e))}/** @type {ColorDef} */
return t.get(n)};
/**
 * This plugin listens to changes in prosemirror view and keeps yXmlState and view in sync.
 *
 * This plugin also keeps references to the type and the shared document so other plugins can access it.
 * @param {Y.XmlFragment} yXmlFragment
 * @param {YSyncOpts} opts
 * @return {any} Returns a prosemirror plugin that binds to this type
 */const X=(t,{colors:e=I,colorMapping:n=new Map,permanentUserData:o=null,onFirstRender:s=()=>{},mapping:r}={})=>{let i=false;const a=new ProsemirrorBinding(t,r);const c=new l({props:{editable:t=>{const e=M.getState(t);return e.snapshot==null&&e.prevSnapshot==null}},key:M,state:{
/**
       * @returns {any}
       */
init:(s,r)=>({type:t,doc:t.doc,binding:a,snapshot:null,prevSnapshot:null,isChangeOrigin:false,isUndoRedoOperation:false,addToHistory:true,colors:e,colorMapping:n,permanentUserData:o}),apply:(t,e)=>{const n=t.getMeta(M);if(n!==void 0){e=Object.assign({},e);for(const t in n)e[t]=n[t]}e.addToHistory=t.getMeta("addToHistory")!==false;e.isChangeOrigin=n!==void 0&&!!n.isChangeOrigin;e.isUndoRedoOperation=n!==void 0&&!!n.isChangeOrigin&&!!n.isUndoRedoOperation;a.prosemirrorView!==null&&(n===void 0||n.snapshot==null&&n.prevSnapshot==null||x.timeout(0,(()=>{if(a.prosemirrorView!=null)if(n.restore==null)a._renderSnapshot(n.snapshot,n.prevSnapshot,e);else{a._renderSnapshot(n.snapshot,n.snapshot,e);delete e.restore;delete e.snapshot;delete e.prevSnapshot;a.mux((()=>{a._prosemirrorChanged(a.prosemirrorView.state.doc)}))}})));return e}},view:t=>{a.initView(t);r==null&&a._forceRerender();s();return{update:()=>{const e=c.getState(t.state);if(e.snapshot==null&&e.prevSnapshot==null&&(i||t.state.doc.content.findDiffStart(t.state.doc.type.createAndFill().content)!==null)){i=true;if(e.addToHistory===false&&!e.isChangeOrigin){const e=F.getState(t.state);
/**
                 * @type {Y.UndoManager}
                 */const n=e&&e.undoManager;n&&n.stopCapturing()}a.mux((()=>{
/** @type {Y.Doc} */e.doc.transact((n=>{n.meta.set("addToHistory",e.addToHistory);a._prosemirrorChanged(t.state.doc)}),M)}))}},destroy:()=>{a.destroy()}}}});return c};
/**
 * @param {import('prosemirror-state').Transaction} tr
 * @param {ReturnType<typeof getRelativeSelection>} relSel
 * @param {ProsemirrorBinding} binding
 */const P=(t,e,n)=>{if(e!==null&&e.anchor!==null&&e.head!==null)if(e.type==="all")t.setSelection(new p(t.doc));else if(e.type==="node"){const o=ht(n.doc,n.type,e.anchor,n.mapping);t.setSelection(j(t,o))}else{const o=ht(n.doc,n.type,e.anchor,n.mapping);const s=ht(n.doc,n.type,e.head,n.mapping);o!==null&&s!==null&&t.setSelection(d.between(t.doc.resolve(o),t.doc.resolve(s)))}};
/**
 * @param {import('prosemirror-state').Transaction} tr
 * @param {number} pos
 * @returns {import('prosemirror-state').Selection}
 *
 * Creates a NodeSelection if the position points to a valid node, otherwise
 * creates a TextSelection near the position.
 */const j=(t,e)=>{const n=t.doc.resolve(e);return n.nodeAfter?m.create(t.doc,e):d.near(n)};
/**
 * @param {ProsemirrorBinding} pmbinding
 * @param {import('prosemirror-state').EditorState} state
 */const z=(t,e)=>({type:/** @type {any} */e.selection.jsonID,anchor:mt(e.selection.anchor,t.type,t.mapping),head:mt(e.selection.head,t.type,t.mapping)});class ProsemirrorBinding{
/**
   * @param {Y.XmlFragment} yXmlFragment The bind source
   * @param {ProsemirrorMapping} mapping
   */
constructor(t,e=new Map){this.type=t;
/**
     * this will be set once the view is created
     * @type {any}
     */this.prosemirrorView=null;this.mux=u();this.mapping=e;
/**
     * Is overlapping mark - i.e. mark does not exclude itself.
     *
     * @type {Map<import('prosemirror-model').MarkType, boolean>}
     */this.isOMark=new Map;this._observeFunction=this._typeChanged.bind(this);
/**
     * @type {Y.Doc}
     */this.doc=t.doc;this.beforeTransactionSelection=null;this.beforeAllTransactions=()=>{this.beforeTransactionSelection===null&&this.prosemirrorView!=null&&(this.beforeTransactionSelection=z(this,this.prosemirrorView.state))};this.afterAllTransactions=()=>{this.beforeTransactionSelection=null};this._domSelectionInView=null}
/**
   * Create a transaction for changing the prosemirror state.
   *
   * @returns
   */get _tr(){return this.prosemirrorView.state.tr.setMeta("addToHistory",false)}_isLocalCursorInView(){if(!this.prosemirrorView.hasFocus())return false;if(A.isBrowser&&this._domSelectionInView===null){x.timeout(0,(()=>{this._domSelectionInView=null}));this._domSelectionInView=this._isDomSelectionInView()}return this._domSelectionInView}_isDomSelectionInView(){const t=this.prosemirrorView._root.getSelection();if(t==null||t.anchorNode==null)return false;const e=this.prosemirrorView._root.createRange();e.setStart(t.anchorNode,t.anchorOffset);e.setEnd(t.focusNode,t.focusOffset);const n=e.getClientRects();n.length===0&&e.startContainer&&e.collapsed&&e.selectNodeContents(e.startContainer);const o=e.getBoundingClientRect();const s=T.doc.documentElement;return o.bottom>=0&&o.right>=0&&o.left<=(window.innerWidth||s.clientWidth||0)&&o.top<=(window.innerHeight||s.clientHeight||0)}
/**
   * @param {Y.Snapshot} snapshot
   * @param {Y.Snapshot} prevSnapshot
   */renderSnapshot(e,n){n||(n=t.createSnapshot(t.createDeleteSet(),new Map));this.prosemirrorView.dispatch(this._tr.setMeta(M,{snapshot:e,prevSnapshot:n}))}unrenderSnapshot(){this.mapping.clear();this.mux((()=>{const t=this.type.toArray().map((t=>L(
/** @type {Y.XmlElement} */t,this.prosemirrorView.state.schema,this))).filter((t=>t!==null));const e=this._tr.replace(0,this.prosemirrorView.state.doc.content.size,new h.Slice(h.Fragment.from(t),0,0));e.setMeta(M,{snapshot:null,prevSnapshot:null});this.prosemirrorView.dispatch(e)}))}_forceRerender(){this.mapping.clear();this.mux((()=>{const t=this.beforeTransactionSelection!==null?null:this.prosemirrorView.state.selection;const e=this.type.toArray().map((t=>L(
/** @type {Y.XmlElement} */t,this.prosemirrorView.state.schema,this))).filter((t=>t!==null));const n=this._tr.replace(0,this.prosemirrorView.state.doc.content.size,new h.Slice(h.Fragment.from(e),0,0));if(t){const e=y.min(y.max(t.anchor,0),n.doc.content.size);const o=y.min(y.max(t.head,0),n.doc.content.size);n.setSelection(d.create(n.doc,e,o))}this.prosemirrorView.dispatch(n.setMeta(M,{isChangeOrigin:true,binding:this}))}))}
/**
   * @param {Y.Snapshot|Uint8Array} snapshot
   * @param {Y.Snapshot|Uint8Array} prevSnapshot
   * @param {Object} pluginState
   */_renderSnapshot(e,n,o){
/**
     * The document that contains the full history of this document.
     * @type {Y.Doc}
     */
let s=this.doc;let r=this.type;e||(e=t.snapshot(this.doc));if(e instanceof Uint8Array||n instanceof Uint8Array){e instanceof Uint8Array&&n instanceof Uint8Array||b.unexpectedCase();s=new t.Doc({gc:false});t.applyUpdateV2(s,n);n=t.snapshot(s);t.applyUpdateV2(s,e);e=t.snapshot(s);if(r._item===null){const t=Array.from(this.doc.share.keys()).find((t=>this.doc.share.get(t)===this.type));r=s.getXmlFragment(t)}else{const e=s.store.clients.get(r._item.id.client)??[];const n=t.findIndexSS(e,r._item.id.clock);const o=/** @type {Y.Item} */e[n];const i=/** @type {Y.ContentType} */o.content;r=/** @type {Y.XmlFragment} */i.type}}this.mapping.clear();this.mux((()=>{s.transact((s=>{
/**
         * @type {Y.PermanentUserData}
         */
const i=o.permanentUserData;i&&i.dss.forEach((e=>{t.iterateDeletedStructs(s,e,(t=>{}))}))
/**
         * @param {'removed'|'added'} type
         * @param {Y.ID} id
         */;const a=(t,e)=>{const n=t==="added"?i.getUserByClientId(e.client):i.getUserByDeletedId(e);return{user:n,type:t,color:N(o.colorMapping,o.colors,n)}};const c=t.typeListToArraySnapshot(r,new t.Snapshot(n.ds,e.sv)).map((t=>!t._item.deleted||U(t._item,e)||U(t._item,n)?L(t,this.prosemirrorView.state.schema,{mapping:new Map,isOMark:new Map},e,n,a):null)).filter((t=>t!==null));const l=this._tr.replace(0,this.prosemirrorView.state.doc.content.size,new h.Slice(h.Fragment.from(c),0,0));this.prosemirrorView.dispatch(l.setMeta(M,{isChangeOrigin:true}))}),M)}))}
/**
   * @param {Array<Y.YEvent<any>>} events
   * @param {Y.Transaction} transaction
   */_typeChanged(e,n){if(this.prosemirrorView==null)return;const o=M.getState(this.prosemirrorView.state);e.length!==0&&o.snapshot==null&&o.prevSnapshot==null?this.mux((()=>{
/**
       * @param {any} _
       * @param {Y.AbstractType<any>} type
       */
const e=(t,e)=>this.mapping.delete(e);t.iterateDeletedStructs(n,n.deleteSet,(e=>{if(e.constructor===t.Item){const t=/** @type {Y.ContentType} */ /** @type {Y.Item} */e.content.type;t&&this.mapping.delete(t)}}));n.changed.forEach(e);n.changedParentTypes.forEach(e);const o=this.type.toArray().map((t=>B(
/** @type {Y.XmlElement | Y.XmlHook} */t,this.prosemirrorView.state.schema,this))).filter((t=>t!==null));let s=this._tr.replace(0,this.prosemirrorView.state.doc.content.size,new h.Slice(h.Fragment.from(o),0,0));P(s,this.beforeTransactionSelection,this);s=s.setMeta(M,{isChangeOrigin:true,isUndoRedoOperation:n.origin instanceof t.UndoManager});this.beforeTransactionSelection!==null&&this._isLocalCursorInView()&&s.scrollIntoView();this.prosemirrorView.dispatch(s)})):this.renderSnapshot(o.snapshot,o.prevSnapshot)}
/**
   * @param {import('prosemirror-model').Node} doc
   */_prosemirrorChanged(t){this.doc.transact((()=>{at(this.doc,this.type,t,this);this.beforeTransactionSelection=z(this,this.prosemirrorView.state)}),M)}
/**
   * View is ready to listen to changes. Register observers.
   * @param {any} prosemirrorView
   */initView(t){this.prosemirrorView!=null&&this.destroy();this.prosemirrorView=t;this.doc.on("beforeAllTransactions",this.beforeAllTransactions);this.doc.on("afterAllTransactions",this.afterAllTransactions);this.type.observeDeep(this._observeFunction)}destroy(){if(this.prosemirrorView!=null){this.prosemirrorView=null;this.type.unobserveDeep(this._observeFunction);this.doc.off("beforeAllTransactions",this.beforeAllTransactions);this.doc.off("afterAllTransactions",this.afterAllTransactions)}}}
/**
 * @private
 * @param {Y.XmlElement | Y.XmlHook} el
 * @param {PModel.Schema} schema
 * @param {BindingMetadata} meta
 * @param {Y.Snapshot} [snapshot]
 * @param {Y.Snapshot} [prevSnapshot]
 * @param {function('removed' | 'added', Y.ID):any} [computeYChange]
 * @return {PModel.Node | null}
 */const B=(e,n,o,s,r,i)=>{const a=/** @type {PModel.Node} */o.mapping.get(e);if(a===void 0){if(e instanceof t.XmlElement)return L(e,n,o,s,r,i);throw b.methodUnimplemented()}return a};
/**
 * @private
 * @param {Y.XmlElement} el
 * @param {any} schema
 * @param {BindingMetadata} meta
 * @param {Y.Snapshot} [snapshot]
 * @param {Y.Snapshot} [prevSnapshot]
 * @param {function('removed' | 'added', Y.ID):any} [computeYChange]
 * @return {PModel.Node | null} Returns node if node could be created. Otherwise it deletes the yjs type and returns null
 */const L=(e,n,o,s,r,i)=>{const a=[];
/**
   * @param {Y.XmlElement | Y.XmlText} type
   */const c=e=>{if(e instanceof t.XmlElement){const t=B(e,n,o,s,r,i);t!==null&&a.push(t)}else{const c=/** @type {Y.ContentType} */(e._item.right?.content)?.type;if(c instanceof t.Text&&!c._item.deleted&&c._item.id.client===c.doc.clientID){e.applyDelta([{retain:e.length},...c.toDelta()]);c.doc.transact((t=>{c._item.delete(t)}))}const l=H(e,n,o,s,r,i);l!==null&&l.forEach((t=>{t!==null&&a.push(t)}))}};s===void 0||r===void 0?e.toArray().forEach(c):t.typeListToArraySnapshot(e,new t.Snapshot(r.ds,s.sv)).forEach(c);try{const t=e.getAttributes(s);s!==void 0&&(U(/** @type {Y.Item} */e._item,s)?U(/** @type {Y.Item} */e._item,r)||(t.ychange=i?i("added",/** @type {Y.Item} */e._item.id):{type:"added"}):t.ychange=i?i("removed",/** @type {Y.Item} */e._item.id):{type:"removed"});const c=n.node(e.nodeName,t,a);o.mapping.set(e,c);return c}catch(t){
/** @type {Y.Doc} */e.doc.transact((t=>{
/** @type {Y.Item} */e._item.delete(t)}),M);o.mapping.delete(e);return null}};
/**
 * @private
 * @param {Y.XmlText} text
 * @param {import('prosemirror-model').Schema} schema
 * @param {BindingMetadata} _meta
 * @param {Y.Snapshot} [snapshot]
 * @param {Y.Snapshot} [prevSnapshot]
 * @param {function('removed' | 'added', Y.ID):any} [computeYChange]
 * @return {Array<PModel.Node>|null}
 */const H=(t,e,n,o,s,r)=>{const i=[];const a=t.toDelta(o,s,r);try{for(let t=0;t<a.length;t++){const n=a[t];i.push(e.text(n.insert,rt(n.attributes,e)))}}catch(e){
/** @type {Y.Doc} */t.doc.transact((e=>{
/** @type {Y.Item} */t._item.delete(e)}),M);return null}return i};
/**
 * @private
 * @param {Array<any>} nodes prosemirror node
 * @param {BindingMetadata} meta
 * @return {Y.XmlText}
 */const J=(e,n)=>{const o=new t.XmlText;const s=e.map((t=>({insert:t.text,attributes:it(t.marks,n)})));o.applyDelta(s);n.mapping.set(o,e);return o};
/**
 * @private
 * @param {any} node prosemirror node
 * @param {BindingMetadata} meta
 * @return {Y.XmlElement}
 */const $=(e,n)=>{const o=new t.XmlElement(e.type.name);for(const t in e.attrs){const n=e.attrs[t];n!==null&&t!=="ychange"&&o.setAttribute(t,n)}o.insert(0,Z(e).map((t=>q(t,n))));n.mapping.set(o,e);return o};
/**
 * @private
 * @param {PModel.Node|Array<PModel.Node>} node prosemirror text node
 * @param {BindingMetadata} meta
 * @return {Y.XmlElement|Y.XmlText}
 */const q=(t,e)=>t instanceof Array?J(t,e):$(t,e)
/**
 * @param {any} val
 */;const K=t=>typeof t==="object"&&t!==null
/**
 * @param {any} pattrs
 * @param {any} yattrs
 */;const W=(t,e)=>{const n=Object.keys(t).filter((e=>t[e]!==null));let o=n.length===Object.keys(e).filter((t=>e[t]!==null)).length;for(let s=0;s<n.length&&o;s++){const r=n[s];const i=t[r];const a=e[r];o=r==="ychange"||i===a||K(i)&&K(a)&&W(i,a)}return o};
/**
 * @typedef {Array<Array<PModel.Node>|PModel.Node>} NormalizedPNodeContent
 */
/**
 * @param {any} pnode
 * @return {NormalizedPNodeContent}
 */const Z=t=>{const e=t.content.content;const n=[];for(let t=0;t<e.length;t++){const o=e[t];if(o.isText){const o=[];for(let n=e[t];t<e.length&&n.isText;n=e[++t])o.push(n);t--;n.push(o)}else n.push(o)}return n};
/**
 * @param {Y.XmlText} ytext
 * @param {Array<any>} ptexts
 */const G=(t,e)=>{const n=t.toDelta();return n.length===e.length&&n.every((/** @type {(d:any,i:number) => boolean} */(t,n)=>t.insert===/** @type {any} */e[n].text&&w.keys(t.attributes||{}).length===e[n].marks.length&&w.every(t.attributes,((t,/** @type {string} */o)=>{const s=st(o);const r=e[n].marks;const i=r.find((/** @param {any} mark */t=>t.type.name===s));return!!i&&W(t,r.find((/** @param {any} mark */t=>t.type.name===s))?.attrs)}))))};
/**
 * @param {Y.XmlElement|Y.XmlText|Y.XmlHook} ytype
 * @param {any|Array<any>} pnode
 */const Q=(e,n)=>{if(e instanceof t.XmlElement&&!(n instanceof Array)&&ct(e,n)){const t=Z(n);return e._length===t.length&&W(e.getAttributes(),n.attrs)&&e.toArray().every(((e,n)=>Q(e,t[n])))}return e instanceof t.XmlText&&n instanceof Array&&G(e,n)};
/**
 * @param {PModel.Node | Array<PModel.Node> | undefined} mapped
 * @param {PModel.Node | Array<PModel.Node>} pcontent
 */const Y=(t,e)=>t===e||t instanceof Array&&e instanceof Array&&t.length===e.length&&t.every(((t,n)=>e[n]===t))
/**
 * @param {Y.XmlElement} ytype
 * @param {PModel.Node} pnode
 * @param {BindingMetadata} meta
 * @return {{ foundMappedChild: boolean, equalityFactor: number }}
 */;const tt=(t,e,n)=>{const o=t.toArray();const s=Z(e);const r=s.length;const i=o.length;const a=y.min(i,r);let c=0;let l=0;let p=false;for(;c<a;c++){const t=o[c];const e=s[c];if(Y(n.mapping.get(t),e))p=true;else if(!Q(t,e))break}for(;c+l<a;l++){const t=o[i-l-1];const e=s[r-l-1];if(Y(n.mapping.get(t),e))p=true;else if(!Q(t,e))break}return{equalityFactor:c+l,foundMappedChild:p}};
/**
 * @param {Y.Text} ytext
 */const et=e=>{let n="";
/**
   * @type {Y.Item|null}
   */let o=e._start;const s={};while(o!==null){o.deleted||(o.countable&&o.content instanceof t.ContentString?n+=o.content.str:o.content instanceof t.ContentFormat&&(s[o.content.key]=null));o=o.right}return{str:n,nAttrs:s}};
/**
 * @todo test this more
 *
 * @param {Y.Text} ytext
 * @param {Array<any>} ptexts
 * @param {BindingMetadata} meta
 */const nt=(t,e,n)=>{n.mapping.set(t,e);const{nAttrs:o,str:s}=et(t);const r=e.map((t=>({insert:/** @type {any} */t.text,attributes:Object.assign({},o,it(t.marks,n))})));const{insert:i,remove:a,index:c}=_(s,r.map((t=>t.insert)).join(""));t.delete(c,a);t.insert(c,i);t.applyDelta(r.map((t=>({retain:t.insert.length,attributes:t.attributes}))))};const ot=/(.*)(--[a-zA-Z0-9+/=]{8})$/;
/**
 * @param {string} attrName
 */const st=t=>ot.exec(t)?.[1]??t
/**
 * @todo move this to markstoattributes
 *
 * @param {Object<string, any>} attrs
 * @param {import('prosemirror-model').Schema} schema
 */;const rt=(t,e)=>{
/**
   * @type {Array<import('prosemirror-model').Mark>}
   */
const n=[];for(const o in t)n.push(e.mark(st(o),t[o]));return n};
/**
 * @param {Array<import('prosemirror-model').Mark>} marks
 * @param {BindingMetadata} meta
 */const it=(t,e)=>{const n={};t.forEach((t=>{if(t.type.name!=="ychange"){const o=O.setIfUndefined(e.isOMark,t.type,(()=>!t.type.excludes(t.type)));n[o?`${t.type.name}--${R(t.toJSON())}`:t.type.name]=t.attrs}}));return n};
/**
 * Update a yDom node by syncing the current content of the prosemirror node.
 *
 * This is a y-prosemirror internal feature that you can use at your own risk.
 *
 * @private
 * @unstable
 *
 * @param {{transact: Function}} y
 * @param {Y.XmlFragment} yDomFragment
 * @param {any} pNode
 * @param {BindingMetadata} meta
 */const at=(e,n,o,s)=>{if(n instanceof t.XmlElement&&n.nodeName!==o.type.name)throw new Error("node name mismatch!");s.mapping.set(n,o);if(n instanceof t.XmlElement){const t=n.getAttributes();const e=o.attrs;for(const o in e)e[o]!==null?t[o]!==e[o]&&o!=="ychange"&&n.setAttribute(o,e[o]):n.removeAttribute(o);for(const o in t)e[o]===void 0&&n.removeAttribute(o)}const r=Z(o);const i=r.length;const a=n.toArray();const c=a.length;const l=y.min(i,c);let p=0;let d=0;for(;p<l;p++){const t=a[p];const e=r[p];if(!Y(s.mapping.get(t),e)){if(!Q(t,e))break;s.mapping.set(t,e)}}for(;d+p+1<l;d++){const t=a[c-d-1];const e=r[i-d-1];if(!Y(s.mapping.get(t),e)){if(!Q(t,e))break;s.mapping.set(t,e)}}e.transact((()=>{while(c-p-d>0&&i-p-d>0){const o=a[p];const l=r[p];const m=a[c-d-1];const u=r[i-d-1];if(o instanceof t.XmlText&&l instanceof Array){G(o,l)||nt(o,l,s);p+=1}else{let r=o instanceof t.XmlElement&&ct(o,l);let i=m instanceof t.XmlElement&&ct(m,u);if(r&&i){const t=tt(
/** @type {Y.XmlElement} */o,
/** @type {PModel.Node} */l,s);const e=tt(
/** @type {Y.XmlElement} */m,
/** @type {PModel.Node} */u,s);t.foundMappedChild&&!e.foundMappedChild?i=false:!t.foundMappedChild&&e.foundMappedChild||t.equalityFactor<e.equalityFactor?r=false:i=false}if(r){at(e,
/** @type {Y.XmlFragment} */o,
/** @type {PModel.Node} */l,s);p+=1}else if(i){at(e,
/** @type {Y.XmlFragment} */m,
/** @type {PModel.Node} */u,s);d+=1}else{s.mapping.delete(n.get(p));n.delete(p,1);n.insert(p,[q(l,s)]);p+=1}}}const o=c-p-d;if(c===1&&i===0&&a[0]instanceof t.XmlText){s.mapping.delete(a[0]);a[0].delete(0,a[0].length)}else if(o>0){n.slice(p,p+o).forEach((t=>s.mapping.delete(t)));n.delete(p,o)}if(p+d<i){const t=[];for(let e=p;e<i-d;e++)t.push(q(r[e],s));n.insert(p,t)}}),M)};
/**
 * @function
 * @param {Y.XmlElement} yElement
 * @param {any} pNode Prosemirror Node
 */const ct=(t,e)=>!(e instanceof Array)&&t.nodeName===e.type.name
/**
 * Either a node if type is YXmlElement or an Array of text nodes if YXmlText
 * @typedef {Map<Y.AbstractType, Node | Array<Node>>} ProsemirrorMapping
 */
/**
 * Is null if no timeout is in progress.
 * Is defined if a timeout is in progress.
 * Maps from view
 * @type {Map<EditorView, Map<any, any>>|null}
 */;let lt=null;const pt=()=>{const t=/** @type {Map<EditorView, Map<any, any>>} */lt;lt=null;t.forEach(((t,e)=>{const n=e.state.tr;const o=M.getState(e.state);if(o&&o.binding&&!o.binding.isDestroyed){t.forEach(((t,e)=>{n.setMeta(e,t)}));e.dispatch(n)}}))};const dt=(t,e,n)=>{if(!lt){lt=new Map;x.timeout(0,pt)}O.setIfUndefined(lt,t,O.create).set(e,n)};
/**
 * Transforms a Prosemirror based absolute position to a Yjs Cursor (relative position in the Yjs model).
 *
 * @param {number} pos
 * @param {Y.XmlFragment} type
 * @param {ProsemirrorMapping} mapping
 * @return {any} relative position
 */const mt=(e,n,o)=>{if(e===0)return t.createRelativePositionFromTypeIndex(n,0,-1);
/**
   * @type {any}
   */let s=n._first===null?null:/** @type {Y.ContentType} */n._first.content.type;while(s!==null&&n!==s){if(s instanceof t.XmlText){if(s._length>=e)return t.createRelativePositionFromTypeIndex(s,e,-1);e-=s._length;if(s._item!==null&&s._item.next!==null)s=/** @type {Y.ContentType} */s._item.next.content.type;else{do{s=s._item===null?null:s._item.parent;e--}while(s!==n&&s!==null&&s._item!==null&&s._item.next===null);s!==null&&s!==n&&(s=s._item===null?null:/** @type {Y.ContentType} */ /** @type Y.Item */s._item.next.content.type)}}else{const r=/** @type {any} */(o.get(s)||{nodeSize:0}).nodeSize;if(s._first!==null&&e<r){s=/** @type {Y.ContentType} */s._first.content.type;e--}else{if(e===1&&s._length===0&&r>1)return new t.RelativePosition(s._item===null?null:s._item.id,s._item===null?t.findRootTypeKey(s):null,null);e-=r;if(s._item!==null&&s._item.next!==null)s=/** @type {Y.ContentType} */s._item.next.content.type;else{if(e===0){s=s._item===null?s:s._item.parent;return new t.RelativePosition(s._item===null?null:s._item.id,s._item===null?t.findRootTypeKey(s):null,null)}do{s=/** @type {Y.Item} */s._item.parent;e--}while(s!==n&&/** @type {Y.Item} */s._item.next===null);s!==n&&(s=/** @type {Y.ContentType} */ /** @type {Y.Item} */ /** @type {Y.Item} */s._item.next.content.type)}}}if(s===null)throw b.unexpectedCase();if(e===0&&s.constructor!==t.XmlText&&s!==n)return ut(s._item.parent,s._item)}return t.createRelativePositionFromTypeIndex(n,n._length,-1)};const ut=(e,n)=>{let o=null;let s=null;e._item===null?s=t.findRootTypeKey(e):o=t.createID(e._item.id.client,e._item.id.clock);return new t.RelativePosition(o,s,n.id)};
/**
 * @param {Y.Doc} y
 * @param {Y.XmlFragment} documentType Top level type that is bound to pView
 * @param {any} relPos Encoded Yjs based relative position
 * @param {ProsemirrorMapping} mapping
 * @return {null|number}
 */const ht=(e,n,o,s)=>{const r=t.createAbsolutePositionFromRelativePosition(o,e);if(r===null||r.type!==n&&!t.isParentOf(n,r.type._item))return null;let i=r.type;let a=0;if(i.constructor===t.XmlText)a=r.index;else if(i._item===null||!i._item.deleted){let e=i._first;let n=0;while(n<i._length&&n<r.index&&e!==null){if(!e.deleted){const o=/** @type {Y.ContentType} */e.content.type;n++;o instanceof t.XmlText?a+=o._length:a+=/** @type {any} */s.get(o).nodeSize}e=/** @type {Y.Item} */e.right}a+=1}while(i!==n&&i._item!==null){const e=i._item.parent;if(e._item===null||!e._item.deleted){a+=1;let n=/** @type {Y.AbstractType} */e._first;while(n!==null){const e=/** @type {Y.ContentType} */n.content.type;if(e===i)break;n.deleted||(e instanceof t.XmlText?a+=e._length:a+=/** @type {any} */s.get(e).nodeSize);n=n.right}}i=/** @type {Y.AbstractType} */e}return a-1};
/**
 * Utility function for converting an Y.Fragment to a ProseMirror fragment.
 *
 * @param {Y.XmlFragment} yXmlFragment
 * @param {Schema} schema
 */const ft=(t,e)=>{const n=t.toArray().map((t=>L(
/** @type {Y.XmlElement} */t,e,D()))).filter((t=>t!==null));return f.fromArray(n)};
/**
 * Utility function for converting an Y.Fragment to a ProseMirror node.
 *
 * @param {Y.XmlFragment} yXmlFragment
 * @param {Schema} schema
 */const gt=(t,e)=>e.topNodeType.create(null,ft(t,e))
/**
 * The initial ProseMirror content should be supplied by Yjs. This function transforms a Y.Fragment
 * to a ProseMirror Doc node and creates a mapping that is used by the sync plugin.
 *
 * @param {Y.XmlFragment} yXmlFragment
 * @param {Schema} schema
 *
 * @todo deprecate mapping property
 */;const yt=(t,e)=>{const n=D();const o=t.toArray().map((t=>L(
/** @type {Y.XmlElement} */t,e,n))).filter((t=>t!==null));const s=e.topNodeType.create(null,f.fromArray(o));return{doc:s,meta:n,mapping:n.mapping}};
/**
 * Utility method to convert a Prosemirror Doc Node into a Y.Doc.
 *
 * This can be used when importing existing content to Y.Doc for the first time,
 * note that this should not be used to rehydrate a Y.Doc from a database once
 * collaboration has begun as all history will be lost
 *
 * @param {Node} doc
 * @param {string} xmlFragment
 * @return {Y.Doc}
 */function wt(e,n="prosemirror"){const o=new t.Doc;const s=/** @type {Y.XmlFragment} */o.get(n,t.XmlFragment);if(!s.doc)return o;St(e,s);return s.doc}
/**
 * Utility method to update an empty Y.XmlFragment with content from a Prosemirror Doc Node.
 *
 * This can be used when importing existing content to Y.Doc for the first time,
 * note that this should not be used to rehydrate a Y.Doc from a database once
 * collaboration has begun as all history will be lost
 *
 * Note: The Y.XmlFragment does not need to be part of a Y.Doc document at the time that this
 * method is called, but it must be added before any other operations are performed on it.
 *
 * @param {Node} doc prosemirror document.
 * @param {Y.XmlFragment} [xmlFragment] If supplied, an xml fragment to be
 *   populated from the prosemirror state; otherwise a new XmlFragment will be created.
 * @return {Y.XmlFragment}
 */function St(e,n){const o=n||new t.XmlFragment;const s=o.doc?o.doc:{transact:t=>t(void 0)};at(s,o,e,{mapping:new Map,isOMark:new Map});return o}
/**
 * Utility method to convert Prosemirror compatible JSON into a Y.Doc.
 *
 * This can be used when importing existing content to Y.Doc for the first time,
 * note that this should not be used to rehydrate a Y.Doc from a database once
 * collaboration has begun as all history will be lost
 *
 * @param {Schema} schema
 * @param {any} state
 * @param {string} xmlFragment
 * @return {Y.Doc}
 */function _t(t,e,n="prosemirror"){const o=g.fromJSON(t,e);return wt(o,n)}
/**
 * Utility method to convert Prosemirror compatible JSON to a Y.XmlFragment
 *
 * This can be used when importing existing content to Y.Doc for the first time,
 * note that this should not be used to rehydrate a Y.Doc from a database once
 * collaboration has begun as all history will be lost
 *
 * @param {Schema} schema
 * @param {any} state
 * @param {Y.XmlFragment} [xmlFragment] If supplied, an xml fragment to be
 *   populated from the prosemirror state; otherwise a new XmlFragment will be created.
 * @return {Y.XmlFragment}
 */function bt(t,e,n){const o=g.fromJSON(t,e);return St(o,n)}
/**
 * @deprecated Use `yXmlFragmentToProseMirrorRootNode` instead
 *
 * Utility method to convert a Y.Doc to a Prosemirror Doc node.
 *
 * @param {Schema} schema
 * @param {Y.Doc} ydoc
 * @return {Node}
 */function vt(t,e){const n=Tt(e);return g.fromJSON(t,n)}
/**
 *
 * @deprecated Use `yXmlFragmentToProseMirrorRootNode` instead
 *
 * Utility method to convert a Y.XmlFragment to a Prosemirror Doc node.
 *
 * @param {Schema} schema
 * @param {Y.XmlFragment} xmlFragment
 * @return {Node}
 */function At(t,e){const n=xt(e);return g.fromJSON(t,n)}
/**
 *
 * @deprecated Use `yXmlFragmentToProseMirrorRootNode` instead
 *
 * Utility method to convert a Y.Doc to Prosemirror compatible JSON.
 *
 * @param {Y.Doc} ydoc
 * @param {string} xmlFragment
 * @return {Record<string, any>}
 */function Tt(t,e="prosemirror"){return xt(t.getXmlFragment(e))}
/**
 * @deprecated Use `yXmlFragmentToProseMirrorRootNode` instead
 *
 * Utility method to convert a Y.Doc to Prosemirror compatible JSON.
 *
 * @param {Y.XmlFragment} xmlFragment The fragment, which must be part of a Y.Doc.
 * @return {Record<string, any>}
 */function xt(e){const n=e.toArray();
/**
   * @param {Y.AbstractType} item
   */const o=e=>{
/**
     * @type {Object} NodeObject
     * @property {string} NodeObject.type
     * @property {Record<string, string>=} NodeObject.attrs
     * @property {Array<NodeObject>=} NodeObject.content
     */
let n;if(e instanceof t.XmlText){const t=e.toDelta();n=t.map((/** @param {any} d */t=>{const e={type:"text",text:t.insert};t.attributes&&(e.marks=Object.keys(t.attributes).map((e=>{const n=t.attributes[e];const o=st(e);const s={type:o};Object.keys(n)&&(s.attrs=n);return s})));return e}))}else if(e instanceof t.XmlElement){n={type:e.nodeName};const t=e.getAttributes();Object.keys(t).length&&(n.attrs=t);const s=e.toArray();s.length&&(n.content=s.map(o).flat())}else b.unexpectedCase();return n};return{type:"doc",content:n.map(o)}}
/**
 * Default awareness state filter
 *
 * @param {number} currentClientId current client id
 * @param {number} userClientId user client id
 * @param {any} _user user data
 * @return {boolean}
 */const Ot=(t,e,n)=>t!==e
/**
 * Default generator for a cursor element
 *
 * @param {any} user user data
 * @return {HTMLElement}
 */;const kt=t=>{const e=document.createElement("span");e.classList.add("ProseMirror-yjs-cursor");e.setAttribute("style",`border-color: ${t.color}`);const n=document.createElement("div");n.setAttribute("style",`background-color: ${t.color}`);n.insertBefore(document.createTextNode(t.name),null);const o=document.createTextNode("⁠");const s=document.createTextNode("⁠");e.insertBefore(o,null);e.insertBefore(n,null);e.insertBefore(s,null);return e};
/**
 * Default generator for the selection attributes
 *
 * @param {any} user user data
 * @return {import('prosemirror-view').DecorationAttrs}
 */const Vt=t=>({style:`background-color: ${t.color}70`,class:"ProseMirror-yjs-selection"});const Mt=/^#[0-9a-fA-F]{6}$/;
/**
 * @param {any} state
 * @param {Awareness} awareness
 * @param {function(number, number, any):boolean} awarenessFilter
 * @param {(user: { name: string, color: string }, clientId: number) => Element} createCursor
 * @param {(user: { name: string, color: string }, clientId: number) => import('prosemirror-view').DecorationAttrs} createSelection
 * @return {any} DecorationSet
 */const Ft=(e,n,o,s,r)=>{const c=M.getState(e);const l=c.doc;const p=[];if(c.snapshot!=null||c.prevSnapshot!=null||c.binding.mapping.size===0)return i.create(e.doc,[]);n.getStates().forEach(((n,i)=>{if(o(l.clientID,i,n)&&n.cursor!=null){const o=n.user||{};o.color==null?o.color="#ffa500":Mt.test(o.color)||console.warn("A user uses an unsupported color format",o);o.name==null&&(o.name=`User: ${i}`);let d=ht(l,c.type,t.createRelativePositionFromJSON(n.cursor.anchor),c.binding.mapping);let m=ht(l,c.type,t.createRelativePositionFromJSON(n.cursor.head),c.binding.mapping);if(d!==null&&m!==null){const t=y.max(e.doc.content.size-1,0);d=y.min(d,t);m=y.min(m,t);p.push(a.widget(m,(()=>s(o,i)),{key:i+"",side:10}));const n=y.min(d,m);const c=y.max(d,m);p.push(a.inline(n,c,r(o,i),{inclusiveEnd:true,inclusiveStart:false}))}}}));return i.create(e.doc,p)};
/**
 * A prosemirror plugin that listens to awareness information on Yjs.
 * This requires that a `prosemirrorPlugin` is also bound to the prosemirror.
 *
 * @public
 * @param {Awareness} awareness
 * @param {object} opts
 * @param {function(any, any, any):boolean} [opts.awarenessStateFilter]
 * @param {(user: any, clientId: number) => HTMLElement} [opts.cursorBuilder]
 * @param {(user: any, clientId: number) => import('prosemirror-view').DecorationAttrs} [opts.selectionBuilder]
 * @param {function(any):any} [opts.getSelection]
 * @param {string} [cursorStateField] By default all editor bindings use the awareness 'cursor' field to propagate cursor information.
 * @return {any}
 */const Ct=(e,{awarenessStateFilter:n=Ot,cursorBuilder:o=kt,selectionBuilder:s=Vt,getSelection:r=t=>t.selection}={},i="cursor")=>new l({key:C,state:{init(t,r){return Ft(r,e,n,o,s)},apply(t,r,i,a){const c=M.getState(a);const l=t.getMeta(C);return c&&c.isChangeOrigin||l&&l.awarenessUpdated?Ft(a,e,n,o,s):r.map(t.mapping,t.doc)}},props:{decorations:t=>C.getState(t)},view:n=>{const o=()=>{n.docView&&dt(n,C,{awarenessUpdated:true})};const s=()=>{const o=M.getState(n.state);const s=e.getLocalState()||{};if(n.hasFocus()){const a=r(n.state);
/**
           * @type {Y.RelativePosition}
           */const c=mt(a.anchor,o.type,o.binding.mapping);
/**
           * @type {Y.RelativePosition}
           */const l=mt(a.head,o.type,o.binding.mapping);s.cursor!=null&&t.compareRelativePositions(t.createRelativePositionFromJSON(s.cursor.anchor),c)&&t.compareRelativePositions(t.createRelativePositionFromJSON(s.cursor.head),l)||e.setLocalStateField(i,{anchor:c,head:l})}else s.cursor!=null&&ht(o.doc,o.type,t.createRelativePositionFromJSON(s.cursor.anchor),o.binding.mapping)!==null&&e.setLocalStateField(i,null)};e.on("change",o);n.dom.addEventListener("focusin",s);n.dom.addEventListener("focusout",s);return{update:s,destroy:()=>{n.dom.removeEventListener("focusin",s);n.dom.removeEventListener("focusout",s);e.off("change",o);e.setLocalStateField(i,null)}}}});const Et=t=>{const e=F.getState(t).undoManager;if(e!=null){e.undo();return true}};const Rt=t=>{const e=F.getState(t).undoManager;if(e!=null){e.redo();return true}};const Dt=new Set(["paragraph"]);const Ut=(t,r)=>!(t instanceof e)||!(t.content instanceof n)||!(t.content.type instanceof o||t.content.type instanceof s&&r.has(t.content.type.nodeName))||t.content.type._length===0;const It=({protectedNodes:t=Dt,trackedOrigins:e=[],undoManager:n=null}={})=>new l({key:F,state:{init:(o,s)=>{const i=M.getState(s);const a=n||new r(i.type,{trackedOrigins:new Set([M].concat(e)),deleteFilter:e=>Ut(e,t),captureTransaction:t=>t.meta.get("addToHistory")!==false});return{undoManager:a,prevSel:null,hasUndoOps:a.undoStack.length>0,hasRedoOps:a.redoStack.length>0}},
/**
     * @returns {any}
     */
apply:(t,e,n,o)=>{const s=M.getState(o).binding;const r=e.undoManager;const i=r.undoStack.length>0;const a=r.redoStack.length>0;return s?{undoManager:r,prevSel:z(s,n),hasUndoOps:i,hasRedoOps:a}:i!==e.hasUndoOps||a!==e.hasRedoOps?Object.assign({},e,{hasUndoOps:r.undoStack.length>0,hasRedoOps:r.redoStack.length>0}):e}},view:t=>{const e=M.getState(t.state);const n=F.getState(t.state).undoManager;n.on("stack-item-added",(({stackItem:n})=>{const o=e.binding;o&&n.meta.set(o,F.getState(t.state).prevSel)}));n.on("stack-item-popped",(({stackItem:t})=>{const n=e.binding;n&&(n.beforeTransactionSelection=t.meta.get(n)||n.beforeTransactionSelection)}));return{destroy:()=>{n.destroy()}}}});export{ProsemirrorBinding,mt as absolutePositionToRelativePosition,Ft as createDecorations,Ot as defaultAwarenessStateFilter,kt as defaultCursorBuilder,Ut as defaultDeleteFilter,Dt as defaultProtectedNodes,Vt as defaultSelectionBuilder,z as getRelativeSelection,yt as initProseMirrorDoc,U as isVisible,_t as prosemirrorJSONToYDoc,bt as prosemirrorJSONToYXmlFragment,wt as prosemirrorToYDoc,St as prosemirrorToYXmlFragment,Rt as redo,ht as relativePositionToAbsolutePosition,dt as setMeta,Et as undo,at as updateYFragment,Ct as yCursorPlugin,C as yCursorPluginKey,vt as yDocToProsemirror,Tt as yDocToProsemirrorJSON,X as ySyncPlugin,M as ySyncPluginKey,It as yUndoPlugin,F as yUndoPluginKey,ft as yXmlFragmentToProseMirrorFragment,gt as yXmlFragmentToProseMirrorRootNode,At as yXmlFragmentToProsemirror,xt as yXmlFragmentToProsemirrorJSON};

