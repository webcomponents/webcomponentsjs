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
// import polyfill for Symbol and Object.getOwnPropertySymbols
import '../node_modules/polyfill-library/polyfills/Symbol/polyfill.js';
// import polyfill for Symbol.iterator
import '../node_modules/polyfill-library/polyfills/Symbol/iterator/polyfill.js';

// overwrite Object.keys to filter out symbols
Object.keys = function(obj) {
  return Object.getOwnPropertyNames(obj).filter((name) => {
    const prop = Object.getOwnPropertyDescriptor(obj, name);
    return prop && prop.enumerable;
  });
};

// implement iterators for IE 11
const iterator = window.Symbol.iterator;

if (!String.prototype[iterator]) {
  /** @this {String} */
  String.prototype[iterator] = function*() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  }
}

if (!Array.prototype[iterator]) {
  /** @this {Array} */
  Array.prototype[iterator] = function*() {
    for (let i = 0; i < this.length; i++) {
      yield this[i];
    }
  }
}

if (!Set.prototype[iterator]) {
  /** @this {Set} */
  Set.prototype[iterator] = function*() {
    const temp = [];
    this.forEach((value) => {
      temp.push(value);
    });
    for (let i = 0; i < temp.length; i++) {
      yield temp[i];
    }
  };
}

if (!Map.prototype[iterator]) {
  /** @this {Map} */
  Map.prototype[iterator] = function*() {
    const entries = [];
    this.forEach((value, key) => {
      entries.push([key, value]);
    });
    for(let i = 0; i < entries.length; i++) {
      yield entries[i];
    }
  };
}
