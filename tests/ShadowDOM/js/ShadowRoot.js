// Copyright 2013 The Polymer Authors. All rights reserved.
// Use of this source code is goverened by a BSD-style
// license that can be found in the LICENSE file.

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

  test('getElementById', function() {
    var div = document.createElement('div');
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a id=a name=b></a><b id=b></b>';
    var a = sr.firstChild;
    var b = sr.lastChild;

    assert.equal(sr.getElementById('a'), a);
    assert.equal(sr.getElementById('b'), b);
  });

  test('getElementById with a non CSS ID', function() {
    var div = document.createElement('div');
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a id=1 name=2></a><b id=2></b>';
    var a = sr.firstChild;
    var b = sr.lastChild;

    assert.equal(sr.getElementById(1), a);
    assert.equal(sr.getElementById(2), b);
  });

  test('getElementById with a non ID', function() {
    var div = document.createElement('div');
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a id="a b"></a>';
    var a = sr.firstChild;

    assert.isNull(sr.getElementById('a b'));
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
