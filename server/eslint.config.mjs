import { defineConfig, globalIgnores } from "eslint/config";

const eslintConfig = defineConfig([
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off"
    }
  },
  globalIgnores([
    // Default ignores of eslint-config-next:
    "out/**",
    "build/**",
  ]),
]);

export default eslintConfig;
