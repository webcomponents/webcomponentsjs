/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

import {BaseClass} from './common-subclass.js';
import './module-a-sub.js';

const template = document.createElement('template');
template.innerHTML = `
<style>
:host {
  display: block;
  border: 5px solid orange;
}
</style>
<module-a-sub></module-a-sub>
`;

class ModuleA extends BaseClass {
  static get template() {
    return template;
  }
}

customElements.define('module-a', ModuleA);