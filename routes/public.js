'use strict';

module.exports = {
  method: 'GET',
  path: '/public/{param*}',
  handler: {
    directory: {
      path: '.',
      redirectToSlash: true,
      index: true
    }
  }
};
