module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    jest: true,
    node: true
  },
  extends: [
    "airbnb-base",
    "eslint:recommended"
  ],
  parserOptions: {
    ecmaVersion: 12
  },
  rules: {
    "arrow-parens": ["error", "as-needed"],
    "comma-dangle": 0,
    "consistent-return": "off",
    indent: "off",
    "no-await-in-loop": "off",
    "no-console": "off",
    "no-plusplus": "off",
    "no-restricted-syntax": "off",
    "no-shadow": "off",
    "no-use-before-define": "off",
    "no-var": "off",
    "object-curly-newline": ["error", { consistent: true }],
    "operator-linebreak": "off",
    quotes: ["error", "double"],
    "vars-on-top": "off",
  }
};
