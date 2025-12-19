// yjs@13.6.27 downloaded from https://ga.jspm.io/npm:yjs@13.6.27/dist/yjs.mjs

import{ObservableV2 as t}from"lib0/observable";import*as e from"lib0/array";import*as n from"lib0/math";import*as r from"lib0/map";import*as s from"lib0/encoding";import*as i from"lib0/decoding";import*as o from"lib0/random";import*as c from"lib0/promise";import*as l from"lib0/buffer";import*as a from"lib0/error";import*as d from"lib0/binary";import*as h from"lib0/function";import{callAll as u}from"lib0/function";import*as g from"lib0/set";import*as f from"lib0/logging";import*as p from"lib0/time";import*as w from"lib0/string";import*as m from"lib0/iterator";import*as y from"lib0/object";import*as k from"lib0/environment";class AbstractConnector extends t{
/**
   * @param {Doc} ydoc
   * @param {any} awareness
   */
constructor(t,e){super();this.doc=t;this.awareness=e}}class DeleteItem{
/**
   * @param {number} clock
   * @param {number} len
   */
constructor(t,e){
/**
     * @type {number}
     */
this.clock=t;
/**
     * @type {number}
     */this.len=e}}class DeleteSet{constructor(){
/**
     * @type {Map<number,Array<DeleteItem>>}
     */
this.clients=new Map}}
/**
 * Iterate over all structs that the DeleteSet gc's.
 *
 * @param {Transaction} transaction
 * @param {DeleteSet} ds
 * @param {function(GC|Item):void} f
 *
 * @function
 */const b=(t,e,n)=>e.clients.forEach(((e,r)=>{const s=/** @type {Array<GC|Item>} */t.doc.store.clients.get(r);if(s!=null){const r=s[s.length-1];const i=r.id.clock+r.length;for(let r=0,o=e[r];r<e.length&&o.clock<i;o=e[++r])Pt(t,s,o.clock,o.len,n)}}))
/**
 * @param {Array<DeleteItem>} dis
 * @param {number} clock
 * @return {number|null}
 *
 * @private
 * @function
 */;const S=(t,e)=>{let r=0;let s=t.length-1;while(r<=s){const i=n.floor((r+s)/2);const o=t[i];const c=o.clock;if(c<=e){if(e<c+o.len)return i;r=i+1}else s=i-1}return null};
/**
 * @param {DeleteSet} ds
 * @param {ID} id
 * @return {boolean}
 *
 * @private
 * @function
 */const _=(t,e)=>{const n=t.clients.get(e.client);return n!==void 0&&S(n,e.clock)!==null};
/**
 * @param {DeleteSet} ds
 *
 * @private
 * @function
 */const C=t=>{t.clients.forEach((t=>{t.sort(((t,e)=>t.clock-e.clock));let e,r;for(e=1,r=1;e<t.length;e++){const s=t[r-1];const i=t[e];if(s.clock+s.len>=i.clock)s.len=n.max(s.len,i.clock+i.len-s.clock);else{r<e&&(t[r]=i);r++}}t.length=r}))};
/**
 * @param {Array<DeleteSet>} dss
 * @return {DeleteSet} A fresh DeleteSet
 */const D=t=>{const n=new DeleteSet;for(let r=0;r<t.length;r++)t[r].clients.forEach(((s,i)=>{if(!n.clients.has(i)){
/**
         * @type {Array<DeleteItem>}
         */
const o=s.slice();for(let n=r+1;n<t.length;n++)e.appendTo(o,t[n].clients.get(i)||[]);n.clients.set(i,o)}}));C(n);return n};
/**
 * @param {DeleteSet} ds
 * @param {number} client
 * @param {number} clock
 * @param {number} length
 *
 * @private
 * @function
 */const E=(t,e,n,s)=>{r.setIfUndefined(t.clients,e,(()=>/** @type {Array<DeleteItem>} */[])).push(new DeleteItem(n,s))};const U=()=>new DeleteSet
/**
 * @param {StructStore} ss
 * @return {DeleteSet} Merged and sorted DeleteSet
 *
 * @private
 * @function
 */;const V=t=>{const e=U();t.clients.forEach(((t,n)=>{
/**
     * @type {Array<DeleteItem>}
     */
const r=[];for(let e=0;e<t.length;e++){const n=t[e];if(n.deleted){const s=n.id.clock;let i=n.length;if(e+1<t.length)for(let n=t[e+1];e+1<t.length&&n.deleted;n=t[1+ ++e])i+=n.length;r.push(new DeleteItem(s,i))}}r.length>0&&e.clients.set(n,r)}));return e};
/**
 * @param {DSEncoderV1 | DSEncoderV2} encoder
 * @param {DeleteSet} ds
 *
 * @private
 * @function
 */const A=(t,n)=>{s.writeVarUint(t.restEncoder,n.clients.size);e.from(n.clients.entries()).sort(((t,e)=>e[0]-t[0])).forEach((([e,n])=>{t.resetDsCurVal();s.writeVarUint(t.restEncoder,e);const r=n.length;s.writeVarUint(t.restEncoder,r);for(let e=0;e<r;e++){const r=n[e];t.writeDsClock(r.clock);t.writeDsLen(r.len)}}))};
/**
 * @param {DSDecoderV1 | DSDecoderV2} decoder
 * @return {DeleteSet}
 *
 * @private
 * @function
 */const I=t=>{const e=new DeleteSet;const n=i.readVarUint(t.restDecoder);for(let s=0;s<n;s++){t.resetDsCurVal();const n=i.readVarUint(t.restDecoder);const s=i.readVarUint(t.restDecoder);if(s>0){const i=r.setIfUndefined(e.clients,n,(()=>/** @type {Array<DeleteItem>} */[]));for(let e=0;e<s;e++)i.push(new DeleteItem(t.readDsClock(),t.readDsLen()))}}return e};
/**
 * @param {DSDecoderV1 | DSDecoderV2} decoder
 * @param {Transaction} transaction
 * @param {StructStore} store
 * @return {Uint8Array|null} Returns a v2 update containing all deletes that couldn't be applied yet; or null if all deletes were applied successfully.
 *
 * @private
 * @function
 */const T=(t,e,n)=>{const r=new DeleteSet;const o=i.readVarUint(t.restDecoder);for(let s=0;s<o;s++){t.resetDsCurVal();const s=i.readVarUint(t.restDecoder);const o=i.readVarUint(t.restDecoder);const c=n.clients.get(s)||[];const l=Lt(n,s);for(let n=0;n<o;n++){const n=t.readDsClock();const i=n+t.readDsLen();if(n<l){l<i&&E(r,s,l,i-l);let t=Yt(c,n);
/**
         * We can ignore the case of GC and Delete structs, because we are going to skip them
         * @type {Item}
         */let o=c[t];if(!o.deleted&&o.id.clock<n){c.splice(t+1,0,Wn(e,o,n-o.id.clock));t++}while(t<c.length){o=c[t++];if(!(o.id.clock<i))break;if(!o.deleted){i<o.id.clock+o.length&&c.splice(t,0,Wn(e,o,i-o.id.clock));o.delete(e)}}}else E(r,s,n,i-n)}}if(r.clients.size>0){const t=new UpdateEncoderV2;s.writeVarUint(t.restEncoder,0);A(t,r);return t.toUint8Array()}return null};
/**
 * @param {DeleteSet} ds1
 * @param {DeleteSet} ds2
 */const v=(t,e)=>{if(t.clients.size!==e.clients.size)return false;for(const[n,r]of t.clients.entries()){const t=/** @type {Array<import('../internals.js').DeleteItem>} */e.clients.get(n);if(t===void 0||r.length!==t.length)return false;for(let e=0;e<r.length;e++){const n=r[e];const s=t[e];if(n.clock!==s.clock||n.len!==s.len)return false}}return true};const x=o.uint32;
/**
 * @typedef {Object} DocOpts
 * @property {boolean} [DocOpts.gc=true] Disable garbage collection (default: gc=true)
 * @property {function(Item):boolean} [DocOpts.gcFilter] Will be called before an Item is garbage collected. Return false to keep the Item.
 * @property {string} [DocOpts.guid] Define a globally unique identifier for this document
 * @property {string | null} [DocOpts.collectionid] Associate this document with a collection. This only plays a role if your provider has a concept of collection.
 * @property {any} [DocOpts.meta] Any kind of meta information you want to associate with this document. If this is a subdocument, remote peers will store the meta information as well.
 * @property {boolean} [DocOpts.autoLoad] If a subdocument, automatically load document. If this is a subdocument, remote peers will load the document as well automatically.
 * @property {boolean} [DocOpts.shouldLoad] Whether the document should be synced by the provider now. This is toggled to true when you call ydoc.load()
 */
/**
 * @typedef {Object} DocEvents
 * @property {function(Doc):void} DocEvents.destroy
 * @property {function(Doc):void} DocEvents.load
 * @property {function(boolean, Doc):void} DocEvents.sync
 * @property {function(Uint8Array, any, Doc, Transaction):void} DocEvents.update
 * @property {function(Uint8Array, any, Doc, Transaction):void} DocEvents.updateV2
 * @property {function(Doc):void} DocEvents.beforeAllTransactions
 * @property {function(Transaction, Doc):void} DocEvents.beforeTransaction
 * @property {function(Transaction, Doc):void} DocEvents.beforeObserverCalls
 * @property {function(Transaction, Doc):void} DocEvents.afterTransaction
 * @property {function(Transaction, Doc):void} DocEvents.afterTransactionCleanup
 * @property {function(Doc, Array<Transaction>):void} DocEvents.afterAllTransactions
 * @property {function({ loaded: Set<Doc>, added: Set<Doc>, removed: Set<Doc> }, Doc, Transaction):void} DocEvents.subdocs
 */class Doc extends t{
/**
   * @param {DocOpts} opts configuration
   */
constructor({guid:t=o.uuidv4(),collectionid:e=null,gc:n=true,gcFilter:r=()=>true,meta:s=null,autoLoad:i=false,shouldLoad:l=true}={}){super();this.gc=n;this.gcFilter=r;this.clientID=x();this.guid=t;this.collectionid=e;
/**
     * @type {Map<string, AbstractType<YEvent<any>>>}
     */this.share=new Map;this.store=new StructStore;
/**
     * @type {Transaction | null}
     */this._transaction=null;
/**
     * @type {Array<Transaction>}
     */this._transactionCleanups=[];
/**
     * @type {Set<Doc>}
     */this.subdocs=new Set;
/**
     * If this document is a subdocument - a document integrated into another document - then _item is defined.
     * @type {Item?}
     */this._item=null;this.shouldLoad=l;this.autoLoad=i;this.meta=s;
/**
     * This is set to true when the persistence provider loaded the document from the database or when the `sync` event fires.
     * Note that not all providers implement this feature. Provider authors are encouraged to fire the `load` event when the doc content is loaded from the database.
     *
     * @type {boolean}
     */this.isLoaded=false;this.isSynced=false;this.isDestroyed=false;this.whenLoaded=c.create((t=>{this.on("load",(()=>{this.isLoaded=true;t(this)}))}));const a=()=>c.create((t=>{
/**
       * @param {boolean} isSynced
       */
const e=n=>{if(n===void 0||n===true){this.off("sync",e);t()}};this.on("sync",e)}));this.on("sync",(t=>{t===false&&this.isSynced&&(this.whenSynced=a());this.isSynced=t===void 0||t===true;this.isSynced&&!this.isLoaded&&this.emit("load",[this])}));this.whenSynced=a()}load(){const t=this._item;t===null||this.shouldLoad||qt(/** @type {any} */t.parent.doc,(t=>{t.subdocsLoaded.add(this)}),null,true);this.shouldLoad=true}getSubdocs(){return this.subdocs}getSubdocGuids(){return new Set(e.from(this.subdocs).map((t=>t.guid)))}
/**
   * Changes that happen inside of a transaction are bundled. This means that
   * the observer fires _after_ the transaction is finished and that all changes
   * that happened inside of the transaction are sent as one message to the
   * other peers.
   *
   * @template T
   * @param {function(Transaction):T} f The function that should be executed as a transaction
   * @param {any} [origin] Origin of who started the transaction. Will be stored on transaction.origin
   * @return T
   *
   * @public
   */transact(t,e=null){return qt(this,t,e)}
/**
   * Define a shared data type.
   *
   * Multiple calls of `ydoc.get(name, TypeConstructor)` yield the same result
   * and do not overwrite each other. I.e.
   * `ydoc.get(name, Y.Array) === ydoc.get(name, Y.Array)`
   *
   * After this method is called, the type is also available on `ydoc.share.get(name)`.
   *
   * *Best Practices:*
   * Define all types right after the Y.Doc instance is created and store them in a separate object.
   * Also use the typed methods `getText(name)`, `getArray(name)`, ..
   *
   * @template {typeof AbstractType<any>} Type
   * @example
   *   const ydoc = new Y.Doc(..)
   *   const appState = {
   *     document: ydoc.getText('document')
   *     comments: ydoc.getArray('comments')
   *   }
   *
   * @param {string} name
   * @param {Type} TypeConstructor The constructor of the type definition. E.g. Y.Text, Y.Array, Y.Map, ...
   * @return {InstanceType<Type>} The created type. Constructed with TypeConstructor
   *
   * @public
   */get(t,e=/** @type {any} */AbstractType){const n=r.setIfUndefined(this.share,t,(()=>{const t=new e;t._integrate(this,null);return t}));const s=n.constructor;if(e!==AbstractType&&s!==e){if(s===AbstractType){const r=new e;r._map=n._map;n._map.forEach((/** @param {Item?} n */t=>{for(;t!==null;t=t.left)t.parent=r}));r._start=n._start;for(let t=r._start;t!==null;t=t.right)t.parent=r;r._length=n._length;this.share.set(t,r);r._integrate(this,null);/** @type {InstanceType<Type>} */
return r}throw new Error(`Type with the name ${t} has already been defined with a different constructor`)}/** @type {InstanceType<Type>} */
return n}
/**
   * @template T
   * @param {string} [name]
   * @return {YArray<T>}
   *
   * @public
   */getArray(t=""){/** @type {YArray<T>} */
return this.get(t,YArray)}
/**
   * @param {string} [name]
   * @return {YText}
   *
   * @public
   */getText(t=""){return this.get(t,YText)}
/**
   * @template T
   * @param {string} [name]
   * @return {YMap<T>}
   *
   * @public
   */getMap(t=""){/** @type {YMap<T>} */
return this.get(t,YMap)}
/**
   * @param {string} [name]
   * @return {YXmlElement}
   *
   * @public
   */getXmlElement(t=""){/** @type {YXmlElement<{[key:string]:string}>} */
return this.get(t,YXmlElement)}
/**
   * @param {string} [name]
   * @return {YXmlFragment}
   *
   * @public
   */getXmlFragment(t=""){return this.get(t,YXmlFragment)}
/**
   * Converts the entire document into a js object, recursively traversing each yjs type
   * Doesn't log types that have not been defined (using ydoc.getType(..)).
   *
   * @deprecated Do not use this method and rather call toJSON directly on the shared types.
   *
   * @return {Object<string, any>}
   */toJSON(){
/**
     * @type {Object<string, any>}
     */
const t={};this.share.forEach(((e,n)=>{t[n]=e.toJSON()}));return t}destroy(){this.isDestroyed=true;e.from(this.subdocs).forEach((t=>t.destroy()));const t=this._item;if(t!==null){this._item=null;const e=/** @type {ContentDoc} */t.content;e.doc=new Doc({guid:this.guid,...e.opts,shouldLoad:false});e.doc._item=t;qt(/** @type {any} */t.parent.doc,(n=>{const r=e.doc;t.deleted||n.subdocsAdded.add(r);n.subdocsRemoved.add(this)}),null,true)}this.emit("destroyed",[true]);this.emit("destroy",[this]);super.destroy()}}class DSDecoderV1{
/**
   * @param {decoding.Decoder} decoder
   */
constructor(t){this.restDecoder=t}resetDsCurVal(){}readDsClock(){return i.readVarUint(this.restDecoder)}readDsLen(){return i.readVarUint(this.restDecoder)}}class UpdateDecoderV1 extends DSDecoderV1{readLeftID(){return nt(i.readVarUint(this.restDecoder),i.readVarUint(this.restDecoder))}readRightID(){return nt(i.readVarUint(this.restDecoder),i.readVarUint(this.restDecoder))}readClient(){return i.readVarUint(this.restDecoder)}readInfo(){return i.readUint8(this.restDecoder)}readString(){return i.readVarString(this.restDecoder)}readParentInfo(){return i.readVarUint(this.restDecoder)===1}readTypeRef(){return i.readVarUint(this.restDecoder)}readLen(){return i.readVarUint(this.restDecoder)}readAny(){return i.readAny(this.restDecoder)}readBuf(){return l.copyUint8Array(i.readVarUint8Array(this.restDecoder))}readJSON(){return JSON.parse(i.readVarString(this.restDecoder))}readKey(){return i.readVarString(this.restDecoder)}}class DSDecoderV2{
/**
   * @param {decoding.Decoder} decoder
   */
constructor(t){this.dsCurrVal=0;this.restDecoder=t}resetDsCurVal(){this.dsCurrVal=0}readDsClock(){this.dsCurrVal+=i.readVarUint(this.restDecoder);return this.dsCurrVal}readDsLen(){const t=i.readVarUint(this.restDecoder)+1;this.dsCurrVal+=t;return t}}class UpdateDecoderV2 extends DSDecoderV2{
/**
   * @param {decoding.Decoder} decoder
   */
constructor(t){super(t);
/**
     * List of cached keys. If the keys[id] does not exist, we read a new key
     * from stringEncoder and push it to keys.
     *
     * @type {Array<string>}
     */this.keys=[];i.readVarUint(t);this.keyClockDecoder=new i.IntDiffOptRleDecoder(i.readVarUint8Array(t));this.clientDecoder=new i.UintOptRleDecoder(i.readVarUint8Array(t));this.leftClockDecoder=new i.IntDiffOptRleDecoder(i.readVarUint8Array(t));this.rightClockDecoder=new i.IntDiffOptRleDecoder(i.readVarUint8Array(t));this.infoDecoder=new i.RleDecoder(i.readVarUint8Array(t),i.readUint8);this.stringDecoder=new i.StringDecoder(i.readVarUint8Array(t));this.parentInfoDecoder=new i.RleDecoder(i.readVarUint8Array(t),i.readUint8);this.typeRefDecoder=new i.UintOptRleDecoder(i.readVarUint8Array(t));this.lenDecoder=new i.UintOptRleDecoder(i.readVarUint8Array(t))}readLeftID(){return new ID(this.clientDecoder.read(),this.leftClockDecoder.read())}readRightID(){return new ID(this.clientDecoder.read(),this.rightClockDecoder.read())}readClient(){return this.clientDecoder.read()}readInfo(){/** @type {number} */
return this.infoDecoder.read()}readString(){return this.stringDecoder.read()}readParentInfo(){return this.parentInfoDecoder.read()===1}readTypeRef(){return this.typeRefDecoder.read()}readLen(){return this.lenDecoder.read()}readAny(){return i.readAny(this.restDecoder)}readBuf(){return i.readVarUint8Array(this.restDecoder)}readJSON(){return i.readAny(this.restDecoder)}readKey(){const t=this.keyClockDecoder.read();if(t<this.keys.length)return this.keys[t];{const t=this.stringDecoder.read();this.keys.push(t);return t}}}class DSEncoderV1{constructor(){this.restEncoder=s.createEncoder()}toUint8Array(){return s.toUint8Array(this.restEncoder)}resetDsCurVal(){}
/**
   * @param {number} clock
   */writeDsClock(t){s.writeVarUint(this.restEncoder,t)}
/**
   * @param {number} len
   */writeDsLen(t){s.writeVarUint(this.restEncoder,t)}}class UpdateEncoderV1 extends DSEncoderV1{
/**
   * @param {ID} id
   */
writeLeftID(t){s.writeVarUint(this.restEncoder,t.client);s.writeVarUint(this.restEncoder,t.clock)}
/**
   * @param {ID} id
   */writeRightID(t){s.writeVarUint(this.restEncoder,t.client);s.writeVarUint(this.restEncoder,t.clock)}
/**
   * Use writeClient and writeClock instead of writeID if possible.
   * @param {number} client
   */writeClient(t){s.writeVarUint(this.restEncoder,t)}
/**
   * @param {number} info An unsigned 8-bit integer
   */writeInfo(t){s.writeUint8(this.restEncoder,t)}
/**
   * @param {string} s
   */writeString(t){s.writeVarString(this.restEncoder,t)}
/**
   * @param {boolean} isYKey
   */writeParentInfo(t){s.writeVarUint(this.restEncoder,t?1:0)}
/**
   * @param {number} info An unsigned 8-bit integer
   */writeTypeRef(t){s.writeVarUint(this.restEncoder,t)}
/**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */writeLen(t){s.writeVarUint(this.restEncoder,t)}
/**
   * @param {any} any
   */writeAny(t){s.writeAny(this.restEncoder,t)}
/**
   * @param {Uint8Array} buf
   */writeBuf(t){s.writeVarUint8Array(this.restEncoder,t)}
/**
   * @param {any} embed
   */writeJSON(t){s.writeVarString(this.restEncoder,JSON.stringify(t))}
/**
   * @param {string} key
   */writeKey(t){s.writeVarString(this.restEncoder,t)}}class DSEncoderV2{constructor(){this.restEncoder=s.createEncoder();this.dsCurrVal=0}toUint8Array(){return s.toUint8Array(this.restEncoder)}resetDsCurVal(){this.dsCurrVal=0}
/**
   * @param {number} clock
   */writeDsClock(t){const e=t-this.dsCurrVal;this.dsCurrVal=t;s.writeVarUint(this.restEncoder,e)}
/**
   * @param {number} len
   */writeDsLen(t){t===0&&a.unexpectedCase();s.writeVarUint(this.restEncoder,t-1);this.dsCurrVal+=t}}class UpdateEncoderV2 extends DSEncoderV2{constructor(){super();
/**
     * @type {Map<string,number>}
     */this.keyMap=new Map;
/**
     * Refers to the next unique key-identifier to me used.
     * See writeKey method for more information.
     *
     * @type {number}
     */this.keyClock=0;this.keyClockEncoder=new s.IntDiffOptRleEncoder;this.clientEncoder=new s.UintOptRleEncoder;this.leftClockEncoder=new s.IntDiffOptRleEncoder;this.rightClockEncoder=new s.IntDiffOptRleEncoder;this.infoEncoder=new s.RleEncoder(s.writeUint8);this.stringEncoder=new s.StringEncoder;this.parentInfoEncoder=new s.RleEncoder(s.writeUint8);this.typeRefEncoder=new s.UintOptRleEncoder;this.lenEncoder=new s.UintOptRleEncoder}toUint8Array(){const t=s.createEncoder();s.writeVarUint(t,0);s.writeVarUint8Array(t,this.keyClockEncoder.toUint8Array());s.writeVarUint8Array(t,this.clientEncoder.toUint8Array());s.writeVarUint8Array(t,this.leftClockEncoder.toUint8Array());s.writeVarUint8Array(t,this.rightClockEncoder.toUint8Array());s.writeVarUint8Array(t,s.toUint8Array(this.infoEncoder));s.writeVarUint8Array(t,this.stringEncoder.toUint8Array());s.writeVarUint8Array(t,s.toUint8Array(this.parentInfoEncoder));s.writeVarUint8Array(t,this.typeRefEncoder.toUint8Array());s.writeVarUint8Array(t,this.lenEncoder.toUint8Array());s.writeUint8Array(t,s.toUint8Array(this.restEncoder));return s.toUint8Array(t)}
/**
   * @param {ID} id
   */writeLeftID(t){this.clientEncoder.write(t.client);this.leftClockEncoder.write(t.clock)}
/**
   * @param {ID} id
   */writeRightID(t){this.clientEncoder.write(t.client);this.rightClockEncoder.write(t.clock)}
/**
   * @param {number} client
   */writeClient(t){this.clientEncoder.write(t)}
/**
   * @param {number} info An unsigned 8-bit integer
   */writeInfo(t){this.infoEncoder.write(t)}
/**
   * @param {string} s
   */writeString(t){this.stringEncoder.write(t)}
/**
   * @param {boolean} isYKey
   */writeParentInfo(t){this.parentInfoEncoder.write(t?1:0)}
/**
   * @param {number} info An unsigned 8-bit integer
   */writeTypeRef(t){this.typeRefEncoder.write(t)}
/**
   * Write len of a struct - well suited for Opt RLE encoder.
   *
   * @param {number} len
   */writeLen(t){this.lenEncoder.write(t)}
/**
   * @param {any} any
   */writeAny(t){s.writeAny(this.restEncoder,t)}
/**
   * @param {Uint8Array} buf
   */writeBuf(t){s.writeVarUint8Array(this.restEncoder,t)}
/**
   * This is mainly here for legacy purposes.
   *
   * Initial we incoded objects using JSON. Now we use the much faster lib0/any-encoder. This method mainly exists for legacy purposes for the v1 encoder.
   *
   * @param {any} embed
   */writeJSON(t){s.writeAny(this.restEncoder,t)}
/**
   * Property keys are often reused. For example, in y-prosemirror the key `bold` might
   * occur very often. For a 3d application, the key `position` might occur very often.
   *
   * We cache these keys in a Map and refer to them via a unique number.
   *
   * @param {string} key
   */writeKey(t){const e=this.keyMap.get(t);if(e===void 0){this.keyClockEncoder.write(this.keyClock++);this.stringEncoder.write(t)}else this.keyClockEncoder.write(e)}}
