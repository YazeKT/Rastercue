/** Direct bundled-engine smoke, not a substitute for packaged IPC/UI testing. */
const fs = require("node:fs");
const path = require("node:path");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const sharp = require("sharp");
const root = path.resolve(__dirname, "..");
const dir = path.join(__dirname, "artifacts", `engine-${Date.now()}`);
const platform =
  process.platform === "win32"
    ? "win"
    : process.platform === "darwin"
      ? "mac"
      : "linux";
const binary = path.join(
  root,
  "resources",
  platform,
  "bin",
  platform === "win" ? "upscayl-bin.exe" : "upscayl-bin",
);
const models = path.join(root, "resources/models");
const input = path.join(__dirname, "baseline-input.png");
const results = [];
function run(
  input,
  output,
  extra = [],
  model = "upscayl-lite-4x",
  modelDir = models,
) {
  return new Promise((resolve, reject) => {
    const args = [
      "-i",
      input,
      "-o",
      output,
      "-m",
      modelDir,
      "-n",
      model,
      "-f",
      output.endsWith(".jpg") ? "jpg" : "png",
      "-c",
      "0",
      ...extra,
    ];
    const child = spawn(binary, args, { cwd: root, windowsHide: true });
    let log = "";
    child.stderr.on("data", (data) => {
      log += data;
    });
    child.stdout.on("data", (data) => {
      log += data;
    });
    const timer = setTimeout(() => {
      child.kill();
      reject(new Error("Engine smoke timeout"));
    }, 90000);
    child.on("error", reject);
    child.on("close", (code) => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`Engine exit ${code}: ${log}`));
      else resolve({ args, log });
    });
  });
}
async function record(name, file, width, height, runResult) {
  const meta = await sharp(file).metadata();
  assert.equal(meta.width, width);
  assert.equal(meta.height, height);
  results.push({
    name,
    file,
    width,
    height,
    bytes: fs.statSync(file).size,
    args: runResult.args,
  });
  fs.writeFileSync(path.join(dir, `${name}.log`), runResult.log);
}
(async () => {
  fs.mkdirSync(dir, { recursive: true });
  const single = path.join(dir, "single.png");
  await record("single", single, 256, 192, await run(input, single));
  const baseline = await sharp(path.join(__dirname, "baseline-output.png"))
    .raw()
    .toBuffer();
  const actual = await sharp(single).raw().toBuffer();
  assert(
    actual.equals(baseline),
    "single decoded pixels differ from original baseline",
  );
  results[0].baselinePixelsIdentical = true;
  const jpg = path.join(dir, "single.jpg");
  await record("jpg", jpg, 256, 192, await run(input, jpg));
  const batchIn = path.join(dir, "batch-input"),
    batchOut = path.join(dir, "batch-output");
  fs.mkdirSync(batchIn);
  fs.mkdirSync(batchOut);
  fs.copyFileSync(input, path.join(batchIn, "first.png"));
  fs.copyFileSync(input, path.join(batchIn, "second.png"));
  const batch = await run(batchIn, batchOut);
  const outputs = fs
    .readdirSync(batchOut)
    .filter((file) => file.endsWith(".png"));
  assert.equal(outputs.length, 2);
  for (const file of outputs)
    await record(
      `batch-${path.parse(file).name}`,
      path.join(batchOut, file),
      256,
      192,
      batch,
    );
  const double = path.join(dir, "double.png");
  await run(input, double);
  await record("double", double, 1024, 768, await run(double, double));
  const custom = path.join(dir, "custom.png");
  // The direct CLI defaults to 4x even for this x2 filename; request 2x explicitly.
  await record(
    "custom",
    custom,
    128,
    96,
    await run(
      input,
      custom,
      ["-s", "2"],
      "realesr-animevideov3-x2",
      path.join(root, "../custom-models-main/models"),
    ),
  );
  const customJpg = path.join(dir, "custom.jpg");
  await record(
    "custom-jpg",
    customJpg,
    128,
    96,
    await run(
      input,
      customJpg,
      ["-s", "2"],
      "realesr-animevideov3-x2",
      path.join(root, "../custom-models-main/models"),
    ),
  );
  const cancelInput = path.join(dir, "cancel-input.png");
  await sharp({
    create: { width: 1600, height: 1200, channels: 3, background: "#a5a0ff" },
  })
    .png()
    .toFile(cancelInput);
  const cancelled = await new Promise((resolve, reject) => {
    const child = spawn(
      binary,
      [
        "-i",
        cancelInput,
        "-o",
        path.join(dir, "cancelled.png"),
        "-m",
        models,
        "-n",
        "upscayl-standard-4x",
        "-f",
        "png",
      ],
      { windowsHide: true },
    );
    let log = "";
    child.stderr.on("data", (data) => {
      log += data;
    });
    const stop = setTimeout(() => child.kill(), 200);
    child.on("error", reject);
    child.on("close", (code, signal) => {
      clearTimeout(stop);
      resolve({
        name: "cancel",
        code,
        signal,
        stopped: code !== 0 || signal !== null,
        log,
      });
    });
  });
  assert(cancelled.stopped, "cancellation did not terminate engine");
  fs.writeFileSync(path.join(dir, "cancel.log"), cancelled.log);
  delete cancelled.log;
  results.push(cancelled);
  fs.writeFileSync(
    path.join(dir, "results.json"),
    JSON.stringify(results, null, 2),
  );
  console.log(JSON.stringify({ artifacts: dir, results }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
