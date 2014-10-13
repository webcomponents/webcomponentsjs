/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */
(function() {

htmlSuite('HTMLImports', function() {
  htmlTest('html/HTMLImports.html');
  htmlTest('html/parser.html');
  htmlTest('html/style-links.html');
  htmlTest('html/style-paths.html');
  htmlTest('html/load.html');
  htmlTest('html/load-404.html');
  htmlTest('html/load-loop.html');
  htmlTest('html/base/load-base.html');
  htmlTest('html/currentScript.html');
  htmlTest('html/dedupe.html');
  htmlTest('html/dynamic.html');
  htmlTest('html/csp.html');
  htmlTest('html/encoding.html');
  htmlTest('html/HTMLImportsLoaded-native.html');
  // NOTE: The MO polyfill does not function on disconnected documents
  // like html imports so dynamic elements in imports are not supported.
  if (!navigator.userAgent.match(/MSIE 10/)) {
    htmlTest('html/dynamic-elements.html');
  }
});

})();