const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const crypto = require('node:crypto');
const ts = require('typescript');
const sharp = require('sharp');

function loadAdapter() {
  const filename = path.resolve(__dirname, '../electron/utils/prepare-engine-io.ts');
  const source = fs.readFileSync(filename, 'utf8');
  const code = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText;
  const mod = { exports: {} };
  vm.runInNewContext(`(function(require,module,exports){${code}\n})`, { require, process, Buffer, console, setTimeout, clearTimeout })(require, mod, mod.exports);
  return mod.exports.prepareEngineIO;
}

const sha256 = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');

for (const format of ['avif', 'tiff']) test(`bounded adapter preserves TIFF input and creates readable ${format.toUpperCase()} output`, async () => {
  const folder = fs.mkdtempSync(path.join(os.tmpdir(), 'rastercue-format-'));
  const input = path.join(folder, 'source.tiff');
  const output = path.join(folder, `result.${format}`);
  await sharp({ create: { width: 16, height: 12, channels: 4, background: { r: 40, g: 80, b: 120, alpha: .5 } } }).tiff().toFile(input);
  const before = sha256(input);
  const prepareEngineIO = loadAdapter();
  const prepared = await prepareEngineIO(['-i', input, '-o', output, '-f', format], () => {});
  assert.equal(path.extname(prepared.args[prepared.args.indexOf('-i') + 1]), '.png');
  assert.equal(prepared.args[prepared.args.indexOf('-f') + 1], 'png');
  const workingOutput = prepared.args[prepared.args.indexOf('-o') + 1];
  await sharp({ create: { width: 32, height: 24, channels: 3, background: '#5965d8' } }).png().toFile(workingOutput);
  await prepared.finalize();
  const metadata = await sharp(output).metadata();
  assert.equal(metadata.width, 32);
  assert.equal(metadata.height, 24);
  assert.equal(metadata.format, format === 'avif' ? 'heif' : format);
  assert.equal(sha256(input), before, 'source bytes must remain unchanged');
  await prepared.cleanup();
  assert.equal(fs.existsSync(workingOutput), false, 'bounded temporary directory is removed');
  fs.rmSync(folder, { recursive: true, force: true });
});
