const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');

function loadArchive() {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(root, 'electron/rastercue-archive.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true } }).outputText;
  const localRequire = id => id === 'electron' ? { dialog: {}, BrowserWindow: class {} } : require(id);
  vm.runInNewContext(code, { exports, require: localRequire, process, Buffer, console, setTimeout, clearTimeout, __dirname: path.join(root, 'electron') }, { filename: 'electron/rastercue-archive.ts' });
  return exports;
}

test('rastercue archive preserves exact source and output bytes', async () => {
  const api = loadArchive();
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), 'rastercue-archive-test-'));
  const source = path.join(temp, 'source.png'), output = path.join(temp, 'output.png');
  fs.writeFileSync(source, crypto.randomBytes(2048)); fs.writeFileSync(output, crypto.randomBytes(4096));
  const job = { id: crypto.randomUUID(), kind: 'single', status: 'completed', startedAt: new Date().toISOString(), endedAt: new Date().toISOString(), model: 'test-model', scale: '4', destination: temp, settings: { ppi: 300 }, warnings: [], progress: 'Completed', files: [{ id: crypto.randomUUID(), source: { path: source, bytes: 2048, width: 1, height: 1, missing: false }, output: { path: output, bytes: 4096, width: 4, height: 4, missing: false } }] };
  const archive = path.join(temp, 'job.rastercue');
  const manifest = await api.createRastercueArchive(job, archive);
  assert.equal(manifest.payloads.length, 2);
  const restore = path.join(temp, 'restore');
  const restored = await api.restoreRastercueArchive(archive, restore);
  assert.equal(restored.restored.length, 2);
  assert.deepEqual(fs.readFileSync(path.join(restore, 'source', 'source.png')), fs.readFileSync(source));
  assert.deepEqual(fs.readFileSync(path.join(restore, 'output', 'output.png')), fs.readFileSync(output));
  await assert.rejects(() => api.restoreRastercueArchive(archive, restore), /overwrite/i);
  fs.rmSync(temp, { recursive: true, force: true });
});
