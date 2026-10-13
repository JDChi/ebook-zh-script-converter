# 项目协作说明

## 项目定位

这是一个纯前端 EPUB 简繁转换工具。书籍在浏览器内读取、转换和下载，不应引入上传书籍内容的服务端流程。技术栈是 TypeScript、Vite、`opencc-wasm` 和 JSZip。

## 目录与职责

- `src/main.ts`：界面、文件选择、转换流程与下载。
- `src/epub.ts`：EPUB 读取、结构和大小检查、内容转换及输出检查。
- `src/converter.ts`：OpenCC 转换路线。通用繁体、台湾和香港路线的词汇行为不同。
- `src/i18n.ts`：简体和繁体界面文案。
- `scripts/copy-opencc-assets.mjs`：将 OpenCC 运行资源和许可声明复制到同源静态目录。
- `tests/`：转换路线测试和 EPUB 样本。

## 修改约定

- 保持书籍处理在浏览器本地完成；涉及隐私承诺的变化，要同步检查页面和 `public/privacy.html`。
- 不要把通用繁体、台湾繁体、香港繁体合并成同一条转换路线。修改路线时更新 `tests/routes.test.mjs`。
- 修改 EPUB 处理时保留输入大小、解压总量、条目数量、路径及 XML 检查；保持 `mimetype` 为输出 ZIP 中第一个、未压缩的条目。二进制资源应原样保留。
- 修改用户可见文案时同步检查 `src/i18n.ts` 中两种语言，以及首页的 SEO 文案。
- `public/vendor/` 和 `dist/` 是生成目录，不手工编辑；依赖版本以 `package-lock.json` 为准。
- 不把“基础检查通过”描述为 EPUBCheck 完整认证，也不把 AdSense 代码存在描述为广告已获批准。

## 验证

在本目录执行 `npm ci`、`npm test` 和 `npm run build`。涉及实际 EPUB 输出时，再用阅读器抽查章节、目录、图片和转换结果；自动化路线测试不能替代真实书籍检查。