/**
 * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
 * @param {Array<GC|Item>} structs All structs by `client`
 * @param {number} client
 * @param {number} clock write structs starting with `ID(client,clock)`
 *
 * @function
 */const M=(t,e,r,i)=>{i=n.max(i,e[0].id.clock);const o=Yt(e,i);s.writeVarUint(t.restEncoder,e.length-o);t.writeClient(r);s.writeVarUint(t.restEncoder,i);const c=e[o];c.write(t,i-c.id.clock);for(let n=o+1;n<e.length;n++)e[n].write(t,0)};
/**
 * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
 * @param {StructStore} store
 * @param {Map<number,number>} _sm
 *
 * @private
 * @function
 */const L=(t,n,r)=>{const i=new Map;r.forEach(((t,e)=>{Lt(n,e)>t&&i.set(e,t)}));Mt(n).forEach(((t,e)=>{r.has(e)||i.set(e,0)}));s.writeVarUint(t.restEncoder,i.size);e.from(i.entries()).sort(((t,e)=>e[0]-t[0])).forEach((([e,r])=>{M(t,/** @type {Array<GC|Item>} */n.clients.get(e),e,r)}))};
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder The decoder object to read data from.
 * @param {Doc} doc
 * @return {Map<number, { i: number, refs: Array<Item | GC> }>}
 *
 * @private
 * @function
 */const O=(t,e)=>{
/**
   * @type {Map<number, { i: number, refs: Array<Item | GC> }>}
   */
const n=r.create();const s=i.readVarUint(t.restDecoder);for(let r=0;r<s;r++){const r=i.readVarUint(t.restDecoder);
/**
     * @type {Array<GC|Item>}
     */const s=new Array(r);const o=t.readClient();let c=i.readVarUint(t.restDecoder);n.set(o,{i:0,refs:s});for(let n=0;n<r;n++){const r=t.readInfo();switch(d.BITS5&r){case 0:{const e=t.readLen();s[n]=new GC(nt(o,c),e);c+=e;break}case 10:{const e=i.readVarUint(t.restDecoder);s[n]=new Skip(nt(o,c),e);c+=e;break}default:{const i=(r&(d.BIT7|d.BIT8))===0;const l=new Item(nt(o,c),null,(r&d.BIT8)===d.BIT8?t.readLeftID():null,null,(r&d.BIT7)===d.BIT7?t.readRightID():null,i?t.readParentInfo()?e.get(t.readString()):t.readLeftID():null,i&&(r&d.BIT6)===d.BIT6?t.readString():null,jn(t,r));
/* A non-optimized implementation of the above algorithm:

          // The item that was originally to the left of this item.
          const origin = (info & binary.BIT8) === binary.BIT8 ? decoder.readLeftID() : null
          // The item that was originally to the right of this item.
          const rightOrigin = (info & binary.BIT7) === binary.BIT7 ? decoder.readRightID() : null
          const cantCopyParentInfo = (info & (binary.BIT7 | binary.BIT8)) === 0
          const hasParentYKey = cantCopyParentInfo ? decoder.readParentInfo() : false
          // If parent = null and neither left nor right are defined, then we know that `parent` is child of `y`
          // and we read the next string as parentYKey.
          // It indicates how we store/retrieve parent from `y.share`
          // @type {string|null}
          const parentYKey = cantCopyParentInfo && hasParentYKey ? decoder.readString() : null

          const struct = new Item(
            createID(client, clock),
            null, // left
            origin, // origin
            null, // right
            rightOrigin, // right origin
            cantCopyParentInfo && !hasParentYKey ? decoder.readLeftID() : (parentYKey !== null ? doc.get(parentYKey) : null), // parent
            cantCopyParentInfo && (info & binary.BIT6) === binary.BIT6 ? decoder.readString() : null, // parentSub
            readItemContent(decoder, info) // item content
          )
          */s[n]=l;c+=l.length}}}}return n};
/**
 * Resume computing structs generated by struct readers.
 *
 * While there is something to do, we integrate structs in this order
 * 1. top element on stack, if stack is not empty
 * 2. next element from current struct reader (if empty, use next struct reader)
 *
 * If struct causally depends on another struct (ref.missing), we put next reader of
 * `ref.id.client` on top of stack.
 *
 * At some point we find a struct that has no causal dependencies,
 * then we start emptying the stack.
 *
 * It is not possible to have circles: i.e. struct1 (from client1) depends on struct2 (from client2)
 * depends on struct3 (from client1). Therefore the max stack size is equal to `structReaders.length`.
 *
 * This method is implemented in a way so that we can resume computation if this update
 * causally depends on another update.
 *
 * @param {Transaction} transaction
 * @param {StructStore} store
 * @param {Map<number, { i: number, refs: (GC | Item)[] }>} clientsStructRefs
 * @return { null | { update: Uint8Array, missing: Map<number,number> } }
 *
 * @private
 * @function
 */const Y=(t,n,i)=>{
/**
   * @type {Array<Item | GC>}
   */
const o=[];let c=e.from(i.keys()).sort(((t,e)=>t-e));if(c.length===0)return null;const l=()=>{if(c.length===0)return null;let t=/** @type {{i:number,refs:Array<GC|Item>}} */i.get(c[c.length-1]);while(t.refs.length===t.i){c.pop();if(!(c.length>0))return null;t=/** @type {{i:number,refs:Array<GC|Item>}} */i.get(c[c.length-1])}return t};let a=l();if(a===null)return null;
/**
   * @type {StructStore}
   */const d=new StructStore;const h=new Map;
/**
   * @param {number} client
   * @param {number} clock
   */const u=(t,e)=>{const n=h.get(t);(n==null||n>e)&&h.set(t,e)};
/**
   * @type {GC|Item}
   */let g=/** @type {any} */a.refs[/** @type {any} */a.i++];const f=new Map;const p=()=>{for(const t of o){const e=t.id.client;const n=i.get(e);if(n){n.i--;d.clients.set(e,n.refs.slice(n.i));i.delete(e);n.i=0;n.refs=[]}else d.clients.set(e,[t]);c=c.filter((t=>t!==e))}o.length=0};while(true){if(g.constructor!==Skip){const e=r.setIfUndefined(f,g.id.client,(()=>Lt(n,g.id.client)));const s=e-g.id.clock;if(s<0){o.push(g);u(g.id.client,g.id.clock-1);p()}else{const e=g.getMissing(t,n);if(e!==null){o.push(g);
/**
           * @type {{ refs: Array<GC|Item>, i: number }}
           */const t=i.get(/** @type {number} */e)||{refs:[],i:0};if(t.refs.length!==t.i){g=t.refs[t.i++];continue}u(/** @type {number} */e,Lt(n,e));p()}else if(s===0||s<g.length){g.integrate(t,s);f.set(g.id.client,g.id.clock+g.length)}}}if(o.length>0)g=/** @type {GC|Item} */o.pop();else if(a!==null&&a.i<a.refs.length)g=/** @type {GC|Item} */a.refs[a.i++];else{a=l();if(a===null)break;g=/** @type {GC|Item} */a.refs[a.i++]}}if(d.clients.size>0){const t=new UpdateEncoderV2;L(t,d,new Map);s.writeVarUint(t.restEncoder,0);return{missing:h,update:t.toUint8Array()}}return null};
/**
 * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
 * @param {Transaction} transaction
 *
 * @private
 * @function
 */const R=(t,e)=>L(t,e.doc.store,e.beforeState)
/**
 * Read and apply a document update.
 *
 * This function has the same effect as `applyUpdate` but accepts a decoder.
 *
 * @param {decoding.Decoder} decoder
 * @param {Doc} ydoc
 * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
 * @param {UpdateDecoderV1 | UpdateDecoderV2} [structDecoder]
 *
 * @function
 */;const N=(t,e,n,r=new UpdateDecoderV2(t))=>qt(e,(t=>{t.local=false;let e=false;const n=t.doc;const s=n.store;const o=O(r,n);const c=Y(t,s,o);const l=s.pendingStructs;if(l){for(const[t,n]of l.missing)if(n<Lt(s,t)){e=true;break}if(c){for(const[t,e]of c.missing){const n=l.missing.get(t);(n==null||n>e)&&l.missing.set(t,e)}l.update=he([l.update,c.update])}}else s.pendingStructs=c;const a=T(r,t,s);if(s.pendingDs){const e=new UpdateDecoderV2(i.createDecoder(s.pendingDs));i.readVarUint(e.restDecoder);const n=T(e,t,s);s.pendingDs=a&&n?he([a,n]):a||n}else s.pendingDs=a;if(e){const e=/** @type {{update: Uint8Array}} */s.pendingStructs.update;s.pendingStructs=null;F(t.doc,e)}}),n,false)
/**
 * Read and apply a document update.
 *
 * This function has the same effect as `applyUpdate` but accepts a decoder.
 *
 * @param {decoding.Decoder} decoder
 * @param {Doc} ydoc
 * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
 *
 * @function
 */;const B=(t,e,n)=>N(t,e,n,new UpdateDecoderV1(t))
/**
 * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
 *
 * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
 *
 * @param {Doc} ydoc
 * @param {Uint8Array} update
 * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
 * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
 *
 * @function
 */;const F=(t,e,n,r=UpdateDecoderV2)=>{const s=i.createDecoder(e);N(s,t,n,new r(s))};
/**
 * Apply a document update created by, for example, `y.on('update', update => ..)` or `update = encodeStateAsUpdate()`.
 *
 * This function has the same effect as `readUpdate` but accepts an Uint8Array instead of a Decoder.
 *
 * @param {Doc} ydoc
 * @param {Uint8Array} update
 * @param {any} [transactionOrigin] This will be stored on `transaction.origin` and `.on('update', (update, origin))`
 *
 * @function
 */const X=(t,e,n)=>F(t,e,n,UpdateDecoderV1)
/**
 * Write all the document as a single update message. If you specify the state of the remote client (`targetStateVector`) it will
 * only write the operations that are missing.
 *
 * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
 * @param {Doc} doc
 * @param {Map<number,number>} [targetStateVector] The state of the target that receives the update. Leave empty to write all known structs
 *
 * @function
 */;const z=(t,e,n=new Map)=>{L(t,e.store,n);A(t,V(e.store))};
/**
 * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
 * only write the operations that are missing.
 *
 * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
 *
 * @param {Doc} doc
 * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
 * @param {UpdateEncoderV1 | UpdateEncoderV2} [encoder]
 * @return {Uint8Array}
 *
 * @function
 */const P=(t,e=new Uint8Array([0]),n=new UpdateEncoderV2)=>{const r=H(e);z(n,t,r);const s=[n.toUint8Array()];t.store.pendingDs&&s.push(t.store.pendingDs);t.store.pendingStructs&&s.push(ue(t.store.pendingStructs.update,e));if(s.length>1){if(n.constructor===UpdateEncoderV1)return ie(s.map(((t,e)=>e===0?t:_e(t))));if(n.constructor===UpdateEncoderV2)return he(s)}return s[0]};
/**
 * Write all the document as a single update message that can be applied on the remote document. If you specify the state of the remote client (`targetState`) it will
 * only write the operations that are missing.
 *
 * Use `writeStateAsUpdate` instead if you are working with lib0/encoding.js#Encoder
 *
 * @param {Doc} doc
 * @param {Uint8Array} [encodedTargetStateVector] The state of the target that receives the update. Leave empty to write all known structs
 * @return {Uint8Array}
 *
 * @function
 */const J=(t,e)=>P(t,e,new UpdateEncoderV1)
/**
 * Read state vector from Decoder and return as Map
 *
 * @param {DSDecoderV1 | DSDecoderV2} decoder
 * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
 *
 * @function
 */;const W=t=>{const e=new Map;const n=i.readVarUint(t.restDecoder);for(let r=0;r<n;r++){const n=i.readVarUint(t.restDecoder);const r=i.readVarUint(t.restDecoder);e.set(n,r)}return e};
/**
 * Read decodedState and return State as Map.
 *
 * @param {Uint8Array} decodedState
 * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
 *
 * @function
 */
/**
 * Read decodedState and return State as Map.
 *
 * @param {Uint8Array} decodedState
 * @return {Map<number,number>} Maps `client` to the number next expected `clock` from that client.
 *
 * @function
 */const H=t=>W(new DSDecoderV1(i.createDecoder(t)))
/**
 * @param {DSEncoderV1 | DSEncoderV2} encoder
 * @param {Map<number,number>} sv
 * @function
 */;const G=(t,n)=>{s.writeVarUint(t.restEncoder,n.size);e.from(n.entries()).sort(((t,e)=>e[0]-t[0])).forEach((([e,n])=>{s.writeVarUint(t.restEncoder,e);s.writeVarUint(t.restEncoder,n)}));return t};
/**
 * @param {DSEncoderV1 | DSEncoderV2} encoder
 * @param {Doc} doc
 *
 * @function
 */const j=(t,e)=>G(t,Mt(e.store))
/**
 * Encode State as Uint8Array.
 *
 * @param {Doc|Map<number,number>} doc
 * @param {DSEncoderV1 | DSEncoderV2} [encoder]
 * @return {Uint8Array}
 *
 * @function
 */;const $=(t,e=new DSEncoderV2)=>{t instanceof Map?G(e,t):j(e,t);return e.toUint8Array()};
/**
 * Encode State as Uint8Array.
 *
 * @param {Doc|Map<number,number>} doc
 * @return {Uint8Array}
 *
 * @function
 */const K=t=>$(t,new DSEncoderV1)
/**
 * General event handler implementation.
 *
 * @template ARG0, ARG1
 *
 * @private
 */;class EventHandler{constructor(){
/**
     * @type {Array<function(ARG0, ARG1):void>}
     */
this.l=[]}}
/**
 * @template ARG0,ARG1
 * @returns {EventHandler<ARG0,ARG1>}
 *
 * @private
 * @function
 */const q=()=>new EventHandler
/**
 * Adds an event listener that is called when
 * {@link EventHandler#callEventListeners} is called.
 *
 * @template ARG0,ARG1
 * @param {EventHandler<ARG0,ARG1>} eventHandler
 * @param {function(ARG0,ARG1):void} f The event handler.
 *
 * @private
 * @function
 */;const Q=(t,e)=>t.l.push(e)
/**
 * Removes an event listener.
 *
 * @template ARG0,ARG1
 * @param {EventHandler<ARG0,ARG1>} eventHandler
 * @param {function(ARG0,ARG1):void} f The event handler that was added with
 *                     {@link EventHandler#addEventListener}
 *
 * @private
 * @function
 */;const Z=(t,e)=>{const n=t.l;const r=n.length;t.l=n.filter((t=>e!==t));r===t.l.length&&console.error("[yjs] Tried to remove event handler that doesn't exist.")};
/**
 * Call all event listeners that were added via
 * {@link EventHandler#addEventListener}.
 *
 * @template ARG0,ARG1
 * @param {EventHandler<ARG0,ARG1>} eventHandler
 * @param {ARG0} arg0
 * @param {ARG1} arg1
 *
 * @private
 * @function
 */const tt=(t,e,n)=>h.callAll(t.l,[e,n]);class ID{
/**
   * @param {number} client client id
   * @param {number} clock unique per client id, continuous number
   */
constructor(t,e){
/**
     * Client id
     * @type {number}
     */
this.client=t;
/**
     * unique per client id, continuous number
     * @type {number}
     */this.clock=e}}
/**
 * @param {ID | null} a
 * @param {ID | null} b
 * @return {boolean}
 *
 * @function
 */const et=(t,e)=>t===e||t!==null&&e!==null&&t.client===e.client&&t.clock===e.clock
/**
 * @param {number} client
 * @param {number} clock
 *
 * @private
 * @function
 */;const nt=(t,e)=>new ID(t,e)
/**
 * @param {encoding.Encoder} encoder
 * @param {ID} id
 *
 * @private
 * @function
 */;const rt=(t,e)=>{s.writeVarUint(t,e.client);s.writeVarUint(t,e.clock)};
/**
 * Read ID.
 * * If first varUint read is 0xFFFFFF a RootID is returned.
 * * Otherwise an ID is returned
 *
 * @param {decoding.Decoder} decoder
 * @return {ID}
 *
 * @private
 * @function
 */const st=t=>nt(i.readVarUint(t),i.readVarUint(t))
/**
 * The top types are mapped from y.share.get(keyname) => type.
 * `type` does not store any information about the `keyname`.
 * This function finds the correct `keyname` for `type` and throws otherwise.
 *
 * @param {AbstractType<any>} type
 * @return {string}
 *
 * @private
 * @function
 */;const it=t=>{for(const[e,n]of t.doc.share.entries())if(n===t)return e;throw a.unexpectedCase()};
/**
 * Check if `parent` is a parent of `child`.
 *
 * @param {AbstractType<any>} parent
 * @param {Item|null} child
 * @return {Boolean} Whether `parent` is a parent of `child`.
 *
 * @private
 * @function
 */const ot=(t,e)=>{while(e!==null){if(e.parent===t)return true;e=/** @type {AbstractType<any>} */e.parent._item}return false};
/**
 * Convenient helper to log type information.
 *
 * Do not use in productive systems as the output can be immense!
 *
 * @param {AbstractType<any>} type
 */const ct=t=>{const e=[];let n=t._start;while(n){e.push(n);n=n.right}console.log("Children: ",e);console.log("Children content: ",e.filter((t=>!t.deleted)).map((t=>t.content)))};class PermanentUserData{
/**
   * @param {Doc} doc
   * @param {YMap<any>} [storeType]
   */
constructor(t,e=t.getMap("users")){
/**
     * @type {Map<string,DeleteSet>}
     */
const n=new Map;this.yusers=e;this.doc=t;
/**
     * Maps from clientid to userDescription
     *
     * @type {Map<number,string>}
     */this.clients=new Map;this.dss=n;
/**
     * @param {YMap<any>} user
     * @param {string} userDescription
     */const r=(t,e)=>{
/**
       * @type {YArray<Uint8Array>}
       */
const n=t.get("ds");const r=t.get("ids");const s=/** @param {number} clientid */t=>this.clients.set(t,e);n.observe((/** @param {YArrayEvent<any>} event */t=>{t.changes.added.forEach((t=>{t.content.getContent().forEach((t=>{t instanceof Uint8Array&&this.dss.set(e,D([this.dss.get(e)||U(),I(new DSDecoderV1(i.createDecoder(t)))]))}))}))}));this.dss.set(e,D(n.map((t=>I(new DSDecoderV1(i.createDecoder(t)))))));r.observe((/** @param {YArrayEvent<any>} event */t=>t.changes.added.forEach((t=>t.content.getContent().forEach(s)))));r.forEach(s)};e.observe((t=>{t.keysChanged.forEach((t=>r(e.get(t),t)))}));e.forEach(r)}
/**
   * @param {Doc} doc
   * @param {number} clientid
   * @param {string} userDescription
   * @param {Object} conf
   * @param {function(Transaction, DeleteSet):boolean} [conf.filter]
   */setUserMapping(t,e,n,{filter:r=()=>true}={}){const s=this.yusers;let i=s.get(n);if(!i){i=new YMap;i.set("ids",new YArray);i.set("ds",new YArray);s.set(n,i)}i.get("ids").push([e]);s.observe((t=>{setTimeout((()=>{const t=s.get(n);if(t!==i){i=t;this.clients.forEach(((t,e)=>{n===t&&i.get("ids").push([e])}));const e=new DSEncoderV1;const r=this.dss.get(n);if(r){A(e,r);i.get("ds").push([e.toUint8Array()])}}}),0)}));t.on("afterTransaction",(/** @param {Transaction} transaction */t=>{setTimeout((()=>{const e=i.get("ds");const n=t.deleteSet;if(t.local&&n.clients.size>0&&r(t,n)){const t=new DSEncoderV1;A(t,n);e.push([t.toUint8Array()])}}))}))}
/**
   * @param {number} clientid
   * @return {any}
   */getUserByClientId(t){return this.clients.get(t)||null}
/**
   * @param {ID} id
   * @return {string | null}
   */getUserByDeletedId(t){for(const[e,n]of this.dss.entries())if(_(n,t))return e;return null}}class RelativePosition{
/**
   * @param {ID|null} type
   * @param {string|null} tname
   * @param {ID|null} item
   * @param {number} assoc
   */
constructor(t,e,n,r=0){
/**
     * @type {ID|null}
     */
this.type=t;
/**
     * @type {string|null}
     */this.tname=e;
/**
     * @type {ID | null}
     */this.item=n;
/**
     * A relative position is associated to a specific character. By default
     * assoc >= 0, the relative position is associated to the character
     * after the meant position.
     * I.e. position 1 in 'ab' is associated to character 'b'.
     *
     * If assoc < 0, then the relative position is associated to the character
     * before the meant position.
     *
     * @type {number}
     */this.assoc=r}}
/**
 * @param {RelativePosition} rpos
 * @return {any}
 */const lt=t=>{const e={};t.type&&(e.type=t.type);t.tname&&(e.tname=t.tname);t.item&&(e.item=t.item);t.assoc!=null&&(e.assoc=t.assoc);return e};
