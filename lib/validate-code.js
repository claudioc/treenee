'use strict';

const crypto = require('crypto');

module.exports = (tree, accessCode) => {
  if (!tree.accessCode) {
    return true;
  }

  const hash = crypto.createHash('sha256').update(tree.accessCode).digest('base64');

  return hash === accessCode;
};
