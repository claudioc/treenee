const isURLLike = require('../../lib/is-url-like');

module.exports = (options, context) => {
  return isURLLike(options);
};
