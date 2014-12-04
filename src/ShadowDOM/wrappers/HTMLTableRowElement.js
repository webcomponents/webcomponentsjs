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
  var wrapHTMLCollection = scope.wrapHTMLCollection;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalHTMLTableRowElement = window.HTMLTableRowElement;

  function HTMLTableRowElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLTableRowElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLTableRowElement.prototype, {
    get cells() {
      return wrapHTMLCollection(unwrap(this).cells);
    },

    insertCell: function(index) {
      return wrap(unwrap(this).insertCell(index));
    }
  });

  registerWrapper(OriginalHTMLTableRowElement, HTMLTableRowElement,
                  document.createElement('tr'));

  scope.wrappers.HTMLTableRowElement = HTMLTableRowElement;
})(window.ShadowDOMPolyfill);
