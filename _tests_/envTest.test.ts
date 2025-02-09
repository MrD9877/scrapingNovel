import { testJest } from "../src/utility/awsBucket";

test("upload image to aws server", async () => {
  expect(await testJest()).toBe("webnovel-d");
});
