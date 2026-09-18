const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),crypto=require('node:crypto'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const files=execFileSync('git',['ls-files','-z'],{cwd:root}).toString().split('\0').filter(Boolean);
const forbidden=/(^|\/)(node_modules|dist|export|\.next|\.env[^/]*|apis|models|ups)(\/|$)|^resources\/(models|win\/bin|mac\/bin|linux\/bin)\/|^tests\/artifacts\/|\.(pfx|p12|pem|key|provisionprofile|log|tsbuildinfo)$/i;
const secrets=/(?:gh[opusr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{40,}|AKIA[A-Z0-9]{16}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk-(?:proj-)?[A-Za-z0-9_-]{40,})/;
let bytes=0;
for(const file of files){if(forbidden.test(file))throw new Error('Excluded path staged: '+file);const content=execFileSync('git',['show',':'+file],{cwd:root,maxBuffer:64*1024*1024});bytes+=content.length;if(content.length>10*1024*1024)throw new Error('Unexpected large file: '+file);if(!/\.(png|jpe?g|webp|ttf|ico|icns)$/.test(file)){const text=content.toString();if(secrets.test(text))throw new Error('Possible secret in staged file: '+file);if(/C:[\\/]Users[\\/](?:kirst|ghosh)/i.test(text))throw new Error('Personal machine path staged: '+file);}}
const baseline=JSON.parse(fs.readFileSync(path.join(root,'tests/engine-baseline.json')));
for(const file of baseline.files.filter(f=>files.includes(f.path))){const content=execFileSync('git',['show',':'+file.path],{cwd:root});if(crypto.createHash('sha256').update(content).digest('hex')!==file.sha256)throw new Error('Staged protected source differs from baseline: '+file.path);}
console.log(`PASS publication audit: ${files.length} files, ${(bytes/1024/1024).toFixed(2)} MiB; no excluded assets, detected secrets or personal paths; staged protected source hashes preserved.`);
