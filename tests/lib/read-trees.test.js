'use strict';

const test = require('ava');
const path = require('path');
const readTrees = require('../../lib/read-trees');

test('Should throw if the directory does not exist', async t => {
  const err = await t.throwsAsync(async () => {
    await readTrees('foobar');
  });
});

test('Should read the trees', async t => {
  const trees = await readTrees(path.join(__dirname, '../trees'));
  t.is(trees.length, 1);
  t.is(trees[0].nodes.length, 2);
  t.is(trees[0].nodes[0].options.length, 2);
  t.is(trees[0].nodes[0].options[1].text, 'No');
});

test('Should exclude trees from settings', async t => {
  const trees = await readTrees(path.join(__dirname, '../trees'), ['test-tree']);
  t.is(trees.length, 0);
});
