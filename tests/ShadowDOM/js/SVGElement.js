/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('SVGElement', function() {

  var SVG_NS = 'http://www.w3.org/2000/svg';

  test('Basics', function() {
    var el = document.createElementNS(SVG_NS, 'svg');

    assert.equal(el.localName, 'svg');
    assert.equal(el.tagName, 'svg');
    assert.equal(el.namespaceURI, SVG_NS);
    assert.instanceOf(el, SVGElement);
    assert.instanceOf(el, Element);
    assert.instanceOf(el, Node);
    assert.instanceOf(el, EventTarget);
    assert.notInstanceOf(el, HTMLElement);
  });

  test('Basics innerHTML', function() {
    var div = document.createElement('div');
    div.innerHTML = '<svg></svg>';
    var el = div.firstChild;

    assert.equal(el.localName, 'svg');
    assert.equal(el.tagName, 'svg');
    assert.equal(el.namespaceURI, SVG_NS);
    assert.instanceOf(el, SVGElement);
    assert.instanceOf(el, Element);
    assert.instanceOf(el, Node);
    assert.instanceOf(el, EventTarget);
    assert.notInstanceOf(el, HTMLElement);
  });

  test('template', function() {
    var el = document.createElementNS(SVG_NS, 'template');

    assert.equal(el.localName, 'template');
    assert.equal(el.tagName, 'template');
    assert.equal(el.namespaceURI, SVG_NS);

    // IE does not create an SVGElement if the local name is not a known SVG
    // element.
    // Safari 7 has the same issue but nightly WebKit works as expected.
    // assert.instanceOf(el, SVGElement);

    assert.instanceOf(el, Element);
    assert.instanceOf(el, Node);
    assert.instanceOf(el, EventTarget);
    assert.notInstanceOf(el, HTMLElement);
  });

  test('classList', function() {
    var el = document.createElementNS(SVG_NS, 'svg');
    el.setAttribute('class', 'a b');

    assert.isTrue(el.classList === undefined ||
                  (el.classList instanceof DOMTokenList));

    if (el.classList !== undefined) {
      assert.equal(el.classList.length, 2);
      assert.isTrue(el.classList.contains('a'));
      assert.isTrue(el.classList.contains('b'));
    }
  });

  test('ownerSVGElement', function() {
    var el = document.createElementNS(SVG_NS, 'svg');
    var el2 = document.createElementNS(SVG_NS,'svg');
    var g = document.createElementNS(SVG_NS, 'g');
    el.appendChild(g);

    assert.equal(g.ownerSVGElement, el);

    el2.appendChild(g);

    assert.equal(g.ownerSVGElement, el2);
  });
});
