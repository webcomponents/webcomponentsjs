// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unwrap = scope.unwrap;
  var wrap = scope.wrap;

  var OriginalSVGUseElement = window.SVGUseElement;

  // IE uses SVGElement as parent interface, SVG2 (Blink & Gecko) uses
  // SVGGraphicsElement. Use the <g> element to get the right prototype.

  var SVG_NS = 'http://www.w3.org/2000/svg';
  var gWrapper = wrap(document.createElementNS(SVG_NS, 'g'));
  var useElement = document.createElementNS(SVG_NS, 'use');
  var SVGGElement = gWrapper.constructor;
  var parentInterfacePrototype = Object.getPrototypeOf(SVGGElement.prototype);
  var parentInterface = parentInterfacePrototype.constructor;

  function SVGUseElement(impl) {
    parentInterface.call(this, impl);
  }

  SVGUseElement.prototype = Object.create(parentInterfacePrototype);

  // Firefox does not expose instanceRoot.
  if ('instanceRoot' in useElement) {
    mixin(SVGUseElement.prototype, {
      get instanceRoot() {
        return wrap(unwrap(this).instanceRoot);
      },
      get animatedInstanceRoot() {
        return wrap(unwrap(this).animatedInstanceRoot);
      },
    });
  }

  registerWrapper(OriginalSVGUseElement, SVGUseElement, useElement);

  scope.wrappers.SVGUseElement = SVGUseElement;
})(window.ShadowDOMPolyfill);
