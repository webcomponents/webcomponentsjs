/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 *
 * @fileoverview The API provided by the webcomponents polyfills.
 * @externs
 */

var HTMLImports = {};

/**
 * Calls the callback when all imports in the document at call time
 * (or at least document ready) have loaded. Callback is called synchronously
 * if imports are already done loading.
 * @param {function()=} callback
 */
HTMLImports.whenReady = function(callback) {};

/**
 * Returns the import document containing the element.
 * @param {!Node} element
 * @return {?HTMLLinkElement|?Document|undefined}
 */
HTMLImports.importForElement = function(element) {};
