const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const binary = path.join(root, "resources", "win", "bin", "rastercue-cpu.exe");
const models = path.join(root, "resources", "models");
const requireCpu = process.env.RASTERCUE_REQUIRE_CPU === "1";

test("CPU sidecar source is explicitly CPU-only and separately licensed", () => {
  const cmake = fs.readFileSync(path.join(root, "native/rastercue-cpu/CMakeLists.txt"), "utf8");
  const readme = fs.readFileSync(path.join(root, "native/rastercue-cpu/README.md"), "utf8");
  assert.match(cmake, /NCNN_VULKAN OFF/);
  assert.match(cmake, /NCNN_RUNTIME_CPU ON/);
  assert.match(readme, /does not replace or modify the protected Upscayl Vulkan executable/i);
  assert.ok(fs.existsSync(path.join(root, "native/rastercue-cpu/NIHUI-REALSRCNN-MIT.txt")));
});

test("native CPU probe proves NCNN inference without Vulkan", { skip: !fs.existsSync(binary) && !requireCpu }, () => {
  assert.ok(fs.existsSync(binary), "required rastercue-cpu.exe is missing");
  const result = spawnSync(binary, ["--probe-json"], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr);
  const probe = JSON.parse(result.stdout.trim());
  assert.equal(probe.backend, "cpu");
  assert.equal(probe.runtime, "ncnn");
  assert.equal(probe.vulkan, false);
  assert.ok(probe.threads > 0);
});

test("native CPU backend processes Standard, Digital Art and alpha safely", { skip: !fs.existsSync(binary) && !requireCpu }, async t => {
  assert.ok(fs.existsSync(binary), "required rastercue-cpu.exe is missing");
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "rastercue-cpu-test-"));
  t.after(() => { try { fs.rmSync(temp, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 }); } catch { /* Windows image handles can release after the test process exits. */ } });
  const cases = [
    { model: "upscayl-standard-4x", input: "standard.png", output: "standard-out.png", channels: 3 },
    { model: "digital-art-4x", input: "art.png", output: "art-out.webp", channels: 3 },
    { model: "upscayl-standard-4x", input: "alpha.png", output: "alpha-out.png", channels: 4 },
  ];
  for (const [index, item] of cases.entries()) {
    await sharp({ create: { width: 20 + index, height: 16 + index, channels: item.channels, background: item.channels === 4 ? { r: 120, g: 40, b: 220, alpha: 0.5 } : "#55aaff" } }).png().toFile(path.join(temp, item.input));
    const format = path.extname(item.output).slice(1);
    const result = spawnSync(binary, ["-i", path.join(temp, item.input), "-o", path.join(temp, item.output), "-m", models, "-n", item.model, "-s", "4", "-f", format, "-t", "32", "-j", "1:2:1"], { encoding: "utf8", timeout: 60_000 });
    assert.equal(result.status, 0, result.stderr);
    const metadata = await sharp(path.join(temp, item.output)).metadata();
    assert.equal(metadata.width, (20 + index) * 4);
    assert.equal(metadata.height, (16 + index) * 4);
    assert.equal(metadata.format, format === "jpg" ? "jpeg" : format);
    if (item.channels === 4) assert.equal(metadata.hasAlpha, true);
  }
});
