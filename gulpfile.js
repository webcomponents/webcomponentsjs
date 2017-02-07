/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
 */

'use strict';

const gulp = require('gulp');
const sourcemaps = require('gulp-sourcemaps');
const buffer = require('vinyl-buffer');
const rename = require('gulp-rename');
const rollup = require('rollup-stream');
const source = require('vinyl-source-stream');
const del = require('del');
const bower = require('bower');
const runseq = require('run-sequence');
const closureCompiler = require('google-closure-compiler')
const closure = closureCompiler.gulp();

function debug(sourceName, fileName, needsContext) {
  if (!fileName)
    fileName = sourceName;

  var options = {
    entry: './entrypoints/' + sourceName + '-index.js',
    format: 'iife',
    moduleName: 'webcomponentsjs',
    sourceMap: true
  }

  // The es6-promise polyfill needs to set the correct context.
  // See https://github.com/rollup/rollup/wiki/Troubleshooting#this-is-undefined
  if (needsContext) {
    options.context = 'window';
  };

  return rollup(options)
  .pipe(source(sourceName +'-index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(rename(fileName + '.js'))
  .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest('./'))
}

function minify(sourceName, outputName) {
  if (!outputName) {
    outputName = sourceName;
  }
  const outputPath = outputName + '.js';
  const outputMap = outputPath + '.map';
  const output_wrapper = `(function(){\n%output%\n}).call(self)\n#// sourceMappingURL=${outputMap}`;
  const options = {
    js: ['entrypoints/*.js','src/*.js', 'bower_components/**/*.js'],
    new_type_inf: true,
    compilation_level: 'ADVANCED',
    language_in: 'ES6_STRICT',
    language_out: 'ES5_STRICT',
    output_wrapper,
    assume_function_wrapper: true,
    js_output_file: outputPath,
    create_source_map: outputMap,
    entry_point: `./entrypoints/${sourceName}-index.js`,
    dependency_mode: 'STRICT',
    warning_level: 'VERBOSE',
    externs: [
      'externs/closure-upstream-externs.js',
      'externs/webcomponents-externs.js',
      'externs/promise-externs.js'
    ],
    rewrite_polyfills: false,
  };
  return closure(options).src().pipe(gulp.dest('.'))
}

gulp.task('debug-none', () => {
  return debug('webcomponents-none');
});

gulp.task('minify-none', () => {
  return minify('webcomponents-none');
});

gulp.task('debug-hi', () => {
  return debug('webcomponents-hi')
});

gulp.task('minify-hi', () => {
  return minify('webcomponents-hi');
});

gulp.task('debug-hi-ce', () => {
  return debug('webcomponents-hi-ce')
});

gulp.task('minify-hi-ce', () => {
  return minify('webcomponents-hi-ce')
});

gulp.task('debug-hi-sd-ce', () => {
  return debug('webcomponents-hi-sd-ce')
});

gulp.task('minify-hi-sd-ce', () => {
  return minify('webcomponents-hi-sd-ce')
});

gulp.task('debug-hi-sd-ce-pf', () => {
  return debug('webcomponents-hi-sd-ce-pf', 'webcomponents-lite', true)
});

gulp.task('minify-hi-sd-ce-pf', () => {
  return minify('webcomponents-hi-sd-ce-pf', 'webcomponents-lite')
});

gulp.task('refresh-bower', () => {
  return del('bower_components').then(() => {
    let resolve, reject;
    let p = new Promise((res, rej) => {resolve = res; reject = rej});
    bower.commands.install().on('end', () => resolve()).on('error', (e) => reject(e));
    return p;
  });
});

gulp.task('default', (cb) => {
  runseq('refresh-bower', 'build', cb);
});

const bundles = [
  'none',
  'hi',
  'hi-ce',
  'hi-sd-ce',
  'hi-sd-ce-pf'
];

gulp.task('debug', bundles.map((b) => `debug-${b}`));

gulp.task('build', (cb) => {
  runseq(...(bundles.map((b) => `minify-${b}`)), cb)
});