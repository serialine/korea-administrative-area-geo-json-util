module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    "airbnb-base",
    "plugin:prettier/recommended",
    "prettier/@typescript-eslint",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 12,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: ["@typescript-eslint"],
  settings: {
    "import/parsers": {
      "@typescript-eslint/parser": [".ts"],
    },
    "import/extensions": [".js", ".ts"],
    "import/resolver": {
      node: {
        extensions: [".js", ".ts", ".json", ".svg", ".gif", ".png"],
      },
    },
  },
  rules: {
    "import/prefer-default-export": "off",
    "import/extensions": "off",
  },
};
