'use strict';

const _ = require('lodash');
const SchemaValidator = require('./schema-validator');
const isURLLike = require('../lib/is-url-like');

const schemaValidator = new SchemaValidator('tree-schema.json');

function validateTree(tree) {
  const e = _.curry(errorize)(tree);

  if (!(tree instanceof Object)) {
    throw new Error(e('A tree definition must be an object.'));
  }

  if (!schemaValidator.validate(tree)) {
    throw new Error(e(`Schema validation failed: ${schemaValidator.errors().join(', ')}`));
  }

  if (!tree.nodes.map(node => node.id).includes(tree.startNodeId)) {
    throw new Error(e(`Start node id ${tree.startNodeId} doesn't exist.`));
  }

  tree.nodes.forEach(_.curry(validateNode)(tree));

  validateIdUniqueness(tree.nodes, e('All the nodes ID must be unique.'));

  validateNoOrphanNodes(tree);
}

const validateNode = (tree, node) => {
  const e = _.curry(errorize)(tree);

  if (_.isNil(node.id)) {
    throw new Error(e(`Each node needs an id.`));
  }

  if (_.isNil(node.title)) {
    throw new Error(e(`Each node needs a title.`));
  }

  if (node.prompt && _.isEmpty(node.options)) {
    throw new Error(e(`"${node.title}": no options for the prompt.`));
  }

  if (_.isNil(node.prompt) && node.options) {
    throw new Error(e(`"${node.title}": no prompt for the options.`));
  }

  if (!_.isEmpty(node.options)) {
    node.options.forEach(_.curry(validateOption)(tree)(node));
  }
};

// All nodes must be pointed to at least by an option
const validateNoOrphanNodes = tree => {
  const e = _.curry(errorize)(tree);
  const nodes = tree.nodes;

  if (!nodes) {
    return;
  }

  const allNodeIds = nodes.map(node => node.id);

  // Get all the possible options as an array (including 1, probably never referenced by an option)
  const optionReferences = _.uniq(
    _.concat(
      [tree.startNodeId],
      _.flatten(
        _.compact(nodes.map(node => node.options && node.options.map(option => option.onSelect)))
      )
    )
  ).filter(el => !isURLLike(el));

  const orphans = _.difference(allNodeIds, optionReferences);
  if (orphans.length > 0) {
    throw new Error(e(`Unreferenced node(s) found (${orphans.join(', ')})`));
  }
};

const validateOption = (tree, node, option) => {
  if (option.onSelect === '' || isURLLike(option.onSelect)) {
    return;
  }

  const e = _.curry(errorize)(tree);

  if (!_.find(tree.nodes, node => node.id === option.onSelect)) {
    throw new Error(e(`${node.title}: option points to a missing node (${option.onSelect}).`));
  }
};

const validateIdUniqueness = (items, error) => {
  const ids = _.uniq(_.map(items, item => item.id));
  if (ids.length !== items.length) {
    throw new Error(error);
  }
};

const errorize = (tree, msg) => {
  return `Error in "${tree.name}": ${msg}`;
};

module.exports = validateTree;
