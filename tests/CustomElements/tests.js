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

  var file = 'tests.js';
  var base;

  var src =
    document.querySelector('script[src*="' + file + '"]').getAttribute('src');
  var base = src.slice(0, src.indexOf(file));


  var modules = [
    'customElements.js',
    'upgrade.js',
    'observe.js',
    'documentRegister.js'
  ];

  modules.forEach(function(src) {
    document.write('<script src="' + base + 'js/' + src + '"></script>');
  });

})();
