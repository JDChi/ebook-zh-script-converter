export type Script = 'hans' | 't' | 'hk' | 'tw';

type OpenCCConverter = (input: string) => Promise<string>;
type OpenCCModule = { OpenCC: { Converter(options: { from: string; to: string; includeTofuRiskDictionaries?: boolean }): OpenCCConverter } };

let modulePromise: Promise<OpenCCModule> | undefined;
const cache = new Map<string, OpenCCConverter>();

function getModule(): Promise<OpenCCModule> {
  const path = new URL('vendor/opencc-wasm/esm/index.js', document.baseURI).href;
  modulePromise ??= import(/* @vite-ignore */ path) as Promise<OpenCCModule>;
  return modulePromise;
}

export async function createTextConverter(source: Script, target: Script): Promise<OpenCCConverter> {
  if (source === target) throw new Error('SAME_SCRIPT');
  const key = `${source}:${target}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const { OpenCC } = await getModule();
  const make = (from: string, to: string) => OpenCC.Converter({ from, to, includeTofuRiskDictionaries: false });
  let convert: OpenCCConverter;
  if (source === 'hans' && target === 't') convert = make('cn', 't');
  else if (source === 't' && target === 'hans') convert = make('t', 'cn');
  else if (source === 'hans' && target === 'tw') convert = make('cn', 'twp');
  else if (source === 'tw' && target === 'hans') convert = make('tw', 'sp');
  else if (source === 'hans' && target === 'hk') convert = make('cn', 'hk');
  else if (source === 'hk' && target === 'hans') convert = make('hk', 'cn');
  else throw new Error('UNSUPPORTED_ROUTE');
  cache.set(key, convert);
  return convert;
}
