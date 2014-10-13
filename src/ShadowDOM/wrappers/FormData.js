/**
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

(function(scope) {
  'use strict';

  var registerWrapper = scope.registerWrapper;
  var setWrapper = scope.setWrapper;
  var unwrap = scope.unwrap;

  var OriginalFormData = window.FormData;
  if (!OriginalFormData) return;

  function FormData(formElement) {
    var impl;
    if (formElement instanceof OriginalFormData) {
      impl = formElement;
    } else {
      impl = new OriginalFormData(formElement && unwrap(formElement));
    }
    setWrapper(impl, this);
  }

  registerWrapper(OriginalFormData, FormData, new OriginalFormData());

  scope.wrappers.FormData = FormData;

})(window.ShadowDOMPolyfill);
