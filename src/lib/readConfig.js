import fs from 'fs';
import path from 'path';
import JSON5 from 'json5';
import mergewith from 'lodash.mergewith';

const defaultConfig = {

  src: './src/',
  dest: './dist/',
  tmp: './tmp',

  scripts: {
    bundles: ['./index.js'],
    vendors: [],
    extensions: ['.js']
  },

  styles: {
    bundles: ['./index.css'],
    extensions: ['.scss', '.css']
  },

  plugins: [],

  //extra webpack config... try not to use this, it won't be portable if we switch tooling
  webpack: {},

  _: {
    test: {},
    optimise: {}
  }

};

/**
 * Combine arrays
 * @param {array} prev
 * @param {array} next
 * @returns {Array.<T>|string}
 */
function concatArray(prev, next) {
  if (Array.isArray(prev)) {
    return prev.concat(next);
  }
}

/**
 * Combine settings from two configuration objects and replace any duplicate settings
 * @param   {object} cfg1
 * @param   {object} cfg2
 * @returns {object} Returns a new config object
 */
function combineAndReplaceConfig(cfg1, cfg2) {
  return {
    ...cfg1,
    ...cfg2,

    scripts: {
      ...cfg1.scripts,
      ...cfg2.scripts
    },

    styles: {
      ...cfg1.styles,
      ...cfg2.styles
    }

  }

}

/**
 * Combine settings from two configuration objects and merge any duplicate settings
 * @param   {object} cfg1
 * @param   {object} cfg2
 * @returns {object} Returns a new config object
 */
function combineAndMergeConfig(cfg1, cfg2) {
  return mergewith({}, cfg1, cfg2, concatArray);
}

/**
 * Combine the config with the defaults
 * @param   {object} config The user's config
 * @param   {String} context   The task name
 * @returns {{}}
 */
export function combineConfig(config, context = null) {
  let finalConfig = combineAndReplaceConfig(defaultConfig, config);

  if (context) {
    finalConfig = combineAndMergeConfig(finalConfig, config._[context]);
  }

  delete finalConfig._;

  return finalConfig;
}

/**
 * Read the config
 * @param root
 * @returns {{}}
 */
function readConfig(root) {
  const file = path.resolve(root, '.tradierc');

  //load the user config
  let config = {};
  if (fs.existsSync(file)) {
    try {
      config = JSON5.parse(fs.readFileSync(file));
    } catch (err) {
      throw new Error(`Error reading config file ${file}`);
    }
  }

  return config;
}

/**
 * Load and merge the user configuration
 * @param   {string} root
 * @param   {string} context
 * @returns {object}
 */
export default function(root = process.cwd(), context = null) {

  //load the user config
  const config = combineConfig(readConfig(root), context);

  //resolve paths
  config.root = path.resolve(root, config.src);
  config.src = path.resolve(root, config.src);
  config.dest = path.resolve(root, config.dest);
  config.tmp = path.resolve(root, config.tmp);

  return config;
}
