import fs from "fs/promises";
import path from "path";
import os from "os";
import sharp from "sharp";

const INPUT = /\.(png|jpe?g|jfif|webp|avif|tiff?)$/i;
const EXPANDED = /\.(avif|tiff?)$/i;
const MAX_PIXELS = 268_402_689;

async function exists(value: string) { try { await fs.access(value); return true; } catch { return false; } }

/** Normalizes only formats the locked native engine cannot read or write.
 * The original inputs and protected argument builder remain unchanged.
 */
export async function prepareEngineIO(command: string[], log: (...args: any[]) => void, cancelled = () => false) {
  const args = command.filter(Boolean);
  const inputIndex = args.indexOf("-i") + 1;
  const outputIndex = args.indexOf("-o") + 1;
  const formatIndex = args.indexOf("-f") + 1;
  let temporary: string | undefined;
  const cleanup = async () => { if (temporary) await fs.rm(temporary, { recursive: true, force: true }); };
  const makeTemporary = async () => temporary ||= await fs.mkdtemp(path.join(os.tmpdir(), "rastercue-io-"));
  const targetFormat = formatIndex > 0 ? args[formatIndex].toLowerCase() : "png";
  const originalOutput = outputIndex > 0 ? args[outputIndex] : "";
  const outputConversions: Array<{ source: string; target: string }> = [];
  try {
    if (inputIndex > 0) {
      const input = args[inputIndex];
      const directory = (await fs.stat(input)).isDirectory();
      const files = directory
        ? (await fs.readdir(input, { withFileTypes: true })).filter(entry => entry.isFile() && INPUT.test(entry.name)).map(entry => path.join(input, entry.name))
        : [input];
      const decisions: Array<{ file: string; convert: boolean }> = [];
      for (const file of files) {
        if (cancelled()) throw new Error("Preparation cancelled");
        const metadata = await sharp(file, { limitInputPixels: MAX_PIXELS, animated: false }).metadata();
        if ((metadata.pages || 1) > 1) throw new Error("Animated and multipage images are not supported. Export a single flattened frame or page.");
        if (!metadata.width || !metadata.height || metadata.width * metadata.height > MAX_PIXELS) throw new Error("The image exceeds Rastercue's safe pixel limit.");
        const convert = EXPANDED.test(file) || (targetFormat === "jpg" && metadata.hasAlpha);
        decisions.push({ file, convert });
      }
      if (decisions.some(decision => decision.convert)) {
        const root = path.join(await makeTemporary(), "input"); await fs.mkdir(root);
        const names = new Set<string>();
        for (const decision of decisions) {
          if (cancelled()) throw new Error("Preparation cancelled");
          const stem = path.parse(decision.file).name.toLowerCase();
          if (names.has(stem)) throw new Error(`The batch contains duplicate base names: ${path.parse(decision.file).name}. Rename one input first.`);
          names.add(stem);
          const target = path.join(root, decision.convert ? `${path.parse(decision.file).name}.png` : path.basename(decision.file));
          if (decision.convert) {
            let pipeline = sharp(decision.file, { limitInputPixels: MAX_PIXELS, animated: false }).rotate().toColourspace("srgb");
            if (targetFormat === "jpg") pipeline = pipeline.flatten({ background: "#ffffff" });
            await pipeline.png().toFile(target);
            log("Prepared a temporary RGB/sRGB working image; source unchanged.", decision.file);
          } else {
            try { await fs.link(decision.file, target); } catch { await fs.copyFile(decision.file, target); }
          }
        }
        args[inputIndex] = directory ? root : path.join(root, `${path.parse(input).name}.png`);
      }
    }
    if (formatIndex > 0 && outputIndex > 0 && ["avif", "tif", "tiff"].includes(targetFormat)) {
      const outputStatIsDirectory = await exists(originalOutput) && (await fs.stat(originalOutput)).isDirectory();
      const root = path.join(await makeTemporary(), "output"); await fs.mkdir(root, { recursive: true });
      args[formatIndex] = "png";
      if (outputStatIsDirectory) args[outputIndex] = root;
      else args[outputIndex] = path.join(root, `${path.parse(originalOutput).name}.png`);
      const finalize = async () => {
        const generated = outputStatIsDirectory ? (await fs.readdir(root)).filter(name => /\.png$/i.test(name)).map(name => path.join(root, name)) : [args[outputIndex]];
        if (!generated.length || !(await exists(generated[0]))) throw new Error("The native engine did not create the expected working output.");
        for (const source of generated) {
          if (cancelled()) throw new Error("Final conversion cancelled");
          const target = outputStatIsDirectory ? path.join(originalOutput, `${path.parse(source).name}.${targetFormat === "avif" ? "avif" : "tiff"}`) : originalOutput;
          if (await exists(target)) throw new Error(`Output already exists: ${path.basename(target)}`);
          const pipeline = sharp(source, { limitInputPixels: MAX_PIXELS }).withMetadata();
          if (targetFormat === "avif") await pipeline.avif({ quality: 90 }).toFile(target);
          else await pipeline.tiff({ compression: "lzw" }).toFile(target);
          outputConversions.push({ source, target });
        }
        log(`Converted verified working output to ${targetFormat.toUpperCase()}.`);
      };
      return { args, finalize, cleanup };
    }
    const finalize = async () => {
      if (!originalOutput) return;
      const stat = await fs.stat(originalOutput).catch(() => null);
      if (!stat) throw new Error("The native engine exited without creating the expected output.");
      if (stat.isDirectory()) {
        const outputs = (await fs.readdir(originalOutput)).filter(name => INPUT.test(name));
        if (!outputs.length) throw new Error("The native engine completed without a readable batch output.");
        await sharp(path.join(originalOutput, outputs[0]), { limitInputPixels: MAX_PIXELS }).metadata();
      } else {
        const metadata = await sharp(originalOutput, { limitInputPixels: MAX_PIXELS }).metadata();
        if (!metadata.width || !metadata.height) throw new Error("The native engine output could not be verified.");
      }
    };
    return { args, finalize, cleanup };
  } catch (error) { await cleanup(); throw error; }
}
