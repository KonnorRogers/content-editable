import { html, fixture, assert } from "@open-wc/testing"
import "../exports/components/content-editor/content-editor-register.js"

suite('<content-editor>', () => {
  test("Should render a component", async () => {
    const el = await fixture(html` <content-editor></content-editor> `);

    assert(el.matches(":defined"), `"${el.tagName.toLowerCase()}" element should be ":defined"`)
  })
})
