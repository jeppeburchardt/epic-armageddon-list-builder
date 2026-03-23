import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import eslintConfigPrettier from 'eslint-config-prettier'

export default tseslint.config(
  // Global ignores
  { ignores: ['dist/**', 'node_modules/**'] },

  // Base JS rules for all files
  eslint.configs.recommended,

  // TypeScript strict type-checked rules, scoped to src/
  {
    files: ['src/**/*.ts', 'src/**/*.vue'],
    extends: tseslint.configs.strictTypeChecked,
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      // Numbers are safe and idiomatic in template literals
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
    },
  },

  // Vue 3 recommended rules (sets vue-eslint-parser for .vue files)
  ...pluginVue.configs['flat/recommended'],

  // Override for .vue files: use tseslint.parser inside <script> blocks
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // Enforce lang="ts" on all <script> blocks
      'vue/block-lang': ['error', { script: { lang: 'ts' } }],
      // Enforce <script> before <template>
      'vue/block-order': ['error', { order: ['script', 'template', 'style'] }],
    },
  },

  // Disable ESLint formatting rules that conflict with Prettier (must be last)
  eslintConfigPrettier,
)
