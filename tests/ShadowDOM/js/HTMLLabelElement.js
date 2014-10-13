/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLLabelElement', function() {

  test('form', function() {
    var form = document.createElement('form');
    var label = document.createElement('label');
    form.appendChild(label);
    assert.equal(label.form, form);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('label'), HTMLLabelElement);
  });

  test('constructor', function() {
    assert.equal(HTMLLabelElement,
                 document.createElement('label').constructor);
  });

});
