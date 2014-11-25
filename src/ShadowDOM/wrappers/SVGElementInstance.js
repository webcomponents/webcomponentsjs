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
