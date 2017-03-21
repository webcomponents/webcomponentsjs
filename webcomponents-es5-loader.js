(function () {
'use strict';

(()=>{'use strict';if(!window.customElements)return;const a=window.HTMLElement,b=window.customElements.define,c=window.customElements.get,d=new Map,e=new Map;let f=!1,g=!1;window.HTMLElement=function(){if(!f){const h=d.get(this.constructor),i=c.call(window.customElements,h);g=!0;const j=new i;return j}f=!1;},window.HTMLElement.prototype=a.prototype,window.customElements.define=(h,i)=>{const j=i.prototype,k=class extends a{constructor(){super(),Object.setPrototypeOf(this,j),g||(f=!0,i.call(this)),g=!1;}},l=k.prototype;k.observedAttributes=i.observedAttributes,l.connectedCallback=j.connectedCallback,l.disconnectedCallback=j.disconnectedCallback,l.attributeChangedCallback=j.attributeChangedCallback,l.adoptedCallback=j.adoptedCallback,d.set(i,h),e.set(h,i),b.call(window.customElements,h,k);},window.customElements.get=(h)=>e.get(h);})();

(function(){'use strict';var a=[];if('import'in document.createElement('link')||a.push('hi'),(!('attachShadow'in Element.prototype&&'getRootNode'in Element.prototype)||window.ShadyDOM&&window.ShadyDOM.force)&&a.push('sd'),(!window.customElements||window.customElements.forcePolyfill)&&a.push('ce'),'content'in document.createElement('template')&&window.Promise&&document.createDocumentFragment().cloneNode()instanceof DocumentFragment||a.push('pf'),4===a.length&&(a=['lite']),a.length){var b='webcomponents-es6-loader.js',c=document.querySelector('script[src*="'+b+'"]');c||(b='webcomponents-es5-loader.js',c=document.querySelector('script[src*="'+b+'"]'));var d=document.createElement('script'),e='webcomponents-'+a.join('-')+'.js',f=c.src.replace(b,e);d.src=f,document.head.appendChild(d);}else requestAnimationFrame(function(){window.dispatchEvent(new CustomEvent('WebComponentsReady'));});})();

/**
@license
Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

}());
