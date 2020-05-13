module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript',
  ],
  rules: {
    '@typescript-eslint/quotes': ['error', 'single'],
    'arrow-body-style': ['off', 'as-needed'],
    'react/jsx-closing-bracket-location': [2, 'after-props'],
    'react/prop-types': 0,
    'no-console': 0,
    'react/jsx-props-no-spreading': 0,
    'react/jsx-one-expression-per-line': 0,
    'global-require': 0,
    'no-alert': 0,
    'arrow-parens': 0,
    'max-len': ['error', 120],
  },
  parserOptions: {
    project: './tsconfig.json',
    createDefaultProgram: true,
  },
};
