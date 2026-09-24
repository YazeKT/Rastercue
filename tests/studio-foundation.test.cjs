const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');

function load(relative) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, require }, { filename: relative });
  return exports;
}

test('format registry exposes only the verified studio matrix', () => {
  const formats = load('common/format-capabilities.ts');
  for (const extension of ['png', 'jpg', 'jpeg', 'jfif', 'webp', 'avif', 'tif', 'tiff']) assert.equal(formats.isSupportedImport(extension), true, extension);
  for (const extension of ['psd', 'raw', 'heic', 'pdf', 'bmp']) assert.equal(formats.isSupportedImport(extension), false, extension);
  assert.deepEqual(Array.from(formats.EXPORT_FORMATS), ['png', 'jpg', 'webp', 'avif', 'tiff']);
});

test('known errors are actionable and unknown diagnostics redact paths', () => {
  const errors = load('common/rastercue-errors.ts');
  const known = errors.classifyRastercueError('vkAllocateMemory failed VK_ERROR_OUT_OF_DEVICE_MEMORY');
  assert.equal(known.code, 'RC-GPU-OUT-OF-MEMORY');
  assert.equal(known.confirmed, true);
  assert.ok(known.recovery.length >= 2);
  const unknown = errors.classifyRastercueError('Unexpected failure at C:\\Users\\Kirst\\Client\\secret.png', 'encode');
  assert.equal(unknown.code, 'RC-UNKNOWN-ENCODE');
  assert.equal(unknown.reportEligible, true);
  assert.doesNotMatch(errors.redactDiagnosticText(unknown.detail), /Kirst|secret\.png/);
});
