/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */


// Adapted from:
// https://code.google.com/p/chromium/codesearch#chromium/src/third_party/WebKit/LayoutTests/fast/dom/custom/document-register-type-extensions.html
var testForm = document.createElement('form');

function isFormControl(element)
{
  testForm.appendChild(element);
  return element.form == testForm;
}


/*
 * Work around IE's insertion of XML Namespace elements into .outerHTML of HTMLUnknownElements
 *
 * Clone the input node, insert it into a div, and then read back the outerHTML, which is now stripped of the XML *
 * Namespace element
 */
var isIE = /Trident|Edge/.test(navigator.userAgent);
function assertOuterHTML(element, expected) {
  var outerHTML = element.outerHTML;
  if (isIE) {
    var div = document.createElement('div');
    div.appendChild(element.cloneNode(true));
    outerHTML = div.firstChild.outerHTML;
  }
  chai.assert.equal(outerHTML, expected);
}

var hasProto = ({}.__proto__);
function assertInstanceOf(element, constructor) {
  if (hasProto) {
    chai.assert.instanceOf(element, constructor);
  }
}

function assertNotInstanceOf(element, constructor) {
  if (hasProto) {
    chai.assert.notInstanceOf(element, constructor);
  }
}

suite('register-type-extensions', function() {
  var assert = chai.assert;

  var fooConstructor = document.registerElement('x-foo-x', {
      prototype: Object.create(HTMLElement.prototype) });
  var fooOuterHTML = '<x-foo-x></x-foo-x>';
  var barConstructor = document.registerElement('x-bar-x', {
      prototype: Object.create(HTMLInputElement.prototype),
      extends:'input'});
  var barOuterHTML = '<input is="x-bar-x">';
  var bazConstructor = document.registerElement('x-baz', {
      prototype: Object.create(fooConstructor.prototype) });
  var quxConstructor = document.registerElement('x-qux', {
      prototype: Object.create(barConstructor.prototype),
      extends:'input'});

  test('cannot register twice', function() {
    assert.throws(function() {
      document.registerElement('x-foo-x', {
          prototype: Object.create(HTMLDivElement.prototype) });
    });
  });

  suite('generated constructors', function() {
    test('custom tag', function() {
      var fooNewed = new fooConstructor();
      assertOuterHTML(fooNewed, fooOuterHTML);
      assertInstanceOf(fooNewed, fooConstructor);
      assertInstanceOf(fooNewed, HTMLElement);
      // This is part of the Blink tests, but not supported in Firefox with
      // polyfill. Similar assertions are also commented out below.
      // assertNotInstanceOf(fooNewed, HTMLUnknownElement);

      test('custom tag constructor', function() {
        assert.equal('a', 'b');
      });
    });

    test('type extension', function() {
      var barNewed = new barConstructor();
      assertOuterHTML(barNewed, barOuterHTML);
      assertInstanceOf(barNewed, barConstructor);
      assertInstanceOf(barNewed, HTMLInputElement);
      assert.ok(isFormControl(barNewed));
    });

    test('custom tag deriving from custom tag', function() {
      var bazNewed = new bazConstructor();
      var bazOuterHTML = '<x-baz></x-baz>';
      assertOuterHTML(bazNewed, bazOuterHTML);
      assertInstanceOf(bazNewed, bazConstructor);
      assertInstanceOf(bazNewed, HTMLElement);
      // assertNotInstanceOf(bazNewed, HTMLUnknownElement);
    });

    test('type extension deriving from custom tag', function() {
      var quxNewed = new quxConstructor();
      var quxOuterHTML = '<input is="x-qux">';
      assertInstanceOf(quxNewed, quxConstructor);
      assertInstanceOf(quxNewed, barConstructor);
      assertInstanceOf(quxNewed, HTMLInputElement);
      assertOuterHTML(quxNewed, quxOuterHTML);
      assert.ok(isFormControl(quxNewed));
    });
  });

  suite('single-parameter createElement', function() {
    test('custom tag', function() {
      var fooCreated = document.createElement('x-foo-x');
      assertOuterHTML(fooCreated, fooOuterHTML);
      assertInstanceOf(fooCreated, fooConstructor);
    });

    test('type extension', function() {
      var barCreated = document.createElement('x-bar-x');
      assertOuterHTML(barCreated, '<x-bar-x></x-bar-x>');
      assertNotInstanceOf(barCreated, barConstructor);
      // assertNotInstanceOf(barCreated, HTMLUnknownElement);
      assertInstanceOf(barCreated, HTMLElement);
    });

    test('custom tag deriving from custom tag', function() {
      bazCreated = document.createElement('x-baz');
      assertOuterHTML(bazCreated, '<x-baz></x-baz>');
      assertInstanceOf(bazCreated, bazConstructor);
      // assertNotInstanceOf(bazCreated, HTMLUnknownElement);
    });

    test('type extension deriving from custom tag', function() {
      quxCreated = document.createElement('x-qux');
      assertOuterHTML(quxCreated, '<x-qux></x-qux>');
      assertNotInstanceOf(quxCreated, quxConstructor);
      // assertNotInstanceOf(quxCreated, HTMLUnknownElement);
      assertInstanceOf(quxCreated, HTMLElement);
    });
  });

  suite('createElement with type extensions', function() {
    test('extension is custom tag', function() {
      var divFooCreated = document.createElement('div', 'x-foo-x');
      assertOuterHTML(divFooCreated, '<div is="x-foo-x"></div>');
      assertNotInstanceOf(divFooCreated, fooConstructor);
      assertInstanceOf(divFooCreated, HTMLDivElement);
    });

    test('valid extension', function() {
      var inputBarCreated = document.createElement('input', 'x-bar-x');
      assertOuterHTML(inputBarCreated, barOuterHTML);
      assertInstanceOf(inputBarCreated, barConstructor);
      assertNotInstanceOf(inputBarCreated, HTMLUnknownElement);
      assert.ok(isFormControl(inputBarCreated));
    });

    test('type extension of incorrect tag', function() {
      var divBarCreated = document.createElement('div', 'x-bar-x');
      assertOuterHTML(divBarCreated, '<div is="x-bar-x"></div>');
      assertNotInstanceOf(divBarCreated, barConstructor);
      assertInstanceOf(divBarCreated, HTMLDivElement);
    });

    test('incorrect extension of custom tag', function() {
      var fooBarCreated = document.createElement('x-foo-x', 'x-bar-x');
      assertOuterHTML(fooBarCreated, '<x-foo-x is="x-bar-x"></x-foo-x>');
      assertInstanceOf(fooBarCreated, fooConstructor);
    });

    test('incorrect extension of type extension', function() {
      var barFooCreated = document.createElement('x-bar-x', 'x-foo-x');
      assertOuterHTML(barFooCreated, '<x-bar-x is="x-foo-x"></x-bar-x>');
      // assertNotInstanceOf(barFooCreated, HTMLUnknownElement);
      assertInstanceOf(barFooCreated, HTMLElement);
    });

    test('null type extension', function() {
      var fooCreatedNull = document.createElement('x-foo-x', null);
      assertOuterHTML(fooCreatedNull, fooOuterHTML);
      assertInstanceOf(fooCreatedNull, fooConstructor);
    });

    test('empty type extension', function() {
      fooCreatedEmpty = document.createElement('x-foo-x', '');
      assertOuterHTML(fooCreatedEmpty, fooOuterHTML);
      assertInstanceOf(fooCreatedEmpty, fooConstructor);
    });

    test('invalid tag name', function() {
      assert.throws(function() {
        document.createElement('@invalid', 'x-bar-x');
      });
    });
  });

  suite('parser', function() {
    function createElementFromHTML(html) {
      var container = document.createElement('div');
      container.innerHTML = html;
      if (window.CustomElements) {
        window.CustomElements.upgradeAll(container);
      }
      return container.firstChild;
    }

    test('custom tag', function() {
      var fooParsed = createElementFromHTML('<x-foo-x>');
      assertInstanceOf(fooParsed, fooConstructor);
    });

    test('type extension', function() {
      var barParsed = createElementFromHTML('<input is="x-bar-x">');
      assertInstanceOf(barParsed, barConstructor);
      assert.ok(isFormControl(barParsed));
    });

    test('custom tag as type extension', function() {
      var divFooParsed = createElementFromHTML('<div is="x-foo-x">');
      assertNotInstanceOf(divFooParsed, fooConstructor);
      assertInstanceOf(divFooParsed, HTMLDivElement);
    });

    // Should we upgrade invalid tags to HTMLElement?
    /*test('type extension as custom tag', function() {
      var namedBarParsed = createElementFromHTML('<x-bar-x>')
      assertNotInstanceOf(namedBarParsed, barConstructor);
      assertNotInstanceOf(namedBarParsed, HTMLUnknownElement);
      assertInstanceOf(namedBarParsed, HTMLElement);
    });*/

    test('type extension of incorrect tag', function() {
      var divBarParsed = createElementFromHTML('<div is="x-bar-x">');
      assertNotInstanceOf(divBarParsed, barConstructor);
      assertInstanceOf(divBarParsed, HTMLDivElement);
    });
  });
});
