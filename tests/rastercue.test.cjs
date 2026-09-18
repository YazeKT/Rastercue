const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const vm = require("node:vm");
const ts = require("typescript");
const root = path.resolve(__dirname, "..");
function load(relative, stubs = {}) {
  const exports = {};
  const code = ts.transpileModule(
    fs.readFileSync(path.join(root, relative), "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS } },
  ).outputText;
  vm.runInNewContext(
    code,
    {
      exports,
      require: (id) => {
        if (id in stubs) return stubs[id];
        throw new Error(`Unexpected dependency: ${id}`);
      },
    },
    { filename: relative },
  );
  return exports;
}
const models = load("common/models-list.ts").MODELS;
const catalogue = load("common/model-catalog.ts");
const nativeScale = load("common/check-model-scale.ts").default;
const args = load("electron/utils/get-arguments.ts", {
  "../../common/check-model-scale": { default: nativeScale, __esModule: true },
  "./get-device-specs": { getPlatform: () => "win" },
});
const normal = (array) => Array.from(array).filter(Boolean);
const options = {
  inputDir: "C:\\input",
  fileNameWithExt: "sample.png",
  fullfileName: "sample.png",
  outFile: "C:\\output\\result.png",
  outputDir: "C:\\output",
  modelsPath: "C:\\models",
  model: "upscayl-lite-4x",
  scale: "4",
  gpuId: "",
  saveImageAs: "png",
  customWidth: "",
  tileSize: null,
  compression: "0",
  ttaMode: false,
};

test("all protected processing code, native binaries and built-in models retain baseline SHA-256", () => {
  const baseline = JSON.parse(
    fs.readFileSync(path.join(__dirname, "engine-baseline.json")),
  );
  assert.equal(baseline.files.length, 28);
  for (const file of baseline.files) {
    const content = fs.readFileSync(path.join(root, file.path));
    const actual = crypto
      .createHash("sha256")
      .update(content)
      .digest("hex");
    assert.equal(actual, file.sha256, file.path);
  }
});
test("catalogue has 7 built-in and all 14 local custom entries without changing engine IDs", () => {
  assert.equal(Object.keys(models).length, 7);
  assert.equal(catalogue.MODEL_CATALOG.length, 21);
  assert.equal(new Set(catalogue.MODEL_CATALOG.map((m) => m.id)).size, 21);
  const customFolder = path.join(root, "../custom-models-main/models");
  const local = fs.existsSync(customFolder) ? fs
    .readdirSync(customFolder)
    .filter((f) => f.endsWith(".param"))
    .map((f) => f.slice(0, -6)) : catalogue.MODEL_CATALOG.filter(model => !(model.id in models)).map(model => model.id);
  assert.equal(local.length, 14);
  for (const id of [...Object.keys(models), ...local])
    assert(
      catalogue.MODEL_CATALOG.some((m) => m.id === id),
      id,
    );
});
test("model rights and unknown provenance are not represented as commercially cleared", () => {
  for (const id of ["remacri-4x", "ultramix-balanced-4x", "ultrasharp-4x"])
    assert(catalogue.getModelGuide(id).rights.startsWith("NON-COMMERCIAL"));
  assert.equal(catalogue.getModelGuide("unknown-2.0.1").creator, "Unknown");
  const unknown = catalogue.getModelGuide("new-import-x2");
  assert.match(unknown.evidence, /unverified/);
  assert.match(unknown.rights, /unverified/);
  for (const model of catalogue.MODEL_CATALOG)
    assert(model.sources.length && model.avoid && model.performance);
});
test("native scale detection preserves original filename policy", () => {
  assert.equal(nativeScale("realesr-animevideov3-x2"), "2");
  assert.equal(nativeScale("realesr-animevideov3-x3"), "3");
  assert.equal(nativeScale("upscayl-lite-4x"), "4");
  assert.equal(nativeScale("unknown-2.0.1"), "4");
});
test("single submission arguments retain original ordering and omission of native scale", () => {
  assert.deepEqual(normal(args.getSingleImageArguments(options)), [
    "-i",
    "C:\\input\\sample.png",
    "-o",
    options.outFile,
    "-m",
    options.modelsPath,
    "-n",
    options.model,
    "-f",
    "png",
    "-c",
    "0",
  ]);
  const custom = {
    ...options,
    scale: "2",
    gpuId: "1",
    saveImageAs: "jpg",
    customWidth: "800",
    tileSize: 128,
    compression: "80",
    ttaMode: true,
  };
  assert.deepEqual(normal(args.getSingleImageArguments(custom)), [
    "-i",
    "C:\\input\\sample.png",
    "-o",
    options.outFile,
    "-m",
    options.modelsPath,
    "-n",
    options.model,
    "-g",
    "1",
    "-f",
    "jpg",
    "-w",
    "800",
    "-c",
    "80",
    "-t",
    "128",
    "-x",
  ]);
  assert(
    normal(args.getSingleImageArguments({ ...options, scale: "2" })).includes(
      "-s",
    ),
  );
});
test("batch and double-pass argument contracts retain processing semantics", () => {
  assert.deepEqual(normal(args.getBatchArguments(options)), [
    "-i",
    options.inputDir,
    "-o",
    options.outputDir,
    "-m",
    options.modelsPath,
    "-n",
    options.model,
    "-f",
    "png",
    "-c",
    "0",
  ]);
  assert.deepEqual(normal(args.getDoubleUpscaleArguments(options)), [
    "-i",
    "C:\\input\\sample.png",
    "-o",
    options.outFile,
    "-m",
    options.modelsPath,
    "-n",
    options.model,
    "-f",
    "png",
  ]);
  assert.deepEqual(normal(args.getDoubleUpscaleSecondPassArguments(options)), [
    "-i",
    options.outFile,
    "-o",
    options.outFile,
    "-m",
    options.modelsPath,
    "-n",
    options.model,
    "-f",
    "png",
    "-c",
    "0",
  ]);
});
test("renderer submission retains legacy payload fields and value conversions", () => {
  const source = ts.createSourceFile(
    "sidebar.tsx",
    fs.readFileSync(
      path.join(root, "renderer/components/sidebar/index.tsx"),
      "utf8",
    ),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  const payloads = new Map();
  function visit(node) {
    if (
      ts.isCallExpression(node) &&
      node.expression.getText(source) === "window.electron.send" &&
      node.arguments[1] &&
      ts.isObjectLiteralExpression(node.arguments[1])
    ) {
      const channel = node.arguments[0].getText(source);
      if (
        [
          "ELECTRON_COMMANDS.UPSCAYL",
          "ELECTRON_COMMANDS.DOUBLE_UPSCAYL",
          "ELECTRON_COMMANDS.FOLDER_UPSCAYL",
        ].includes(channel)
      )
        payloads.set(channel, node.arguments[1]);
    }
    ts.forEachChild(node, visit);
  }
  visit(source);
  const common = [
    "outputPath",
    "model",
    "gpuId",
    "saveImageAs",
    "scale",
    "noImageProcessing",
    "compression",
    "customWidth",
    "useCustomWidth",
    "tileSize",
    "ttaMode",
    "copyMetadata",
  ];
  for (const [channel, input, extra] of [
    ["ELECTRON_COMMANDS.UPSCAYL", "imagePath", ["overwrite"]],
    ["ELECTRON_COMMANDS.DOUBLE_UPSCAYL", "imagePath", []],
    ["ELECTRON_COMMANDS.FOLDER_UPSCAYL", "batchFolderPath", []],
  ]) {
    const payload = payloads.get(channel);
    assert(payload, channel);
    assert.deepEqual(
      payload.properties.map((p) => p.name.getText(source)).sort(),
      [...common, input, ...extra].sort(),
    );
    const values = Object.fromEntries(
      payload.properties
        .filter(ts.isPropertyAssignment)
        .map((p) => [p.name.getText(source), p.initializer.getText(source)]),
    );
    assert.equal(values.model, "selectedModelId");
    assert.equal(values.gpuId, "gpuId.length === 0 ? null : gpuId");
    assert.equal(values.compression, "compression.toString()");
    assert.equal(
      values.customWidth,
      "customWidth > 0 ? customWidth.toString() : null",
    );
  }
});
