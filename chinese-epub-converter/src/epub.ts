import JSZip, { type JSZipObject } from 'jszip';

const MAX_FILE = 50 * 1024 * 1024;
const MAX_UNCOMPRESSED = 200 * 1024 * 1024;
const MAX_ENTRIES = 5000;
const XML_TYPES = new Set(['application/xhtml+xml', 'application/x-dtbncx+xml']);

export type EpubBook = {
  zip: JSZip;
  opfPath: string;
  textPaths: string[];
  title: string;
};

function fail(code: string): never { throw new Error(code); }

function xml(content: string): Document {
  const doc = new DOMParser().parseFromString(content, 'application/xml');
  if (doc.getElementsByTagName('parsererror').length || !doc.documentElement) fail('BAD_XML');
  return doc;
}

function childrenByName(parent: ParentNode, name: string): Element[] {
  return Array.from(parent.querySelectorAll('*')).filter((node) => node.localName === name);
}

function safePath(base: string, href: string): string {
  let decoded: string;
  try { decoded = decodeURIComponent(href.split('#')[0].split('?')[0]); }
  catch { return fail('BAD_STRUCTURE'); }
  if (/^[a-z]+:/i.test(decoded) || decoded.startsWith('/')) fail('BAD_STRUCTURE');
  const parts = [...base.split('/').filter(Boolean)];
  for (const segment of decoded.split('/')) {
    if (!segment || segment === '.') continue;
    if (segment === '..') {
      if (!parts.length) fail('BAD_STRUCTURE');
      parts.pop();
    } else parts.push(segment);
  }
  return parts.join('/');
}

function zipFile(zip: JSZip, path: string): JSZipObject {
  const file = zip.file(path);
  if (!file) fail('BAD_STRUCTURE');
  return file;
}

async function checkPackage(zip: JSZip): Promise<{ opfPath: string; textPaths: string[]; title: string }> {
  const mimetype = await zipFile(zip, 'mimetype').async('string');
  if (mimetype !== 'application/epub+zip') fail('BAD_EPUB');
  if (zip.file('META-INF/encryption.xml')) fail('ENCRYPTED');
  const container = xml(await zipFile(zip, 'META-INF/container.xml').async('string'));
  const rootfile = childrenByName(container, 'rootfile')[0];
  const opfPath = rootfile?.getAttribute('full-path');
  if (!opfPath || opfPath.startsWith('/') || opfPath.split('/').includes('..')) fail('BAD_STRUCTURE');
  const opf = xml(await zipFile(zip, opfPath).async('string'));
  if (opf.documentElement.localName !== 'package') fail('BAD_STRUCTURE');
  const base = opfPath.includes('/') ? opfPath.slice(0, opfPath.lastIndexOf('/')) : '';
  const manifest = new Map<string, { path: string; media: string; properties: string }>();
  for (const item of childrenByName(opf, 'item')) {
    const id = item.getAttribute('id');
    const href = item.getAttribute('href');
    if (!id || !href) fail('BAD_STRUCTURE');
    const path = safePath(base, href);
    zipFile(zip, path);
    manifest.set(id, { path, media: item.getAttribute('media-type') || '', properties: item.getAttribute('properties') || '' });
  }
  if (!manifest.size) fail('BAD_STRUCTURE');
  const spine = childrenByName(opf, 'spine')[0];
  const textPaths: string[] = [];
  for (const ref of spine ? childrenByName(spine, 'itemref') : []) {
    const item = manifest.get(ref.getAttribute('idref') || '');
    if (!item || item.media !== 'application/xhtml+xml') fail('BAD_STRUCTURE');
    if (!textPaths.includes(item.path)) textPaths.push(item.path);
  }
  if (!textPaths.length) fail('BAD_STRUCTURE');
  for (const item of manifest.values()) {
    if ((XML_TYPES.has(item.media) || item.properties.split(/\s+/).includes('nav')) && !textPaths.includes(item.path)) textPaths.push(item.path);
  }
  const metadata = childrenByName(opf, 'metadata')[0];
  const title = metadata ? childrenByName(metadata, 'title')[0]?.textContent?.trim() || '' : '';
  return { opfPath, textPaths, title };
}

