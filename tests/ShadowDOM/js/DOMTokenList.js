/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('DOMTokenList', function() {
  if (!window.DOMTokenList) {
    test('classList returns undefined if not supported', function() {
      var div = document.createElement('div');
      assert.isUndefined(div.classList);
    });
    return;
  }

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

  test('index', function() {
    var div = document.createElement('div');
    var classList = div.classList;
    classList.add('a');
    classList.add('b');
    assert.equal(classList[0], 'a');
    assert.equal(classList[1], 'b');
  });
});
