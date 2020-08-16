'use strict';

const _cloneDeep = require('lodash/cloneDeep');

// This function normalizes some values in `tree`
// Beware: the tree may have not been validated yet.
function normalizeTree(tree) {
  if (!tree.nodes) {
    return tree;
  }

  if (!Array.isArray(tree.nodes)) {
    return tree;
  }

  const normalizedTree = _cloneDeep(tree);
  normalizedTree.nodes.forEach(node => {
    node.id = String(node.id);
    if (node.options) {
      node.options = normalizeOptions(node.options);
    }
  });

  if (tree.bodyFormat === undefined) {
    tree.bodyFormat = 'html';
  }
  return normalizedTree;
}

function normalizeOptions(options) {
  if (!Array.isArray(options)) {
    return options;
  }

  const betterOptions = _cloneDeep(options);

  // Backward compatibility for renaming "nextNodeId" to "onSelect"
  // nextNodeId is deprecated in favour of onSelect since August 2020
  betterOptions.forEach(option => {
    if (option.nextNodeId && option.onSelect) {
      option.nextNodeId = option.onSelect;
      return;
    }

    if (option.nextNodeId && option.onSelect === undefined) {
      option.onSelect = option.nextNodeId;
      return;
    }
  });

  return betterOptions;
}

module.exports = normalizeTree;
