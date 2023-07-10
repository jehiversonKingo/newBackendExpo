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
    "quotes": "off",
    "linebreak-style": 0,
    "import/no-unresolved": 0,
    "eol-last": 0,
    "@typescript-eslint/no-explicit-any": 0,
    'indent': 'off',
    "semi": 0,
    "max-len": ["error", { code: 300 }],
    "object-curly-spacing": "off",
    "spaced-comment": "off",
    "camelcase": "off",
    "keyword-spacing": "off",
    "space-before-blocks": "off",
    "quote-props": "off",
    "comma-dangle": "off",
    "array-bracket-spacing": "off",
    "no-trailing-spaces": "off",
    "no-dupe-keys": "off",
    "no-var": "off",
    "func-call-spacing": "off",
    "new-cap": "off",
  },
};
