/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Parallel Trees', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;
  var visual = ShadowDOMPolyfill.visual;

  var NodeInvalidate = Node.prototype.invalidateShadowRenderer;
  setup(function() {
    Node.prototype.invalidateShadowRenderer = function() {
      return true;
    };
  });

  teardown(function() {
    Node.prototype.invalidateShadowRenderer = NodeInvalidate;
  });

  suite('Visual', function() {

    test('removeAllChildNodes wrapper', function() {
      var div = document.createElement('div');
      div.textContent = 'a';
      var textNode = div.firstChild;

      div.createShadowRoot();
      div.offsetWidth;

      expectStructure(unwrap(div), {});
      expectStructure(unwrap(textNode), {});

      expectStructure(div, {
        firstChild: textNode,
        lastChild: textNode
      });

      expectStructure(textNode, {
        parentNode: div
      });
    });

    test('removeAllChildNodes wrapper with 3 child nodes', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b><c></c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      var c = div.lastChild;

      div.createShadowRoot();
      div.offsetWidth;

      expectStructure(unwrap(div), {});
      expectStructure(unwrap(a), {});
      expectStructure(unwrap(b), {});
      expectStructure(unwrap(c), {});

      expectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      expectStructure(c, {
        parentNode: div,
        previousSibling: b
      });
    });

    test('appendChild, start with no children', function() {
      var div = document.createElement('div');
      var textNode = document.createTextNode('hello');

      expectStructure(div, {});
      expectStructure(textNode, {});
      unwrapAndExpectStructure(div, {});
      unwrapAndExpectStructure(textNode, {});

      visual.insertBefore(div, textNode, null);

      unwrapAndExpectStructure(div, {
        firstChild: textNode,
        lastChild: textNode
      });

      unwrapAndExpectStructure(textNode, {
        parentNode: div
      });

      expectStructure(div, {});
      expectStructure(textNode, {});
    });

    test('appendChild, start with one child', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a>';
      var a = div.firstChild;
      var b = document.createElement('b');

      visual.insertBefore(div, b, null);

      unwrapAndExpectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      unwrapAndExpectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      unwrapAndExpectStructure(b, {
        parentNode: div,
        previousSibling: a
      });

      expectStructure(div, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: div
      });
      expectStructure(b, {});
    });

    test('appendChild, start with two children', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b>';
      var a = div.firstChild;
      var b = div.lastChild;
      var c = document.createElement('c');

      visual.insertBefore(div, c, null);

      unwrapAndExpectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      unwrapAndExpectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      unwrapAndExpectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      unwrapAndExpectStructure(c, {
        parentNode: div,
        previousSibling: b
      });

      expectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a
      });

      expectStructure(c, {});
    });

    test('appendChild with document fragment again', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a>';
      var a = div.lastChild;
      var df = document.createDocumentFragment();
      var b = df.appendChild(document.createElement('b'));
      var c = df.appendChild(document.createElement('c'));
      div.appendChild(df);

      expectStructure(df, {});

      expectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      expectStructure(c, {
        parentNode: div,
        previousSibling: b
      });

      unwrapAndExpectStructure(df, {});

      unwrapAndExpectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      unwrapAndExpectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      unwrapAndExpectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      unwrapAndExpectStructure(c, {
        parentNode: div,
        previousSibling: b
      });
    });

    test('appendChild with empty document fragment', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a>';
      var a = div.lastChild;
      var df = document.createDocumentFragment();
      div.appendChild(df);

      expectStructure(df, {});

      expectStructure(div, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: div
      });

      unwrapAndExpectStructure(df, {});

      unwrapAndExpectStructure(div, {
        firstChild: a,
        lastChild: a
      });

      unwrapAndExpectStructure(a, {
        parentNode: div
      });
    });

    test('insertBefore', function() {
      var a = document.createElement('a');
      var b = document.createElement('b');
      a.appendChild(b);

      unwrapAndExpectStructure(a, {
        firstChild: b,
        lastChild: b
      });
      unwrapAndExpectStructure(b, {
        parentNode: a
      });

      expectStructure(a, {
        firstChild: b,
        lastChild: b
      });
      expectStructure(b, {
        parentNode: a
      });

      var c = document.createElement('c');
      visual.insertBefore(a, c, b);

      unwrapAndExpectStructure(a, {
        firstChild: c,
        lastChild: b
      });
      unwrapAndExpectStructure(b, {
        parentNode: a,
        previousSibling: c
      });
      unwrapAndExpectStructure(c, {
        parentNode: a,
        nextSibling: b
      });

      expectStructure(a, {
        firstChild: b,
        lastChild: b
      });
      expectStructure(b, {
        parentNode: a
      });
      expectStructure(c, {});

      var d = document.createElement('d');
      visual.insertBefore(a, d, b);

      unwrapAndExpectStructure(a, {
        firstChild: c,
        lastChild: b
      });
      unwrapAndExpectStructure(b, {
        parentNode: a,
        previousSibling: d
      });
      unwrapAndExpectStructure(c, {
        parentNode: a,
        nextSibling: d
      });
      unwrapAndExpectStructure(d, {
        parentNode: a,
        nextSibling: b,
        previousSibling: c
      });

      expectStructure(a, {
        firstChild: b,
        lastChild: b
      });
      expectStructure(b, {
        parentNode: a
      });
      expectStructure(c, {});
      expectStructure(d, {});
    });

    test('insertBefore 2', function() {
      var a = document.createElement('a');
      var b = document.createElement('b');
      var c = document.createElement('b');
      a.appendChild(b);
      a.appendChild(c);

      unwrapAndExpectStructure(a, {
        firstChild: b,
        lastChild: c
      });
      unwrapAndExpectStructure(b, {
        parentNode: a,
        nextSibling: c
      });
      unwrapAndExpectStructure(c, {
        parentNode: a,
        previousSibling: b
      });

      expectStructure(a, {
        firstChild: b,
        lastChild: c
      });
      expectStructure(b, {
        parentNode: a,
        nextSibling: c
      });
      expectStructure(c, {
        parentNode: a,
        previousSibling: b
      });

      // b d c
      var d = document.createElement('d');
      visual.insertBefore(a, d, c);

      unwrapAndExpectStructure(a, {
        firstChild: b,
        lastChild: c
      });
      unwrapAndExpectStructure(b, {
        parentNode: a,
        nextSibling: d
      });
      unwrapAndExpectStructure(c, {
        parentNode: a,
        previousSibling: d
      });
      unwrapAndExpectStructure(d, {
        parentNode: a,
        previousSibling: b,
        nextSibling: c
      });

      expectStructure(a, {
        firstChild: b,
        lastChild: c
      });
      expectStructure(b, {
        parentNode: a,
        nextSibling: c
      });
      expectStructure(c, {
        parentNode: a,
        previousSibling: b
      });
      expectStructure(d, {});
    });

    test('removeChild, start with one child', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a>';
      var a = div.firstChild;

      visual.remove(a);

      unwrapAndExpectStructure(div, {});
      unwrapAndExpectStructure(a, {});

      expectStructure(div, {
        firstChild: a,
        lastChild: a
      });

      expectStructure(a, {
        parentNode: div
      });
    });

    test('removeChild, start with two children, remove first', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b>';
      var a = div.firstChild;
      var b = div.lastChild;

      visual.remove(a);

      unwrapAndExpectStructure(div, {
        firstChild: b,
        lastChild: b
      });

      unwrapAndExpectStructure(a, {});

      unwrapAndExpectStructure(b, {
        parentNode: div
      });

      expectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a
      });
    });

    test('removeChild, start with two children, remove last', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b>';
      var a = div.firstChild;
      var b = div.lastChild;

      visual.remove(b);

      unwrapAndExpectStructure(div, {
        firstChild: a,
        lastChild: a
      });

      unwrapAndExpectStructure(a, {
        parentNode: div
      });

      unwrapAndExpectStructure(b, {});

      expectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a
      });
    });

    test('removeChild, start with three children, remove middle', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><b></b><c></c>';
      var a = div.firstChild;
      var b = a.nextSibling;
      var c = div.lastChild;

      visual.remove(b);

      unwrapAndExpectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      unwrapAndExpectStructure(a, {
        parentNode: div,
        nextSibling: c
      });

      unwrapAndExpectStructure(b, {});

      unwrapAndExpectStructure(c, {
        parentNode: div,
        previousSibling: a
      });

      expectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      expectStructure(c, {
        parentNode: div,
        previousSibling: b
      });
    });
  });

  suite('Logical', function() {
    suite('removeAllChildNodes', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b><c></c>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = div.lastChild;

        div.textContent = '';

        unwrapAndExpectStructure(div, {});
        unwrapAndExpectStructure(a, {});
        unwrapAndExpectStructure(b, {});
        unwrapAndExpectStructure(c, {});


        expectStructure(div, {});
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {});
      });

      test('with wrappers before removal', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b><c></c>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = div.lastChild;

        div.textContent = '';

        unwrapAndExpectStructure(div, {});
        unwrapAndExpectStructure(a, {});
        unwrapAndExpectStructure(b, {});
        unwrapAndExpectStructure(c, {});

        expectStructure(div, {});
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {});
      });

      test('change visual first', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b><c></c>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = div.lastChild;

        div.createShadowRoot();
        div.offsetWidth;

        unwrapAndExpectStructure(div, {});
        unwrapAndExpectStructure(a, {});
        unwrapAndExpectStructure(b, {});
        unwrapAndExpectStructure(c, {});

        div.textContent = '';

        expectStructure(div, {});
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {});
      });
    });

    suite('appendChild', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = document.createElement('c');

        div.appendChild(c);

        unwrapAndExpectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        unwrapAndExpectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        unwrapAndExpectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        unwrapAndExpectStructure(c, {
          parentNode: div,
          previousSibling: b
        });

        expectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: b
        });
      });

      test('with wrappers before', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = document.createElement('c');

        div.appendChild(c);

        unwrapAndExpectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        unwrapAndExpectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        unwrapAndExpectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        unwrapAndExpectStructure(c, {
          parentNode: div,
          previousSibling: b
        });

        expectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: b
        });
      });

      test('change visual first', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><b></b>';
        var a = div.firstChild;
        var b = a.nextSibling;
        var c = document.createElement('c');

        div.createShadowRoot();
        div.offsetWidth;

        div.appendChild(c);

        unwrapAndExpectStructure(div, {
          firstChild: c,
          lastChild: c
        });
        unwrapAndExpectStructure(a, {});
        unwrapAndExpectStructure(b, {});
        unwrapAndExpectStructure(c, {
          parentNode: div
        });

        expectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: b
        });
      });
    });

    suite('insertBefore', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        div.insertBefore(b, c);

        unwrapAndExpectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        unwrapAndExpectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        unwrapAndExpectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        unwrapAndExpectStructure(c, {
          parentNode: div,
          previousSibling: b
        });

        expectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: b
        });
      });

      test('with wrappers before', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        div.insertBefore(b, c);

        unwrapAndExpectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        unwrapAndExpectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        unwrapAndExpectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        unwrapAndExpectStructure(c, {
          parentNode: div,
          previousSibling: b
        });

        expectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: b
        });
      });

      test('change visual first', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        div.createShadowRoot();
        div.offsetWidth;

        div.insertBefore(b, c);

        unwrapAndExpectStructure(div, {});
        unwrapAndExpectStructure(a, {});
        unwrapAndExpectStructure(b, {});
        unwrapAndExpectStructure(c, {});

        expectStructure(div, {
          firstChild: a,
          lastChild: c
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: b
        });

        // swap a and b
        div.insertBefore(b, a);

        expectStructure(div, {
          firstChild: b,
          lastChild: c
        });
        expectStructure(b, {
          parentNode: div,
          nextSibling: a
        });
        expectStructure(a, {
          parentNode: div,
          previousSibling: b,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: a
        });

        // swap a and c
        div.insertBefore(c, a);

        expectStructure(div, {
          firstChild: b,
          lastChild: a
        });
        expectStructure(b, {
          parentNode: div,
          nextSibling: c
        });
        expectStructure(c, {
          parentNode: div,
          previousSibling: b,
          nextSibling: a
        });
        expectStructure(a, {
          parentNode: div,
          previousSibling: c
        });
      });
    });

    test('insertBefore with document fragment', function() {
      var div = document.createElement('div');
      var c = div.appendChild(document.createElement('c'));
      var df = document.createDocumentFragment();
      var a = df.appendChild(document.createElement('a'));
      var b = df.appendChild(document.createElement('b'));

      div.createShadowRoot();
      div.offsetWidth;

      div.insertBefore(df, c);

      unwrapAndExpectStructure(div, {});
      unwrapAndExpectStructure(df, {});
      unwrapAndExpectStructure(a, {});
      unwrapAndExpectStructure(b, {});
      unwrapAndExpectStructure(c, {});

      expectStructure(div, {
        firstChild: a,
        lastChild: c
      });

      expectStructure(df, {});

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      expectStructure(c, {
        parentNode: div,
        previousSibling: b
      });
    });

    test('insertBefore with document fragment again', function() {
      var div = document.createElement('div');
      div.innerHTML = '<a></a><d></d>';
      var a = div.firstChild;
      var d = div.lastChild;

      var df = document.createDocumentFragment();
      var b = df.appendChild(document.createElement('b'));
      var c = df.appendChild(document.createElement('c'));

      div.insertBefore(df, d);

      expectStructure(df, {});

      expectStructure(div, {
        firstChild: a,
        lastChild: d
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      expectStructure(c, {
        parentNode: div,
        previousSibling: b,
        nextSibling: d
      });

      expectStructure(d, {
        parentNode: div,
        previousSibling: c
      });

      unwrapAndExpectStructure(df, {});

      unwrapAndExpectStructure(div, {
        firstChild: a,
        lastChild: d
      });

      unwrapAndExpectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      unwrapAndExpectStructure(b, {
        parentNode: div,
        previousSibling: a,
        nextSibling: c
      });

      unwrapAndExpectStructure(c, {
        parentNode: div,
        previousSibling: b,
        nextSibling: d
      });

      unwrapAndExpectStructure(d, {
        parentNode: div,
        previousSibling: c
      });
    });

    test('insertBefore with different documents', function() {
      var doc = document.implementation.createHTMLDocument('');
      var div = doc.createElement('div');
      div.innerHTML = '<a></a><b></b>';
      var a = div.firstChild;
      var b = div.lastChild;

      div.createShadowRoot();
      div.offsetWidth;

      expectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: b
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: a
      });

      var c = document.createElement('c');
      div.insertBefore(c, b);

      expectStructure(div, {
        firstChild: a,
        lastChild: b
      });

      expectStructure(a, {
        parentNode: div,
        nextSibling: c
      });

      expectStructure(b, {
        parentNode: div,
        previousSibling: c
      });

      expectStructure(c, {
        parentNode: div,
        previousSibling: a,
        nextSibling: b,
      });

      assert.equal(div.ownerDocument, doc);
      assert.equal(a.ownerDocument, div.ownerDocument);
      assert.equal(b.ownerDocument, div.ownerDocument);
      assert.equal(c.ownerDocument, div.ownerDocument);
    });

    suite('replaceChild', function() {
      test('simple', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        div.replaceChild(b, c);

        unwrapAndExpectStructure(div, {
          firstChild: a,
          lastChild: b
        });
        unwrapAndExpectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        unwrapAndExpectStructure(b, {
          parentNode: div,
          previousSibling: a
        });
        unwrapAndExpectStructure(c, {});

        expectStructure(div, {
          firstChild: a,
          lastChild: b
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a
        });
        expectStructure(c, {});
      });

      test('with wrappers before', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        div.replaceChild(b, c);

        expectStructure(div, {
          firstChild: a,
          lastChild: b
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a
        });
        expectStructure(c, {});

        expectStructure(div, {
          firstChild: a,
          lastChild: b
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a
        });
        expectStructure(c, {});
      });

      test('change visual first', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><c></c>';
        var a = div.firstChild;
        var c = a.nextSibling;
        var b = document.createElement('b');

        div.createShadowRoot();
        div.offsetWidth;

        div.replaceChild(b, c);

        unwrapAndExpectStructure(div, {});
        unwrapAndExpectStructure(a, {});
        unwrapAndExpectStructure(b, {});
        unwrapAndExpectStructure(c, {});

        expectStructure(div, {
          firstChild: a,
          lastChild: b
        });
        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });
        expectStructure(b, {
          parentNode: div,
          previousSibling: a
        });
        expectStructure(c, {});

        // Remove a
        div.replaceChild(b, a);

        expectStructure(div, {
          firstChild: b,
          lastChild: b
        });
        expectStructure(a, {});
        expectStructure(b, {
          parentNode: div
        });
        expectStructure(c, {});

        // Swap b with c
        div.replaceChild(c, b);

        expectStructure(div, {
          firstChild: c,
          lastChild: c
        });
        expectStructure(a, {});
        expectStructure(b, {});
        expectStructure(c, {
          parentNode: div
        });
      });

      test('replaceChild with document fragment', function() {
        var div = document.createElement('div');
        div.innerHTML = '<a></a><e></e><d></d>';
        var a = div.firstChild;
        var e = a.nextSibling;
        var d = e.nextSibling;
        var df = document.createDocumentFragment();
        var b = df.appendChild(document.createElement('b'));
        var c = df.appendChild(document.createElement('c'));

        div.replaceChild(df, e);

        expectStructure(df, {});
        expectStructure(e, {});

        expectStructure(div, {
          firstChild: a,
          lastChild: d
        });

        expectStructure(a, {
          parentNode: div,
          nextSibling: b
        });

        expectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });

        expectStructure(c, {
          parentNode: div,
          previousSibling: b,
          nextSibling: d
        });

        expectStructure(d, {
          parentNode: div,
          previousSibling: c
        });

        unwrapAndExpectStructure(df, {});
        unwrapAndExpectStructure(e, {});

        unwrapAndExpectStructure(div, {
          firstChild: a,
          lastChild: d
        });

        unwrapAndExpectStructure(a, {
          parentNode: div,
          nextSibling: b
        });

        unwrapAndExpectStructure(b, {
          parentNode: div,
          previousSibling: a,
          nextSibling: c
        });

        unwrapAndExpectStructure(c, {
          parentNode: div,
          previousSibling: b,
          nextSibling: d
        });

        unwrapAndExpectStructure(d, {
          parentNode: div,
          previousSibling: c
        });

      });

    });

  });

  test('innerHTML', function() {
    var doc = wrap(document);
    var div = doc.createElement('div');
    div.innerHTML = '<a></a>';

    div.createShadowRoot();
    div.offsetWidth;

    var a = div.firstChild;

    div.innerHTML = '<b></b>';

    assert.equal(div.firstChild.tagName, 'B');
  });

});
