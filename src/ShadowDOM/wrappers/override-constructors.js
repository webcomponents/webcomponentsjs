/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

(function(scope) {
  'use strict';

  var isWrapperFor = scope.isWrapperFor;

  // This is a list of the elements we currently override the global constructor
  // for.
  var elements = {
    'a': 'HTMLAnchorElement',
    // Do not create an applet element by default since it shows a warning in
    // IE.
    // https://github.com/Polymer/polymer/issues/217
    // 'applet': 'HTMLAppletElement',
    'area': 'HTMLAreaElement',
    'audio': 'HTMLAudioElement',
    'base': 'HTMLBaseElement',
    'body': 'HTMLBodyElement',
    'br': 'HTMLBRElement',
    'button': 'HTMLButtonElement',
    'canvas': 'HTMLCanvasElement',
    'caption': 'HTMLTableCaptionElement',
    'col': 'HTMLTableColElement',
    // 'command': 'HTMLCommandElement',  // Not fully implemented in Gecko.
    'content': 'HTMLContentElement',
    'data': 'HTMLDataElement',
    'datalist': 'HTMLDataListElement',
    'del': 'HTMLModElement',
    'dir': 'HTMLDirectoryElement',
    'div': 'HTMLDivElement',
    'dl': 'HTMLDListElement',
    'embed': 'HTMLEmbedElement',
    'fieldset': 'HTMLFieldSetElement',
    'font': 'HTMLFontElement',
    'form': 'HTMLFormElement',
    'frame': 'HTMLFrameElement',
    'frameset': 'HTMLFrameSetElement',
    'h1': 'HTMLHeadingElement',
    'head': 'HTMLHeadElement',
    'hr': 'HTMLHRElement',
    'html': 'HTMLHtmlElement',
    'iframe': 'HTMLIFrameElement',
    'img': 'HTMLImageElement',
    'input': 'HTMLInputElement',
    'keygen': 'HTMLKeygenElement',
    'label': 'HTMLLabelElement',
    'legend': 'HTMLLegendElement',
    'li': 'HTMLLIElement',
    'link': 'HTMLLinkElement',
    'map': 'HTMLMapElement',
    'marquee': 'HTMLMarqueeElement',
    'menu': 'HTMLMenuElement',
    'menuitem': 'HTMLMenuItemElement',
    'meta': 'HTMLMetaElement',
    'meter': 'HTMLMeterElement',
    'object': 'HTMLObjectElement',
    'ol': 'HTMLOListElement',
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
    'shadow': 'HTMLShadowElement',
    'source': 'HTMLSourceElement',
    'span': 'HTMLSpanElement',
    'style': 'HTMLStyleElement',
    'table': 'HTMLTableElement',
    'tbody': 'HTMLTableSectionElement',
    // WebKit and Moz are wrong:
    // https://bugs.webkit.org/show_bug.cgi?id=111469
    // https://bugzilla.mozilla.org/show_bug.cgi?id=848096
    // 'td': 'HTMLTableCellElement',
    'template': 'HTMLTemplateElement',
    'textarea': 'HTMLTextAreaElement',
    'thead': 'HTMLTableSectionElement',
    'time': 'HTMLTimeElement',
    'title': 'HTMLTitleElement',
    'tr': 'HTMLTableRowElement',
    'track': 'HTMLTrackElement',
    'ul': 'HTMLUListElement',
    'video': 'HTMLVideoElement',
  };

  function overrideConstructor(tagName) {
    var nativeConstructorName = elements[tagName];
    var nativeConstructor = window[nativeConstructorName];
    if (!nativeConstructor)
      return;
    var element = document.createElement(tagName);
    var wrapperConstructor = element.constructor;
    window[nativeConstructorName] = wrapperConstructor;
  }

  Object.keys(elements).forEach(overrideConstructor);

  Object.getOwnPropertyNames(scope.wrappers).forEach(function(name) {
    window[name] = scope.wrappers[name]
  });

})(window.ShadowDOMPolyfill);
