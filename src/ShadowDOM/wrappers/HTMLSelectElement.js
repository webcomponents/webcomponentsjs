// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalHTMLSelectElement = window.HTMLSelectElement;

  function HTMLSelectElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLSelectElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLSelectElement.prototype, {
    add: function(element, before) {
      if (typeof before === 'object')  // also includes null
        before = unwrap(before);
      unwrap(this).add(unwrap(element), before);
    },

    remove: function(indexOrNode) {
      // Spec only allows index but implementations allow index or node.
      // remove() is also allowed which is same as remove(undefined)
      if (indexOrNode === undefined) {
        HTMLElement.prototype.remove.call(this);
        return;
      }

      if (typeof indexOrNode === 'object')
        indexOrNode = unwrap(indexOrNode);

      unwrap(this).remove(indexOrNode);
    },

    get form() {
      return wrap(unwrap(this).form);
    }
  });

  registerWrapper(OriginalHTMLSelectElement, HTMLSelectElement,
                  document.createElement('select'));

  scope.wrappers.HTMLSelectElement = HTMLSelectElement;
})(window.ShadowDOMPolyfill);
