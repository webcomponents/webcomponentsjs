/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('HTMLSelectElement', function() {

  test('form', function() {
    var form = document.createElement('form');
    var select = document.createElement('select');
    form.appendChild(select);
    assert.equal(select.form, form);
  });

  test('add', function() {
    var select = document.createElement('select');

    var a = document.createElement('option');
    a.text = 'a';
    select.add(a);
    assert.equal(select.firstChild, a);

    var b = document.createElement('option');
    b.text = 'b';
    select.add(b, a);
    assert.equal(select.firstChild, b);
    assert.equal(select.lastChild, a);

    // https://code.google.com/p/chromium/issues/detail?id=345345
    if (/WebKit/.test(navigator.userAgent))
      return;

    var c = document.createElement('option');
    c.text = 'c';
    select.add(c, 1);
    assert.equal(select.firstChild, b);
    assert.equal(b.nextSibling, c);
    assert.equal(select.lastChild, a);
  });

  test('remove', function() {
    var select = document.createElement('select');

    var a = document.createElement('option');
    a.text = 'a';
    select.appendChild(a);

    var b = document.createElement('option');
    b.text = 'b';
    select.appendChild(b);

    var c = document.createElement('option');
    c.text = 'c';
    select.appendChild(c);

    select.remove(a);
    assert.equal(select.firstChild, b);
    assert.equal(select.lastChild, c);

    select.remove(1);
    assert.equal(select.firstChild, b);
    assert.equal(select.lastChild, b);
  });

  test('remove no args', function() {
    var div = document.createElement('div');
    var select = div.appendChild(document.createElement('select'));

    var a = document.createElement('option');
    a.text = 'a';
    select.appendChild(a);
    var b = document.createElement('option');
    b.text = 'b';
    select.appendChild(b);

    assert.equal(select.parentNode, div);

    select.remove();
    assert.equal(select.firstChild, a);
    assert.equal(select.lastChild, b);
    assert.equal(select.parentNode, null);
    assert.equal(div.firstChild, null);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('select'), HTMLSelectElement);
  });

  test('constructor', function() {
    assert.equal(HTMLSelectElement,
                 document.createElement('select').constructor);
  });

});
