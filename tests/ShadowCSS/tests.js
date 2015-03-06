/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

htmlSuite('ShadowCss', function() {
  htmlTest('html/pseudo-scoping.html');
  htmlTest('html/pseudo-scoping.html?shadow');
  htmlTest('html/pseudo-scoping-strict.html');
  htmlTest('html/pseudo-scoping-strict.html?shadow');
  htmlTest('html/polyfill-directive.html');
  htmlTest('html/polyfill-rule.html');
  htmlTest('html/colon-host.html');
  htmlTest('html/colon-host.html?shadow');
  htmlTest('html/combinators.html?shadow');
  htmlTest('html/combinators-shadow.html');
  htmlTest('html/combinators-shadow.html?shadow');
  htmlTest('html/compressed.html');
  htmlTest('html/before-content.html');
  htmlTest('html/before-content.html?shadow');
  htmlTest('html/before-content.html');
  htmlTest('html/style-import.html');
  htmlTest('html/style-import-base-tag.html');
  htmlTest('html/css-animation.html');
});
