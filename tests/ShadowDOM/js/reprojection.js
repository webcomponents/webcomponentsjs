/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Shadow DOM reprojection', function() {

  var unwrap = ShadowDOMPolyfill.unwrap;

  function getVisualInnerHtml(el) {
    el.offsetWidth;
    return unwrap(el).innerHTML;
  }

  test('Reproject', function() {

    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var shadowRoot = host.createShadowRoot();
    shadowRoot.innerHTML = '<p><b></b><content></content></p>';
    var p = shadowRoot.firstChild;
    var b = p.firstChild;
    var content = p.lastChild;

    var pShadowRoot = p.createShadowRoot();
    pShadowRoot.innerHTML =
        'a: <content select=a></content>b: <content select=b></content>';
    var textNodeA = pShadowRoot.firstChild;
    var contentA = pShadowRoot.childNodes[1];
    var textNodeB = pShadowRoot.childNodes[2]
    var contentB = pShadowRoot.childNodes[3];

    function testRender() {
      host.offsetWidth;
      assert.strictEqual(getVisualInnerHtml(host),
                         '<p>a: <a></a>b: <b></b></p>');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });


      expectStructure(shadowRoot, {
        firstChild: p,
        lastChild: p
      });

      expectStructure(p, {
        parentNode: shadowRoot,
        firstChild: b,
        lastChild: content,
      });

      expectStructure(b, {
        parentNode: p,
        nextSibling: content
      });

      expectStructure(content, {
        parentNode: p,
        previousSibling: b
      });


      expectStructure(pShadowRoot, {
        firstChild: textNodeA,
        lastChild: contentB
      });

      expectStructure(textNodeA, {
        parentNode: pShadowRoot,
        nextSibling: contentA
      });

      expectStructure(contentA, {
        parentNode: pShadowRoot,
        previousSibling: textNodeA,
        nextSibling: textNodeB
      });

      expectStructure(textNodeB, {
        parentNode: pShadowRoot,
        previousSibling: contentA,
        nextSibling: contentB
      });

      expectStructure(contentB, {
        parentNode: pShadowRoot,
        previousSibling: textNodeB
      });
    }

    testRender();
    testRender();

  });

  test('getDistributedNodes can be called before shadowRoot composition', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;
    var shadowRoot = host.createShadowRoot();
    // create another tag disembodied from the first shadowRoot
    var p = document.createElement('p');
    p.innerHTML = '<b></b><content></content>';
    var b = p.firstChild;
    var content = p.lastChild;
    var pShadowRoot = p.createShadowRoot();
    pShadowRoot.innerHTML =
        'a: <content select=a></content>b: <content select=b></content>';
    var textNodeA = pShadowRoot.firstChild;
    var contentA = pShadowRoot.childNodes[1];
    var textNodeB = pShadowRoot.childNodes[2]
    var contentB = pShadowRoot.childNodes[3];
    // call getDistributedNodes before composing the shadowRoots together
    var distributedNodes = contentA.getDistributedNodes();
    assert.equal(distributedNodes.length, 0);
    shadowRoot.appendChild(p);

    function testRender() {
      host.offsetWidth;
      assert.strictEqual(getVisualInnerHtml(host),
                         '<p>a: <a></a>b: <b></b></p>');

      expectStructure(host, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: host
      });


      expectStructure(shadowRoot, {
        firstChild: p,
        lastChild: p
      });

      expectStructure(p, {
        parentNode: shadowRoot,
        firstChild: b,
        lastChild: content,
      });

      expectStructure(b, {
        parentNode: p,
        nextSibling: content
      });

      expectStructure(content, {
        parentNode: p,
        previousSibling: b
      });


      expectStructure(pShadowRoot, {
        firstChild: textNodeA,
        lastChild: contentB
      });

      expectStructure(textNodeA, {
        parentNode: pShadowRoot,
        nextSibling: contentA
      });

      expectStructure(contentA, {
        parentNode: pShadowRoot,
        previousSibling: textNodeA,
        nextSibling: textNodeB
      });

      expectStructure(textNodeB, {
        parentNode: pShadowRoot,
        previousSibling: contentA,
        nextSibling: contentB
      });

      expectStructure(contentB, {
        parentNode: pShadowRoot,
        previousSibling: textNodeB
      });
    }

    testRender();
    testRender();
  });

  test('Regression 432', function() {
    // https://github.com/Polymer/ShadowDOM/issues/432

    var xFoo = document.createElement('x-foo');
    xFoo.innerHTML = '<div>Hello</div>';
    var div = xFoo.firstChild;

    var xBarSr = xFoo.createShadowRoot();

    var xFooSr = xFoo.createShadowRoot();
    xFooSr.innerHTML = '<x-zot><content></content></x-zot><shadow></shadow>';
    var xZot = xFooSr.firstChild;
    var content = xZot.firstChild;
    var shadow = xZot.lastChild;

    xZotSr = xZot.createShadowRoot();
    xZotSr.innerHTML = '<content></content>';
    var content2 = xZotSr.firstChild;

    xFoo.offsetWidth;

    assertArrayEqual(content.getDistributedNodes(), [div]);
    assertArrayEqual(shadow.getDistributedNodes(), [div]);
    assertArrayEqual(content2.getDistributedNodes(), [div]);

    assertArrayEqual(div.getDestinationInsertionPoints(), [content, content2]);

    assert.equal(getVisualInnerHtml(xFoo), '<x-zot><div>Hello</div></x-zot>');
  });

  test('Issue 460', function() {
    // div
    //  - shadow-root
    //  -- a
    //  --- b
    //  ---- shadow-root
    //  ----- content
    //  ---- content (content2)
    //  - d

    var div = document.createElement('div');
    var sr = div.createShadowRoot();
    var a = sr.appendChild(document.createElement('a'));
    var b = a.appendChild(document.createElement('b'));
    var sr2 = b.createShadowRoot();
    var content = sr2.appendChild(document.createElement('content'));
    var content2 = b.appendChild(document.createElement('content'));
    var d = div.appendChild(document.createElement('d'));

    assert.equal(getVisualInnerHtml(div), '<a><b><d></d></b></a>');

    var sr3 = a.createShadowRoot();
    assert.equal(getVisualInnerHtml(div), '<a></a>');

    // div
    //  - shadow-root
    //  -- a
    //  --- shadow-root (sr3)
    //  ---- content (content3)
    //  --- b
    //  ---- shadow-root
    //  ----- content
    //  ---- content (content2)
    //  - d

    var content3 = sr3.appendChild(document.createElement('content'));
    assert.equal(getVisualInnerHtml(div), '<a><b><d></d></b></a>');
  });

  test('Polymer Issue 512', function () {
    // div
    //  - shadow-root
    //  -- content
    //  - a
    //  -- shadow-root
    //  --- content
    //  -- b

    var div = document.createElement('div');
    var sr = div.createShadowRoot();
    var content = sr.appendChild(document.createElement('content'));
    var a = div.appendChild(document.createElement('a'));
    var b = a.appendChild(document.createElement('b'));
    b.offsetWidth;

    var srA = a.createShadowRoot();
    var contentA = srA.appendChild(document.createElement('content'));
    // Ensure we don't improperly reset the insertion point for the shadow host
    // node "a" when we re-render it. The fact that "a" was inserted somewhere
    // else is not a concern when we are only re-rendering its shadow root.
    b.offsetWidth;

    assertArrayEqual(content.getDistributedNodes(), [a]);
    assertArrayEqual(contentA.getDistributedNodes(), [b]);

    assertArrayEqual(a.getDestinationInsertionPoints(), [content]);
    assertArrayEqual(b.getDestinationInsertionPoints(), [contentA]);
  });
});
