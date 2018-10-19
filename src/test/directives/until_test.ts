/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {until} from '../../directives/until.js';
import {render} from '../../lib/render.js';
import {html} from '../../lit-html.js';
import {Deferred} from '../test-utils/deferred.js';
import {stripExpressionMarkers} from '../test-utils/strip-markers.js';

const assert = chai.assert;

suite('until', () => {
  let container: HTMLDivElement;
  let deferred: Deferred<string>;

  setup(() => {
    container = document.createElement('div');
    deferred = new Deferred<string>();
  });

  test('displays defaultContent immediately', () => {
    render(
        html
        `<div>${until(deferred.promise, html`<span>loading...</span>`)}</div>`,
        container);
        assert.equal(
            stripExpressionMarkers(container.innerHTML),
            '<div><span>loading...</span></div>');
        deferred.resolve('foo');
        return deferred.promise
            .then(() => new Promise((r) => setTimeout(() => r())))
            .then(() => {
              assert.equal(
                  stripExpressionMarkers(container.innerHTML),
                  '<div>foo</div>');
            });
  });

  test('renders new Promise over existing Promise', () => {
    const t = (v: any) =>
        html`<div>${until(v, html`<span>loading...</span>`)}</div>`;
    render(t(deferred.promise), container);
    assert.equal(
        stripExpressionMarkers(container.innerHTML),
        '<div><span>loading...</span></div>');

    const deferred2 = new Deferred<string>();
    render(t(deferred2.promise), container);
    assert.equal(
        stripExpressionMarkers(container.innerHTML),
        '<div><span>loading...</span></div>');

    deferred2.resolve('bar');
    return deferred2.promise.then(() => {
      assert.equal(
          stripExpressionMarkers(container.innerHTML), '<div>bar</div>');

      deferred.resolve('foo');
      return deferred.promise.then(() => {
        assert.equal(
            stripExpressionMarkers(container.innerHTML), '<div>bar</div>');
      });
    });
  });
});
