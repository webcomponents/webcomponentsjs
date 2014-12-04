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

  var OriginalHTMLFormElement = window.HTMLFormElement;

  function HTMLFormElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLFormElement.prototype = Object.create(HTMLElement.prototype);
  mixin(HTMLFormElement.prototype, {
    get elements() {
      // Note: technically this should be an HTMLFormControlsCollection, but
      // that inherits from HTMLCollection, so should be good enough. Spec:
      // http://www.whatwg.org/specs/web-apps/current-work/multipage/common-dom-interfaces.html#htmlformcontrolscollection
      return wrapHTMLCollection(unwrap(this).elements);
    }
  });

  registerWrapper(OriginalHTMLFormElement, HTMLFormElement,
                  document.createElement('form'));

  scope.wrappers.HTMLFormElement = HTMLFormElement;
})(window.ShadowDOMPolyfill);
