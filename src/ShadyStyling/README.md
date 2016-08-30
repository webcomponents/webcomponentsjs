ShadyStyling
============

ShadyStyling provides a shim for ShadowDOM V1 style encapsulation and
css custom properties with `@apply` support. It is intended to be used in
conjunction with the ShadyDOM shim.

##Usage

The shim will transparently no-op if some or all native support is available.
If native ShadowDOM is available, no scoping will be applied. If native custom
properties are available, they will be used and `@apply` will be simulated
via native custom properties.

To use ShadyStyling:

 1. First, call `ShadyStyling.prepareTemplate(name, template)` on a
 `<template>` element that will be imported into a `shadowRoot`.

 2. Then, after the shadowRoot is created and whenever dynamic
 updates are required, call `ShadyStyling.applyStyle(element)`.

##Example

The following example uses ShadyStyling and ShadyDOM to define a custom element.

```
<template id="myElementTemplate">
  <style>
    :host {
      display: block;
      padding: 8px;
    }

    #content {
      background-color: var(--content-color);
    }

    .slot-container ::slotted(*) {
      border: 1px solid steelblue;
      margin: 4px;
    }
  </style>
  <div id="content">Content</div>
  <div class="slot-container">
    <slot></slot>
  </div>
</template>
<script>
  ShadyStyling.prepareTemplate('my-element', myElementTemplate);
  class MyElement extends HTMLElement {
    connectedCallback() {
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(
        document.importNode(myElementTemplate.content, true));
      ShadyStyling.applyStyle(this);
    }
  }

  customElements.define('my-element', MyElement);
</script>

```

##Limitations

 ###Selector scoping

 You must have a selector to the left of the `::slotted`
 pseudo-element.

 ###Custom properties and `@apply`

 Dynamic changes are not automatically applied. If elements change such that they
 conditionally match selectors they did not previously, `ShadyStyling.updateStyles()`
 must be called.

 For a given element's shadowRoot, only 1 value is allowed
 per custom properties. Properties cannot change from parent to child as
 they can under native custom properties; they can only change when a shadowRoot
 boundary is crossed. To receive a custom property, an element must directly match
 a selector that defines the property in its host's stylesheet.