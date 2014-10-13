/*
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */
window.CustomElements = window.CustomElements || {flags:{}};

(function(scope) {

// imports
var flags = scope.flags;

// world's simplest module initializer
var modules = [];
var addModule = function(module) {
	modules.push(module);
};

var initializeModules = function() {
	modules.forEach(function(module) {
		module(scope);
	});
};

// exports
scope.addModule = addModule;
scope.initializeModules = initializeModules;
scope.hasNative = Boolean(document.registerElement);

// NOTE: For consistent timing, use native custom elements only when not
// polyfilling other key related web components features.
scope.useNative = !flags.register && scope.hasNative && 
		!window.ShadowDOMPolyfill && (!window.HTMLImports || HTMLImports.useNative);

})(CustomElements);