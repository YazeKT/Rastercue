/** Explicit developer setup only; no in-app downloads or redistribution. */
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..');
const revision='a00d55fee90e0f9435d5eaa86e76700df8199af8';
const digest=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
(async()=>{
  const manifest=JSON.parse(await fs.readFile(path.join(root,'tests/engine-baseline.json'),'utf8'));
  const engineOnly=process.argv.includes('--engine-only');
  const verifyOnly=process.argv.includes('--verify');
  if(!verifyOnly&&!engineOnly&&!process.argv.includes('--acknowledge-model-terms'))throw new Error('Read LEGAL.md and creator terms first. Explicitly pass --acknowledge-model-terms to obtain baseline model assets for local use. This is not commercial/redistribution clearance.');
  const files=manifest.files.filter(f=>/^resources\/(models\/|(?:win|mac|linux)\/bin\/)/.test(f.path)&&(!engineOnly||!f.path.startsWith('resources/models/')));
  if(process.argv.includes('--verify-origin')){
    const response=await fetch(`https://api.github.com/repos/upscayl/upscayl/git/trees/${revision}?recursive=1`,{headers:{'User-Agent':'Rastercue-asset-verification'}});if(!response.ok)throw new Error('Could not verify upstream tree: '+response.status);
    const tree=(await response.json()).tree;
    for(const file of files){const data=await fs.readFile(path.join(root,file.path));const blob=crypto.createHash('sha1').update(Buffer.from(`blob ${data.length}\0`)).update(data).digest('hex');if(!tree.some(entry=>entry.path===file.path&&entry.sha===blob))throw new Error('Local file does not match pinned upstream Git blob: '+file.path);}
    console.log('All '+files.length+' assets match the pinned upstream Git tree.');return;
  }
  for(const file of files){
    const target=path.resolve(root,file.path);
    if(!target.startsWith(root+path.sep))throw new Error('Invalid manifest target');
    let existing;try{existing=await fs.readFile(target);}catch(error){if(error.code!=='ENOENT')throw error;}
    if(existing){if(digest(existing)!==file.sha256)throw new Error('Refusing to replace mismatched existing asset: '+file.path);console.log('Verified '+file.path);continue;}
    if(verifyOnly)throw new Error('Missing asset: '+file.path+'; see docs/DEVELOPMENT.md');
    const url=`https://raw.githubusercontent.com/upscayl/upscayl/${revision}/${file.path}`;
    const response=await fetch(url);if(!response.ok)throw new Error('Asset fetch failed '+response.status+': '+file.path);
    const bytes=Buffer.from(await response.arrayBuffer());if(digest(bytes)!==file.sha256)throw new Error('Downloaded checksum mismatch: '+file.path);
    await fs.mkdir(path.dirname(target),{recursive:true});await fs.writeFile(target,bytes,{flag:'wx'});
    if(process.platform!=='win32'&&file.path.endsWith('/upscayl-bin'))await fs.chmod(target,0o755);
    console.log('Fetched and verified '+file.path);
  }
  console.log('Baseline assets ready; model/runtime terms remain separate from application licence.');
})().catch(error=>{console.error(error.message);process.exitCode=1});
