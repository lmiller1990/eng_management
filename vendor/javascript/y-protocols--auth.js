// y-protocols/auth@1.0.6 downloaded from https://ga.jspm.io/npm:y-protocols@1.0.6/auth.js

import"yjs";import*as r from"lib0/encoding";import*as i from"lib0/decoding";const t=0;
/**
 * @param {encoding.Encoder} encoder
 * @param {string} reason
 */const writePermissionDenied=(i,o)=>{r.writeVarUint(i,t);r.writeVarString(i,o)};
/**
 * @callback PermissionDeniedHandler
 * @param {any} y
 * @param {string} reason
 */
/**
 *
 * @param {decoding.Decoder} decoder
 * @param {Y.Doc} y
 * @param {PermissionDeniedHandler} permissionDeniedHandler
 */const readAuthMessage=(r,o,n)=>{switch(i.readVarUint(r)){case t:n(o,i.readVarString(r))}};export{t as messagePermissionDenied,readAuthMessage,writePermissionDenied};

