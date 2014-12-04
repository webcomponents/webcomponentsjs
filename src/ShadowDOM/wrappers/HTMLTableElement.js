/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;
  var wrapHTMLCollection = scope.wrapHTMLCollection;

  var OriginalHTMLTableElement = window.HTMLTableElement;

  function HTMLTableElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLTableElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLTableElement.prototype, {
    get caption() {
      return wrap(unwrap(this).caption);
    },
    createCaption: function() {
      return wrap(unwrap(this).createCaption());
    },

    get tHead() {
      return wrap(unwrap(this).tHead);
    },
    createTHead: function() {
      return wrap(unwrap(this).createTHead());
    },

    createTFoot: function() {
      return wrap(unwrap(this).createTFoot());
    },
    get tFoot() {
      return wrap(unwrap(this).tFoot);
    },

    get tBodies() {
      return wrapHTMLCollection(unwrap(this).tBodies);
    },
    createTBody: function() {
      return wrap(unwrap(this).createTBody());
    },

    get rows() {
      return wrapHTMLCollection(unwrap(this).rows);
    },
    insertRow: function(index) {
      return wrap(unwrap(this).insertRow(index));
    }
  });

  registerWrapper(OriginalHTMLTableElement, HTMLTableElement,
                  document.createElement('table'));

  scope.wrappers.HTMLTableElement = HTMLTableElement;
})(window.ShadowDOMPolyfill);