/**
 * @param {any} json
 * @return {RelativePosition}
 *
 * @function
 */const at=t=>new RelativePosition(t.type==null?null:nt(t.type.client,t.type.clock),t.tname??null,t.item==null?null:nt(t.item.client,t.item.clock),t.assoc==null?0:t.assoc);class AbsolutePosition{
/**
   * @param {AbstractType<any>} type
   * @param {number} index
   * @param {number} [assoc]
   */
constructor(t,e,n=0){
/**
     * @type {AbstractType<any>}
     */
this.type=t;
/**
     * @type {number}
     */this.index=e;this.assoc=n}}
/**
 * @param {AbstractType<any>} type
 * @param {number} index
 * @param {number} [assoc]
 *
 * @function
 */const dt=(t,e,n=0)=>new AbsolutePosition(t,e,n)
/**
 * @param {AbstractType<any>} type
 * @param {ID|null} item
 * @param {number} [assoc]
 *
 * @function
 */;const ht=(t,e,n)=>{let r=null;let s=null;t._item===null?s=it(t):r=nt(t._item.id.client,t._item.id.clock);return new RelativePosition(r,s,e,n)};
/**
 * Create a relativePosition based on a absolute position.
 *
 * @param {AbstractType<any>} type The base type (e.g. YText or YArray).
 * @param {number} index The absolute position.
 * @param {number} [assoc]
 * @return {RelativePosition}
 *
 * @function
 */const ut=(t,e,n=0)=>{let r=t._start;if(n<0){if(e===0)return ht(t,null,n);e--}while(r!==null){if(!r.deleted&&r.countable){if(r.length>e)return ht(t,nt(r.id.client,r.id.clock+e),n);e-=r.length}if(r.right===null&&n<0)return ht(t,r.lastId,n);r=r.right}return ht(t,null,n)};
/**
 * @param {encoding.Encoder} encoder
 * @param {RelativePosition} rpos
 *
 * @function
 */const gt=(t,e)=>{const{type:n,tname:r,item:i,assoc:o}=e;if(i!==null){s.writeVarUint(t,0);rt(t,i)}else if(r!==null){s.writeUint8(t,1);s.writeVarString(t,r)}else{if(n===null)throw a.unexpectedCase();s.writeUint8(t,2);rt(t,n)}s.writeVarInt(t,o);return t};
/**
 * @param {RelativePosition} rpos
 * @return {Uint8Array}
 */const ft=t=>{const e=s.createEncoder();gt(e,t);return s.toUint8Array(e)};
/**
 * @param {decoding.Decoder} decoder
 * @return {RelativePosition}
 *
 * @function
 */const pt=t=>{let e=null;let n=null;let r=null;switch(i.readVarUint(t)){case 0:r=st(t);break;case 1:n=i.readVarString(t);break;case 2:e=st(t)}const s=i.hasContent(t)?i.readVarInt(t):0;return new RelativePosition(e,n,r,s)};
/**
 * @param {Uint8Array} uint8Array
 * @return {RelativePosition}
 */const wt=t=>pt(i.createDecoder(t))
/**
 * @param {StructStore} store
 * @param {ID} id
 */;const mt=(t,e)=>{const n=Nt(t,e);const r=e.clock-n.id.clock;return{item:n,diff:r}};
/**
 * Transform a relative position to an absolute position.
 *
 * If you want to share the relative position with other users, you should set
 * `followUndoneDeletions` to false to get consistent results across all clients.
 *
 * When calculating the absolute position, we try to follow the "undone deletions". This yields
 * better results for the user who performed undo. However, only the user who performed the undo
 * will get the better results, the other users don't know which operations recreated a deleted
 * range of content. There is more information in this ticket: https://github.com/yjs/yjs/issues/638
 *
 * @param {RelativePosition} rpos
 * @param {Doc} doc
 * @param {boolean} followUndoneDeletions - whether to follow undone deletions - see https://github.com/yjs/yjs/issues/638
 * @return {AbsolutePosition|null}
 *
 * @function
 */const yt=(t,e,n=true)=>{const r=e.store;const s=t.item;const i=t.type;const o=t.tname;const c=t.assoc;let l=null;let d=0;if(s!==null){if(Lt(r,s.client)<=s.clock)return null;const t=n?Pn(r,s):mt(r,s);const e=t.item;if(!(e instanceof Item))return null;l=/** @type {AbstractType<any>} */e.parent;if(l._item===null||!l._item.deleted){d=e.deleted||!e.countable?0:t.diff+(c>=0?0:1);let n=e.left;while(n!==null){!n.deleted&&n.countable&&(d+=n.length);n=n.left}}}else{if(o!==null)l=e.get(o);else{if(i===null)throw a.unexpectedCase();{if(Lt(r,i.client)<=i.clock)return null;const{item:t}=n?Pn(r,i):{item:Nt(r,i)};if(!(t instanceof Item&&t.content instanceof ContentType))return null;l=t.content.type}}d=c>=0?l._length:0}return dt(l,d,t.assoc)};
/**
 * @param {RelativePosition|null} a
 * @param {RelativePosition|null} b
 * @return {boolean}
 *
 * @function
 */const kt=(t,e)=>t===e||t!==null&&e!==null&&t.tname===e.tname&&et(t.item,e.item)&&et(t.type,e.type)&&t.assoc===e.assoc;class Snapshot{
/**
   * @param {DeleteSet} ds
   * @param {Map<number,number>} sv state map
   */
constructor(t,e){
/**
     * @type {DeleteSet}
     */
this.ds=t;
/**
     * State Map
     * @type {Map<number,number>}
     */this.sv=e}}
/**
 * @param {Snapshot} snap1
 * @param {Snapshot} snap2
 * @return {boolean}
 */const bt=(t,e)=>{const n=t.ds.clients;const r=e.ds.clients;const s=t.sv;const i=e.sv;if(s.size!==i.size||n.size!==r.size)return false;for(const[t,e]of s.entries())if(i.get(t)!==e)return false;for(const[t,e]of n.entries()){const n=r.get(t)||[];if(e.length!==n.length)return false;for(let t=0;t<e.length;t++){const r=e[t];const s=n[t];if(r.clock!==s.clock||r.len!==s.len)return false}}return true};
/**
 * @param {Snapshot} snapshot
 * @param {DSEncoderV1 | DSEncoderV2} [encoder]
 * @return {Uint8Array}
 */const St=(t,e=new DSEncoderV2)=>{A(e,t.ds);G(e,t.sv);return e.toUint8Array()};
/**
 * @param {Snapshot} snapshot
 * @return {Uint8Array}
 */const _t=t=>St(t,new DSEncoderV1)
/**
 * @param {Uint8Array} buf
 * @param {DSDecoderV1 | DSDecoderV2} [decoder]
 * @return {Snapshot}
 */;const Ct=(t,e=new DSDecoderV2(i.createDecoder(t)))=>new Snapshot(I(e),W(e));
/**
 * @param {Uint8Array} buf
 * @return {Snapshot}
 */const Dt=t=>Ct(t,new DSDecoderV1(i.createDecoder(t)))
/**
 * @param {DeleteSet} ds
 * @param {Map<number,number>} sm
 * @return {Snapshot}
 */;const Et=(t,e)=>new Snapshot(t,e);const Ut=Et(U(),new Map);
/**
 * @param {Doc} doc
 * @return {Snapshot}
 */const Vt=t=>Et(V(t.store),Mt(t.store))
/**
 * @param {Item} item
 * @param {Snapshot|undefined} snapshot
 *
 * @protected
 * @function
 */;const At=(t,e)=>e===void 0?!t.deleted:e.sv.has(t.id.client)&&(e.sv.get(t.id.client)||0)>t.id.clock&&!_(e.ds,t.id)
/**
 * @param {Transaction} transaction
 * @param {Snapshot} snapshot
 */;const It=(t,e)=>{const n=r.setIfUndefined(t.meta,It,g.create);const s=t.doc.store;if(!n.has(e)){e.sv.forEach(((e,n)=>{e<Lt(s,n)&&Ft(t,nt(n,e))}));b(t,e.ds,(t=>{}));n.add(e)}};
/**
 * @example
 *  const ydoc = new Y.Doc({ gc: false })
 *  ydoc.getText().insert(0, 'world!')
 *  const snapshot = Y.snapshot(ydoc)
 *  ydoc.getText().insert(0, 'hello ')
 *  const restored = Y.createDocFromSnapshot(ydoc, snapshot)
 *  assert(restored.getText().toString() === 'world!')
 *
 * @param {Doc} originDoc
 * @param {Snapshot} snapshot
 * @param {Doc} [newDoc] Optionally, you may define the Yjs document that receives the data from originDoc
 * @return {Doc}
 */const Tt=(t,e,n=new Doc)=>{if(t.gc)throw new Error("Garbage-collection must be disabled in `originDoc`!");const{sv:r,ds:i}=e;const o=new UpdateEncoderV2;t.transact((e=>{let n=0;r.forEach((t=>{t>0&&n++}));s.writeVarUint(o.restEncoder,n);for(const[n,i]of r){if(i===0)continue;i<Lt(t.store,n)&&Ft(e,nt(n,i));const r=t.store.clients.get(n)||[];const c=Yt(r,i-1);s.writeVarUint(o.restEncoder,c+1);o.writeClient(n);s.writeVarUint(o.restEncoder,0);for(let t=0;t<=c;t++)r[t].write(o,0)}A(o,i)}));F(n,o.toUint8Array(),"snapshot");return n};
/**
 * @param {Snapshot} snapshot
 * @param {Uint8Array} update
 * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
 */const vt=(t,e,n=UpdateDecoderV2)=>{const r=new n(i.createDecoder(e));const s=new LazyStructReader(r,false);for(let e=s.curr;e!==null;e=s.next())if((t.sv.get(e.id.client)||0)<e.id.clock+e.length)return false;const o=D([t.ds,I(r)]);return v(t.ds,o)};
/**
 * @param {Snapshot} snapshot
 * @param {Uint8Array} update
 */const xt=(t,e)=>vt(t,e,UpdateDecoderV1);class StructStore{constructor(){
/**
     * @type {Map<number,Array<GC|Item>>}
     */
this.clients=new Map;
/**
     * @type {null | { missing: Map<number, number>, update: Uint8Array }}
     */this.pendingStructs=null;
/**
     * @type {null | Uint8Array}
     */this.pendingDs=null}}
/**
 * Return the states as a Map<client,clock>.
 * Note that clock refers to the next expected clock id.
 *
 * @param {StructStore} store
 * @return {Map<number,number>}
 *
 * @public
 * @function
 */const Mt=t=>{const e=new Map;t.clients.forEach(((t,n)=>{const r=t[t.length-1];e.set(n,r.id.clock+r.length)}));return e};
/**
 * @param {StructStore} store
 * @param {number} client
 * @return {number}
 *
 * @public
 * @function
 */const Lt=(t,e)=>{const n=t.clients.get(e);if(n===void 0)return 0;const r=n[n.length-1];return r.id.clock+r.length};
/**
 * @param {StructStore} store
 * @param {GC|Item} struct
 *
 * @private
 * @function
 */const Ot=(t,e)=>{let n=t.clients.get(e.id.client);if(n===void 0){n=[];t.clients.set(e.id.client,n)}else{const t=n[n.length-1];if(t.id.clock+t.length!==e.id.clock)throw a.unexpectedCase()}n.push(e)};
/**
 * Perform a binary search on a sorted array
 * @param {Array<Item|GC>} structs
 * @param {number} clock
 * @return {number}
 *
 * @private
 * @function
 */const Yt=(t,e)=>{let r=0;let s=t.length-1;let i=t[s];let o=i.id.clock;if(o===e)return s;let c=n.floor(e/(o+i.length-1)*s);while(r<=s){i=t[c];o=i.id.clock;if(o<=e){if(e<o+i.length)return c;r=c+1}else s=c-1;c=n.floor((r+s)/2)}throw a.unexpectedCase()};
/**
 * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
 *
 * @param {StructStore} store
 * @param {ID} id
 * @return {GC|Item}
 *
 * @private
 * @function
 */const Rt=(t,e)=>{
/**
   * @type {Array<GC|Item>}
   */
const n=t.clients.get(e.client);return n[Yt(n,e.clock)]};const Nt=/** @type {function(StructStore,ID):Item} */Rt;
/**
 * @param {Transaction} transaction
 * @param {Array<Item|GC>} structs
 * @param {number} clock
 */const Bt=(t,e,n)=>{const r=Yt(e,n);const s=e[r];if(s.id.clock<n&&s instanceof Item){e.splice(r+1,0,Wn(t,s,n-s.id.clock));return r+1}return r};
/**
 * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
 *
 * @param {Transaction} transaction
 * @param {ID} id
 * @return {Item}
 *
 * @private
 * @function
 */const Ft=(t,e)=>{const n=/** @type {Array<Item>} */t.doc.store.clients.get(e.client);return n[Bt(t,n,e.clock)]};
/**
 * Expects that id is actually in store. This function throws or is an infinite loop otherwise.
 *
 * @param {Transaction} transaction
 * @param {StructStore} store
 * @param {ID} id
 * @return {Item}
 *
 * @private
 * @function
 */const Xt=(t,e,n)=>{
/**
   * @type {Array<Item>}
   */
const r=e.clients.get(n.client);const s=Yt(r,n.clock);const i=r[s];n.clock!==i.id.clock+i.length-1&&i.constructor!==GC&&r.splice(s+1,0,Wn(t,i,n.clock-i.id.clock+1));return i};
/**
 * Replace `item` with `newitem` in store
 * @param {StructStore} store
 * @param {GC|Item} struct
 * @param {GC|Item} newStruct
 *
 * @private
 * @function
 */const zt=(t,e,n)=>{const r=/** @type {Array<GC|Item>} */t.clients.get(e.id.client);r[Yt(r,e.id.clock)]=n};
/**
 * Iterate over a range of structs
 *
 * @param {Transaction} transaction
 * @param {Array<Item|GC>} structs
 * @param {number} clockStart Inclusive start
 * @param {number} len
 * @param {function(GC|Item):void} f
 *
 * @function
 */const Pt=(t,e,n,r,s)=>{if(r===0)return;const i=n+r;let o=Bt(t,e,n);let c;do{c=e[o++];i<c.id.clock+c.length&&Bt(t,e,i);s(c)}while(o<e.length&&e[o].id.clock<i)};class Transaction{
/**
   * @param {Doc} doc
   * @param {any} origin
   * @param {boolean} local
   */
constructor(t,e,n){
/**
     * The Yjs instance.
     * @type {Doc}
     */
this.doc=t;
/**
     * Describes the set of deleted items by ids
     * @type {DeleteSet}
     */this.deleteSet=new DeleteSet;
/**
     * Holds the state before the transaction started.
     * @type {Map<Number,Number>}
     */this.beforeState=Mt(t.store);
/**
     * Holds the state after the transaction.
     * @type {Map<Number,Number>}
     */this.afterState=new Map;
/**
     * All types that were directly modified (property added or child
     * inserted/deleted). New types are not included in this Set.
     * Maps from type to parentSubs (`item.parentSub = null` for YArray)
     * @type {Map<AbstractType<YEvent<any>>,Set<String|null>>}
     */this.changed=new Map;
/**
     * Stores the events for the types that observe also child elements.
     * It is mainly used by `observeDeep`.
     * @type {Map<AbstractType<YEvent<any>>,Array<YEvent<any>>>}
     */this.changedParentTypes=new Map;
/**
     * @type {Array<AbstractStruct>}
     */this._mergeStructs=[];
/**
     * @type {any}
     */this.origin=e;
/**
     * Stores meta information on the transaction
     * @type {Map<any,any>}
     */this.meta=new Map;
/**
     * Whether this change originates from this doc.
     * @type {boolean}
     */this.local=n;
/**
     * @type {Set<Doc>}
     */this.subdocsAdded=new Set;
/**
     * @type {Set<Doc>}
     */this.subdocsRemoved=new Set;
/**
     * @type {Set<Doc>}
     */this.subdocsLoaded=new Set;
/**
     * @type {boolean}
     */this._needFormattingCleanup=false}}
/**
 * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
 * @param {Transaction} transaction
 * @return {boolean} Whether data was written.
 */const Jt=(t,e)=>{if(e.deleteSet.clients.size===0&&!r.any(e.afterState,((t,n)=>e.beforeState.get(n)!==t)))return false;C(e.deleteSet);R(t,e);A(t,e.deleteSet);return true};
/**
 * If `type.parent` was added in current transaction, `type` technically
 * did not change, it was just added and we should not fire events for `type`.
 *
 * @param {Transaction} transaction
 * @param {AbstractType<YEvent<any>>} type
 * @param {string|null} parentSub
 */const Wt=(t,e,n)=>{const s=e._item;(s===null||s.id.clock<(t.beforeState.get(s.id.client)||0)&&!s.deleted)&&r.setIfUndefined(t.changed,e,g.create).add(n)};
/**
 * @param {Array<AbstractStruct>} structs
 * @param {number} pos
 * @return {number} # of merged structs
 */const Ht=(t,e)=>{let n=t[e];let r=t[e-1];let s=e;for(;s>0;n=r,r=t[--s-1]){if(r.deleted!==n.deleted||r.constructor!==n.constructor||!r.mergeWith(n))break;n instanceof Item&&n.parentSub!==null&&/** @type {AbstractType<any>} */n.parent._map.get(n.parentSub)===n&&
/** @type {AbstractType<any>} */n.parent._map.set(n.parentSub,/** @type {Item} */r)}const i=e-s;i&&t.splice(e+1-i,i);return i};
/**
 * @param {DeleteSet} ds
 * @param {StructStore} store
 * @param {function(Item):boolean} gcFilter
 */const Gt=(t,e,n)=>{for(const[r,s]of t.clients.entries()){const t=/** @type {Array<GC|Item>} */e.clients.get(r);for(let r=s.length-1;r>=0;r--){const i=s[r];const o=i.clock+i.len;for(let r=Yt(t,i.clock),s=t[r];r<t.length&&s.id.clock<o;s=t[++r]){const s=t[r];if(i.clock+i.len<=s.id.clock)break;s instanceof Item&&s.deleted&&!s.keep&&n(s)&&s.gc(e,false)}}}};
/**
 * @param {DeleteSet} ds
 * @param {StructStore} store
 */const jt=(t,e)=>{t.clients.forEach(((t,r)=>{const s=/** @type {Array<GC|Item>} */e.clients.get(r);for(let e=t.length-1;e>=0;e--){const r=t[e];const i=n.min(s.length-1,1+Yt(s,r.clock+r.len-1));for(let t=i,e=s[t];t>0&&e.id.clock>=r.clock;e=s[t])t-=1+Ht(s,t)}}))};
/**
 * @param {DeleteSet} ds
 * @param {StructStore} store
 * @param {function(Item):boolean} gcFilter
 */const $t=(t,e,n)=>{Gt(t,e,n);jt(t,e)};
/**
 * @param {Array<Transaction>} transactionCleanups
 * @param {number} i
 */const Kt=(t,e)=>{if(e<t.length){const r=t[e];const s=r.doc;const i=s.store;const o=r.deleteSet;const c=r._mergeStructs;try{C(o);r.afterState=Mt(r.doc.store);s.emit("beforeObserverCalls",[r,s]);
/**
       * An array of event callbacks.
       *
       * Each callback is called even if the other ones throw errors.
       *
       * @type {Array<function():void>}
       */const t=[];r.changed.forEach(((e,n)=>t.push((()=>{n._item!==null&&n._item.deleted||n._callObserver(r,e)}))));t.push((()=>{r.changedParentTypes.forEach(((t,e)=>{if(e._dEH.l.length>0&&(e._item===null||!e._item.deleted)){t=t.filter((t=>t.target._item===null||!t.target._item.deleted));t.forEach((t=>{t.currentTarget=e;t._path=null}));t.sort(((t,e)=>t.path.length-e.path.length));tt(e._dEH,t,r)}}))}));t.push((()=>s.emit("afterTransaction",[r,s])));u(t,[]);r._needFormattingCleanup&&wn(r)}finally{s.gc&&Gt(o,i,s.gcFilter);jt(o,i);r.afterState.forEach(((t,e)=>{const s=r.beforeState.get(e)||0;if(s!==t){const t=/** @type {Array<GC|Item>} */i.clients.get(e);const r=n.max(Yt(t,s),1);for(let e=t.length-1;e>=r;)e-=1+Ht(t,e)}}));for(let t=c.length-1;t>=0;t--){const{client:e,clock:n}=c[t].id;const r=/** @type {Array<GC|Item>} */i.clients.get(e);const s=Yt(r,n);s+1<r.length&&Ht(r,s+1)>1||s>0&&Ht(r,s)}if(!r.local&&r.afterState.get(s.clientID)!==r.beforeState.get(s.clientID)){f.print(f.ORANGE,f.BOLD,"[yjs] ",f.UNBOLD,f.RED,"Changed the client-id because another client seems to be using it.");s.clientID=x()}s.emit("afterTransactionCleanup",[r,s]);if(s._observers.has("update")){const t=new UpdateEncoderV1;const e=Jt(t,r);e&&s.emit("update",[t.toUint8Array(),r.origin,s,r])}if(s._observers.has("updateV2")){const t=new UpdateEncoderV2;const e=Jt(t,r);e&&s.emit("updateV2",[t.toUint8Array(),r.origin,s,r])}const{subdocsAdded:l,subdocsLoaded:a,subdocsRemoved:d}=r;if(l.size>0||d.size>0||a.size>0){l.forEach((t=>{t.clientID=s.clientID;t.collectionid==null&&(t.collectionid=s.collectionid);s.subdocs.add(t)}));d.forEach((t=>s.subdocs.delete(t)));s.emit("subdocs",[{loaded:a,added:l,removed:d},s,r]);d.forEach((t=>t.destroy()))}if(t.length<=e+1){s._transactionCleanups=[];s.emit("afterAllTransactions",[s,t])}else Kt(t,e+1)}}};
/**
 * Implements the functionality of `y.transact(()=>{..})`
 *
 * @template T
 * @param {Doc} doc
 * @param {function(Transaction):T} f
 * @param {any} [origin=true]
 * @return {T}
 *
 * @function
 */const qt=(t,e,n=null,r=true)=>{const s=t._transactionCleanups;let i=false;
/**
   * @type {any}
   */let o=null;if(t._transaction===null){i=true;t._transaction=new Transaction(t,n,r);s.push(t._transaction);s.length===1&&t.emit("beforeAllTransactions",[t]);t.emit("beforeTransaction",[t._transaction,t])}try{o=e(t._transaction)}finally{if(i){const e=t._transaction===s[0];t._transaction=null;e&&Kt(s,0)}}return o};class StackItem{
/**
   * @param {DeleteSet} deletions
   * @param {DeleteSet} insertions
   */
constructor(t,e){this.insertions=e;this.deletions=t;this.meta=new Map}}
/**
 * @param {Transaction} tr
 * @param {UndoManager} um
 * @param {StackItem} stackItem
 */const Qt=(t,e,n)=>{b(t,n.deletions,(n=>{n instanceof Item&&e.scope.some((e=>e===t.doc||ot(/** @type {AbstractType<any>} */e,n)))&&Jn(n,false)}))};
