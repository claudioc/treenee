'use strict';

const test = require('ava');
const path = require('path');
const slugify = require('../../lib/slugify');

test('Should slugify some words', async t => {
  t.is(slugify('claudio'), 'claudio');
  t.is(slugify('claudio    '), 'claudio');
  t.is(slugify('Claudio Cicali'), 'claudio-cicali');
  t.is(slugify('B42'), 'b42');
  t.is(slugify('B42 and more'), 'b42-and-more');
  t.is(slugify('Very Special!'), 'very-special-');
});
