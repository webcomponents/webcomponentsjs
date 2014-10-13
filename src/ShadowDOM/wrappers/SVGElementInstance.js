// Copyright 2014 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var EventTarget = scope.wrappers.EventTarget;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  var OriginalSVGElementInstance = window.SVGElementInstance;
  if (!OriginalSVGElementInstance)
    return;

  function SVGElementInstance(impl) {
    EventTarget.call(this, impl);
  }

  SVGElementInstance.prototype = Object.create(EventTarget.prototype);
  mixin(SVGElementInstance.prototype, {
    /** @type {SVGElement} */
    get correspondingElement() {
      return wrap(unsafeUnwrap(this).correspondingElement);
    },

    /** @type {SVGUseElement} */
    get correspondingUseElement() {
      return wrap(unsafeUnwrap(this).correspondingUseElement);
    },

    /** @type {SVGElementInstance} */
    get parentNode() {
      return wrap(unsafeUnwrap(this).parentNode);
    },

    /** @type {SVGElementInstanceList} */
    get childNodes() {
      throw new Error('Not implemented');
    },

    /** @type {SVGElementInstance} */
    get firstChild() {
      return wrap(unsafeUnwrap(this).firstChild);
    },

    /** @type {SVGElementInstance} */
    get lastChild() {
      return wrap(unsafeUnwrap(this).lastChild);
    },

    /** @type {SVGElementInstance} */
    get previousSibling() {
      return wrap(unsafeUnwrap(this).previousSibling);
    },

    /** @type {SVGElementInstance} */
    get nextSibling() {
      return wrap(unsafeUnwrap(this).nextSibling);
    }
  });

  registerWrapper(OriginalSVGElementInstance, SVGElementInstance);

  scope.wrappers.SVGElementInstance = SVGElementInstance;
})(window.ShadowDOMPolyfill);
