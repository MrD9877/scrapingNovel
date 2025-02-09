/** @type {import('ts-jest').JestConfigWithTsJest} **/
// export default {
//   preset: "ts-jest",
//   testEnvironment: "node",
//   transform: {
//     "^.+.tsx?$": ["ts-jest", {}],
//   },
// };
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  transform: {
    "^.+\\.tsx?$": "ts-jest",
  },
};
