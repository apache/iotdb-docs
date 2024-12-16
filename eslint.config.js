import jsConfig from '@eslint/js';
import pluginVue from 'eslint-plugin-vue';
import globals from 'globals';
import { config, plugin, configs as tsConfigs } from 'typescript-eslint';

export default config(
  {
    ignores: [
      'dist/**',
      'node_modules/**',
      '!src/.vuepress/**',
      'src/.vuepress/.cache/**',
      'src/.vuepress/.temp/**',
      'src/.vuepress/public/**',
    ],
  },

  {
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        extraFileExtensions: ['.vue'],
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  jsConfig.configs.recommended,
  ...tsConfigs.strict,

  {
    files: ['**/*.ts', '**/*.cts', '**/*.mts'],
    plugins: {
      '@typescript-eslint': plugin,
    },
  },
  ...pluginVue.configs['flat/recommended'],

  {
    files: ['**/*.{js,cjs,mjs,jsx}'],
    ...tsConfigs.disableTypeChecked,
  },

  {
    files: ['**/*.cjs'],
    rules: {
      '@typescript-eslint/no-require-imports': 'off',
    },
  },

  {
    files: ['**/*.vue'],
    rules: {
      'vue/max-attributes-per-line': 'off',
    },
  },

  {
    files: ['deploy.cjs', 'deploy_staging.cjs'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
