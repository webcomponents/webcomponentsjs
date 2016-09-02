/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

/*
Wrapper over <style> elements to co-operate with ShadyCSS

Example:
<shady-style>
  <style>
  ...
  </style>
</shady-style>
*/

'use strict';

let ShadyCSS = window.ShadyCSS;

let enqueued = false;

let customStyles = [];

let hookFn = null;

/*
If a page only has <custom-style> elements, it will flash unstyled content,
as all the instances will boot asynchronously after page load.

Calling ShadyCSS.updateStyles() will force the work to happen synchronously
*/
function enqueueDocumentValidation() {
  if (enqueued) {
    return;
  }
  enqueued = true;
  if (window.HTMLImports) {
    window.HTMLImports.whenReady(validateDocument);
  } else if (document.readyState === 'complete') {
    requestAnimationFrame(validateDocument);
  } else {
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'complete') {
        validateDocument();
      }
    });
  }
}

function validateDocument() {
  if (enqueued) {
    ShadyCSS.updateStyles();
    enqueued = false;
  }
}

function CustomStyle() {
  /*
  Use Reflect to invoke the HTMLElement constructor, or rely on the
  CustomElement polyfill replacement that can be `.call`ed
  */
  const self = (window.Reflect && Reflect.construct)
    ? Reflect.construct(HTMLElement, [], this.constructor || CustomStyle)
    : HTMLElement.call(this);
  customStyles.push(self);
  enqueueDocumentValidation();
  return self;
}

Object.defineProperties(CustomStyle, {
  /*
  CustomStyle.processHook is provided to customize the <style> element child of
  a <custom-style> element before the <style> is processed by ShadyCSS

  The function must take a <style> element as input, and return nothing.
  */
  processHook: {
    get() {
      return hookFn;
    },
    set(fn) {
      hookFn = fn;
      return fn;
    }
  },
  _customStyles: {
    get() {
      return customStyles;
    }
  },
  _documentDirty: {
    get() {
      return enqueued;
    },
    set(value) {
      enqueued = value;
      return value;
    }
  }
});

CustomStyle.findStyles = function() {
  for (let i = 0; i < customStyles.length; i++) {
    customStyles[i]._findStyle();
  }
};

CustomStyle._revalidateApplyShim = function() {
  for (let i = 0; i < customStyles.length; i++) {
    let s = customStyles[i];
    if (s._style) {
      ShadyCSS._revalidateApplyShim(s._style);
    }
  }
}

CustomStyle.applyStyles = function() {
  for (let i = 0; i < customStyles.length; i++) {
    customStyles[i]._applyStyle();
  }
};

CustomStyle.prototype = Object.create(HTMLElement.prototype, {
  'constructor': {
    value: CustomStyle,
    configurable: true,
    writable: true
  }
});

CustomStyle.prototype._findStyle = function() {
  if (!this._style) {
    let style = this.querySelector('style');
    if (!style) {
      return;
    }
    // HTMLImports polyfill may have cloned the style into the main document,
    // which is referenced with __appliedStyle.
    // Also, we must copy over the attributes.
    if (style.__appliedStyle) {
      for (let i = 0; i < style.attributes.length; i++) {
        let attr = style.attributes[i];
        style.__appliedStyle.setAttribute(attr.name, attr.value);
      }
    }
    this._style = style.__appliedStyle || style;
    if (hookFn) {
      hookFn(this._style);
    }
    ShadyCSS._transformCustomStyleForDocument(this._style);
  }
};

CustomStyle.prototype._applyStyle = function() {
  if (this._style) {
    ShadyCSS._applyCustomStyleToDocument(this._style);
  }
};

window.customElements.define('custom-style', CustomStyle);
window['CustomStyle'] = CustomStyle;
