/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

var modules_CustomElements = [
  'js/customElements.js',
  'js/upgrade.js',
  'js/observe.js',
  'js/documentRegister.js'
];

if (window.WCT) {
  modules_CustomElements = modules_CustomElements.concat(
    [
      'html/attributes.html',
      'html/customevent-detail.html',
      'html/imports.html',
      'html/shadowdom.html',
      'html/upgrade-dcl.html',
      'html/upgrade-order.html'
    ]
  );
}
