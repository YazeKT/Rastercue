// Generate distribution notices from installed dependencies and exact native source.
// No network access. Does not change engine/models. Native source path is explicit.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const nativeSource=process.argv[2]&&path.resolve(process.argv[2]);
if(!nativeSource||!fs.existsSync(path.join(nativeSource,'src/ncnn/LICENSE.txt'))||!fs.existsSync(path.join(nativeSource,'LICENSE')))throw new Error('Pass the verified complete native source directory (including recursive submodules).');
const output=path.join(root,'resources/release-notices');fs.mkdirSync(output,{recursive:true});
function collect(folder,skip,context=''){
  let content='';
  for(const item of fs.readdirSync(folder,{withFileTypes:true})){
    if(item.isSymbolicLink()||skip.has(item.name))continue;
    const full=path.join(folder,item.name),label=path.join(context,item.name);
    if(item.isDirectory())content+=collect(full,skip,label);
    else if(/^(?:licen[cs]e|copying|copyright|notice)(?:\.|$)/i.test(item.name)){
      const bytes=fs.readFileSync(full);if(bytes.includes(0)||bytes.length>2000000)continue;
      content+='\n\n----- '+label+' -----\n'+bytes.toString('utf8');
    }
  }
  return content;
}
fs.writeFileSync(path.join(output,'DEPENDENCY-LICENSES.txt'),'Installed dependency licence texts (includes build-time dependencies; not a claim all are shipped).\n'+collect(path.join(root,'node_modules'),new Set(['.git','.cache','.bin'])));
fs.writeFileSync(path.join(output,'NATIVE-LICENSES.txt'),'Unchanged Upscayl-NCNN 22774bc42e2bc3c785b5b585d213d960b1348ad5 and recursive source component notices. See docs/ENGINE-PROVENANCE.md and release corresponding-source archive.\n'+collect(nativeSource,new Set(['.git'])));
console.log('Release notices prepared.');
