/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

htmlSuite('Document', function() {

  var wrap = ShadowDOMPolyfill.wrap;

  var div;
  teardown(function() {
    if (div) {
      if (div.parentNode)
        div.parentNode.removeChild(div);
      div = undefined;
    }
  });

  function skipTest () {}

  test('Ensure Document has ParentNodeInterface', function() {
    var doc = wrap(document).implementation.createHTMLDocument('');
    assert.equal(doc.firstElementChild.tagName, 'HTML');
    assert.equal(doc.lastElementChild.tagName, 'HTML');

    var doc2 = document.implementation.createHTMLDocument('');
    assert.equal(doc2.firstElementChild.tagName, 'HTML');
    assert.equal(doc2.lastElementChild.tagName, 'HTML');
  });

  test('Create XHTML Document', function() {
    var docType = wrap(document).implementation.createDocumentType('html', '-//W3C//DTD XHTML 1.0 Transitional//EN',
                            'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd');
    var doc = wrap(document).implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', docType);
    assert(doc);
  });

  test('document.documentElement', function() {
    var doc = wrap(document);
    assert.equal(doc.documentElement.ownerDocument, doc);
    assert.equal(doc.documentElement.tagName, 'HTML');
  });

  test('document.body', function() {
    var doc = wrap(document);
    assert.equal(doc.body.ownerDocument, doc);
    assert.equal(doc.body.tagName, 'BODY');
    assert.equal(doc.body.parentNode, doc.documentElement);
  });

  test('document.head', function() {
    var doc = wrap(document);
    assert.equal(doc.head.ownerDocument, doc);
    assert.equal(doc.head.tagName, 'HEAD');
    assert.equal(doc.head.parentNode, doc.documentElement);
  });

  test('document.matches', function() {
    var doc = wrap(document);
    assert.isTrue(doc.matches === undefined);
  });

  test('getElementsByTagName', function() {
    var elements = document.getElementsByTagName('body');
    assert.isTrue(elements instanceof HTMLCollection);
    assert.equal(elements.length, 1);
    assert.isTrue(elements[0] instanceof HTMLElement);

    var doc = wrap(document);
    assert.equal(doc.body, elements[0]);
    assert.equal(doc.body, elements.item(0));

    var elements2 = doc.getElementsByTagName('body');
    assert.isTrue(elements2 instanceof HTMLCollection);
    assert.equal(elements2.length, 1);
    assert.isTrue(elements2[0] instanceof HTMLElement);
    assert.equal(doc.body, elements2[0]);
    assert.equal(doc.body, elements2.item(0));
  });

  skipTest('getElementsByTagName', function() {
    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = '<aa></aa><aa></aa>';
    var aa1 = div.firstChild;
    var aa2 = div.lastChild;

    var sr = div.createShadowRoot();
    sr.innerHTML = '<aa></aa><aa></aa>';
    var aa3 = sr.firstChild;
    var aa4 = sr.lastChild;

    div.offsetHeight;

    var elements = document.getElementsByTagName('aa');
    assert.equal(elements.length, 2);
    assert.equal(elements[0], aa1);
    assert.equal(elements[1], aa2);

    var elements = sr.getElementsByTagName('aa');
    assert.equal(elements.length, 2);
    assert.equal(elements[0], aa3);
    assert.equal(elements[1], aa4);

    var z = document.getElementsByTagName('z');
    assert.equal(z.length, 0);
  });

  test('getElementsByTagNameNS', function() {
    var div = document.createElement('div');
    var nsOne = 'http://one.com';
    var nsTwo = 'http://two.com';
    var aOne = div.appendChild(document.createElementNS(nsOne, 'a'));
    var aTwo = div.appendChild(document.createElementNS(nsTwo, 'a'));
    var aNull = div.appendChild(document.createElementNS(null, 'a'));
    var bOne = div.appendChild(document.createElementNS(nsOne, 'b'));
    var bTwo = div.appendChild(document.createElementNS(nsTwo, 'b'));
    var bNull = div.appendChild(document.createElementNS(null, 'b'));

    var all = div.getElementsByTagNameNS(nsOne, 'a');
    assert.equal(all.length, 1);
    assert.equal(all[0], aOne);

    var all = div.getElementsByTagNameNS(nsTwo, 'a');
    assert.equal(all.length, 1);
    assert.equal(all[0], aTwo);

    var all = div.getElementsByTagNameNS(null, 'a');
    assert.equal(all.length, 1);
    assert.equal(all[0], aNull);

    var all = div.getElementsByTagNameNS('', 'a');
    assert.equal(all.length, 1);
    assert.equal(all[0], aNull);

    var all = div.getElementsByTagNameNS('*', 'a');
    assert.equal(all.length, 3);
    assert.equal(all[0], aOne);
    assert.equal(all[1], aTwo);
    assert.equal(all[2], aNull);

    var all = div.getElementsByTagNameNS(nsOne, '*');
    assert.equal(all.length, 2);
    assert.equal(all[0], aOne);
    assert.equal(all[1], bOne);

    var all = div.getElementsByTagNameNS('*', '*');
    assert.equal(all.length, 6);
    assert.equal(all[0], aOne);
    assert.equal(all[1], aTwo);
    assert.equal(all[2], aNull);
    assert.equal(all[3], bOne);
    assert.equal(all[4], bTwo);
    assert.equal(all[5], bNull);

    var all = div.getElementsByTagNameNS('*', 'A');
    assert.equal(all.length, 0);
  });

  test('querySelectorAll', function() {
    var elements = document.querySelectorAll('body');
    assert.isTrue(elements instanceof NodeList);
    assert.equal(elements.length, 1);
    assert.isTrue(elements[0] instanceof HTMLElement);

    var doc = wrap(document);
    assert.equal(doc.body, elements[0]);

    var elements2 = doc.querySelectorAll('body');
    assert.isTrue(elements2 instanceof NodeList);
    assert.equal(elements2.length, 1);
    assert.isTrue(elements2[0] instanceof HTMLElement);
    assert.equal(doc.body, elements2[0]);
  });

  skipTest('querySelectorAll', function() {
    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = '<aa></aa><aa></aa>';
    var aa1 = div.firstChild;
    var aa2 = div.lastChild;

    var sr = div.createShadowRoot();
    sr.innerHTML = '<aa></aa><aa></aa>';
    var aa3 = sr.firstChild;
    var aa4 = sr.lastChild;

    div.offsetHeight;

    var elements = document.querySelectorAll('aa');
    assert.equal(elements.length, 2);
    assert.equal(elements[0], aa1);
    assert.equal(elements[1], aa2);

    var elements = sr.querySelectorAll('aa');
    assert.equal(elements.length, 2);
    assert.equal(elements[0], aa3);
    assert.equal(elements[1], aa4);

    var z = document.querySelectorAll('z');
    assert.equal(z.length, 0);
  });

  test('querySelector', function() {
    var z = document.querySelector('z');
    assert.equal(z, null);
  });

  test('querySelector deep', function() {
    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = '<aa></aa><aa></aa>';
    var aa1 = div.firstChild;
    var aa2 = div.lastChild;

    var sr = div.createShadowRoot();
    sr.innerHTML = '<bb></bb><content></content>';
    var bb = sr.firstChild;

    div.offsetHeight;

    assert.equal(aa1, document.querySelector('div /deep/ aa'));
    assert.equal(bb, document.querySelector('div /deep/ bb'));

    assert.equal(aa1, document.querySelector('div >>> aa'));
    assert.equal(bb, document.querySelector('div >>> bb'));
  });

  test('querySelectorAll deep', function() {
    div = document.body.appendChild(document.createElement('div'));
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

  test('addEventListener', function() {
    var calls = 0;
    var doc = wrap(document);
    document.addEventListener('click', function f(e) {
      calls++;
      assert.equal(this, doc);
      assert.equal(e.target, doc.body);
      assert.equal(e.currentTarget, this);
      document.removeEventListener('click', f);
    });
    doc.addEventListener('click', function f(e) {
      calls++;
      assert.equal(this, doc);
      assert.equal(e.target, doc.body);
      assert.equal(e.currentTarget, this);
      doc.removeEventListener('click', f);
    });

    document.body.click();
    assert.equal(2, calls);

    document.body.click();
    assert.equal(2, calls);
  });

  test('adoptNode', function() {
    var doc = wrap(document);
    var doc2 = doc.implementation.createHTMLDocument('');
    var div = doc2.createElement('div');
    assert.equal(div.ownerDocument, doc2);

    var div2 = document.adoptNode(div);
    assert.equal(div, div2);
    assert.equal(div.ownerDocument, doc);

    var div3 = doc2.adoptNode(div);
    assert.equal(div, div3);
    assert.equal(div.ownerDocument, doc2);
  });

  test('adoptNode with shadowRoot', function() {
    var doc = wrap(document);
    var doc2 = doc.implementation.createHTMLDocument('');
    var div = doc2.createElement('div');
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a></a>';
    var a = sr.firstChild;

    var sr2 = div.createShadowRoot();
    sr2.innerHTML = '<b><shadow></shadow></b>';
    var b = sr2.firstChild;

    var sr3 = a.createShadowRoot();
    sr3.innerHTML = '<c></c>';
    var c = sr3.firstChild;

    assert.equal(div.ownerDocument, doc2);
    assert.equal(sr.ownerDocument, doc2);
    assert.equal(sr2.ownerDocument, doc2);
    assert.equal(sr3.ownerDocument, doc2);
    assert.equal(a.ownerDocument, doc2);
    assert.equal(b.ownerDocument, doc2);
    assert.equal(c.ownerDocument, doc2);

    doc.adoptNode(div);

    assert.equal(div.ownerDocument, doc);
    assert.equal(sr.ownerDocument, doc);
    assert.equal(sr2.ownerDocument, doc);
    assert.equal(sr3.ownerDocument, doc);
    assert.equal(a.ownerDocument, doc);
    assert.equal(b.ownerDocument, doc);
    assert.equal(c.ownerDocument, doc);
  });

  test('importNode', function() {
    var doc = wrap(document);
    var doc2 = doc.implementation.createHTMLDocument('');
    var div = doc2.createElement('div');
    div.innerHTML = 'test';
    assert.equal(div.ownerDocument, doc2);

    var div2 = document.importNode(div, true);
    assert.equal(div.innerHTML, div2.innerHTML);
    assert.equal(div2.ownerDocument, doc);

    var div3 = doc2.importNode(div2);
    assert.equal(div3.innerHTML, '');
    assert.equal(div3.ownerDocument, doc2);
  });

  test('importNode with shadow root', function() {
    var doc = wrap(document);
    var doc2 = doc.implementation.createHTMLDocument('');
    var div = doc2.createElement('div');
    div.textContent = 'test';
    var sr = div.createShadowRoot();
    sr.textContent = 'shadow root';

    div.offsetHeight;

    assert.equal(div.ownerDocument, doc2);

    var div2 = document.importNode(div, true);
    assert.equal(div.innerHTML, div2.innerHTML);
    assert.equal(div2.ownerDocument, doc);

    var div3 = doc2.importNode(div2);
    assert.equal(div3.innerHTML, '');
    assert.equal(div3.ownerDocument, doc2);
  });

  test('elementFromPoint', function() {
    div = document.body.appendChild(document.createElement('div'));
    div.style.cssText = 'position: fixed; background: green; ' +
                        'width: 10px; height: 10px; top: 0; left: 0;';

    assert.equal(document.elementFromPoint(5, 5), div);

    var doc = wrap(document);
    assert.equal(doc.elementFromPoint(5, 5), div);
  });

  test('elementFromPoint in shadow', function() {
    div = document.body.appendChild(document.createElement('div'));
    div.style.cssText = 'position: fixed; background: red; ' +
                        'width: 10px; height: 10px; top: 0; left: 0;';
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a></a>';
    var a = sr.firstChild;
    a.style.cssText = 'position: absolute; width: 100%; height: 100%; ' +
                      'background: green';

    assert.equal(document.elementFromPoint(5, 5), div);

    var doc = wrap(document);
    assert.equal(doc.elementFromPoint(5, 5), div);
  });

  test('elementFromPoint null', function() {
    assert.isNull(document.elementFromPoint(-9999, -9999));

    var doc = wrap(document);
    assert.isNull(doc.elementFromPoint(-9999, -9999));
  });

  test('document.contains', function() {
    assert.isTrue(document.contains(document.body));
    assert.isTrue(document.contains(document.querySelector('body')));

    assert.isTrue(document.contains(document.head));
    assert.isTrue(document.contains(document.querySelector('head')));

    assert.isTrue(document.contains(document.documentElement));
    assert.isTrue(document.contains(document.querySelector('html')));
  });

  test('document.registerElement', function() {
    if (!document.registerElement)
      return;

    var aPrototype = Object.create(HTMLElement.prototype);
    aPrototype.getName = function() {
      return 'a';
    };

    var A = document.registerElement('x-a', {prototype: aPrototype});

    var a1 = document.createElement('x-a');
    assert.equal('x-a', a1.localName);
    assert.equal(Object.getPrototypeOf(a1), aPrototype);
    assert.instanceOf(a1, A);
    assert.instanceOf(a1, HTMLElement);
    assert.equal(a1.getName(), 'a');

    var a2 = new A();
    assert.equal('x-a', a2.localName);
    assert.equal(Object.getPrototypeOf(a2), aPrototype);
    assert.instanceOf(a2, A);
    assert.instanceOf(a2, HTMLElement);
    assert.equal(a2.getName(), 'a');

    //////////////////////////////////////////////////////////////////////

    var bPrototype = Object.create(A.prototype);
    bPrototype.getName = function() {
      return 'b';
    };

    var B = document.registerElement('x-b', {prototype: bPrototype});

    var b1 = document.createElement('x-b');
    assert.equal('x-b', b1.localName);
    assert.equal(Object.getPrototypeOf(b1), bPrototype);
    assert.instanceOf(b1, B);
    assert.instanceOf(b1, A);
    assert.instanceOf(b1, HTMLElement);
    assert.equal(b1.getName(), 'b');

    var b2 = new B();
    assert.equal('x-b', b2.localName);
    assert.equal(Object.getPrototypeOf(b2), bPrototype);
    assert.instanceOf(b2, B);
    assert.instanceOf(b2, A);
    assert.instanceOf(b2, HTMLElement);
    assert.equal(b2.getName(), 'b');
  });

  test('document.registerElement type extension', function() {
    if (!document.registerElement)
      return;

    var aPrototype = Object.create(HTMLSpanElement.prototype);
    aPrototype.getName = function() {
      return 'a';
    };

    var A = document.registerElement('x-a-span',
        {prototype: aPrototype, extends: 'span'});

    var a1 = document.createElement('span', 'x-a-span');
    assert.equal('span', a1.localName);
    assert.equal('<span is="x-a-span"></span>', a1.outerHTML);
    assert.equal(Object.getPrototypeOf(a1), aPrototype);
    assert.instanceOf(a1, A);
    assert.instanceOf(a1, HTMLSpanElement);
    assert.equal(a1.getName(), 'a');

    var a2 = new A();
    assert.equal('span', a2.localName);
    assert.equal('<span is="x-a-span"></span>', a2.outerHTML);
    assert.equal(Object.getPrototypeOf(a2), aPrototype);
    assert.instanceOf(a2, A);
    assert.instanceOf(a2, HTMLSpanElement);
    assert.equal(a2.getName(), 'a');
  });

  test('document.registerElement deeper', function() {
    if (!document.registerElement)
      return;

    function C() {}
    C.prototype = {
      __proto__: HTMLElement.prototype
    };

    function B() {}
    B.prototype = {
      __proto__: C.prototype
    };

    function A() {}
    A.prototype = {
      __proto__: B.prototype
    };

    A = document.registerElement('x-a5', A);

    var a1 = document.createElement('x-a5');
    assert.equal('x-a5', a1.localName);
    assert.equal(a1.__proto__, A.prototype);
    assert.equal(a1.__proto__.__proto__, B.prototype);
    assert.equal(a1.__proto__.__proto__.__proto__, C.prototype);
     assert.equal(a1.__proto__.__proto__.__proto__.__proto__,
                  HTMLElement.prototype);

    var a2 = new A();
    assert.equal('x-a5', a2.localName);
    assert.equal(a2.__proto__, A.prototype);
    assert.equal(a2.__proto__.__proto__, B.prototype);
    assert.equal(a2.__proto__.__proto__.__proto__, C.prototype);
    assert.equal(a2.__proto__.__proto__.__proto__.__proto__,
                 HTMLElement.prototype);
  });

  test('document.registerElement createdCallback', function() {
    if (!document.registerElement)
      return;

    var self;
    var createdCalls = 0;

    function A() {}
    A.prototype = {
      __proto__: HTMLElement.prototype,
      createdCallback: function() {
        createdCalls++;
        assert.isUndefined(a);
        assert.instanceOf(this, A);
        self = this;
      }
    };

    A = document.registerElement('x-a2', A);

    var a = new A;
    assert.equal(createdCalls, 1);
    assert.equal(self, a);
  });

  test('document.registerElement createdCallback upgrade', function() {
    if (!document.registerElement)
      return;

    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = '<x-a2-1></x-a2-1>';

    function A() {}
    A.prototype = {
      __proto__: HTMLElement.prototype,
      createdCallback: function() {
        assert.isTrue(this.isCustom);
        assert.instanceOf(this, A);
      },
      isCustom: true
    };

    A = document.registerElement('x-a2-1', A);
  });

  test('document.registerElement attachedCallback, detachedCallback',
      function() {
    if (!document.registerElement)
      return;

    var attachedCalls = 0;
    var detachedCalls = 0;

    function A() {}
    A.prototype = {
      __proto__: HTMLElement.prototype,
      attachedCallback: function() {
        attachedCalls++;
        assert.instanceOf(this, A);
        assert.equal(a, this);
      },
      detachedCallback: function() {
        detachedCalls++;
        assert.instanceOf(this, A);
        assert.equal(a, this);
      }
    };

    A = document.registerElement('x-a3', A);

    var a = new A;
    document.body.appendChild(a);
    assert.equal(attachedCalls, 1);
    document.body.removeChild(a);
    assert.equal(detachedCalls, 1);
  });

  test('document.registerElement attributeChangedCallback', function() {
    if (!document.registerElement)
      return;

    var attributeChangedCalls = 0;

    function A() {}
    A.prototype = {
      __proto__: HTMLElement.prototype,
      attributeChangedCallback: function(name, oldValue, newValue) {
        attributeChangedCalls++;
        assert.equal(name, 'foo');
        switch (attributeChangedCalls) {
          case 1:
            assert.isNull(oldValue);
            assert.equal(newValue, 'bar');
            break;
          case 2:
            assert.equal(oldValue, 'bar');
            assert.equal(newValue, 'baz');
            break;
          case 3:
            assert.equal(oldValue, 'baz');
            assert.isNull(newValue);
            break;
        }
        console.log(arguments);
      }
    };

    A = document.registerElement('x-a4', A);

    var a = new A;
    assert.equal(attributeChangedCalls, 0);
    a.setAttribute('foo', 'bar');
    assert.equal(attributeChangedCalls, 1);
    a.setAttribute('foo', 'baz');
    assert.equal(attributeChangedCalls, 2);
    a.removeAttribute('foo');
    assert.equal(attributeChangedCalls, 3);
  });

  test('document.registerElement get reference, upgrade, rewrap', function() {
    if (!document.registerElement)
      return;

    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = '<x-a6></x-a6>';
    // get reference (creates wrapper)
    div.firstChild;

    function A() {}
    A.prototype = {
      __proto__: HTMLElement.prototype,
      isCustom: true
    };

    A = document.registerElement('x-a6', A);
    // re-wrap after registration to update wrapper
    ShadowDOMPolyfill.rewrap(ShadowDOMPolyfill.unwrap(div.firstChild));
    assert.isTrue(div.firstChild.isCustom);
  });

  test('document.registerElement optional option', function() {
    if (!document.registerElement)
      return;

    document.registerElement('x-a7');
    var a = document.createElement('x-a7');
    assert.equal(Object.getPrototypeOf(Object.getPrototypeOf(a)),
                 HTMLElement.prototype);

    document.registerElement('x-a8', {});
    var a2 = document.createElement('x-a8');
    assert.equal(Object.getPrototypeOf(Object.getPrototypeOf(a2)),
                 HTMLElement.prototype);

    document.registerElement('x-a-span-2', {extends: 'span'});
    var a3 = document.createElement('span', 'x-a-span-2');
    assert.equal(Object.getPrototypeOf(Object.getPrototypeOf(a3)),
                 HTMLElement.prototype);
    a3.localName = 'span';
    assert.equal('<span is="x-a-span-2"></span>', a3.outerHTML);
  });

  htmlTest('../html/document-write.html');

  htmlTest('../html/head-then-body.html');
});
