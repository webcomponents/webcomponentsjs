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

  suite('attributes', function() {

    test('attr', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true
      });
      div.setAttribute('a', 'A');
      div.setAttribute('a', 'B');

      var records = observer.takeRecords();
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
    });

    test('attr with oldValue', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true,
        attributeOldValue: true
      });
      div.setAttribute('a', 'A');
      div.setAttribute('a', 'B');

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: div,
        attributeName: 'a',
        attributeNamespace: null,
        oldValue: null
      });
      expectMutationRecord(records[1], {
        type: 'attributes',
        target: div,
        attributeName: 'a',
        attributeNamespace: null,
        oldValue: 'A'
      });
    });

    test('attr change in subtree should not genereate a record', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true
      });
      child.setAttribute('a', 'A');
      child.setAttribute('a', 'B');

      var records = observer.takeRecords();
      assert.equal(records.length, 0);
    });

    test('attr change, subtree', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true,
        subtree: true
      });
      child.setAttribute('a', 'A');
      child.setAttribute('a', 'B');

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: child,
        attributeName: 'a'
      });
      expectMutationRecord(records[1], {
        type: 'attributes',
        target: child,
        attributeName: 'a'
      });
    });


    test('multiple observers on same target', function() {
      var div = document.createElement('div');
      var observer1 = new MutationObserver(function() {});
      observer1.observe(div, {
        attributes: true,
        attributeOldValue: true
      });
      var observer2 = new MutationObserver(function() {});
      observer2.observe(div, {
        attributes: true,
        attributeFilter: ['b']
      });

      div.setAttribute('a', 'A');
      div.setAttribute('a', 'A2');
      div.setAttribute('b', 'B');

      var records = observer1.takeRecords();
      assert.equal(records.length, 3);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: div,
        attributeName: 'a'
      });
      expectMutationRecord(records[1], {
        type: 'attributes',
        target: div,
        attributeName: 'a',
        oldValue: 'A'
      });
      expectMutationRecord(records[2], {
        type: 'attributes',
        target: div,
        attributeName: 'b'
      });

      records = observer2.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: div,
        attributeName: 'b'
      });
    });

    test('observer observes on different target', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));

      var observer = new MutationObserver(function() {});
      observer.observe(child, {
        attributes: true
      });
      observer.observe(div, {
        attributes: true,
        subtree: true,
        attributeOldValue: true
      });

      child.setAttribute('a', 'A');
      child.setAttribute('a', 'A2');
      child.setAttribute('b', 'B');

      var records = observer.takeRecords();
      assert.equal(records.length, 3);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: child,
        attributeName: 'a'
      });
      expectMutationRecord(records[1], {
        type: 'attributes',
        target: child,
        attributeName: 'a',
        oldValue: 'A'
      });
      expectMutationRecord(records[2], {
        type: 'attributes',
        target: child,
        attributeName: 'b'
      });
    });

    test('observing on the same node should update the options', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true,
        attributeFilter: ['a']
      });
      observer.observe(div, {
        attributes: true,
        attributeFilter: ['b']
      });

      div.setAttribute('a', 'A');
      div.setAttribute('b', 'B');

      var records = observer.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: div,
        attributeName: 'b'
      });
    });

    test('disconnect should stop all events and empty the records', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true,
      });

      div.setAttribute('a', 'A');

      observer.disconnect();
      var records = observer.takeRecords();
      assert.equal(records.length, 0);

      div.setAttribute('b', 'B');

      records = observer.takeRecords();
      assert.equal(records.length, 0);
    });

    test('disconnect should not affect other observers', function() {
      var div = document.createElement('div');
      var observer1 = new MutationObserver(function() {});
      observer1.observe(div, {
        attributes: true,
      });
      var observer2 = new MutationObserver(function() {});
      observer2.observe(div, {
        attributes: true,
      });

      div.setAttribute('a', 'A');

      observer1.disconnect();
      var records1 = observer1.takeRecords();
      assert.equal(records1.length, 0);

      var records2 = observer2.takeRecords();
      assert.equal(records2.length, 1);
      expectMutationRecord(records2[0], {
        type: 'attributes',
        target: div,
        attributeName: 'a'
      });

      div.setAttribute('b', 'B');

      records1 = observer1.takeRecords();
      assert.equal(records1.length, 0);

      records2 = observer2.takeRecords();
      assert.equal(records2.length, 1);
      expectMutationRecord(records2[0], {
        type: 'attributes',
        target: div,
        attributeName: 'b'
      });
    });

    test('should notify changes by target\'s classList property', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        attributes: true,
        attributeOldValue: true
      });
      div.classList.add('A');
      div.classList.add('A'); //< Should be ignored
      div.classList.remove('A');
      div.classList.remove('A'); //< Should be ignored

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'attributes',
        target: div,
        attributeName: 'class',
        attributeNamespace: null,
        oldValue: null
      });
      expectMutationRecord(records[1], {
        type: 'attributes',
        target: div,
        attributeName: 'class',
        attributeNamespace: null,
        oldValue: 'A'
      });
    });

  });

});