/**
 * @param {UndoManager} undoManager
 * @param {Array<StackItem>} stack
 * @param {'undo'|'redo'} eventType
 * @return {StackItem?}
 */const Zt=(t,e,n)=>{
/**
   * Keep a reference to the transaction so we can fire the event with the changedParentTypes
   * @type {any}
   */
let r=null;const s=t.doc;const i=t.scope;qt(s,(n=>{while(e.length>0&&t.currStackItem===null){const r=s.store;const o=/** @type {StackItem} */e.pop();
/**
       * @type {Set<Item>}
       */const c=new Set;
/**
       * @type {Array<Item>}
       */const l=[];let a=false;b(n,o.insertions,(t=>{if(t instanceof Item){if(t.redone!==null){let{item:e,diff:s}=Pn(r,t.id);s>0&&(e=Ft(n,nt(e.id.client,e.id.clock+s)));t=e}!t.deleted&&i.some((e=>e===n.doc||ot(/** @type {AbstractType<any>} */e,/** @type {Item} */t)))&&l.push(t)}}));b(n,o.deletions,(t=>{t instanceof Item&&i.some((e=>e===n.doc||ot(/** @type {AbstractType<any>} */e,t)))&&!_(o.insertions,t.id)&&c.add(t)}));c.forEach((e=>{a=Gn(n,e,c,o.insertions,t.ignoreRemoteMapChanges,t)!==null||a}));for(let e=l.length-1;e>=0;e--){const r=l[e];if(t.deleteFilter(r)){r.delete(n);a=true}}t.currStackItem=a?o:null}n.changed.forEach(((t,e)=>{t.has(null)&&e._searchMarker&&(e._searchMarker.length=0)}));r=n}),t);const o=t.currStackItem;if(o!=null){const e=r.changedParentTypes;t.emit("stack-item-popped",[{stackItem:o,type:n,changedParentTypes:e,origin:t},t]);t.currStackItem=null}return o};
/**
 * @typedef {Object} UndoManagerOptions
 * @property {number} [UndoManagerOptions.captureTimeout=500]
 * @property {function(Transaction):boolean} [UndoManagerOptions.captureTransaction] Do not capture changes of a Transaction if result false.
 * @property {function(Item):boolean} [UndoManagerOptions.deleteFilter=()=>true] Sometimes
 * it is necessary to filter what an Undo/Redo operation can delete. If this
 * filter returns false, the type/item won't be deleted even it is in the
 * undo/redo scope.
 * @property {Set<any>} [UndoManagerOptions.trackedOrigins=new Set([null])]
 * @property {boolean} [ignoreRemoteMapChanges] Experimental. By default, the UndoManager will never overwrite remote changes. Enable this property to enable overwriting remote changes on key-value changes (Y.Map, properties on Y.Xml, etc..).
 * @property {Doc} [doc] The document that this UndoManager operates on. Only needed if typeScope is empty.
 */
/**
 * @typedef {Object} StackItemEvent
 * @property {StackItem} StackItemEvent.stackItem
 * @property {any} StackItemEvent.origin
 * @property {'undo'|'redo'} StackItemEvent.type
 * @property {Map<AbstractType<YEvent<any>>,Array<YEvent<any>>>} StackItemEvent.changedParentTypes
 */class UndoManager extends t{
/**
   * @param {Doc|AbstractType<any>|Array<AbstractType<any>>} typeScope Limits the scope of the UndoManager. If this is set to a ydoc instance, all changes on that ydoc will be undone. If set to a specific type, only changes on that type or its children will be undone. Also accepts an array of types.
   * @param {UndoManagerOptions} options
   */
constructor(t,{captureTimeout:n=500,captureTransaction:r=t=>true,deleteFilter:s=()=>true,trackedOrigins:i=new Set([null]),ignoreRemoteMapChanges:o=false,doc:c=(/** @type {Doc} */e.isArray(t)?t[0].doc:t instanceof Doc?t:t.doc)}={}){super();
/**
     * @type {Array<AbstractType<any> | Doc>}
     */this.scope=[];this.doc=c;this.addToScope(t);this.deleteFilter=s;i.add(this);this.trackedOrigins=i;this.captureTransaction=r;
/**
     * @type {Array<StackItem>}
     */this.undoStack=[];
/**
     * @type {Array<StackItem>}
     */this.redoStack=[];
/**
     * Whether the client is currently undoing (calling UndoManager.undo)
     *
     * @type {boolean}
     */this.undoing=false;this.redoing=false;
/**
     * The currently popped stack item if UndoManager.undoing or UndoManager.redoing
     *
     * @type {StackItem|null}
     */this.currStackItem=null;this.lastChange=0;this.ignoreRemoteMapChanges=o;this.captureTimeout=n;
/**
     * @param {Transaction} transaction
     */this.afterTransactionHandler=t=>{if(!this.captureTransaction(t)||!this.scope.some((e=>t.changedParentTypes.has(/** @type {AbstractType<any>} */e)||e===this.doc))||!this.trackedOrigins.has(t.origin)&&(!t.origin||!this.trackedOrigins.has(t.origin.constructor)))return;const e=this.undoing;const n=this.redoing;const r=e?this.redoStack:this.undoStack;e?this.stopCapturing():n||this.clear(false,true);const s=new DeleteSet;t.afterState.forEach(((e,n)=>{const r=t.beforeState.get(n)||0;const i=e-r;i>0&&E(s,n,r,i)}));const i=p.getUnixTime();let o=false;if(this.lastChange>0&&i-this.lastChange<this.captureTimeout&&r.length>0&&!e&&!n){const e=r[r.length-1];e.deletions=D([e.deletions,t.deleteSet]);e.insertions=D([e.insertions,s])}else{r.push(new StackItem(t.deleteSet,s));o=true}e||n||(this.lastChange=i);b(t,t.deleteSet,(/** @param {Item|GC} item */e=>{e instanceof Item&&this.scope.some((n=>n===t.doc||ot(/** @type {AbstractType<any>} */n,e)))&&Jn(e,true)}));
/**
       * @type {[StackItemEvent, UndoManager]}
       */const c=[{stackItem:r[r.length-1],origin:t.origin,type:e?"redo":"undo",changedParentTypes:t.changedParentTypes},this];o?this.emit("stack-item-added",c):this.emit("stack-item-updated",c)};this.doc.on("afterTransaction",this.afterTransactionHandler);this.doc.on("destroy",(()=>{this.destroy()}))}
/**
   * Extend the scope.
   *
   * @param {Array<AbstractType<any> | Doc> | AbstractType<any> | Doc} ytypes
   */addToScope(t){const n=new Set(this.scope);t=e.isArray(t)?t:[t];t.forEach((t=>{if(!n.has(t)){n.add(t);(t instanceof AbstractType?t.doc!==this.doc:t!==this.doc)&&f.warn("[yjs#509] Not same Y.Doc");this.scope.push(t)}}))}
/**
   * @param {any} origin
   */addTrackedOrigin(t){this.trackedOrigins.add(t)}
/**
   * @param {any} origin
   */removeTrackedOrigin(t){this.trackedOrigins.delete(t)}clear(t=true,e=true){(t&&this.canUndo()||e&&this.canRedo())&&this.doc.transact((n=>{if(t){this.undoStack.forEach((t=>Qt(n,this,t)));this.undoStack=[]}if(e){this.redoStack.forEach((t=>Qt(n,this,t)));this.redoStack=[]}this.emit("stack-cleared",[{undoStackCleared:t,redoStackCleared:e}])}))}stopCapturing(){this.lastChange=0}undo(){this.undoing=true;let t;try{t=Zt(this,this.undoStack,"undo")}finally{this.undoing=false}return t}redo(){this.redoing=true;let t;try{t=Zt(this,this.redoStack,"redo")}finally{this.redoing=false}return t}canUndo(){return this.undoStack.length>0}canRedo(){return this.redoStack.length>0}destroy(){this.trackedOrigins.delete(this);this.doc.off("afterTransaction",this.afterTransactionHandler);super.destroy()}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 */function*te(t){const e=i.readVarUint(t.restDecoder);for(let n=0;n<e;n++){const e=i.readVarUint(t.restDecoder);const n=t.readClient();let r=i.readVarUint(t.restDecoder);for(let s=0;s<e;s++){const e=t.readInfo();if(e===10){const e=i.readVarUint(t.restDecoder);yield new Skip(nt(n,r),e);r+=e}else if((d.BITS5&e)!==0){const s=(e&(d.BIT7|d.BIT8))===0;const i=new Item(nt(n,r),null,(e&d.BIT8)===d.BIT8?t.readLeftID():null,null,(e&d.BIT7)===d.BIT7?t.readRightID():null,s?t.readParentInfo()?t.readString():t.readLeftID():null,s&&(e&d.BIT6)===d.BIT6?t.readString():null,jn(t,e));yield i;r+=i.length}else{const e=t.readLen();yield new GC(nt(n,r),e);r+=e}}}}class LazyStructReader{
/**
   * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
   * @param {boolean} filterSkips
   */
constructor(t,e){this.gen=te(t);
/**
     * @type {null | Item | Skip | GC}
     */this.curr=null;this.done=false;this.filterSkips=e;this.next()}next(){do{this.curr=this.gen.next().value||null}while(this.filterSkips&&this.curr!==null&&this.curr.constructor===Skip);return this.curr}}
/**
 * @param {Uint8Array} update
 *
 */const ee=t=>ne(t,UpdateDecoderV1)
/**
 * @param {Uint8Array} update
 * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
 *
 */;const ne=(t,e=UpdateDecoderV2)=>{const n=[];const r=new e(i.createDecoder(t));const s=new LazyStructReader(r,false);for(let t=s.curr;t!==null;t=s.next())n.push(t);f.print("Structs: ",n);const o=I(r);f.print("DeleteSet: ",o)};
/**
 * @param {Uint8Array} update
 *
 */const re=t=>se(t,UpdateDecoderV1)
/**
 * @param {Uint8Array} update
 * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} [YDecoder]
 *
 */;const se=(t,e=UpdateDecoderV2)=>{const n=[];const r=new e(i.createDecoder(t));const s=new LazyStructReader(r,false);for(let t=s.curr;t!==null;t=s.next())n.push(t);return{structs:n,ds:I(r)}};class LazyStructWriter{
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */
constructor(t){this.currClient=0;this.startClock=0;this.written=0;this.encoder=t;
/**
     * We want to write operations lazily, but also we need to know beforehand how many operations we want to write for each client.
     *
     * This kind of meta-information (#clients, #structs-per-client-written) is written to the restEncoder.
     *
     * We fragment the restEncoder and store a slice of it per-client until we know how many clients there are.
     * When we flush (toUint8Array) we write the restEncoder using the fragments and the meta-information.
     *
     * @type {Array<{ written: number, restEncoder: Uint8Array }>}
     */this.clientStructs=[]}}
/**
 * @param {Array<Uint8Array>} updates
 * @return {Uint8Array}
 */const ie=t=>he(t,UpdateDecoderV1,UpdateEncoderV1)
/**
 * @param {Uint8Array} update
 * @param {typeof DSEncoderV1 | typeof DSEncoderV2} YEncoder
 * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
 * @return {Uint8Array}
 */;const oe=(t,e=DSEncoderV2,n=UpdateDecoderV2)=>{const r=new e;const o=new LazyStructReader(new n(i.createDecoder(t)),false);let c=o.curr;if(c!==null){let t=0;let e=c.id.client;let n=c.id.clock!==0;let i=n?0:c.id.clock+c.length;for(;c!==null;c=o.next()){if(e!==c.id.client){if(i!==0){t++;s.writeVarUint(r.restEncoder,e);s.writeVarUint(r.restEncoder,i)}e=c.id.client;i=0;n=c.id.clock!==0}c.constructor===Skip&&(n=true);n||(i=c.id.clock+c.length)}if(i!==0){t++;s.writeVarUint(r.restEncoder,e);s.writeVarUint(r.restEncoder,i)}const l=s.createEncoder();s.writeVarUint(l,t);s.writeBinaryEncoder(l,r.restEncoder);r.restEncoder=l;return r.toUint8Array()}s.writeVarUint(r.restEncoder,0);return r.toUint8Array()};
/**
 * @param {Uint8Array} update
 * @return {Uint8Array}
 */const ce=t=>oe(t,DSEncoderV1,UpdateDecoderV1)
/**
 * @param {Uint8Array} update
 * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} YDecoder
 * @return {{ from: Map<number,number>, to: Map<number,number> }}
 */;const le=(t,e=UpdateDecoderV2)=>{
/**
   * @type {Map<number, number>}
   */
const n=new Map;
/**
   * @type {Map<number, number>}
   */const r=new Map;const s=new LazyStructReader(new e(i.createDecoder(t)),false);let o=s.curr;if(o!==null){let t=o.id.client;let e=o.id.clock;n.set(t,e);for(;o!==null;o=s.next()){if(t!==o.id.client){r.set(t,e);n.set(o.id.client,o.id.clock);t=o.id.client}e=o.id.clock+o.length}r.set(t,e)}return{from:n,to:r}};
/**
 * @param {Uint8Array} update
 * @return {{ from: Map<number,number>, to: Map<number,number> }}
 */const ae=t=>le(t,UpdateDecoderV1)
/**
 * This method is intended to slice any kind of struct and retrieve the right part.
 * It does not handle side-effects, so it should only be used by the lazy-encoder.
 *
 * @param {Item | GC | Skip} left
 * @param {number} diff
 * @return {Item | GC}
 */;const de=(t,e)=>{if(t.constructor===GC){const{client:n,clock:r}=t.id;return new GC(nt(n,r+e),t.length-e)}if(t.constructor===Skip){const{client:n,clock:r}=t.id;return new Skip(nt(n,r+e),t.length-e)}{const n=/** @type {Item} */t;const{client:r,clock:s}=n.id;return new Item(nt(r,s+e),null,nt(r,s+e-1),null,n.rightOrigin,n.parent,n.parentSub,n.content.splice(e))}};
/**
 *
 * This function works similarly to `readUpdateV2`.
 *
 * @param {Array<Uint8Array>} updates
 * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
 * @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
 * @return {Uint8Array}
 */const he=(t,e=UpdateDecoderV2,n=UpdateEncoderV2)=>{if(t.length===1)return t[0];const r=t.map((t=>new e(i.createDecoder(t))));let s=r.map((t=>new LazyStructReader(t,true)));
/**
   * @todo we don't need offset because we always slice before
   * @type {null | { struct: Item | GC | Skip, offset: number }}
   */let o=null;const c=new n;const l=new LazyStructWriter(c);while(true){s=s.filter((t=>t.curr!==null));s.sort((
/** @type {function(any,any):number} */(t,e)=>{if(t.curr.id.client===e.curr.id.client){const n=t.curr.id.clock-e.curr.id.clock;return n===0?t.curr.constructor===e.curr.constructor?0:t.curr.constructor===Skip?1:-1:n}return e.curr.id.client-t.curr.id.client}));if(s.length===0)break;const t=s[0];const e=/** @type {Item | GC} */t.curr.id.client;if(o!==null){let n=/** @type {Item | GC | null} */t.curr;let r=false;while(n!==null&&n.id.clock+n.length<=o.struct.id.clock+o.struct.length&&n.id.client>=o.struct.id.client){n=t.next();r=true}if(n===null||n.id.client!==e||r&&n.id.clock>o.struct.id.clock+o.struct.length)continue;if(e!==o.struct.id.client){pe(l,o.struct,o.offset);o={struct:n,offset:0};t.next()}else if(o.struct.id.clock+o.struct.length<n.id.clock)if(o.struct.constructor===Skip)o.struct.length=n.id.clock+n.length-o.struct.id.clock;else{pe(l,o.struct,o.offset);const t=n.id.clock-o.struct.id.clock-o.struct.length;
/**
             * @type {Skip}
             */const r=new Skip(nt(e,o.struct.id.clock+o.struct.length),t);o={struct:r,offset:0}}else{const e=o.struct.id.clock+o.struct.length-n.id.clock;e>0&&(o.struct.constructor===Skip?o.struct.length-=e:n=de(n,e));if(!o.struct.mergeWith(/** @type {any} */n)){pe(l,o.struct,o.offset);o={struct:n,offset:0};t.next()}}}else{o={struct:/** @type {Item | GC} */t.curr,offset:0};t.next()}for(let n=t.curr;n!==null&&n.id.client===e&&n.id.clock===o.struct.id.clock+o.struct.length&&n.constructor!==Skip;n=t.next()){pe(l,o.struct,o.offset);o={struct:n,offset:0}}}if(o!==null){pe(l,o.struct,o.offset);o=null}we(l);const a=r.map((t=>I(t)));const d=D(a);A(c,d);return c.toUint8Array()};
/**
 * @param {Uint8Array} update
 * @param {Uint8Array} sv
 * @param {typeof UpdateDecoderV1 | typeof UpdateDecoderV2} [YDecoder]
 * @param {typeof UpdateEncoderV1 | typeof UpdateEncoderV2} [YEncoder]
 */const ue=(t,e,r=UpdateDecoderV2,s=UpdateEncoderV2)=>{const o=H(e);const c=new s;const l=new LazyStructWriter(c);const a=new r(i.createDecoder(t));const d=new LazyStructReader(a,false);while(d.curr){const t=d.curr;const e=t.id.client;const r=o.get(e)||0;if(d.curr.constructor!==Skip)if(t.id.clock+t.length>r){pe(l,t,n.max(r-t.id.clock,0));d.next();while(d.curr&&d.curr.id.client===e){pe(l,d.curr,0);d.next()}}else while(d.curr&&d.curr.id.client===e&&d.curr.id.clock+d.curr.length<=r)d.next();else d.next()}we(l);const h=I(a);A(c,h);return c.toUint8Array()};
/**
 * @param {Uint8Array} update
 * @param {Uint8Array} sv
 */const ge=(t,e)=>ue(t,e,UpdateDecoderV1,UpdateEncoderV1)
/**
 * @param {LazyStructWriter} lazyWriter
 */;const fe=t=>{if(t.written>0){t.clientStructs.push({written:t.written,restEncoder:s.toUint8Array(t.encoder.restEncoder)});t.encoder.restEncoder=s.createEncoder();t.written=0}};
/**
 * @param {LazyStructWriter} lazyWriter
 * @param {Item | GC} struct
 * @param {number} offset
 */const pe=(t,e,n)=>{t.written>0&&t.currClient!==e.id.client&&fe(t);if(t.written===0){t.currClient=e.id.client;t.encoder.writeClient(e.id.client);s.writeVarUint(t.encoder.restEncoder,e.id.clock+n)}e.write(t.encoder,n);t.written++};
/**
 * Call this function when we collected all parts and want to
 * put all the parts together. After calling this method,
 * you can continue using the UpdateEncoder.
 *
 * @param {LazyStructWriter} lazyWriter
 */const we=t=>{fe(t);const e=t.encoder.restEncoder;s.writeVarUint(e,t.clientStructs.length);for(let n=0;n<t.clientStructs.length;n++){const r=t.clientStructs[n];s.writeVarUint(e,r.written);s.writeUint8Array(e,r.restEncoder)}};
/**
 * @param {Uint8Array} update
 * @param {function(Item|GC|Skip):Item|GC|Skip} blockTransformer
 * @param {typeof UpdateDecoderV2 | typeof UpdateDecoderV1} YDecoder
 * @param {typeof UpdateEncoderV2 | typeof UpdateEncoderV1 } YEncoder
 */const me=(t,e,n,r)=>{const s=new n(i.createDecoder(t));const o=new LazyStructReader(s,false);const c=new r;const l=new LazyStructWriter(c);for(let t=o.curr;t!==null;t=o.next())pe(l,e(t),0);we(l);const a=I(s);A(c,a);return c.toUint8Array()};
/**
 * @typedef {Object} ObfuscatorOptions
 * @property {boolean} [ObfuscatorOptions.formatting=true]
 * @property {boolean} [ObfuscatorOptions.subdocs=true]
 * @property {boolean} [ObfuscatorOptions.yxml=true] Whether to obfuscate nodeName / hookName
 */
/**
 * @param {ObfuscatorOptions} obfuscator
 */const ye=({formatting:t=true,subdocs:e=true,yxml:n=true}={})=>{let s=0;const i=r.create();const o=r.create();const c=r.create();const l=r.create();l.set(null,null);
/**
   * @param {Item|GC|Skip} block
   * @return {Item|GC|Skip}
   */return d=>{switch(d.constructor){case GC:case Skip:return d;case Item:{const h=/** @type {Item} */d;const u=h.content;switch(u.constructor){case ContentDeleted:break;case ContentType:if(n){const t=/** @type {ContentType} */u.type;t instanceof YXmlElement&&(t.nodeName=r.setIfUndefined(o,t.nodeName,(()=>"node-"+s)));t instanceof YXmlHook&&(t.hookName=r.setIfUndefined(o,t.hookName,(()=>"hook-"+s)))}break;case ContentAny:{const t=/** @type {ContentAny} */u;t.arr=t.arr.map((()=>s));break}case ContentBinary:{const t=/** @type {ContentBinary} */u;t.content=new Uint8Array([s]);break}case ContentDoc:{const t=/** @type {ContentDoc} */u;if(e){t.opts={};t.doc.guid=s+""}break}case ContentEmbed:{const t=/** @type {ContentEmbed} */u;t.embed={};break}case ContentFormat:{const e=/** @type {ContentFormat} */u;if(t){e.key=r.setIfUndefined(c,e.key,(()=>s+""));e.value=r.setIfUndefined(l,e.value,(()=>({i:s})))}break}case ContentJSON:{const t=/** @type {ContentJSON} */u;t.arr=t.arr.map((()=>s));break}case ContentString:{const t=/** @type {ContentString} */u;t.str=w.repeat(s%10+"",t.str.length);break}default:a.unexpectedCase()}h.parentSub&&(h.parentSub=r.setIfUndefined(i,h.parentSub,(()=>s+"")));s++;return d}default:a.unexpectedCase()}}};
/**
 * This function obfuscates the content of a Yjs update. This is useful to share
 * buggy Yjs documents while significantly limiting the possibility that a
 * developer can on the user. Note that it might still be possible to deduce
 * some information by analyzing the "structure" of the document or by analyzing
 * the typing behavior using the CRDT-related metadata that is still kept fully
 * intact.
 *
 * @param {Uint8Array} update
 * @param {ObfuscatorOptions} [opts]
 */const ke=(t,e)=>me(t,ye(e),UpdateDecoderV1,UpdateEncoderV1)
/**
 * @param {Uint8Array} update
 * @param {ObfuscatorOptions} [opts]
 */;const be=(t,e)=>me(t,ye(e),UpdateDecoderV2,UpdateEncoderV2)
/**
 * @param {Uint8Array} update
 */;const Se=t=>me(t,h.id,UpdateDecoderV1,UpdateEncoderV2)
/**
 * @param {Uint8Array} update
 */;const _e=t=>me(t,h.id,UpdateDecoderV2,UpdateEncoderV1);const Ce="You must not compute changes after the event-handler fired.";
/**
 * @template {AbstractType<any>} T
 * YEvent describes the changes on a YType.
 */class YEvent{
/**
   * @param {T} target The changed type.
   * @param {Transaction} transaction
   */
constructor(t,e){
/**
     * The type on which this event was created on.
     * @type {T}
     */
this.target=t;
/**
     * The current target on which the observe callback is called.
     * @type {AbstractType<any>}
     */this.currentTarget=t;
/**
     * The transaction that triggered this event.
     * @type {Transaction}
     */this.transaction=e;
/**
     * @type {Object|null}
     */this._changes=null;
/**
     * @type {null | Map<string, { action: 'add' | 'update' | 'delete', oldValue: any, newValue: any }>}
     */this._keys=null;
/**
     * @type {null | Array<{ insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any> }>}
     */this._delta=null;
/**
     * @type {Array<string|number>|null}
     */this._path=null}get path(){return this._path||(this._path=De(this.currentTarget,this.target))}
/**
   * Check if a struct is deleted by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */deletes(t){return _(this.transaction.deleteSet,t.id)}
/**
   * @type {Map<string, { action: 'add' | 'update' | 'delete', oldValue: any, newValue: any }>}
   */get keys(){if(this._keys===null){if(this.transaction.doc._transactionCleanups.length===0)throw a.create(Ce);const t=new Map;const n=this.target;const r=/** @type Set<string|null> */this.transaction.changed.get(n);r.forEach((r=>{if(r!==null){const s=/** @type {Item} */n._map.get(r);
/**
           * @type {'delete' | 'add' | 'update'}
           */let i;let o;if(this.adds(s)){let t=s.left;while(t!==null&&this.adds(t))t=t.left;if(this.deletes(s)){if(t===null||!this.deletes(t))return;i="delete";o=e.last(t.content.getContent())}else if(t!==null&&this.deletes(t)){i="update";o=e.last(t.content.getContent())}else{i="add";o=void 0}}else{if(!this.deletes(s))return;i="delete";o=e.last(/** @type {Item} */s.content.getContent())}t.set(r,{action:i,oldValue:o})}}));this._keys=t}return this._keys}
/**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {Array<{insert?: string | Array<any> | object | AbstractType<any>, retain?: number, delete?: number, attributes?: Object<string, any>}>}
   */get delta(){return this.changes.delta}
/**
   * Check if a struct is added by this event.
   *
   * In contrast to change.deleted, this method also returns true if the struct was added and then deleted.
   *
   * @param {AbstractStruct} struct
   * @return {boolean}
   */adds(t){return t.id.clock>=(this.transaction.beforeState.get(t.id.client)||0)}
/**
   * This is a computed property. Note that this can only be safely computed during the
   * event call. Computing this property after other changes happened might result in
   * unexpected behavior (incorrect computation of deltas). A safe way to collect changes
   * is to store the `changes` or the `delta` object. Avoid storing the `transaction` object.
   *
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */get changes(){let t=this._changes;if(t===null){if(this.transaction.doc._transactionCleanups.length===0)throw a.create(Ce);const e=this.target;const n=g.create();const r=g.create();
/**
       * @type {Array<{insert:Array<any>}|{delete:number}|{retain:number}>}
       */const s=[];t={added:n,deleted:r,delta:s,keys:this.keys};const i=/** @type Set<string|null> */this.transaction.changed.get(e);if(i.has(null)){
/**
         * @type {any}
         */
let t=null;const i=()=>{t&&s.push(t)};for(let s=e._start;s!==null;s=s.right)if(s.deleted){if(this.deletes(s)&&!this.adds(s)){if(t===null||t.delete===void 0){i();t={delete:0}}t.delete+=s.length;r.add(s)}}else if(this.adds(s)){if(t===null||t.insert===void 0){i();t={insert:[]}}t.insert=t.insert.concat(s.content.getContent());n.add(s)}else{if(t===null||t.retain===void 0){i();t={retain:0}}t.retain+=s.length}t!==null&&t.retain===void 0&&i()}this._changes=t}/** @type {any} */
return t}}
/**
 * Compute the path from this type to the specified target.
 *
 * @example
 *   // `child` should be accessible via `type.get(path[0]).get(path[1])..`
 *   const path = type.getPathTo(child)
 *   // assuming `type instanceof YArray`
 *   console.log(path) // might look like => [2, 'key1']
 *   child === type.get(path[0]).get(path[1])
 *
 * @param {AbstractType<any>} parent
 * @param {AbstractType<any>} child target
 * @return {Array<string|number>} Path to the target
 *
 * @private
 * @function
 */const De=(t,e)=>{const n=[];while(e._item!==null&&e!==t){if(e._item.parentSub!==null)n.unshift(e._item.parentSub);else{let t=0;let r=/** @type {AbstractType<any>} */e._item.parent._start;while(r!==e._item&&r!==null){!r.deleted&&r.countable&&(t+=r.length);r=r.right}n.unshift(t)}e=/** @type {AbstractType<any>} */e._item.parent}return n};const Ee=()=>{f.warn("Invalid access: Add Yjs type to a document before reading data.")};const Ue=80;
/**
 * A unique timestamp that identifies each marker.
 *
 * Time is relative,.. this is more like an ever-increasing clock.
 *
 * @type {number}
 */let Ve=0;class ArraySearchMarker{
/**
   * @param {Item} p
   * @param {number} index
   */
constructor(t,e){t.marker=true;this.p=t;this.index=e;this.timestamp=Ve++}}
/**
 * @param {ArraySearchMarker} marker
 */const Ae=t=>{t.timestamp=Ve++};
/**
 * This is rather complex so this function is the only thing that should overwrite a marker
 *
 * @param {ArraySearchMarker} marker
 * @param {Item} p
 * @param {number} index
 */const Ie=(t,e,n)=>{t.p.marker=false;t.p=e;e.marker=true;t.index=n;t.timestamp=Ve++};
/**
 * @param {Array<ArraySearchMarker>} searchMarker
 * @param {Item} p
 * @param {number} index
 */const Te=(t,e,n)=>{if(t.length>=Ue){const r=t.reduce(((t,e)=>t.timestamp<e.timestamp?t:e));Ie(r,e,n);return r}{const r=new ArraySearchMarker(e,n);t.push(r);return r}};
/**
 * Search marker help us to find positions in the associative array faster.
 *
 * They speed up the process of finding a position without much bookkeeping.
 *
 * A maximum of `maxSearchMarker` objects are created.
 *
 * This function always returns a refreshed marker (updated timestamp)
 *
 * @param {AbstractType<any>} yarray
 * @param {number} index
 */const ve=(t,e)=>{if(t._start===null||e===0||t._searchMarker===null)return null;const r=t._searchMarker.length===0?null:t._searchMarker.reduce(((t,r)=>n.abs(e-t.index)<n.abs(e-r.index)?t:r));let s=t._start;let i=0;if(r!==null){s=r.p;i=r.index;Ae(r)}while(s.right!==null&&i<e){if(!s.deleted&&s.countable){if(e<i+s.length)break;i+=s.length}s=s.right}while(s.left!==null&&i>e){s=s.left;!s.deleted&&s.countable&&(i-=s.length)}while(s.left!==null&&s.left.id.client===s.id.client&&s.left.id.clock+s.left.length===s.id.clock){s=s.left;!s.deleted&&s.countable&&(i-=s.length)}if(r!==null&&n.abs(r.index-i)</** @type {YText|YArray<any>} */s.parent.length/Ue){Ie(r,s,i);return r}return Te(t._searchMarker,s,i)};
/**
 * Update markers when a change happened.
 *
 * This should be called before doing a deletion!
 *
 * @param {Array<ArraySearchMarker>} searchMarker
 * @param {number} index
 * @param {number} len If insertion, len is positive. If deletion, len is negative.
 */const xe=(t,e,r)=>{for(let s=t.length-1;s>=0;s--){const i=t[s];if(r>0){
/**
       * @type {Item|null}
       */
let e=i.p;e.marker=false;while(e&&(e.deleted||!e.countable)){e=e.left;e&&!e.deleted&&e.countable&&(i.index-=e.length)}if(e===null||e.marker===true){t.splice(s,1);continue}i.p=e;e.marker=true}(e<i.index||r>0&&e===i.index)&&(i.index=n.max(e,i.index+r))}};
/**
 * Accumulate all (list) children of a type and return them as an Array.
 *
 * @param {AbstractType<any>} t
 * @return {Array<Item>}
 */const Me=t=>{t.doc??Ee();let e=t._start;const n=[];while(e){n.push(e);e=e.right}return n};
/**
 * Call event listeners with an event. This will also add an event to all
 * parents (for `.observeDeep` handlers).
 *
 * @template EventType
 * @param {AbstractType<EventType>} type
 * @param {Transaction} transaction
 * @param {EventType} event
 */const Le=(t,e,n)=>{const s=t;const i=e.changedParentTypes;while(true){r.setIfUndefined(i,t,(()=>[])).push(n);if(t._item===null)break;t=/** @type {AbstractType<any>} */t._item.parent}tt(s._eH,n,e)};
/**
 * @template EventType
 * Abstract Yjs Type class
 */class AbstractType{constructor(){
/**
     * @type {Item|null}
     */
this._item=null;
/**
     * @type {Map<string,Item>}
     */this._map=new Map;
/**
     * @type {Item|null}
     */this._start=null;
/**
     * @type {Doc|null}
     */this.doc=null;this._length=0;
/**
     * Event handlers
     * @type {EventHandler<EventType,Transaction>}
     */this._eH=q();
/**
     * Deep event handlers
     * @type {EventHandler<Array<YEvent<any>>,Transaction>}
     */this._dEH=q();
/**
     * @type {null | Array<ArraySearchMarker>}
     */this._searchMarker=null}get parent(){return this._item?/** @type {AbstractType<any>} */this._item.parent:null}
/**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item|null} item
   */_integrate(t,e){this.doc=t;this._item=e}_copy(){throw a.methodUnimplemented()}clone(){throw a.methodUnimplemented()}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} _encoder
   */_write(t){}get _first(){let t=this._start;while(t!==null&&t.deleted)t=t.right;return t}
/**
   * Creates YEvent and calls all type observers.
   * Must be implemented by each type.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} _parentSubs Keys changed on this type. `null` if list was modified.
   */_callObserver(t,e){!t.local&&this._searchMarker&&(this._searchMarker.length=0)}
/**
   * Observe all events that are created on this type.
   *
   * @param {function(EventType, Transaction):void} f Observer function
   */observe(t){Q(this._eH,t)}
/**
   * Observe all events that are created by this type and its children.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */observeDeep(t){Q(this._dEH,t)}
/**
   * Unregister an observer function.
   *
   * @param {function(EventType,Transaction):void} f Observer function
   */unobserve(t){Z(this._eH,t)}
/**
   * Unregister an observer function.
   *
   * @param {function(Array<YEvent<any>>,Transaction):void} f Observer function
   */unobserveDeep(t){Z(this._dEH,t)}toJSON(){}}
