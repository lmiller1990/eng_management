// lib0/observable@0.2.114 downloaded from https://ga.jspm.io/npm:lib0@0.2.114/observable.js

import{c as s,s as e}from"./_/BtkFwSuw.js";import{c as r}from"./_/DxgnvLnN.js";import{f as o}from"./_/BIMv4CmZ.js";
/**
 * Handles named events.
 * @experimental
 *
 * This is basically a (better typed) duplicate of Observable, which will replace Observable in the
 * next release.
 *
 * @template {{[key in keyof EVENTS]: function(...any):void}} EVENTS
 */class ObservableV2{constructor(){
/**
     * Some desc.
     * @type {Map<string, Set<any>>}
     */
this._observers=s()}
/**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */on(s,o){e(this._observers,/** @type {string} */s,r).add(o);return o}
/**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */once(s,e){
/**
     * @param  {...any} args
     */
const r=(...o)=>{this.off(s,/** @type {any} */r);e(...o)};this.on(s,/** @type {any} */r)}
/**
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name
   * @param {EVENTS[NAME]} f
   */off(s,e){const r=this._observers.get(s);if(r!==void 0){r.delete(e);r.size===0&&this._observers.delete(s)}}
/**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @template {keyof EVENTS & string} NAME
   * @param {NAME} name The event name.
   * @param {Parameters<EVENTS[NAME]>} args The arguments that are applied to the event listener.
   */emit(e,r){return o((this._observers.get(e)||s()).values()).forEach((s=>s(...r)))}destroy(){this._observers=s()}}
/**
 * Handles named events.
 *
 * @deprecated
 * @template N
 */class Observable{constructor(){
/**
     * Some desc.
     * @type {Map<N, any>}
     */
this._observers=s()}
/**
   * @param {N} name
   * @param {function} f
   */on(s,o){e(this._observers,s,r).add(o)}
/**
   * @param {N} name
   * @param {function} f
   */once(s,e){
/**
     * @param  {...any} args
     */
const r=(...o)=>{this.off(s,r);e(...o)};this.on(s,r)}
/**
   * @param {N} name
   * @param {function} f
   */off(s,e){const r=this._observers.get(s);if(r!==void 0){r.delete(e);r.size===0&&this._observers.delete(s)}}
/**
   * Emit a named event. All registered event listeners that listen to the
   * specified name will receive the event.
   *
   * @todo This should catch exceptions
   *
   * @param {N} name The event name.
   * @param {Array<any>} args The arguments that are applied to the event listener.
   */emit(e,r){return o((this._observers.get(e)||s()).values()).forEach((s=>s(...r)))}destroy(){this._observers=s()}}export{Observable,ObservableV2};

