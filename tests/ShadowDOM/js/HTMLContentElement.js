/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('HTMLContentElement', function() {

  var unwrap = ShadowDOMPolyfill.unwrap;

  test('select', function() {
    var el = document.createElement('content');
    assert.equal(el.select, null);

    el.select = '.xxx';
    assert.equal(el.select, '.xxx');
    assert.isTrue(el.hasAttribute('select'));
    assert.equal(el.getAttribute('select'), '.xxx');

    el.select = '.xxx';
    assert.equal(el.select, '.xxx');
    assert.isTrue(el.hasAttribute('select'));
    assert.equal(el.getAttribute('select'), '.xxx');
  });

  test('getDistributedNodes', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a>a</a><b>b</b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<content></content>';
    var content = sr.firstChild;

    assertArrayEqual(content.getDistributedNodes(), [a, b]);

    content.select = 'a';
    assertArrayEqual(content.getDistributedNodes(), [a]);

    content.select = 'b';
    assertArrayEqual(content.getDistributedNodes(), [b]);
  });

  test('getDistributedNodes add document fragment with content', function() {
    var host = document.createElement('div');
    host.innerHTML = ' <a></a> <a></a> <a></a> ';
    var root = host.createShadowRoot();
    var df = document.createDocumentFragment();
    df.appendChild(document.createTextNode(' '));
    var content = df.appendChild(document.createElement('content'));
    df.appendChild(document.createTextNode(' '));
    root.appendChild(df);

    assertArrayEqual(content.getDistributedNodes().length, 3);
  });

  test('getDistributedNodes add content deep inside tree', function() {
    var host = document.createElement('div');
    host.innerHTML = ' <a></a> <a></a> <a></a> ';
    var root = host.createShadowRoot();
    var b = document.createElement('b');
    var content = b.appendChild(document.createElement('content'));
    content.select = '*';
    root.appendChild(b);

    assert.equal(content.getDistributedNodes().length, 3);
    assertArrayEqual(content.getDistributedNodes(), host.children);
  });

  test('getDistributedNodes add content deeper inside tree', function() {
    var foo = document.createElement('div');
    var fooRoot = foo.createShadowRoot();
    fooRoot.innerHTML = '<div>' +
      ' <div>item1</div> <div>item2</div> <div>item3</div> ' +
    '</div>';

    var bar = fooRoot.firstChild;
    var barRoot = bar.createShadowRoot();
    barRoot.innerHTML = '<div><content></content></div>';

    var zot = barRoot.firstChild;
    var zotRoot = zot.createShadowRoot();
    zotRoot.innerHTML = '<content select="*"></content>';
    var content = zotRoot.firstChild;

    assert.equal(content.getDistributedNodes().length, 3);
    assertArrayEqual(content.getDistributedNodes(), fooRoot.firstChild.children);
  });

  test('Adding tree with content again', function() {
    var host = document.createElement('div');
    host.innerHTML = ' <p>Content</p> ';

    var t = document.createElement('template');
    t.innerHTML = ' <div> <div> [<content></content>] </div> </div> ';

    var sr = host.createShadowRoot();
    sr.appendChild(t.content.cloneNode(true));

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML,
        ' <div> <div> [ <p>Content</p> ] </div> </div> ');
  });

  test('adding a new content element to a shadow tree', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a><b></b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<c></c>';
    var c = sr.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');

    var content = document.createElement('content');
    content.select = 'b';
    c.appendChild(content);

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><b></b></c>');

    c.removeChild(content);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');
  });

  test('adding a new content element to a shadow tree 2', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a><b></b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<c></c>';
    var c = sr.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');

    var d = document.createElement('d');
    var content = d.appendChild(document.createElement('content'));
    content.select = 'b';
    c.appendChild(d);

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><d><b></b></d></c>');

    c.removeChild(d);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');
  });

  test('restricting select further', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a><b></b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<c><content select="*"></content></c>';
    var c = sr.firstChild;
    var content = c.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><a></a><b></b></c>');

    content.select = 'b';
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><b></b></c>');
  });

  test('Mutating content fallback', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<content select="x"></content>';
    var content = sr.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '');

    content.textContent = 'fallback';
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, 'fallback');

    var b = content.appendChild(document.createElement('b'));
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, 'fallback<b></b>');

    content.removeChild(b);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, 'fallback');
  });

  test('Mutating content fallback 2', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<b><content select="x"></content></b>';
    var b = sr.firstChild;
    var content = b.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b></b>');

    content.textContent = 'fallback';
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b>fallback</b>');

    var c = content.appendChild(document.createElement('c'));
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b>fallback<c></c></b>');

    content.removeChild(c);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b>fallback</b>');
  });

  test('getDistributedNodes outside shadow dom', function() {
    var content = document.createElement('content');
    assert.deepEqual(content.getDistributedNodes(), []);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('content'), HTMLContentElement);
  });

  test('constructor', function() {
    assert.equal(HTMLContentElement,
                 document.createElement('content').constructor);
  });
});