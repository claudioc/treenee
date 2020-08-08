'use strict';

const { URL, parse } = require('url');

module.exports = (str, protocols) => {
  try {
    new URL(str);
    const parsed = parse(str);
    return Array.isArray(protocols)
      ? parsed.protocol
        ? protocols.map(x => `${x.toLowerCase()}:`).includes(parsed.protocol)
        : false
      : true;
  } catch (err) {
    return false;
  }
};
