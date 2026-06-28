const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

// Project root is the current apps/mobile directory
const projectRoot = __dirname;
// Workspace root is the root my-billing-monorepo directory
const workspaceRoot = path.resolve(projectRoot, '../..');

const defaultConfig = getDefaultConfig(projectRoot);

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('metro-config').MetroConfig}
 */
const config = {
  // 1. Tell Metro to watch the entire monorepo so it can resolve files from packages/*
  watchFolders: [workspaceRoot],

  resolver: {
    // 2. Configure Metro to search for modules in both the local and root node_modules
    nodeModulesPaths: [
      path.resolve(projectRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
    ],

    // 3. Redirect peer dependencies (like react, react-native, react-query) back to the 
    // mobile app's node_modules. This avoids "Multiple copies of React" or bundler crashes.
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          const localDependencyPath = path.resolve(projectRoot, 'node_modules', name);
          
          // Force single instance of critical frameworks in the React Native project
          if (['react', 'react-native', '@tanstack/react-query', 'axios'].includes(name)) {
            return localDependencyPath;
          }
          
          // Fall back to resolving from monorepo root node_modules
          return path.resolve(workspaceRoot, 'node_modules', name);
        },
      }
    ),
  },
};

module.exports = mergeConfig(defaultConfig, config);