/**
 * @param {AbstractType<any>} type
 * @param {number} start
 * @param {number} end
 * @return {Array<any>}
 *
 * @private
 * @function
 */const Oe=(t,e,n)=>{t.doc??Ee();e<0&&(e=t._length+e);n<0&&(n=t._length+n);let r=n-e;const s=[];let i=t._start;while(i!==null&&r>0){if(i.countable&&!i.deleted){const t=i.content.getContent();if(t.length<=e)e-=t.length;else{for(let n=e;n<t.length&&r>0;n++){s.push(t[n]);r--}e=0}}i=i.right}return s};
/**
 * @param {AbstractType<any>} type
 * @return {Array<any>}
 *
 * @private
 * @function
 */const Ye=t=>{t.doc??Ee();const e=[];let n=t._start;while(n!==null){if(n.countable&&!n.deleted){const t=n.content.getContent();for(let n=0;n<t.length;n++)e.push(t[n])}n=n.right}return e};
/**
 * @param {AbstractType<any>} type
 * @param {Snapshot} snapshot
 * @return {Array<any>}
 *
 * @private
 * @function
 */const Re=(t,e)=>{const n=[];let r=t._start;while(r!==null){if(r.countable&&At(r,e)){const t=r.content.getContent();for(let e=0;e<t.length;e++)n.push(t[e])}r=r.right}return n};
/**
 * Executes a provided function on once on every element of this YArray.
 *
 * @param {AbstractType<any>} type
 * @param {function(any,number,any):void} f A function to execute on every element of this YArray.
 *
 * @private
 * @function
 */const Ne=(t,e)=>{let n=0;let r=t._start;t.doc??Ee();while(r!==null){if(r.countable&&!r.deleted){const s=r.content.getContent();for(let r=0;r<s.length;r++)e(s[r],n++,t)}r=r.right}};
/**
 * @template C,R
 * @param {AbstractType<any>} type
 * @param {function(C,number,AbstractType<any>):R} f
 * @return {Array<R>}
 *
 * @private
 * @function
 */const Be=(t,e)=>{
/**
   * @type {Array<any>}
   */
const n=[];Ne(t,((r,s)=>{n.push(e(r,s,t))}));return n};
/**
 * @param {AbstractType<any>} type
 * @return {IterableIterator<any>}
 *
 * @private
 * @function
 */const Fe=t=>{let e=t._start;
/**
   * @type {Array<any>|null}
   */let n=null;let r=0;return{[Symbol.iterator](){return this},next:()=>{if(n===null){while(e!==null&&e.deleted)e=e.right;if(e===null)return{done:true,value:void 0};n=e.content.getContent();r=0;e=e.right}const t=n[r++];n.length<=r&&(n=null);return{done:false,value:t}}}};
/**
 * @param {AbstractType<any>} type
 * @param {number} index
 * @return {any}
 *
 * @private
 * @function
 */const Xe=(t,e)=>{t.doc??Ee();const n=ve(t,e);let r=t._start;if(n!==null){r=n.p;e-=n.index}for(;r!==null;r=r.right)if(!r.deleted&&r.countable){if(e<r.length)return r.content.getContent()[e];e-=r.length}};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {Item?} referenceItem
 * @param {Array<Object<string,any>|Array<any>|boolean|number|null|string|Uint8Array>} content
 *
 * @private
 * @function
 */const ze=(t,e,n,r)=>{let s=n;const i=t.doc;const o=i.clientID;const c=i.store;const l=n===null?e._start:n.right;
/**
   * @type {Array<Object|Array<any>|number|null>}
   */let a=[];const d=()=>{if(a.length>0){s=new Item(nt(o,Lt(c,o)),s,s&&s.lastId,l,l&&l.id,e,null,new ContentAny(a));s.integrate(t,0);a=[]}};r.forEach((n=>{if(n===null)a.push(n);else switch(n.constructor){case Number:case Object:case Boolean:case Array:case String:a.push(n);break;default:d();switch(n.constructor){case Uint8Array:case ArrayBuffer:s=new Item(nt(o,Lt(c,o)),s,s&&s.lastId,l,l&&l.id,e,null,new ContentBinary(new Uint8Array(/** @type {Uint8Array} */n)));s.integrate(t,0);break;case Doc:s=new Item(nt(o,Lt(c,o)),s,s&&s.lastId,l,l&&l.id,e,null,new ContentDoc(/** @type {Doc} */n));s.integrate(t,0);break;default:if(!(n instanceof AbstractType))throw new Error("Unexpected content type in insert operation");s=new Item(nt(o,Lt(c,o)),s,s&&s.lastId,l,l&&l.id,e,null,new ContentType(n));s.integrate(t,0)}}}));d()};const Pe=()=>a.create("Length exceeded!")
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {number} index
 * @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
 *
 * @private
 * @function
 */;const Je=(t,e,n,r)=>{if(n>e._length)throw Pe();if(n===0){e._searchMarker&&xe(e._searchMarker,n,r.length);return ze(t,e,null,r)}const s=n;const i=ve(e,n);let o=e._start;if(i!==null){o=i.p;n-=i.index;if(n===0){o=o.prev;n+=o&&o.countable&&!o.deleted?o.length:0}}for(;o!==null;o=o.right)if(!o.deleted&&o.countable){if(n<=o.length){n<o.length&&Ft(t,nt(o.id.client,o.id.clock+n));break}n-=o.length}e._searchMarker&&xe(e._searchMarker,s,r.length);return ze(t,e,o,r)};
/**
 * Pushing content is special as we generally want to push after the last item. So we don't have to update
 * the search marker.
 *
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {Array<Object<string,any>|Array<any>|number|null|string|Uint8Array>} content
 *
 * @private
 * @function
 */const We=(t,e,n)=>{const r=(e._searchMarker||[]).reduce(((t,e)=>e.index>t.index?e:t),{index:0,p:e._start});let s=r.p;if(s)while(s.right)s=s.right;return ze(t,e,s,n)};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {number} index
 * @param {number} length
 *
 * @private
 * @function
 */const He=(t,e,n,r)=>{if(r===0)return;const s=n;const i=r;const o=ve(e,n);let c=e._start;if(o!==null){c=o.p;n-=o.index}for(;c!==null&&n>0;c=c.right)if(!c.deleted&&c.countable){n<c.length&&Ft(t,nt(c.id.client,c.id.clock+n));n-=c.length}while(r>0&&c!==null){if(!c.deleted){r<c.length&&Ft(t,nt(c.id.client,c.id.clock+r));c.delete(t);r-=c.length}c=c.right}if(r>0)throw Pe();e._searchMarker&&xe(e._searchMarker,s,-i+r)};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {string} key
 *
 * @private
 * @function
 */const Ge=(t,e,n)=>{const r=e._map.get(n);r!==void 0&&r.delete(t)};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {string} key
 * @param {Object|number|null|Array<any>|string|Uint8Array|AbstractType<any>} value
 *
 * @private
 * @function
 */const je=(t,e,n,r)=>{const s=e._map.get(n)||null;const i=t.doc;const o=i.clientID;let c;if(r==null)c=new ContentAny([r]);else switch(r.constructor){case Number:case Object:case Boolean:case Array:case String:case Date:case BigInt:c=new ContentAny([r]);break;case Uint8Array:c=new ContentBinary(/** @type {Uint8Array} */r);break;case Doc:c=new ContentDoc(/** @type {Doc} */r);break;default:if(!(r instanceof AbstractType))throw new Error("Unexpected content type");c=new ContentType(r)}new Item(nt(o,Lt(i.store,o)),s,s&&s.lastId,null,null,e,n,c).integrate(t,0)};
/**
 * @param {AbstractType<any>} parent
 * @param {string} key
 * @return {Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
 *
 * @private
 * @function
 */const $e=(t,e)=>{t.doc??Ee();const n=t._map.get(e);return n===void 0||n.deleted?void 0:n.content.getContent()[n.length-1]};
/**
 * @param {AbstractType<any>} parent
 * @return {Object<string,Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
 *
 * @private
 * @function
 */const Ke=t=>{
/**
   * @type {Object<string,any>}
   */
const e={};t.doc??Ee();t._map.forEach(((t,n)=>{t.deleted||(e[n]=t.content.getContent()[t.length-1])}));return e};
/**
 * @param {AbstractType<any>} parent
 * @param {string} key
 * @return {boolean}
 *
 * @private
 * @function
 */const qe=(t,e)=>{t.doc??Ee();const n=t._map.get(e);return n!==void 0&&!n.deleted};
/**
 * @param {AbstractType<any>} parent
 * @param {string} key
 * @param {Snapshot} snapshot
 * @return {Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined}
 *
 * @private
 * @function
 */const Qe=(t,e,n)=>{let r=t._map.get(e)||null;while(r!==null&&(!n.sv.has(r.id.client)||r.id.clock>=(n.sv.get(r.id.client)||0)))r=r.left;return r!==null&&At(r,n)?r.content.getContent()[r.length-1]:void 0};
/**
 * @param {AbstractType<any>} parent
 * @param {Snapshot} snapshot
 * @return {Object<string,Object<string,any>|number|null|Array<any>|string|Uint8Array|AbstractType<any>|undefined>}
 *
 * @private
 * @function
 */const Ze=(t,e)=>{
/**
   * @type {Object<string,any>}
   */
const n={};t._map.forEach(((t,r)=>{
/**
     * @type {Item|null}
     */
let s=t;while(s!==null&&(!e.sv.has(s.id.client)||s.id.clock>=(e.sv.get(s.id.client)||0)))s=s.left;s!==null&&At(s,e)&&(n[r]=s.content.getContent()[s.length-1])}));return n};
/**
 * @param {AbstractType<any> & { _map: Map<string, Item> }} type
 * @return {IterableIterator<Array<any>>}
 *
 * @private
 * @function
 */const tn=t=>{t.doc??Ee();return m.iteratorFilter(t._map.entries(),(/** @param {any} entry */t=>!t[1].deleted))};
/**
 * Event that describes the changes on a YArray
 * @template T
 * @extends YEvent<YArray<T>>
 */class YArrayEvent extends YEvent{}
