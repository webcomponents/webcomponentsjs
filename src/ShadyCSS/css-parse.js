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
Extremely simple css parser. Intended to be not more than what we need
and definitely not necessarily correct =).
*/

'use strict';

// given a string of css, return a simple rule tree
export function parse(text) {
  text = clean(text);
  return parseCss(lex(text), text);
}

// remove stuff we don't care about that may hinder parsing
function clean(cssText) {
  return cssText.replace(RX.comments, '').replace(RX.port, '');
}

// super simple {...} lexer that returns a node tree
function lex(text) {
  let root = {
    start: 0,
    end: text.length
  };
  let n = root;
  for (let i = 0, l = text.length; i < l; i++) {
    if (text[i] === OPEN_BRACE) {
      if (!n.rules) {
        n.rules = [];
      }
      let p = n;
      let previous = p.rules[p.rules.length - 1];
      n = {
        start: i + 1,
        parent: p,
        previous: previous
      };
      p.rules.push(n);
    } else if (text[i] === CLOSE_BRACE) {
      n.end = i + 1;
      n = n.parent || root;
    }
  }
  return root;
}

// add selectors/cssText to node tree
function parseCss(node, text) {
  let t = text.substring(node.start, node.end - 1);
  node.parsedCssText = node.cssText = t.trim();
  if (node.parent) {
    let ss = node.previous ? node.previous.end : node.parent.start;
    t = text.substring(ss, node.start - 1);
    t = _expandUnicodeEscapes(t);
    t = t.replace(RX.multipleSpaces, ' ');
    // TODO(sorvell): ad hoc; make selector include only after last ;
    // helps with mixin syntax
    t = t.substring(t.lastIndexOf(';') + 1);
    let s = node.parsedSelector = node.selector = t.trim();
    node.atRule = (s.indexOf(AT_START) === 0);
    // note, support a subset of rule types...
    if (node.atRule) {
      if (s.indexOf(MEDIA_START) === 0) {
        node.type = types.MEDIA_RULE;
      } else if (s.match(RX.keyframesRule)) {
        node.type = types.KEYFRAMES_RULE;
        node.keyframesName =
          node.selector.split(RX.multipleSpaces).pop();
      }
    } else {
      if (s.indexOf(VAR_START) === 0) {
        node.type = types.MIXIN_RULE;
      } else {
        node.type = types.STYLE_RULE;
      }
    }
  }
  let r$ = node.rules;
  if (r$) {
    for (let i = 0, l = r$.length, r;
      (i < l) && (r = r$[i]); i++) {
      parseCss(r, text);
    }
  }
  return node;
}

// conversion of sort unicode escapes with spaces like `\33 ` (and longer) into
// expanded form that doesn't require trailing space `\000033`
function _expandUnicodeEscapes(s) {
  return s.replace(/\\([0-9a-f]{1,6})\s/gi, function() {
    let code = arguments[1],
      repeat = 6 - code.length;
    while (repeat--) {
      code = '0' + code;
    }
    return '\\' + code;
  });
}

// stringify parsed css.
export function stringify(node, preserveProperties, text) {
  text = text || '';
  // calc rule cssText
  let cssText = '';
  if (node.cssText || node.rules) {
    let r$ = node.rules;
    if (r$ && !_hasMixinRules(r$)) {
      for (let i = 0, l = r$.length, r;
        (i < l) && (r = r$[i]); i++) {
        cssText = stringify(r, preserveProperties, cssText);
      }
    } else {
      cssText = preserveProperties ? node.cssText :
        removeCustomProps(node.cssText);
      cssText = cssText.trim();
      if (cssText) {
        cssText = '  ' + cssText + '\n';
      }
    }
  }
  // emit rule if there is cssText
  if (cssText) {
    if (node.selector) {
      text += node.selector + ' ' + OPEN_BRACE + '\n';
    }
    text += cssText;
    if (node.selector) {
      text += CLOSE_BRACE + '\n\n';
    }
  }
  return text;
}

function _hasMixinRules(rules) {
  return rules[0].selector.indexOf(VAR_START) === 0;
}

function removeCustomProps(cssText) {
  cssText = removeCustomPropAssignment(cssText);
  return removeCustomPropApply(cssText);
}

export function removeCustomPropAssignment(cssText) {
  return cssText
    .replace(RX.customProp, '')
    .replace(RX.mixinProp, '');
}

function removeCustomPropApply(cssText) {
  return cssText
    .replace(RX.mixinApply, '')
    .replace(RX.varApply, '');
}

export let types = {
  STYLE_RULE: 1,
  KEYFRAMES_RULE: 7,
  MEDIA_RULE: 4,
  MIXIN_RULE: 1000
}

let OPEN_BRACE = '{';
let CLOSE_BRACE = '}';

// helper regexp's
let RX = {
  comments: /\/\*[^*]*\*+([^/*][^*]*\*+)*\//gim,
  port: /@import[^;]*;/gim,
  customProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?(?:[;\n]|$)/gim,
  mixinProp: /(?:^[^;\-\s}]+)?--[^;{}]*?:[^{};]*?{[^}]*?}(?:[;\n]|$)?/gim,
  mixinApply: /@apply\s*\(?[^);]*\)?\s*(?:[;\n]|$)?/gim,
  varApply: /[^;:]*?:[^;]*?var\([^;]*\)(?:[;\n]|$)?/gim,
  keyframesRule: /^@[^\s]*keyframes/,
  multipleSpaces: /\s+/g
}

let VAR_START = '--';
let MEDIA_START = '@media';
let AT_START = '@';

if (window.WCT) {
  window['CssParse'] = {
    parse,
    stringify,
    types,
    removeCustomPropAssignment
  };
}
