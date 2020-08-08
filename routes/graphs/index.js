'use strict';

const validateCode = require('../../lib/validate-code');
const isURLLike = require('../../lib/is-url-like');

module.exports = [
  {
    method: 'GET',
    path: '/graphs',
    handler: graphsIndex
  },
  {
    method: 'GET',
    path: '/graphs/{param*}',
    handler: graphsTree
  }
];

function graphsIndex(req, h) {
  if (!req.server.settings.app.trees.showGraph) {
    return h.response('Not found').code(404);
  }
  return h.view('graphs/index');
}

function graphsTree(req, h) {
  if (!req.server.settings.app.trees.showGraph) {
    return h.response('Not found').code(404);
  }

  // Find the tree by its slug (the param)
  const slug = req.params.param;
  const tree = req.server.app.trees.find(tree => {
    return slug === tree._meta.slug;
  });

  if (!tree) {
    return h.response('Not found').code(404);
  }

  if (!validateCode(tree, req.yar.get('accessCode') || '')) {
    req.yar.clear('accessCode');
    return h.response('Forbidden').code(401);
  }

  const graphDefinition = ['graph TD'];
  const rootNode = tree.nodes[0];
  const label = makeLabel(tree, rootNode.id, rootNode.title);

  graphDefinition.push(`intro>"${clean(tree.title)}"] --- |Start| ${rootNode.id}(${label})`);

  // Convert the json defition to mmd
  tree.nodes.forEach(node => {
    if (!node.options) {
      return;
    }

    node.options.forEach(option => {
      const label = makeLabel(tree, option.onSelect);
      const target = isURLLike(option.onSelect) ? 'https://…' : option.onSelect;
      graphDefinition.push(`${node.id} --> |"${clean(option.text)}"| ${target}(${label})`);
    });
  });

  tree.nodes.forEach(node => {
    graphDefinition.push(`click ${node.id} Treenee_graphClickHandler`);
  });

  return h.view('graphs/tree', {
    graphDefinition: graphDefinition.join('\n'),
    tree
  });
}

function makeLabel(tree, onSelect, title) {
  if (isURLLike(onSelect)) {
    return 'https://…';
  }
  const cleanTitle = clean(title ? title : findNodeTitle(tree, onSelect));
  return `"<span class='treenee-node-id'>${onSelect}</span>&nbsp;&nbsp;${cleanTitle}&nbsp;"`;
}

function findNodeTitle(tree, nodeId) {
  const node = tree.nodes.find(node => node.id === nodeId);
  return node ? node.title : `No title for node ${nodeId}`;
}

function clean(text) {
  return text.replace(/"/g, '&quot;');
  //return text.replace(/&amp;/g, '&');
  // return entities.encode(text)
  // // Fixes issue with double encond
  // .replace(/&amp;/g, '&');
}
