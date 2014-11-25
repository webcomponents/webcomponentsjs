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