/**
 * A shared Array implementation.
 * @template T
 * @extends AbstractType<YArrayEvent<T>>
 * @implements {Iterable<T>}
 */class YArray extends AbstractType{constructor(){super();
/**
     * @type {Array<any>?}
     * @private
     */this._prelimContent=[];
/**
     * @type {Array<ArraySearchMarker>}
     */this._searchMarker=[]}
/**
   * Construct a new YArray containing the specified items.
   * @template {Object<string,any>|Array<any>|number|null|string|Uint8Array} T
   * @param {Array<T>} items
   * @return {YArray<T>}
   */static from(t){
/**
     * @type {YArray<T>}
     */
const e=new YArray;e.push(t);return e}
/**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */_integrate(t,e){super._integrate(t,e);this.insert(0,/** @type {Array<any>} */this._prelimContent);this._prelimContent=null}_copy(){return new YArray}clone(){
/**
     * @type {YArray<T>}
     */
const t=new YArray;t.insert(0,this.toArray().map((t=>t instanceof AbstractType?/** @type {typeof el} */t.clone():t)));return t}get length(){this.doc??Ee();return this._length}
/**
   * Creates YArrayEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */_callObserver(t,e){super._callObserver(t,e);Le(this,t,new YArrayEvent(this,t))}
/**
   * Inserts new content at an index.
   *
   * Important: This function expects an array of content. Not just a content
   * object. The reason for this "weirdness" is that inserting several elements
   * is very efficient when it is done as a single operation.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  yarray.insert(0, ['a'])
   *  // Insert numbers 1, 2 at position 1
   *  yarray.insert(1, [1, 2])
   *
   * @param {number} index The index to insert content at.
   * @param {Array<T>} content The array of content
   */insert(t,e){this.doc!==null?qt(this.doc,(n=>{Je(n,this,t,/** @type {any} */e)})):
/** @type {Array<any>} */this._prelimContent.splice(t,0,...e)}
/**
   * Appends content to this YArray.
   *
   * @param {Array<T>} content Array of content to append.
   *
   * @todo Use the following implementation in all types.
   */push(t){this.doc!==null?qt(this.doc,(e=>{We(e,this,/** @type {any} */t)})):
/** @type {Array<any>} */this._prelimContent.push(...t)}
/**
   * Prepends content to this YArray.
   *
   * @param {Array<T>} content Array of content to prepend.
   */unshift(t){this.insert(0,t)}
/**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} length The number of elements to remove. Defaults to 1.
   */delete(t,e=1){this.doc!==null?qt(this.doc,(n=>{He(n,this,t,e)})):
/** @type {Array<any>} */this._prelimContent.splice(t,e)}
/**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {T}
   */get(t){return Xe(this,t)}toArray(){return Ye(this)}
/**
   * Returns a portion of this YArray into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<T>}
   */slice(t=0,e=this.length){return Oe(this,t,e)}toJSON(){return this.map((t=>t instanceof AbstractType?t.toJSON():t))}
/**
   * Returns an Array with the result of calling a provided function on every
   * element of this YArray.
   *
   * @template M
   * @param {function(T,number,YArray<T>):M} f Function that produces an element of the new Array
   * @return {Array<M>} A new array with each element being the result of the
   *                 callback function
   */map(t){return Be(this,/** @type {any} */t)}
/**
   * Executes a provided function once on every element of this YArray.
   *
   * @param {function(T,number,YArray<T>):void} f A function to execute on every element of this YArray.
   */forEach(t){Ne(this,t)}[Symbol.iterator](){return Fe(this)}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */_write(t){t.writeTypeRef(On)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
 *
 * @private
 * @function
 */const en=t=>new YArray
/**
 * @template T
 * @extends YEvent<YMap<T>>
 * Event that describes the changes on a YMap.
 */;class YMapEvent extends YEvent{
/**
   * @param {YMap<T>} ymap The YArray that changed.
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed.
   */
constructor(t,e,n){super(t,e);this.keysChanged=n}}
/**
 * @template MapType
 * A shared Map implementation.
 *
 * @extends AbstractType<YMapEvent<MapType>>
 * @implements {Iterable<[string, MapType]>}
 */class YMap extends AbstractType{
/**
   *
   * @param {Iterable<readonly [string, any]>=} entries - an optional iterable to initialize the YMap
   */
constructor(t){super();
/**
     * @type {Map<string,any>?}
     * @private
     */this._prelimContent=null;this._prelimContent=t===void 0?new Map:new Map(t)}
/**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */_integrate(t,e){super._integrate(t,e);/** @type {Map<string, any>} */this._prelimContent.forEach(((t,e)=>{this.set(e,t)}));this._prelimContent=null}_copy(){return new YMap}clone(){
/**
     * @type {YMap<MapType>}
     */
const t=new YMap;this.forEach(((e,n)=>{t.set(n,e instanceof AbstractType?/** @type {typeof value} */e.clone():e)}));return t}
/**
   * Creates YMapEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */_callObserver(t,e){Le(this,t,new YMapEvent(this,t,e))}toJSON(){this.doc??Ee();
/**
     * @type {Object<string,MapType>}
     */const t={};this._map.forEach(((e,n)=>{if(!e.deleted){const r=e.content.getContent()[e.length-1];t[n]=r instanceof AbstractType?r.toJSON():r}}));return t}get size(){return[...tn(this)].length}keys(){return m.iteratorMap(tn(this),(/** @param {any} v */t=>t[0]))}values(){return m.iteratorMap(tn(this),(/** @param {any} v */t=>t[1].content.getContent()[t[1].length-1]))}entries(){return m.iteratorMap(tn(this),(/** @param {any} v */t=>/** @type {any} */[t[0],t[1].content.getContent()[t[1].length-1]]))}
/**
   * Executes a provided function on once on every key-value pair.
   *
   * @param {function(MapType,string,YMap<MapType>):void} f A function to execute on every element of this YArray.
   */forEach(t){this.doc??Ee();this._map.forEach(((e,n)=>{e.deleted||t(e.content.getContent()[e.length-1],n,this)}))}[Symbol.iterator](){return this.entries()}
/**
   * Remove a specified element from this YMap.
   *
   * @param {string} key The key of the element to remove.
   */delete(t){this.doc!==null?qt(this.doc,(e=>{Ge(e,this,t)})):
/** @type {Map<string, any>} */this._prelimContent.delete(t)}
/**
   * Adds or updates an element with a specified key and value.
   * @template {MapType} VAL
   *
   * @param {string} key The key of the element to add to this YMap
   * @param {VAL} value The value of the element to add
   * @return {VAL}
   */set(t,e){this.doc!==null?qt(this.doc,(n=>{je(n,this,t,/** @type {any} */e)})):
/** @type {Map<string, any>} */this._prelimContent.set(t,e);return e}
/**
   * Returns a specified element from this YMap.
   *
   * @param {string} key
   * @return {MapType|undefined}
   */get(t){/** @type {any} */
return $e(this,t)}
/**
   * Returns a boolean indicating whether the specified key exists or not.
   *
   * @param {string} key The key to test.
   * @return {boolean}
   */has(t){return qe(this,t)}clear(){this.doc!==null?qt(this.doc,(t=>{this.forEach((function(e,n,r){Ge(t,r,n)}))})):
/** @type {Map<string, any>} */this._prelimContent.clear()}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */_write(t){t.writeTypeRef(Yn)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
 *
 * @private
 * @function
 */const nn=t=>new YMap
/**
 * @param {any} a
 * @param {any} b
 * @return {boolean}
 */;const rn=(t,e)=>t===e||typeof t==="object"&&typeof e==="object"&&t&&e&&y.equalFlat(t,e);class ItemTextListPosition{
/**
   * @param {Item|null} left
   * @param {Item|null} right
   * @param {number} index
   * @param {Map<string,any>} currentAttributes
   */
constructor(t,e,n,r){this.left=t;this.right=e;this.index=n;this.currentAttributes=r}forward(){this.right===null&&a.unexpectedCase();switch(this.right.content.constructor){case ContentFormat:this.right.deleted||ln(this.currentAttributes,/** @type {ContentFormat} */this.right.content);break;default:this.right.deleted||(this.index+=this.right.length);break}this.left=this.right;this.right=this.right.right}}
/**
 * @param {Transaction} transaction
 * @param {ItemTextListPosition} pos
 * @param {number} count steps to move forward
 * @return {ItemTextListPosition}
 *
 * @private
 * @function
 */const sn=(t,e,n)=>{while(e.right!==null&&n>0){switch(e.right.content.constructor){case ContentFormat:e.right.deleted||ln(e.currentAttributes,/** @type {ContentFormat} */e.right.content);break;default:if(!e.right.deleted){n<e.right.length&&Ft(t,nt(e.right.id.client,e.right.id.clock+n));e.index+=e.right.length;n-=e.right.length}break}e.left=e.right;e.right=e.right.right}return e};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {number} index
 * @param {boolean} useSearchMarker
 * @return {ItemTextListPosition}
 *
 * @private
 * @function
 */const on=(t,e,n,r)=>{const s=new Map;const i=r?ve(e,n):null;if(i){const e=new ItemTextListPosition(i.p.left,i.p,i.index,s);return sn(t,e,n-i.index)}{const r=new ItemTextListPosition(null,e._start,0,s);return sn(t,r,n)}};
/**
 * Negate applied formats
 *
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {ItemTextListPosition} currPos
 * @param {Map<string,any>} negatedAttributes
 *
 * @private
 * @function
 */const cn=(t,e,n,r)=>{while(n.right!==null&&(n.right.deleted===true||n.right.content.constructor===ContentFormat&&rn(r.get(/** @type {ContentFormat} */n.right.content.key),/** @type {ContentFormat} */n.right.content.value))){n.right.deleted||r.delete(/** @type {ContentFormat} */n.right.content.key);n.forward()}const s=t.doc;const i=s.clientID;r.forEach(((r,o)=>{const c=n.left;const l=n.right;const a=new Item(nt(i,Lt(s.store,i)),c,c&&c.lastId,l,l&&l.id,e,null,new ContentFormat(o,r));a.integrate(t,0);n.right=a;n.forward()}))};
/**
 * @param {Map<string,any>} currentAttributes
 * @param {ContentFormat} format
 *
 * @private
 * @function
 */const ln=(t,e)=>{const{key:n,value:r}=e;r===null?t.delete(n):t.set(n,r)};
/**
 * @param {ItemTextListPosition} currPos
 * @param {Object<string,any>} attributes
 *
 * @private
 * @function
 */const an=(t,e)=>{while(true){if(t.right===null)break;if(!(t.right.deleted||t.right.content.constructor===ContentFormat&&rn(e[/** @type {ContentFormat} */t.right.content.key]??null,/** @type {ContentFormat} */t.right.content.value)))break;t.forward()}};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {ItemTextListPosition} currPos
 * @param {Object<string,any>} attributes
 * @return {Map<string,any>}
 *
 * @private
 * @function
 **/const dn=(t,e,n,r)=>{const s=t.doc;const i=s.clientID;const o=new Map;for(const c in r){const l=r[c];const a=n.currentAttributes.get(c)??null;if(!rn(a,l)){o.set(c,a);const{left:r,right:d}=n;n.right=new Item(nt(i,Lt(s.store,i)),r,r&&r.lastId,d,d&&d.id,e,null,new ContentFormat(c,l));n.right.integrate(t,0);n.forward()}}return o};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {ItemTextListPosition} currPos
 * @param {string|object|AbstractType<any>} text
 * @param {Object<string,any>} attributes
 *
 * @private
 * @function
 **/const hn=(t,e,n,r,s)=>{n.currentAttributes.forEach(((t,e)=>{s[e]===void 0&&(s[e]=null)}));const i=t.doc;const o=i.clientID;an(n,s);const c=dn(t,e,n,s);const l=r.constructor===String?new ContentString(/** @type {string} */r):r instanceof AbstractType?new ContentType(r):new ContentEmbed(r);let{left:a,right:d,index:h}=n;e._searchMarker&&xe(e._searchMarker,n.index,l.getLength());d=new Item(nt(o,Lt(i.store,o)),a,a&&a.lastId,d,d&&d.id,e,null,l);d.integrate(t,0);n.right=d;n.index=h;n.forward();cn(t,e,n,c)};
/**
 * @param {Transaction} transaction
 * @param {AbstractType<any>} parent
 * @param {ItemTextListPosition} currPos
 * @param {number} length
 * @param {Object<string,any>} attributes
 *
 * @private
 * @function
 */const un=(t,e,n,r,s)=>{const i=t.doc;const o=i.clientID;an(n,s);const c=dn(t,e,n,s);t:while(n.right!==null&&(r>0||c.size>0&&(n.right.deleted||n.right.content.constructor===ContentFormat))){if(!n.right.deleted)switch(n.right.content.constructor){case ContentFormat:{const{key:e,value:i}=/** @type {ContentFormat} */n.right.content;const o=s[e];if(o!==void 0){if(rn(o,i))c.delete(e);else{if(r===0)break t;c.set(e,i)}n.right.delete(t)}else n.currentAttributes.set(e,i);break}default:r<n.right.length&&Ft(t,nt(n.right.id.client,n.right.id.clock+r));r-=n.right.length;break}n.forward()}if(r>0){let s="";for(;r>0;r--)s+="\n";n.right=new Item(nt(o,Lt(i.store,o)),n.left,n.left&&n.left.lastId,n.right,n.right&&n.right.id,e,null,new ContentString(s));n.right.integrate(t,0);n.forward()}cn(t,e,n,c)};
/**
 * Call this function after string content has been deleted in order to
 * clean up formatting Items.
 *
 * @param {Transaction} transaction
 * @param {Item} start
 * @param {Item|null} curr exclusive end, automatically iterates to the next Content Item
 * @param {Map<string,any>} startAttributes
 * @param {Map<string,any>} currAttributes
 * @return {number} The amount of formatting Items deleted.
 *
 * @function
 */const gn=(t,e,n,s,i)=>{
/**
   * @type {Item|null}
   */
let o=e;
/**
   * @type {Map<string,ContentFormat>}
   */const c=r.create();while(o&&(!o.countable||o.deleted)){if(!o.deleted&&o.content.constructor===ContentFormat){const t=/** @type {ContentFormat} */o.content;c.set(t.key,t)}o=o.right}let l=0;let a=false;while(e!==o){n===e&&(a=true);if(!e.deleted){const n=e.content;switch(n.constructor){case ContentFormat:{const{key:r,value:o}=/** @type {ContentFormat} */n;const d=s.get(r)??null;if(c.get(r)!==n||d===o){e.delete(t);l++;a||(i.get(r)??null)!==o||d===o||(d===null?i.delete(r):i.set(r,d))}a||e.deleted||ln(i,/** @type {ContentFormat} */n);break}}}e=/** @type {Item} */e.right}return l};
/**
 * @param {Transaction} transaction
 * @param {Item | null} item
 */const fn=(t,e)=>{while(e&&e.right&&(e.right.deleted||!e.right.countable))e=e.right;const n=new Set;while(e&&(e.deleted||!e.countable)){if(!e.deleted&&e.content.constructor===ContentFormat){const r=/** @type {ContentFormat} */e.content.key;n.has(r)?e.delete(t):n.add(r)}e=e.left}};
/**
 * This function is experimental and subject to change / be removed.
 *
 * Ideally, we don't need this function at all. Formatting attributes should be cleaned up
 * automatically after each change. This function iterates twice over the complete YText type
 * and removes unnecessary formatting attributes. This is also helpful for testing.
 *
 * This function won't be exported anymore as soon as there is confidence that the YText type works as intended.
 *
 * @param {YText} type
 * @return {number} How many formatting attributes have been cleaned up.
 */const pn=t=>{let e=0;qt(/** @type {Doc} */t.doc,(n=>{let s=/** @type {Item} */t._start;let i=t._start;let o=r.create();const c=r.copy(o);while(i){if(i.deleted===false)switch(i.content.constructor){case ContentFormat:ln(c,/** @type {ContentFormat} */i.content);break;default:e+=gn(n,s,i,o,c);o=r.copy(c);s=i;break}i=i.right}}));return e};
/**
 * This will be called by the transaction once the event handlers are called to potentially cleanup
 * formatting attributes.
 *
 * @param {Transaction} transaction
 */const wn=t=>{
/**
   * @type {Set<YText>}
   */
const e=new Set;const n=t.doc;for(const[r,s]of t.afterState.entries()){const i=t.beforeState.get(r)||0;s!==i&&Pt(t,/** @type {Array<Item|GC>} */n.store.clients.get(r),i,s,(t=>{t.deleted||/** @type {Item} */t.content.constructor!==ContentFormat||t.constructor===GC||e.add(/** @type {any} */t.parent)}))}qt(n,(n=>{b(t,t.deleteSet,(t=>{if(t instanceof GC||!/** @type {YText} */t.parent._hasFormatting||e.has(/** @type {YText} */t.parent))return;const r=/** @type {YText} */t.parent;t.content.constructor===ContentFormat?e.add(r):fn(n,t)}));for(const t of e)pn(t)}))};
/**
 * @param {Transaction} transaction
 * @param {ItemTextListPosition} currPos
 * @param {number} length
 * @return {ItemTextListPosition}
 *
 * @private
 * @function
 */const mn=(t,e,n)=>{const s=n;const i=r.copy(e.currentAttributes);const o=e.right;while(n>0&&e.right!==null){if(e.right.deleted===false)switch(e.right.content.constructor){case ContentType:case ContentEmbed:case ContentString:n<e.right.length&&Ft(t,nt(e.right.id.client,e.right.id.clock+n));n-=e.right.length;e.right.delete(t);break}e.forward()}o&&gn(t,o,e.right,i,e.currentAttributes);const c=/** @type {AbstractType<any>} */ /** @type {Item} */(e.left||e.right).parent;c._searchMarker&&xe(c._searchMarker,e.index,-s+n);return e};
/**
  * Attributes that can be assigned to a selection of text.
  *
  * @example
  *   {
  *     bold: true,
  *     font-size: '40px'
  *   }
  *
  * @typedef {Object} TextAttributes
  */class YTextEvent extends YEvent{
/**
   * @param {YText} ytext
   * @param {Transaction} transaction
   * @param {Set<any>} subs The keys that changed
   */
constructor(t,e,n){super(t,e);
/**
     * Whether the children changed.
     * @type {Boolean}
     * @private
     */this.childListChanged=false;
/**
     * Set of all changed attributes.
     * @type {Set<string>}
     */this.keysChanged=new Set;n.forEach((t=>{t===null?this.childListChanged=true:this.keysChanged.add(t)}))}
/**
   * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string, delete?:number, retain?:number}>}}
   */get changes(){if(this._changes===null){
/**
       * @type {{added:Set<Item>,deleted:Set<Item>,keys:Map<string,{action:'add'|'update'|'delete',oldValue:any}>,delta:Array<{insert?:Array<any>|string|AbstractType<any>|object, delete?:number, retain?:number}>}}
       */
const t={keys:this.keys,delta:this.delta,added:new Set,deleted:new Set};this._changes=t}/** @type {any} */
return this._changes}
/**
   * Compute the changes in the delta format.
   * A {@link https://quilljs.com/docs/delta/|Quill Delta}) that represents the changes on the document.
   *
   * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
   *
   * @public
   */get delta(){if(this._delta===null){const t=/** @type {Doc} */this.target.doc;
/**
       * @type {Array<{insert?:string|object|AbstractType<any>, delete?:number, retain?:number, attributes?: Object<string,any>}>}
       */const e=[];qt(t,(t=>{const n=new Map;const r=new Map;let s=this.target._start;
/**
         * @type {string?}
         */let i=null;
/**
         * @type {Object<string,any>}
         */const o={};
/**
         * @type {string|object}
         */let c="";let l=0;let a=0;const d=()=>{if(i!==null){
/**
             * @type {any}
             */
let t=null;switch(i){case"delete":a>0&&(t={delete:a});a=0;break;case"insert":if(typeof c==="object"||c.length>0){t={insert:c};if(n.size>0){t.attributes={};n.forEach(((e,n)=>{e!==null&&(t.attributes[n]=e)}))}}c="";break;case"retain":if(l>0){t={retain:l};y.isEmpty(o)||(t.attributes=y.assign({},o))}l=0;break}t&&e.push(t);i=null}};while(s!==null){switch(s.content.constructor){case ContentType:case ContentEmbed:if(this.adds(s)){if(!this.deletes(s)){d();i="insert";c=s.content.getContent()[0];d()}}else if(this.deletes(s)){if(i!=="delete"){d();i="delete"}a+=1}else if(!s.deleted){if(i!=="retain"){d();i="retain"}l+=1}break;case ContentString:if(this.adds(s)){if(!this.deletes(s)){if(i!=="insert"){d();i="insert"}c+=/** @type {ContentString} */s.content.str}}else if(this.deletes(s)){if(i!=="delete"){d();i="delete"}a+=s.length}else if(!s.deleted){if(i!=="retain"){d();i="retain"}l+=s.length}break;case ContentFormat:{const{key:e,value:c}=/** @type {ContentFormat} */s.content;if(this.adds(s)){if(!this.deletes(s)){const l=n.get(e)??null;if(rn(l,c))c!==null&&s.delete(t);else{i==="retain"&&d();rn(c,r.get(e)??null)?delete o[e]:o[e]=c}}}else if(this.deletes(s)){r.set(e,c);const t=n.get(e)??null;if(!rn(t,c)){i==="retain"&&d();o[e]=t}}else if(!s.deleted){r.set(e,c);const n=o[e];if(n!==void 0)if(rn(n,c))n!==null&&s.delete(t);else{i==="retain"&&d();c===null?delete o[e]:o[e]=c}}if(!s.deleted){i==="insert"&&d();ln(n,/** @type {ContentFormat} */s.content)}break}}s=s.right}d();while(e.length>0){const t=e[e.length-1];if(t.retain===void 0||t.attributes!==void 0)break;e.pop()}}));this._delta=e}/** @type {any} */
return this._delta}}class YText extends AbstractType{
/**
   * @param {String} [string] The initial value of the YText.
   */
constructor(t){super();
/**
     * Array of pending operations on this type
     * @type {Array<function():void>?}
     */this._pending=t!==void 0?[()=>this.insert(0,t)]:[];
/**
     * @type {Array<ArraySearchMarker>|null}
     */this._searchMarker=[];this._hasFormatting=false}
/**
   * Number of characters of this text type.
   *
   * @type {number}
   */get length(){this.doc??Ee();return this._length}
/**
   * @param {Doc} y
   * @param {Item} item
   */_integrate(t,e){super._integrate(t,e);try{
/** @type {Array<function>} */this._pending.forEach((t=>t()))}catch(t){console.error(t)}this._pending=null}_copy(){return new YText}clone(){const t=new YText;t.applyDelta(this.toDelta());return t}
/**
   * Creates YTextEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */_callObserver(t,e){super._callObserver(t,e);const n=new YTextEvent(this,t,e);Le(this,t,n);!t.local&&this._hasFormatting&&(t._needFormattingCleanup=true)}toString(){this.doc??Ee();let t="";
/**
     * @type {Item|null}
     */let e=this._start;while(e!==null){!e.deleted&&e.countable&&e.content.constructor===ContentString&&(t+=/** @type {ContentString} */e.content.str);e=e.right}return t}toJSON(){return this.toString()}
/**
   * Apply a {@link Delta} on this shared YText type.
   *
   * @param {Array<any>} delta The changes to apply on this element.
   * @param {object}  opts
   * @param {boolean} [opts.sanitize] Sanitize input delta. Removes ending newlines if set to true.
   *
   *
   * @public
   */applyDelta(t,{sanitize:e=true}={}){this.doc!==null?qt(this.doc,(n=>{const r=new ItemTextListPosition(null,this._start,0,new Map);for(let s=0;s<t.length;s++){const i=t[s];if(i.insert!==void 0){const o=e||typeof i.insert!=="string"||s!==t.length-1||r.right!==null||i.insert.slice(-1)!=="\n"?i.insert:i.insert.slice(0,-1);(typeof o!=="string"||o.length>0)&&hn(n,this,r,o,i.attributes||{})}else i.retain!==void 0?un(n,this,r,i.retain,i.attributes||{}):i.delete!==void 0&&mn(n,r,i.delete)}})):
/** @type {Array<function>} */this._pending.push((()=>this.applyDelta(t)))}
/**
   * Returns the Delta representation of this YText type.
   *
   * @param {Snapshot} [snapshot]
   * @param {Snapshot} [prevSnapshot]
   * @param {function('removed' | 'added', ID):any} [computeYChange]
   * @return {any} The Delta representation of this type.
   *
   * @public
   */toDelta(t,e,n){this.doc??Ee();
/**
     * @type{Array<any>}
     */const r=[];const s=new Map;const i=/** @type {Doc} */this.doc;let o="";let c=this._start;function l(){if(o.length>0){
/**
         * @type {Object<string,any>}
         */
const t={};let e=false;s.forEach(((n,r)=>{e=true;t[r]=n}));
/**
         * @type {Object<string,any>}
         */const n={insert:o};e&&(n.attributes=t);r.push(n);o=""}}const a=()=>{while(c!==null){if(At(c,t)||e!==void 0&&At(c,e))switch(c.content.constructor){case ContentString:{const r=s.get("ychange");if(t===void 0||At(c,t)){if(e===void 0||At(c,e)){if(r!==void 0){l();s.delete("ychange")}}else if(r===void 0||r.user!==c.id.client||r.type!=="added"){l();s.set("ychange",n?n("added",c.id):{type:"added"})}}else if(r===void 0||r.user!==c.id.client||r.type!=="removed"){l();s.set("ychange",n?n("removed",c.id):{type:"removed"})}o+=/** @type {ContentString} */c.content.str;break}case ContentType:case ContentEmbed:{l();
/**
               * @type {Object<string,any>}
               */const t={insert:c.content.getContent()[0]};if(s.size>0){const e=/** @type {Object<string,any>} */{};t.attributes=e;s.forEach(((t,n)=>{e[n]=t}))}r.push(t);break}case ContentFormat:if(At(c,t)){l();ln(s,/** @type {ContentFormat} */c.content)}break}c=c.right}l()};t||e?qt(i,(n=>{t&&It(n,t);e&&It(n,e);a()}),"cleanup"):a();return r}
/**
   * Insert text at a given index.
   *
   * @param {number} index The index at which to start inserting.
   * @param {String} text The text to insert at the specified position.
   * @param {TextAttributes} [attributes] Optionally define some formatting
   *                                    information to apply on the inserted
   *                                    Text.
   * @public
   */insert(t,e,n){if(e.length<=0)return;const r=this.doc;r!==null?qt(r,(r=>{const s=on(r,this,t,!n);if(!n){n={};s.currentAttributes.forEach(((t,e)=>{n[e]=t}))}hn(r,this,s,e,n)})):
/** @type {Array<function>} */this._pending.push((()=>this.insert(t,e,n)))}
/**
   * Inserts an embed at a index.
   *
   * @param {number} index The index to insert the embed at.
   * @param {Object | AbstractType<any>} embed The Object that represents the embed.
   * @param {TextAttributes} [attributes] Attribute information to apply on the
   *                                    embed
   *
   * @public
   */insertEmbed(t,e,n){const r=this.doc;r!==null?qt(r,(r=>{const s=on(r,this,t,!n);hn(r,this,s,e,n||{})})):
/** @type {Array<function>} */this._pending.push((()=>this.insertEmbed(t,e,n||{})))}
/**
   * Deletes text starting from an index.
   *
   * @param {number} index Index at which to start deleting.
   * @param {number} length The number of characters to remove. Defaults to 1.
   *
   * @public
   */delete(t,e){if(e===0)return;const n=this.doc;n!==null?qt(n,(n=>{mn(n,on(n,this,t,true),e)})):
/** @type {Array<function>} */this._pending.push((()=>this.delete(t,e)))}
/**
   * Assigns properties to a range of text.
   *
   * @param {number} index The position where to start formatting.
   * @param {number} length The amount of characters to assign properties to.
   * @param {TextAttributes} attributes Attribute information to apply on the
   *                                    text.
   *
   * @public
   */format(t,e,n){if(e===0)return;const r=this.doc;r!==null?qt(r,(r=>{const s=on(r,this,t,false);s.right!==null&&un(r,this,s,e,n)})):
/** @type {Array<function>} */this._pending.push((()=>this.format(t,e,n)))}
/**
   * Removes an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be removed.
   *
   * @public
   */removeAttribute(t){this.doc!==null?qt(this.doc,(e=>{Ge(e,this,t)})):
/** @type {Array<function>} */this._pending.push((()=>this.removeAttribute(t)))}
/**
   * Sets or updates an attribute.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that is to be set.
   * @param {any} attributeValue The attribute value that is to be set.
   *
   * @public
   */setAttribute(t,e){this.doc!==null?qt(this.doc,(n=>{je(n,this,t,e)})):
/** @type {Array<function>} */this._pending.push((()=>this.setAttribute(t,e)))}
/**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @note Xml-Text nodes don't have attributes. You can use this feature to assign properties to complete text-blocks.
   *
   * @param {String} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {any} The queried attribute value.
   *
   * @public
   */getAttribute(t){/** @type {any} */
return $e(this,t)}getAttributes(){return Ke(this)}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */_write(t){t.writeTypeRef(Rn)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
 * @return {YText}
 *
 * @private
 * @function
 */const yn=t=>new YText
/**
 * Define the elements to which a set of CSS queries apply.
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Selectors|CSS_Selectors}
 *
 * @example
 *   query = '.classSelector'
 *   query = 'nodeSelector'
 *   query = '#idSelector'
 *
 * @typedef {string} CSS_Selector
 */
/**
 * Dom filter function.
 *
 * @callback domFilter
 * @param {string} nodeName The nodeName of the element
 * @param {Map} attributes The map of attributes.
 * @return {boolean} Whether to include the Dom node in the YXmlElement.
 */;class YXmlTreeWalker{
/**
   * @param {YXmlFragment | YXmlElement} root
   * @param {function(AbstractType<any>):boolean} [f]
   */
constructor(t,e=()=>true){this._filter=e;this._root=t;
/**
     * @type {Item}
     */this._currentNode=/** @type {Item} */t._start;this._firstCall=true;t.doc??Ee()}[Symbol.iterator](){return this}next(){
/**
     * @type {Item|null}
     */
let t=this._currentNode;let e=t&&t.content&&/** @type {any} */t.content.type;if(t!==null&&(!this._firstCall||t.deleted||!this._filter(e)))do{e=/** @type {any} */t.content.type;if(t.deleted||e.constructor!==YXmlElement&&e.constructor!==YXmlFragment||e._start===null)while(t!==null){
/**
             * @type {Item | null}
             */
const e=t.next;if(e!==null){t=e;break}t=t.parent===this._root?null:/** @type {AbstractType<any>} */t.parent._item}else t=e._start}while(t!==null&&(t.deleted||!this._filter(/** @type {ContentType} */t.content.type)));this._firstCall=false;if(t===null)return{value:void 0,done:true};this._currentNode=t;return{value:/** @type {any} */t.content.type,done:false}}}class YXmlFragment extends AbstractType{constructor(){super();
/**
     * @type {Array<any>|null}
     */this._prelimContent=[]}
/**
   * @type {YXmlElement|YXmlText|null}
   */get firstChild(){const t=this._first;return t?t.content.getContent()[0]:null}
/**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */_integrate(t,e){super._integrate(t,e);this.insert(0,/** @type {Array<any>} */this._prelimContent);this._prelimContent=null}_copy(){return new YXmlFragment}clone(){const t=new YXmlFragment;t.insert(0,this.toArray().map((t=>t instanceof AbstractType?t.clone():t)));return t}get length(){this.doc??Ee();return this._prelimContent===null?this._length:this._prelimContent.length}
/**
   * Create a subtree of childNodes.
   *
   * @example
   * const walker = elem.createTreeWalker(dom => dom.nodeName === 'div')
   * for (let node in walker) {
   *   // `node` is a div node
   *   nop(node)
   * }
   *
   * @param {function(AbstractType<any>):boolean} filter Function that is called on each child element and
   *                          returns a Boolean indicating whether the child
   *                          is to be included in the subtree.
   * @return {YXmlTreeWalker} A subtree and a position within it.
   *
   * @public
   */createTreeWalker(t){return new YXmlTreeWalker(this,t)}
/**
   * Returns the first YXmlElement that matches the query.
   * Similar to DOM's {@link querySelector}.
   *
   * Query support:
   *   - tagname
   * TODO:
   *   - id
   *   - attribute
   *
   * @param {CSS_Selector} query The query on the children.
   * @return {YXmlElement|YXmlText|YXmlHook|null} The first element that matches the query or null.
   *
   * @public
   */querySelector(t){t=t.toUpperCase();const e=new YXmlTreeWalker(this,(e=>e.nodeName&&e.nodeName.toUpperCase()===t));const n=e.next();return n.done?null:n.value}
/**
   * Returns all YXmlElements that match the query.
   * Similar to Dom's {@link querySelectorAll}.
   *
   * @todo Does not yet support all queries. Currently only query by tagName.
   *
   * @param {CSS_Selector} query The query on the children
   * @return {Array<YXmlElement|YXmlText|YXmlHook|null>} The elements that match this query.
   *
   * @public
   */querySelectorAll(t){t=t.toUpperCase();return e.from(new YXmlTreeWalker(this,(e=>e.nodeName&&e.nodeName.toUpperCase()===t)))}
/**
   * Creates YXmlEvent and calls observers.
   *
   * @param {Transaction} transaction
   * @param {Set<null|string>} parentSubs Keys changed on this type. `null` if list was modified.
   */_callObserver(t,e){Le(this,t,new YXmlEvent(this,e,t))}toString(){return Be(this,(t=>t.toString())).join("")}toJSON(){return this.toString()}
/**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */toDOM(t=document,e={},n){const r=t.createDocumentFragment();n!==void 0&&n._createAssociation(r,this);Ne(this,(s=>{r.insertBefore(s.toDOM(t,e,n),null)}));return r}
/**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {number} index The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */insert(t,e){this.doc!==null?qt(this.doc,(n=>{Je(n,this,t,e)})):this._prelimContent.splice(t,0,...e)}
/**
   * Inserts new content at an index.
   *
   * @example
   *  // Insert character 'a' at position 0
   *  xml.insert(0, [new Y.XmlText('text')])
   *
   * @param {null|Item|YXmlElement|YXmlText} ref The index to insert content at
   * @param {Array<YXmlElement|YXmlText>} content The array of content
   */insertAfter(t,e){if(this.doc!==null)qt(this.doc,(n=>{const r=t&&t instanceof AbstractType?t._item:t;ze(n,this,r,e)}));else{const n=/** @type {Array<any>} */this._prelimContent;const r=t===null?0:n.findIndex((e=>e===t))+1;if(r===0&&t!==null)throw a.create("Reference item not found");n.splice(r,0,...e)}}
/**
   * Deletes elements starting from an index.
   *
   * @param {number} index Index at which to start deleting elements
   * @param {number} [length=1] The number of elements to remove. Defaults to 1.
   */delete(t,e=1){this.doc!==null?qt(this.doc,(n=>{He(n,this,t,e)})):this._prelimContent.splice(t,e)}toArray(){return Ye(this)}
/**
   * Appends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to append.
   */push(t){this.insert(this.length,t)}
/**
   * Prepends content to this YArray.
   *
   * @param {Array<YXmlElement|YXmlText>} content Array of content to prepend.
   */unshift(t){this.insert(0,t)}
/**
   * Returns the i-th element from a YArray.
   *
   * @param {number} index The index of the element to return from the YArray
   * @return {YXmlElement|YXmlText}
   */get(t){return Xe(this,t)}
/**
   * Returns a portion of this YXmlFragment into a JavaScript Array selected
   * from start to end (end not included).
   *
   * @param {number} [start]
   * @param {number} [end]
   * @return {Array<YXmlElement|YXmlText>}
   */slice(t=0,e=this.length){return Oe(this,t,e)}
/**
   * Executes a provided function on once on every child element.
   *
   * @param {function(YXmlElement|YXmlText,number, typeof self):void} f A function to execute on every element of this YArray.
   */forEach(t){Ne(this,t)}
/**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */_write(t){t.writeTypeRef(Bn)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} _decoder
 * @return {YXmlFragment}
 *
 * @private
 * @function
 */const kn=t=>new YXmlFragment
/**
 * @typedef {Object|number|null|Array<any>|string|Uint8Array|AbstractType<any>} ValueTypes
 */
/**
 * An YXmlElement imitates the behavior of a
 * https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element
 *
 * * An YXmlElement has attributes (key value pairs)
 * * An YXmlElement has childElements that must inherit from YXmlElement
 *
 * @template {{ [key: string]: ValueTypes }} [KV={ [key: string]: string }]
 */;class YXmlElement extends YXmlFragment{constructor(t="UNDEFINED"){super();this.nodeName=t;
/**
     * @type {Map<string, any>|null}
     */this._prelimAttrs=new Map}
/**
   * @type {YXmlElement|YXmlText|null}
   */get nextSibling(){const t=this._item?this._item.next:null;return t?/** @type {YXmlElement|YXmlText} */ /** @type {ContentType} */t.content.type:null}
/**
   * @type {YXmlElement|YXmlText|null}
   */get prevSibling(){const t=this._item?this._item.prev:null;return t?/** @type {YXmlElement|YXmlText} */ /** @type {ContentType} */t.content.type:null}
/**
   * Integrate this type into the Yjs instance.
   *
   * * Save this struct in the os
   * * This type is sent to other client
   * * Observer functions are fired
   *
   * @param {Doc} y The Yjs instance
   * @param {Item} item
   */_integrate(t,e){super._integrate(t,e);/** @type {Map<string, any>} */this._prelimAttrs.forEach(((t,e)=>{this.setAttribute(e,t)}));this._prelimAttrs=null}_copy(){return new YXmlElement(this.nodeName)}clone(){
/**
     * @type {YXmlElement<KV>}
     */
const t=new YXmlElement(this.nodeName);const e=this.getAttributes();y.forEach(e,((e,n)=>{typeof e==="string"&&t.setAttribute(n,e)}));t.insert(0,this.toArray().map((t=>t instanceof AbstractType?t.clone():t)));return t}toString(){const t=this.getAttributes();const e=[];const n=[];for(const e in t)n.push(e);n.sort();const r=n.length;for(let s=0;s<r;s++){const r=n[s];e.push(r+'="'+t[r]+'"')}const s=this.nodeName.toLocaleLowerCase();const i=e.length>0?" "+e.join(" "):"";return`<${s}${i}>${super.toString()}</${s}>`
/**
   * Removes an attribute from this YXmlElement.
   *
   * @param {string} attributeName The attribute name that is to be removed.
   *
   * @public
   */}removeAttribute(t){this.doc!==null?qt(this.doc,(e=>{Ge(e,this,t)})):
/** @type {Map<string,any>} */this._prelimAttrs.delete(t)}
/**
   * Sets or updates an attribute.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that is to be set.
   * @param {KV[KEY]} attributeValue The attribute value that is to be set.
   *
   * @public
   */setAttribute(t,e){this.doc!==null?qt(this.doc,(n=>{je(n,this,t,e)})):
/** @type {Map<string, any>} */this._prelimAttrs.set(t,e)}
/**
   * Returns an attribute value that belongs to the attribute name.
   *
   * @template {keyof KV & string} KEY
   *
   * @param {KEY} attributeName The attribute name that identifies the
   *                               queried value.
   * @return {KV[KEY]|undefined} The queried attribute value.
   *
   * @public
   */getAttribute(t){/** @type {any} */
return $e(this,t)}
/**
   * Returns whether an attribute exists
   *
   * @param {string} attributeName The attribute name to check for existence.
   * @return {boolean} whether the attribute exists.
   *
   * @public
   */hasAttribute(t){/** @type {any} */
return qe(this,t)}
/**
   * Returns all attribute name/value pairs in a JSON Object.
   *
   * @param {Snapshot} [snapshot]
   * @return {{ [Key in Extract<keyof KV,string>]?: KV[Key]}} A JSON Object that describes the attributes.
   *
   * @public
   */getAttributes(t){/** @type {any} */
return t?Ze(this,t):Ke(this)}
/**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks={}] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Node} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */toDOM(t=document,e={},n){const r=t.createElement(this.nodeName);const s=this.getAttributes();for(const t in s){const e=s[t];typeof e==="string"&&r.setAttribute(t,e)}Ne(this,(s=>{r.appendChild(s.toDOM(t,e,n))}));n!==void 0&&n._createAssociation(r,this);return r}
/**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */_write(t){t.writeTypeRef(Nn);t.writeKey(this.nodeName)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {YXmlElement}
 *
 * @function
 */const bn=t=>new YXmlElement(t.readKey());class YXmlEvent extends YEvent{
/**
   * @param {YXmlElement|YXmlText|YXmlFragment} target The target on which the event is created.
   * @param {Set<string|null>} subs The set of changed attributes. `null` is included if the
   *                   child list changed.
   * @param {Transaction} transaction The transaction instance with which the
   *                                  change was created.
   */
constructor(t,e,n){super(t,n);
/**
     * Whether the children changed.
     * @type {Boolean}
     * @private
     */this.childListChanged=false;
/**
     * Set of all changed attributes.
     * @type {Set<string>}
     */this.attributesChanged=new Set;e.forEach((t=>{t===null?this.childListChanged=true:this.attributesChanged.add(t)}))}}class YXmlHook extends YMap{
/**
   * @param {string} hookName nodeName of the Dom Node.
   */
constructor(t){super();
/**
     * @type {string}
     */this.hookName=t}_copy(){return new YXmlHook(this.hookName)}clone(){const t=new YXmlHook(this.hookName);this.forEach(((e,n)=>{t.set(n,e)}));return t}
/**
   * Creates a Dom Element that mirrors this YXmlElement.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object.<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type
   * @return {Element} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */toDOM(t=document,e={},n){const r=e[this.hookName];let s;s=r!==void 0?r.createDom(this):document.createElement(this.hookName);s.setAttribute("data-yjs-hook",this.hookName);n!==void 0&&n._createAssociation(s,this);return s}
/**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   */_write(t){t.writeTypeRef(Fn);t.writeKey(this.hookName)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {YXmlHook}
 *
 * @private
 * @function
 */const Sn=t=>new YXmlHook(t.readKey());class YXmlText extends YText{
/**
   * @type {YXmlElement|YXmlText|null}
   */
get nextSibling(){const t=this._item?this._item.next:null;return t?/** @type {YXmlElement|YXmlText} */ /** @type {ContentType} */t.content.type:null}
/**
   * @type {YXmlElement|YXmlText|null}
   */get prevSibling(){const t=this._item?this._item.prev:null;return t?/** @type {YXmlElement|YXmlText} */ /** @type {ContentType} */t.content.type:null}_copy(){return new YXmlText}clone(){const t=new YXmlText;t.applyDelta(this.toDelta());return t}
/**
   * Creates a Dom Element that mirrors this YXmlText.
   *
   * @param {Document} [_document=document] The document object (you must define
   *                                        this when calling this method in
   *                                        nodejs)
   * @param {Object<string, any>} [hooks] Optional property to customize how hooks
   *                                             are presented in the DOM
   * @param {any} [binding] You should not set this property. This is
   *                               used if DomBinding wants to create a
   *                               association to the created DOM type.
   * @return {Text} The {@link https://developer.mozilla.org/en-US/docs/Web/API/Element|Dom Element}
   *
   * @public
   */toDOM(t=document,e,n){const r=t.createTextNode(this.toString());n!==void 0&&n._createAssociation(r,this);return r}toString(){return this.toDelta().map((t=>{const e=[];for(const n in t.attributes){const r=[];for(const e in t.attributes[n])r.push({key:e,value:t.attributes[n][e]});r.sort(((t,e)=>t.key<e.key?-1:1));e.push({nodeName:n,attrs:r})}e.sort(((t,e)=>t.nodeName<e.nodeName?-1:1));let n="";for(let t=0;t<e.length;t++){const r=e[t];n+=`<${r.nodeName}`;for(let t=0;t<r.attrs.length;t++){const e=r.attrs[t];n+=` ${e.key}="${e.value}"`}n+=">"}n+=t.insert;for(let t=e.length-1;t>=0;t--)n+=`</${e[t].nodeName}>`;return n})).join("")}toJSON(){return this.toString()}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   */_write(t){t.writeTypeRef(Xn)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {YXmlText}
 *
 * @private
 * @function
 */const _n=t=>new YXmlText;class AbstractStruct{
/**
   * @param {ID} id
   * @param {number} length
   */
constructor(t,e){this.id=t;this.length=e}
/**
   * @type {boolean}
   */get deleted(){throw a.methodUnimplemented()}
/**
   * Merge this struct with the item to the right.
   * This method is already assuming that `this.id.clock + this.length === this.id.clock`.
   * Also this method does *not* remove right from StructStore!
   * @param {AbstractStruct} right
   * @return {boolean} whether this merged with right
   */mergeWith(t){return false}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   * @param {number} encodingRef
   */write(t,e,n){throw a.methodUnimplemented()}
/**
   * @param {Transaction} transaction
   * @param {number} offset
   */integrate(t,e){throw a.methodUnimplemented()}}const Cn=0;class GC extends AbstractStruct{get deleted(){return true}delete(){}
/**
   * @param {GC} right
   * @return {boolean}
   */mergeWith(t){if(this.constructor!==t.constructor)return false;this.length+=t.length;return true}
/**
   * @param {Transaction} transaction
   * @param {number} offset
   */integrate(t,e){if(e>0){this.id.clock+=e;this.length-=e}Ot(t.doc.store,this)}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeInfo(Cn);t.writeLen(this.length-e)}
/**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */getMissing(t,e){return null}}class ContentBinary{
/**
   * @param {Uint8Array} content
   */
constructor(t){this.content=t}getLength(){return 1}getContent(){return[this.content]}isCountable(){return true}copy(){return new ContentBinary(this.content)}
/**
   * @param {number} offset
   * @return {ContentBinary}
   */splice(t){throw a.methodUnimplemented()}
/**
   * @param {ContentBinary} right
   * @return {boolean}
   */mergeWith(t){return false}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){}
/**
   * @param {Transaction} transaction
   */delete(t){}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeBuf(this.content)}getRef(){return 3}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
 * @return {ContentBinary}
 */const Dn=t=>new ContentBinary(t.readBuf());class ContentDeleted{
/**
   * @param {number} len
   */
constructor(t){this.len=t}getLength(){return this.len}getContent(){return[]}isCountable(){return false}copy(){return new ContentDeleted(this.len)}
/**
   * @param {number} offset
   * @return {ContentDeleted}
   */splice(t){const e=new ContentDeleted(this.len-t);this.len=t;return e}
/**
   * @param {ContentDeleted} right
   * @return {boolean}
   */mergeWith(t){this.len+=t.len;return true}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){E(t.deleteSet,e.id.client,e.id.clock,this.len);e.markDeleted()}
/**
   * @param {Transaction} transaction
   */delete(t){}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeLen(this.len-e)}getRef(){return 1}}
/**
 * @private
 *
 * @param {UpdateDecoderV1 | UpdateDecoderV2 } decoder
 * @return {ContentDeleted}
 */const En=t=>new ContentDeleted(t.readLen())
/**
 * @param {string} guid
 * @param {Object<string, any>} opts
 */;const Un=(t,e)=>new Doc({guid:t,...e,shouldLoad:e.shouldLoad||e.autoLoad||false});class ContentDoc{
/**
   * @param {Doc} doc
   */
constructor(t){t._item&&console.error("This document was already integrated as a sub-document. You should create a second instance instead with the same guid.")
/**
     * @type {Doc}
     */;this.doc=t;
/**
     * @type {any}
     */const e={};this.opts=e;t.gc||(e.gc=false);t.autoLoad&&(e.autoLoad=true);t.meta!==null&&(e.meta=t.meta)}getLength(){return 1}getContent(){return[this.doc]}isCountable(){return true}copy(){return new ContentDoc(Un(this.doc.guid,this.opts))}
/**
   * @param {number} offset
   * @return {ContentDoc}
   */splice(t){throw a.methodUnimplemented()}
/**
   * @param {ContentDoc} right
   * @return {boolean}
   */mergeWith(t){return false}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){this.doc._item=e;t.subdocsAdded.add(this.doc);this.doc.shouldLoad&&t.subdocsLoaded.add(this.doc)}
/**
   * @param {Transaction} transaction
   */delete(t){t.subdocsAdded.has(this.doc)?t.subdocsAdded.delete(this.doc):t.subdocsRemoved.add(this.doc)}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeString(this.doc.guid);t.writeAny(this.opts)}getRef(){return 9}}
/**
 * @private
 *
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {ContentDoc}
 */const Vn=t=>new ContentDoc(Un(t.readString(),t.readAny()));class ContentEmbed{
/**
   * @param {Object} embed
   */
constructor(t){this.embed=t}getLength(){return 1}getContent(){return[this.embed]}isCountable(){return true}copy(){return new ContentEmbed(this.embed)}
/**
   * @param {number} offset
   * @return {ContentEmbed}
   */splice(t){throw a.methodUnimplemented()}
/**
   * @param {ContentEmbed} right
   * @return {boolean}
   */mergeWith(t){return false}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){}
/**
   * @param {Transaction} transaction
   */delete(t){}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeJSON(this.embed)}getRef(){return 5}}
/**
 * @private
 *
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {ContentEmbed}
 */const An=t=>new ContentEmbed(t.readJSON());class ContentFormat{
/**
   * @param {string} key
   * @param {Object} value
   */
constructor(t,e){this.key=t;this.value=e}getLength(){return 1}getContent(){return[]}isCountable(){return false}copy(){return new ContentFormat(this.key,this.value)}
/**
   * @param {number} _offset
   * @return {ContentFormat}
   */splice(t){throw a.methodUnimplemented()}
/**
   * @param {ContentFormat} _right
   * @return {boolean}
   */mergeWith(t){return false}
/**
   * @param {Transaction} _transaction
   * @param {Item} item
   */integrate(t,e){const n=/** @type {YText} */e.parent;n._searchMarker=null;n._hasFormatting=true}
/**
   * @param {Transaction} transaction
   */delete(t){}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeKey(this.key);t.writeJSON(this.value)}getRef(){return 6}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {ContentFormat}
 */const In=t=>new ContentFormat(t.readKey(),t.readJSON());class ContentJSON{
/**
   * @param {Array<any>} arr
   */
constructor(t){
/**
     * @type {Array<any>}
     */
this.arr=t}getLength(){return this.arr.length}getContent(){return this.arr}isCountable(){return true}copy(){return new ContentJSON(this.arr)}
/**
   * @param {number} offset
   * @return {ContentJSON}
   */splice(t){const e=new ContentJSON(this.arr.slice(t));this.arr=this.arr.slice(0,t);return e}
/**
   * @param {ContentJSON} right
   * @return {boolean}
   */mergeWith(t){this.arr=this.arr.concat(t.arr);return true}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){}
/**
   * @param {Transaction} transaction
   */delete(t){}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){const n=this.arr.length;t.writeLen(n-e);for(let r=e;r<n;r++){const e=this.arr[r];t.writeString(e===void 0?"undefined":JSON.stringify(e))}}getRef(){return 2}}
/**
 * @private
 *
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {ContentJSON}
 */const Tn=t=>{const e=t.readLen();const n=[];for(let r=0;r<e;r++){const e=t.readString();e==="undefined"?n.push(void 0):n.push(JSON.parse(e))}return new ContentJSON(n)};const vn=k.getVariable("node_env")==="development";class ContentAny{
/**
   * @param {Array<any>} arr
   */
constructor(t){
/**
     * @type {Array<any>}
     */
this.arr=t;vn&&y.deepFreeze(t)}getLength(){return this.arr.length}getContent(){return this.arr}isCountable(){return true}copy(){return new ContentAny(this.arr)}
/**
   * @param {number} offset
   * @return {ContentAny}
   */splice(t){const e=new ContentAny(this.arr.slice(t));this.arr=this.arr.slice(0,t);return e}
/**
   * @param {ContentAny} right
   * @return {boolean}
   */mergeWith(t){this.arr=this.arr.concat(t.arr);return true}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){}
/**
   * @param {Transaction} transaction
   */delete(t){}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){const n=this.arr.length;t.writeLen(n-e);for(let r=e;r<n;r++){const e=this.arr[r];t.writeAny(e)}}getRef(){return 8}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {ContentAny}
 */const xn=t=>{const e=t.readLen();const n=[];for(let r=0;r<e;r++)n.push(t.readAny());return new ContentAny(n)};class ContentString{
/**
   * @param {string} str
   */
constructor(t){
/**
     * @type {string}
     */
this.str=t}getLength(){return this.str.length}getContent(){return this.str.split("")}isCountable(){return true}copy(){return new ContentString(this.str)}
/**
   * @param {number} offset
   * @return {ContentString}
   */splice(t){const e=new ContentString(this.str.slice(t));this.str=this.str.slice(0,t);const n=this.str.charCodeAt(t-1);if(n>=55296&&n<=56319){this.str=this.str.slice(0,t-1)+"�";e.str="�"+e.str.slice(1)}return e}
/**
   * @param {ContentString} right
   * @return {boolean}
   */mergeWith(t){this.str+=t.str;return true}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){}
/**
   * @param {Transaction} transaction
   */delete(t){}
/**
   * @param {StructStore} store
   */gc(t){}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeString(e===0?this.str:this.str.slice(e))}getRef(){return 4}}
