// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var Element = scope.wrappers.Element;
  var HTMLElement = scope.wrappers.HTMLElement;
  var registerObject = scope.registerObject;

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var svgTitleElement = document.createElementNS(SVG_NS, 'title');
  var SVGTitleElement = registerObject(svgTitleElement);
  var SVGElement = Object.getPrototypeOf(SVGTitleElement.prototype).constructor;

  // IE11 does not have classList for SVG elements. The spec says that classList
  // is an accessor on Element, but IE11 puts classList on HTMLElement, leaving
  // SVGElement without a classList property. We therefore move the accessor for
  // IE11.
  if (!('classList' in svgTitleElement)) {
    var descr = Object.getOwnPropertyDescriptor(Element.prototype, 'classList');
    Object.defineProperty(HTMLElement.prototype, 'classList', descr);
    delete Element.prototype.classList;
  }

  scope.wrappers.SVGElement = SVGElement;
})(window.ShadowDOMPolyfill);
