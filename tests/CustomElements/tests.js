/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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