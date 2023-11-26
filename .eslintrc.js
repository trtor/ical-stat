module.exports = {
  parser: "@typescript-eslint/parser",
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier", "eslint-config-prettier"],
  plugins: ["@typescript-eslint", "prettier"],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
    project: "tsconfig.json",
  },
  env: {
    es6: true,
    node: true,
  },
  rules: {
    "no-var": "error",
    semi: "error",
    indent: ["error", 2, { SwitchCase: 1 }],
    "no-multi-spaces": "warn",
    "space-in-parens": "error",
    "prefer-const": "warn",
  },
};
