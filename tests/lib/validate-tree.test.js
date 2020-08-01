'use strict';

const test = require('ava');
const path = require('path');
const findTrees = require('../../lib/read-trees');
const validateTree = require('../../lib/validate-tree');
const _cloneDeep = require('lodash/cloneDeep');

test('Should validate a valid tree', async t => {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  validateTree(trees[0]);
  t.pass();
});

test('Should validate an invalid tree 1', async t => {
  const err = t.throws(() => {
    validateTree(123);
  });
  t.regex(err.message, /.*an object./);
});

test('Should validate an invalid tree 5', async t => {
  const tree = await getTestTree();
  tree.nodes[1].id = '1';
  const err = t.throws(() => {
    validateTree(tree);
  });
  t.regex(err.message, /.*missing node \(2\)\.*/);
});

test('Should validate an invalid tree 6', async t => {
  const tree = await getTestTree();
  delete tree.nodes[1].title;
  const err = t.throws(() => {
    validateTree(tree);
  });
  t.regex(err.message, /.*should have required property.*/);
});

test('Should validate an invalid tree 7', async t => {
  const tree = await getTestTree();
  delete tree.nodes[1].options;
  const err = t.throws(() => {
    validateTree(tree);
  });
  t.regex(err.message, /.*for the prompt.*/);
});

test('Should validate an invalid tree 8', async t => {
  const tree = await getTestTree();
  delete tree.nodes[1].prompt;
  const err = t.throws(() => {
    validateTree(tree);
  });
  t.regex(err.message, /.*for the option.*/);
});

test('Should validate an invalid tree 12', async t => {
  const tree = await getTestTree();
  tree.nodes[1].options[0].nextNodeId = '1000';
  const err = t.throws(() => {
    validateTree(tree);
  });
  t.regex(err.message, /.*missing node \(1000\).*/);
});

async function getTestTree() {
  const trees = await findTrees(path.join(__dirname, '../trees'));
  return _cloneDeep(trees[0]);
}
