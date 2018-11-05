/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

// import polyfill for Symbol and Object.getOwnPropertySymbols
import '../node_modules/get-own-property-symbols/build/get-own-property-symbols.max.js';

// Fix issue in toString patch when compiled into strict mode via closure
// https://github.com/es-shims/get-own-property-symbols/issues/16
const toString = Object.prototype.toString;
Object.prototype.toString = function() {
  if (this === undefined) {
    return '[object Undefined]';
  } else if (this === null) {
    return '[object Null]';
  } else {
    return toString.call(this);
  }
}

// overwrite Object.keys to filter out symbols
Object.keys = function(obj) {
  return Object.getOwnPropertyNames(obj).filter((name) => {
    const prop = Object.getOwnPropertyDescriptor(obj, name);
    return prop && prop.enumerable;
  });
};

// implement iterators for IE 11
const iterator = window.Symbol.iterator;

if (!String.prototype[iterator] || !String.prototype.codePointAt) {
  /** @this {String} */
  String.prototype[iterator] = function*() {
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
