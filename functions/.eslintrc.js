module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "google",
  ],
  rules: {
    "linebreak-style": ["error", "unix"],
    "max-len": ["error", { "code": 120 }],
    "quotes": ["error", "double"],
    "indent": ["error", 2],
    "comma-dangle": ["error", "always-multiline"],
    "object-curly-spacing": ["error", "always"],
    "no-trailing-spaces": "error",
    "padded-blocks": ["error", "never"],
    "valid-jsdoc": "off",
    "no-unused-vars": "warn",
  },
  parserOptions: {
    ecmaVersion: 2018,
  },
};
