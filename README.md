# JEST

```
npm install --save-dev jest ts-jest @types/jest

```

## CONFIG

```
npx ts-jest config:init
```

```
/** @type {import('ts-jest').JestConfigWithTsJest} **/
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+.tsx?$": ["ts-jest", {}],
  },
};

```

## EXAMPLE

_test_/math.test.ts

```
import { add } from "../src/utility/awsBucket";

test("adds 1 + 2 to equal 3", () => {
  expect(add(1, 2)).toBe(3);
});

```

### Script

```
"scripts": {
  "test": "jest"
}
```

### Run

```
npm test
```
