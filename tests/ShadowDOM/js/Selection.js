/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Selection', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var div, a, b, c;

  teardown(function() {
    if (div && div.parentNode)
      div.parentNode.removeChild(div);
    div = a = b = c = undefined;
  });

  setup(function() {
    div = document.createElement('div');
    div.innerHTML = '<a>a</a><b>b</b><c>c</c>';
    a = div.firstChild;
    b = a.nextSibling;
    c = div.lastChild;
    document.body.appendChild(div);
  });


  test('document.getSelection()', function() {
    var selection = document.getSelection();
    assert.instanceOf(selection, Selection);

    var doc = wrap(document);
    selection = doc.getSelection();
    assert.instanceOf(selection, Selection);
  });

  test('window.getSelection()', function() {
    var selection = window.getSelection();
    assert.instanceOf(selection, Selection);

    var win = wrap(window);
    selection = win.getSelection();
    assert.instanceOf(selection, Selection);
  });

  test('constructor', function() {
    var selection = window.getSelection();
    assert.equal(Selection, selection.constructor);
  });

  test('getSelection()', function() {
    var selection = getSelection();
    assert.instanceOf(selection, Selection);
  });

  test('basics', function() {
    var selection = window.getSelection();
    selection.selectAllChildren(div);

    assert.equal(selection.toString(), 'abc');

    assert.isFalse(selection.isCollapsed);
    assert.equal(selection.rangeCount, 1);

    // https://code.google.com/p/chromium/issues/detail?id=336821
    if (/WebKit/.test(navigator.userAgent))
      return;

    assert.equal(selection.anchorNode, div);
    assert.equal(selection.anchorOffset, 0);

    assert.equal(selection.focusNode, div);
    assert.equal(selection.focusOffset, 3);
  });

  test('getRangeAt', function() {
    var selection = window.getSelection();
    selection.selectAllChildren(div);
    var range = selection.getRangeAt(0);
    assert.instanceOf(range, Range);
  });

  test('collapse', function() {
    var selection = window.getSelection();

    for (var i = 0; i < 4; i++) {
      selection.selectAllChildren(div);
      selection.collapse(div, i);

      assert.isTrue(selection.isCollapsed);
      assert.equal(selection.toString(), '');

      // https://code.google.com/p/chromium/issues/detail?id=336821
      if (/WebKit/.test(navigator.userAgent))
        continue;

      assert.equal(selection.anchorNode, div);
      assert.equal(selection.anchorOffset, i);

      assert.equal(selection.focusNode, div);
      assert.equal(selection.focusOffset, i);
    }
  });

  test('extend', function() {
    // IE does not have extend.
    if (/Trident/.test(navigator.userAgent))
      return;

    var selection = window.getSelection();

    for (var i = 0; i < 4; i++) {
      selection.selectAllChildren(div);
      selection.extend(div, i);

      assert.equal(selection.isCollapsed, i === 0);
      assert.equal(selection.toString(), 'abc'.slice(0, i));

      // https://code.google.com/p/chromium/issues/detail?id=336821
      if (/WebKit/.test(navigator.userAgent))
        continue;

      assert.equal(selection.anchorNode, div);
      assert.equal(selection.anchorOffset, 0);

      assert.equal(selection.focusNode, div);
      assert.equal(selection.focusOffset, i);
    }
  });

  test('addRange', function() {
    var selection = window.getSelection();
    var range = document.createRange();
    range.selectNode(b);
    selection.addRange(range);

    // Uncertain why this fails in Blink. The same test passes without the
    // shadow dom polyfill in Blink.
    if (/WebKit/.test(navigator.userAgent))
      return;

    assert.equal(selection.toString(), 'b');
  });

  test('removeRange', function() {
    // Not implemented in Blink.
    if (/WebKit/.test(navigator.userAgent))
      return;

    var selection = window.getSelection();
    selection.selectAllChildren(div);
    var range = selection.getRangeAt(0);
    selection.removeRange(range);
    assert.equal(selection.toString(), '');
  });

  test('containsNode', function() {
    // IE does not have containsNode.
    if (/Trident/.test(navigator.userAgent))
      return;

    var selection = window.getSelection();
    selection.selectAllChildren(div);

    assert.isFalse(selection.containsNode(div));
    assert.isFalse(selection.containsNode(document));
    assert.isFalse(selection.containsNode(document.body));

    assert.isTrue(selection.containsNode(a, true));
    assert.isTrue(selection.containsNode(b, true));
    assert.isTrue(selection.containsNode(c, true));
  });

});
