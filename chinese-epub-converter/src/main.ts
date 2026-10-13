import './style.css';
import { createTextConverter, type Script } from './converter';
import { loadEpub, makeEpub, type EpubBook } from './epub';
import { initialLocale, messages, type Locale } from './i18n';

const app = document.querySelector<HTMLDivElement>('#app')!;
let locale = initialLocale();
let direction: 's2t' | 't2s' = locale === 'zh-Hant' ? 's2t' : 't2s';
let region: '' | 'tw' | 'hk' = '';
let book: EpubBook | undefined;
let filename = '';
let outputUrl: string | undefined;
let outputName = '';
let busy = false;

const $ = <T extends HTMLElement>(selector: string): T => app.querySelector<T>(selector)!;
const route = (): [Script, Script] => direction === 's2t' ? ['hans', region || 't'] : [region || 't', 'hans'];

function setStatus(message: string, error = false) {
  const element = $('#status');
  element.textContent = message;
  element.classList.toggle('error', error);
}

function clearDownload() {
  if (outputUrl) URL.revokeObjectURL(outputUrl);
  outputUrl = undefined;
  $('#download').hidden = true;
  $('#convert').hidden = false;
}

function updateOptions() {
  $<HTMLSelectElement>('#source-family').value = direction === 's2t' ? 'hans' : 'traditional';
  $<HTMLSelectElement>('#target-family').value = direction === 's2t' ? 'traditional' : 'hans';
  $<HTMLInputElement>('#region-tw').checked = region === 'tw';
  $<HTMLInputElement>('#region-hk').checked = region === 'hk';
  $('#clear-region').hidden = !region;
  $<HTMLButtonElement>('#convert').disabled = !book || busy;
}

function updateDirection() {
  clearDownload();
  updateOptions();
  setStatus(book?.title || filename);
}

function showError(error: unknown) {
  const code = error instanceof Error ? error.message : '';
  const key = `error_${code}` as keyof ReturnType<typeof messages>;
  setStatus(messages(locale)[key] || messages(locale).error_GENERIC, true);
}

async function receiveFile(file?: File) {
  if (!file || busy) return;
  book = undefined;
  filename = file.name;
  clearDownload();
  $('#file-name').textContent = file.name;
  setStatus(messages(locale).statusChecking);
  updateOptions();
  try {
    book = await loadEpub(file);
    setStatus(book.title || file.name);
    updateOptions();
  } catch (error) {
    book = undefined;
    updateOptions();
    showError(error);
  }
}

async function convertBook() {
  if (!book || busy) return;
  busy = true;
  updateOptions();
  const button = $<HTMLButtonElement>('#convert');
  button.textContent = messages(locale).converting + '…';
  setStatus(messages(locale).statusWorking);
  try {
    const [source, target] = route();
    const converter = await createTextConverter(source, target);
    const language = target === 'hans' ? 'zh-CN' : target === 'hk' ? 'zh-HK' : target === 'tw' ? 'zh-TW' : 'zh-Hant';
    const blob = await makeEpub(book, converter, language, (done, total) => {
      setStatus(`${messages(locale).statusWorking} ${Math.round(done / total * 100)}%`);
    });
    outputUrl = URL.createObjectURL(blob);
    const link = $<HTMLAnchorElement>('#download');
    link.href = outputUrl;
    const suffix = target === 'hans' ? '简体' : target === 'hk' ? '香港繁体' : target === 'tw' ? '台湾繁体' : '繁体';
    outputName = `${filename.replace(/\.epub$/i, '')}-${suffix}.epub`;
    link.download = outputName;
    link.hidden = false;
    button.hidden = true;
    setStatus(messages(locale).ready);
  } catch (error) { showError(error); }
  finally {
    busy = false;
    button.textContent = messages(locale).convert;
    updateOptions();
  }
}

