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

  suite('characterData', function() {

    test('characterData', function() {
      var text = document.createTextNode('abc');
      var observer = new MutationObserver(function() {});
      observer.observe(text, {
        characterData: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: text
      });
      expectMutationRecord(records[1], {
        type: 'characterData',
        target: text
      });
    });

    test('characterData with old value', function() {
      var text = document.createTextNode('abc');
      var observer = new MutationObserver(function() {});
      observer.observe(text, {
        characterData: true,
        characterDataOldValue: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: text,
        oldValue: 'abc'
      });
      expectMutationRecord(records[1], {
        type: 'characterData',
        target: text,
        oldValue: 'def'
      });
    });

    test('characterData change in subtree should not generate a record',
        function() {
      var div = document.createElement('div');
      var text = div.appendChild(document.createTextNode('abc'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        characterData: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 0);
    });

    test('characterData change in subtree',
        function() {
      var div = document.createElement('div');
      var text = div.appendChild(document.createTextNode('abc'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        characterData: true,
        subtree: true
      });
      text.data = 'def';
      text.data = 'ghi';

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'characterData',
        target: text
      });
      expectMutationRecord(records[1], {
        type: 'characterData',
        target: text
      });
    });

  });

});
