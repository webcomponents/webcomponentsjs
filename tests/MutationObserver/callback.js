/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('JsMutationObserver callback', function() {

  test('One observer, two attribute changes', function(cont) {
    var div = document.createElement('div');
    var observer = new JsMutationObserver(function(records) {
      assert.strictEqual(records.length, 2);

      expectRecord(records[0], {
        type: 'attributes',
        target: div,
        attributeName: 'a',
        attributeNamespace: null
      });
      expectRecord(records[1], {
        type: 'attributes',
        target: div,
        attributeName: 'a',
        attributeNamespace: null
      });

      cont();
    });

    observer.observe(div, {
      attributes: true
    });

    div.setAttribute('a', 'A');
    div.setAttribute('a', 'B');
  });

  test('nested changes', function(cont) {
    var div = document.createElement('div');
    var i = 0;
    var observer = new JsMutationObserver(function(records) {
      assert.strictEqual(records.length, 1);

      if (i === 0) {
        expectRecord(records[0], {
          type: 'attributes',
          target: div,
          attributeName: 'a',
          attributeNamespace: null
        });
        div.setAttribute('b', 'B');
        i++;
      } else {
        expectRecord(records[0], {
          type: 'attributes',
          target: div,
          attributeName: 'b',
          attributeNamespace: null
        });

        cont();
      }
    });

    observer.observe(div, {
      attributes: true
    });

    div.setAttribute('a', 'A');
  });

});
