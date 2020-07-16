// https://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  env: {
    browser: true,
  },
  // https://github.com/standard/standard/blob/master/docs/RULES-en.md
  extends: ['plugin:vue/essential', '@vue/standard'],
  // required to lint *.vue files
  plugins: ['html'],
  // add your custom rules here
  rules: {
    // camelcase: [1, { properties: 'never' }],
    'spaced-comment': 'error',
    'space-before-function-paren': 0,
    'generator-star-spacing': 'off',
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
  },
  parserOptions: {
    parser: 'babel-eslint',
  },
}