export async function loadEpub(file: File): Promise<EpubBook> {
  if (!/\.epub$/i.test(file.name) || file.size > MAX_FILE || !file.size) fail('BAD_FILE');
  const bytes = await file.arrayBuffer();
  const head = new DataView(bytes);
  if (bytes.byteLength < 58 || head.getUint32(0, true) !== 0x04034b50 || head.getUint16(8, true) !== 0 || head.getUint16(26, true) !== 8) fail('BAD_EPUB');
  const firstName = new TextDecoder().decode(new Uint8Array(bytes, 30, 8));
  if (firstName !== 'mimetype') fail('BAD_EPUB');
  let zip: JSZip;
  try { zip = await JSZip.loadAsync(bytes); }
  catch { return fail('BAD_EPUB'); }
  const entries = Object.values(zip.files);
  if (entries.length > MAX_ENTRIES) fail('TOO_LARGE');
  let total = 0;
  for (const entry of entries) {
    if (entry.name.startsWith('/') || entry.name.split('/').includes('..')) fail('BAD_STRUCTURE');
    if (entry.dir) continue;
    const size = (entry as JSZipObject & { _data?: { uncompressedSize?: number } })._data?.uncompressedSize;
    if (size === undefined) fail('BAD_EPUB');
    total += size;
    if (total > MAX_UNCOMPRESSED) fail('TOO_LARGE');
  }
  try { zip = await JSZip.loadAsync(bytes, { checkCRC32: true }); }
  catch { return fail('BAD_EPUB'); }
  const { opfPath, textPaths, title } = await checkPackage(zip);
  return { zip, opfPath, textPaths, title };
}

async function convertDocument(content: string, convert: (text: string) => Promise<string>, language: string, metadataOnly = false): Promise<string> {
  const doc = xml(content);
  const nodes: Text[] = [];
  const walker = doc.createTreeWalker(doc, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const parent = node.parentElement;
    if (!parent || !node.data.trim() || ['style', 'script'].includes(parent.localName)) continue;
    if (metadataOnly && !['title', 'creator', 'subject', 'description', 'publisher', 'contributor'].includes(parent.localName)) continue;
    nodes.push(node);
  }
  for (const node of nodes) node.data = await convert(node.data);
  if (metadataOnly) {
    for (const element of childrenByName(doc, 'language')) {
      if (/^zh(?:-|$)/i.test(element.textContent?.trim() || '')) element.textContent = language;
    }
  } else {
    const root = doc.documentElement;
    for (const name of ['lang', 'xml:lang']) {
      const value = root.getAttribute(name);
      if (value && /^zh(?:-|$)/i.test(value)) root.setAttribute(name, language);
    }
  }
  if (!metadataOnly) {
    for (const element of Array.from(doc.querySelectorAll('[alt], [title]'))) {
      for (const attr of ['alt', 'title']) {
        const value = element.getAttribute(attr);
        if (value) element.setAttribute(attr, await convert(value));
      }
    }
  }
  return new XMLSerializer().serializeToString(doc);
}

export async function makeEpub(book: EpubBook, convert: (text: string) => Promise<string>, language: string, onProgress?: (done: number, total: number) => void): Promise<Blob> {
  const output = new JSZip();
  output.file('mimetype', 'application/epub+zip', { compression: 'STORE' });
  const convertPaths = new Set(book.textPaths);
  const files = Object.values(book.zip.files).filter((entry) => !entry.dir && entry.name !== 'mimetype');
  let done = 0;
  for (const file of files) {
    let data: string | Uint8Array;
    if (file.name === book.opfPath || convertPaths.has(file.name)) {
      const original = await file.async('string');
      data = await convertDocument(original, convert, language, file.name === book.opfPath);
    } else data = await file.async('uint8array');
    output.file(file.name, data, { compression: 'DEFLATE', date: file.date, createFolders: false });
    onProgress?.(++done, files.length);
    if (done % 3 === 0) await new Promise<void>((resolve) => setTimeout(resolve, 0));
  }
  const blob = await output.generateAsync({ type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } });
  const verified = await JSZip.loadAsync(blob);
  await checkPackage(verified);
  for (const path of book.textPaths) xml(await zipFile(verified, path).async('string'));
  return blob;
}
