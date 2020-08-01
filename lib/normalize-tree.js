'use strict';

const _cloneDeep = require('lodash/cloneDeep');

// This function normalizes some values in `tree`
function normalizeTree(tree) {
  // Makes sure that any "id" in nodes and options are of string type
  // Beware: the tree may have not been validated yet.
  if (!tree.nodes) {
    return tree;
  }

  if (!Array.isArray(tree.nodes)) {
    return tree;
  }

  const normalizedTree = _cloneDeep(tree);
  normalizedTree.nodes.forEach(node => {
    node.id = String(node.id);
  });

  return normalizedTree;
}

module.exports = normalizeTree;
