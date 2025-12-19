// y-protocols/sync@1.0.6 downloaded from https://ga.jspm.io/npm:y-protocols@1.0.6/sync.js

import*as r from"lib0/encoding";import*as t from"lib0/decoding";import*as a from"yjs";
/**
 * @typedef {Map<number, number>} StateMap
 */const e=0;const n=1;const o=2;
/**
 * Create a sync step 1 message based on the state of the current shared document.
 *
 * @param {encoding.Encoder} encoder
 * @param {Y.Doc} doc
 */const writeSyncStep1=(t,n)=>{r.writeVarUint(t,e);const o=a.encodeStateVector(n);r.writeVarUint8Array(t,o)};
/**
 * @param {encoding.Encoder} encoder
 * @param {Y.Doc} doc
 * @param {Uint8Array} [encodedStateVector]
 */const writeSyncStep2=(t,e,o)=>{r.writeVarUint(t,n);r.writeVarUint8Array(t,a.encodeStateAsUpdate(e,o))};
/**
 * Read SyncStep1 message and reply with SyncStep2.
 *
 * @param {decoding.Decoder} decoder The reply to the received message
 * @param {encoding.Encoder} encoder The received message
 * @param {Y.Doc} doc
 */const readSyncStep1=(r,a,e)=>writeSyncStep2(a,e,t.readVarUint8Array(r))
/**
 * Read and apply Structs and then DeleteStore to a y instance.
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */;const readSyncStep2=(r,e,n)=>{try{a.applyUpdate(e,t.readVarUint8Array(r),n)}catch(r){console.error("Caught error while handling a Yjs update",r)}};
/**
 * @param {encoding.Encoder} encoder
 * @param {Uint8Array} update
 */const writeUpdate=(t,a)=>{r.writeVarUint(t,o);r.writeVarUint8Array(t,a)};
/**
 * Read and apply Structs and then DeleteStore to a y instance.
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */const i=readSyncStep2;
/**
 * @param {decoding.Decoder} decoder A message received from another client
 * @param {encoding.Encoder} encoder The reply message. Does not need to be sent if empty.
 * @param {Y.Doc} doc
 * @param {any} transactionOrigin
 */const readSyncMessage=(r,a,s,c)=>{const d=t.readVarUint(r);switch(d){case e:readSyncStep1(r,a,s);break;case n:readSyncStep2(r,s,c);break;case o:i(r,s,c);break;default:throw new Error("Unknown message type")}return d};export{e as messageYjsSyncStep1,n as messageYjsSyncStep2,o as messageYjsUpdate,readSyncMessage,readSyncStep1,readSyncStep2,i as readUpdate,writeSyncStep1,writeSyncStep2,writeUpdate};

