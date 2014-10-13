/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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
