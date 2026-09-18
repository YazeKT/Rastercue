const fs = require('node:fs');
const path = require('node:path');
const sharp = require('sharp');
const root = path.resolve(__dirname, '..');
(async () => {
  const mark = fs.readFileSync(path.join(root, 'resources/brand/rastercue.svg'), 'utf8');
  const appIcon = Buffer.from(mark.replace('<title>', '<rect width="256" height="256" rx="48" fill="#22252D"/><title>'));
  fs.mkdirSync(path.join(root,'resources/icons'),{recursive:true});
  fs.mkdirSync(path.join(root,'renderer/public'),{recursive:true});
  for (const size of [128,256,512,1024]) {
    const output = await sharp(appIcon).resize(size,size).png().toBuffer();
    fs.writeFileSync(path.join(root,`resources/icons/${size}x${size}.png`),output);
  }
  const png = await sharp(appIcon).resize(512,512).png().toBuffer();
  fs.writeFileSync(path.join(root,'build/icon.png'),png);
  const dmgMark=await sharp(Buffer.from(mark)).resize(64,64).png().toBuffer();
  await sharp({create:{width:540,height:380,channels:4,background:'#14161B'}}).composite([{input:dmgMark,left:238,top:30}]).png().toFile(path.join(root,'build/background.png'));
  fs.writeFileSync(path.join(root,'renderer/public/rastercue.png'),png);
  fs.copyFileSync(path.join(root,'resources/brand/rastercue.svg'),path.join(root,'renderer/public/rastercue.svg'));
  for (const name of ['rastercue-monochrome.svg','rastercue-wordmark.svg']) {
    const source=path.join(root,'resources/brand',name);
    if(fs.existsSync(source))fs.copyFileSync(source,path.join(root,'renderer/public',name));
  }
  fs.copyFileSync(path.join(root,'LICENSE'),path.join(root,'renderer/public/LICENSE.txt'));
  fs.copyFileSync(path.join(root,'Real-ESRGAN_LICENSE.txt'),path.join(root,'renderer/public/Real-ESRGAN_LICENSE.txt'));
  const fontNotice=path.join(root,'resources/brand/Poppins-OFL.txt');
  if(fs.existsSync(fontNotice)) fs.copyFileSync(fontNotice,path.join(root,'renderer/public/Poppins-OFL.txt'));
  const sizes=[16,20,24,32,40,48,64,128,256];
  const frames=await Promise.all(sizes.map(size=>sharp(appIcon).resize(size,size).png().toBuffer()));
  const header=Buffer.alloc(6+16*sizes.length);header.writeUInt16LE(1,2);header.writeUInt16LE(sizes.length,4);
  let offset=header.length;
  frames.forEach((frame,i)=>{const at=6+i*16;header[at]=sizes[i]===256?0:sizes[i];header[at+1]=header[at];header.writeUInt16LE(1,at+4);header.writeUInt16LE(32,at+6);header.writeUInt32LE(frame.length,at+8);header.writeUInt32LE(offset,at+12);offset+=frame.length;});
  fs.writeFileSync(path.join(root,'build/icon.ico'),Buffer.concat([header,...frames]));
  const macPng=await sharp(appIcon).resize(1024,1024).png().toBuffer();
  const icnsHeader=Buffer.alloc(16);icnsHeader.write('icns',0);icnsHeader.writeUInt32BE(16+macPng.length,4);icnsHeader.write('ic10',8);icnsHeader.writeUInt32BE(8+macPng.length,12);
  fs.writeFileSync(path.join(root,'build/icon.icns'),Buffer.concat([icnsHeader,macPng]));
  fs.writeFileSync(path.join(root,'resources/brand/PROVENANCE.md'),'# Brand asset provenance\n\nRastercue SVG geometry manually reconstructed from the user-selected generated logo proof in the approved plan. No generated texture retained. PNG/ICO/ICNS outputs are deterministic renders from rastercue.svg via scripts/prepare-brand.cjs. Wordmark uses the bundled Poppins font; font notices remain in renderer/fonts.\n');
  console.log('Rastercue vector and platform icons prepared.');
})().catch(error=>{console.error(error);process.exitCode=1});
