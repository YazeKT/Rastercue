const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');
function load(relative, stubs = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relative), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  vm.runInNewContext(code, { exports, URL, Map, Set, setTimeout, clearTimeout, require: id => {
    if (id in stubs) return stubs[id];
    throw new Error(`Unexpected import: ${id}`);
  } });
  return exports;
}
const commands = load('common/electron-commands.ts');
const policy = load('electron/utils/security-policy.ts', { '../../common/electron-commands': commands });
test('visual progress floods coalesce without delaying diagnostics or retaining detached listeners', async () => {
  const values = [];
  const delivery = load('electron/utils/progress-delivery.ts').progressDelivery((event, value) => { assert.equal(event, undefined); values.push(value); }, true);
  for (let i = 0; i < 10000; i++) delivery.receive({ privileged: true }, `${i % 100}%`);
  assert.equal(values.length, 0);
  await new Promise(resolve => setTimeout(resolve, 130));
  assert.deepEqual(values, ['99%']);
  delivery.receive({}, '25%');
  delivery.receive({}, 'vkAllocateMemory failed');
  assert.deepEqual(values.slice(-2), ['25%', 'vkAllocateMemory failed']);
  delivery.receive({}, '50%'); delivery.cancel();
  await new Promise(resolve => setTimeout(resolve, 130));
  assert.equal(values.length, 3);
});
test('external links only permit HTTPS without credentials', () => {
  assert.equal(policy.isSafeExternalURL('https://github.com/YazeKT'), true);
  for (const value of ['javascript:alert(1)', 'file:///C:/Windows/System32/cmd.exe', 'data:text/html,x', 'http://example.com', 'https://user:secret@example.com', 'not a url']) {
    assert.equal(policy.isSafeExternalURL(value), false, value);
  }
});
test('navigation only permits the application document and its hash', () => {
  const base = 'file:///C:/Rastercue/renderer/out/index.html';
  assert.equal(policy.isTrustedDocument(`${base}#inspect`, base), true);
  for (const value of ['https://example.com', 'file:///C:/private.html', `${base}?injected=true`]) assert.equal(policy.isTrustedDocument(value, base), false);
  assert.equal(policy.isTrustedDocument('http://localhost:8000/#inspect', 'http://localhost:8000'), true);
  assert.equal(policy.isTrustedDocument('http://localhost:8001/', 'http://localhost:8000'), false);
});
test('preload restricts channels and never sends Electron events into the renderer', () => {
  const bridges = {}, callbacks = {}, sent = [];
  const ipcRenderer = {
    send: (...args) => sent.push(args), invoke: async () => 'ok',
    on: (channel, listener) => { callbacks[channel] = listener; },
    removeListener: (channel, listener) => { if (callbacks[channel] === listener) delete callbacks[channel]; },
  };
  load('electron/preload.ts', {
    electron: { ipcRenderer, webUtils: { getPathForFile: file => file.testPath }, contextBridge: { exposeInMainWorld: (name, value) => { bridges[name] = value; } } },
    './utils/get-device-specs': { getPlatform: () => 'win', getAppVersion: async () => '1', getDeviceSpecs: async () => ({}) },
    './utils/security-policy': policy,
    './utils/progress-delivery': load('electron/utils/progress-delivery.ts'),
    '../common/electron-commands': commands,
  });
  assert.throws(() => bridges.electron.send('arbitrary-channel', {}), /Unsupported/);
  assert.throws(() => bridges.electron.invoke('rastercue:clear', true), /Unsupported/);
  assert.throws(() => bridges.electron.on('arbitrary-channel', () => {}), /Unsupported/);
  bridges.electron.send(commands.ELECTRON_COMMANDS.STOP);
  assert.equal(sent[0][0], commands.ELECTRON_COMMANDS.STOP);
  assert.equal(bridges.electron.getFilePath({ testPath: 'C:/image.png' }), 'C:/image.png');
  assert.equal(typeof bridges.rastercueHardware.detect, 'function');
  assert.equal(typeof bridges.rastercueHardware.software, 'function');
  const callback = (event, value) => { assert.equal(event, undefined); assert.equal(value, 'progress'); };
  bridges.electron.on(commands.ELECTRON_COMMANDS.LOG, callback);
  callbacks[commands.ELECTRON_COMMANDS.LOG]({ sender: { dangerous: true } }, 'progress');
  bridges.electron.off(commands.ELECTRON_COMMANDS.LOG, callback);
  assert.equal(callbacks[commands.ELECTRON_COMMANDS.LOG], undefined);
});

test('built-in availability requires both real files and only reads known model IDs', () => {
  const models = load('common/models-list.ts');
  const checked = [];
  const available = load('electron/utils/model-availability.ts', {
    fs: { statSync: filename => {
      checked.push(filename);
      if (filename.endsWith('upscayl-standard-4x.bin') || filename.endsWith('upscayl-standard-4x.param')) return { isFile: () => true };
      if (filename.endsWith('digital-art-4x.bin')) return { isFile: () => true };
      if (filename.endsWith('digital-art-4x.param')) return { isFile: () => false };
      throw new Error('missing');
    } }, path, '../../common/models-list': models,
  }).builtInModelAvailability('C:/bundled/models');
  assert.equal(available['upscayl-standard-4x'], true);
  assert.equal(available['digital-art-4x'], false);
  assert.equal(available['upscayl-lite-4x'], false);
  assert.equal(Object.keys(available).length, 7);
  assert.equal(checked.every(filename => filename.startsWith(path.join('C:/bundled/models', ''))), true);
});
