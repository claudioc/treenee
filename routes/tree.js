'use strict';

const _ = require('lodash');
const validateCode = require('../lib/validate-code');
const treeTools = require('../lib/tree-tools');

const handler = (req, h) => {
  const tree = treeTools.findTreeBySlug(req.server.app.trees, req.params.slug);

  if (!tree) {
    return h.response('Not found').code(404);
  }

  if (!validateCode(tree, req.yar.get('accessCode') || '')) {
    req.yar.clear('accessCode');
    return h.redirect(`/?e=3`);
  }

  req.yar.clear('visits');

  const startUrl = `/tree/${tree._meta.slug}/${tree.startNodeId}`;
  if (tree.showIntro) {
    return h.view('tree', {
      tree,
      startUrl,
      showGraph: req.server.settings.app.trees.showGraph
    });
  } else {
    return h.redirect(startUrl);
  }

  return h.view('tree', {
    tree,
    showGraph: req.server.settings.app.trees.showGraph
  });
};

const handlerJSON = (req, h) => {
  const tree = treeTools.findTreeBySlug(req.server.app.trees, req.params.param);

  if (!validateCode(tree, req.yar.get('accessCode') || '')) {
    req.yar.clear('accessCode');
    return h.response('Forbidden').code(401);
  }

  return tree;
};

module.exports = [
  {
    method: 'GET',
    path: `/tree/{slug}`,
    handler
  },
  {
    method: 'GET',
    path: `/tree/{slug}.json`,
    handler: handlerJSON
  }
];
