export type Locale = 'zh-CN' | 'zh-Hant';

const translations = {
  'zh-CN': {
    name: '书字转换器', intro: 'EPUB 简繁转换器', description: '在线进行 EPUB 简繁转换，支持 EPUB 简体转繁体、繁体转简体及台湾、香港版本。书籍文件在浏览器本地处理，转换完成后直接下载。',
    upload: '选择 EPUB 文件', drop: '或将文件拖到这里', size: '单本不超过 50 MB', source: '原书文字', target: '转换为', swap: '交换方向',
    hans: '简体中文', traditional: '繁体中文', hk: '香港版本', tw: '台湾版本', regionTitle: '地区版本（可选）', regionDefault: '不选时，按通用简繁规则直接转换。', regionTw: '使用台湾字形和惯用词，例如「裡」「軟體」。', regionHk: '使用香港字形，例如「裏」；地区词汇覆盖有限。', regionClear: '恢复通用转换',
    convert: '转换并下载', converting: '正在转换', ready: '转换完成，可以下载', download: '下载 EPUB',
    privacy: '本地处理', privacyText: '书籍内容只在当前浏览器处理。', structure: '保留排版', structureText: '保留图片、字体、样式和章节结构。',
    note: '文字转换可能有少量语境歧义；建议下载后在阅读器中抽查。', privacyPolicy: '隐私政策',
    howTitle: '如何转换 EPUB 电子书', howStep1: '选择不超过 50 MB 的 EPUB 文件。', howStep2: '选择 EPUB 简体转繁体或繁体转简体；需要时再选择台湾或香港版本。', howStep3: '点击转换并下载，在阅读器中抽查文字和排版。',
    scopeTitle: '转换范围与限制', scopeText: '工具会转换正文、目录及部分书籍元数据中的文字，保留图片、字体、样式和章节结构。暂不支持加密或受 DRM 保护的 EPUB；多义字和词组可能需要人工核对。',
    faqTitle: '常见问题', faqQuestion: '从 Z-Library 获取的 EPUB 可以转换吗？', faqAnswer: '只要文件是未加密、不超过 50 MB 且结构有效的 EPUB，就可以像其他 EPUB 一样在浏览器本地转换。本站与该平台无关联。',
    statusChecking: '正在读取 EPUB…', statusWorking: '正在处理章节…',
    error_BAD_FILE: '请选择不超过 50 MB 的 .epub 文件。', error_BAD_EPUB: '文件不是有效的 EPUB，或 ZIP 结构已损坏。', error_BAD_STRUCTURE: 'EPUB 缺少必要结构或引用的文件。', error_BAD_XML: '书内的 XML/XHTML 结构有误。', error_ENCRYPTED: '暂不支持加密或受 DRM 保护的 EPUB。', error_TOO_LARGE: '解压后的书籍过大，超过 200 MB 或文件数量上限。', error_GENERIC: '处理失败，请换一本 EPUB 再试。',
  },
  'zh-Hant': {
    name: '書字轉換器', intro: 'EPUB 簡繁轉換器', description: '在線進行 EPUB 簡繁轉換，支援 EPUB 簡體轉繁體、繁體轉簡體及台灣、香港版本。書籍檔案在瀏覽器本機處理，轉換完成後直接下載。',
    upload: '選擇 EPUB 檔案', drop: '或將檔案拖到此處', size: '單本不超過 50 MB', source: '原書文字', target: '轉換為', swap: '交換方向',
    hans: '簡體中文', traditional: '繁體中文', hk: '香港版本', tw: '台灣版本', regionTitle: '地區版本（可選）', regionDefault: '不選時，按通用簡繁規則直接轉換。', regionTw: '使用台灣字形和慣用詞，例如「裡」「軟體」。', regionHk: '使用香港字形，例如「裏」；地區詞彙涵蓋有限。', regionClear: '恢復通用轉換',
    convert: '轉換並下載', converting: '正在轉換', ready: '轉換完成，可以下載', download: '下載 EPUB',
    privacy: '本地處理', privacyText: '書籍內容只在目前的瀏覽器處理。', structure: '保留排版', structureText: '保留圖片、字體、樣式和章節結構。',
    note: '文字轉換可能有少量語境歧義；建議下載後在閱讀器中抽查。', privacyPolicy: '隱私政策',
    howTitle: '如何轉換 EPUB 電子書', howStep1: '選擇不超過 50 MB 的 EPUB 檔案。', howStep2: '選擇 EPUB 簡體轉繁體或繁體轉簡體；需要時再選擇台灣或香港版本。', howStep3: '點擊轉換並下載，在閱讀器中抽查文字和排版。',
    scopeTitle: '轉換範圍與限制', scopeText: '工具會轉換正文、目錄及部分書籍中繼資料中的文字，保留圖片、字型、樣式和章節結構。暫不支援加密或受 DRM 保護的 EPUB；多義字和詞組可能需要人工核對。',
    faqTitle: '常見問題', faqQuestion: '從 Z-Library 取得的 EPUB 可以轉換嗎？', faqAnswer: '只要檔案是未加密、不超過 50 MB 且結構有效的 EPUB，就可以像其他 EPUB 一樣在瀏覽器本機轉換。本站與該平台無關聯。',
    statusChecking: '正在讀取 EPUB…', statusWorking: '正在處理章節…',
    error_BAD_FILE: '請選擇不超過 50 MB 的 .epub 檔案。', error_BAD_EPUB: '檔案不是有效的 EPUB，或 ZIP 結構已損壞。', error_BAD_STRUCTURE: 'EPUB 缺少必要結構或引用的檔案。', error_BAD_XML: '書內的 XML/XHTML 結構有誤。', error_ENCRYPTED: '暫不支援加密或受 DRM 保護的 EPUB。', error_TOO_LARGE: '解壓後的書籍過大，超過 200 MB 或檔案數量上限。', error_GENERIC: '處理失敗，請換一本 EPUB 再試。',
  },
} as const;

export type Messages = { [Key in keyof typeof translations['zh-CN']]: string };
export const messages = (locale: Locale): Messages => translations[locale];

export function initialLocale(): Locale {
  try {
    const stored = localStorage.getItem('shuzi-locale');
    if (stored === 'zh-CN' || stored === 'zh-Hant') return stored;
    if (stored === 'zh-HK' || stored === 'zh-TW') return 'zh-Hant';
  } catch { /* localStorage may be disabled */ }
  for (const value of navigator.languages || [navigator.language]) {
    const tag = value.toLowerCase();
    if (tag.startsWith('zh') && (tag.includes('hant') || tag.includes('hk') || tag.includes('mo') || tag.includes('tw'))) return 'zh-Hant';
    if (tag.startsWith('zh')) return 'zh-CN';
  }
  return 'zh-CN';
}
