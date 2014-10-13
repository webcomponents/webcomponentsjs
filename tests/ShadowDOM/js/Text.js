/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Text', function() {

  test('instanceof', function() {
    var div = document.createElement('div');
    div.textContent = 'abc';
    assert.instanceOf(div.firstChild, Text);
  });

  test('constructor', function() {
    var div = document.createElement('div');
    div.textContent = 'abc';
    assert.equal(Text, div.firstChild.constructor);
  });

  test('splitText', function() {
    var t = document.createTextNode('abcd');
    var t2 = t.splitText(3);
    assert.equal(t.data, 'abc');
    assert.equal(t2.data, 'd');

    t = document.createTextNode('abcd');
    t2 = t.splitText(0);
    assert.equal(t.data, '');
    assert.equal(t2.data, 'abcd');

    t = document.createTextNode('abcd');
    t2 = t.splitText(4);
    assert.equal(t.data, 'abcd');
    assert.equal(t2.data, '');
  });

  test('splitText with too large offset', function() {
    var t = document.createTextNode('abcd');
    assert.throws(function() {
      t.splitText(5);
    });
  });

  test('splitText negative offset', function() {
    var t = document.createTextNode('abcd');
    assert.throws(function() {
      t.splitText(-1);
    });
  });

  test('splitText siblings', function() {
    var div = document.createElement('div');
    div.innerHTML = 'abcd<b></b>';
    var t = div.firstChild;
    var b = div.lastChild;

    var t2 = t.splitText(3);
    assert.equal(t.data, 'abc');
    assert.equal(t2.data, 'd');

    assert.equal(t.nextSibling, t2);
    assert.equal(t2.nextSibling, b);
  });

});
