// lib0/logging@0.2.114 downloaded from https://ga.jspm.io/npm:lib0@0.2.114/logging.js

import{s as o,i as t}from"./_/F4Dcacte.js";import{c as s}from"./_/DxgnvLnN.js";import{c as r}from"./_/39Y1qLDZ.js";import{m as n,k as e,t as i,l as c,a}from"./_/vQcksUoQ.js";import{s as p}from"./_/DL4KN-hR.js";import{c as l}from"./_/BtkFwSuw.js";import{a as h}from"./_/CxpjErJ1.js";import{r as d}from"./_/BtiI2mRL.js";import{U as g,O as m,P as f,R as u,G as b,a as j,B as _,b as E,c as y,d as k,e as v}from"./_/DmZ-7slG.js";import"./_/eFzIl_aA.js";import"./_/BIMv4CmZ.js";import"./_/CAPG6se6.js";import"./storage.js";import"./_/B8-QZDBa.js";import"./_/C-BzqEqE.js";import"./traits.js";import"./_/YpMeRLsW.js";import"./metric.js";import"./_/B9nlJ-nk.js";
/**
 * @type {Object<Symbol,pair.Pair<string,string>>}
 */const $={[y]:r("font-weight","bold"),[E]:r("font-weight","normal"),[_]:r("color","blue"),[j]:r("color","green"),[b]:r("color","grey"),[u]:r("color","red"),[f]:r("color","purple"),[m]:r("color","orange"),[g]:r("color","black")};
/**
 * @param {Array<string|Symbol|Object|number|function():any>} args
 * @return {Array<string|object|number>}
 */const x=o=>{o.length===1&&o[0]?.constructor===Function&&(o=/** @type {Array<string|Symbol|Object|number>} */ /** @type {[function]} */o[0]());const t=[];const s=[];const r=l();
/**
   * @type {Array<string|Object|number>}
   */let e=[];let i=0;for(;i<o.length;i++){const e=o[i];const c=$[e];if(c!==void 0)r.set(c.left,c.right);else{if(e===void 0)break;if(e.constructor!==String&&e.constructor!==Number)break;{const o=n(r);if(i>0||o.length>0){t.push("%c"+e);s.push(o)}else t.push(e)}}}if(i>0){e=s;e.unshift(t.join(""))}for(;i<o.length;i++){const t=o[i];t instanceof Symbol||e.push(t)}return e};const S=o?x:k;
/**
 * @param {Array<string|Symbol|Object|number>} args
 */const C=(...o)=>{console.log(...S(o));I.forEach((t=>t.print(o)))};
/**
 * @param {Array<string|Symbol|Object|number>} args
 */const w=(...o)=>{console.warn(...S(o));o.unshift(m);I.forEach((t=>t.print(o)))};
/**
 * @param {Error} err
 */const z=o=>{console.error(o);I.forEach((t=>t.printError(o)))};
/**
 * @param {string} url image location
 * @param {number} height height of the image in pixel
 */const A=(o,s)=>{t&&console.log("%c                      ",`font-size: ${s}px; background-size: contain; background-repeat: no-repeat; background-image: url(${o})`);I.forEach((t=>t.printImg(o,s)))};
/**
 * @param {string} base64
 * @param {number} height
 */const D=(o,t)=>A(`data:image/gif;base64,${o}`,t)
/**
 * @param {Array<string|Symbol|Object|number>} args
 */;const L=(...o)=>{console.group(...S(o));I.forEach((t=>t.group(o)))};
/**
 * @param {Array<string|Symbol|Object|number>} args
 */const M=(...o)=>{console.groupCollapsed(...S(o));I.forEach((t=>t.groupCollapsed(o)))};const N=()=>{console.groupEnd();I.forEach((o=>o.groupEnd()))};
/**
 * @param {function():Node} createNode
 */const V=o=>I.forEach((t=>t.printDom(o())))
/**
 * @param {HTMLCanvasElement} canvas
 * @param {number} height
 */;const H=(o,t)=>A(o.toDataURL(),t);const I=s();
/**
 * @param {Array<string|Symbol|Object|number>} args
 * @return {Array<Element>}
 */const R=o=>{const t=[];const s=new Map;let c=0;for(;c<o.length;c++){let a=o[c];const p=$[a];if(p!==void 0)s.set(p.left,p.right);else{a===void 0&&(a="undefined ");if(a.constructor!==String&&a.constructor!==Number)break;{const o=e("span",[r("style",n(s))],[i(a.toString())]);o.innerHTML===""&&(o.innerHTML="&nbsp;");t.push(o)}}}for(;c<o.length;c++){let s=o[c];if(!(s instanceof Symbol)){s.constructor!==String&&s.constructor!==Number&&(s=" "+p(s)+" ");t.push(e("span",[],[i(/** @type {string} */s)]))}}return t};const T="font-family:monospace;border-bottom:1px solid #e2e2e2;padding:2px;";class VConsole{
/**
   * @param {Element} dom
   */
constructor(o){this.dom=o;
/**
     * @type {Element}
     */this.ccontainer=this.dom;this.depth=0;I.add(this)}
/**
   * @param {Array<string|Symbol|Object|number>} args
   * @param {boolean} collapsed
   */group(o,t=false){h((()=>{const s=e("span",[r("hidden",t),r("style","color:grey;font-size:120%;")],[i("▼")]);const n=e("span",[r("hidden",!t),r("style","color:grey;font-size:125%;")],[i("▶")]);const p=e("div",[r("style",`${T};padding-left:${this.depth*10}px`)],[s,n,i(" ")].concat(R(o)));const l=e("div",[r("hidden",t)]);const h=e("div",[],[p,l]);c(this.ccontainer,[h]);this.ccontainer=l;this.depth++;a(p,"click",(o=>{l.toggleAttribute("hidden");s.toggleAttribute("hidden");n.toggleAttribute("hidden")}))}))}
/**
   * @param {Array<string|Symbol|Object|number>} args
   */groupCollapsed(o){this.group(o,true)}groupEnd(){h((()=>{if(this.depth>0){this.depth--;this.ccontainer=this.ccontainer.parentElement.parentElement}}))}
/**
   * @param {Array<string|Symbol|Object|number>} args
   */print(o){h((()=>{c(this.ccontainer,[e("div",[r("style",`${T};padding-left:${this.depth*10}px`)],R(o))])}))}
/**
   * @param {Error} err
   */printError(o){this.print([u,y,o.toString()])}
/**
   * @param {string} url
   * @param {number} height
   */printImg(o,t){h((()=>{c(this.ccontainer,[e("img",[r("src",o),r("height",`${d(t*1.5)}px`)])])}))}
/**
   * @param {Node} node
   */printDom(o){h((()=>{c(this.ccontainer,[o])}))}destroy(){h((()=>{I.delete(this)}))}}
/**
 * @param {Element} dom
 */const U=o=>new VConsole(o)
/**
 * @param {string} moduleName
 * @return {function(...any):void}
 */;const B=o=>v(C,o);export{_ as BLUE,y as BOLD,j as GREEN,b as GREY,m as ORANGE,f as PURPLE,u as RED,E as UNBOLD,g as UNCOLOR,VConsole,B as createModuleLogger,U as createVConsole,L as group,M as groupCollapsed,N as groupEnd,C as print,H as printCanvas,V as printDom,z as printError,A as printImg,D as printImgBase64,I as vconsoles,w as warn};

