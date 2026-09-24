const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const dist = path.join(root, 'dist');
const originalNativeSource = process.argv[2] ? path.resolve(process.argv[2]) : null;
if (originalNativeSource) {
  if (!fs.existsSync(path.join(originalNativeSource, 'src', 'ncnn', 'LICENSE.txt'))) throw new Error('Original native source must include recursive NCNN source.');
  const stage = fs.mkdtempSync(path.join(require('node:os').tmpdir(), 'rastercue-native-source-'));
  const filter = source => !source.split(path.sep).some(part => part === '.git' || part === 'build');
  fs.cpSync(originalNativeSource, path.join(stage, 'protected-upscayl-vulkan'), { recursive: true, filter });
  fs.cpSync(path.join(root, 'native', 'rastercue-cpu'), path.join(stage, 'rastercue-cpu'), { recursive: true, filter });
  const archive = path.join(dist, 'rastercue-native-corresponding-source.tar.gz');
  fs.rmSync(archive, { force: true });
  execFileSync('tar.exe', ['-czf', archive, '-C', stage, '.'], { stdio: 'inherit' });
  fs.rmSync(stage, { recursive: true, force: true, maxRetries: 5, retryDelay: 100 });
}
const artifacts = ['rastercue-1.0.0-win.exe', 'rastercue-1.0.0-win.zip', 'rastercue-1.0.0-win.exe.blockmap', 'latest.yml', 'rastercue-native-corresponding-source.tar.gz'];
for (const name of artifacts) if (!fs.existsSync(path.join(dist, name))) throw new Error(`Missing local candidate artifact: ${name}`);

const sbom = process.platform === 'win32'
  ? execFileSync(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', 'npm sbom --sbom-format cyclonedx --package-lock-only'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  : execFileSync('npm', ['sbom', '--sbom-format', 'cyclonedx', '--package-lock-only'], { cwd: root, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
JSON.parse(sbom);
fs.writeFileSync(path.join(dist, 'rastercue-1.0.0-sbom.cdx.json'), sbom, 'utf8');

const lines = artifacts.concat('rastercue-1.0.0-sbom.cdx.json').map(name => {
  const digest = crypto.createHash('sha256').update(fs.readFileSync(path.join(dist, name))).digest('hex');
  return `${digest}  ${name}`;
});
fs.writeFileSync(path.join(dist, 'rastercue-1.0.0-SHA256SUMS.txt'), `${lines.join('\n')}\n`, 'utf8');
console.log(`Prepared local candidate SBOM and ${lines.length} SHA-256 entries.`);
