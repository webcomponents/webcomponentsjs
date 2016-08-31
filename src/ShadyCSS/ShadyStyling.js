/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import {parse} from './css-parse'
import {nativeShadow, nativeCssVariables, nativeCssApply} from './style-settings'
import {StyleTransformer} from './style-transformer'
import * as StyleUtil from './style-util'
import {StyleProperties} from './style-properties'
import {templateMap} from './template-map'
import {placeholderMap} from './style-placeholder'

// TODO(dfreedm): split into separate global
import ApplyShim from './apply-shim'

let STYLEHOST = Symbol('stylehost');

export let ShadyCSS = {
  scopeCounter: {},
  nativeShadow: nativeShadow,
  nativeCss: nativeCssVariables,
  nativeCssApply: nativeCssApply,
  _documentOwner: document.documentElement,
  _generateScopeSelector(name) {
    let id = this.scopeCounter[name] = (this.scopeCounter[name] || 0) + 1;
    return name + '-' + id;
  },
  _gatherStyles(template) {
    let styles = template.content.querySelectorAll('style');
    let cssText = [];
    for (let i = 0; i < styles.length; i++) {
      let s = styles[i];
      cssText.push(s.textContent);
      s.parentNode.removeChild(s);
    }
    return cssText.join('');
  },
  prepareTemplate(host, template) {
    if (template._prepared) {
      return;
    }
    template._prepared = true;
    template.name = host.is;
    templateMap[host.is] = template;
    let cssText = this._gatherStyles(template);
    if (!this.nativeShadow) {
      StyleTransformer.dom(template.content, host.is);
    }
    let ast = parse(cssText);
    if (this.nativeCss && !this.nativeCssApply) {
      ApplyShim.transformRules(ast, host.is);
    }
    template._styleAst = ast;

    let ownPropertyNames = [];
    if (!this.nativeCss) {
      ownPropertyNames = StyleProperties.decorateStyles(template._styleAst, host);
    }
    if (!ownPropertyNames.length || this.nativeCss) {
      let root = this.nativeShadow ? template.content : null;
      let placeholder = placeholderMap[host.is];
      this._generateStaticStyle(host, template._styleAst, root, placeholder);
    }
    template._ownPropertyNames = ownPropertyNames;
  },
  _generateStaticStyle(host, rules, shadowroot, placeholder) {
    let cssText = StyleTransformer.elementStyles(host, rules);
    StyleUtil.applyCss(cssText, host.is, shadowroot, placeholder);
  },
  _prepareHost(host) {
    let template = templateMap[host.is];
    if (template) {
      host.__styleRules = template._styleAst;
    }
    host[STYLEHOST] = true;
    host.__placeholder = placeholderMap[host.is];
    host.__overrideStyleProperties = {};
    if (!this.nativeCss) {
      host.__styleProperties = null;
      host.__ownStyleProperties = null;
      host.__scopeSelector = null;
      if (template) {
        host.__ownStylePropertyNames = template._ownPropertyNames;
      }
    }
  },
  applyStyle(host, overrideProps) {
    if (!host[STYLEHOST]) {
      this._prepareHost(host);
    }
    this._ensureDocumentApplied();
    Object.assign(host.__overrideStyleProperties, overrideProps);
    if (this.nativeCss) {
      let template = templateMap[host.is];
      if (template && template.__applyShimInvalid) {
        // update template
        ApplyShim.transformRules(template._styleAst, host.is);
        let target = this.nativeShadow ? template.content : null;
        this._generateStaticStyle(host, template._styleAst, target);
        // update instance if native shadowdom
        if (this.nativeShadow) {
          this._generateStaticStyle(host, template._styleAst, this.shadowRoot);
        }
        host.__styleRules = template._styleAst;
      }
      this._updateNativeProperties(host, host.__overrideStyleProperties);
    } else {
      this._updateProperties(host, host.__overrideStyleProperties);
      if (host.__ownStylePropertyNames && host.__ownStylePropertyNames.length) {
        // TODO: use caching
        this._applyStyleProperties(host);
      }
      let root = this._isRootOwner(host) ? host : host.shadowRoot;
      // note: some elements may not have a root!
      if (root) {
        this._applyToDescendants(root);
      }
    }
  },
  // marks document styles dirty which means that next time any styling
  // is applied via `applyStyle`, document styles will be applied.
  markDocumentDirty() {
    this._documentOwner.__clean = false;
  },
  // Returns true if document styles are dirty. Can be used to determine
  // if it's necessary to flush styling (Polymer.updateStyles)
  // at a given time.
  isDocumentDirty() {
    return !this._documentOwner.__clean;
  },
  // ensures that document styles (custom-style) have their
  // custom properties applied
  _ensureDocumentApplied() {
    let owner = this._documentOwner;
    if (!owner.__clean) {
      if (!owner.__overrideStyleProperties) {
        owner.__overrideStyleProperties = {};
      }
      if (!this.nativeCss) {
        this._updateProperties(owner);
        let s$ = owner.__documentStyles;
        if (s$) {
          for (let i=0; i < s$.length; i++) {
            let style = s$[i];
            style.removeAttribute('type');
            StyleProperties.applyCustomStyle(style,
              owner.__styleProperties);
          }
        }
      }
      owner.__clean = true;
    }
  },
  _applyToDescendants(root) {
    let c$ = root.children;
    for (let i = 0, c; i < c$.length; i++) {
      c = c$[i];
      if (c.shadowRoot) {
        this.applyStyle(c);
      }
      this._applyToDescendants(c);
    }
  },
  _styleOwnerForNode(node) {
    let root = node.getRootNode();
    let host = root.host;
    if (host) {
      if (host[STYLEHOST]) {
        return host;
      } else {
        return this._styleOwnerForNode(host);
      }
    }
    return this._documentOwner;
  },
  _isRootOwner(node) {
    return (node === this._documentOwner);
  },
  _applyStyleProperties(host) {
    let oldScopeSelector = host.__scopeSelector;
    host.__scopeSelector = this._generateScopeSelector(host.is);
    let style = StyleProperties.applyElementStyle(host, host.__styleProperties, host.__scopeSelector, null);
    if (!this.nativeShadow) {
      StyleProperties.applyElementScopeSelector(host, host.__scopeSelector, oldScopeSelector);
    }
    return style;
  },
  _updateProperties(host) {
    let owner = this._styleOwnerForNode(host);
    let ownerProperties = owner.__styleProperties;
    let props = Object.create(ownerProperties || null);
    let hostAndRootProps = StyleProperties.hostAndRootPropertiesForScope(host, host.__styleRules);
    let propertiesMatchingHost = StyleProperties.propertyDataFromStyles(owner.__styleRules, host).properties;
    Object.assign(
      props,
      hostAndRootProps.hostProps,
      propertiesMatchingHost,
      hostAndRootProps.rootProps
    );
    this._mixinOverrideStyles(props, host.__overrideStyleProperties);
    StyleProperties.reify(props);
    host.__styleProperties = props;
    let ownProps = {};
    if (host.__ownStylePropertyNames) {
      for (let i = 0, n; i < host.__ownStylePropertyNames.length; i++) {
        n = host.__ownStylePropertyNames[i];
        ownProps[n] = props[n];
      }
    }
    host.__ownStyleProperties = ownProps;
  },
  _mixinOverrideStyles(props, overrides) {
    for (let p in overrides) {
      let v = overrides[p];
      // skip override props if they are not truthy or 0
      // in order to fall back to inherited values
      if (v || v === 0) {
        props[p] = v;
      }
    }
  },
  _updateNativeProperties(element, properties) {
    // remove previous properties
    for (let p in properties) {
      // NOTE: for bc with shim, don't apply null values.
      if (p === null) {
        element.style.removeProperty(p);
      } else {
        element.style.setProperty(p, properties[p]);
      }
    }
  },
  // transforms a style such that it is scope-safe for the document scope.
  transformForDocument(style) {
    let shouldAdd = !style.__cssRules;
    let rules = StyleUtil.rulesForStyle(style);
    if (shouldAdd) {
      let root = this._documentOwner;
      root.__documentStyles = root.__documentStyles || [];
      root.__documentStyles.push(style);
      // keep 1 aggregated set of style rules for the root.
      root.__styleRules = root.__styleRules || {rules: []};
      root.__styleRules.rules.push(rules);
    }
    let self = this;
    StyleUtil.forEachRule(rules,
      function(rule) {
        // shim the selector for current runtime settings
        if (!self.nativeShadow) {
          StyleTransformer.documentRule(rule);
        } else {
          StyleTransformer.normalizeRootSelector(rule);
        }
        // run the apply shim if unbuilt and using native css custom properties
        if (self.nativeCss && !self.nativeCssApply) {
          ApplyShim.transformRule(rule);
        }
      }
    );
    // custom properties shimming
    // (if we use native custom properties, no need to apply any property shimming)
    if (this.nativeCss) {
      // TODO(dfreedm): replace build logic.
      // there's no targeted build, so the shimmed styles must be applied.
      style.removeAttribute('type');
      style.textContent = StyleUtil.toCssText(rules);
    }
  },
  updateStyles(properties) {
    this.markDocumentDirty();
    this.applyStyle(this._documentOwner, properties);
  }
}

window['ShadyCSS'] = ShadyCSS;
