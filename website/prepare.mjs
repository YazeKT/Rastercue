import { copyFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const websiteDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryDirectory = resolve(websiteDirectory, "..");

const copies = [
  ["docs/screenshots/workspace.png", "website/assets/workspace.png"],
  ["renderer/fonts/poppins/Poppins-Regular.ttf", "website/assets/fonts/Poppins-Regular.ttf"],
  ["renderer/fonts/poppins/Poppins-SemiBold.ttf", "website/assets/fonts/Poppins-SemiBold.ttf"],
];

for (const [source, destination] of copies) {
  const target = resolve(repositoryDirectory, destination);
  await mkdir(dirname(target), { recursive: true });
  await copyFile(resolve(repositoryDirectory, source), target);
  console.log(`Prepared ${destination}`);
}
