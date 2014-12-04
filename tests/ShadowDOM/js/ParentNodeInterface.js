/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('ParentNodeInterface', function() {

  test('childElementCount', function() {
    var div = document.createElement('div');
    div.innerHTML = 'a<b></b>c';
    assert.equal(div.childElementCount, 1);
    div.appendChild(document.createElement('d'));
    assert.equal(div.childElementCount, 2);
    div.appendChild(document.createTextNode('e'));
    assert.equal(div.childElementCount, 2);

    var sr = div.createShadowRoot();
    sr.innerHTML = 'f<content></content>g';

    div.offsetHeight;  // trigger rendering

    assert.equal(sr.childElementCount, 1);
    assert.equal(div.childElementCount, 2);
  });

  test('children', function() {
    var div = document.createElement('div');
    div.innerHTML = 'a<b></b>c';
    var b = div.firstChild.nextSibling;

    assertArrayEqual(div.children, [b]);
    var d = div.appendChild(document.createElement('d'));
    assertArrayEqual(div.children, [b, d]);
    div.appendChild(document.createTextNode('e'));
    assertArrayEqual(div.children, [b, d]);

    var sr = div.createShadowRoot();
    sr.innerHTML = 'f<content></content>g';
    var content = sr.firstChild.nextSibling;

    div.offsetHeight;  // trigger rendering

    assertArrayEqual(sr.children, [content]);
    assertArrayEqual(div.children, [b, d]);
  });

  test('firstElementChild', function() {
    var div = document.createElement('div');
    div.innerHTML = 'a<b></b>c';
    var b = div.firstChild.nextSibling;

    assert.equal(div.firstElementChild, b);

    var sr = div.createShadowRoot();
    sr.innerHTML = 'f<content></content>g';
    var content = sr.firstChild.nextSibling;

    div.offsetHeight;  // trigger rendering

    assert.equal(sr.firstElementChild, content);
    assert.equal(div.firstElementChild, b);
  });

  test('lastElementChild', function() {
    var div = document.createElement('div');
    div.innerHTML = 'a<b></b>c';
    var b = div.firstChild.nextSibling;

    assert.equal(div.lastElementChild, b);

    var sr = div.createShadowRoot();
    sr.innerHTML = 'f<content></content>g';
    var content = sr.firstChild.nextSibling;

    div.offsetHeight;  // trigger rendering

    assert.equal(sr.lastElementChild, content);
    assert.equal(div.lastElementChild, b);
  });

});
