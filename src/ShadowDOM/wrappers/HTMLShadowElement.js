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
  var NodeList = scope.wrappers.NodeList;
  var registerWrapper = scope.registerWrapper;

  var OriginalHTMLShadowElement = window.HTMLShadowElement;

  function HTMLShadowElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLShadowElement.prototype = Object.create(HTMLElement.prototype);
  HTMLShadowElement.prototype.constructor = HTMLShadowElement;

  // getDistributedNodes is added in ShadowRenderer

  if (OriginalHTMLShadowElement)
    registerWrapper(OriginalHTMLShadowElement, HTMLShadowElement);

  scope.wrappers.HTMLShadowElement = HTMLShadowElement;
})(window.ShadowDOMPolyfill);
