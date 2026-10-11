import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validate, mockStore } from "./store.js";
const example = JSON.parse(
  readFileSync(new URL("./openapi.json", import.meta.url)),
).paths["/api/messages"].post.requestBody.content["application/json"].example;
test("valid message round trip preserves metadata and apostrophes", async () => {
  const store = mockStore(":memory:");
  try {
    const body = { ...example, message: "Student's demo message" };
    assert.equal(validate(body), null);
    await store.insert(body);
    const [r] = await store.list();
    assert.equal(r.message, body.message);
    assert.deepEqual(r.info, body.info);
  } finally {
    store.close();
  }
});
test("missing fields and invalid timestamps are rejected", () => {
  assert.match(validate({ ...example, cardId: "" }), /cardId/);
  assert.match(
    validate({ ...example, statusTimestamp: "tomorrow" }),
    /statusTimestamp/,
  );
  assert.match(validate({ ...example, channelType: "UNKNOWN" }), /channelType/);
});
