// lib0/hash/sha256@0.2.114 downloaded from https://ga.jspm.io/npm:lib0@0.2.114/hash/sha256.js

import{B as t,a as e}from"../_/DAZ1v26g.js";
/**
 * @param {number} w - a 32bit uint
 * @param {number} shift
 */const s=(t,e)=>t>>>e|t<<32-e
/**
 * Helper for SHA-224 & SHA-256. See 4.1.2.
 * @param {number} x
 */;const n=t=>s(t,2)^s(t,13)^s(t,22)
/**
 * Helper for SHA-224 & SHA-256. See 4.1.2.
 * @param {number} x
 */;const h=t=>s(t,6)^s(t,11)^s(t,25)
/**
 * Helper for SHA-224 & SHA-256. See 4.1.2.
 * @param {number} x
 */;const i=t=>s(t,7)^s(t,18)^t>>>3
/**
 * Helper for SHA-224 & SHA-256. See 4.1.2.
 * @param {number} x
 */;const r=t=>s(t,17)^s(t,19)^t>>>10;const l=new Uint32Array([1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298]);const o=new Uint32Array([1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225]);class Hasher{constructor(){const t=new ArrayBuffer(320);this._H=new Uint32Array(t,0,8);this._H.set(o);this._W=new Uint32Array(t,64,64)}_updateHash(){const t=this._H;const e=this._W;for(let t=16;t<64;t++)e[t]=r(e[t-2])+e[t-7]+i(e[t-15])+e[t-16];let s=t[0];let o=t[1];let _=t[2];let a=t[3];let c=t[4];let f=t[5];let W=t[6];let g=t[7];for(let t,i,r=0;r<64;r++){t=g+h(c)+(c&f^~c&W)+l[r]+e[r]>>>0;i=n(s)+(s&o^s&_^o&_)>>>0;g=W;W=f;f=c;c=a+t>>>0;a=_;_=o;o=s;s=t+i>>>0}t[0]+=s;t[1]+=o;t[2]+=_;t[3]+=a;t[4]+=c;t[5]+=f;t[6]+=W;t[7]+=g}
/**
   * Returns a 32-byte hash.
   *
   * @param {Uint8Array} data
   */digest(s){let n=0;for(;n+56<=s.length;){let e=0;for(;e<16&&n+3<s.length;e++)this._W[e]=s[n++]<<24|s[n++]<<16|s[n++]<<8|s[n++];if(n%64!==0){this._W.fill(0,e,16);while(n<s.length){this._W[e]|=s[n]<<8*(3-n%4);n++}this._W[e]|=t<<8*(3-n%4)}this._updateHash()}const h=n%64!==0;this._W.fill(0,0,16);let i=0;for(;n<s.length;i++)for(let t=3;t>=0&&n<s.length;t--)this._W[i]|=s[n++]<<t*8;h||(this._W[i-(n%4===0?0:1)]|=t<<8*(3-n%4));this._W[14]=s.byteLength/e;this._W[15]=s.byteLength*8;this._updateHash();const r=new Uint8Array(32);for(let t=0;t<this._H.length;t++)for(let e=0;e<4;e++)r[t*4+e]=this._H[t]>>>8*(3-e);return r}}
/**
 * Returns a 32-byte hash.
 *
 * @param {Uint8Array} data
 */const _=t=>(new Hasher).digest(t);export{_ as digest};

