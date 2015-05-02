/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var modules_HTMLImports = [
  'html/HTMLImports.html',
  'html/parser.html',
  'html/style-links.html',
  'html/style-paths.html',
  'html/load.html',
  'html/load-404.html',
  'html/load-loop.html',
  'html/base/load-base.html',
  'html/currentScript.html',
  'html/dedupe.html',
  'html/dynamic.html',
  'html/dynamic-all-imports-detail.html',
  'html/dynamic-errors-detail.html',
  'html/dynamic-loaded-detail.html',
  'html/csp.html',
  'html/customevent-detail.html',
  'html/encoding.html',
  'html/HTMLImportsLoaded-native.html'
];

if (!navigator.userAgent.match(/MSIE 10/)) {
  modules_HTMLImports.push('html/dynamic-elements.html');
}

