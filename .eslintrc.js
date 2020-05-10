module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint'
  ],
  extends: [
    'airbnb-typescript'
  ],
  rules: {
    '@typescript-eslint/quotes': ['error', 'single'],
    'arrow-body-style': ['off', 'as-needed'],
    'react/jsx-closing-bracket-location': [2, 'after-props'],
    'react/prop-types': 0,
    'no-console': 0
  },
  parserOptions: {
    project: './tsconfig.json'
  }
};
