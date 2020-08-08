'use strict';

const test = require('ava');
const isURLLike = require('../../lib/is-url-like');

test('Should test if a sting is a url or not', async t => {
  let str = '';
  t.is(isURLLike(str), false);
  str = undefined;
  t.is(isURLLike(str), false);
  str = 'aaa';
  t.is(isURLLike(str), false);
  str = 123;
  t.is(isURLLike(str), false);
  str = 'https';
  t.is(isURLLike(str), false);
  str = 'mailto://claudio@xyz.com';
  t.is(isURLLike(str), true);
  str = 'https://claudio@xyz.com some';
  t.is(isURLLike(str), false);
});
