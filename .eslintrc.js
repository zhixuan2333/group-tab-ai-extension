module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    webextensions: true
  },
  extends: [
    'standard-with-typescript',
    'plugin:react/recommended',
    'plugin:react/recommended',
    'eslint:recommended',
    'prettier',
  ],
  overrides: [
  ],
  parserOptions: {
    project: './tsconfig.json',
  },
  plugins: [
    'react'
  ],
  rules: {
    "react/jsx-uses-react": "off",
    "react/react-in-jsx-scope": "off"
  },
  ignorePatterns: [
    'node_modules',
    '.plasmo',
    'build'
  ]
}