function render() {
  const m = messages(locale);
  document.documentElement.lang = locale;
  document.title = `${m.name} · EPUB`;
  app.innerHTML = `
    <div class="site-shell">
      <a class="skip-link" href="#tool">${m.upload}</a>
      <header class="topbar">
        <a class="wordmark" href="/" aria-label="${m.name}"><span class="mark">字</span><span>${m.name}</span></a>
        <span class="header-center">EPUB / TYPE CONVERTER</span>
        <label class="locale-control"><span class="sr-only">Language</span><select id="locale" aria-label="Language">
          <option value="zh-CN">简体中文</option><option value="zh-Hant">繁體中文</option>
        </select></label>
      </header>
      <main>
        <section class="hero" aria-labelledby="hero-title">
          <h1 id="hero-title">${m.intro}</h1>
          <p class="hero-description">${m.description}</p>
        </section>
        <section id="tool" class="workspace" aria-label="EPUB converter">
          <div class="editor">
            <div class="editor-header"><span class="step">01</span><h2>EPUB</h2><span class="file-limit">${m.size}</span></div>
            <div id="dropzone" class="dropzone">
              <input id="file" type="file" accept=".epub,application/epub+zip" class="sr-only" />
              <div class="book-icon" aria-hidden="true"><span></span><span></span><span></span></div>
              <button id="choose" class="choose-button" type="button">${m.upload}<span aria-hidden="true"> ↗</span></button>
              <p>${m.drop}</p><strong id="file-name"></strong>
            </div>
            <div class="direction">
              <div class="select-group"><label for="source-family">${m.source}</label><select id="source-family"><option value="hans">${m.hans}</option><option value="traditional">${m.traditional}</option></select></div>
              <button id="swap" class="swap" type="button" aria-label="${m.swap}" title="${m.swap}">⇄</button>
              <div class="select-group"><label for="target-family">${m.target}</label><select id="target-family"><option value="hans">${m.hans}</option><option value="traditional">${m.traditional}</option></select></div>
            </div>
            <fieldset class="region-choices"><legend>${m.regionTitle}</legend><p class="region-default">${m.regionDefault}</p><div class="region-list"><label class="region-option"><input id="region-tw" type="radio" name="region" value="tw" /><span><strong>${m.tw}</strong><small>${m.regionTw}</small></span></label><label class="region-option"><input id="region-hk" type="radio" name="region" value="hk" /><span><strong>${m.hk}</strong><small>${m.regionHk}</small></span></label></div><button id="clear-region" type="button" class="clear-region" hidden>${m.regionClear}</button></fieldset>
            <div class="action-row"><button id="convert" class="primary" type="button">${m.convert}</button><a id="download" class="primary" hidden>${m.download}</a></div>
            <p id="status" class="status" role="status" aria-live="polite"></p>
          </div>
        </section>
        <section class="features" aria-label="Features"><article><span class="feature-icon">◇</span><h3>${m.privacy}</h3><p>${m.privacyText}</p></article><article><span class="feature-icon">▤</span><h3>${m.structure}</h3><p>${m.structureText}</p></article></section>
        <p class="footnote">${m.note}</p>
      </main>
      <footer><span>${m.name}</span><a href="/privacy.html">${m.privacyPolicy}</a><span>EPUB · OpenCC WASM</span></footer>
    </div>`;
  $<HTMLSelectElement>('#locale').value = locale;
  $('#file-name').textContent = filename;
  $('#locale').addEventListener('change', (event) => {
    locale = (event.target as HTMLSelectElement).value as Locale;
    direction = locale === 'zh-Hant' ? 's2t' : 't2s';
    try { localStorage.setItem('shuzi-locale', locale); } catch { /* no persistence */ }
    render();
  });
  $('#choose').addEventListener('click', () => $<HTMLInputElement>('#file').click());
  $('#file').addEventListener('change', (event) => receiveFile((event.target as HTMLInputElement).files?.[0]));
  const zone = $('#dropzone');
  zone.addEventListener('dragover', (event) => { event.preventDefault(); zone.classList.add('dragging'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragging'));
  zone.addEventListener('drop', (event) => { event.preventDefault(); zone.classList.remove('dragging'); receiveFile(event.dataTransfer?.files[0]); });
  $('#source-family').addEventListener('change', (event) => {
    direction = (event.target as HTMLSelectElement).value === 'hans' ? 's2t' : 't2s';
    updateDirection();
  });
  $('#target-family').addEventListener('change', (event) => {
    direction = (event.target as HTMLSelectElement).value === 'hans' ? 't2s' : 's2t';
    updateDirection();
  });
  $('#swap').addEventListener('click', () => { direction = direction === 's2t' ? 't2s' : 's2t'; updateDirection(); });
  for (const input of app.querySelectorAll<HTMLInputElement>('input[name="region"]')) {
    input.addEventListener('change', () => { region = input.value as 'tw' | 'hk'; updateDirection(); });
  }
  $('#clear-region').addEventListener('click', () => { region = ''; updateDirection(); });
  $('#convert').addEventListener('click', convertBook);
  updateOptions();
  if (outputUrl) {
    const link = $<HTMLAnchorElement>('#download');
    link.href = outputUrl;
    link.download = outputName;
    link.hidden = false;
    $('#convert').hidden = true;
    setStatus(m.ready);
  } else setStatus(book?.title || filename);
}

render();
