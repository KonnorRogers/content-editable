import type ContentEditor from "./content-editor.js"

declare global {
  interface HTMLElementTagNameMap {
    'content-editor': ContentEditor
  }

  interface Selection {
    getComposedRanges?(...shadowRoots: Node[]): StaticRange[]
  }
}

/**
 * @see {https://w3c.github.io/input-events/}
 */
interface InputHandlers {
  insertText: (evt: InputEvent, start: number, end: number) => void
  /** insert or replace existing content by means of a spell checker, auto-correct, writing suggestions or similar  */
  insertReplacementText: (evt: InputEvent, start: number, end: number) => void
  insertLineBreak: (evt: InputEvent, start: number, end: number) => void
  insertParagraph: (evt: InputEvent, start: number, end: number) => void
  insertFromYank: (evt: InputEvent, start: number, end: number) => void
  insertFromDrop: (evt: InputEvent, start: number, end: number) => void
  insertFromPaste: (evt: InputEvent, start: number, end: number) => void

  /** transpose the last two grapheme cluster. that were entered  */
  insertTranspose: (evt: InputEvent, start: number, end: number) => void

  /**  	replace the current composition string  */
  insertCompositionText: (evt: InputEvent, start: number, end: number) => void

  /**  delete a word directly before the caret position  */
  deleteWordBackward: (evt: InputEvent, start: number, end: number) => void

  /**  delete a word directly after the caret position  */
  deleteWordForward: (evt: InputEvent, start: number, end: number) => void

  /**  delete from the caret to the nearest visual line break before the caret position  */
  deleteSoftLineBackward: (evt: InputEvent, start: number, end: number) => void

  /**  delete from the caret to the nearest visual line break after the caret position  */
  deleteSoftLineForward: (evt: InputEvent, start: number, end: number) => void

  /**  delete from the nearest visual line break before the caret position to the nearest visual line break after the caret position  */
  deleteEntireSoftLine: (evt: InputEvent, start: number, end: number) => void

  /**  delete from the caret to the nearest beginning of a block element or br element before the caret position  */
  deleteHardLineBackward: (evt: InputEvent, start: number, end: number) => void

  /**  delete from the caret to the nearest end of a block element or br element after the caret position  */
  deleteHardLineForward: (evt: InputEvent, start: number, end: number) => void

  deleteByCut: (evt: InputEvent, start: number, end: number) => void

  /**  delete the selection without specifying the direction of the deletion and this intention is not covered by another inputType  */
  deleteContent: (evt: InputEvent, start: number, end: number) => void

  /**  delete the content directly before the caret position and this intention is not covered by another inputType or delete the selection with the selection collapsing to its start after the deletion  */
  deleteContentBackward: (evt: InputEvent, start: number, end: number) => void

  /**  delete the content directly after the caret position and this intention is not covered by another inputType or delete the selection with the selection collapsing to its end after the deletion  */
  deleteContentForward: (evt: InputEvent, start: number, end: number) => void

  /**  undo the last editing action  */
  historyUndo: (evt: InputEvent, start: number, end: number) => void

  /**  to redo the last undone editing action  */
  historyRedo: (evt: InputEvent, start: number, end: number) => void


}

// these are really for RTEs, not for regular plaintext handlers.
interface RichTextHandlers {
  insertOrderedList: (evt: InputEvent, start: number, end: number) => void
  insertUnorderedList: (evt: InputEvent, start: number, end: number) => void
  insertHorizontalRule: (evt: InputEvent, start: number, end: number) => void
  insertFromPasteAsQuotation: (evt: InputEvent, start: number, end: number) => void

  /** remove content from the DOM by means of drag */
  deleteByDrag: (evt: InputEvent, start: number, end: number) => void

  insertLink: (evt: InputEvent, start: number, end: number) => void
  formatBold: (evt: InputEvent, start: number, end: number) => void
  formatItalic: (evt: InputEvent, start: number, end: number) => void
  formatUnderline: (evt: InputEvent, start: number, end: number) => void
  formatStrikeThrough: (evt: InputEvent, start: number, end: number) => void
  formatSuperscript: (evt: InputEvent, start: number, end: number) => void
  formatSubscript: (evt: InputEvent, start: number, end: number) => void
  formatJustifyFull: (evt: InputEvent, start: number, end: number) => void
  formatJustifyCenter: (evt: InputEvent, start: number, end: number) => void
  formatJustifyRight: (evt: InputEvent, start: number, end: number) => void
  formatJustifyLeft: (evt: InputEvent, start: number, end: number) => void
  formatIndent: (evt: InputEvent, start: number, end: number) => void
  formatOutdent: (evt: InputEvent, start: number, end: number) => void
  formatRemove: (evt: InputEvent, start: number, end: number) => void
  formatSetBlockTextDirection: (evt: InputEvent, start: number, end: number) => void
  formatSetInlineTextDirection: (evt: InputEvent, start: number, end: number) => void
  formatBackColor: (evt: InputEvent, start: number, end: number) => void
  formatFontColor: (evt: InputEvent, start: number, end: number) => void
  formatFontName: (evt: InputEvent, start: number, end: number) => void
}


export type {
  InputHandlers,
  RichTextHandlers
}
