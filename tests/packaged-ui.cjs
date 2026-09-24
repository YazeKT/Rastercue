const { _electron } = require(process.env.RASTERCUE_PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
(async () => {
  const root = path.resolve(__dirname, '..');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rastercue-ui-'));
  const app = await _electron.launch({ executablePath: process.env.RASTERCUE_TEST_EXE||path.join(root,'dist/win-unpacked/Rastercue.exe'), env: {...process.env, RASTERCUE_TEST_USER_DATA:profile}, timeout:90000 });
  try {
    const page = await app.firstWindow();
    await page.waitForFunction(() => !!window.rastercue);
    await page.evaluate(() => { localStorage.setItem('rastercueWelcomeSeen','true'); localStorage.setItem('rastercueGettingStarted.v1','completed'); });
    await page.reload();
    if(process.env.RASTERCUE_TEST_BACKEND){console.log('Hardware:',await page.evaluate(()=>Promise.all([window.rastercueHardware.detect({refresh:true}),window.rastercueHardware.software({refresh:true})])));console.log('Backend probe:',await page.evaluate(backend=>window.rastercueHardware.selectBackend(backend),process.env.RASTERCUE_TEST_BACKEND));}
    await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].setSize(1366,728));
    await page.waitForTimeout(1500);
    if(await page.locator('.rastercue-credit a').getAttribute('href')!=='https://github.com/YazeKT')throw new Error('Yaze Media footer link missing');
    if((await page.locator('.rastercue-credit').innerText()).includes('FOSS'))throw new Error('Legacy FOSS footer remains');
    const start = await page.getByRole('button',{name:'Start upscale',exact:true}).boundingBox();
    const height = await page.evaluate(()=>innerHeight);
    if(!start || start.y+start.height>height-20) throw new Error('Start action is clipped at laptop height');
    console.log(await page.locator('body').innerText());
    console.log(await page.evaluate(() => ({width:innerWidth,height:innerHeight,panels:[...document.querySelectorAll('aside')].map(e=>({class:e.className,height:e.clientHeight,scroll:e.scrollHeight}))})));
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-laptop.png')});
    await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].setSize(1100,600));
    await page.waitForTimeout(300);
    const outputButton=page.getByRole('button',{name:'Choose output folder',exact:true});
    if(await outputButton.count()!==1) throw new Error('Unified Input, Model and Output workflow is incomplete');
    await outputButton.scrollIntoViewIfNeeded();
    if(!(await outputButton.isVisible())) throw new Error('Output controls are not reachable in the unified workflow');
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-small.png')});
    const output=path.join(profile,'outputs');fs.mkdirSync(output);
    await page.evaluate(({format,model})=>{localStorage.setItem('selectedModelId',JSON.stringify(model));localStorage.setItem('saveImageAs',JSON.stringify(format));},{format:process.env.RASTERCUE_TEST_FORMAT||'png',model:process.env.RASTERCUE_TEST_MODEL||'upscayl-standard-4x'});
    if(process.env.RASTERCUE_TEST_BACKEND)await page.evaluate(backend=>{localStorage.setItem('computeBackend',JSON.stringify(backend));localStorage.setItem('gpuId',JSON.stringify(''));localStorage.setItem('ttaMode',JSON.stringify(false));},process.env.RASTERCUE_TEST_BACKEND);
    if(process.env.RASTERCUE_TEST_TILE_SIZE)await page.evaluate(tile=>localStorage.setItem('tileSize',JSON.stringify(Number(tile))),process.env.RASTERCUE_TEST_TILE_SIZE);
    await page.reload();
    await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].setSize(1366,728));
    await app.evaluate(({dialog},{input,output})=>{dialog.showOpenDialog=async options=>({canceled:false,filePaths:[options.properties.includes('openFile')?input:output]});},{input:process.env.RASTERCUE_TEST_INPUT||path.join(root,'tests/baseline-input.png'),output});
    await page.getByRole('button',{name:'Select image',exact:true}).click();
    await page.getByRole('button',{name:'Choose output folder',exact:true}).click();
    await page.getByRole('button',{name:'Start upscale',exact:true}).click();
    if(process.env.RASTERCUE_TEST_FORMAT==='jpg') await page.getByRole('button',{name:'Continue JPG',exact:true}).click();
    try{await page.locator('svg.spinner[aria-label="Rastercue"]').waitFor({state:'visible',timeout:10000});await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-loading.png')});}catch{const fastJob=await page.evaluate(()=>window.rastercue.current());if(!fastJob||!['running','completed'].includes(fastJob.status))throw new Error('Packaged job did not enter processing: '+JSON.stringify(fastJob));}
    let completed=null;
    const deadline=Date.now()+90000;
    while(Date.now()<deadline){const job=await page.evaluate(()=>window.rastercue.current());if(job?.status==='failed')throw new Error(job.warnings.join(';'));if(job?.status==='completed'){completed=job;break;}await page.waitForTimeout(250);}
    if(!completed)throw new Error('Packaged job did not complete');
    console.log('Packaged UI single job:',completed);
    fs.writeFileSync(path.join(root,'tests/artifacts/last-packaged-job.json'),JSON.stringify(completed,null,2));
    if(process.env.RASTERCUE_TEST_FORMAT==='jpg')fs.copyFileSync(completed.files[0].output.path,path.join(root,'tests/artifacts/fixed-jpg.jpg'));
    await page.getByRole('button',{name:'Job',exact:true}).click();
    await page.waitForFunction(()=>['Original image thumbnail','Upscaled output thumbnail'].every(alt=>{const image=document.querySelector(`img[alt="${alt}"]`);return image?.complete&&image.naturalWidth>1&&image.src.startsWith('data:image/png;base64,');}),null,{timeout:10000});
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-job.png')});
    await page.getByRole('button',{name:'Open job history',exact:true}).click();
    await page.waitForFunction(()=>['Source thumbnail','Output thumbnail'].every(alt=>{const image=document.querySelector(`img[alt="${alt}"]`);return image?.complete&&image.naturalWidth>1&&image.src.startsWith('data:image/png;base64,');}),null,{timeout:10000});
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-history.png')});
    await page.keyboard.press('Escape');
    await page.getByRole('button',{name:'Inspect',exact:true}).click();
    await page.waitForFunction(()=>{const image=document.querySelector('img[alt="Upscaled"]');return image?.complete&&image.naturalWidth>1;},null,{timeout:10000});
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-comparison.png')});
  } finally { await app.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
