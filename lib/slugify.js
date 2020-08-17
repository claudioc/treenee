const _ = require('lodash');

const decamelize = str => {
  return (
    str
      // Separate capitalized words.
      .replace(/([A-Z]{2,})(\d+)/g, '$1 $2')
      .replace(/([a-z\d]+)([A-Z]{2,})/g, '$1 $2')
      .replace(/([a-z\d])([A-Z])/g, '$1 $2')
      .replace(/([A-Z]+)([A-Z][a-z\d]+)/g, '$1 $2')
  );
};

const slugify = str => {
  let slugged = decamelize(_.deburr(str.trim())).toLowerCase();
  const patternSlug = /[^a-z\d]+/g;
  slugged = slugged.replace(patternSlug, '-');
  slugged = slugged.replace(/\\/g, '');
  return slugged;
};

module.exports = slugify;
