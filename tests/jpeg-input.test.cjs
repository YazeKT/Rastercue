const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const os = require('node:os');
const vm = require('node:vm');
const sharp = require('sharp');
const ts = require('typescript');
async function load() {
  const filename = path.resolve(__dirname, '../electron/utils/prepare-jpeg-input.ts');
  const code = ts.transpileModule(await fs.readFile(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require }, { filename });
  return exports.prepareJpegInput;
}
const command = input => ['-i', input, '-o', 'result.jpg', '-f', 'jpg', '-n', 'upscayl-standard-4x'];
test('JPEG compatibility preserves opaque RGBA RGB values and original bytes', async () => {
  const prepare = await load();
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'rastercue-test-jpeg-'));
  let result;
  try {
    const source = path.join(folder, 'opaque.png');
    const rgba = Buffer.from([12, 80, 230, 255, 210, 51, 27, 255]);
    await sharp(rgba, {raw: {width:2,height:1,channels:4}}).png().toFile(source);
    const original = await fs.readFile(source);
    result = await prepare(command(source), () => {});
    const temporary = result.args[1];
    assert.notEqual(temporary, source);
    const decoded = await sharp(temporary).raw().toBuffer({resolveWithObject:true});
    assert.equal(decoded.info.channels, 3);
    assert.deepEqual(decoded.data, Buffer.from([12,80,230,210,51,27]));
    assert.deepEqual(await fs.readFile(source), original);
    await result.cleanup();
    await assert.rejects(fs.access(temporary));
  } finally { await result?.cleanup(); await fs.rm(folder,{recursive:true,force:true}); }
});
test('transparent pixels flatten to the disclosed white background', async () => {
  const prepare = await load();
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'rastercue-test-jpeg-'));
  let result;
  try {
    const source = path.join(folder, 'alpha.png');
    await sharp(Buffer.from([255,0,0,0]), {raw:{width:1,height:1,channels:4}}).png().toFile(source);
    result = await prepare(command(source), () => {});
    assert.deepEqual(await sharp(result.args[1]).raw().toBuffer(), Buffer.from([255,255,255]));
  } finally { await result?.cleanup(); await fs.rm(folder,{recursive:true,force:true}); }
});
test('non-JPEG commands remain untouched and never inspect nonexistent inputs', async () => {
  const prepare = await load();
  const args = ['-i','not-an-existing-file','-o','result.png','-f','png'];
  const result = await prepare(args, () => {});
  assert.deepEqual(Array.from(result.args), args);
  await result.cleanup();
});
test('mixed JPEG batch keeps filenames, RGB originals, sources and cleans temporary folder', async () => {
  const prepare = await load();
  const folder = await fs.mkdtemp(path.join(os.tmpdir(), 'rastercue-test-jpeg-'));
  let result;
  try {
    const alpha = path.join(folder,'alpha.png'), rgb = path.join(folder,'rgb.jpg');
    await sharp({create:{width:2,height:2,channels:4,background:'#a5a0ff'}}).png().toFile(alpha);
    await sharp({create:{width:2,height:2,channels:3,background:'#a5a0ff'}}).jpeg().toFile(rgb);
    const originals = [await fs.readFile(alpha), await fs.readFile(rgb)];
    result = await prepare(command(folder), () => {});
    const temporary = result.args[1];
    assert.notEqual(temporary,folder);
    assert.deepEqual((await fs.readdir(temporary)).sort(), ['alpha.png','rgb.jpg']);
    assert.equal((await sharp(path.join(temporary,'alpha.png')).metadata()).hasAlpha, false);
    assert.deepEqual(await fs.readFile(path.join(temporary,'rgb.jpg')), originals[1]);
    assert.deepEqual(await fs.readFile(alpha), originals[0]);
    assert.deepEqual(await fs.readFile(rgb), originals[1]);
    await result.cleanup();
    await assert.rejects(fs.access(temporary));
  } finally { await result?.cleanup(); await fs.rm(folder,{recursive:true,force:true}); }
});
