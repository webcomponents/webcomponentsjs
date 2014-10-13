/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var unwrapIfNeeded = scope.unwrapIfNeeded;
  var originalSend = XMLHttpRequest.prototype.send;

  // Since we only need to adjust XHR.send, we just patch it instead of wrapping
  // the entire object. This happens when FormData is passed.
  XMLHttpRequest.prototype.send = function(obj) {
    return originalSend.call(this, unwrapIfNeeded(obj));
  };

})(window.ShadowDOMPolyfill);
