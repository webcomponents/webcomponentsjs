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

  var extendsRegistry = {};

  function register(name, extnds, proto, templates) {
    extendsRegistry[name] = extnds;
    var typeExtension = extnds && extnds.indexOf('-') < 0;
    var names = calcExtendsNames(name);
    if (window.ShadowDOMPolyfill) {
      shim(templates, names);
    }

    var config = {
      prototype: Object.create(proto, {
        createdCallback: {
          value: function() {
            for (var i=0, n; i < names.length; i++) {
              n = names[i];
              var template = templateForName(n);
              if (template) {
                this.createShadowRoot().appendChild(document.importNode(template.content, true));
              }
            }
          }
        }
      })
    };
    if (typeExtension) {
      config.extends = extnds;
    }
    var ctor = document.registerElement(name, config);
    return ctor;
  }

  function calcExtendsNames(name) {
    var names = [], n = name;
    while (n) {
      names.push(n);
      n = extendsRegistry[n];
    }
    return names.reverse();
  }

  function templateForName(name) {
    return document.querySelector('#' + name);
  }

  function shim(templates, names) {
    var n = names[names.length-1];
    var template = templateForName(n);
    WebComponents.ShadowCSS.shimStyling(template ? template.content : null, n, extendsRegistry[n]);
  }

  scope.register = register;

})(window);

