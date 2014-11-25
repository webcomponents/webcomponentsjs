/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Window', function() {

  var wrap = ShadowDOMPolyfill.wrap;

  test('addEventListener', function() {
    var calls = 0;
    var doc = wrap(document);
    var win = wrap(window);
    window.addEventListener('click', function f(e) {
      calls++;
      assert.equal(this, win);
      assert.equal(e.target, doc.body);
      assert.equal(e.currentTarget, this);
      window.removeEventListener('click', f);
    });
    win.addEventListener('click', function f(e) {
      calls++;
      assert.equal(this, win);
      assert.equal(e.target, doc.body);
      assert.equal(e.currentTarget, this);
      win.removeEventListener('click', f);
    });

    addEventListener('click', function f(e) {
      calls++;
      assert.equal(this, win);
      assert.equal(e.target, doc.body);
      assert.equal(e.currentTarget, this);
      removeEventListener('click', f);
    });

    document.body.click();
    assert.equal(3, calls);

    document.body.click();
    assert.equal(3, calls);
  });

  test('getComputedStyle', function() {
    var div = document.createElement('div');
    var cs = window.getComputedStyle(div);
    assert.isTrue(cs != null);

    div = document.createElement('div');
    cs = wrap(window).getComputedStyle(div);
    assert.isTrue(cs != null);

    div = document.createElement('div');
    cs = getComputedStyle(div);
    assert.isTrue(cs != null);
  });

  test('getComputedStyleShadow', function() {
    var host = document.createElement('div');
    var root = host.createShadowRoot();
    var elt = document.createElement('div');
    root.appendChild(elt);
    document.body.appendChild(host);
    elt.style.padding = '4px';
    assert.equal(getComputedStyle(elt).paddingLeft, '4px');
    document.body.removeChild(host);
  });

  test('instanceof', function() {
    var win = wrap(window);
    assert.instanceOf(win, Window);
  });

  test('constructor', function() {
    var win = wrap(window);
    assert.equal(Window, win.constructor);
  });

});
