/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('HTMLHeadElement', function() {

  var wrap = ShadowDOMPolyfill.wrap;

  var div, div2;

  teardown(function() {
    if (div && div.parentNode)
      div.parentNode.removeChild(div);
    if (div2 && div2.parentNode)
      div2.parentNode.removeChild(div2);
    div = div2 = undefined;
  });

  test('appendChild', function() {
    div = document.createElement('div');
    document.head.appendChild(div);
    assert.equal(wrap(document.head.lastChild), div);
  });

  test('appendChild (through wrapper)', function() {
    var doc = wrap(document);
    div = doc.createElement('div');
    doc.body.appendChild(div);
    assert.equal(doc.body.lastChild, div);
  });

  test('insertBefore', function() {
    div = document.createElement('div');
    document.head.appendChild(div);
    div2 = document.createElement('div');
    document.head.insertBefore(div2, div);
    assert.equal(wrap(document.head.lastChild), div);
    assert.equal(div2.nextSibling, div);
    assert.equal(div.previousSibling, div2);
  });

  test('insertBefore (through wrapper)', function() {
    var doc = wrap(document);
    div = doc.createElement('div');
    doc.body.appendChild(div);
    div2 = doc.createElement('div');
    doc.body.insertBefore(div2, div);
    assert.equal(doc.body.lastChild, div);
    assert.equal(div2.nextSibling, div);
    assert.equal(div.previousSibling, div2);
  });

  test('replaceChild', function() {
    div = document.createElement('div');
    document.head.appendChild(div);
    div2 = document.createElement('div');
    document.head.replaceChild(div2, div);
    assert.equal(wrap(document.head.lastChild), div2);
    assert.isNull(div.parentNode);
  });

  test('replaceChild (through wrapper)', function() {
    var doc = wrap(document);
    div = doc.createElement('div');
    doc.body.appendChild(div);
    div2 = doc.createElement('div');
    doc.body.replaceChild(div2, div);
    assert.equal(doc.body.lastChild, div2);
    assert.isNull(div.parentNode);
  });

  test('removeChild', function() {
    div = document.createElement('div');
    document.head.appendChild(div);
    document.head.removeChild(div);
    assert.isNull(div.parentNode);
  });

  test('removeChild (through wrapper)', function() {
    var doc = wrap(document);
    div = doc.createElement('div');
    doc.body.appendChild(div);
    doc.body.removeChild(div);
    assert.isNull(div.parentNode);
  });

  test('document.head.contains', function() {
    var doc = wrap(document);
    assert.isTrue(doc.head.contains(doc.head.firstChild));
    assert.isTrue(doc.head.contains(document.head.firstChild));
    assert.isTrue(document.head.contains(doc.head.firstChild));
    assert.isTrue(document.head.contains(document.head.firstChild));
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('head'), HTMLHeadElement);
  });

  test('constructor', function() {
    assert.equal(HTMLHeadElement,
                 document.createElement('head').constructor);
  });

});
