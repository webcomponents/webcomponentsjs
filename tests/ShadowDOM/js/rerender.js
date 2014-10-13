/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Shadow DOM rerender', function() {

  var unsafeUnwrap = ShadowDOMPolyfill.unsafeUnwrap;
  var unwrap = ShadowDOMPolyfill.unwrap;

  function getVisualInnerHtml(el) {
    el.offsetWidth;
    return unwrap(el).innerHTML;
  }

  test('No <content> nor <shadow>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.textContent = 'text';
    var textNode = shadowRoot.firstChild;

    function testRender() {

      assert.strictEqual(getVisualInnerHtml(host), 'text');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: textNode,
        lastChild: textNode
      });

      expectStructure(textNode, {
        parentNode: shadowRoot
      });
    }

    testRender();
    testRender();
  });

  test('<content>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<content></content>';
    var content = shadowRoot.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: content,
        lastChild: content
      });

      expectStructure(content, {
        parentNode: shadowRoot
      });
    }

    testRender();
    testRender();
  });

  test('<content> with fallback', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<content select="b">fallback</content>';
    var content = shadowRoot.firstChild;
    var fallback = content.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: content,
        lastChild: content
      });

      expectStructure(content, {
        parentNode: shadowRoot,
        firstChild: fallback,
        lastChild: fallback
      });

      expectStructure(fallback, {
        parentNode: content
      });
    }

    testRender();
    testRender();
  });

  test('<shadow>', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<shadow></shadow>';
    var shadow = shadowRoot.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: shadow,
        lastChild: shadow
      });

      expectStructure(shadow, {
        parentNode: shadowRoot
      });
    }

    testRender();
    testRender();
  });

  test('<shadow> fallback support has been removed', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<shadow>fallback</shadow>';
    var shadow = shadowRoot.firstChild;
    var fallback = shadow.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(shadowRoot, {
        firstChild: shadow,
        lastChild: shadow
      });

      expectStructure(shadow, {
        parentNode: shadowRoot,
        firstChild: fallback,
        lastChild: fallback
      });

      expectStructure(fallback, {
        parentNode: shadow
      });
    }

    testRender();
    testRender();
  });

  test('<shadow> with nested shadow roots', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var oldestShadowRoot = host.createShadowRoot();
    oldestShadowRoot.textContent = 'text';
    var textNode = oldestShadowRoot.firstChild;

    var youngestShadowRoot = host.createShadowRoot();
    youngestShadowRoot.innerHTML = '<shadow></shadow>';
    var shadow = youngestShadowRoot.firstChild;

    function testRender() {
      assert.strictEqual(getVisualInnerHtml(host), 'text');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });

      expectStructure(oldestShadowRoot, {
        firstChild: textNode,
        lastChild: textNode
      });

      expectStructure(textNode, {
        parentNode: oldestShadowRoot
      });

      expectStructure(youngestShadowRoot, {
        firstChild: shadow,
        lastChild: shadow
      });

      expectStructure(shadow, {
        parentNode: youngestShadowRoot
      });
    }

    testRender();
    testRender();
  });

  suite('Mutate logical DOM', function() {
    test('removeAllChildNodes - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content>fallback</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      host.firstChild.textContent = '';

      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      host.textContent = '';
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');
    });

    test('removeAllChildNodes - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content><b>after</b>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b>after</b>');

      shadowRoot.lastChild.textContent = '';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');

      shadowRoot.textContent = '';
      assert.strictEqual(getVisualInnerHtml(host), '');
    });

    test('removeAllChildNodes - mutate shadow fallback', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content select="xxx"><b>fallback</b></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<b>fallback</b>');

      shadowRoot.firstChild.firstChild.textContent = '';

      assert.strictEqual(getVisualInnerHtml(host), '<b></b>');

      shadowRoot.firstChild.textContent = '';

      assert.strictEqual(getVisualInnerHtml(host), '');

      shadowRoot.textContent = '';
      assert.strictEqual(getVisualInnerHtml(host), '');
    });

    test('removeChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content>fallback</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      host.firstChild.removeChild(host.firstChild.firstChild);

      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      host.removeChild(host.firstChild);
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');
    });

    test('removeChild - mutate host 2', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a></a><b></b>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content>fallback</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a></a><b></b>');

      host.removeChild(host.lastChild);

      assert.strictEqual(getVisualInnerHtml(host), '<a></a>');

      host.removeChild(host.firstChild);
      assert.strictEqual(getVisualInnerHtml(host), 'fallback');
    });

    test('removeChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content><b>after</b>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b>after</b>');


      shadowRoot.lastChild.removeChild(
          shadowRoot.lastChild.firstChild);

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');

      shadowRoot.removeChild(shadowRoot.lastChild);
      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      shadowRoot.removeChild(shadowRoot.firstChild);
      assert.strictEqual(getVisualInnerHtml(host), '');
    });

    test('setAttribute select', function() {
      // TODO(arv): DOM bindings for select.
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a><b>World</b>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content select="b">fallback b</content>' +
                             '<content select="a">fallback a</content>';

      assert.strictEqual(getVisualInnerHtml(host), '<b>World</b><a>Hello</a>');

      shadowRoot.firstChild.setAttribute('select', 'xxx');

      assert.strictEqual(getVisualInnerHtml(host), 'fallback b<a>Hello</a>');

      shadowRoot.firstChild.setAttribute('select', '');

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b>World</b>fallback a');
    });

    test('appendChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      host.appendChild(b);

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');
    });

    test('appendChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      shadowRoot.appendChild(b);

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a><b></b>');
    });

    test('insertBefore - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';
      var a = host.firstChild;

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      host.insertBefore(b, a);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b><a>Hello</a>');
    });

    test('insertBefore - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';
      var content = shadowRoot.firstChild;

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      shadowRoot.insertBefore(b, content);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b><a>Hello</a>');
    });

    test('replaceChild - mutate host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';
      var a = host.firstChild;

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      host.replaceChild(b, a);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b>');
    });

    test('replaceChild - mutate shadow', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>Hello</a>';

      var shadowRoot = host.createShadowRoot();
      shadowRoot.innerHTML = '<content></content>';
      var content = shadowRoot.firstChild;

      assert.strictEqual(getVisualInnerHtml(host), '<a>Hello</a>');

      var b = document.createElement('b');

      shadowRoot.replaceChild(b, content);

      assert.strictEqual(getVisualInnerHtml(host), '<b></b>');
    });

  });

  test('Invalidation', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<b></b><content></content><c></c>';
    var b = sr.firstChild;
    var content = b.nextSibling;
    var c = sr.lastChild;

    assert.equal(getVisualInnerHtml(host), '<b></b><a></a><c></c>');

    a.textContent = 'x';

    // Don't use getVisualInnerHtml but it does invalidation.
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b><a>x</a><c></c>');

    host.appendChild(document.createTextNode('y'));
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b><a>x</a><c></c>y');  //dirty
    host.offsetWidth;
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b><a>x</a>y<c></c>');

    sr.appendChild(document.createTextNode('z'));
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b><a>x</a>y<c></c>');  //dirty
    host.offsetWidth;
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b><a>x</a>y<c></c>z');

    sr.insertBefore(document.createTextNode('w'), content);
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b><a>x</a>y<c></c>z');  // dirty
    host.offsetWidth;
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b>w<a>x</a>y<c></c>z');

    // This case does not need invalidation.
    // We could make the check a bit more specific (check for nextSibling being
    // null or a content/shadow).
    sr.insertBefore(document.createTextNode('v'), c);
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b>w<a>x</a>yv<c></c>z');
    host.offsetWidth;
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b>w<a>x</a>yv<c></c>z');

    content.select = '*';
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b>w<a>x</a>yv<c></c>z');  // dirty
    host.offsetWidth;
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b>w<a>x</a>v<c></c>z');

    content.setAttribute('SelecT', 'no-match');
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b>w<a>x</a>v<c></c>z');  // dirty
    host.offsetWidth;
    assert.equal(unsafeUnwrap(host).innerHTML, '<b></b>wv<c></c>z');
  });

  test('minimal dom changes', function() {
    var div = document.createElement('div');

    // TODO(jmesserly): ideally we would intercept all of the visual DOM
    // operations, but that isn't possible because they are captured in the code
    // as originalInsertBefore/originalRemoveChild, so we only see the calls
    // inside ShadowRenderer.

    var originalInsertBefore = ShadowDOMPolyfill.originalInsertBefore;
    var originalRemoveChild = ShadowDOMPolyfill.originalRemoveChild;

    var insertBeforeCount = 0;
    var removeChildCount = 0;

    ShadowDOMPolyfill.originalInsertBefore = function(newChild, refChild) {
      insertBeforeCount++;
      return originalInsertBefore.call(this, newChild, refChild);
    };

    ShadowDOMPolyfill.originalRemoveChild = function(child) {
      removeChildCount++;
      return originalRemoveChild.call(this, child);
    };

    function reset() {
      insertBeforeCount = 0;
      removeChildCount = 0;
    }

    try {

      var div = document.createElement('div');
      var a = div.appendChild(document.createElement('a'));

      var sr = div.createShadowRoot();
      var content = sr.appendChild(document.createElement('content'));
      var b = sr.appendChild(document.createElement('b'));

      assert.equal(getVisualInnerHtml(div), '<a></a><b></b>');

      assert.equal(insertBeforeCount, 1);
      assert.equal(removeChildCount, 1);

      reset();

      // Invalidates but does not change the rendered tree.
      content.select = '*';

      assert.equal(getVisualInnerHtml(div), '<a></a><b></b>');
      assert.equal(insertBeforeCount, 0);
      assert.equal(removeChildCount, 0);

      // Does not use our overridden appendChild
      var c = div.appendChild(document.createElement('c'));
      assert.equal(insertBeforeCount, 0);
      assert.equal(removeChildCount, 0);

      assert.equal(getVisualInnerHtml(div), '<a></a><c></c><b></b>');
      assert.equal(insertBeforeCount, 1);
      assert.equal(removeChildCount, 1);

      content.select = 'c';
      reset();
      assert.equal(getVisualInnerHtml(div), '<c></c><b></b>');
      assert.equal(insertBeforeCount, 0);
      assert.equal(removeChildCount, 1);

      content.select = '*';
      reset();
      assert.equal(getVisualInnerHtml(div), '<a></a><c></c><b></b>');
      assert.equal(insertBeforeCount, 1);
      assert.equal(removeChildCount, 0);

      content.select = 'x';
      reset();
      assert.equal(getVisualInnerHtml(div), '<b></b>');
      assert.equal(insertBeforeCount, 0);
      assert.equal(removeChildCount, 2);

      content.appendChild(document.createTextNode('fallback'));
      reset();
      assert.equal(getVisualInnerHtml(div), 'fallback<b></b>');
      assert.equal(insertBeforeCount, 1);
      assert.equal(removeChildCount, 1);  // moved from content

      content.insertBefore(document.createTextNode('more '),
                           content.firstChild);
      reset();
      assert.equal(getVisualInnerHtml(div), 'more fallback<b></b>');
      assert.equal(insertBeforeCount, 0);  // already inserted before "fallback"
      assert.equal(removeChildCount, 0);

      content.select = '*';
      reset();
      assert.equal(getVisualInnerHtml(div), '<a></a><c></c><b></b>');
      assert.equal(insertBeforeCount, 2);
      assert.equal(removeChildCount, 2);


    } finally {
      ShadowDOMPolyfill.originalInsertBefore =  originalInsertBefore;
      ShadowDOMPolyfill.originalRemoveChild = originalRemoveChild;
    }
  });
});