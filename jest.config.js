export default {
  preset: "ts-jest",
  testEnvironment: "node",
  testRegex: ".*\\.test\\.ts$",
  extensionsToTreatAsEsm: [".ts"],
  transform: {
    "^.+\\.ts?$": ["ts-jest", { useESM: true, tsconfig: "tsconfig.jest.json" }],
  },
  moduleFileExtensions: ["ts", "js", "json", "node"],
  collectCoverageFrom: ["src/**/*.ts", "!src/**/*.d.ts", "!src/test.ts"],
  moduleDirectories: ["node_modules", "src"],
};
