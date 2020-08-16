'use strict';

const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const cJSON = require('comment-json');
const readFile = util.promisify(fs.readFile);
const path = require('path');
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
  // All the string used in the application
  "strings": {
    "layout_1": "Treenee",
    "layout_2": "Treenee – The decision tree engine",
    "index_1": "Available public trees",
    "index_2": "Available tree(s)",
    "index_3": "Enter the code of any private tree you want to access",
    "index_4": "Access",
    "node_1": "&#9888; You already selected an option for this prompt.",
    "node_2": "You reached the end;",
    "node_3": "start again?",
    "node_4": "Final score:",
    "tree_1": "Start",
    "404_1": "Ooops!",
    "404_2": "404 - Page Not Found",
    "shared_1": "Home",
    "shared_2": "Back",
    "shared_3": "Abort and restart",
    "shared_4": "Graph"
  }
}
`;

// Keep this in sync with tree-schema.json
const treeTemplate = `
---
name: "CHANGE ME"
title: "CHANGE ME"
description: "CHANGE ME"
accessCode: ""
startNodeId: "start"
trackVisits: false
bodyFormat: html
nodes:
- id: "start"
  title: "CHANGE ME"
  body: |
    CHANGE ME WITH
    THE ACTUAL CONTENT
    FOR THE BODY
  prompt: "CHANGE ME"
  options:
  - text: "CHANGE ME"
    onSelect: "A node id or a URL"
    value: 0
`;

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
  if (!schemaValidator.validate(data)) {
    throw new Error(`Validation failed for settings file: ${schemaValidator.errors().join(', ')}`);
  }

  return _.merge(defaults, data);
}

function getDefaultsAsJSON() {
  return defaultsJSON;
}

function getTreeTemplateAsYAML() {
  return treeTemplate;
}

module.exports = {
  getDefaultsAsJSON,
  getTreeTemplateAsYAML,
  load,
  loadFrom
};
