/*
 * Copyright 2013 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLHtmlElement', function() {

  var wrap = ShadowDOMPolyfill.wrap;

  test('instanceof', function() {
    var doc = wrap(document);
    assert.instanceOf(doc.documentElement, HTMLHtmlElement);
    assert.equal(wrap(document.documentElement), doc.documentElement);
  });

  test('constructor', function() {
    assert.equal(HTMLHtmlElement,
                 document.createElement('html').constructor);
  });

  test('appendChild', function() {
    var doc = wrap(document);

    var a = document.createComment('a');
    var b = document.createComment('b');

    document.documentElement.appendChild(a);
    assert.equal(doc.documentElement.lastChild, a);

    doc.documentElement.appendChild(b);
    assert.equal(doc.documentElement.lastChild, b);
  });

  test('insertBefore', function() {
    var comment = document.createComment('comment');
    var root = document.documentElement;
    root.insertBefore(comment, root.firstChild);
    assert.equal(wrap(root.firstChild), comment);
  });

  test('replaceChild', function() {
    var comment = document.createComment('comment');
    var comment2 = document.createComment('comment2');
    var root = document.documentElement;
    root.insertBefore(comment, root.firstChild);
    assert.equal(wrap(root.firstChild), comment);
    root.replaceChild(comment2, root.firstChild);
  });

  test('matches', function() {
    // From jQuery.
    var html = document.documentElement;
    var matches = html.matchesSelector ||
        html.mozMatchesSelector ||
        html.webkitMatchesSelector ||
        html.msMatchesSelector;

    assert.isTrue(matches.call(document.body, 'body'));
    assert.isTrue(matches.call(wrap(document.body), 'body'));
  });

});
