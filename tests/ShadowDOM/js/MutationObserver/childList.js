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
  'use strict';

  suite('childList', function() {

    var NodeList = ShadowDOMPolyfill.wrappers.NodeList;

    function makeNodeList(/* ...args */) {
      var nodeList = new NodeList;
      for (var i = 0; i < arguments.length; i++) {
        nodeList[i] = arguments[i];
      }
      nodeList.length = i;
      return nodeList;
    }

    test('appendChild', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });
      var a = document.createElement('a');
      var b = document.createElement('b');

      div.appendChild(a);
      div.appendChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        addedNodes: [b],
        previousSibling: a
      });
    });

    test('insertBefore', function() {
      var div = document.createElement('div');
      var a = document.createElement('a');
      var b = document.createElement('b');
      var c = document.createElement('c');
      div.appendChild(a);

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.insertBefore(b, a);
      div.insertBefore(c, a);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: [b],
        nextSibling: a
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        addedNodes: [c],
        nextSibling: a,
        previousSibling: b
      });
    });

    test('replaceChild', function() {
      var div = document.createElement('div');
      var a = document.createElement('a');
      var b = document.createElement('b');
      div.appendChild(a);

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.replaceChild(b, a);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: [b],
        removedNodes: [a]
      });
    });

    test('removeChild', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createElement('a'));
      var b = div.appendChild(document.createElement('b'));
      var c = div.appendChild(document.createElement('c'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.removeChild(b);
      div.removeChild(a);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        removedNodes: [b],
        nextSibling: c,
        previousSibling: a
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        removedNodes: [a],
        nextSibling: c
      });
    });

    test('Direct children', function() {
      var div = document.createElement('div');
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });
      var a = document.createElement('a');
      var b = document.createElement('b');

      div.appendChild(a);
      div.insertBefore(b, a);
      div.removeChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 3);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        nextSibling: a,
        addedNodes: [b]
      });

      expectMutationRecord(records[2], {
        type: 'childList',
        target: div,
        nextSibling: a,
        removedNodes: [b]
      });
    });

    test('subtree', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var observer = new MutationObserver(function() {});
      observer.observe(child, {
        childList: true
      });
      var a = document.createTextNode('a');
      var b = document.createTextNode('b');

      child.appendChild(a);
      child.insertBefore(b, a);
      child.removeChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 3);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: child,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: child,
        nextSibling: a,
        addedNodes: [b]
      });

      expectMutationRecord(records[2], {
        type: 'childList',
        target: child,
        nextSibling: a,
        removedNodes: [b]
      });
    });

    test('both direct and subtree', function() {
      var div = document.createElement('div');
      var child = div.appendChild(document.createElement('div'));
      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true,
        subtree: true
      });
      observer.observe(child, {
        childList: true
      });

      var a = document.createTextNode('a');
      var b = document.createTextNode('b');

      child.appendChild(a);
      div.appendChild(b);

      var records = observer.takeRecords();
      assert.equal(records.length, 2);

      expectMutationRecord(records[0], {
        type: 'childList',
        target: child,
        addedNodes: [a]
      });

      expectMutationRecord(records[1], {
        type: 'childList',
        target: div,
        addedNodes: [b],
        previousSibling: child
      });
    });

    test('Append multiple at once at the end', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      var df = document.createDocumentFragment();
      var b = df.appendChild(document.createTextNode('b'));
      var c = df.appendChild(document.createTextNode('c'));
      var d = df.appendChild(document.createTextNode('d'));

      div.appendChild(df);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(b, c, d),
        removedNodes: makeNodeList(),
        previousSibling: a,
        nextSibling: null
      });
    });

    test('Append multiple at once at the front', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      var df = document.createDocumentFragment();
      var b = df.appendChild(document.createTextNode('b'));
      var c = df.appendChild(document.createTextNode('c'));
      var d = df.appendChild(document.createTextNode('d'));

      div.insertBefore(df, a);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(b, c, d),
        removedNodes: makeNodeList(),
        previousSibling: null,
        nextSibling: a
      });
    });

    test('Append multiple at once in the middle', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      var df = document.createDocumentFragment();
      var c = df.appendChild(document.createTextNode('c'));
      var d = df.appendChild(document.createTextNode('d'));

      div.insertBefore(df, b);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(c, d),
        removedNodes: makeNodeList(),
        previousSibling: a,
        nextSibling: b
      });
    });

    test('Remove all children using innerHTML', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));
      var c = div.appendChild(document.createTextNode('c'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.innerHTML = '';

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(),
        removedNodes: makeNodeList(a, b, c),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('Replace all children using innerHTML', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.innerHTML = '<c></c><d></d>';
      var c = div.firstChild;
      var d = div.lastChild;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(c, d),
        removedNodes: makeNodeList(a, b),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('Remove all children using textContent', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));
      var c = div.appendChild(document.createTextNode('c'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.textContent = '';

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(),
        removedNodes: makeNodeList(a, b, c),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('Replace all children using textContent', function() {
      var div = document.createElement('div');
      var a = div.appendChild(document.createTextNode('a'));
      var b = div.appendChild(document.createTextNode('b'));

      var observer = new MutationObserver(function() {});
      observer.observe(div, {
        childList: true
      });

      div.textContent = 'text';
      var text = div.firstChild;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: div,
        addedNodes: makeNodeList(text),
        removedNodes: makeNodeList(a, b),
        previousSibling: null,
        nextSibling: null
      });
    });

    test('appendChild removal', function() {
      var a = document.createElement('a');
      var b = document.createElement('b');
      var c = document.createElement('c');

      a.appendChild(c);

      var observerA = new MutationObserver(function() {});
      observerA.observe(a, {
        childList: true
      });

      var observerB = new MutationObserver(function() {});
      observerB.observe(b, {
        childList: true
      });

      b.appendChild(c);

      var recordsA = observerA.takeRecords();

      assert.equal(recordsA.length, 1);
      expectMutationRecord(recordsA[0], {
        type: 'childList',
        target: a,
        removedNodes: [c]
      });

      var recordsB = observerB.takeRecords();
      assert.equal(recordsB.length, 1);
      expectMutationRecord(recordsB[0], {
        type: 'childList',
        target: b,
        addedNodes: [c]
      });
    });

    test('insertBefore removal', function() {
      var a = document.createElement('a');
      var b = document.createElement('b');
      var c = document.createElement('c');
      var d = document.createElement('d');
      var e = document.createElement('e');

      a.appendChild(c);
      a.appendChild(d);
      b.appendChild(e);

      var observerA = new MutationObserver(function() {});
      observerA.observe(a, {
        childList: true
      });

      var observerB = new MutationObserver(function() {});
      observerB.observe(b, {
        childList: true
      });

      b.insertBefore(d, e);

      var recordsA = observerA.takeRecords();

      assert.equal(recordsA.length, 1);
      expectMutationRecord(recordsA[0], {
        type: 'childList',
        target: a,
        removedNodes: [d],
        previousSibling: c
      });

      var recordsB = observerB.takeRecords();
      assert.equal(recordsB.length, 1);
      expectMutationRecord(recordsB[0], {
        type: 'childList',
        target: b,
        addedNodes: [d],
        nextSibling: e
      });
    });

    test('insertBefore removal document fragment', function() {
      var df = document.createDocumentFragment();
      var a = df.appendChild(document.createElement('a'));
      var b = df.appendChild(document.createElement('b'));
      var c = df.appendChild(document.createElement('c'));

      var d = document.createElement('d');
      var e = d.appendChild(document.createElement('e'));
      var f = d.appendChild(document.createElement('f'));

      var observerDf = new MutationObserver(function() {});
      observerDf.observe(df, {
        childList: true
      });

      var observerD = new MutationObserver(function() {});
      observerD.observe(d, {
        childList: true
      });

      d.insertBefore(df, f);

      var recordsDf = observerDf.takeRecords();

      assert.equal(recordsDf.length, 1);
      expectMutationRecord(recordsDf[0], {
        type: 'childList',
        target: df,
        removedNodes: [a, b, c]
      });

      var recordsD = observerD.takeRecords();
      assert.equal(recordsD.length, 1);
      expectMutationRecord(recordsD[0], {
        type: 'childList',
        target: d,
        addedNodes: [a, b, c],
        previousSibling: e,
        nextSibling: f
      });
    });


    test('insertBefore removal document fragment (with shadow roots)', function() {
      var df = document.createDocumentFragment();
      var a = df.appendChild(document.createElement('a'));
      var b = df.appendChild(document.createElement('b'));
      var c = df.appendChild(document.createElement('c'));

      var d = document.createElement('d');
      var sr = d.createShadowRoot();
      var e = sr.appendChild(document.createElement('e'));
      var f = sr.appendChild(document.createElement('f'));

      var observerDf = new MutationObserver(function() {});
      observerDf.observe(df, {
        childList: true
      });

      var observerSr = new MutationObserver(function() {});
      observerSr.observe(sr, {
        childList: true
      });

      sr.insertBefore(df, f);

      var recordsDf = observerDf.takeRecords();

      assert.equal(recordsDf.length, 1);
      expectMutationRecord(recordsDf[0], {
        type: 'childList',
        target: df,
        removedNodes: [a, b, c]
      });

      var recordsSr = observerSr.takeRecords();
      assert.equal(recordsSr.length, 1);
      expectMutationRecord(recordsSr[0], {
        type: 'childList',
        target: sr,
        addedNodes: [a, b, c],
        previousSibling: e,
        nextSibling: f
      });
    });

    test('Check old siblings', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b><c></c>';
      var b = a.firstChild;
      var c = a.lastChild;

      var d = document.createElement('d');
      d.innerHTML = '<e></e><f></f><g></g>';
      var e = d.firstChild;
      var f = e.nextSibling;
      var g = d.lastChild;

      var observer = new MutationObserver(function() {});
      observer.observe(a, {
        childList: true
      });

      var observer2 = new MutationObserver(function() {});
      observer2.observe(d, {
        childList: true
      });

      a.insertBefore(f, c);

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: a,
        addedNodes: [f],
        previousSibling: b,
        nextSibling: c
      });

      records = observer2.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: d,
        removedNodes: [f],
        previousSibling: e,
        nextSibling: g
      });
    });

    test('insertAdjacentHTML beforebegin', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b><c></c>';
      var b = a.firstChild;
      var c = a.lastChild;

      var observer = new MutationObserver(function() {});
      observer.observe(a, {
        childList: true
      });

      c.insertAdjacentHTML('beforebegin', '<d></d><e></e>');

      assert.equal(a.innerHTML, '<b></b><d></d><e></e><c></c>');
      var d = b.nextSibling;
      var e = d.nextSibling;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: a,
        addedNodes: [d, e],
        previousSibling: b,
        nextSibling: c
      });
    });

    test('insertAdjacentHTML afterbegin', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b><c></c>';
      var b = a.firstChild;
      var c = a.lastChild;

      var observer = new MutationObserver(function() {});
      observer.observe(a, {
        childList: true
      });

      a.insertAdjacentHTML('afterbegin', '<d></d><e></e>');

      assert.equal(a.innerHTML, '<d></d><e></e><b></b><c></c>');
      var d = a.firstChild;
      var e = d.nextSibling;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: a,
        addedNodes: [d, e],
        previousSibling: null,
        nextSibling: b
      });
    });

    test('insertAdjacentHTML beforeend', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b><c></c>';
      var b = a.firstChild;
      var c = a.lastChild;

      var observer = new MutationObserver(function() {});
      observer.observe(a, {
        childList: true
      });

      a.insertAdjacentHTML('beforeend', '<d></d><e></e>');

      assert.equal(a.innerHTML, '<b></b><c></c><d></d><e></e>');
      var d = c.nextSibling;
      var e = d.nextSibling;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: a,
        addedNodes: [d, e],
        previousSibling: c,
        nextSibling: null
      });
    });

    test('insertAdjacentHTML afterend', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b><c></c>';
      var b = a.firstChild;
      var c = a.lastChild;

      var observer = new MutationObserver(function() {});
      observer.observe(a, {
        childList: true
      });

      b.insertAdjacentHTML('afterend', '<d></d><e></e>');

      assert.equal(a.innerHTML, '<b></b><d></d><e></e><c></c>');
      var d = b.nextSibling;
      var e = d.nextSibling;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: a,
        addedNodes: [d, e],
        previousSibling: b,
        nextSibling: c
      });
    });

    test('outerHTML', function() {
      var a = document.createElement('a');
      a.innerHTML = '<b></b><c></c><d></d>';
      var b = a.firstChild;
      var c = b.nextSibling;
      var d = a.lastChild;

      var sr = a.createShadowRoot();
      a.offsetHeight;

      var observer = new MutationObserver(function() {});
      observer.observe(a, {
        childList: true
      });

      c.outerHTML = '<e></e><f></f>';
      assert.equal(a.innerHTML, '<b></b><e></e><f></f><d></d>');
      var e = b.nextSibling;
      var f = e.nextSibling;

      var records = observer.takeRecords();
      assert.equal(records.length, 1);
      expectMutationRecord(records[0], {
        type: 'childList',
        target: a,
        addedNodes: [e, f],
        removedNodes: [c],
        previousSibling: b,
        nextSibling: d
      });
    });

  });

});
