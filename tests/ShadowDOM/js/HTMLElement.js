/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('HTMLElement', function() {

  var div;

  setup(function() {
    div = document.body.appendChild(document.createElement('div'));
    div.style.cssText =
        'width: 100px; height: 100px; overflow: scroll;' +
        'position: absolute; top: 100px; left: 100px;' +
        'border: 10px solid red';
    var sr = div.createShadowRoot();
    var div2 = sr.appendChild(document.createElement('div'));
    div2.style.cssText = 'width: 1000px; height: 1000px';
  });

  teardown(function() {
    if (div && div.parentNode)
      div.parentNode.removeChild(div);
    div = undefined;
  });

  test('scrollTop', function() {
    assert.equal(div.scrollTop, 0);
    div.scrollTop = 100;
    assert.equal(div.scrollTop, 100);
  });

  test('scrollLeft', function() {
    assert.equal(div.scrollLeft, 0);
    div.scrollLeft = 100;
    assert.equal(div.scrollLeft, 100);
  });

  test('scrollHeight', function() {
    assert.equal(div.scrollHeight, 1000);
  });

  test('scrollWidth', function() {
    assert.equal(div.scrollHeight, 1000);
  });

  test('clientHeight', function() {
    div.style.overflow = 'hidden';
    assert.equal(div.clientHeight, 100);
  });

  test('clientLeft', function() {
    div.style.overflow = 'hidden';
    assert.equal(div.clientLeft, 10);
  });

  test('clientTop', function() {
    assert.equal(div.clientTop, 10);
  });

  test('clientWidth', function() {
    div.style.overflow = 'hidden';
    assert.equal(div.clientWidth, 100);
  });

  test('offsetHeight', function() {
    assert.equal(div.offsetHeight, 120);
  });

  test('offsetLeft', function() {
    assert.equal(div.offsetLeft, 100);
  });

  test('offsetTop', function() {
    assert.equal(div.offsetTop, 100);
  });

  test('offsetWidth', function() {
    assert.equal(div.offsetWidth, 120);
  });

  test('script innerHTML', function() {
    var script = document.createElement('script');
    var html = '<x>{{y}}</x>';
    script.innerHTML = html;
    assert.equal(script.innerHTML, html);
  });

  test('script textContent', function() {
    var script = document.createElement('script');
    var html = '<x>{{y}}</x>';
    script.innerHTML = html;
    assert.equal(script.textContent, html);
  });

  test('comment innerHTML', function() {
    var div = document.createElement('div');
    var comment = document.createComment('&\u00A0<>"');
    div.appendChild(comment);
    assert.equal(div.innerHTML, '<!--&\u00A0<>"-->');
  });

  test('hidden property', function() {
    var div = document.createElement('div');
    assert.isFalse(div.hidden);
    div.hidden = true;
    assert.isTrue(div.hasAttribute('hidden'));
    assert.equal(div.getAttribute('hidden'), '');
    div.hidden = false;
    assert.isFalse(div.hasAttribute('hidden'));
  });

  test('img outerHTML in XHTML documents', function() {
    var docType = document.implementation.createDocumentType('html', '-//W3C//DTD XHTML 1.0 Transitional//EN',
                            'http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd');
    var doc = document.implementation.createDocument('http://www.w3.org/1999/xhtml', 'html', docType);
    var img = doc.createElement('img');
    assert.equal(img.outerHTML, '<img/>');
  });
});
