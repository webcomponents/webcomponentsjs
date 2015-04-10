/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Selection', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;
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

  test('Make sure Selection.extend is not supported if browser does not support it.', function() {
    var originalSelection = unwrap(window.getSelection());
    var wrapperSelection = window.getSelection();
    assert(!!originalSelection.extend === !!wrapperSelection.extend);
  });

  test('extend', function() {

    var selection = window.getSelection();
    if (!selection.extend){
      // Nothing to test if the selection does not support extend.
      // do not fail. Code that uses browser with no extend in the selection knows how to handle it.
      // Just do not fake the availability of extend.
      return;
    }

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
    selection.removeAllRanges();
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
    // IE legacy document modes do not have containsNode.
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
