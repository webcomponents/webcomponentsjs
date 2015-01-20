/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Node', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;

  var DOCUMENT_POSITION_DISCONNECTED = Node.DOCUMENT_POSITION_DISCONNECTED;
  var DOCUMENT_POSITION_PRECEDING = Node.DOCUMENT_POSITION_PRECEDING;
  var DOCUMENT_POSITION_FOLLOWING = Node.DOCUMENT_POSITION_FOLLOWING;
  var DOCUMENT_POSITION_CONTAINS = Node.DOCUMENT_POSITION_CONTAINS;
  var DOCUMENT_POSITION_CONTAINED_BY = Node.DOCUMENT_POSITION_CONTAINED_BY;
  var DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC = Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;

  suite('compareDocumentPosition', function() {

    test('between wrappers', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a><b></b><c></c></a>';
      var a = div.firstChild;
      var b = a.firstChild;
      var c = a.lastChild;

      assert.equal(div.compareDocumentPosition(div), 0);
      assert.equal(div.compareDocumentPosition(a),
          DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);
      assert.equal(div.compareDocumentPosition(b),
          DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);
      assert.equal(div.compareDocumentPosition(c),
          DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);

      assert.equal(a.compareDocumentPosition(div),
          DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
      assert.equal(a.compareDocumentPosition(a), 0);
      assert.equal(a.compareDocumentPosition(b),
          DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);
      assert.equal(a.compareDocumentPosition(c),
          DOCUMENT_POSITION_CONTAINED_BY | DOCUMENT_POSITION_FOLLOWING);

      assert.equal(b.compareDocumentPosition(div),
          DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
      assert.equal(b.compareDocumentPosition(a),
          DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
      assert.equal(b.compareDocumentPosition(b), 0);
      assert.equal(b.compareDocumentPosition(c),
          DOCUMENT_POSITION_FOLLOWING);

      assert.equal(c.compareDocumentPosition(div),
          DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
      assert.equal(c.compareDocumentPosition(a),
          DOCUMENT_POSITION_CONTAINS | DOCUMENT_POSITION_PRECEDING);
      assert.equal(c.compareDocumentPosition(b),
          DOCUMENT_POSITION_PRECEDING);
      assert.equal(c.compareDocumentPosition(c), 0);

      // WebKit uses DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC.
      assert.notEqual(document.compareDocumentPosition(div) &
          DOCUMENT_POSITION_DISCONNECTED, 0)
    });

    var doc = wrap(document);
    test('with document', function() {
      assert.equal(doc.compareDocumentPosition(doc), 0);
      assert.equal(doc.compareDocumentPosition(document), 0);
      assert.equal(document.compareDocumentPosition(document), 0);
      assert.equal(document.compareDocumentPosition(doc), 0);
    });
    test('with document.body', function() {
      assert.equal(doc.body.compareDocumentPosition(doc.body), 0);
      assert.equal(doc.body.compareDocumentPosition(document.body), 0);
      assert.equal(document.body.compareDocumentPosition(document.body), 0);
      assert.equal(document.body.compareDocumentPosition(doc.body), 0);
    });
    test('with document.head', function() {
      assert.equal(doc.head.compareDocumentPosition(doc.head), 0);
      assert.equal(doc.head.compareDocumentPosition(document.head), 0);
      assert.equal(document.head.compareDocumentPosition(document.head), 0);
      assert.equal(document.head.compareDocumentPosition(doc.head), 0);
    });
    test('with document.documentElement', function() {
      assert.equal(doc.documentElement.compareDocumentPosition(
          doc.documentElement), 0);
      assert.equal(doc.documentElement.compareDocumentPosition(
          document.documentElement), 0);
      assert.equal(document.documentElement.compareDocumentPosition(
          document.documentElement), 0);
      assert.equal(document.documentElement.compareDocumentPosition(
          doc.documentElement), 0);
    });
  });

  test('ownerDocument with template and shadow root', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><span></span></template>';

    var content1 = div.firstChild.content;
    var host = content1.firstChild;

    div.innerHTML = '<template>hello world</template>';
    var content2 = div.firstChild.content;
    var x = content2.firstChild;

    var sr = host.createShadowRoot();
    sr.appendChild(content2);

    assert.equal(x.parentNode, sr);
    assert.equal(x.ownerDocument, sr.ownerDocument);
    assert.equal(sr.ownerDocument, host.ownerDocument);

    var doc = wrap(document);
    doc.body.appendChild(host);
    assert.equal(host.ownerDocument, doc);
    assert.equal(sr.ownerDocument, doc);
    assert.equal(x.ownerDocument, doc);

    doc.body.removeChild(host);
  });

  test('ownerDocument when appending to document', function() {
    var doc1 = document.implementation.createHTMLDocument('');
    var comment = doc1.createComment('');
    doc1.appendChild(comment);
    assert.equal(doc1, comment.ownerDocument);

    var doc2 = document.implementation.createHTMLDocument('');
    doc2.appendChild(comment);
    assert.equal(doc2, comment.ownerDocument);
  });

  test('removeChild resets pointers', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;
    var sr = host.createShadowRoot();

    host.offsetHeight;

    host.removeChild(a);

    expectStructure(a, {});

    var div = document.createElement('div');
    div.appendChild(a);

    expectStructure(div, {
      firstChild: a,
      lastChild: a
    });

    expectStructure(a, {
      parentNode: div
    });
  });

  test('replaceChild resets pointers', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;
    var sr = host.createShadowRoot();

    host.offsetHeight;

    var b = document.createElement('b');

    host.replaceChild(b, a);

    expectStructure(a, {});

    expectStructure(b, {
      parentNode: host
    });

    var div = document.createElement('div');
    div.appendChild(a);

    expectStructure(div, {
      firstChild: a,
      lastChild: a
    });

    expectStructure(a, {
      parentNode: div
    });
  });

  test('appendChild resets pointers', function() {
    var host1 = document.createElement('div');
    host1.innerHTML = '<a></a>';
    var a = host1.firstChild;
    var sr1 = host1.createShadowRoot();

    var host2 = document.createElement('div');
    host2.innerHTML = '<b></b>';
    var b = host2.firstChild;
    var sr2 = host2.createShadowRoot();

    host1.offsetHeight;
    host2.offsetHeight;

    host1.appendChild(b);

    expectStructure(host1, {
      firstChild: a,
      lastChild: b
    });

    expectStructure(a, {
      parentNode: host1,
      nextSibling: b
    });

    expectStructure(b, {
      parentNode: host1,
      previousSibling: a
    });

    expectStructure(host2, {});
  });

  test('hasChildNodes without a shadow root', function() {
    var div = document.createElement('div');

    assert.isFalse(div.hasChildNodes(), 'should be false with no children');

    div.innerHTML = '<span></span>';
    assert.isTrue(div.hasChildNodes(), 'should be true with a single child');

    div.innerHTML = '<span></span><ul></ul>';
    assert.isTrue(div.hasChildNodes(), 'should be true with multiple children');
  });

  test('parentElement', function() {
    var a = document.createElement('a');
    a.textContent = 'text';
    var textNode = a.firstChild;
    assert.equal(textNode.parentElement, a);
    assert.isNull(a.parentElement);

    var doc = wrap(document);
    var body = doc.body;
    var documentElement = doc.documentElement;
    assert.equal(body.parentElement, documentElement);
    assert.isNull(documentElement.parentElement);
  });

  test('contains', function() {
    var div = document.createElement('div');
    assert.isTrue(div.contains(div));

    div.textContent = 'a';
    var textNode = div.firstChild;
    assert.isTrue(textNode.contains(textNode));
    assert.isTrue(div.contains(textNode));
    assert.isFalse(textNode.contains(div));

    var doc = div.ownerDocument;
    assert.isTrue(doc.contains(doc));
    assert.isFalse(doc.contains(div));
    assert.isFalse(doc.contains(textNode));

    assert.isFalse(div.contains(null));
    assert.isFalse(div.contains());
  });

  test('instanceof', function() {
    var div = document.createElement('div');
    assert.instanceOf(div, HTMLElement);
    assert.instanceOf(div, Element);
    assert.instanceOf(div, EventTarget);
  });

  test('cloneNode(false)', function() {
    var doc = wrap(document);
    var a = document.createElement('a');
    a.href = 'http://domain.com/';
    a.textContent = 'text';
    var textNode = a.firstChild;

    var aClone = a.cloneNode(false);

    assert.equal(aClone.tagName, 'A');
    assert.equal(aClone.href, 'http://domain.com/');
    expectStructure(aClone, {});
  });

  test('cloneNode(true)', function() {
    var doc = wrap(document);
    var a = document.createElement('a');
    a.href = 'http://domain.com/';
    a.textContent = 'text';
    var textNode = a.firstChild;

    var aClone = a.cloneNode(true);
    var textNodeClone = aClone.firstChild;

    assert.equal(aClone.tagName, 'A');
    assert.equal(aClone.href, 'http://domain.com/');
    expectStructure(aClone, {
      firstChild: textNodeClone,
      lastChild: textNodeClone
    });
    expectStructure(textNodeClone, {
      parentNode: aClone
    });
  });

  test('cloneNode with shadowRoot', function() {
    var div = document.createElement('div');
    var a = div.appendChild(document.createElement('a'));
    var sr = a.createShadowRoot();
    sr.innerHTML = '<b></b>';
    div.offsetHeight;
    assert.equal(unwrap(div).innerHTML, '<a><b></b></a>');

    var clone = div.cloneNode(true);
    assert.equal(clone.innerHTML, '<a></a>');
    clone.offsetHeight;
    // shadow roots are not cloned.
    assert.equal(unwrap(clone).innerHTML, '<a></a>');
  });

  test('insertBefore', function() {
    var parent = document.createElement('div');
    var c1 = document.createElement('div');
    var c2 = document.createElement('div');
    var c3 = document.createElement('div');
    parent.insertBefore(c3);
    parent.insertBefore(c2, c3);
    parent.insertBefore(c1, c2);

    assert.equal(parent.firstChild, c1);
    assert.equal(c1.nextElementSibling, c2);
    assert.equal(c2.nextElementSibling, c3);
  });

  test('textContent of comment', function() {
    var comment = document.createComment('abc');
    assert.equal(comment.textContent, 'abc');
  });

  test('textContent ignores comments', function() {
    var div = document.createElement('div');
    div.innerHTML = 'ab<!--cd-->ef';
    assert.equal(div.textContent, 'abef');
  });

  test('null textContent', function() {
    var div = document.createElement('div');
    var root = div.createShadowRoot();
    div.textContent = null;
    assert.equal(div.textContent, '');
  });

  test('normalize', function() {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode('foo\n'));
    var span = document.createElement('span');
    span.appendChild(document.createTextNode('buzz'));
    span.appendChild(document.createTextNode('quux'));
    div.appendChild(span);
    div.appendChild(document.createTextNode('bar\n'));
    assert.equal(div.textContent, 'foo\nbuzzquuxbar\n');

    div.normalize();

    assert.equal(div.textContent, 'foo\nbuzzquuxbar\n');
    assert.equal(div.childNodes.length, 3);
    assert.equal(div.firstChild.textContent, 'foo\n');
    assert.equal(div.firstChild.nextSibling, span);
    assert.equal(span.childNodes.length, 1);
    assert.equal(span.firstChild.textContent, 'buzzquux');
    assert.equal(span.nextSibling, div.lastChild);
    assert.equal(div.lastChild.textContent, 'bar\n');
  });

  test('normalize with shadowroot', function() {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode('foo\n'));
    var sr = div.createShadowRoot();
    sr.appendChild(document.createTextNode('buzz'));
    sr.appendChild(document.createTextNode('quux'));
    div.appendChild(document.createTextNode('bar\n'));
    assert.equal(div.textContent, 'foo\nbar\n');
    assert.equal(sr.textContent, 'buzzquux');

    div.normalize();

    assert.equal(div.textContent, 'foo\nbar\n');
    assert.equal(sr.textContent, 'buzzquux');
    assert.equal(div.childNodes.length, 1);
    assert.equal(div.firstChild.textContent, 'foo\nbar\n');
    assert.equal(sr.childNodes.length, 2);
    assert.equal(sr.firstChild.textContent, 'buzz');
    assert.equal(sr.firstChild.nextSibling.textContent, 'quux');
  });

  test('normalize - issue 441', function() {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode('a'));
    div.appendChild(document.createTextNode('b'));
    div.appendChild(document.createElement('span'));
    div.appendChild(document.createTextNode('c'));
    div.appendChild(document.createTextNode('d'));

    div.normalize();

    assert.equal(div.textContent, 'abcd');
    assert.equal(div.childNodes.length, 3);
  });

  test('normalize - issue 145', function() {
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(''));
    div.appendChild(document.createTextNode(''));
    div.appendChild(document.createTextNode(''));
    var childDiv = document.createElement('div');
    childDiv.appendChild(document.createTextNode(''));
    childDiv.appendChild(document.createTextNode(''));
    div.appendChild(childDiv);

    assert.equal(div.childNodes.length, 4);
    assert.equal(childDiv.childNodes.length, 2);

    div.normalize();

    assert.equal(div.childNodes.length, 1);
    assert.equal(childDiv.childNodes.length, 0);
  });

  test('appendChild last and first', function() {
    var a = document.createElement('a');
    a.innerHTML = '<b></b>';
    var b = a.firstChild;
    var sr = a.createShadowRoot();

    var c = document.createElement('c');
    c.innerHTML = '<d></d>';
    var d = c.firstChild;
    c.appendChild(b);

    var cs = c.childNodes;
    assert.equal(cs.length, 2);
    assert.equal(cs[0], d);
    assert.equal(cs[1], b);

    c.removeChild(b);
    cs = c.childNodes;
    assert.equal(cs.length, 1);
    assert.equal(cs[0], d);
  });
});
