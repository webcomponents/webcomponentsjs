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
