/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// defer start of tests until after WebComponentsReady event
if (window.__karma__) {
  window.__karma__.loaded = function() {
    window.addEventListener('WebComponentsReady', function() {
      window.__karma__.start();
    });
  };
}
