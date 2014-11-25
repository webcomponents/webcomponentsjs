/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('MutationObserver', function() {

  suite('options', function() {

    test('attributeOldValue and attributes', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});

      assert.throws(function() {
        observer.observe(div, {
          attributeOldValue: true,
          attributes: false
        });
      }, TypeError);

      observer.observe(div, {
        attributeOldValue: true,
      });

      observer.observe(div, {
        attributeOldValue: false,
        attributes: false
      });

      observer.observe(div, {
        attributeOldValue: false,
        attributes: true
      });

      observer.observe(div, {
        attributeOldValue: true,
        attributes: true
      });
    });

    test('attributeFilter and attributes', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});

      assert.throws(function() {
        observer.observe(div, {
          attributeFilter: ['name'],
          attributes: false
        });
      }, TypeError);

      observer.observe(div, {
        attributeFilter: ['name'],
      });

      assert.throws(function() {
        observer.observe(div, {
          attributeFilter: null,
        });
      }, TypeError);

      observer.observe(div, {
        attributeFilter: ['name'],
        attributes: true
      });

      observer.observe(div, {
        attributes: false
      });

      observer.observe(div, {
        attributes: true
      });
    });

    test('characterDataOldValue and characterData', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});

      assert.throws(function() {
        observer.observe(div, {
          characterDataOldValue: true,
          characterData: false
        });
      }, TypeError);

      observer.observe(div, {
        characterDataOldValue: true
      });

      observer.observe(div, {
        characterDataOldValue: false,
        characterData: false
      });

      observer.observe(div, {
        characterDataOldValue: false,
        characterData: true
      });

      observer.observe(div, {
        characterDataOldValue: true,
        characterData: true
      });
    });

  });

});
