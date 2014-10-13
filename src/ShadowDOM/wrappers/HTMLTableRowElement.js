/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
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
