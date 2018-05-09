/**
@license
Copyright (c) 2018 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

export class BaseClass extends HTMLElement {
  constructor() {
    super();
    const template = this.constructor.template;
    if (template) {
      if (window.ShadyCSS && !template._prepared) {
        window.ShadyCSS.prepareTemplate(template, this.localName);
      }
      this.attachShadow({mode: 'open'}).appendChild(template.content.cloneNode(true));
    }
  }
  connectedCallback() {
    if (window.ShadyCSS) {
      window.ShadyCSS.styleElement(this);
    }
  }
}