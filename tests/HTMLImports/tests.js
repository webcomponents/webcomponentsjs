/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
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
  htmlTest('html/dynamic-all-imports-detail.html');
  htmlTest('html/dynamic-errors-detail.html');
  htmlTest('html/dynamic-loaded-detail.html');
  htmlTest('html/csp.html');
  htmlTest('html/customevent-detail.html');
  htmlTest('html/encoding.html');
  htmlTest('html/HTMLImportsLoaded-native.html');
  // NOTE: The MO polyfill does not function on disconnected documents
  // like html imports so dynamic elements in imports are not supported.
  if (!navigator.userAgent.match(/MSIE 10/)) {
    htmlTest('html/dynamic-elements.html');
  }
});

})();
