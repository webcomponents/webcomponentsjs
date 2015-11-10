/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('HTMLContentElement', function() {

  var unwrap = ShadowDOMPolyfill.unwrap;

  test('select', function() {
    var el = document.createElement('slot');
    assert.equal(el.name, null);

    el.name = 'xxx';
    assert.equal(el.name, '.xxx');
    assert.isTrue(el.hasAttribute('name'));
    assert.equal(el.getAttribute('name'), 'xxx');
  });

  test('getDistributedNodes', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a slot="a">a</a><b slot="b">b</b>';
    var a = host.firstChild;
    var b = a.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<slot></slot>';
    var slot = sr.firstChild;

    assertArrayEqual(slot.getDistributedNodes(), [a, b]);

    slot.name = 'a';
    assertArrayEqual(content.getDistributedNodes(), [a]);

    content.name = 'b';
    assertArrayEqual(content.getDistributedNodes(), [b]);
  });

  test('getDistributedNodes add document fragment with slot', function() {
    var host = document.createElement('div');
    host.innerHTML = ' <a></a> <a></a> <a></a> ';
    var root = host.createShadowRoot();
    var df = document.createDocumentFragment();
    df.appendChild(document.createTextNode(' '));
    var slot = df.appendChild(document.createElement('slot'));
    df.appendChild(document.createTextNode(' '));
    root.appendChild(df);

    assert.equal(slot.getDistributedNodes().length, 7);
    assertArrayEqual(slot.getDistributedNodes(), host.childNodes);
  });

  test('getDistributedNodes add slot deep inside tree', function() {
    var host = document.createElement('div');
    host.innerHTML = ' <a></a> <a></a> <a></a> ';
    var root = host.createShadowRoot();
    var b = document.createElement('b');
    var slot = b.appendChild(document.createElement('slot'));
    root.appendChild(b);

    assert.equal(slot.getDistributedNodes().length, 7);
    assertArrayEqual(slot.getDistributedNodes(), host.childNodes);
  });

  test('getDistributedNodes add slot deeper inside tree', function() {
    var foo = document.createElement('div');
    var fooRoot = foo.createShadowRoot();
    fooRoot.innerHTML = '<div>' +
      ' <div>item1</div> <div>item2</div> <div>item3</div> ' +
    '</div>';

    var bar = fooRoot.firstChild;
    var barRoot = bar.createShadowRoot();
    barRoot.innerHTML = '<div><slot></slot></div>';

    var zot = barRoot.firstChild;
    var zotRoot = zot.createShadowRoot();
    zotRoot.innerHTML = '<slot></slot>';
    var slot = zotRoot.firstChild;

    assert.equal(slot.getDistributedNodes().length, 7);
    assertArrayEqual(content.getDistributedNodes(), fooRoot.firstChild.childNodes);
  });

  test('Adding tree with slot again', function() {
    var host = document.createElement('div');
    host.innerHTML = ' <p>Content</p> ';

    var t = document.createElement('template');
    t.innerHTML = ' <div> <div> [<slot></slot>] </div> </div> ';

    var sr = host.createShadowRoot();
    sr.appendChild(t.content.cloneNode(true));

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML,
        ' <div> <div> [ <p>Content</p> ] </div> </div> ');
  });

  test('adding a new slot element to a shadow tree', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a><b slot="b"></b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<c></c>';
    var c = sr.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');

    var slot = document.createElement('slot');
    slot.name = 'b';
    c.appendChild(slot);

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><b slot="b"></b></c>');

    c.removeChild(slot);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');
  });

  test('adding a new slot element to a shadow tree 2', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a><b slot="b"></b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<c></c>';
    var c = sr.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');

    var d = document.createElement('d');
    var slot = d.appendChild(document.createElement('slot'));
    slot.name = 'b';
    c.appendChild(d);

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><d><b slot="b"></b></d></c>');

    c.removeChild(d);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c></c>');
  });

  test('Mutating slot name', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a slot="a"></a><b slot="b"></b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<c><slot name="a"></slot></c>';
    var c = sr.firstChild;
    var slot = c.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><a slot="a"></a></c>');

    slot.name = 'b';
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><b slot="b"></b></c>');

    slot.name = '';
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<c><a slot="a"></a><b slot="b"></b></c>');
  });

  test('Mutating slot fallback', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<slot name="x"></slot>';
    var slot = sr.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '');

    slot.textContent = 'fallback';
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, 'fallback');

    var b = slot.appendChild(document.createElement('b'));
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, 'fallback<b></b>');

    slot.removeChild(b);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, 'fallback');
  });

  test('Mutating slot fallback 2', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a></a>';
    var a = host.firstChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = '<b><slot name="x"></slot></b>';
    var b = sr.firstChild;
    var slot = b.firstChild;

    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b></b>');

    slot.textContent = 'fallback';
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b>fallback</b>');

    var c = slot.appendChild(document.createElement('c'));
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b>fallback<c></c></b>');

    slot.removeChild(c);
    host.offsetHeight;
    assert.equal(unwrap(host).innerHTML, '<b>fallback</b>');
  });

  test('getDistributedNodes outside shadow dom', function() {
    var content = document.createElement('slot');
    assert.deepEqual(slot.getDistributedNodes(), []);
  });

  test('instanceof', function() {
    assert.instanceOf(document.createElement('slot'), HTMLSlotElement);
  });

  test('constructor', function() {
    assert.equal(HTMLSlotElement,
                 document.createElement('slot').constructor);
  });
});
