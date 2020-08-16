'use strict';

const _ = require('lodash');
const fs = require('fs');
const util = require('util');
const yaml = require('js-yaml');

const readDirAsync = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);

let treesDir;
let useStableOptionIds = false;

async function findTrees(location, exclusions = [], useStableIds = false) {
  treesDir = location;
  useStableOptionIds = useStableIds;

  const treesSubdirectories = await (await readDirAsync(treesDir)).filter(file => {
    if (exclusions.includes(file)) {
      return false;
    } else {
      // Array.filter don't work with async
      const stat = fs.statSync(`${treesDir}/${file}`);
      return stat && stat.isDirectory();
    }
  });

  return _.compact(await Promise.all(treesSubdirectories.map(readTreeDefinition)));
}

const generateOptionId = () => {
  return Math.random().toString(36).substr(2, 5);
};

const readTreeDefinition = async subdir => {
  const location = `${treesDir}/${subdir}`;

  const tree = yaml.safeLoad(await readFile(`${location}/tree.yaml`, 'utf8'));
  if (!tree.startNodeId) {
    // This also serves as some kind of backward compatibility for when
    // IDs were supposed to be numeric
    if (Array.isArray(tree.nodes)) {
      tree.startNodeId = tree.nodes[0].id;
    }
  }

  if (tree.trackVisits === undefined) {
    tree.trackVisits = true;
  }

  const usedIds = [];
  // Let's give each option an unique id (five random alphanumeric characters)
  // We also add the index of the option at the end of the id for ease of debug
  if (Array.isArray(tree.nodes)) {
    tree.nodes.forEach((node, nodeIdx) => {
      if (Array.isArray(node.options)) {
        node.options.forEach((option, idx) => {
          let id;
          do {
            id = useStableOptionIds ? `${nodeIdx}---${idx}` : generateOptionId();
          } while (usedIds.includes(id));
          option._id = `${id}-${idx}`;
          usedIds.push(id);
        });
      }
    });
  }

  const slug = _.kebabCase(_.deburr(tree.name.trim()));
  tree._meta = {};
  tree._meta.location = location;
  tree._meta.isPublic = !tree.accessCode;
  tree._meta.slug = slug;
  return tree;
};

module.exports = findTrees;
