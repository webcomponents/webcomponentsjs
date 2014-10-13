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

  var OriginalHTMLTableSectionElement = window.HTMLTableSectionElement;

  function HTMLTableSectionElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLTableSectionElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLTableSectionElement.prototype, {
    constructor: HTMLTableSectionElement,
    get rows() {
      return wrapHTMLCollection(unwrap(this).rows);
    },
    insertRow: function(index) {
      return wrap(unwrap(this).insertRow(index));
    }
  });

  registerWrapper(OriginalHTMLTableSectionElement, HTMLTableSectionElement,
                  document.createElement('thead'));

  scope.wrappers.HTMLTableSectionElement = HTMLTableSectionElement;
})(window.ShadowDOMPolyfill);
