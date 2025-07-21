module.exports = {
  root: true,
  extends: ["next", "next/core-web-vitals", "eslint:recommended", "plugin:@typescript-eslint/recommended"],
  plugins: ["@typescript-eslint"],
  rules: {
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "warn",
    "@typescript-eslint/no-unused-vars": "warn",
    "@next/next/no-img-element": "off"
  }
};
