/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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