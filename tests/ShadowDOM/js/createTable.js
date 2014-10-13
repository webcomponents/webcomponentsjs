/*
 * Copyright 2014 The Polymer Authors. All rights reserved.
 * Use of this source code is governed by a BSD-style
 * license that can be found in the LICENSE file.
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
