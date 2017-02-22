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

  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var unwrap = scope.unwrap;
  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var wrap = scope.wrap;

  var OriginalCanvasRenderingContext2D = window.CanvasRenderingContext2D;

  function CanvasRenderingContext2D(impl) {
    setWrapper(impl, this);
  }

  mixin(CanvasRenderingContext2D.prototype, {
    get canvas() {
      return wrap(unsafeUnwrap(this).canvas);
    },

    drawImage: function() {
      var args = Array.prototype.slice.call(arguments);
      args[0] = unwrapIfNeeded(args[0]);
      unsafeUnwrap(this).drawImage.apply(unsafeUnwrap(this), args);
    },

    createPattern: function() {
      var args = Array.prototype.slice.call(arguments);
      args[0] = unwrap(args[0]);
      return unsafeUnwrap(this).createPattern.apply(unsafeUnwrap(this), args);
    }
  });

  registerWrapper(OriginalCanvasRenderingContext2D, CanvasRenderingContext2D,
                  document.createElement('canvas').getContext('2d'));

  scope.wrappers.CanvasRenderingContext2D = CanvasRenderingContext2D;
})(window.ShadowDOMPolyfill);
