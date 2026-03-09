import neostandard from "neostandard";

export default [
  ...neostandard({
    ts: true,
    semi: true,
    noStyle: true,
    filesTs: ['src/**/*.ts', 'tests/**/*.ts'],
    ignores: ["node_modules/**", "dist/**", "coverage/**"],
  }),
  {
    rules: {
      "no-new": "off",
    },
  },
];
