/*
 * Copyright 2012 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
 */

// minimal template polyfill
if (typeof HTMLTemplateElement === 'undefined') {
  (function() {

    var TEMPLATE_TAG = 'template';

    /**
      Provides a minimal shim for the <template> element.
    */
    HTMLTemplateElement = function() {};
    HTMLTemplateElement.prototype = Object.create(HTMLElement.prototype);

    /**
      The `decorate` method moves element children to the template's `content`.
      NOTE: there is no support for dynamically adding elements to templates.
    */
    HTMLTemplateElement.decorate = function(template) {
      if (!template.content) {
        template.content = template.ownerDocument.createDocumentFragment();
        var child;
        while (child = template.firstChild) {
          template.content.appendChild(child);
        }
      }
    };

    /**
      The `bootstrap` method is called automatically and "fixes" all 
      <template> elements in the document referenced by the `doc` argument.
    */
    HTMLTemplateElement.bootstrap = function(doc) {
      var templates = doc.querySelectorAll(TEMPLATE_TAG);
      for (var i=0, l=templates.length, t; (i<l) && (t=templates[i]); i++) {
        HTMLTemplateElement.decorate(t);
      }
    };

    // auto-bootstrapping for main document
    addEventListener('DOMContentLoaded', function() {
      HTMLTemplateElement.bootstrap(document);
    });
    
  })();
}