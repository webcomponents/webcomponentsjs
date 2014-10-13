/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('DOMTokenList', function() {

  test('instanceof', function() {
    var div = document.createElement('div');
    assert.instanceOf(div.classList, DOMTokenList);
  });

  test('constructor', function() {
    var div = document.createElement('div');
    assert.equal(DOMTokenList, div.classList.constructor);
  });

  test('identity', function() {
    var div = document.createElement('div');
    assert.equal(div.classList, div.classList);
  });

  test('length', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    assert.equal(classList.length, 0);
    div.className = 'a';
    assert.equal(classList.length, 1);
    div.className = 'a b';
    assert.equal(classList.length, 2);
    div.className = 'a b a';
    assert.equal(classList.length, 3);
  });

  test('item', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    assert.isNull(classList.item(0));
    div.className = 'a';
    assert.equal(classList.item(0), 'a');
    assert.isNull(classList.item(1));
    div.className = 'a b';
    assert.equal(classList.item(0), 'a');
    assert.equal(classList.item(1), 'b');
    assert.isNull(classList.item(2));
    div.className = 'a b a';
    assert.equal(classList.item(0), 'a');
    assert.equal(classList.item(1), 'b');
    assert.equal(classList.item(2), 'a');
    assert.isNull(classList.item(3));
  });

  test('contains', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    assert.isFalse(classList.contains());
    assert.isFalse(classList.contains('a'));
    div.className = 'a';
    assert.isTrue(classList.contains('a'));
    div.className = 'a b';
    assert.isTrue(classList.contains('a'));
    assert.isTrue(classList.contains('b'));
  });

  test('add', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    classList.add('a');
    assert.equal(div.className, 'a');
    classList.add('b');
    assert.equal(div.className, 'a b');
    classList.add('a');
    assert.equal(div.className, 'a b');
  });

  test('remove', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    div.className = 'a b';
    classList.remove('a');
    assert.equal(div.className, 'b');
    classList.remove('a');
    assert.equal(div.className, 'b');
    classList.remove('b');
    assert.equal(div.className, '');
  });

  test('toggle', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    div.className = 'a b';
    classList.toggle('a');
    assert.equal(div.className, 'b');
    classList.toggle('a');
    assert.equal(div.className, 'b a');
    classList.toggle('b');
    assert.equal(div.className, 'a');
  });

  test('toString', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    div.className = 'a';
    assert.equal(classList.toString(), 'a');
    div.className = 'b a';
    assert.equal(classList.toString(), 'b a');
  });
});
