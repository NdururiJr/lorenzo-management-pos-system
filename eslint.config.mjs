import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  {
    rules: {
      // Make unused variables a warning instead of error
      "@typescript-eslint/no-unused-vars": ["warn", {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      }],
      // Disable unescaped entities rule (common in content)
      "react/no-unescaped-entities": "off",
      // Make explicit any a warning instead of error
      "@typescript-eslint/no-explicit-any": "warn",
      // Make React hooks exhaustive deps a warning
      "react-hooks/exhaustive-deps": "warn",
      // Allow img tags (Next.js Image not always needed)
      "@next/next/no-img-element": "warn",
      // Allow console logs (will be removed in production by next.config.ts)
      "no-console": "off",
    },
  },
];

export default eslintConfig;
