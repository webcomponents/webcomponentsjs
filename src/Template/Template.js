/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

// minimal template polyfill
(function() {
  var needsTemplate = (typeof HTMLTemplateElement === 'undefined');

  // returns true if nested templates can be cloned (they cannot be on 
  // some impl's like Safari 8)
  var needsCloning = (function() {
    if (!needsTemplate) {
      var t = document.createElement('template');
      t.innerHTML = '<template><div></div></template>';
      var clone = t.cloneNode(true);
      return (clone.content.firstChild.content.childNodes.length == 0);
    }
  })();

  var TEMPLATE_TAG = 'template';
  var TemplateImpl = function() {};

  if (needsTemplate) {

    var contentDoc = document.implementation.createHTMLDocument('template');
    var canDecorate = true;

    /**
      Provides a minimal shim for the <template> element.
    */
    
    TemplateImpl.prototype = Object.create(HTMLElement.prototype);

    /**
      The `decorate` method moves element children to the template's `content`.
      NOTE: there is no support for dynamically adding elements to templates.
    */
    TemplateImpl.decorate = function(template) {
      // if the template is decorated, return fast
      if (template.content) {
        return;
      }
      template.content = contentDoc.createDocumentFragment();
      var child;
      while (child = template.firstChild) {
        template.content.appendChild(child);
      }
      // add innerHTML to template, if possible
      // Note: this throws on Safari 7
      if (canDecorate) {
        try {
          Object.defineProperty(template, 'innerHTML', {
            get: function() {
              var o = '';
              for (var e = this.content.firstChild; e; e = e.nextSibling) {
                o += e.outerHTML || escapeData(e.data);
              }
              return o;
            },
            set: function(text) {
              contentDoc.body.innerHTML = text;
              TemplateImpl.bootstrap(contentDoc);
              while (this.content.firstChild) {
                this.content.removeChild(this.content.firstChild);
              }
              while (contentDoc.body.firstChild) {
                this.content.appendChild(contentDoc.body.firstChild);
              }
            },
            configurable: true
          });

          template.cloneNode = function(deep) {
            return TemplateImpl.cloneNode(this, deep);
          };

        } catch (err) {
          canDecorate = false;
        }
      }
      // bootstrap recursively
      TemplateImpl.bootstrap(template.content);
    };

    /**
      The `bootstrap` method is called automatically and "fixes" all
      <template> elements in the document referenced by the `doc` argument.
    */
    TemplateImpl.bootstrap = function(doc) {
      var templates = doc.querySelectorAll(TEMPLATE_TAG);
      for (var i=0, l=templates.length, t; (i<l) && (t=templates[i]); i++) {
        TemplateImpl.decorate(t);
      }
    };

    // auto-bootstrapping for main document
    document.addEventListener('DOMContentLoaded', function() {
      TemplateImpl.bootstrap(document);
    });

    // Patch document.createElement to ensure newly created templates have content
    var createElement = document.createElement;
    document.createElement = function() {
      'use strict';
      var el = createElement.apply(document, arguments);
      if (el.localName == 'template') {
        TemplateImpl.decorate(el);
      }
      return el;
    };

    var escapeDataRegExp = /[&\u00A0<>]/g;

    function escapeReplace(c) {
      switch (c) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '\u00A0':
          return '&nbsp;';
      }
    }

    function escapeData(s) {
      return s.replace(escapeDataRegExp, escapeReplace);
    }
  }

  // make cloning/importing work!
  if (needsTemplate || needsCloning) {
    var nativeCloneNode = Node.prototype.cloneNode;

    TemplateImpl.cloneNode = function(template, deep) {
      var clone = nativeCloneNode.call(template);
      if (this.decorate) {
        this.decorate(clone);
      }
      if (deep) {
        // NOTE: use native clone node to make sure CE's wrapped
        // cloneNode does not cause elements to upgrade.
        clone.content.appendChild(
            nativeCloneNode.call(template.content, true));
        // these two lists should be coincident
        this.fixClonedDom(clone.content, template.content);
      }
      return clone;
    };

    TemplateImpl.fixClonedDom = function(clone, source) {
      var s$ = source.querySelectorAll(TEMPLATE_TAG);
      var t$ = clone.querySelectorAll(TEMPLATE_TAG);
      for (var i=0, l=t$.length, t, s; i<l; i++) {
        s = s$[i];
        t = t$[i];
        if (this.decorate) {
          this.decorate(s);
        }
        t.parentNode.replaceChild(s.cloneNode(true), t);
      }
    };

    var originalImportNode = document.importNode;

    Node.prototype.cloneNode = function(deep) {
      var dom = nativeCloneNode.call(this, deep);
      if (deep) {
        TemplateImpl.fixClonedDom(dom, this);
      }
      return dom;
    };

    // clone instead of importing <template>
    document.importNode = function(element, deep) {
      if (element.localName === TEMPLATE_TAG) {
        return TemplateImpl.cloneNode(element, deep);
      } else {
        var dom = originalImportNode.call(document, element, deep);
        if (deep) {
          TemplateImpl.fixClonedDom(dom, element);
        }
        return dom;
      }
    };
  }

  if (needsTemplate) {
    HTMLTemplateElement = TemplateImpl;
  }

})();