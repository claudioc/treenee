'use strict';

const _ = require('lodash');
const Joi = require('@hapi/joi');
const crypto = require('crypto');

const handler = (req, h) => {
  const trees = req.server.app.trees;
  const code = req.payload.accessCode;
  if (code.length === 0) {
    return h.redirect('/?e=1');
  }

  const tree = trees.find(tree => tree.accessCode === code);
  if (tree) {
    // Sets the accessCode in a cookie so to be able to use
    // it when opening the tree
    const hash = crypto.createHash('sha256').update(code).digest('base64');

    req.yar.set('accessCode', hash);
    return h.redirect(`/tree/${tree._meta.slug}`);
  }

  return h.redirect('/?e=2');
};

module.exports = {
  method: 'POST',
  path: '/code',
  handler,
  options: {
    validate: {
      payload: {
        accessCode: Joi.string().min(1).max(80).trim().allow('')
      }
    }
  }
};
