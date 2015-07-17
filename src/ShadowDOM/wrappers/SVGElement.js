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

  var Element = scope.wrappers.Element;
  var HTMLElement = scope.wrappers.HTMLElement;
  var registerWrapper = scope.registerWrapper;
  var defineWrapGetter = scope.defineWrapGetter;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;
  var mixin = scope.mixin;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var OriginalSVGElement = window.SVGElement;

  var svgTitleElement = document.createElementNS(SVG_NS, 'title');

  // IE11 does not have classList for SVG elements. The spec says that classList
  // is an accessor on Element, but IE11 puts classList on HTMLElement, leaving
  // SVGElement without a classList property. We therefore move the accessor for
  // IE11.
  if (!('classList' in svgTitleElement)) {
    var descr = Object.getOwnPropertyDescriptor(Element.prototype, 'classList');
    Object.defineProperty(HTMLElement.prototype, 'classList', descr);
    delete Element.prototype.classList;
  }

  function SVGElement(node) {
    Element.call(this, node);
  }

  SVGElement.prototype = Object.create(Element.prototype);
  mixin(SVGElement.prototype, {
    get ownerSVGElement() {
      return wrap(unsafeUnwrap(this).ownerSVGElement);
    }
  });

  registerWrapper(OriginalSVGElement, SVGElement, document.createElementNS(SVG_NS, 'title'));

  scope.wrappers.SVGElement = SVGElement;
})(window.ShadowDOMPolyfill);
