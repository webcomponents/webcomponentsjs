/**
 * @license
 * Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('shadow DOM', function() {

  var work;
  var assert = chai.assert;

  setup(function() {
    work = document.createElement('div');
    document.body.appendChild(work);
  });

  teardown(function() {
    document.body.removeChild(work);
  });

  test('custom elements are created in shadow roots', function() {
    if (!Element.prototype.attachShadow) {
      return;
    }
    class XShadow extends HTMLElement {}
    customElements.define('x-shadow', XShadow);

    var shadowRoot = work.attachShadow({mode: 'open'});
    var container = document.createElement('div');
    shadowRoot.appendChild(container);
    container.innerHTML = '<x-shadow></x-shadow>';

    customElements.flush();
    let el = container.querySelector('x-shadow');
    assert.instanceOf(el, XShadow);
  });

  test('custom elements are upgraded in shadow roots', function() {
    if (!Element.prototype.attachShadow) {
      return;
    }
    class XShadow2 extends HTMLElement {}

    var shadowRoot = work.attachShadow({mode: 'open'});
    var container = document.createElement('div');
    shadowRoot.appendChild(container);
    container.innerHTML = '<x-shadow2></x-shadow2>';

    customElements.flush();
    customElements.define('x-shadow2', XShadow2);
    let el = container.querySelector('x-shadow2');
    assert.instanceOf(el, XShadow2);
  });


});
