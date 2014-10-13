/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is goverened by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('SVGElementInstance', function() {

  var div;

  teardown(function() {
    if (div) {
      if (div.parentNode)
        div.parentNode.removeChild(div);
      div = undefined;
    }
  });

  var svgCode = '\
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">\
        <defs>\
          <g id="g">\
            <line/>\
          </g>\
        </defs>\
        <use xlink:href="#g" />\
      </svg>';

  function getInstanceRoot() {
    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = svgCode;
    var svg = div.firstElementChild;
    var useElement = svg.firstElementChild.nextElementSibling;
    return useElement.instanceRoot;
  }

  test('instanceof SVGUseElement', function() {
    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = svgCode;
    var svg = div.firstElementChild;
    var useElement = svg.firstElementChild.nextElementSibling;
    assert.instanceOf(useElement, SVGUseElement);
    assert.instanceOf(useElement, SVGElement);
    assert.instanceOf(useElement, Element);
    assert.instanceOf(useElement, EventTarget);
  });

  test('instanceof SVGElementInstance', function() {
    // Firefox does not implement SVGElementInstance.
    if (/Firefox/.test(navigator.userAgent))
      return;

    var instanceRoot = getInstanceRoot();

    // Safari 6 seems to return null here in some cases.
    if (!instanceRoot)
      return;

    assert.instanceOf(instanceRoot, SVGElementInstance);
    assert.instanceOf(instanceRoot, EventTarget);
  });

  test('correspondingUseElement', function() {
    // Firefox does not implement SVGElementInstance.
    if (/Firefox/.test(navigator.userAgent))
      return;

    div = document.body.appendChild(document.createElement('div'));
    div.innerHTML = svgCode;
    var svg = div.firstElementChild;
    var useElement = svg.firstElementChild.nextElementSibling;
    var instanceRoot = useElement.instanceRoot;

    // Safari 6 seems to return null here in some cases.
    if (!instanceRoot)
      return;

    assert.equal(useElement, instanceRoot.correspondingUseElement);
  });

  test('correspondingElement', function() {
    // Firefox does not implement SVGElementInstance.
    if (/Firefox/.test(navigator.userAgent))
      return;

    var instanceRoot = getInstanceRoot();

    // Safari 6 seems to return null here in some cases.
    if (!instanceRoot)
      return;

    assert.equal('g', instanceRoot.correspondingElement.localName);
  });

  test('tree', function() {
    // Firefox does not implement SVGElementInstance.
    if (/Firefox/.test(navigator.userAgent))
      return;

    var instanceRoot = getInstanceRoot();

    // Safari 6 seems to return null here in some cases.
    if (!instanceRoot)
      return;

    assert.equal('line', instanceRoot.firstChild.correspondingElement.localName);
    assert.equal('line', instanceRoot.lastChild.correspondingElement.localName);

    // IE always returns new wrappers for all the accessors.
    if (/Trident/.test(navigator.userAgent))
      return;

    assert.equal(instanceRoot.firstChild, instanceRoot.lastChild);
    assert.equal(instanceRoot, instanceRoot.firstChild.parentNode);
    assert.isNull(instanceRoot.parentNode);
  });

});
