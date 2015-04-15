/**
 * @license
 * Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('NonElementParentNodeInterface', function() {

  var wrap = ShadowDOMPolyfill.wrap;

  var div;
  setup(function() {
    div = document.createElement('div');
    document.body.appendChild(div);
  });

  teardown(function() {
    if (div && div.parentNode)
      div.parentNode.removeChild(div);
  });

  test('getElementById', function() {
    div.innerHTML = '<a id=a name=b></a><b id=b></b>';
    var a = div.firstChild;
    var b = div.lastChild;

    assert.equal(document.getElementById('a'), a);
    assert.equal(document.getElementById('b'), b);
  });

  test('getElementById in shadowRoot', function() {
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a id=a name=b></a><b id=b></b>';
    var a = sr.firstChild;
    var b = sr.lastChild;

    assert.equal(sr.getElementById('a'), a);
    assert.equal(sr.getElementById('b'), b);
    assert.isNull(document.getElementById('a'));
    assert.isNull(wrap(document).getElementById('b'));

    div.offsetHeight;

    // Check after rendering:
    assert.equal(sr.getElementById('a'), a);
    assert.equal(sr.getElementById('b'), b);
    assert.isNull(document.getElementById('a'));
    assert.isNull(wrap(document).getElementById('b'));
  });

  test('getElementById with a non CSS ID', function() {
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a id=1 name=2></a><b id=2></b>';
    var a = sr.firstChild;
    var b = sr.lastChild;

    assert.equal(sr.getElementById(1), a);
    assert.equal(sr.getElementById(2), b);
    assert.isNull(document.getElementById(1));
    assert.isNull(wrap(document).getElementById(2));

    div.offsetHeight;

    // Check after rendering:
    assert.equal(sr.getElementById(1), a);
    assert.equal(sr.getElementById(2), b);
    assert.isNull(document.getElementById(1));
    assert.isNull(wrap(document).getElementById(2));
  });

  test('getElementById with a non ID', function() {
    var sr = div.createShadowRoot();
    sr.innerHTML = '<a id="a b"></a>';
    var a = sr.firstChild;

    assert.isNull(sr.getElementById('a b'));
  });


  test('getElementById in DocumentFragment', function() {
    var df = document.createDocumentFragment();
    df.innerHTML = '<a id=a name=b></a><b id=b></b>';
    var a = df.firstChild;
    var b = df.lastChild;

    assert.equal(df.getElementById('a'), a);
    assert.equal(df.getElementById('b'), b);
  });

  test('getElementById in template content', function() {
    div.innerHTML = '<template><a id=a name=b></a><b id=b></b></template>';
    var template = div.firstChild;
    var content = template.content;

    var a = content.firstChild;
    var b = content.lastChild;

    assert.equal(content.getElementById('a'), a);
    assert.equal(content.getElementById('b'), b);
    assert.isNull(document.getElementById('a'));
    assert.isNull(wrap(document).getElementById('b'));
  });

});
