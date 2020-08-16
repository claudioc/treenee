'use strict';

const _ = require('lodash');
const validateCode = require('../lib/validate-code');
const Joi = require('@hapi/joi');
const Boom = require('@hapi/boom');
const treeTools = require('../lib/tree-tools');
const markdown = require('markdown-it')({
  html: false,
  typographer: true
});

const handler = (req, h) => {
  const tree = treeTools.findTreeBySlug(req.server.app.trees, req.params.slug);

  if (!tree) {
    return h.response('Not found (tree)').code(404);
  }

  const node = treeTools.findNodeById(tree, req.params.nodeId);
  if (!node) {
    return h.response('Not found (node)').code(404);
  }

  if (!validateCode(tree, req.yar.get('accessCode') || '')) {
    req.yar.clear('accessCode');
    return h.redirect(`/?e=3`);
  }

  // Definition: a visited node is a node whose prompt's option
  // has been selected and not just shown

  let score;

  // Save the parentNode as a visited node, if needed
  const visits = req.yar.get('visits') || {};
  const treeVisits = visits[tree.name] || [];

  let previousVisit = false;
  if (tree.trackVisits) {
    // Before presenting the node we need to know if this node has already
    // a selected option (if it's already visited).
    previousVisit = treeVisits.find(visit => visit.nodeId === node.id);
  }

  if (req.query.p) {
    const parentNode = tree.nodes.find(node => node.id == req.query.p);
    if (!parentNode) {
      return Boom.badRequest('Unrecognized parent node.');
    }

    const option = parentNode.options.find(option => option._id == req.query.o);
    if (!option) {
      return Boom.badRequest(`Unrecognized option ${req.query.o}.`);
    }

    if (!treeVisits.find(visit => visit.nodeId === parentNode.id)) {
      // The parent node was never visited, and we can save the visit
      treeVisits.push({
        nodeId: parentNode.id,
        optionId: option._id,
        value: parseInt(option.value, 10) || 0,
        time: Date.now()
      });
      visits[tree.name] = treeVisits;
      req.yar.set('visits', visits);
    }

    score = treeVisits.reduce((previous, current) => {
      return previous + current.value;
    }, 0);
  }

  let body = node.body;
  if (tree.bodyFormat === 'markdown') {
    console.log(body);
    body = markdown.render(body);
  }

  return (
    h
      .view('node', {
        previousVisit,
        score,
        node,
        body,
        tree
      })
      // Instruct browsers to not cache these pages since we need to
      // check if they have been already scored.
      // @TODO consider to add these headers only for "scored" nodes.
      .header('Pragma', 'no-cache')
      .header(
        'Cache-Control',
        'private, no-store, max-age=0, no-cache, must-revalidate, post-check=0, pre-check=0'
      )
      .header('Expires', 'Fri, 01 Jan 1990 00:00:00 GMT')
  );
};

module.exports = {
  method: 'GET',
  path: `/tree/{slug}/{nodeId}`,
  handler,
  options: {
    validate: {
      query: {
        // Parent node id
        p: Joi.string(),
        // Option
        o: Joi.string().min(7).max(10)
      }
    }
  }
};
