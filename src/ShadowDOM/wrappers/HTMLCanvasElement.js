// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

(function(scope) {
  'use strict';

  var HTMLElement = scope.wrappers.HTMLElement;
  var mixin = scope.mixin;
  var registerWrapper = scope.registerWrapper;
  var unsafeUnwrap = scope.unsafeUnwrap;
  var wrap = scope.wrap;

  var OriginalHTMLCanvasElement = window.HTMLCanvasElement;

  function HTMLCanvasElement(node) {
    HTMLElement.call(this, node);
  }
  HTMLCanvasElement.prototype = Object.create(HTMLElement.prototype);

  mixin(HTMLCanvasElement.prototype, {
    getContext: function() {
      var context = unsafeUnwrap(this).getContext.apply(unsafeUnwrap(this), arguments);
      return context && wrap(context);
    }
  });

  registerWrapper(OriginalHTMLCanvasElement, HTMLCanvasElement,
                  document.createElement('canvas'));

  scope.wrappers.HTMLCanvasElement = HTMLCanvasElement;
})(window.ShadowDOMPolyfill);
