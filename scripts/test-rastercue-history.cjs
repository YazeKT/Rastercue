/* Additive observer tests; no GPU or engine changes required. */
const fs = require('fs');
const os = require('os');
const path = require('path');
const vm = require('vm');
const assert = require('assert/strict');
const { EventEmitter } = require('events');
const ts = require('typescript');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'rastercue-history-test-'));
const handlers = new Map();
const ipcMain = new EventEmitter();
ipcMain.handle = (channel, handler) => handlers.set(channel, handler);
const sent = [];
const frame = {};
const win = { once: () => {}, isDestroyed: () => false, webContents: { id: 42, mainFrame: frame, send: (...args) => sent.push(args) } };
const event = { sender: win.webContents, senderFrame: frame };
const electron = {
  app: { getPath: () => root }, ipcMain,
  nativeImage: { createFromPath: () => ({ isEmpty: () => false, getSize: () => ({ width: 10, height: 20 }), resize: () => ({ toPNG: () => Buffer.from('thumbnail') }) }) },
  shell: { openPath: async () => '' },
  dialog: { showOpenDialog: async () => ({ canceled: true, filePaths: [] }) },
};
const source = fs.readFileSync(path.join(__dirname, '../electron/rastercue-history.ts'), 'utf8');
const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2019, esModuleInterop: true } }).outputText;
const commandsSource = fs.readFileSync(path.join(__dirname, '../common/electron-commands.ts'), 'utf8');
const commandModule = { exports: {} };
vm.runInThisContext(`(function(require,module,exports){${ts.transpileModule(commandsSource, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText}\n})`)(require, commandModule, commandModule.exports);
const C = commandModule.exports.ELECTRON_COMMANDS;
const mod = { exports: {} };
const imageReader = () => ({ metadata: async () => ({ width: 10, height: 20 }), resize() { return this; }, png() { return this; }, toFile: async target => fs.promises.writeFile(target, 'thumbnail') });
vm.runInThisContext(`(function(require,module,exports){${js}\n})`)(id => id === 'electron' ? electron : id === 'sharp' ? imageReader : id === '../common/electron-commands' ? commandModule.exports : id === './utils/spawn-upscayl' ? { getComputeBackend: () => 'original-vulkan' } : id === './rastercue-archive' ? { chooseAndCreateArchive: async () => null, chooseAndRestoreArchive: async () => null } : id === './rastercue-support' ? { createSupportBundle: async () => null } : require(id), mod, mod.exports);
const api = (name, ...args) => handlers.get(`rastercue:${name}`)(event, ...args);
const sleep = () => new Promise(resolve => setTimeout(resolve, 20));
async function settled() {
  for (let i = 0; i < 100; i++) { const s = await api('list'); if (s.records[0]?.status !== 'running' && !mod.exports.isRastercueJobActive()) return s; await sleep(); }
  throw new Error('History finalisation timed out');
}
(async () => {
  mod.exports.registerRastercueHistory(win);
  for (const name of ['../source', 'CON', 'bad:name', 'trailing.', '', 'LPT1.jpg']) assert.throws(() => mod.exports.validateOutputName(name));
  assert.equal(mod.exports.validateOutputName('campaign hero'), 'campaign hero');
  assert.throws(() => handlers.get('rastercue:list')({ sender: { id: 9 }, senderFrame: frame }), /Untrusted/);
  const input = path.join(root, 'source.png');
  const output = path.join(root, 'source_upscayl_4x_test.jpg');
  fs.writeFileSync(input, 'original image'); fs.writeFileSync(output, 'upscaled image bytes');
  await api('setDesiredName', 'campaign');
  const payload = { imagePath: input, outputPath: root, model: 'test', scale: '4', saveImageAs: 'jpg', tileSize: 32, ttaMode: true };
  ipcMain.emit(C.UPSCAYL, event, payload);
  assert.equal(mod.exports.isRastercueJobActive(), true);
  win.webContents.send(C.UPSCAYL_PROGRESS, '50.0%');
  win.webContents.send(C.UPSCAYL_DONE, output);
  let state = await settled();
  const job = state.records[0]; const file = job.files[0];
  assert.equal(job.status, 'completed');
  assert.equal(job.settings.tileSize, 32); assert.equal(job.settings.ttaMode, true);
  assert.deepEqual(payload, { imagePath: input, outputPath: root, model: 'test', scale: '4', saveImageAs: 'jpg', tileSize: 32, ttaMode: true });
  assert.equal(sent.find(args => args[0] === C.UPSCAYL_DONE)[1], output, 'Original completion payload stays unchanged');
  assert.equal(file.output.path, path.join(root, 'campaign.jpg'));
  assert.equal(file.source.bytes, 14); assert.equal(file.output.bytes, 20);
  assert.equal(await api('getThumbnail', job.id, file.id, 'source'), `data:image/png;base64,${Buffer.from('thumbnail').toString('base64')}`);
  assert.equal(await api('getThumbnail', job.id, file.id, 'output'), `data:image/png;base64,${Buffer.from('thumbnail').toString('base64')}`);
  await assert.rejects(api('getThumbnail', job.id, file.id, 'invalid'), /Unsupported thumbnail kind/);
  assert.equal(fs.readFileSync(input, 'utf8'), 'original image');
  fs.writeFileSync(path.join(root, 'collision.jpg'), 'existing');
  await assert.rejects(api('rename', job.id, file.id, 'collision'), /EEXIST/);
  assert.equal(fs.readFileSync(path.join(root, 'collision.jpg'), 'utf8'), 'existing');
  await assert.rejects(api('rename', job.id, file.id, 'CON'), /filename/);
  await assert.rejects(api('rename', 'unknown', file.id, 'next'), /not found/);
  state = await api('rename', job.id, file.id, 'approved.jpg');
  assert.equal(state.records[0].files[0].output.path, path.join(root, 'approved.jpg'));
  assert.ok(fs.existsSync(path.join(root, 'history', 'history.json')));
  assert.ok(fs.existsSync(path.join(root, 'history', 'history.backup.json')));
  await assert.rejects(api('clear', false), /Confirm/);
  await api('clear', true);
  assert.ok(fs.existsSync(input)); assert.ok(fs.existsSync(path.join(root, 'approved.jpg')));
  assert.equal(JSON.parse(fs.readFileSync(path.join(root, 'history', 'history.backup.json'))).records.length, 0);
  ipcMain.emit(C.DOUBLE_UPSCAYL, event, payload);
  win.webContents.send(C.UPSCAYL_ERROR, 'engine failure');
  state = await settled(); assert.equal(state.records[0].status, 'failed');
  ipcMain.emit(C.UPSCAYL, event, payload);
  const beforeFlood = sent.filter(item => item[0] === 'rastercue:changed').length;
  for (let i = 0; i < 10000; i++) win.webContents.send(C.UPSCAYL_PROGRESS, `${i % 100}%`);
  assert.equal(sent.filter(item => item[0] === 'rastercue:changed').length, beforeFlood, 'History progress does not serialize snapshots per native tile');
  ipcMain.emit(C.STOP, event);
  assert.equal((await api('current')).status, 'cancelled', 'Stop is immediate after a progress flood');
  state = await settled(); assert.equal(state.records[0].status, 'cancelled');
  const batchInput = path.join(root, 'batch-input'); const batchOutput = path.join(root, 'upscayl_jpg_test_4x');
  fs.mkdirSync(batchInput); fs.mkdirSync(batchOutput);
  fs.writeFileSync(path.join(batchInput, 'a.png'), 'a'); fs.writeFileSync(path.join(batchInput, 'b.jfif'), 'bb');
  fs.writeFileSync(path.join(batchOutput, 'a.jpg'), 'AAAA'); fs.writeFileSync(path.join(batchOutput, 'b.jpg'), 'BBBBB');
  ipcMain.emit(C.FOLDER_UPSCAYL, event, { ...payload, batchFolderPath: batchInput });
  win.webContents.send(C.FOLDER_UPSCAYL_DONE, batchOutput);
  state = await settled();
  assert.equal(state.records[0].kind, 'batch'); assert.equal(state.records[0].files.length, 2);
  assert.equal(state.records[0].files.filter(f => f.output).length, 2);
  state = await api('rename', state.records[0].id, state.records[0].files[0].id, 'batch-approved');
  assert.ok(fs.existsSync(path.join(batchOutput, 'batch-approved.jpg')));
  const movedParent = path.join(root, 'moved'); fs.mkdirSync(movedParent);
  electron.dialog.showOpenDialog = async () => ({ canceled: false, filePaths: [movedParent] });
  state = await api('relocate');
  assert.equal(state.folder, path.join(movedParent, 'Rastercue-history'));
  assert.ok(fs.existsSync(path.join(root, 'history', 'history.json')), 'Relocation retains old history as recovery copy');
  assert.ok(fs.existsSync(path.join(state.folder, 'history.json')));
  assert.equal((await api('relocate')).folder, state.folder, 'Same-folder relocation is a safe no-op');
  const recovered = JSON.parse(fs.readFileSync(path.join(state.folder, 'history.json'), 'utf8'));
  recovered.records[0].status = 'running'; recovered.records[0].files[0].thumbnail = 'https://tracker.invalid/image.png';
  fs.writeFileSync(path.join(state.folder, 'history.backup.json'), JSON.stringify(recovered));
  fs.writeFileSync(path.join(state.folder, 'history.json'), '{broken json');
  const reloadedModule = { exports: {} };
  vm.runInThisContext(`(function(require,module,exports){${js}\n})`)(id => id === 'electron' ? electron : id === 'sharp' ? imageReader : id === '../common/electron-commands' ? commandModule.exports : id === './utils/spawn-upscayl' ? { getComputeBackend: () => 'original-vulkan' } : id === './rastercue-archive' ? { chooseAndCreateArchive: async () => null, chooseAndRestoreArchive: async () => null } : id === './rastercue-support' ? { createSupportBundle: async () => null } : require(id), reloadedModule, reloadedModule.exports);
  reloadedModule.exports.registerRastercueHistory(win);
  state = await api('list');
  assert.equal(state.records[0].status, 'interrupted', 'A recovered in-progress job must not be inferred successful');
  assert.ok(!state.records[0].files[0].thumbnail || !state.records[0].files[0].thumbnail.startsWith('https:'), 'Only local thumbnail URLs are restored');
  fs.unlinkSync(path.join(root, 'approved.jpg'));
  console.log('PASS Rastercue history: unchanged payloads, sizes, staged naming, ownership, collisions, invalid names, persistence/backup, clear safety, failure, cancellation, batch files/rename, relocation, backup recovery, crash interruption, local thumbnails.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  // Allow queued writes to settle before removing this exact test-owned directory.
  await new Promise(resolve => setTimeout(resolve, 150));
  fs.rmSync(root, { recursive: true, force: true });
});
