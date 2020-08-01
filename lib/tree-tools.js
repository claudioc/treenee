'use strict';

module.exports = {
  findTreeBySlug: (trees, slug) => {
    return trees.find(tree => {
      return slug === tree._meta.slug;
    });
  },

  findNodeById: (tree, nodeId) => {
    if (!tree.nodes) {
      return undefined;
    }
    return tree.nodes.find(node => {
      return nodeId === node.id;
    });
  }
};
