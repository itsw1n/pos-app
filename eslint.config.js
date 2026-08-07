const { defineConfig, globalIgnores } = require('eslint/config');
const globals = require('globals');
const expoConfig = require('eslint-config-expo/flat');
const eslintPluginPrettierRecommended = require('eslint-plugin-prettier/recommended');

module.exports = defineConfig([
  globalIgnores([
    'dist/*',
    'IPSS_CodingGuide.jsx',
    '.superpowers/**',
    'supabase/functions/**',
  ]),
  expoConfig,
  eslintPluginPrettierRecommended,
  {
    files: ['metro.config.js', 'scripts/**/*.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
]);
