/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
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
