/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

'use strict';

import {nativeShadow, nativeCssVariables} from './style-settings'
import {parse, stringify, types} from './css-parse'

export function toCssText (rules, callback) {
  if (typeof rules === 'string') {
    rules = parse(rules);
  }
  if (callback) {
    forEachRule(rules, callback);
  }
  return stringify(rules, nativeCssVariables);
}

export function rulesForStyle(style) {
  if (!style.__cssRules && style.textContent) {
    style.__cssRules = parse(style.textContent);
  }
  return style.__cssRules;
}

// Tests if a rule is a keyframes selector, which looks almost exactly
// like a normal selector but is not (it has nothing to do with scoping
// for example).
export function isKeyframesSelector(rule) {
  return rule.parent &&
  rule.parent.type === types.KEYFRAMES_RULE;
}

export function forEachRule(node, styleRuleCallback, keyframesRuleCallback, onlyActiveRules) {
  if (!node) {
    return;
  }
  let skipRules = false;
  if (onlyActiveRules) {
    if (node.type === types.MEDIA_RULE) {
      let matchMedia = node.selector.match(rx.MEDIA_MATCH);
      if (matchMedia) {
        // if rule is a non matching @media rule, skip subrules
        if (!window.matchMedia(matchMedia[1]).matches) {
          skipRules = true;
        }
      }
    }
  }
  if (node.type === types.STYLE_RULE) {
    styleRuleCallback(node);
  } else if (keyframesRuleCallback &&
    node.type === types.KEYFRAMES_RULE) {
    keyframesRuleCallback(node);
  } else if (node.type === types.MIXIN_RULE) {
    skipRules = true;
  }
  let r$ = node.rules;
  if (r$ && !skipRules) {
    for (let i=0, l=r$.length, r; (i<l) && (r=r$[i]); i++) {
      forEachRule(r, styleRuleCallback, keyframesRuleCallback, onlyActiveRules);
    }
  }
}

// add a string of cssText to the document.
export function applyCss(cssText, moniker, target, contextNode) {
  let style = createScopeStyle(cssText, moniker);
  return applyStyle(style, target, contextNode);
}

export function applyStyle(style, target, contextNode) {
  target = target || document.head;
  let after = (contextNode && contextNode.nextSibling) ||
  target.firstChild;
  lastHeadApplyNode = style;
  return target.insertBefore(style, after);
}

export function createScopeStyle(cssText, moniker) {
  let style = document.createElement('style');
  if (moniker) {
    style.setAttribute('scope', moniker);
  }
  style.textContent = cssText;
  return style;
}

let lastHeadApplyNode = null;

// insert a comment node as a styling position placeholder.
export function applyStylePlaceHolder(moniker) {
  let placeHolder = document.createComment(' Shady DOM styles for ' +
    moniker + ' ');
  let after = lastHeadApplyNode ?
    lastHeadApplyNode.nextSibling : null;
  let scope = document.head;
  scope.insertBefore(placeHolder, after || scope.firstChild);
  lastHeadApplyNode = placeHolder;
  return placeHolder;
}

export function isTargetedBuild(buildType) {
  return nativeShadow ? buildType === 'shadow' : buildType === 'shady';
}

// cssBuildTypeForModule: function (module) {
//   let dm = Polymer.DomModule.import(module);
//   if (dm) {
//     return getCssBuildType(dm);
//   }
// },
//
export function getCssBuildType(element) {
  return element.getAttribute('css-build');
}

// Walk from text[start] matching parens
// returns position of the outer end paren
function findMatchingParen(text, start) {
  let level = 0;
  for (let i=start, l=text.length; i < l; i++) {
    if (text[i] === '(') {
      level++;
    } else if (text[i] === ')') {
      if (--level === 0) {
        return i;
      }
    }
  }
  return -1;
}

export function processVariableAndFallback(str, callback) {
  // find 'var('
  let start = str.indexOf('var(');
  if (start === -1) {
    // no var?, everything is prefix
    return callback(str, '', '', '');
  }
  //${prefix}var(${inner})${suffix}
  let end = findMatchingParen(str, start + 3);
  let inner = str.substring(start + 4, end);
  let prefix = str.substring(0, start);
  // suffix may have other variables
  let suffix = processVariableAndFallback(str.substring(end + 1), callback);
  let comma = inner.indexOf(',');
  // value and fallback args should be trimmed to match in property lookup
  if (comma === -1) {
    // variable, no fallback
    return callback(prefix, inner.trim(), '', suffix);
  }
  // var(${value},${fallback})
  let value = inner.substring(0, comma).trim();
  let fallback = inner.substring(comma + 1).trim();
  return callback(prefix, value, fallback, suffix);
}

export let rx = {
  VAR_ASSIGN: /(?:^|[;\s{]\s*)(--[\w-]*?)\s*:\s*(?:([^;{]*)|{([^}]*)})(?:(?=[;\s}])|$)/gi,
  MIXIN_MATCH: /(?:^|\W+)@apply\s*\(?([^);\n]*)\)?/gi,
  VAR_CONSUMED: /(--[\w-]+)\s*([:,;)]|$)/gi,
  ANIMATION_MATCH: /(animation\s*:)|(animation-name\s*:)/,
  MEDIA_MATCH: /@media[^(]*(\([^)]*\))/,
  IS_VAR: /^--/,
  BRACKETED: /\{[^}]*\}/g,
  HOST_PREFIX: '(?:^|[^.#[:])',
  HOST_SUFFIX: '($|[.:[\\s>+~])'
}
