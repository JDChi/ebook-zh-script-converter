# 书字转换器

一个在浏览器本地处理 EPUB 的简繁文字转换网站。支持简体与繁体双向转换；默认使用通用简繁规则，也可以选择台湾或香港版本。台湾版本包含惯用词转换；香港版本采用香港字形，地区词汇覆盖有限。转换核心是 `opencc-wasm`，EPUB 打包使用 JSZip。

在线使用：[EPUB 简繁转换器](https://epub-zh-script-converter.jdchi.tech/) · [GitHub 仓库](https://github.com/JDChi/ebook-zh-script-converter)

## 本地运行

在仓库根目录安装依赖并启动：

```sh
npm ci
npm run dev
```

访问终端输出的本地地址。常用命令：

| 命令 | 用途 |
| --- | --- |
| `npm test` | 检查六条简繁转换路线及地区词汇差异 |
| `npm run build` | 执行 TypeScript 检查并生成静态文件到 `dist/` |
| `npm run preview` | 本地预览构建产物 |

`dev`、`test` 和 `build` 会先运行 `prepare:wasm`，将 OpenCC 的 WASM、配置、字典和许可声明从依赖复制到 `public/vendor/`。这些资源由本站同源提供。`public/vendor/` 和 `dist/` 是生成目录，已被 Git 忽略。

## 代码结构

- `src/main.ts`：界面、文件选择、转换进度与下载。
- `src/epub.ts`：EPUB 校验、文本转换、重新打包及输出基础检查。
- `src/converter.ts`：OpenCC 转换路线。
- `src/i18n.ts`：简体和繁体界面文案。
- `tests/`：转换路线测试和 EPUB 样本。
- `public/`：隐私政策、404 页面、搜索引擎文件和广告声明。

协作和修改约定见 [AGENTS.md](./AGENTS.md)。

## 部署

项目部署在 [Cloudflare Pages](https://epub-zh-script-converter.pages.dev/)，自定义域名为 [epub-zh-script-converter.jdchi.tech](https://epub-zh-script-converter.jdchi.tech/)。构建输出目录是仓库根目录的 `dist/`。发布前运行 `npm test` 和 `npm run build`；使用已有 Pages 项目发布：

```sh
wrangler pages deploy dist --project-name epub-zh-script-converter --branch main
```

上线后检查首页、`/privacy`、`/robots.txt`、`/sitemap.xml` 和不存在路径的状态码及内容。

## 处理范围

- 上传后检查 `mimetype`、ZIP 完整性、容器、OPF、manifest 和 spine；限制 50 MiB 压缩文件、200 MiB 解压总量、5000 个文件。
- 转换正文 XHTML、目录导航、NCX 文字，以及书名、作者等 OPF 文本元数据；图片、字体、CSS 和其他二进制资源原样保留。
- 下载前重新读取生成的 EPUB，检查关键文件和 XML 能否解析。基础检查不等于完整 EPUBCheck 认证。
- 暂不支持加密或 DRM 保护的 EPUB。OpenCC 可能对多义字或词组作出不合语境的转换，建议在阅读器中抽查。
- 整个处理过程在浏览器中进行，不上传书籍。界面语言优先读取浏览器语言，也可以手动切换并保存在本机。

## 广告与许可

首页使用发布商 `pub-2486777822040422` 的 AdSense 代码，`public/ads.txt` 也包含该发布商声明。代码上线不代表广告已获准展示；网站接入、审核和广告设置需在 AdSense 中完成。子域名的 `ads.txt` 不能代替根域名的文件。

项目使用 `opencc-wasm`。其许可证和声明会复制到 `public/vendor/opencc-wasm/` 并进入构建产物。请同时遵守 JSZip 和其他依赖的许可。
