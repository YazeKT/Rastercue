const { _electron } = require(process.env.RASTERCUE_PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
(async () => {
  const root = path.resolve(__dirname, '..');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rastercue-ui-'));
  const app = await _electron.launch({ executablePath: path.join(root,'dist/win-unpacked/Rastercue.exe'), env: {...process.env, RASTERCUE_TEST_USER_DATA:profile}, timeout:90000 });
  try {
    const page = await app.firstWindow();
    await page.waitForFunction(() => !!window.rastercue);
    await page.evaluate(() => localStorage.setItem('rastercueWelcomeSeen','true'));
    await page.reload();
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
    await page.getByRole('button',{name:'Output',exact:true}).click();
    if(!(await page.getByRole('button',{name:'Choose output folder',exact:true}).isVisible())) throw new Error('Output workflow page missing');
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-small.png')});
    const output=path.join(profile,'outputs');fs.mkdirSync(output);
    await page.evaluate(format=>{localStorage.setItem('selectedModelId',JSON.stringify('upscayl-lite-4x'));localStorage.setItem('saveImageAs',JSON.stringify(format));},process.env.RASTERCUE_TEST_FORMAT||'png');
    await page.reload();
    await app.evaluate(({BrowserWindow}) => BrowserWindow.getAllWindows()[0].setSize(1366,728));
    await app.evaluate(({dialog},{input,output})=>{dialog.showOpenDialog=async options=>({canceled:false,filePaths:[options.properties.includes('openFile')?input:output]});},{input:process.env.RASTERCUE_TEST_INPUT||path.join(root,'tests/baseline-input.png'),output});
    await page.getByRole('button',{name:'Select image',exact:true}).click();
    await page.getByRole('button',{name:'Choose output folder',exact:true}).click();
    await page.getByRole('button',{name:'Start upscale',exact:true}).click();
    if(process.env.RASTERCUE_TEST_FORMAT==='jpg') await page.getByRole('button',{name:'Continue JPG',exact:true}).click();
    await page.locator('svg.spinner[aria-label="Rastercue"]').waitFor({state:'visible',timeout:10000});
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-loading.png')});
    let completed=null;
    const deadline=Date.now()+90000;
    while(Date.now()<deadline){const job=await page.evaluate(()=>window.rastercue.current());if(job?.status==='failed')throw new Error(job.warnings.join(';'));if(job?.status==='completed'){completed=job;break;}await page.waitForTimeout(250);}
    if(!completed)throw new Error('Packaged job did not complete');
    console.log('Packaged UI single job:',completed);
    fs.writeFileSync(path.join(root,'tests/artifacts/last-packaged-job.json'),JSON.stringify(completed,null,2));
    if(process.env.RASTERCUE_TEST_FORMAT==='jpg')fs.copyFileSync(completed.files[0].output.path,path.join(root,'tests/artifacts/fixed-jpg.jpg'));
    await page.screenshot({path:path.join(root,'tests/artifacts/rastercue-comparison.png')});
  } finally { await app.close(); }
})().catch(error=>{console.error(error);process.exitCode=1});
