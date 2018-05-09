/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
'use strict';

import Symbol from '../node_modules/es-symbol/dist/symbol.js';

if (!window['Symbol']) {
  window['Symbol'] = Symbol;

  // implement iterators for IE 11

  /** @this {Array} */
  Array.prototype[Symbol.iterator] = function*() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  };

  /** @this {Set} */
  Set.prototype[Symbol.iterator] = function*() {
    const temp = [];
    this.forEach((value) => {
      temp.push(value);
    });
    for (let i = 0; i < temp.length; i++) {
      yield temp[i];
    }
  };

  /** @this {Map} */
  Map.prototype[Symbol.iterator] = function*() {
    const entries = [];
    this.forEach((value, key) => {
      entries.push([key, value]);
    });
    for(let i = 0; i < entries.length; i++) {
      yield entries[i];
    }
  };

  /** @this {String} */
  String.prototype[Symbol.iterator] = function*() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  };
}