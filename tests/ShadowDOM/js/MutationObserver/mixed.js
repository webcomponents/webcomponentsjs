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
