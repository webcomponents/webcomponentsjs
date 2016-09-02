# ShadyCSS

ShadyCSS provides a shim for ShadowDOM V1 style encapsulation and
css custom properties with `@apply` support. It is intended to be used in
conjunction with the ShadyDOM shim.

## Usage

The shim will transparently no-op if some or all native support is available.
If native ShadowDOM is available, no scoping will be applied. If native custom
properties are available, they will be used and `@apply` will be simulated
via native custom properties.

To use ShadyCSS:

1. First, call `ShadyCSS.prepareTemplate(template, name)` on a
`<template>` element that will be imported into a `shadowRoot`.

2. Then, after the shadowRoot is created and whenever dynamic
updates are required, call `ShadyCSS.applyStyle(element)`.

3. If a styling change is made that may affect the whole document, call
`ShadyCSS.updateStyles()`.

### Example

The following example uses ShadyCSS and ShadyDOM to define a custom element.

```html
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
  ShadyCSS.prepareTemplate(myElementTemplate, 'my-element');
  class MyElement extends HTMLElement {
    connectedCallback() {
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(
        document.importNode(myElementTemplate.content, true));
      ShadyCSS.applyStyle(this);
    }
  }

  customElements.define('my-element', MyElement);
</script>
```

## Type Extension elements

ShadyCSS can also be used with type extension elements by supplying the base
element name to `prepareTemplate` as a third argument.

### Example

```html
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
  ShadyCSS.prepareTemplate(myElementTemplate, 'my-element', 'div');
  class MyElement extends HTMLDivElement {
    connectedCallback() {
      this.attachShadow({mode: 'open'});
      this.shadowRoot.appendChild(
        document.importNode(myElementTemplate.content, true));
      ShadyCSS.applyStyle(this);
    }
  }

  customElements.define('my-element', MyElement, {extends: 'div'});
</script>
```

## `<custom-style>`

The `<custom-style>` element allows `<style>` elements that are not inside of
Custom Elements to be processed by the ShadyCSS library.

### Example

```html
<custom-style>
  <style>
  html {
    --content-color: brown;
  }
  </style>
</custom-style>
<my-element>This text will be brown!</my-element>
```

## Imperative values for Custom properties

To set the value of a CSS Custom Property imperatively, `ShadyCSS.applyStyle`
and `ShadyCSS.updateStyles` support an additional argument of an object mapping
variable name to value.

Defining new mixins or new values for current mixins imperatively is not
supported.

### Example
```html
<my-element id="a">Text</my-element>
<my-element>Text</my-element>
<script>
let el = document.querySelector('my-element#a');
// Set the color of all my-element instances to 'green'
ShadyCSS.updateStyles({'--content-color', 'green'});
// Set the color my-element#a's text to 'red'
ShadyCSS.applyStyle(el, {'--content-color', 'red'});
</script>
```

## Limitations

### Selector scoping

 You must have a selector to the left of the `::slotted`
 pseudo-element.

### Custom properties and `@apply`

Dynamic changes are not automatically applied. If elements change such that they
conditionally match selectors they did not previously, `ShadyCSS.updateStyles()`
must be called.

For a given element's shadowRoot, only 1 value is allowed per custom properties.
Properties cannot change from parent to child as they can under native custom
properties; they can only change when a shadowRoot boundary is crossed.

To receive a custom property, an element must directly matcha selector that
defines the property in its host's stylesheet.

### `<custom-style>` Flash of unstyled content

If `ShadyCss.applyStyle` is never called, `<custom-style>` elements will process
after HTML Imports have loaded, after the document loads, or after the next paint.
This means that there may be a flash of unstyled content on the first load.

If there are only `<custom-style>` elements in the page, you may call
`ShadyCSS.updateStyles()` to remove the flash of unstyled content.
