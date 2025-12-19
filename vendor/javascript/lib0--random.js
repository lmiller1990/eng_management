// lib0/random@0.2.114 downloaded from https://ga.jspm.io/npm:lib0@0.2.114/random.js

import{f as t}from"./_/BtiI2mRL.js";import{i as o,h as r}from"./_/DAZ1v26g.js";import{getRandomValues as n}from"lib0/webcrypto";const e=Math.random;const s=()=>n(new Uint32Array(1))[0];const c=()=>{const t=n(new Uint32Array(8));return(t[0]&o)*(r+1)+(t[1]>>>0)};
/**
 * @template T
 * @param {Array<T>} arr
 * @return {T}
 */const i=o=>o[t(e()*o.length)];const a=[1e7]+-1e3+-4e3+-8e3+-1e11;const m=()=>a.replace(/[018]/g,(/** @param {number} c */t=>(t^s()&15>>t/4).toString(16)));export{i as oneOf,e as rand,s as uint32,c as uint53,m as uuidv4};

