/* Read-only provenance audit: NCNN FP16 weights against creator NCNN FP32 weights.
 * Usage: node scripts/audit-model-fp16.cjs LOCAL.bin LOCAL.param CREATOR.bin.url CREATOR.param.url
 * Does not convert, replace or execute model files. Requires Node 22+.
 */
const fs = require("node:fs");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const scratch = new DataView(new ArrayBuffer(4));
function halfBits(value) {
  scratch.setFloat32(0, value, false);
  const bits = scratch.getUint32(0, false);
  const sign = (bits >>> 16) & 0x8000;
  const exponent = ((bits >>> 23) & 255) - 127;
  const mantissa = bits & 0x7fffff;
  if (exponent === 128) return sign | 0x7c00 | (mantissa ? 0x200 : 0);
  if (exponent > 15) return sign | 0x7c00;
  if (exponent < -25) return sign;
  const significand = mantissa | 0x800000;
  const shift = exponent < -14 ? -exponent - 1 : 13;
  const divisor = 2 ** shift;
  let rounded = Math.floor(significand / divisor);
  const remainder = significand % divisor;
  if (remainder > divisor / 2 || (remainder === divisor / 2 && rounded % 2)) rounded++;
  return sign | (exponent < -14 ? rounded : ((exponent + 14) * 1024 + rounded));
}
const normalize = (text) => text.trim().replace(/\r/g, "")
  .replace(/\binput\.1\b/g, "input").replace(/\bdata\b/g, "input").replace(/\s+/g, " ");
const blob = (bytes) => crypto.createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex");
async function fetchBytes(url) {
  assert.match(url, /^https:\/\//);
  const response = await fetch(url, { signal: AbortSignal.timeout(180000) });
  assert.equal(response.ok, true, `Creator fetch failed: ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}
(async () => {
  const [binPath, paramPath, binUrl, paramUrl] = process.argv.slice(2);
  assert.ok(binPath && paramPath && binUrl && paramUrl, "Supply four arguments; see script header.");
  const local = fs.readFileSync(binPath), param = fs.readFileSync(paramPath, "utf8");
  const [creator, creatorParam] = await Promise.all([fetchBytes(binUrl), fetchBytes(paramUrl)]);
  assert.equal(normalize(param), normalize(creatorParam.toString("utf8")), "Unexpected parameter/graph changes");
  let localOffset = 0, creatorOffset = 0, weights = 0, biases = 0;
  for (const line of param.split(/\r?\n/).filter((line) => /^Convolution\s/.test(line))) {
    const fields = Object.fromEntries([...line.matchAll(/ (\d+)=([^ ]+)/g)].map((match) => [match[1], match[2]]));
    const count = +fields[6], outputs = +fields[0];
    assert.equal(local.readUInt32LE(localOffset), 0x01306b47, "Local tensor must be NCNN FP16");
    assert.equal(creator.readUInt32LE(creatorOffset), 0, "Creator tensor must be NCNN FP32");
    localOffset += 4; creatorOffset += 4;
    for (let index = 0; index < count; index++) {
      assert.equal(local.readUInt16LE(localOffset + index * 2), halfBits(creator.readFloatLE(creatorOffset + index * 4)), `Weight ${weights + index} differs`);
    }
    weights += count;
    localOffset += Math.ceil(count * 2 / 4) * 4; creatorOffset += count * 4;
    if (+fields[5]) {
      assert.ok(local.subarray(localOffset, localOffset + outputs * 4).equals(creator.subarray(creatorOffset, creatorOffset + outputs * 4)), "Biases differ");
      localOffset += outputs * 4; creatorOffset += outputs * 4; biases += outputs;
    }
  }
  assert.equal(localOffset, local.length, "Unverified local trailing tensors");
  assert.equal(creatorOffset, creator.length, "Unverified creator trailing tensors");
  console.log(JSON.stringify({ verified: true, weights, biases, localBlob: blob(local), creatorBlob: blob(creator), modification: "FP32 convolution weights rounded to IEEE FP16; FP32 biases unchanged; input names/whitespace adapted" }, null, 2));
})().catch((error) => { console.error(error.message); process.exitCode = 1; });
