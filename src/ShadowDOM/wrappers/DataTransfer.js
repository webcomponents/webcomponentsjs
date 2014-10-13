/**
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var unwrap = scope.unwrap;

  // DataTransfer (Clipboard in old Blink/WebKit) has a single method that
  // requires wrapping. Since it is only a method we do not need a real wrapper,
  // we can just override the method.

  var OriginalDataTransfer = window.DataTransfer || window.Clipboard;
  var OriginalDataTransferSetDragImage =
      OriginalDataTransfer.prototype.setDragImage;

  if (OriginalDataTransferSetDragImage) {
    OriginalDataTransfer.prototype.setDragImage = function(image, x, y) {
      OriginalDataTransferSetDragImage.call(this, unwrap(image), x, y);
    };
  }

})(window.ShadowDOMPolyfill);
