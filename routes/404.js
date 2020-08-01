'use strict';

module.exports = {
  method: ['GET', 'POST'],
  path: '/{any*}',
  handler: (request, h) => {
    return h.view('404').code(404);
  }
};
