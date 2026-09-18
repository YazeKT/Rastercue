/** Explicit release/developer staging; never called by the installed app. */
const fs = require('node:fs/promises'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  if (!process.argv.includes('--acknowledge-model-terms')) throw Error('Read docs/MODEL-REDISTRIBUTION.md and pass --acknowledge-model-terms before staging permitted weights.');
  const manifest = JSON.parse(await fs.readFile(path.join(root, 'resources/bundled-custom-models.json')));
  const staging = path.join(root, 'resources/release-models'); await fs.mkdir(staging, { recursive: true });
  for (const file of manifest.files) {
    if (!/^[A-Za-z0-9_.-]+\.(bin|param)$/.test(file.name)) throw Error('Invalid manifest filename');
    const target = path.join(staging, file.name);
    let bytes; try { bytes = await fs.readFile(target); } catch (error) { if (error.code !== 'ENOENT') throw error; }
    if (bytes && hash(bytes) !== file.sha256) throw Error('Refusing to replace mismatched staged pair: ' + file.name);
    if (!bytes) {
      try { bytes = await fs.readFile(path.join(root, '../custom-models-main/models', file.name)); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      if (!bytes) {
        const response = await fetch(`https://raw.githubusercontent.com/upscayl/custom-models/${manifest.revision}/models/${file.name}`);
        if (!response.ok) throw Error('Could not fetch permitted model: ' + file.name);
        bytes = Buffer.from(await response.arrayBuffer());
      }
      if (hash(bytes) !== file.sha256) throw Error('Model checksum differs: ' + file.name);
      await fs.writeFile(target, bytes, { flag: 'wx' });
    }
    console.log('Verified release model: ' + file.name);
  }
  const licence = path.join(staging, 'CC-BY-4.0.txt');
  try { await fs.access(licence); } catch {
    const response = await fetch('https://creativecommons.org/licenses/by/4.0/legalcode.txt');
    if (!response.ok) throw Error('Could not obtain full Creative Commons licence');
    const text = await response.text();
    if (!text.includes('Attribution 4.0 International')) throw Error('Unexpected licence response');
    await fs.writeFile(licence, text, { flag: 'wx' });
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
