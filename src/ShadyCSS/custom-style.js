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
Wrapper over <style> elements to co-operate with ShadyStyling

Example:
<shady-style>
  <style>
  ...
  </style>
</shady-style>
*/

'use strict';

let ShadyStyling = window.ShadyStyling;

let enqueued = false;

let customStyles = [];

let hookFn = null;

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
    ShadyStyling.updateStyles();
    enqueued = false;
  }
}

function CustomStyle() {
  const self = HTMLElement.call(this);
  customStyles.push(self);
  enqueueDocumentValidation();
  return self;
}

Object.defineProperties(CustomStyle, {
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

CustomStyle.applyStyles = function() {
  for (let i = 0; i < customStyles.length; i++) {
    customStyles[i]._applyStyle();
  }
};

CustomStyle.prototype = Object.create(HTMLElement.prototype, {
  'constructor': {
    value: CustomStyle
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
    ShadyStyling._transformCustomStyleForDocument(this._style);
  } else {
    ShadyStyling._revalidateApplyShim(this._style);
  }
};

CustomStyle.prototype._applyStyle = function() {
  if (this._style) {
    ShadyStyling._applyCustomStyle(this._style);
  }
};

window.customElements.define('custom-style', CustomStyle);
window['CustomStyle'] = CustomStyle;
