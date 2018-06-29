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
// Implement Node.baseURI for IE 11
// adapted from
// https://github.com/webcomponents/html-imports/blob/v1.2.0/src/html-imports.js

if (!Object.hasOwnProperty(Node.prototype, 'baseURI')) {
  Object.defineProperty(Node.prototype, 'baseURI', {
    /**
     * @this {Node}
     * @return {string}
     */
    get() {
      // this.ownerDocument is `null` for documents
      const doc = this.ownerDocument || this;
      const base = /** @type {HTMLBaseElement} */ (doc.querySelector('base'));
      return (base || window.location).href;
    },
    configurable: true,
    enumerable: true
  });
}