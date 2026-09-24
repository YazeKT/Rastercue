import { ELECTRON_COMMANDS as C } from '../../common/electron-commands';

// Keep the inherited engine's payloads unchanged while limiting the bridge to
// commands actually implemented by this application.
export const SEND_CHANNELS = new Set<string>([
  C.STOP, C.OPEN_FOLDER, C.GET_MODELS_LIST, C.UPSCAYL,
  C.FOLDER_UPSCAYL, C.DOUBLE_UPSCAYL, C.PASTE_IMAGE,
]);
export const INVOKE_CHANNELS = new Set<string>([
  C.SELECT_FOLDER, C.SELECT_FILE, C.SELECT_CUSTOM_MODEL_FOLDER,
  'get-gpu-info', 'get-app-version',
  'rastercue-models:bundled-folder',
  'rastercue-hardware:detect', 'rastercue-hardware:software',
]);
export const RECEIVE_CHANNELS = new Set<string>(Object.values(C));

export function isSafeExternalURL(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password;
  } catch { return false; }
}

export function isTrustedDocument(value: string, documentURL: string): boolean {
  try {
    const actual = new URL(value);
    const expected = new URL(documentURL);
    // Hash-only navigation is used by local UI controls; a different file,
    // server, or query is not another trusted application document.
    actual.hash = ''; expected.hash = '';
    return actual.href === expected.href;
  } catch { return false; }
}
