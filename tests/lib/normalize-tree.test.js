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

test('Should normalize options onSelect', async t => {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  const tree = normalizeTree(trees[0]);
  t.is(tree.nodes[0].options[0].onSelect, 'start');
  t.is(tree.nodes[0].options[0].nextNodeId, 'start');
  t.is(tree.nodes[0].options[1].onSelect, '2');
});
