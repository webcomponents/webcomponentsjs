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
