import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import sharp from 'sharp';

/** Work around the bundled CLI's RGBA -> JPEG stride bug without replacing it.
 * Only temporary inputs change; engine parameters, output encoder and originals stay intact.
 */
export async function prepareJpegInput(command: string[], log: (...args: any[]) => void, cancelled = () => false) {
  const args = command.filter(arg => arg !== '');
  const format = args[args.indexOf('-f') + 1];
  const inputIndex = args.indexOf('-i') + 1;
  let temporary: string | undefined;
  const cleanup = async () => { if (temporary) await fs.rm(temporary, { recursive: true, force: true }); };
  if (format !== 'jpg' || inputIndex === 0) return { args, cleanup };
  const input = args[inputIndex];
  const directory = (await fs.stat(input)).isDirectory();
  const files = directory ? (await fs.readdir(input, { withFileTypes: true })).filter(f => f.isFile() && /\.(png|jpe?g|jfif|webp)$/i.test(f.name)).map(f => path.join(input, f.name)) : [input];
  try {
    for (const file of files) {
      if (cancelled()) throw new Error('Preparation cancelled');
      const metadata = await sharp(file).metadata();
      if (!metadata.hasAlpha) continue;
      if (!temporary) temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'rastercue-jpeg-'));
      const target = path.join(temporary, path.basename(file));
      // Flatten on white is explicit in the JPG confirmation. For fully opaque
      // RGBA sources this removes only the unused alpha channel, not RGB pixels.
      await sharp(file).flatten({ background: '#ffffff' }).withMetadata().png().toFile(target);
      if (cancelled()) throw new Error('Preparation cancelled');
      log('JPG compatibility: prepared a temporary RGB input; source unchanged.', file);
    }
    if (temporary) {
      if (directory) for (const file of files) {
        if (cancelled()) throw new Error('Preparation cancelled');
        const target = path.join(temporary, path.basename(file));
        try { await fs.access(target); } catch { await fs.copyFile(file, target); }
      }
      args[inputIndex] = directory ? temporary : path.join(temporary, path.basename(input));
    }
    return { args, cleanup };
  } catch (error) { await cleanup(); throw error; }
}
