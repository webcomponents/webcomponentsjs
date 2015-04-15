/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('ShadowRoot', function() {

  var div;
  teardown(function() {
    if (div) {
      if (div.parentNode)
        div.parentNode.removeChild(div);
      div = undefined;
    }
  });

  test('elementFromPoint', function() {
    div = document.body.appendChild(document.createElement('div'));
    div.style.cssText = 'position: fixed; background: red; ' +
                        'width: 10px; height: 10px; top: 0; left: 0;';
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a></a>';
    var a = sr.firstChild;
    a.style.cssText = 'position: absolute; width: 100%; height: 100%; ' +
                      'background: green';

    assert.equal(sr.elementFromPoint(5, 5), a);

    var sr2 = a.createShadowRoot();
    assert.equal(sr.elementFromPoint(5, 5), a);
    assert.equal(sr2.elementFromPoint(5, 5), null);
  });

  test('olderShadowRoot', function() {
    var host = document.createElement('div');
    host.innerHTML = '<a>a</a><b>b</b>';
    var a = host.firstChild;
    var b = host.lastChild;

    var sr = host.createShadowRoot();
    sr.innerHTML = 'a';

    host.offsetWidth;
    assert.isNull(sr.olderShadowRoot);

    var sr2 = host.createShadowRoot();
    sr2.innerHTML = 'b';

    host.offsetWidth;
    assert.equal(sr2.olderShadowRoot, sr);
  });

  test('host', function() {
    var host = document.createElement('div');
    var sr = host.createShadowRoot();
    assert.equal(host, sr.host);

    var sr2 = host.createShadowRoot();
    assert.equal(host, sr2.host);
  });

  test('instanceof', function() {
    var sr = document.createElement('div').createShadowRoot();
    assert.instanceOf(sr, ShadowRoot);
  });

  test('constructor', function() {
    var sr = document.createElement('div').createShadowRoot();
    assert.equal(ShadowRoot, sr.constructor);
  });

});
