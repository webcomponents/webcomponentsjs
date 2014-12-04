/**
 * @license
 * Copyright (c) 2014 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

function createTable() {
  var div = document.createElement('div');
  div.innerHTML = '<table>\
    <caption>a</caption>\
    <thead>\
      <tr>\
        <td>b\
        <td>c\
        <td>d\
      <tr>\
        <td>e\
        <td>f\
        <td>g\
    </thead>\
    <tbody>\
      <tr>\
        <td>h\
        <td>i\
        <td>j\
      <tr>\
        <td>k\
        <td>l\
        <td>m\
    </tbody>\
    <tbody>\
      <tr>\
        <td>n\
        <td>o\
        <td>p\
      <tr>\
        <td>q\
        <td>r\
        <td>s\
    </tbody>\
    <tfoot>\
      <tr>\
        <td>t\
        <td>u\
        <td>v\
      <tr>\
        <td>w\
        <td>x\
        <td>y\
    </tfoot>\
  </table>';
  return div.firstElementChild;
}