/**
 * @private
 *
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {ContentString}
 */const Mn=t=>new ContentString(t.readString())
/**
 * @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractType<any>>}
 * @private
 */;const Ln=[en,nn,yn,bn,kn,Sn,_n];const On=0;const Yn=1;const Rn=2;const Nn=3;const Bn=4;const Fn=5;const Xn=6;class ContentType{
/**
   * @param {AbstractType<any>} type
   */
constructor(t){
/**
     * @type {AbstractType<any>}
     */
this.type=t}getLength(){return 1}getContent(){return[this.type]}isCountable(){return true}copy(){return new ContentType(this.type._copy())}
/**
   * @param {number} offset
   * @return {ContentType}
   */splice(t){throw a.methodUnimplemented()}
/**
   * @param {ContentType} right
   * @return {boolean}
   */mergeWith(t){return false}
/**
   * @param {Transaction} transaction
   * @param {Item} item
   */integrate(t,e){this.type._integrate(t.doc,e)}
/**
   * @param {Transaction} transaction
   */delete(t){let e=this.type._start;while(e!==null){e.deleted?e.id.clock<(t.beforeState.get(e.id.client)||0)&&t._mergeStructs.push(e):e.delete(t);e=e.right}this.type._map.forEach((e=>{e.deleted?e.id.clock<(t.beforeState.get(e.id.client)||0)&&t._mergeStructs.push(e):e.delete(t)}));t.changed.delete(this.type)}
/**
   * @param {StructStore} store
   */gc(t){let e=this.type._start;while(e!==null){e.gc(t,true);e=e.right}this.type._start=null;this.type._map.forEach((/** @param {Item | null} item */e=>{while(e!==null){e.gc(t,true);e=e.left}}));this.type._map=new Map}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){this.type._write(t)}getRef(){return 7}}
