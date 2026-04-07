import { defineConfig } from '@soybeanjs/eslint-config';

export default defineConfig(
  { vue: true, unocss: true },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      'public/**',
      '*.min.js',
      '.vscode/**',
      '.idea/**',
      '.changeset/**',
      'temp/**',
      'apps/**/dist/**',
      'packages/**/dist/**',
      'icons_report.json',
      'lint_output.txt'
    ]
  },
  {
    rules: {
      'vue/multi-word-component-names': [
        'warn',
        {
          ignores: ['index', 'App', 'Register', '[id]', '[url]']
        }
      ],
      'vue/component-name-in-template-casing': [
        'warn',
        'PascalCase',
        {
          registeredComponentsOnly: false,
          ignores: ['/^icon-/']
        }
      ],
      'unocss/order-attributify': 'off',
      'no-underscore-dangle': 'off'
    }
  }
);
