/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('FormData', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;

  test('instanceof', function() {
    var fd = new FormData();
    assert.instanceOf(fd, FormData);
  });

  test('constructor', function() {
    var fd = new FormData();
    assert.equal(FormData, fd.constructor);
  });

  test('form element', function() {
    var formElement = document.createElement('form');
    var fd = new FormData(formElement)
    assert.instanceOf(fd, FormData);
  });

  test('wrap/unwrap', function() {
    var fd = new FormData();
    var unwrapped = unwrap(fd);
    var wrapped = wrap(unwrapped);
    assert.equal(fd, wrapped);
  });

});
