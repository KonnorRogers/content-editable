import type ContentEditable from "./content-editable.js"

declare global {
  interface HTMLElementTagNameMap {
    'content-editable': ContentEditable
  }
}

export {}
