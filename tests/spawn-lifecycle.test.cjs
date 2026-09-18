const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const {ChildProcess} = require('node:child_process');
const {PassThrough} = require('node:stream');
const {once} = require('node:events');
function load(prepare, spawn) {
  const filename = path.resolve(__dirname,'../electron/utils/spawn-upscayl.ts');
  const code = ts.transpileModule(fs.readFileSync(filename,'utf8'),{
    compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true},
  }).outputText;
  const exports = {};
  const stubs = {
    child_process:{spawn,ChildProcess}, stream:{PassThrough}, path,
    './get-resource-paths':{execPath:'original-engine'},
    './prepare-jpeg-input':{prepareJpegInput:prepare},
  };
  vm.runInNewContext(code,{exports,require:id=>stubs[id]}, {filename});
  return exports.spawnUpscayl;
}
test('cancellation during preparation never starts native engine and cleans temporary input', async () => {
  let release, cleanupCalls=0, launches=0, isCancelled;
  const spawn = load((_args,_log, cancelled) => {
    isCancelled=cancelled;
    return new Promise(resolve=>{release=resolve;});
  },()=>{launches++;throw new Error('must not launch');});
  const job=spawn(['-i','source.png','-f','jpg'],()=>{});
  const closed=once(job.process,'close');
  assert.equal(job.kill(),true);
  assert.equal(isCancelled(),true);
  release({args:['-i','temporary.png'],cleanup:async()=>{cleanupCalls++;}});
  assert.deepEqual(await closed,[null,'SIGTERM']);
  assert.equal(launches,0);
  assert.equal(cleanupCalls,1);
});
test('successful launch forwards native stdout/stderr, identity, close and cleanup', async () => {
  let cleanupCalls=0, launches=0, nativeKill=0;
  const native = Object.assign(new ChildProcess(),{
    stderr:new PassThrough(),stdout:new PassThrough(),pid:123,
    spawnargs:['original-engine','-i','rgb.png'],kill:()=>{nativeKill++;return true;},
  });
  const spawn=load(async()=>({args:['-i','rgb.png','-f','jpg'],cleanup:async()=>{cleanupCalls++;}}),(_binary,args,options)=>{
    launches++;
    assert.equal(_binary,'original-engine');
    assert.deepEqual(Array.from(args),['-i','rgb.png','-f','jpg']);
    assert.equal(options.detached,false);
    return native;
  });
  const job=spawn(['-i','source.png','-f','jpg'],()=>{});
  let stderr='',stdout='';
  job.process.stderr.on('data',data=>{stderr+=data;});
  job.process.stdout.on('data',data=>{stdout+=data;});
  const closed=once(job.process,'close');
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(job.process.pid,123);
  native.stderr.write('50%');native.stdout.write('details');
  native.emit('close',0,null);
  assert.deepEqual(await closed,[0,null]);
  assert.equal(stderr,'50%');assert.equal(stdout,'details');
  assert.equal(launches,1);assert.equal(cleanupCalls,1);
  assert.equal(job.kill(),true);assert.equal(nativeKill,1);
});
test('preparation failure is emitted through original error and close hooks', async () => {
  let launches=0;
  const spawn=load(async()=>{throw new Error('invalid input');},()=>{launches++;});
  const job=spawn(['-i','missing.png','-f','jpg'],()=>{});
  let error;
  job.process.on('error',value=>{error=value;});
  const closed=new Promise(resolve=>job.process.once('close',(...args)=>resolve(args)));
  assert.deepEqual(await closed,[1,null]);
  assert.match(error.message,/Input preparation failed.*invalid input/);
  assert.equal(launches,0);
});
test('native spawn error is forwarded and eventual native close cleans inputs once', async () => {
  let cleanupCalls=0;
  const native=Object.assign(new ChildProcess(),{stderr:new PassThrough(),stdout:new PassThrough(),spawnargs:['original-engine'],kill:()=>true});
  const spawn=load(async()=>({args:['-i','source.png','-f','jpg'],cleanup:async()=>{cleanupCalls++;}}),()=>native);
  const job=spawn(['-i','source.png','-f','jpg'],()=>{});
  let error;
  job.process.on('error',value=>{error=value;});
  const closed=new Promise(resolve=>job.process.once('close',(...args)=>resolve(args)));
  await new Promise(resolve=>setImmediate(resolve));
  const expected=new Error('spawn missing engine');
  native.emit('error',expected);native.emit('close',-2,null);
  assert.deepEqual(await closed,[-2,null]);
  assert.equal(error,expected);assert.equal(cleanupCalls,1);
});
test('non-JPEG formats use the exact original synchronous native process path', () => {
  for (const format of ['png','webp']) {
    let launches=0, kills=0;
    const native=new ChildProcess();
    native.kill=()=>{kills++;return true;};
    const expected=['-i','original.png','-o','result.'+format,'-f',format,'-n','original-model'];
    const spawn=load(()=>{throw new Error('Non-JPEG must never prepare input');},(binary,args,options)=>{
      launches++;
      assert.equal(binary,'original-engine');
      assert.deepEqual(Array.from(args),expected);
      assert.equal(options.cwd,path.dirname('original-engine'));
      assert.equal(options.detached,false);
      return native;
    });
    const job=spawn([...expected,''],()=>{});
    assert.equal(job.process,native);
    assert.equal(launches,1);
    assert.equal(job.kill(),true);
    assert.equal(kills,1);
  }
});

test('nonzero native exit is an error before legacy close handlers can infer success', async () => {
  for(const format of ['png','jpg']){
    const native=Object.assign(new ChildProcess(),{stderr:new PassThrough(),stdout:new PassThrough(),spawnargs:['original-engine'],kill:()=>true});
    const spawn=load(async()=>({args:['-f','jpg'],cleanup:async()=>{}}),()=>native);
    const job=spawn(['-f',format],()=>{}),events=[];
    job.process.on('error',error=>events.push(['error',error.message]));
    job.process.on('close',code=>events.push(['close',code]));
    await new Promise(resolve=>setImmediate(resolve));
    native.emit('close',3221225477,null);
    assert.equal(events[0][0],'error');assert.match(events[0][1],/exited unsuccessfully/);
    assert.deepEqual(events[1],['close',3221225477]);
  }
});
