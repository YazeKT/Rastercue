const {_electron}=require(process.env.RASTERCUE_PLAYWRIGHT_PATH||'playwright');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),sharp=require('sharp');
(async()=>{
  const root=path.resolve(__dirname,'..'),dir=fs.mkdtempSync(path.join(os.tmpdir(),'rastercue-processing-'));
  const input=path.join(dir,'rgba.png');await sharp(path.join(root,'tests/baseline-input.png')).ensureAlpha().png().toFile(input);
  const batch=path.join(dir,'batch');fs.mkdirSync(batch);fs.copyFileSync(input,path.join(batch,'first.png'));fs.copyFileSync(input,path.join(batch,'second.png'));
  const original=fs.readFileSync(input);
  const expected=path.join(dir,'expected-native.png');
  const native=require('node:child_process').spawnSync(path.join(root,'resources/win/bin/upscayl-bin.exe'),['-i',input,'-o',expected,'-n','upscayl-standard-4x','-m',path.join(root,'resources/models'),'-f','png','-t','32','-c','0'],{encoding:'utf8'});
  assert.equal(native.status,0,native.stderr);
  const app=await _electron.launch({args:process.env.RASTERCUE_TEST_SOFTWARE_RENDERER==='1'?['--disable-gpu']:[],executablePath:process.env.RASTERCUE_TEST_EXE||path.join(root,'dist/win-unpacked/Rastercue.exe'),env:{...process.env,RASTERCUE_TEST_USER_DATA:path.join(dir,'profile')},timeout:60000});
  try{
    const page=await app.firstWindow();await page.waitForFunction(()=>!!window.rastercue);
    const commands=require('../export/common/electron-commands.js').ELECTRON_COMMANDS;
    const results=[];
    const modes=['single-png','digital-art-png','single-webp-metadata','batch-jpg','double-jpg','cancel-jpg','native-failure'];
    for(const mode of modes){
      const output=path.join(dir,mode);fs.mkdirSync(output);
      const payload={imagePath:input,batchFolderPath:batch,outputPath:output,model:'upscayl-standard-4x',gpuId:null,saveImageAs:mode==='single-png'?'png':'jpg',scale:'4',overwrite:false,noImageProcessing:false,compression:'0',customWidth:null,useCustomWidth:false,tileSize:32,ttaMode:false,copyMetadata:false};
      if(mode==='single-webp-metadata'){payload.saveImageAs='webp';payload.copyMetadata=true;}
      if(mode==='digital-art-png'){payload.model='digital-art-4x';payload.saveImageAs='png';}
      if(mode==='native-failure'){payload.model='missing-regression-model-4x';payload.saveImageAs='png';}
      const channel=mode==='batch-jpg'?commands.FOLDER_UPSCAYL:mode==='double-jpg'?commands.DOUBLE_UPSCAYL:commands.UPSCAYL;
      await page.evaluate(({channel,payload,stop,cancel})=>{window.electron.send(channel,payload);if(cancel)setTimeout(()=>window.electron.send(stop),30);},{channel,payload,stop:commands.STOP,cancel:mode==='cancel-jpg'});
      let job;const deadline=Date.now()+90000;
      while(Date.now()<deadline){job=await page.evaluate(()=>window.rastercue.current());if(job?.settings.outputPath===output&&job.status!=='running')break;await page.waitForTimeout(100);}
      assert.equal(job.status,mode==='cancel-jpg'?'cancelled':mode==='native-failure'?'failed':'completed',mode+JSON.stringify(job));
      assert.equal(job.files.length,mode==='batch-jpg'?2:1,'job file count');
      if(mode!=='cancel-jpg'&&mode!=='native-failure')for(const file of job.files){const meta=await sharp(file.output.path).metadata();assert.equal(meta.width,mode==='double-jpg'?1024:256);assert.equal(meta.height,mode==='double-jpg'?768:192);const pixels=await sharp(file.output.path).removeAlpha().raw().toBuffer();let colour=0;for(let i=0;i<pixels.length;i+=3)colour+=Math.abs(pixels[i]-pixels[i+1]);assert(colour/(pixels.length/3)>5,'colour channels collapsed');}
      if(mode==='single-webp-metadata')assert(!job.warnings.some(w=>/metadata.*error|metadata.*failed/i.test(w)),'metadata path warning');
      if(mode==='single-png')assert((await sharp(job.files[0].output.path).removeAlpha().raw().toBuffer()).equals(await sharp(expected).removeAlpha().raw().toBuffer()),'unchanged PNG native pixels');
      results.push({mode,status:job.status,files:job.files.map(f=>f.output?.path)});
    }
    assert(fs.readFileSync(input).equals(original),'source changed');
    fs.writeFileSync(path.join(root,'tests/artifacts/packaged-processing.json'),JSON.stringify({dir,results},null,2));console.log(JSON.stringify({dir,results},null,2));
  }finally{await app.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
