'use strict';

const _ = require('lodash');

const normalizeTree = require('./normalize-tree');
const validateTree = require('./validate-tree');
const findTrees = require('./find-trees');

async function readTrees(location, exclusions = [], bypassValidation = false) {
  const trees = await findTrees(location, exclusions);

  if (!bypassValidation) {
    trees.forEach(tree => {
      validateTree(normalizeTree(tree));
    });
  }

  trees._meta = {};
  trees._meta.privateCount = trees.filter(tree => tree.accessCode).length;
  trees._meta.publicCount = trees.length - trees._meta.privateCount;

  return trees;
}

module.exports = readTrees;
