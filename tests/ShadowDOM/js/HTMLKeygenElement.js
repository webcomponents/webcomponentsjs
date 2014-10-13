/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLKeygenElement', function() {
  // Not implemented in Firefox.
  if (!window.HTMLKeygenElement)
    return;

  test('form', function() {
    var form = document.createElement('form');
    var keygen = document.createElement('keygen');
    form.appendChild(keygen);
    assert.equal(keygen.form, form);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('keygen'), HTMLKeygenElement);
  });

  test('constructor', function() {
    assert.equal(HTMLKeygenElement,
                 document.createElement('keygen').constructor);
  });

});
