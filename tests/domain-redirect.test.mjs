import assert from "node:assert/strict";
import test from "node:test";
import { onRequest } from "../functions/_middleware.js";

test("old custom domain redirects to the new domain with path and query", () => {
  const response = onRequest({
    request: new Request("http://epub-zh-script-converter.jdchi.tech/privacy?from=bookmark"),
    next: () => { throw new Error("unexpected next call"); },
  });

  assert.equal(response.status, 301);
  assert.equal(response.headers.get("location"), "https://ebook-zh-script-converter.jdchi.tech/privacy?from=bookmark");
});

test("the new custom domain and other bound hosts continue normally", () => {
  for (const host of ["ebook-zh-script-converter.jdchi.tech", "jdchi.tech"]) {
    const expected = { host };
    const actual = onRequest({
      request: new Request(`https://${host}/`),
      next: () => expected,
    });
    assert.equal(actual, expected);
  }
});
