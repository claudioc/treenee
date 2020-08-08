'use strict';

const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const cJSON = require('comment-json');
const readFile = util.promisify(fs.readFile);
const path = require('path');
const flatten = require('flat');
const SchemaValidator = require('./schema-validator');

const schemaValidator = new SchemaValidator('settings-schema.json');

// Keep this in sync with settings-schema.json
const defaultsJSON = `{
  // TCP Port the server will listen to
  "port": 3000,
  // A password to encrypt the session data; if the password is not set
  // it will be generated on each server run
  "cookiePassword": "",
  // Application log verbosity (advanced)
  "logRequests": false,
  // Settings related to the trees
  "trees": {
    // Where to find the trees directory, relative to the server's cwd
    "location": "trees",
    // Trees you don't want to load (use the directory name)
    "exclude": [],
    // Wether or not to show graphs
    "showGraph": false
  },
  // Settings related to the App behaviour and presentation
  "custom": {
    // Name of the App, used in the HTML
    "name": "Treenee",
    // One liner description of the App, to be used in the header
    "description": "Treenee – The decision tree engine",
    // Settings for the index page
    "index": {
      // Title of the page, shown as an HTML H element
      "title": "Available public trees"
    }
  }
}
`;

// Keep this in sync with tree-schema.json
const treeTemplate = `{
  "name": "CHANGE ME",
  "title": "CHANGE ME",
  "description": "CHANGE ME",
  "accessCode": "",
  "startNodeId": "start",
  "trackVisits": false,
  "nodes": [
    {
      "id": "start",
      "title": "CHANGE ME",
      "body": "CHANGE ME",
      "prompt": "CHANGE ME",
      "options": [
        {
          "text": "CHANGE ME",
          "onSelect": "A node id or a URL",
          "value": 0
        }
      ]
    }
  ]
}`;

const defaults = cJSON.parse(defaultsJSON);

/*
 * Attempts to load a configuration file or just uses the defaults
 * Returns a settings object
 */
async function load(location) {
  const useCustomSettingsLocation = !_.isEmpty(location);
  let settingsFromFile;
  try {
    let settingsLocation;
    if (useCustomSettingsLocation) {
      settingsLocation = location;
    } else {
      settingsLocation = path.join('./settings.json');
    }
    settingsFromFile = await readFile(settingsLocation, 'utf8');
    defaults._from = settingsLocation;
  } catch (err) {
    if (useCustomSettingsLocation) {
      throw err;
    }
    // No settings file is OK, move on and merge the defaults
    settingsFromFile = JSON.stringify({});
    defaults._from = 'defaults';
  }

  settingsFromFile = loadFrom(cJSON.parse(settingsFromFile));

  return settingsFromFile;
}

function loadFrom(data = {}) {
  const aliens = findAliens(data);
  if (aliens.length > 0) {
    throw new Error(`Unidentified key(s) in the settings file: ${aliens.join('. ')}.`);
  }
  return _.merge(defaults, data);
}

function findAliens(data) {
  const keys1 = Object.keys(flatten(data));
  const keys2 = Object.keys(flatten(defaults));
  const skipArrays = key => !/\d+$/.test(key);
  // Since flatten also flattens arrays, we ought to remove those values
  // from the keys arrays otherwise we'll find all false positives
  const aliens = _.difference(keys1.filter(skipArrays), keys2.filter(skipArrays));
  return aliens;
}

function getDefaultsAsJSON() {
  return defaultsJSON;
}

function getTreeTemplateAsJSON() {
  return treeTemplate;
}

module.exports = {
  getDefaultsAsJSON,
  getTreeTemplateAsJSON,
  load,
  loadFrom
};
