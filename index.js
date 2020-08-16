'use strict';

const Hapi = require('@hapi/hapi');
const Vision = require('@hapi/vision');
const Inert = require('@hapi/inert');
const Yar = require('@hapi/yar');
const handlebars = require('hbs');
const path = require('path');
const program = require('commander');
const pkg = require('./package');
const crypto = require('crypto');
const _ = require('lodash');

const settings = require('./lib/settings');
const publicRoute = require('./routes/public');
const notFoundRoute = require('./routes/404');
const indexRoute = require('./routes/index');
const codeRoute = require('./routes/code');
const treeRoute = require('./routes/tree');
const nodeRoute = require('./routes/node');
const graphsRoute = require('./routes/graphs');
const readTrees = require('./lib/read-trees');
const { watch } = require('fs');

const init = async () => {
  program
    .version(pkg.version)
    .option('-s, --settings <path>', 'Location of the settings.json file (defaults to cwd)')
    .option('--sample-settings', 'Dumps a settings file template and exits')
    .option('--sample-tree', 'Dumps a super simple YAML template for a new tree')
    .option(
      '--no-stable-ids',
      'Option Ids are randomly generated at each servere restart (default)'
    )
    .option('--stable-ids', 'Option Ids are generated in a stable way', false)
    .option(
      '--no-watch-trees',
      'Do not reload the tree definition when they change (requires a server restart, default)'
    )
    .option(
      '--watch-trees',
      'Watch changes to the tree definitions and reload them when they change',
      false
    )
    .option('--no-builder-mode', 'Perform full validation of the trees (default)')
    .option(
      '--builder-mode',
      'Bypass trees data validation and only perform schema validation (Warning: can crash the program)',
      false
    )
    .option(
      '--dry-run',
      'Do not start the server but just attempt to load the configuration and the trees'
    )
    .parse(process.argv);

  if (program.sampleSettings) {
    console.log(settings.getDefaultsAsJSON());
    process.exit(0);
  }

  if (program.sampleTree) {
    console.log(settings.getTreeTemplateAsYAML());
    process.exit(0);
  }

  let settingsLocation = '';
  if (process.env.TREENEE_SETTINGS) {
    settingsLocation = process.env.TREENEE_SETTINGS;
  }

  if (program.settings) {
    settingsLocation = program.settings;
  }

  const appSettings = await settings.load(settingsLocation);

  const server = Hapi.server({
    // This will be available as server.settings.app (static configuration)
    app: appSettings,
    port: appSettings.port,
    host: 'localhost',
    routes: {
      files: {
        relativeTo: path.join(__dirname, 'public')
      }
    }
  });

  // If the cookie password is not set, generate one
  let cookiePassword = appSettings.cookiePassword;
  if (!cookiePassword) {
    cookiePassword = crypto.createHash('sha256').update(Date.now().toString()).digest('base64');
  }

  let sessionOptions = {
    storeBlank: false,
    cookieOptions: {
      password: cookiePassword,
      isSecure: false,
      strictHeader: false,
      path: '/'
    }
  };

  await server.register([Vision, Inert]);
  await server.register({
    plugin: Yar,
    options: sessionOptions
  });

  await server.register({
    plugin: require('hapi-pino'),
    options: {
      prettyPrint: process.env.NODE_ENV !== 'production',
      logRequestComplete: appSettings.logRequests
    }
  });
  const validateTreeData = !program.builderMode;
  const treesLocation = path.resolve(appSettings.trees.location);
  const trees = await findTreesOrDie(
    server,
    appSettings,
    treesLocation,
    validateTreeData,
    program.stableIds
  );

  server.app.trees = trees;

  if (program.watchTrees) {
    let watchTask = 0;
    watch(
      treesLocation,
      {
        recursive: true
      },
      async () => {
        if (watchTask) {
          return;
        }
        watchTask = setTimeout(async () => {
          const trees = await findTreesOrDie(
            server,
            appSettings,
            treesLocation,
            validateTreeData,
            program.stableIds
          );
          server.app.trees = trees;
          server.log('info', 'Reloading tree defition…');
          watchTask = 0;
        }, 100);
      }
    );
  }

  server.views({
    engines: {
      html: handlebars
    },
    isCached: false,
    relativeTo: __dirname,
    path: './templates',
    layout: true,
    layoutPath: './templates/layouts',
    helpersPath: './templates/helpers',
    // Use a "c_" prefix to easily identify the usage of these vars in templates
    context: {
      c_settings: appSettings,
      c_trees: trees
    }
  });

  server.route(indexRoute);
  server.route(codeRoute);
  server.route(publicRoute);
  server.route(graphsRoute);
  server.route(notFoundRoute);
  server.route(treeRoute);
  server.route(nodeRoute);

  if (!program.dryRun) {
    await server.start();
    server.log(
      'info',
      `Server running on ${server.info.uri} using settings from ${appSettings._from}`
    );
  }
};

async function findTreesOrDie(server, settings, treesLocation, validateTreeData, useStableIds) {
  let trees;

  try {
    trees = await readTrees(treesLocation, settings.trees.exclude, validateTreeData, useStableIds);
  } catch (err) {
    server.log('error', err.message);
    process.exit(1);
  }

  if (trees.length === 0) {
    server.log('error', 'No usable trees found.');
    process.exit(1);
  }

  return trees;
}

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
