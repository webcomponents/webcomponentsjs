/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLButtonElement', function() {

  test('form', function() {
    var form = document.createElement('form');
    var button = document.createElement('button');
    form.appendChild(button);
    assert.equal(button.form, form);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('button'), HTMLButtonElement);
  });

  test('constructor', function() {
    assert.equal(HTMLButtonElement,
                 document.createElement('button').constructor);
  });

});
