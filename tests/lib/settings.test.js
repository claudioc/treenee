'use strict';

const test = require('ava');
const settings = require('../../lib/settings');

test('Should load configuration from a passed object', async t => {
  const data = settings.loadFrom();
  t.is(Object.keys(data).length, 5);
});

test('Should change default values', async t => {
  const data = settings.loadFrom({ port: 666 });
  t.is(data.port, 666);
});

test('Should throw in case of aliens', async t => {
  const err = t.throws(() => {
    settings.loadFrom({ trees: { foobar: 123 } });
  });

  t.regex(err.message, /.*foobar/);
});
