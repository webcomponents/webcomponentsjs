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

import * as StyleUtil from './style-util'
import {nativeShadow} from './style-settings'

/* Transforms ShadowDOM styling into ShadyDOM styling

 * scoping:

    * elements in scope get scoping selector class="x-foo-scope"
    * selectors re-written as follows:

      div button -> div.x-foo-scope button.x-foo-scope

 * :host -> scopeName

 * :host(...) -> scopeName...

 * ::content -> ' '

 * ::shadow, /deep/: processed similar to ::content

 * :host-context(...): scopeName..., ... scopeName

 * ::slotted(...) -> scopeName > ...
*/
export let StyleTransformer = {

  // Given a node and scope name, add a scoping class to each node
  // in the tree. This facilitates transforming css into scoped rules.
  dom: function(node, scope, shouldRemoveScope) {
    // one time optimization to skip scoping...
    if (node.__styleScoped) {
      node.__styleScoped = null;
    } else {
      this._transformDom(node, scope || '', shouldRemoveScope);
    }
  },

  _transformDom: function(node, selector, shouldRemoveScope) {
    if (node.classList) {
      this.element(node, selector, shouldRemoveScope);
    }
    let c$ = (node.localName === 'template') ?
      (node.content || node._content).childNodes :
      node.children;
    if (c$) {
      for (let i=0; i<c$.length; i++) {
        this._transformDom(c$[i], selector, shouldRemoveScope);
      }
    }
  },

  element: function(element, scope, shouldRemoveScope) {
    // note: if using classes, we add both the general 'style-scope' class
    // as well as the specific scope. This enables easy filtering of all
    // `style-scope` elements
    if (scope) {
      // note: svg on IE does not have classList so fallback to class
      if (element.classList) {
        if (shouldRemoveScope) {
          element.classList.remove(SCOPE_NAME);
          element.classList.remove(scope);
        } else {
          element.classList.add(SCOPE_NAME);
          element.classList.add(scope);
        }
      } else if (element.getAttribute) {
        let c = element.getAttribute(CLASS);
        if (shouldRemoveScope) {
          if (c) {
            element.setAttribute(CLASS, c.replace(SCOPE_NAME, '')
            .replace(scope, ''));
          }
        } else {
          element.setAttribute(CLASS, (c ? c + ' ' : '') +
          SCOPE_NAME + ' ' + scope);
        }
      }
    }
  },

  elementStyles: function(element, styleRules, callback) {
    let cssBuildType = element.__cssBuild;
    // no need to shim selectors if settings.useNativeShadow, also
    // a shady css build will already have transformed selectors
    // NOTE: This method may be called as part of static or property shimming.
    // When there is a targeted build it will not be called for static shimming,
    // but when the property shim is used it is called and should opt out of
    // static shimming work when a proper build exists.
    let cssText = (nativeShadow || cssBuildType === 'shady') ?
    StyleUtil.toCssText(styleRules, callback) :
    this.css(styleRules, element.is, element.extends, callback) + '\n\n';
    return cssText.trim();
  },

  // Given a string of cssText and a scoping string (scope), returns
  // a string of scoped css where each selector is transformed to include
  // a class created from the scope. ShadowDOM selectors are also transformed
  // (e.g. :host) to use the scoping selector.
  css: function(rules, scope, ext, callback) {
    let hostScope = this._calcHostScope(scope, ext);
    scope = this._calcElementScope(scope);
    let self = this;
    return StyleUtil.toCssText(rules, function(rule) {
      if (!rule.isScoped) {
        self.rule(rule, scope, hostScope);
        rule.isScoped = true;
      }
      if (callback) {
        callback(rule, scope, hostScope);
      }
    });
  },

  _calcElementScope: function (scope) {
    if (scope) {
      return CSS_CLASS_PREFIX + scope;
    } else {
      return '';
    }
  },

  _calcHostScope: function(scope, ext) {
    return ext ? '[is=' +  scope + ']' : scope;
  },

  rule: function (rule, scope, hostScope) {
    this._transformRule(rule, this._transformComplexSelector,
      scope, hostScope);
  },

  // transforms a css rule to a scoped rule.
  _transformRule: function(rule, transformer, scope, hostScope) {
    // NOTE: save transformedSelector for subsequent matching of elements
    // against selectors (e.g. when calculating style properties)
    rule.selector = rule.transformedSelector =
      this._transformRuleCss(rule, transformer, scope, hostScope);
  },

  _transformRuleCss: function(rule, transformer, scope, hostScope) {
    let p$ = rule.selector.split(COMPLEX_SELECTOR_SEP);
    // we want to skip transformation of rules that appear in keyframes,
    // because they are keyframe selectors, not element selectors.
    if (!StyleUtil.isKeyframesSelector(rule)) {
      for (let i=0, l=p$.length, p; (i<l) && (p=p$[i]); i++) {
        p$[i] = transformer.call(this, p, scope, hostScope);
      }
    }
    return p$.join(COMPLEX_SELECTOR_SEP);
  },

  _transformComplexSelector: function(selector, scope, hostScope) {
    let stop = false;
    let hostContext = false;
    let self = this;
    selector = selector.trim();
    selector = selector.replace(CONTENT_START, HOST + ' $1');
    selector = selector.replace(SIMPLE_SELECTOR_SEP, function(m, c, s) {
      if (!stop) {
        let info = self._transformCompoundSelector(s, c, scope, hostScope);
        stop = stop || info.stop;
        hostContext = hostContext || info.hostContext;
        c = info.combinator;
        s = info.value;
      } else {
        s = s.replace(SCOPE_JUMP, ' ');
      }
      return c + s;
    });
    if (hostContext) {
      selector = selector.replace(HOST_CONTEXT_PAREN,
        function(m, pre, paren, post) {
          return pre + paren + ' ' + hostScope + post +
            COMPLEX_SELECTOR_SEP + ' ' + pre + hostScope + paren + post;
         });
    }
    return selector;
  },

  _transformCompoundSelector: function(selector, combinator, scope, hostScope) {
    // replace :host with host scoping class
    let jumpIndex = selector.search(SCOPE_JUMP);
    let hostContext = false;
    if (selector.indexOf(HOST_CONTEXT) >=0) {
      hostContext = true;
    } else if (selector.indexOf(HOST) >=0) {
      selector = this._transformHostSelector(selector, hostScope);
    // replace other selectors with scoping class
    } else if (jumpIndex !== 0) {
      selector = scope ? this._transformSimpleSelector(selector, scope) :
        selector;
    }
    // remove left-side combinator when dealing with ::content.
    if (selector.indexOf(CONTENT) >= 0) {
      combinator = '';
    }
    // mark ::slotted() scope jump to replace with descendant selector + arg
    // also ignore left-side combinator
    let slotted = false;
    if (selector.indexOf(SLOTTED) >= 0) {
      combinator = '';
      slotted = true;
    }
    // process scope jumping selectors up to the scope jump and then stop
    let stop;
    if (jumpIndex >= 0) {
      stop = true;
      if (slotted) {
        // .zonk ::slotted(.foo) -> .zonk.scope > .foo
        selector = selector.replace(SLOTTED_PAREN, function (m, inside) {
          return ' > ' + inside;
        });
      } else {
        // e.g. .zonk ::content > .foo ==> .zonk.scope > .foo
        selector = selector.replace(SCOPE_JUMP, ' ');
      }
    }
    return {value: selector, combinator: combinator, stop: stop,
      hostContext: hostContext};
  },

  _transformSimpleSelector: function(selector, scope) {
    let p$ = selector.split(PSEUDO_PREFIX);
    p$[0] += scope;
    return p$.join(PSEUDO_PREFIX);
  },

  // :host(...) -> scopeName...
  _transformHostSelector: function(selector, hostScope) {
    let m = selector.match(HOST_PAREN);
    let paren = m && m[2].trim() || '';
    if (paren) {
      if (!paren[0].match(SIMPLE_SELECTOR_PREFIX)) {
        // paren starts with a type selector
        let typeSelector = paren.split(SIMPLE_SELECTOR_PREFIX)[0];
        // if the type selector is our hostScope then avoid pre-pending it
        if (typeSelector === hostScope) {
          return paren;
        // otherwise, this selector should not match in this scope so
        // output a bogus selector.
        } else {
          return SELECTOR_NO_MATCH;
        }
      } else {
        // make sure to do a replace here to catch selectors like:
        // `:host(.foo)::before`
        return selector.replace(HOST_PAREN, function(m, host, paren) {
          return hostScope + paren;
        });
      }
    // if no paren, do a straight :host replacement.
    // TODO(sorvell): this should not strictly be necessary but
    // it's needed to maintain support for `:host[foo]` type selectors
    // which have been improperly used under Shady DOM. This should be
    // deprecated.
    } else {
      return selector.replace(HOST, hostScope);
    }
  },

  documentRule: function(rule) {
    // reset selector in case this is redone.
    rule.selector = rule.parsedSelector;
    this.normalizeRootSelector(rule);
    this._transformRule(rule, this._transformDocumentSelector);
  },

  normalizeRootSelector: function(rule) {
    if (rule.selector === ROOT) {
      rule.selector = 'html';
    }
  },

  _transformDocumentSelector: function(selector) {
    return selector.match(SCOPE_JUMP) ?
      this._transformComplexSelector(selector, SCOPE_DOC_SELECTOR) :
      this._transformSimpleSelector(selector.trim(), SCOPE_DOC_SELECTOR);
  },

  SCOPE_NAME: 'style-scope'
};

