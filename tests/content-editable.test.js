import { html, fixture, assert } from "@open-wc/testing"
import "../exports/components/content-editable/content-editable-register.js"

suite('<content-editable>', () => {
  test("Should render a component", async () => {
    const el = await fixture(html` <content-editable></content-editable> `);

    assert(el.matches(":defined"), `"${el.tagName.toLowerCase()}" element should be ":defined"`)
  })
})
