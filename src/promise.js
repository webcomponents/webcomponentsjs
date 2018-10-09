/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import PromisePolyfill from '../node_modules/promise-polyfill/src/index.js';

/*
Assign the ES6 promise polyfill to window ourselves instead of using the "auto" polyfill
to work around https://github.com/webcomponents/webcomponentsjs/issues/837
*/
if (!window.Promise) {
  window.Promise = PromisePolyfill;
  // save Promise API
  /* eslint-disable no-self-assign */
  // PromisePolyfill.prototype['catch'] = PromisePolyfill.prototype.catch;
  PromisePolyfill.prototype['then'] = PromisePolyfill.prototype.then;
  // PromisePolyfill.prototype['finally'] = PromisePolyfill.prototype.finally;
  PromisePolyfill['all'] = PromisePolyfill.all;
  PromisePolyfill['race'] = PromisePolyfill.race;
  PromisePolyfill['resolve'] = PromisePolyfill.resolve;
  PromisePolyfill['reject'] = PromisePolyfill.reject;
  /* eslint-enable */

  // approach copied from https://github.com/Polymer/polymer/blob/v3.0.2/lib/utils/async.js
  const node = document.createTextNode('');
  const twiddleNode = function twiddleNode() {
    node.textContent = node.textContent.length > 0 ? '' : 'a';
  };
  /** @type {!Array<function():void>} */
  const callbacks = [];
  (new MutationObserver(() => {
    const len = callbacks.length;
    for (let i = 0; i < len; i++) {
      callbacks[i]();
    }
    callbacks.splice(0, len);
  }).observe(node, {characterData: true}));

  // set _immediateFn to a MutationObserver for close-to-native timing
  PromisePolyfill._immediateFn = (fn) => {
    callbacks.push(fn);
    twiddleNode();
  }
}
