import fs from 'fs';
import path from 'path';
import { MODELS } from '../../common/models-list';

export function builtInModelAvailability(folder: string): Record<string, boolean> {
  return Object.fromEntries(Object.keys(MODELS).map(id => [id,
    ['bin', 'param'].every(extension => {
      try { return fs.statSync(path.join(folder, `${id}.${extension}`)).isFile(); }
      catch { return false; }
    }),
  ]));
}
