'use strict';

const errors = new Map();

errors.set(0, '');
errors.set(1, 'The access code is mandatory');
errors.set(2, 'This access code is unknown');
errors.set(3, 'The tree is not found or not accessible.');

module.exports = errors;
