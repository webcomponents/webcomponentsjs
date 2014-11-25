/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Custom Element', function() {

  test('Correct Wrapper for Custom Element', function() {

    function MyElement() {};
    MyElement.prototype = Object.create(HTMLElement.prototype);
    MyElement.prototype.customMethod = function() {};
    // make a DOM instance
    var div = document.createElement('div');
    // implement custom API
    if (Object.__proto__) {
      // for browsers that support __proto__
      div.__proto__ = MyElement.prototype;
    } else {
      // for browsers that don't support __proto__
      div.customMethod = MyElement.prototype.customMethod;
      // custom API hint for ShadowDOM polyfill
      div.__proto__ = MyElement.prototype;
    }
    assert.typeOf(div.customMethod, 'function',
                  'plain custom element has custom function');
  });

});
