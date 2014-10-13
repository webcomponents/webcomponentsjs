/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

suite('MutationObserver', function() {

  suite('mixed', function() {

    test('attr and characterData', function() {
      var div = document.createElement('div');
      var text = div.appendChild(document.createTextNode('text'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true,
        characterData: true,
        subtree: true
      });
      div.setAttribute('a', 'A');
      div.firstChild.data = 'changed';

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: div,
        attributeName: 'a',
        attributeNamespace: null
      });
      expectMutationRecord(records[1], {
        type: 'characterData',
        target: div.firstChild
      });
    });

  });

});