/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('TreeScope', function() {

  var getTreeScope = ShadowDOMPolyfill.getTreeScope;

  test('Basic', function() {
    var div = document.createElement('div');

    var ts = getTreeScope(div);
    assert.equal(ts.root, div);

    div.innerHTML = '<a><b></b></a>';
    var a = div.firstChild;
    var b = a.firstChild;

    assert.equal(getTreeScope(a), ts);
    assert.equal(getTreeScope(b), ts);
  });

  test('ShadowRoot', function() {
    var div = document.createElement('div');

    var ts = getTreeScope(div);
    assert.equal(ts.root, div);

    div.innerHTML = '<a><b></b></a>';
    var a = div.firstChild;
    var b = a.firstChild;

    var sr = a.createShadowRoot();

    var srTs = getTreeScope(sr);
    assert.equal(srTs.root, sr);
    assert.equal(srTs.parent, ts);

    sr.innerHTML = '<c><d></d></c>';
    var c = sr.firstChild;
    var d = c.firstChild;

    assert.equal(getTreeScope(c), srTs);
    assert.equal(getTreeScope(d), srTs);
  });

  test('change parent in shadow', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a>';
    var a = div.firstChild;

    var sr = a.createShadowRoot();
    sr.innerHTML = '<b></b>';
    var b = sr.firstChild;

    var sr2 = b.createShadowRoot();
    sr2.innerHTML = '<c></c>';
    var c = sr2.firstChild;

    var sr3 = a.createShadowRoot();
    sr3.innerHTML = '<d></d>';
    var d = sr3.firstChild;

    var ts1 = getTreeScope(a);
    var ts2 = getTreeScope(b);
    var ts3 = getTreeScope(c);
    var ts4 = getTreeScope(d);

    assert.equal(ts1.parent, null);
    assert.equal(ts2.parent, ts1);
    assert.equal(ts3.parent, ts2);
    assert.equal(ts4.parent, ts2);

    var div2 = document.createElement('div');
    div2.appendChild(a);

    var ts5 = getTreeScope(a);
    assert.notEqual(ts1, ts5);
    assert.equal(ts2.parent, ts5);
    assert.equal(ts3.parent, ts2);
    assert.equal(ts4.parent, ts5);
  });

});
