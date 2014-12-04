/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
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
