/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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