import { spawn, ChildProcess, ChildProcessWithoutNullStreams } from 'child_process';
import { PassThrough } from 'stream';
import { execPath } from './get-resource-paths';
import { prepareJpegInput } from './prepare-jpeg-input';

/** Synchronous lifecycle handle keeps original callers/cancellation unchanged.
 * JPG preparation happens before the same native binary is launched.
 */
export const spawnUpscayl = (command: string[], logit: (...args: any[]) => void) => {
  const args = command.filter(arg => arg !== '');
  if (args[args.indexOf('-f') + 1] !== 'jpg') {
    logit('📢 Upscayl Command: ', args);
    const child = spawn(execPath, args, { cwd: undefined, detached: false });
    return { process: child, kill: () => child.kill() };
  }
  const stderr = new PassThrough(), stdout = new PassThrough();
  const process = Object.assign(new ChildProcess(), {
    stderr, stdout, stdin: new PassThrough(),
    spawnfile: execPath, spawnargs: [execPath, ...args],
  }) as ChildProcessWithoutNullStreams;
  let child: ChildProcessWithoutNullStreams | undefined;
  let cancelled = false;
  const kill = () => { cancelled = true; return child ? child.kill() : true; };
  // Do not start work before callers attach their existing progress/error hooks.
  void (async () => {
    let prepared: Awaited<ReturnType<typeof prepareJpegInput>> | undefined;
    try {
      prepared = await prepareJpegInput(command, logit, () => cancelled);
      if (cancelled) { await prepared.cleanup(); process.emit('close', null, 'SIGTERM'); return; }
      logit('📢 Upscayl Command: ', prepared.args);
      child = spawn(execPath, prepared.args, { cwd: undefined, detached: false });
      Object.assign(process, { spawnargs: child.spawnargs, pid: child.pid });
      child.stderr.pipe(stderr);
      child.stdout.pipe(stdout);
      child.once('error', error => process.emit('error', error));
      child.once('close', (code, signal) => {
        void prepared!.cleanup().catch(error => logit('Warning: temporary JPG input cleanup failed.', String(error)));
        process.emit('close', code, signal);
      });
    } catch (error) {
      if (prepared) await prepared.cleanup().catch(cleanupError => logit('Warning: temporary JPG input cleanup failed.', String(cleanupError)));
      if (!cancelled) process.emit('error', new Error(`Input preparation failed: ${String(error)}`));
      process.emit('close', cancelled ? null : 1, cancelled ? 'SIGTERM' : null);
    }
  })();
  return { process, kill };
};