/**
 * @private
 *
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @return {ContentType}
 */const zn=t=>new ContentType(Ln[t.readTypeRef()](t))
/**
 * @todo This should return several items
 *
 * @param {StructStore} store
 * @param {ID} id
 * @return {{item:Item, diff:number}}
 */;const Pn=(t,e)=>{
/**
   * @type {ID|null}
   */
let n=e;let r=0;let s;do{r>0&&(n=nt(n.client,n.clock+r));s=Nt(t,n);r=n.clock-s.id.clock;n=s.redone}while(n!==null&&s instanceof Item);return{item:s,diff:r}};
/**
 * Make sure that neither item nor any of its parents is ever deleted.
 *
 * This property does not persist when storing it into a database or when
 * sending it to other peers
 *
 * @param {Item|null} item
 * @param {boolean} keep
 */const Jn=(t,e)=>{while(t!==null&&t.keep!==e){t.keep=e;t=/** @type {AbstractType<any>} */t.parent._item}};
/**
 * Split leftItem into two items
 * @param {Transaction} transaction
 * @param {Item} leftItem
 * @param {number} diff
 * @return {Item}
 *
 * @function
 * @private
 */const Wn=(t,e,n)=>{const{client:r,clock:s}=e.id;const i=new Item(nt(r,s+n),e,nt(r,s+n-1),e.right,e.rightOrigin,e.parent,e.parentSub,e.content.splice(n));e.deleted&&i.markDeleted();e.keep&&(i.keep=true);e.redone!==null&&(i.redone=nt(e.redone.client,e.redone.clock+n));e.right=i;i.right!==null&&(i.right.left=i);t._mergeStructs.push(i);i.parentSub!==null&&i.right===null&&
/** @type {AbstractType<any>} */i.parent._map.set(i.parentSub,i);e.length=n;return i};
/**
 * @param {Array<StackItem>} stack
 * @param {ID} id
 */const Hn=(t,n)=>e.some(t,(/** @param {StackItem} s */t=>_(t.deletions,n)))
/**
 * Redoes the effect of this operation.
 *
 * @param {Transaction} transaction The Yjs instance.
 * @param {Item} item
 * @param {Set<Item>} redoitems
 * @param {DeleteSet} itemsToDelete
 * @param {boolean} ignoreRemoteMapChanges
 * @param {import('../utils/UndoManager.js').UndoManager} um
 *
 * @return {Item|null}
 *
 * @private
 */;const Gn=(t,e,n,r,s,i)=>{const o=t.doc;const c=o.store;const l=o.clientID;const a=e.redone;if(a!==null)return Ft(t,a);let d=/** @type {AbstractType<any>} */e.parent._item;
/**
   * @type {Item|null}
   */let h=null;
/**
   * @type {Item|null}
   */let u;if(d!==null&&d.deleted===true){if(d.redone===null&&(!n.has(d)||Gn(t,d,n,r,s,i)===null))return null;while(d.redone!==null)d=Ft(t,d.redone)}const g=d===null?/** @type {AbstractType<any>} */e.parent:/** @type {ContentType} */d.content.type;if(e.parentSub===null){h=e.left;u=e;while(h!==null){
/**
       * @type {Item|null}
       */
let e=h;while(e!==null&&/** @type {AbstractType<any>} */e.parent._item!==d)e=e.redone===null?null:Ft(t,e.redone);if(e!==null&&/** @type {AbstractType<any>} */e.parent._item===d){h=e;break}h=h.left}while(u!==null){
/**
       * @type {Item|null}
       */
let e=u;while(e!==null&&/** @type {AbstractType<any>} */e.parent._item!==d)e=e.redone===null?null:Ft(t,e.redone);if(e!==null&&/** @type {AbstractType<any>} */e.parent._item===d){u=e;break}u=u.right}}else{u=null;if(e.right&&!s){h=e;while(h!==null&&h.right!==null&&(h.right.redone||_(r,h.right.id)||Hn(i.undoStack,h.right.id)||Hn(i.redoStack,h.right.id))){h=h.right;while(h.redone)h=Ft(t,h.redone)}if(h&&h.right!==null)return null}else h=g._map.get(e.parentSub)||null}const f=Lt(c,l);const p=nt(l,f);const w=new Item(p,h,h&&h.lastId,u,u&&u.id,g,e.parentSub,e.content.copy());e.redone=p;Jn(w,true);w.integrate(t,0);return w};class Item extends AbstractStruct{
/**
   * @param {ID} id
   * @param {Item | null} left
   * @param {ID | null} origin
   * @param {Item | null} right
   * @param {ID | null} rightOrigin
   * @param {AbstractType<any>|ID|null} parent Is a type if integrated, is null if it is possible to copy parent from left or right, is ID before integration to search for it.
   * @param {string | null} parentSub
   * @param {AbstractContent} content
   */
constructor(t,e,n,r,s,i,o,c){super(t,c.getLength());
/**
     * The item that was originally to the left of this item.
     * @type {ID | null}
     */this.origin=n;
/**
     * The item that is currently to the left of this item.
     * @type {Item | null}
     */this.left=e;
/**
     * The item that is currently to the right of this item.
     * @type {Item | null}
     */this.right=r;
/**
     * The item that was originally to the right of this item.
     * @type {ID | null}
     */this.rightOrigin=s;
/**
     * @type {AbstractType<any>|ID|null}
     */this.parent=i;
/**
     * If the parent refers to this item with some kind of key (e.g. YMap, the
     * key is specified here. The key is then used to refer to the list in which
     * to insert this item. If `parentSub = null` type._start is the list in
     * which to insert to. Otherwise it is `parent._map`.
     * @type {String | null}
     */this.parentSub=o;
/**
     * If this type's effect is redone this type refers to the type that undid
     * this operation.
     * @type {ID | null}
     */this.redone=null;
/**
     * @type {AbstractContent}
     */this.content=c;
/**
     * bit1: keep
     * bit2: countable
     * bit3: deleted
     * bit4: mark - mark node as fast-search-marker
     * @type {number} byte
     */this.info=this.content.isCountable()?d.BIT2:0}
/**
   * This is used to mark the item as an indexed fast-search marker
   *
   * @type {boolean}
   */set marker(t){(this.info&d.BIT4)>0!==t&&(this.info^=d.BIT4)}get marker(){return(this.info&d.BIT4)>0}get keep(){return(this.info&d.BIT1)>0}set keep(t){this.keep!==t&&(this.info^=d.BIT1)}get countable(){return(this.info&d.BIT2)>0}
/**
   * Whether this item was deleted or not.
   * @type {Boolean}
   */get deleted(){return(this.info&d.BIT3)>0}set deleted(t){this.deleted!==t&&(this.info^=d.BIT3)}markDeleted(){this.info|=d.BIT3}
/**
   * Return the creator clientID of the missing op or define missing items and return null.
   *
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */getMissing(t,e){if(this.origin&&this.origin.client!==this.id.client&&this.origin.clock>=Lt(e,this.origin.client))return this.origin.client;if(this.rightOrigin&&this.rightOrigin.client!==this.id.client&&this.rightOrigin.clock>=Lt(e,this.rightOrigin.client))return this.rightOrigin.client;if(this.parent&&this.parent.constructor===ID&&this.id.client!==this.parent.client&&this.parent.clock>=Lt(e,this.parent.client))return this.parent.client;if(this.origin){this.left=Xt(t,e,this.origin);this.origin=this.left.lastId}if(this.rightOrigin){this.right=Ft(t,this.rightOrigin);this.rightOrigin=this.right.id}if(this.left&&this.left.constructor===GC||this.right&&this.right.constructor===GC)this.parent=null;else if(this.parent){if(this.parent.constructor===ID){const t=Nt(e,this.parent);t.constructor===GC?this.parent=null:this.parent=/** @type {ContentType} */t.content.type}}else if(this.left&&this.left.constructor===Item){this.parent=this.left.parent;this.parentSub=this.left.parentSub}else if(this.right&&this.right.constructor===Item){this.parent=this.right.parent;this.parentSub=this.right.parentSub}return null}
/**
   * @param {Transaction} transaction
   * @param {number} offset
   */integrate(t,e){if(e>0){this.id.clock+=e;this.left=Xt(t,t.doc.store,nt(this.id.client,this.id.clock-1));this.origin=this.left.lastId;this.content=this.content.splice(e);this.length-=e}if(this.parent){if(!this.left&&(!this.right||this.right.left!==null)||this.left&&this.left.right!==this.right){
/**
         * @type {Item|null}
         */
let e=this.left;
/**
         * @type {Item|null}
         */let n;if(e!==null)n=e.right;else if(this.parentSub!==null){n=/** @type {AbstractType<any>} */this.parent._map.get(this.parentSub)||null;while(n!==null&&n.left!==null)n=n.left}else n=/** @type {AbstractType<any>} */this.parent._start;
/**
         * @type {Set<Item>}
         */const r=new Set;
/**
         * @type {Set<Item>}
         */const s=new Set;while(n!==null&&n!==this.right){s.add(n);r.add(n);if(et(this.origin,n.origin)){if(n.id.client<this.id.client){e=n;r.clear()}else if(et(this.rightOrigin,n.rightOrigin))break}else{if(n.origin===null||!s.has(Nt(t.doc.store,n.origin)))break;if(!r.has(Nt(t.doc.store,n.origin))){e=n;r.clear()}}n=n.right}this.left=e}if(this.left!==null){const t=this.left.right;this.right=t;this.left.right=this}else{let t;if(this.parentSub!==null){t=/** @type {AbstractType<any>} */this.parent._map.get(this.parentSub)||null;while(t!==null&&t.left!==null)t=t.left}else{t=/** @type {AbstractType<any>} */this.parent._start;/** @type {AbstractType<any>} */this.parent._start=this}this.right=t}if(this.right!==null)this.right.left=this;else if(this.parentSub!==null){
/** @type {AbstractType<any>} */this.parent._map.set(this.parentSub,this);this.left!==null&&this.left.delete(t)}this.parentSub===null&&this.countable&&!this.deleted&&(
/** @type {AbstractType<any>} */this.parent._length+=this.length);Ot(t.doc.store,this);this.content.integrate(t,this);Wt(t,/** @type {AbstractType<any>} */this.parent,this.parentSub);(/** @type {AbstractType<any>} */this.parent._item!==null&&/** @type {AbstractType<any>} */this.parent._item.deleted||this.parentSub!==null&&this.right!==null)&&this.delete(t)}else new GC(this.id,this.length).integrate(t,0)}get next(){let t=this.right;while(t!==null&&t.deleted)t=t.right;return t}get prev(){let t=this.left;while(t!==null&&t.deleted)t=t.left;return t}get lastId(){return this.length===1?this.id:nt(this.id.client,this.id.clock+this.length-1)}
/**
   * Try to merge two items
   *
   * @param {Item} right
   * @return {boolean}
   */mergeWith(t){if(this.constructor===t.constructor&&et(t.origin,this.lastId)&&this.right===t&&et(this.rightOrigin,t.rightOrigin)&&this.id.client===t.id.client&&this.id.clock+this.length===t.id.clock&&this.deleted===t.deleted&&this.redone===null&&t.redone===null&&this.content.constructor===t.content.constructor&&this.content.mergeWith(t.content)){const e=/** @type {AbstractType<any>} */this.parent._searchMarker;e&&e.forEach((e=>{if(e.p===t){e.p=this;!this.deleted&&this.countable&&(e.index-=this.length)}}));t.keep&&(this.keep=true);this.right=t.right;this.right!==null&&(this.right.left=this);this.length+=t.length;return true}return false}
/**
   * Mark this Item as deleted.
   *
   * @param {Transaction} transaction
   */delete(t){if(!this.deleted){const e=/** @type {AbstractType<any>} */this.parent;this.countable&&this.parentSub===null&&(e._length-=this.length);this.markDeleted();E(t.deleteSet,this.id.client,this.id.clock,this.length);Wt(t,e,this.parentSub);this.content.delete(t)}}
/**
   * @param {StructStore} store
   * @param {boolean} parentGCd
   */gc(t,e){if(!this.deleted)throw a.unexpectedCase();this.content.gc(t);e?zt(t,this,new GC(this.id,this.length)):this.content=new ContentDeleted(this.length)}
/**
   * Transform the properties of this type to binary and write it to an
   * BinaryEncoder.
   *
   * This is called when this Item is sent to a remote peer.
   *
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder The encoder to write data to.
   * @param {number} offset
   */write(t,e){const n=e>0?nt(this.id.client,this.id.clock+e-1):this.origin;const r=this.rightOrigin;const s=this.parentSub;const i=this.content.getRef()&d.BITS5|(n===null?0:d.BIT8)|(r===null?0:d.BIT7)|(s===null?0:d.BIT6);t.writeInfo(i);n!==null&&t.writeLeftID(n);r!==null&&t.writeRightID(r);if(n===null&&r===null){const e=/** @type {AbstractType<any>} */this.parent;if(e._item!==void 0){const n=e._item;if(n===null){const n=it(e);t.writeParentInfo(true);t.writeString(n)}else{t.writeParentInfo(false);t.writeLeftID(n.id)}}else if(e.constructor===String){t.writeParentInfo(true);t.writeString(e)}else if(e.constructor===ID){t.writeParentInfo(false);t.writeLeftID(e)}else a.unexpectedCase();s!==null&&t.writeString(s)}this.content.write(t,e)}}
/**
 * @param {UpdateDecoderV1 | UpdateDecoderV2} decoder
 * @param {number} info
 */const jn=(t,e)=>$n[e&d.BITS5](t)
/**
 * A lookup map for reading Item content.
 *
 * @type {Array<function(UpdateDecoderV1 | UpdateDecoderV2):AbstractContent>}
 */;const $n=[()=>{a.unexpectedCase()},En,Tn,Dn,Mn,An,In,zn,xn,Vn,()=>{a.unexpectedCase()}];const Kn=10;class Skip extends AbstractStruct{get deleted(){return true}delete(){}
/**
   * @param {Skip} right
   * @return {boolean}
   */mergeWith(t){if(this.constructor!==t.constructor)return false;this.length+=t.length;return true}
/**
   * @param {Transaction} transaction
   * @param {number} offset
   */integrate(t,e){a.unexpectedCase()}
/**
   * @param {UpdateEncoderV1 | UpdateEncoderV2} encoder
   * @param {number} offset
   */write(t,e){t.writeInfo(Kn);s.writeVarUint(t.restEncoder,this.length-e)}
/**
   * @param {Transaction} transaction
   * @param {StructStore} store
   * @return {null | number}
   */getMissing(t,e){return null}}const qn=/** @type {any} */typeof globalThis!=="undefined"?globalThis:typeof window!=="undefined"?window:typeof global!=="undefined"?global:{};const Qn="__ $YJS$ __";qn[Qn]===true&&console.error("Yjs was already imported. This breaks constructor checks and will lead to issues! - https://github.com/yjs/yjs/issues/438");qn[Qn]=true;export{AbsolutePosition,AbstractConnector,AbstractStruct,AbstractType,YArray as Array,ContentAny,ContentBinary,ContentDeleted,ContentDoc,ContentEmbed,ContentFormat,ContentJSON,ContentString,ContentType,Doc,GC,ID,Item,YMap as Map,PermanentUserData,RelativePosition,Skip,Snapshot,YText as Text,Transaction,UndoManager,UpdateDecoderV1,UpdateDecoderV2,UpdateEncoderV1,UpdateEncoderV2,YXmlElement as XmlElement,YXmlFragment as XmlFragment,YXmlHook as XmlHook,YXmlText as XmlText,YArrayEvent,YEvent,YMapEvent,YTextEvent,YXmlEvent,X as applyUpdate,F as applyUpdateV2,pn as cleanupYTextFormatting,et as compareIDs,kt as compareRelativePositions,Se as convertUpdateFormatV1ToV2,_e as convertUpdateFormatV2ToV1,yt as createAbsolutePositionFromRelativePosition,U as createDeleteSet,V as createDeleteSetFromStructStore,Tt as createDocFromSnapshot,nt as createID,at as createRelativePositionFromJSON,ut as createRelativePositionFromTypeIndex,Et as createSnapshot,wt as decodeRelativePosition,Dt as decodeSnapshot,Ct as decodeSnapshotV2,H as decodeStateVector,re as decodeUpdate,se as decodeUpdateV2,ge as diffUpdate,ue as diffUpdateV2,Ut as emptySnapshot,ft as encodeRelativePosition,_t as encodeSnapshot,St as encodeSnapshotV2,J as encodeStateAsUpdate,P as encodeStateAsUpdateV2,K as encodeStateVector,ce as encodeStateVectorFromUpdate,oe as encodeStateVectorFromUpdateV2,v as equalDeleteSets,bt as equalSnapshots,Yt as findIndexSS,it as findRootTypeKey,Nt as getItem,Xt as getItemCleanEnd,Ft as getItemCleanStart,Lt as getState,Me as getTypeChildren,_ as isDeleted,ot as isParentOf,b as iterateDeletedStructs,ct as logType,ee as logUpdate,ne as logUpdateV2,D as mergeDeleteSets,ie as mergeUpdates,he as mergeUpdatesV2,ke as obfuscateUpdate,be as obfuscateUpdateV2,ae as parseUpdateMeta,le as parseUpdateMetaV2,B as readUpdate,N as readUpdateV2,lt as relativePositionToJSON,Vt as snapshot,xt as snapshotContainsUpdate,qt as transact,$t as tryGc,Re as typeListToArraySnapshot,Ze as typeMapGetAllSnapshot,Qe as typeMapGetSnapshot};

