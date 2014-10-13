/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTML Template Element', function() {

  test('content', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><a></a><b></b></template>';
    var template = div.firstChild;
    var content = template.content;

    assert.isNull(template.firstChild);
    assert.equal(content.childNodes.length, 2);
    assert.equal(content.firstChild.tagName, 'A');
    assert.equal(content.lastChild.tagName, 'B');
  });

  test('document', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><a></a></template><template><b></b></template>';
    var templateA = div.firstChild;
    var templateB= div.lastChild;
    var contentA = templateA.content;
    var contentB = templateB.content;

    assert.notEqual(templateA.ownerDocument, contentB.ownerDocument);
    assert.equal(contentA.ownerDocument, contentB.ownerDocument);
  });

  test('get innerHTML', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><a></a><b></b></template>';
    var template = div.firstChild;

    assert.equal(template.innerHTML, '<a></a><b></b>');

    assert.equal(div.innerHTML, '<template><a></a><b></b></template>');
  });

  test('get outerHTML', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><a></a><b></b></template>';
    var template = div.firstChild;

    assert.equal(template.outerHTML, '<template><a></a><b></b></template>');
    assert.equal(div.outerHTML,
                 '<div><template><a></a><b></b></template></div>');
  });

  test('set innerHTML', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><a></a><b></b></template>';
    var template = div.firstChild;
    template.innerHTML = 'c<d></d>e';

    assert.equal(template.innerHTML, 'c<d></d>e');

    expectStructure(template, {
      parentNode: div
    })

    var content = template.content;
    var c = content.firstChild;
    var d = c.nextSibling;
    var e = d.nextSibling;

    assert.equal(c.textContent, 'c');
    assert.equal(d.tagName, 'D');
    assert.equal(e.textContent, 'e');

    expectStructure(content, {
      firstChild: c,
      lastChild: e
    });
    expectStructure(c, {
      parentNode: content,
      nextSibling: d
    });
    expectStructure(d, {
      parentNode: content,
      previousSibling: c,
      nextSibling: e
    });
    expectStructure(e, {
      parentNode: content,
      previousSibling: d
    });
  });

  test('Mutation events', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template> <a>b</a></template>';

    var count = 0;
    function handleEvent(e) {
      count++;
    }

    div.addEventListener('DOMAttrModified', handleEvent, true);
    div.addEventListener('DOMAttributeNameChanged', handleEvent, true);
    div.addEventListener('DOMCharacterDataModified', handleEvent, true);
    div.addEventListener('DOMElementNameChanged', handleEvent, true);
    div.addEventListener('DOMNodeInserted', handleEvent, true);
    div.addEventListener('DOMNodeInsertedIntoDocument', handleEvent, true);
    div.addEventListener('DOMNodeRemoved', handleEvent, true);
    div.addEventListener('DOMNodeRemovedFromDocument', handleEvent, true);
    div.addEventListener('DOMSubtreeModified', handleEvent, true);

    var template = div.firstChild;
    assert.instanceOf(template.content, DocumentFragment);
    assert.instanceOf(template.content.firstChild, Text);
    assert.instanceOf(template.content.firstElementChild, HTMLAnchorElement);

    assert.equal(count, 0);
  });

  test('cloneNode', function() {
    var div = document.createElement('div');
    div.innerHTML = '<template><a></a><b></b></template>';
    var template = div.firstChild;

    var clone = template.cloneNode(true);
    assert.equal(clone.outerHTML, '<template><a></a><b></b></template>');

    clone = div.cloneNode(true);
    assert.equal(clone.outerHTML,
                 '<div><template><a></a><b></b></template></div>');
  });

  test('importNode', function() {
    var doc2 = document.implementation.createHTMLDocument('');
    var div = doc2.createElement('div');
    div.innerHTML = '<template><a></a><b></b></template>';
    var template = div.firstChild;

    var clone = document.importNode(template, true);
    assert.equal(clone.outerHTML, '<template><a></a><b></b></template>');

    clone = document.importNode(div, true);
    assert.equal(clone.outerHTML,
                 '<div><template><a></a><b></b></template></div>');
  });

  test('instanceOf', function() {
    assert.instanceOf(document.createElement('template'), HTMLTemplateElement);
  });

  test('constructor', function() {
    assert.equal(HTMLTemplateElement,
        document.createElement('template').constructor);
  });

});