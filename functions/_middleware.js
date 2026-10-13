const OLD_HOST = "epub-zh-script-converter.jdchi.tech";
const NEW_HOST = "ebook-zh-script-converter.jdchi.tech";

export function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === OLD_HOST) {
    url.protocol = "https:";
    url.hostname = NEW_HOST;
    return Response.redirect(url, 301);
  }

  return context.next();
}
