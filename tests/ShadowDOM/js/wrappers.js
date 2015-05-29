/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

suite('Wrapper creation', function() {

  var wrap = ShadowDOMPolyfill.wrap;
  var unwrap = ShadowDOMPolyfill.unwrap;

  var knownElements = {
    'a': 'HTMLAnchorElement',
    // Do not create an applet element by default since it shows a warning in
    // IE.
    // https://github.com/Polymer/polymer/issues/217
    // 'applet': 'HTMLAppletElement',
    'area': 'HTMLAreaElement',
    'br': 'HTMLBRElement',
    'base': 'HTMLBaseElement',
    'body': 'HTMLBodyElement',
    'button': 'HTMLButtonElement',
    // 'command': 'HTMLCommandElement',  // Not fully implemented in Gecko.
    'dl': 'HTMLDListElement',
    'datalist': 'HTMLDataListElement',
    'data': 'HTMLDataElement',
    'dir': 'HTMLDirectoryElement',
    'div': 'HTMLDivElement',
    'embed': 'HTMLEmbedElement',
    'fieldset': 'HTMLFieldSetElement',
    'font': 'HTMLFontElement',
    'form': 'HTMLFormElement',
    'frame': 'HTMLFrameElement',
    'frameset': 'HTMLFrameSetElement',
    'hr': 'HTMLHRElement',
    'head': 'HTMLHeadElement',
    'h1': 'HTMLHeadingElement',
    'html': 'HTMLHtmlElement',
    'iframe': 'HTMLIFrameElement',
    'input': 'HTMLInputElement',
    'li': 'HTMLLIElement',
    'label': 'HTMLLabelElement',
    'legend': 'HTMLLegendElement',
    'link': 'HTMLLinkElement',
    'map': 'HTMLMapElement',
    'marquee': 'HTMLMarqueeElement',
    'menu': 'HTMLMenuElement',
    'menuitem': 'HTMLMenuItemElement',
    'meta': 'HTMLMetaElement',
    'meter': 'HTMLMeterElement',
    'del': 'HTMLModElement',
    'ol': 'HTMLOListElement',
    'object': 'HTMLObjectElement',
    'optgroup': 'HTMLOptGroupElement',
    'option': 'HTMLOptionElement',
    'output': 'HTMLOutputElement',
    'p': 'HTMLParagraphElement',
    'param': 'HTMLParamElement',
    'pre': 'HTMLPreElement',
    'progress': 'HTMLProgressElement',
    'q': 'HTMLQuoteElement',
    'script': 'HTMLScriptElement',
    'select': 'HTMLSelectElement',
    'source': 'HTMLSourceElement',
    'span': 'HTMLSpanElement',
    'style': 'HTMLStyleElement',
    'time': 'HTMLTimeElement',
    'caption': 'HTMLTableCaptionElement',
    // WebKit and Moz are wrong:
    // https://bugs.webkit.org/show_bug.cgi?id=111469
    // https://bugzilla.mozilla.org/show_bug.cgi?id=848096
    // 'td': 'HTMLTableCellElement',
    'col': 'HTMLTableColElement',
    'table': 'HTMLTableElement',
    'tr': 'HTMLTableRowElement',
    'thead': 'HTMLTableSectionElement',
    'tbody': 'HTMLTableSectionElement',
    'textarea': 'HTMLTextAreaElement',
    'track': 'HTMLTrackElement',
    'title': 'HTMLTitleElement',
    'ul': 'HTMLUListElement',
    'video': 'HTMLVideoElement',
  };

  var getCustomClasses = (function() {
    function WrapperClass() {}
    ShadowDOMPolyfill.registerWrapper(WrapperClass, function(){});
    function BaseClass(){}
    BaseClass.prototype = Object.create(WrapperClass.prototype, {
      baseMethod: {
        value: function(arg){return arg;}
      }
    });
    function SuperClass(){};
    // Set a method on a prototype whose parent prototype is not yet wrapped
    SuperClass.prototype = Object.create(BaseClass.prototype, {
      superMethod: {
        value: function(arg){return arg;}
      }
    });
    var Classes = {
      WrapperClass: WrapperClass,
      BaseClass: BaseClass,
      SuperClass: SuperClass
    };
    return function(){
      return Classes;
    }
  })();

  test('Element prototype is first prototype of wrapped instance', function() {
    // Before #317, prototype had to be retrieved with two calls:
    // Object.getPrototypeOf(Object.getPrototypeOf(textNode))
    var Classes = getCustomClasses();
    var node = Object.create(Classes.SuperClass.prototype);
    var wrappedNode = ShadowDOMPolyfill.wrap(node);
    var wrappedPrototype = Object.getPrototypeOf(wrappedNode);
    var customFnDescriptor = Object.getOwnPropertyDescriptor(
        wrappedPrototype, 'superMethod');
    assert.isDefined(customFnDescriptor,
        'Prototype method should be on first prototype of instance');
  });

  // Super class is defined as a class above a base class, which is above an
  // existing wrapped class (GeneratedWrapper).
  test('Super class methods are wrapped as methods on base class', function() {
    var Classes = getCustomClasses();
    var node = Object.create(Classes.SuperClass.prototype);
    var wrappedNode = ShadowDOMPolyfill.wrap(node);
    ShadowDOMPolyfill.setWrapper(node, wrappedNode);
    var wrappedPrototype = Object.getPrototypeOf(wrappedNode);
    var customFnDescriptor = Object.getOwnPropertyDescriptor(
        wrappedPrototype, 'superMethod');
    assert.isFunction(customFnDescriptor.value,
        'Super method should be a function');
    assert.isUndefined(customFnDescriptor.get,
        'Super method should not be get/set');
    assert.isUndefined(customFnDescriptor.set);
  });

  test('Br element wrapper', function() {
    var br = document.createElement('br');
    assert.isTrue('clear' in br);
    assert.isFalse(br.hasOwnProperty('clear'));
    assert.isTrue(Object.getPrototypeOf(br).hasOwnProperty('clear'));
  });

  test('HTMLUnknownElement constructor', function() {
    var element = document.createElement('unknownelement');
    assert.instanceOf(element, HTMLUnknownElement);
    assert.equal(Object.getPrototypeOf(element), HTMLUnknownElement.prototype);
    assert.equal(Object.getPrototypeOf(element).constructor, HTMLUnknownElement);
  });

  Object.keys(knownElements).forEach(function(tagName) {
    test(tagName, function() {
      var constructor = window[knownElements[tagName]];
      if (!constructor)
        return;

      var element = document.createElement(tagName);
      assert.instanceOf(element, constructor);
      assert.equal(Object.getPrototypeOf(element), constructor.prototype);
      assert.equal(Object.getPrototypeOf(element).constructor, constructor);
    });
  });

  test('isIdentifierName', function() {
    var isIdentifierName = ShadowDOMPolyfill.isIdentifierName;
    // Not identiifers:
    assert.isFalse(isIdentifierName('123'));
    assert.isFalse(isIdentifierName('%123'));
    assert.isFalse(isIdentifierName('-123'));

    // Identifiers:
    assert.isTrue(isIdentifierName('_123'));
    assert.isTrue(isIdentifierName('$123'));
    assert.isTrue(isIdentifierName('abC'));
    assert.isTrue(isIdentifierName('abc$123'));
  });

  test('Integer property names', function() {
    // Create a fake "native" DOM object to test wrapping a numeric property.
    function TestNative() {}
    TestNative.prototype['123'] = function() { return 42; };
    function TestWrapper() {
      ShadowDOMPolyfill.setWrapper(new TestNative(), this);
    }
    ShadowDOMPolyfill.registerWrapper(TestNative, TestWrapper);
    var wrapper = new TestWrapper();
    assert.equal(wrapper['123'](), 42);
  });
});
