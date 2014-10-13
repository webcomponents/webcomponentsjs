/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('Shadow DOM', function() {

  var getRendererForHost = ShadowDOMPolyfill.getRendererForHost;
  var unwrap = ShadowDOMPolyfill.unwrap;

  function getVisualInnerHtml(el) {
    el.offsetWidth;
    return unwrap(el).innerHTML;
  }

  function normalizeInnerHtml(s) {
    // IE9 - Even though the attribute name is stored as "checked" innerHTML
    // upper case the name.
    return s.replace(/CHECKED=""/g, 'checked=""')
  }

  function testRender(descr, hostInnerHtml, shadowRoots,
                      expectedOuterHtml, opt_beforeRender) {
    test(descr, function() {
      var host = document.createElement('div');
      host.innerHTML = hostInnerHtml;

      if (typeof shadowRoots === 'string')
        shadowRoots = [shadowRoots];
      shadowRoots.forEach(function(html) {
        var shadowRoot = host.createShadowRoot();
        shadowRoot.innerHTML = html;
      });

      if (opt_beforeRender)
        opt_beforeRender(host);

      assert.strictEqual(normalizeInnerHtml(getVisualInnerHtml(host)),
          normalizeInnerHtml(expectedOuterHtml));
    });
  }

  testRender('Empty shadow', 'abc', '', '');
  testRender('Simple shadow', 'abc', 'def', 'def');
  testRender('Fallback shadow', 'abc',
             '<content select="xxx">fallback</content>', 'fallback');
  testRender('Content', 'abc',
             '<content>fallback</content>', 'abc');
  testRender('Content before', 'abc',
             'before<content>fallback</content>', 'beforeabc');
  testRender('Content after', 'abc',
             '<content>fallback</content>after', 'abcafter');

  suite('content', function() {
    testRender('no select', '<a href="">Link</a> <b>bold</b>',
               '<content></content>',
               '<a href="">Link</a> <b>bold</b>');
    testRender('select ""', '<a href="">Link</a> <b>bold</b>',
               '<content select=""></content>',
               '<a href="">Link</a> <b>bold</b>');
    testRender('select *', '<a href="">Link</a> <b>bold</b>',
               '<content select="*"></content>',
               '<a href="">Link</a><b>bold</b>');

    testRender('select .a',
               '<a class="a">a</a> <a class="b">b</a>',
               '<content select=".a"></content>',
               '<a class="a">a</a>');

    testRender('select .b .a',
               '<a class="a">a</a> <a class="b">b</a>',
               '<content select=".b"></content><content select=".a"></content>',
               '<a class="b">b</a><a class="a">a</a>');
  });

  suite('Nested shadow roots', function() {
    testRender('2 levels deep', 'host', ['oldest shadow', '<shadow></shadow>'],
               'oldest shadow');

    testRender('4 levels deep', 'host',
               ['oldest shadow', '<shadow></shadow>', '<shadow></shadow>',
                '<shadow></shadow>'],
               'oldest shadow');
    testRender('4 levels deep. A bit more interesting', 'host',
               ['a', 'b<shadow></shadow>c', 'd<shadow></shadow>e',
                'f<shadow></shadow>g'],
               'fdbaceg');

    testRender('content and shadow',
               '<a></a><b></b><c></c>',
               [
                 '<content select="a"></content>',
                 '<shadow></shadow><content select="b"></content>',
                 '<content select="c"></content><shadow></shadow>'
               ],
               '<c></c><a></a><b></b>');

    testRender('content in shadow',
               '<a></a><b></b><c></c>',
               [
                 '<d></d>',
                 '<content select="b"></content>' +
                     '<shadow><content select="d"></content></shadow>',
                 '<content select="a"></content>' +
                 '<shadow>' +
                     '<content select="d"></content>' +
                     '<content select="b"></content>' +
                  '</shadow>',
               ],
               '<a></a><b></b><d></d>');
  });

  suite('matches criteria', function() {
    suite('empty select attribute', function() {
      testRender('Content has no select attribute so everything should match',
                 'a <b>c</b> d',
                 '<content></content>',
                 'a <b>c</b> d');
      testRender('Content has empty select attribute so everything should ' +
                    'match',
                 'a <b>c</b> d',
                 '<content select=""></content>',
                 'a <b>c</b> d');
      testRender('Content has an all whitespace select attribute so ' +
                     'everything should match',
                 'a <b>c</b> d',
                 '<content select=" \n \t "></content>',
                 'a <b>c</b> d');
    });

    suite('universal selector', function() {
      testRender('*',
                 '<a></a> <b></b> <c></c>',
                 '<content select="*"></content>',
                 '<a></a><b></b><c></c>');
      testRender('With whitespace',
                 '<a></a> <b></b> <c></c>',
                 '<content select=" * "></content>',
                 '<a></a><b></b><c></c>');

    });

    suite('type selector', function() {
      testRender('b',
                 '<a></a> <b></b> <c></c>',
                 '<content select="b"></content>',
                 '<b></b>');
      testRender('case',
                 '<a></a> <b></b> <c></c>',
                 '<content select="B"></content>',
                 '<b></b>');
    });

    suite('class selector(s)', function() {
      testRender('Single',
                 '<a class="a b"></a><a class="b a"></a><a class="b"></a>',
                 '<content select=".a"></content>',
                 '<a class="a b"></a><a class="b a"></a>');
      testRender('With whitespace',
                 '<a class="a b"></a><a class="b a"></a><a class="b"></a>',
                 '<content select=" .a "></content>',
                 '<a class="a b"></a><a class="b a"></a>');
      testRender('Multiple',
                 '<a class="a b"></a><a class="b a"></a><a class="b"></a>',
                 '<content select=".a.b"></content>',
                 '<a class="a b"></a><a class="b a"></a>');
    });

    suite('ID selector', function() {
      testRender('Simple',
                 '<a id="a"></a><a id="b"></a>',
                 '<content select="#a"></content>',
                 '<a id="a"></a>');
      testRender('Two elements with the same ID',
                 '<a id="a"></a><a id="a"></a>',
                 '<content select="#a"></content>',
                 '<a id="a"></a><a id="a"></a>');
    });

    suite('Attribute selector(s)', function() {
      testRender('Simple',
                 '<a id="a"></a><a id="b"></a>',
                 '<content select="[id]"></content>',
                 '<a id="a"></a><a id="b"></a>');
      testRender('Attribute with value',
                 '<a id="a"></a><a id="b"></a>',
                 '<content select="[id=b]"></content>',
                 '<a id="b"></a>');
      testRender('whitespace separated list',
                 '<a data-test="a b c"></a><a data-test="abc"></a>',
                 '<content select="[data-test~=b]"></content>',
                 '<a data-test="a b c"></a>');
    });

    suite('Not selector', function() {
      testRender('Type',
                 '<a></a><b></b>',
                 '<content select=":not(a)"></content>',
                 '<b></b>');
      testRender('ID',
                 '<a id="a"></a><a id="b"></a>',
                 '<content select=":not(#a)"></content>',
                 '<a id="b"></a>');
      testRender('Class',
                 '<a class="a"></a><a class="b"></a>',
                 '<content select=":not(.a)"></content>',
                 '<a class="b"></a>');
      testRender('Attribute',
                 '<a a="a"></a><a b="b"></a>',
                 '<content select=":not([a])"></content>',
                 '<a b="b"></a>');
      testRender('Attribute Value',
                 '<a x="a"></a><a x="b"></a>',
                 '<content select=":not([x=a])"></content>',
                 '<a x="b"></a>');
    });

  });

  suite('Nested shadow hosts', function() {

    test('Child has a shadow host', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a>3</a>';

      var a = host.firstChild;

      var hostShadowRoot = host.createShadowRoot();
      hostShadowRoot.innerHTML = '1<content></content>5';

      var aShadowRoot = a.createShadowRoot();
      aShadowRoot.innerHTML = '2<content></content>4';

      assert.strictEqual(getVisualInnerHtml(host), '1<a>234</a>5');
    });

    test('Shadow DOM has a shadow host', function() {
      var host = document.createElement('div');
      host.innerHTML = '6';

      var hostShadowRoot = host.createShadowRoot();
      hostShadowRoot.innerHTML = '1<a>3</a>5<content></content>7';

      var a = hostShadowRoot.firstChild.nextSibling;

      var aShadowRoot = a.createShadowRoot();
      aShadowRoot.innerHTML = '2<content></content>4';

      assert.strictEqual(getVisualInnerHtml(host), '1<a>234</a>567');
    });

  });

  suite('Tracking attributes', function() {

    test('attribute selector', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a></a>';
      var a = host.firstChild;

      var sr = host.createShadowRoot();
      sr.innerHTML = '<content select="[foo]"></content>';

      var calls = 0;
      var renderer = getRendererForHost(host);
      var originalRender = renderer.render;
      renderer.render = function() {
        calls++;
        originalRender.call(this);
      };

      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 1);

      a.setAttribute('foo', 'bar');
      assert.equal(getVisualInnerHtml(host), '<a foo="bar"></a>');
      assert.equal(calls, 2);

      a.setAttribute('foo', '');
      assert.equal(getVisualInnerHtml(host), '<a foo=""></a>');
      assert.equal(calls, 3);

      a.removeAttribute('foo');
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 4);

      a.setAttribute('bar', '');
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 4);
    });

    test('id selector', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a></a>';
      var a = host.firstChild;

      var sr = host.createShadowRoot();
      sr.innerHTML = '<content select="#a"></content>';

      var calls = 0;
      var renderer = getRendererForHost(host);
      var originalRender = renderer.render;
      renderer.render = function() {
        calls++;
        originalRender.call(this);
      };

      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 1);

      a.setAttribute('foo', 'bar');
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 1);

      a.setAttribute('id', 'a');
      var visHTML = getVisualInnerHtml(host);
      // IE orders the attributes differently.
      assert.isTrue(visHTML === '<a foo="bar" id="a"></a>' ||
                    visHTML === '<a id="a" foo="bar"></a>');
      assert.equal(calls, 2);

      a.removeAttribute('foo');
      assert.equal(getVisualInnerHtml(host), '<a id="a"></a>');
      assert.equal(calls, 2);

      a.id = 'b';
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 3);

      a.id = 'a';
      assert.equal(getVisualInnerHtml(host), '<a id="a"></a>');
      assert.equal(calls, 4);

      a.id = null;
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 5);
    });

    test('class selector', function() {
      var host = document.createElement('div');
      host.innerHTML = '<a></a>';
      var a = host.firstChild;

      var sr = host.createShadowRoot();
      sr.innerHTML = '<content select=".a"></content>';

      var calls = 0;
      var renderer = getRendererForHost(host);
      var originalRender = renderer.render;
      renderer.render = function() {
        calls++;
        originalRender.call(this);
      };

      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 1);

      a.setAttribute('foo', 'bar');
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 1);

      a.setAttribute('class', 'a');
      var visHTML = getVisualInnerHtml(host);
      // IE orders the attributes differently.
      assert.isTrue(visHTML === '<a foo="bar" class="a"></a>' ||
                    visHTML === '<a class="a" foo="bar"></a>');
      assert.equal(calls, 2);

      a.removeAttribute('foo');
      assert.equal(getVisualInnerHtml(host), '<a class="a"></a>');
      assert.equal(calls, 2);

      a.className = 'b';
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 3);

      a.className = 'a';
      assert.equal(getVisualInnerHtml(host), '<a class="a"></a>');
      assert.equal(calls, 4);

      a.classList.remove('a');
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 5);

      a.classList.add('a');
      assert.equal(getVisualInnerHtml(host), '<a class="a"></a>');
      assert.equal(calls, 6);

      a.className = null;
      assert.equal(getVisualInnerHtml(host), '');
      assert.equal(calls, 7);
    });

  });

  test('invalidation', function() {
    var host = document.createElement('a');
    host.innerHTML = '<b></b> ';
    var b = host.firstChild;
    var text = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<content select="*"></content>';
    var content = sr.firstChild;

    var count = 0;
    var renderer = ShadowDOMPolyfill.getRendererForHost(host);
    var originalInvalidate = renderer.invalidate;
    renderer.invalidate = function() {
      count++;
      return originalInvalidate.apply(this, arguments);
    };

    assert.equal(getVisualInnerHtml(host), '<b></b>');

    b.appendChild(document.createElement('d'));
    assert.equal(count, 0);
    assert.equal(getVisualInnerHtml(host), '<b><d></d></b>');

    b.appendChild(document.createElement('e'));
    assert.equal(count, 0);
    assert.equal(getVisualInnerHtml(host), '<b><d></d><e></e></b>');

    var f = sr.appendChild(document.createElement('f'));
    assert.equal(count, 1);
    assert.equal(getVisualInnerHtml(host), '<b><d></d><e></e></b><f></f>');

    f.appendChild(document.createElement('g'));
    assert.equal(count, 1);
    assert.equal(getVisualInnerHtml(host),
        '<b><d></d><e></e></b><f><g></g></f>');

    host.insertBefore(document.createElement('h'), text);
    assert.equal(count, 2);
    assert.equal(getVisualInnerHtml(host),
                 '<b><d></d><e></e></b><h></h><f><g></g></f>');
  });

  test('issue-235', function() {
    var host = document.createElement('div');
    var sr = host.createShadowRoot();
    sr.innerHTML = '<a><b></b></a>';
    var a = sr.firstChild;
    var b = a.firstChild;

    assert.equal(getVisualInnerHtml(host), '<a><b></b></a>');

    var c = document.createElement('c');
    a.appendChild(c);

    assert.equal(a.childNodes.length, 2);
  });

  test('nested shadow hosts (issue 245)', function() {
    var outer = document.createElement('outer');
    var inner = outer.appendChild(document.createElement('inner'));

    // Inner first. Order matters.
    var innerShadowRoot = inner.createShadowRoot();
    innerShadowRoot.textContent = 'inner';

    var outerShadowRoot = outer.createShadowRoot();
    outerShadowRoot.innerHTML = '<content></content>outer';

    assert.equal(getVisualInnerHtml(outer), '<inner>inner</inner>outer');
  });
  /*
  test('no mutation events during rendering', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a>b</a>';
    var sr = div.createShadowRoot();
    sr.innerHTML = 'c<content></content>d';

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

    assert.equal(getVisualInnerHtml(div), 'c<a>b</a>d');

    assert.equal(count, 0);
  });
  */

  test('moving nodes from light to shadow - issue 48', function() {
    var div = document.createElement('div');
    div.innerHTML = '<a></a><b></b>';
    var a = div.firstChild;
    var b = div.lastChild;

    var sr = div.createShadowRoot();
    sr.innerHTML = '<c></c>';
    var c = sr.firstChild;

    assert.equal(getVisualInnerHtml(div), '<c></c>');

    c.appendChild(a);
    assert.equal(getVisualInnerHtml(div), '<c><a></a></c>');

    c.textContent = '';
    assert.equal(getVisualInnerHtml(div), '<c></c>');

    c.appendChild(b);
    assert.equal(getVisualInnerHtml(div), '<c><b></b></c>');

  });

});
