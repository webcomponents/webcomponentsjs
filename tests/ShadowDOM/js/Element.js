/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Element', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var div;

  teardown(function() {
    if (div && div.parentNode)
      div.parentNode.removeChild(div);
    div = null;
  });

  function skipTest () {}

  test('querySelector', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a><b></b></a>';
    var b = div.firstChild.firstChild;
    assert.equal(div.querySelector('b'), b);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<b></b>';
    var srb = sr.firstChild;

    div.offsetHeight;

    assert.equal(div.querySelector('b'), b);
    assert.equal(sr.querySelector('b'), srb);

    var z = div.querySelector('z');
    assert.equal(z, null);

    var z = sr.querySelector('z');
    assert.equal(z, null);
  });

  test('querySelectorAll', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.querySelectorAll('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);
  });

  skipTest('querySelectorAll', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var sr = div.createShadowRoot();
    sr.innerHTML = '<a>3</a><a>4</a>';
    var a3 = sr.firstChild;
    var a4 = sr.lastChild;

    div.offsetHeight;

    var as = div.querySelectorAll('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as[1], a1);

    var as = sr.querySelectorAll('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a3);
    assert.equal(as[1], a4);

    var z = div.querySelectorAll('z');
    assert.equal(z.length, 0);

    var z = sr.querySelectorAll('z');
    assert.equal(z.length, 0);
  });

  test('querySelector deep', function() {
    var div = document.createElement('div');
    div.innerHTML = '<aa></aa><aa></aa>';
    var aa1 = div.firstChild;
    var aa2 = div.lastChild;

    var sr = div.createShadowRoot();
    sr.innerHTML = '<bb></bb><content></content>';
    var bb = sr.firstChild;

    div.offsetHeight;

    assert.equal(aa1, div.querySelector('div /deep/ aa'));
    assert.equal(bb, div.querySelector('div /deep/ bb'));
  });

  test('querySelector ::shadow', function() {
    var div = document.createElement('div');
    var div2 = document.createElement('div');
    div.appendChild(div2);
    var sr = div2.createShadowRoot();
    sr.innerHTML = '<bb></bb>';
    var bb = sr.firstChild;

    div.offsetHeight;

    assert.equal(bb, div.querySelector('div::shadow bb'));
  });

  test('querySelectorAll deep', function() {
    var div = document.createElement('div');
    div.innerHTML = '<aa></aa><aa></aa>';
    var aa1 = div.firstChild;
    var aa2 = div.lastChild;

    var sr = div.createShadowRoot();
    sr.innerHTML = '<bb></bb><content></content>';
    var bb = sr.firstChild;

    div.offsetHeight;

    ['div /deep/ aa', 'div >>> aa'].forEach(function(selector) {
      var list = div.querySelectorAll(selector);
      assert.equal(2, list.length);
      assert.equal(aa1, list[0]);
      assert.equal(aa2, list[1]);
    });

    ['div /deep/ bb', 'div >>> bb'].forEach(function(selector) {
      var list = div.querySelectorAll(selector);
      assert.equal(1, list.length);
      assert.equal(bb, list[0]);
    });
  });

  test('querySelectorAll ::shadow', function() {
    var div = document.createElement('div');
    var div2 = document.createElement('div');
    div.appendChild(div2);
    var sr = div2.createShadowRoot();
    sr.innerHTML = '<bb></bb><bb></bb>';
    var bb = sr.firstChild;

    div.offsetHeight;

    var list = div.querySelectorAll('div::shadow bb');
    assert.equal(2, list.length);
    assert.equal(bb, list[0]);
  });

  test('matches', function() {
    var div = document.createElement('div');
    div.classList.add('host-class');
    document.body.appendChild(div);
    var p = document.createElement('p');
    p.classList.add('child-class');
    div.appendChild(p);
    assert.isTrue(p.matches(':host(.host-class) *'));
    assert.isTrue(p.matches(':host::shadow .child-class'));
    assert.isTrue(p.matches('.host-class /deep/ p.child-class'));
  });

  skipTest('getElementsByTagName', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.getElementsByTagName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<a>3</a><a>4</a>';
    var a3 = sr.firstChild;
    var a4 = sr.lastChild;

    div.offsetHeight;

    var as = div.getElementsByTagName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as[1], a1);

    var as = sr.getElementsByTagName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a3);
    assert.equal(as[1], a4);

    var z = div.getElementsByTagName('z');
    assert.equal(z.length, 0);

    var z = sr.getElementsByTagName('z');
    assert.equal(z.length, 0);
  });

  test('getElementsByTagName with colon', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a:b:c>0</a:b:c><a:b:c>1</a:b:c>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.getElementsByTagName('a:b:c');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);
  });

  test('getElementsByTagName with namespace', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;
    var a2 = document.createElementNS('NS', 'a');
    var a3 = document.createElementNS('NS', 'A');
    div.appendChild(a2);
    div.appendChild(a3);

    var as = div.getElementsByTagName('a');
    assert.equal(as.length, 3);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);
    assert.equal(as[2], a2);
    assert.equal(as.item(2), a2);

    var as = div.getElementsByTagName('A');
    assert.equal(as.length, 3);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);
    assert.equal(as[2], a3);
    assert.equal(as.item(2), a3);
  });

  test('getElementsByTagNameNS', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>0</a><a>1</a>';

    var sr = div.createShadowRoot();
    sr.innerHTML = '<a>3</a><a>4</a>';

    var z = div.getElementsByTagNameNS('NS', 'z');
    assert.equal(z.length, 0);

    var z = sr.getElementsByTagNameNS('NS', 'z');
    assert.equal(z.length, 0);
  });

  skipTest('getElementsByClassName', function() {
    var div = document.createElement('div');
    div.innerHTML = '<span class=a>0</span><span class=a>1</span>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = div.getElementsByClassName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<span class=a>3</span><span class=a>4</span>';
    var a3 = sr.firstChild;
    var a4 = sr.lastChild;

    div.offsetHeight;

    var as = div.getElementsByClassName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as[1], a1);

    var as = sr.getElementsByClassName('a');
    assert.equal(as.length, 2);
    assert.equal(as[0], a3);
    assert.equal(as[1], a4);
  });

  test('webkitCreateShadowRoot', function() {
    var div = document.createElement('div');
    if (!div.webkitCreateShadowRoot)
      return;
    var sr = div.webkitCreateShadowRoot();
    assert.instanceOf(sr, ShadowRoot);
  });

  test('getDestinationInsertionPoints', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a><b></b>';
    var a = div.firstChild;
    var b = div.lastChild;
    var sr = div.createShadowRoot();
    sr.innerHTML = '<content id=a></content>';
    var content = sr.firstChild;

    assertArrayEqual([content], a.getDestinationInsertionPoints());
    assertArrayEqual([content], b.getDestinationInsertionPoints());

    var sr2 = div.createShadowRoot();
    sr2.innerHTML = '<content id=b select=b></content>';
    var contentB = sr2.firstChild;

    assertArrayEqual([content], a.getDestinationInsertionPoints());
    assertArrayEqual([contentB], b.getDestinationInsertionPoints());
  });

  test('getDestinationInsertionPoints redistribution', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a><b></b>';
    var a = div.firstChild;
    var b = div.lastChild;
    var sr = div.createShadowRoot();
    sr.innerHTML = '<c><content id=a></content></c>';
    var c = sr.firstChild;
    var content = c.firstChild;
    var sr2 = c.createShadowRoot();
    sr2.innerHTML = '<content id=b select=b></content>';
    var contentB = sr2.firstChild;

    assertArrayEqual([content], a.getDestinationInsertionPoints());
    assertArrayEqual([content, contentB], b.getDestinationInsertionPoints());
  });

  test('getElementsByName', function() {
    div = document.createElement('div');
    document.body.appendChild(div);
    div.innerHTML = '<span name=a>0</span><span name=a>1</span>';
    var a0 = div.firstChild;
    var a1 = div.lastChild;

    var as = document.getElementsByName('a');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    var doc = wrap(document);
    as = doc.getElementsByName('a');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 2);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);
    assert.equal(as[1], a1);
    assert.equal(as.item(1), a1);

    a0.setAttribute('name', '"odd"');
    as = document.getElementsByName('"odd"');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 1);
    assert.equal(as[0], a0);
    assert.equal(as.item(0), a0);

    var sr = div.createShadowRoot();
    sr.innerHTML = '<span name=a></span>';
    as = document.getElementsByName('a');
    assert.instanceOf(as, NodeList);
    assert.equal(as.length, 1);
    assert.equal(as[0], a1);
    assert.equal(as.item(0), a1);
  });

  test('sub shadow-root traversal', function() {
    var div = document.createElement("DIV");
    var sr = div.createShadowRoot();
    sr.innerHTML = "<aa><bb></bb></aa>";

    var saal = sr.getElementsByTagName("aa");
    var sbbl = sr.getElementsByTagName("bb");
    assert.equal(saal.length, 1);
    assert.equal(sbbl.length, 1);

    var saa = saal [0];
    var sbb = sbbl [0];
    var abbl = saa.getElementsByTagName("bb");
    assert.equal(abbl.length, 1);

    var abb = abbl [0];
    assert.instanceOf(abb, HTMLElement);
    assert.equal(abb, sbb);

    var saal = sr.getElementsByTagNameNS("*", "aa");
    var sbbl = sr.getElementsByTagNameNS("*", "bb");
    assert.equal(saal.length, 1);
    assert.equal(sbbl.length, 1);

    var saa = saal [0];
    var sbb = sbbl [0];
    var abbl = saa.getElementsByTagNameNS("*", "bb");
    assert.equal(abbl.length, 1);

    var abb = abbl [0];
    assert.instanceOf(abb, HTMLElement);
    assert.equal(abb, sbb);

    var saal = sr.querySelectorAll("aa");
    var sbbl = sr.querySelectorAll("bb");
    assert.equal(saal.length, 1);
    assert.equal(sbbl.length, 1);

    var saa = saal [0];
    var sbb = sbbl [0];
    var abbl = saa.querySelectorAll("bb");
    assert.equal(abbl.length, 1);

    var abb = abbl [0];
    assert.instanceOf(abb, HTMLElement);
    assert.equal(abb, sbb);

    var saa = sr.querySelector("aa");
    var sbb = sr.querySelector("bb");
    var abb = saa.querySelector("bb");
    assert.instanceOf(abb, HTMLElement);
    assert.equal(abb, sbb);
  });
});
