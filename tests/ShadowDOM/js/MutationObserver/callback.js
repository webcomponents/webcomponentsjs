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

  suite('callback', function() {

    test('One observer, two attribute changes', function(done) {
      var div = document.createElement('div');
      var observer = new MutationObserver(function(records) {
        assert.equal(records.length, 2);

        expectMutationRecord(records[0], {
          type: 'attributes',
          target: div,
          attributeName: 'a',
          attributeNamespace: null
        });
        expectMutationRecord(records[1], {
          type: 'attributes',
          target: div,
          attributeName: 'a',
          attributeNamespace: null
        });

        done();
      });

      observer.observe(div, {
        attributes: true
      });

      div.setAttribute('a', 'A');
      div.setAttribute('a', 'B');
    });

    test('nested changes', function(done) {
      var div = document.createElement('div');
      var i = 0;
      var observer = new MutationObserver(function(records) {
        assert.equal(records.length, 1);

        if (i === 0) {
          expectMutationRecord(records[0], {
            type: 'attributes',
            target: div,
            attributeName: 'a',
            attributeNamespace: null
          });
          div.setAttribute('b', 'B');
          i++;
        } else {
          expectMutationRecord(records[0], {
            type: 'attributes',
            target: div,
            attributeName: 'b',
            attributeNamespace: null
          });

          done();
        }
      });

      observer.observe(div, {
        attributes: true
      });

      div.setAttribute('a', 'A');
    });

  });

});
