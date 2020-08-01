'use strict';

const test = require('ava');
const path = require('path');
const findTrees = require('../../lib/find-trees');
const treeTools = require('../../lib/tree-tools');

test('Should find a tree by slug', async t => {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  const tree = treeTools.findTreeBySlug(trees, 'a-test-tree');
  t.is(tree.nodes.length, 2);
});

test('Should not find a tree by slug', async t => {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  const tree = treeTools.findTreeBySlug(trees, 'foobar');
  t.is(tree, undefined);
});

test('Should find a node by id', async t => {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  const node = treeTools.findNodeById(trees[0], 'start');
  t.is(node.options.length, 2);
});

test('Should not find a node by id', async t => {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  const node = treeTools.findNodeById(trees[0], '1123');
  t.is(node, undefined);
});
