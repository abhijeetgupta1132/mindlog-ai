const test = require("node:test");
const assert = require("node:assert/strict");
const { validateJournalInput } = require("../validation");

test("accepts a complete journal entry", () => {
  assert.equal(
    validateJournalInput({ userId: "123", ambience: "forest", text: "A calm day" }),
    null,
  );
});

test("rejects missing fields", () => {
  assert.equal(
    validateJournalInput({ userId: "123", ambience: "forest", text: "" }),
    "userId, ambience, and text are required.",
  );
});

test("rejects unsupported ambience", () => {
  assert.match(
    validateJournalInput({ userId: "123", ambience: "city", text: "A busy day" }),
    /ambience must be one of/,
  );
});

test("rejects journal text shorter than five characters", () => {
  assert.equal(
    validateJournalInput({ userId: "123", ambience: "ocean", text: "hey" }),
    "text is too short.",
  );
});
