const test = require("node:test");
const assert = require("node:assert/strict");
const { readPercent, studioPhase } = require("../export/common/studio-progress.js");

test("legacy progress strings map to honest studio phases", () => {
  assert.equal(studioPhase("Hold on..."), "validate");
  assert.equal(studioPhase("Selecting Vulkan device"), "device");
  assert.equal(studioPhase("Loading model parameters"), "model");
  assert.equal(studioPhase("42.50%"), "upscale");
  assert.equal(studioPhase("Scaling and converting"), "encode");
  assert.equal(studioPhase("Verifying output"), "verify");
  assert.equal(readPercent("42.50%"), 42.5);
  assert.equal(readPercent("loading model"), null);
});
