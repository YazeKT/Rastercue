const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const vm = require('node:vm');

function load(relative, stubs = {}) {
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(path.join(__dirname, '..', relative), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true, target: ts.ScriptTarget.ES2020 } }).outputText;
  vm.runInNewContext(code, { exports, Map, Set, URL, require: id => id in stubs ? stubs[id] : require(id) });
  return exports;
}

const detection = load('electron/utils/hardware-detection.ts', { os: { cpus: () => [{ model: ' Test CPU ' }, { model: ' Test CPU ' }], arch: () => 'x64' } });

test('engine probe reports only devices that the unchanged Vulkan engine initialized', () => {
  const output = `[0 AMD Radeon RX 580]  queueC=0[1]\n[0 AMD Radeon RX 580]  fp16-p/s/a=1/1/1  int8-p/s/a=1/1/1\n[0 AMD Radeon RX 580]  subgroup=64 basic=1\nError: Invalid GPU Device`;
  const devices = detection.parseEngineProbeOutput(output);
  assert.equal(devices.length, 1);
  assert.equal(devices[0].id, '0');
  assert.equal(devices[0].vendor, 'amd');
  assert.equal(devices[0].capabilities.fp16, '1/1/1');
  assert.equal(devices[0].capabilities.subgroupSize, 64);
});

test('Windows adapters retain detected hardware separately from engine compatibility', () => {
  const adapters = detection.parseWindowsAdapters(JSON.stringify([
    { Name: 'Intel(R) UHD Graphics', AdapterRAM: 2147483648, DriverVersion: '31.0', PNPDeviceID: 'PCI\\VEN_8086', Status: 'OK' },
    { Name: 'NVIDIA GeForce RTX 4060', AdapterRAM: 4293918720, DriverVersion: '32.0', PNPDeviceID: 'PCI\\VEN_10DE', Status: 'OK' },
  ]));
  assert.equal(Array.from(adapters, item => item.vendor).join(','), 'intel,nvidia');
  assert.equal(adapters[0].active, true);
  assert.equal(adapters[1].driverVersion, '32.0');
});

test('vendor matching is explicit and unknown devices stay unknown', () => {
  assert.equal(detection.hardwareVendor('Advanced Micro Devices Radeon'), 'amd');
  assert.equal(detection.hardwareVendor('PCI VEN_10DE'), 'nvidia');
  assert.equal(detection.hardwareVendor('Mystery Adapter'), 'unknown');
});

test('compute paths are available only after their own probes', () => {
  const backends = detection.computeBackends('available', 'Original engine probe passed.', [{ id: '0' }]);
  assert.equal(backends.find(item => item.id === 'original-vulkan').availability, 'available');
  assert.equal(backends.find(item => item.id === 'cpu').availability, 'unavailable');
  assert.match(backends.find(item => item.id === 'cpu').reason, /CPU inference runtime/);
  assert.equal(backends.find(item => item.id === 'rastercue-vulkan').availability, 'unavailable');
  const cpuReady = detection.computeBackends('unavailable', 'No Vulkan device.', [], 'available', 'Native CPU probe passed.');
  assert.equal(cpuReady.find(item => item.id === 'cpu').availability, 'available');
  assert.deepEqual(Array.from(cpuReady.find(item => item.id === 'cpu').deviceIds), ['cpu']);
});

test('physical core detection rejects empty and malformed command output', () => {
  assert.equal(detection.parsePhysicalCoreCount('8\r\n'), 8);
  assert.equal(detection.parsePhysicalCoreCount(''), null);
  assert.equal(detection.parsePhysicalCoreCount('unknown'), null);
});
