'use strict';

module.exports = {
  method: ['GET', 'POST'],
  path: '/{any*}',
  handler: (request, h) => {
    if (request.url.pathname === '/service-worker.js') {
      return '';
    }
    return h.view('404').code(404);
  }
};
