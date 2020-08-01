'use strict';

const test = require('ava');
const path = require('path');
const findTrees = require('../../lib/find-trees');
const normalizeTree = require('../../lib/normalize-tree');

test('Should normalize node ids', async t => {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  trees[0].nodes[0].id = 123;
  const tree = normalizeTree(trees[0]);
  t.is(tree.nodes[0].id, '123');
});
