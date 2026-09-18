// UI responsiveness test with a deliberately long, simulated native process.
// In-memory test instrumentation only; no shipped binary/model is modified.
const { _electron } = require(process.env.RASTERCUE_PLAYWRIGHT_PATH || 'playwright');
const fs = require('node:fs'), os = require('node:os'), path = require('node:path'), assert = require('node:assert/strict');
(async () => {
  const root = path.resolve(__dirname, '..'), profile = fs.mkdtempSync(path.join(os.tmpdir(), 'rastercue-cancel-'));
  const output = path.join(profile, 'outputs'); fs.mkdirSync(output);
  const kept = path.join(output, 'previous-completed.png'); fs.copyFileSync(path.join(root, 'tests/baseline-input.png'), kept);
  const bytes = fs.readFileSync(kept);
  const app = await _electron.launch({ executablePath: path.join(root, 'dist/win-unpacked/Rastercue.exe'), env: { ...process.env, RASTERCUE_TEST_USER_DATA: profile }, timeout: 60000 });
  try {
    const page = await app.firstWindow();
    page.setDefaultTimeout(10000);
    await page.waitForFunction(() => !!window.rastercue);
    await page.evaluate(() => { localStorage.setItem('rastercueGettingStarted.v1', 'completed'); localStorage.setItem('saveImageAs', JSON.stringify('png')); }); await page.reload();
    await app.evaluate(({ app, dialog }, { input, output, stress }) => {
      const require = process.getBuiltinModule('module').createRequire(app.getAppPath() + '/export/electron/index.js');
      const path = require('node:path'), { EventEmitter } = require('node:events');
      require(path.join(app.getAppPath(), 'export/electron/utils/spawn-upscayl.js')).spawnUpscayl = () => {
        const process = new EventEmitter(); process.stderr = new EventEmitter(); process.spawnfile = 'SIMULATED TEST ENGINE'; process.spawnargs = []; process.pid = 0;
        let stopped = false;
        let percentage = 0;
        const timer = setInterval(() => { for(let i=0;i<(stress?30:1);i++) process.stderr.emit('data', Buffer.from(`${percentage++ % 100}%\n`)); }, stress?20:100);
        return { process, kill: () => { if (!stopped) { stopped = true; clearInterval(timer); setImmediate(() => process.emit('close', null, 'SIGTERM')); } return true; } };
      };
      dialog.showOpenDialog = async options => ({ canceled: false, filePaths: [options.properties.includes('openFile') ? input : output] });
    }, { input: path.join(root, 'tests/baseline-input.png'), output, stress: process.env.RASTERCUE_STRESS_PROGRESS === '1' });
    await page.getByRole('button', { name: 'Select image', exact: true }).click();
    await page.getByRole('button', { name: 'Choose output folder', exact: true }).click();
    await page.getByRole('button', { name: 'Start upscale', exact: true }).click();
    await page.getByRole('button', { name: 'Cancel job', exact: true }).waitFor();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(root, 'tests/artifacts/cancellation-stress.png') });
    console.log('Testing cancellation click during ongoing simulated work');
    const start = Date.now(); await page.getByRole('button', { name: 'Cancel job', exact: true }).click();
    console.log('Cancellation click delivered');
    await page.getByRole('button', { name: 'Start upscale', exact: true }).waitFor({ timeout: 5000 });
    const cancelled = await page.evaluate(() => window.rastercue.current());
    assert.equal(cancelled.status, 'cancelled');
    assert(fs.readFileSync(kept).equals(bytes));
    assert(Date.now() - start < 2500, 'Cancellation control response too slow');
    // Repeat to verify main-process shortcut and stale progress suppression.
    await page.getByRole('button', { name: 'Start upscale', exact: true }).click(); await page.getByRole('button', { name: 'Cancel job', exact: true }).waitFor();
    await page.waitForFunction(async id => { const job = await window.rastercue.current(); return job?.status === 'running' && job.id !== id; }, cancelled.id);
    // DevTools keyboard injection does not consistently reach Electron's
    // native before-input-event; exercise that main-process handler directly.
    await app.evaluate(({ BrowserWindow }) => BrowserWindow.getAllWindows()[0].webContents.emit('before-input-event', { preventDefault() {} }, { type: 'keyDown', control: true, key: '.' }));
    await page.getByRole('button', { name: 'Start upscale', exact: true }).waitFor({ timeout: 5000 });
    assert.equal((await page.evaluate(() => window.rastercue.current())).status, 'cancelled');
    console.log('PASS packaged simulated-engine progress stress: Stop click, busy-state reset, preserved files, restart and main-process Ctrl+.');
  } catch (error) { console.error('Cancellation test failed before cleanup:', error); try { const page = await app.firstWindow(); console.error('Job:', await page.evaluate(() => window.rastercue.current())); console.error((await page.locator('body').innerText()).slice(-1200)); } catch {} throw error; } finally { await app.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
