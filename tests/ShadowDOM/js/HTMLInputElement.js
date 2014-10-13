/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLInputElement', function() {

  test('form', function() {
    var form = document.createElement('form');
    var input = document.createElement('input');
    form.appendChild(input);
    assert.equal(input.form, form);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('input'), HTMLInputElement);
  });

  test('constructor', function() {
    assert.equal(HTMLInputElement,
                 document.createElement('input').constructor);
  });

});