let SCOPE_NAME = StyleTransformer.SCOPE_NAME;
let SCOPE_DOC_SELECTOR = ':not([' + SCOPE_NAME + '])' +
  ':not(.' + SCOPE_NAME + ')';
let COMPLEX_SELECTOR_SEP = ',';
let SIMPLE_SELECTOR_SEP = /(^|[\s>+~]+)((?:\[.+?\]|[^\s>+~=\[])+)/g;
let SIMPLE_SELECTOR_PREFIX = /[[.:#*]/;
let HOST = ':host';
let ROOT = ':root';
// NOTE: this supports 1 nested () pair for things like
// :host(:not([selected]), more general support requires
// parsing which seems like overkill
let HOST_PAREN = /(:host)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
let HOST_CONTEXT = ':host-context';
let HOST_CONTEXT_PAREN = /(.*)(?::host-context)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))(.*)/;
// BREAKME: replace with '::slotted()'
let CONTENT = '::content';
let SLOTTED = '::slotted';
// similar to HOST_PAREN
let SLOTTED_PAREN = /(?:::slotted)(?:\(((?:\([^)(]*\)|[^)(]*)+?)\))/;
// BREAKME: replace with '::slotted()'
let SCOPE_JUMP = /::slotted|::content|::shadow|\/deep\//;
let CSS_CLASS_PREFIX = '.';
let PSEUDO_PREFIX = ':';
let CLASS = 'class';
let CONTENT_START = new RegExp('^(' + CONTENT + ')');
let SELECTOR_NO_MATCH = 'should_not_match';
