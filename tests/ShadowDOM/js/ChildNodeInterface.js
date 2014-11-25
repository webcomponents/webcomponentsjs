/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('ChildNodeInterface', function() {

  function getTree() {
    var tree = {};
    var div = tree.div = document.createElement('div');
    div.innerHTML = 'a<b></b>c<d></d>e';
    var a = tree.a = div.firstChild;
    var b = tree.b = a.nextSibling;
    var c = tree.c = b.nextSibling;
    var d = tree.d = c.nextSibling;
    var e = tree.e = d.nextSibling;

    var sr = tree.sr = div.createShadowRoot();
    sr.innerHTML = 'f<g></g>h<content></content>i<j></j>k';
    var f = tree.f = sr.firstChild;
    var g = tree.g = f.nextSibling;
    var h = tree.h = g.nextSibling;
    var content = tree.content = h.nextSibling;
    var i = tree.i = content.nextSibling;
    var j = tree.j = i.nextSibling;
    var k = tree.k = j.nextSibling;

    div.offsetHeight;  // trigger rendering

    return tree;
  }

  test('nextElementSibling', function() {
    var tree = getTree();

    assert.equal(tree.b.nextElementSibling, tree.d);
    assert.equal(tree.d.nextElementSibling, null);
    assert.equal(tree.g.nextElementSibling, tree.content);
    assert.equal(tree.content.nextElementSibling, tree.j);
    assert.equal(tree.j.nextElementSibling, null);
  });

  test('previousElementSibling', function() {
    var tree = getTree();

    assert.equal(tree.b.previousElementSibling, null);
    assert.equal(tree.d.previousElementSibling, tree.b);
    assert.equal(tree.g.previousElementSibling, null);
    assert.equal(tree.content.previousElementSibling, tree.g);
    assert.equal(tree.j.previousElementSibling, tree.content);
  });

  test('remove', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a>';
    var a = div.firstChild;
    a.remove();
    assert.equal(div.firstChild, null);
    assert.equal(a.parentNode, null);

    // no op.
    div.remove();
  });

});
