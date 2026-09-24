import { spawn, ChildProcess, ChildProcessWithoutNullStreams } from 'child_process';
import { PassThrough } from 'stream';
import { dirname } from 'path';
import fs from 'fs';
import { execPath } from './get-resource-paths';
import { prepareEngineIO } from './prepare-engine-io';
import type { ComputeBackendId } from '../../common/hardware-types';
import { cpuExecPath } from './get-cpu-resource-path';

/** Synchronous lifecycle handle keeps original callers/cancellation unchanged.
 * Unsupported edge formats are normalized around the locked native engine.
 */
let selectedBackend: ComputeBackendId = 'original-vulkan';

export const setComputeBackend = (backendId: ComputeBackendId) => { selectedBackend = backendId; };
export const getComputeBackend = () => selectedBackend;

export const spawnUpscayl = (command: string[], logit: (...args: any[]) => void, backendId: ComputeBackendId = selectedBackend) => {
  const selectedExecPath = backendId === 'cpu' ? cpuExecPath : execPath;
  const filtered = command.filter(arg => arg !== '');
  const gpuIndex = filtered.indexOf('-g');
  if (backendId === 'cpu' && gpuIndex >= 0) filtered.splice(gpuIndex, 2);
  const args = filtered;
  const format = String(args[args.indexOf('-f') + 1] || '').toLowerCase();
  const input = String(args[args.indexOf('-i') + 1] || '').toLowerCase();
  let expandedBatchInput = false;
  try {
    expandedBatchInput = fs.statSync(input).isDirectory() && fs.readdirSync(input).some(name => /\.(avif|tiff?)$/i.test(name));
  } catch { /* Input validation is reported by the normal engine/preparation path. */ }
  const needsAdapter = ['jpg', 'avif', 'tif', 'tiff'].includes(format) || /\.(avif|tiff?)$/.test(input) || expandedBatchInput;
  // Preserve the proven Upscayl lifecycle for formats the native engine already
  // supports. The adapter exists only at genuinely new or safety-sensitive
  // boundaries, so PNG/WebP behavior and cancellation remain unchanged.
  if (!needsAdapter) {
    logit('📢 Upscayl Command: ', args);
    const child = spawn(selectedExecPath, args, { cwd: dirname(selectedExecPath), detached: false });
    let cancelled = false, errored = false;
    child.once('error', () => { errored = true; });
    child.prependOnceListener('close', (code, signal) => {
      logit('Native engine exit:', code, signal || '');
      if (!cancelled && !errored && code !== 0) child.emit('error', new Error(`Native engine exited unsuccessfully (${code ?? signal}). No successful output is assumed.`));
    });
    return { process: child, kill: () => { cancelled = true; return child.kill(); } };
  }
  const stderr = new PassThrough(), stdout = new PassThrough();
  const process = Object.assign(new ChildProcess(), {
    stderr, stdout, stdin: new PassThrough(),
    spawnfile: selectedExecPath, spawnargs: [selectedExecPath, ...args],
  }) as ChildProcessWithoutNullStreams;
  let child: ChildProcessWithoutNullStreams | undefined;
  let cancelled = false;
  let errored = false;
  const kill = () => { cancelled = true; return child ? child.kill() : true; };
  // Do not start work before callers attach their existing progress/error hooks.
  void (async () => {
    let prepared: Awaited<ReturnType<typeof prepareEngineIO>> | undefined;
    try {
      prepared = await prepareEngineIO(command, logit, () => cancelled);
      if (cancelled) { await prepared.cleanup(); process.emit('close', null, 'SIGTERM'); return; }
      logit('📢 Upscayl Command: ', prepared.args);
      const preparedArgs = [...prepared.args];
      const preparedGpuIndex = preparedArgs.indexOf('-g');
      if (backendId === 'cpu' && preparedGpuIndex >= 0) preparedArgs.splice(preparedGpuIndex, 2);
      child = spawn(selectedExecPath, preparedArgs, { cwd: dirname(selectedExecPath), detached: false });
      Object.assign(process, { spawnargs: child.spawnargs, pid: child.pid });
      child.stderr.pipe(stderr);
      child.stdout.pipe(stdout);
      child.once('error', error => { errored = true; process.emit('error', error); });
      child.once('close', (code, signal) => {
        void (async () => {
          if (!cancelled && !errored && code === 0) await prepared!.finalize?.();
          await prepared!.cleanup();
          logit('Native engine exit:', code, signal || '');
          if (!cancelled && !errored && code !== 0) process.emit('error', new Error(`Native engine exited unsuccessfully (${code ?? signal}). No successful output is assumed.`));
          process.emit('close', code, signal);
        })().catch(error => { errored = true; process.emit('error', error); process.emit('close', 1, null); });
      });
    } catch (error) {
      if (prepared) await prepared.cleanup().catch(cleanupError => logit('Warning: temporary JPG input cleanup failed.', String(cleanupError)));
      if (!cancelled) process.emit('error', new Error(`Input preparation failed: ${String(error)}`));
      process.emit('close', cancelled ? null : 1, cancelled ? 'SIGTERM' : null);
    }
  })();
  return { process, kill };
};
