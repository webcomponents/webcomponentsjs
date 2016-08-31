/**
@license
Copyright (c) 2016 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/
import {applyStylePlaceHolder} from './style-util'
import {nativeShadow} from './style-settings'

export let placeholderMap = {};

let ce = window.customElements;
if (ce && !nativeShadow) {
  const origDefine = ce.define;
  ce.define = function() {
    let name = arguments[0];
    placeholderMap[name] = applyStylePlaceHolder(name);
    return origDefine.apply(this, arguments);
  };
}
