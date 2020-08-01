'use strict';

const _ = require('lodash');
const errors = require('../lib/errors');
const Joi = require('@hapi/joi');

const handler = (req, h) => {
  const error = errors.get(req.query.e || 0);
  return h.view('index', {
    error
  });
};

module.exports = {
  method: 'GET',
  path: '/',
  handler,
  options: {
    validate: {
      query: {
        e: Joi.number()
          .integer()
          .min(1)
          .max(errors.size - 1)
          .default(0)
      }
    }
  }
};
