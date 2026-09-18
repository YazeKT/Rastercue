const { _electron } = require(process.env.RASTERCUE_PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const sharp = require('sharp');
(async () => {
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rastercue-baseline-'));
  const root = path.resolve(__dirname, '..');
  const electron = await _electron.launch({ executablePath: path.join(root, 'node_modules/electron/dist/electron.exe'), args: ['.', '--user-data-dir=' + profile], cwd: root, timeout: 90000 });
  const page = await electron.firstWindow({ timeout: 90000 });
  await page.waitForFunction(() => typeof window.electron !== 'undefined');
  await page.evaluate(() => { localStorage.setItem('showOnboarding','false'); localStorage.setItem('enableContribution','false'); });
  await page.reload();
  await page.waitForTimeout(1500);
  await electron.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].setSize(1366, 728));
  await page.screenshot({ path: path.join(__dirname, 'baseline-1366.png') });
  const result = [];
  const input = path.join(__dirname, 'baseline-input.png');
  const output = path.join(profile, 'output'); fs.mkdirSync(output);
  const batch = path.join(profile, 'batch'); fs.mkdirSync(batch); fs.copyFileSync(input, path.join(batch,'sample.png'));
  for (const mode of ['single','batch','double']) {
    const payload = { imagePath: input, batchFolderPath: batch, outputPath: output, model:'upscayl-lite-4x', gpuId:null,saveImageAs:'png',scale:'4',overwrite:false,noImageProcessing:false,compression:'0',customWidth:null,useCustomWidth:false,tileSize:null,ttaMode:false,copyMetadata:false };
    const commands=require('../export/common/electron-commands.js').ELECTRON_COMMANDS;
    const channels = mode==='single' ? [commands.UPSCAYL,commands.UPSCAYL_DONE] : mode==='batch' ? [commands.FOLDER_UPSCAYL,commands.FOLDER_UPSCAYL_DONE] : [commands.DOUBLE_UPSCAYL,commands.DOUBLE_UPSCAYL_DONE];
    const done = await page.evaluate(({ channels,payload }) => new Promise((resolve,reject) => {
      const timer=setTimeout(()=>reject(new Error('Baseline job timeout')),60000);
      window.electron.on(channels[1],(_,data)=>{clearTimeout(timer);resolve(data)});
      window.electron.on('Upscaling Error',(_,data)=>{clearTimeout(timer);reject(new Error(data))});
      window.electron.send(channels[0],payload);
    }), { channels,payload });
    let file = done;
    if(mode==='batch') file=path.join(done,fs.readdirSync(done).find(f=>f.endsWith('.png')));
    const meta=await sharp(file).metadata();
    result.push({ mode,payload,path:done,width:meta.width,height:meta.height,sha256:require('node:crypto').createHash('sha256').update(await sharp(file).raw().toBuffer()).digest('hex') });
  }
  fs.writeFileSync(path.join(__dirname,'baseline-runtime.json'),JSON.stringify({profile,jobs:result},null,2));
  console.log(JSON.stringify(result,null,2));
  await electron.close();
})().catch(e=>{ console.error(e);process.exit(1); });
