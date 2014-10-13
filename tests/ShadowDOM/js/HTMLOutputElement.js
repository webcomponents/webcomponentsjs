/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLOutputElement', function() {
  // Not implemented in IE10.
  if (!window.HTMLOutputElement)
    return;

  test('form', function() {
    var form = document.createElement('form');
    var output = document.createElement('output');
    form.appendChild(output);
    assert.equal(output.form, form);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('output'), HTMLOutputElement);
  });

  test('constructor', function() {
    assert.equal(HTMLOutputElement,
                 document.createElement('output').constructor);
  });

});
