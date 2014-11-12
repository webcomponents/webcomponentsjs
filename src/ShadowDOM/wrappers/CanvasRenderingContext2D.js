// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

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
