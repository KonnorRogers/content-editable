import { html } from "lit"

import { BaseElement } from "../../../internal/base-element.js";
import { baseStyles } from "../../styles/base.styles.js";
import { componentStyles } from "./content-editable.styles.js";
// import { unsafeHTML } from "lit/directives/unsafe-html.js";

/**
 * @typedef {Object} Selection
 * @property {number} start
 * @property {number} end
 */

/**
 * @template {HTMLElement} [T=HTMLElement]
 */
class Transaction {
  #content

  /**
   * @param {T} element
   * @param {Array<string>} content
   */
  constructor (element, content) {
    /**
     * @type {T}
     */
    this.element = element

    /**
     * @type {Array<string>}
     */
    this.#content = content
  }

  /**
   * @param {Selection} selection
   * @param {string} text
   */
  insertText (text, selection) {
    return () => {
      const {
        offsetEndLine,
        offsetEnd
      } = this.findSelectionOffsets(selection)
      const line = this.#content[offsetEndLine]

      if (!line) {
        this.#content[offsetEndLine] = text
        return
      }

      const before = line.substring(0, offsetEnd)
      const after = line.substring(offsetEnd)
      this.#content[offsetEndLine] = before + text + after
    }
  }

  /**
    * @param {Element} editorElement
    * @param {number} position
    */
  setCursorPosition (editorElement, position) {
    return () => {
      requestAnimationFrame(() => {
        Cursor.setPosition(editorElement, position)
      })
    }
  };

  /**
   * @param {Selection} selection
   */
  findSelectionOffsets (selection) {
    let offset = 0
    let offsetStartLine = 0
    let offsetEndLine = 0
    let offsetStart = 0
    let offsetEnd = 0

    for (let i = 0; i < this.#content.length; i++) {
      const line = this.#content[i]

      const lineLength = line.length

      if (selection.start > offset + lineLength) {
        offset += line.length
        continue
      }

      if (selection.start < offset + lineLength) {
        offsetStartLine = i
        offsetStart = selection.start - (offset + lineLength)
      }

      if (selection.end <= offset + lineLength) {
        offsetEndLine = i
        offsetEnd = selection.end - offset
      }

      if (selection.end < offset) { break }
    }

    return {
      offset,
      offsetStartLine,
      offsetEndLine,
      offsetStart,
      offsetEnd,
    }
  }

  insertLineBreak (selection) {
    return () => {
      const {
        offsetEndLine,
        offsetEnd,
      } = this.findSelectionOffsets(selection)

      const line = this.#content[offsetEndLine]

      const lineStart = line.substring(0, offsetEnd)
      const lineEnd = line.substring(offsetEnd + 1)
      this.#content[offsetEndLine] = lineStart
      this.#content.splice(offsetEndLine + 1, 0, "​" + lineEnd)
    }
  }

  /**
   * @param {Selection} selection
   */
  deleteSelection (selection) {
    return () => {
      const {
        offsetStart,
        offsetEnd,
        offsetStartLine,
        offsetEndLine,
      } = this.findSelectionOffsets(selection)
      // this.#content.splice(deleteStart, deleteLength)
      // 7 - 5 means we can only remove 6
      // 10 - 5 means we can remove 6-9
      // 7 - 6 none removed
      // 7 - 7 none removed
      const linesToRemove = (offsetEndLine - 1) - (offsetStartLine + 1)

      const startText = this.#content[offsetStartLine].substring(0, offsetStart)
      this.#content[offsetStartLine] = startText
      const endLine = this.#content[offsetEndLine]
      const endText = endLine.substring(offsetEnd, endLine.length)
      this.#content[offsetEndLine] = endText
      this.#content.splice(offsetStart + 1, linesToRemove)
    }
  }
}

class Cursor {
  /**
    * @param {Node} node
   * @param {number} targetPosition
   */
  static createRange (node, targetPosition) {
    let range = document.createRange();
    range.selectNode(node);
    range.setStart(node, 0);

    let pos = 0;
    const stack = [node];
    while (stack.length > 0) {
        const current = stack.pop();

        if (!current) { return range }

        if (current.nodeType === Node.TEXT_NODE) {
            const len = (current.textContent?.length || 0);
            if (pos + len >= targetPosition) {
                range.setEnd(current, targetPosition - pos);
                return range;
            }
            pos += len;
        } else if (current.hasChildNodes()) {
            for (let i = current.childNodes.length - 1; i >= 0; i--) {
                stack.push(current.childNodes[i]);
            }
        }
    }

    // The target position is greater than the
    // length of the contenteditable element.
    range.setEnd(node, node.childNodes.length);
    return range;
  };

  /**
    * @param {Element} contentEle
   * @param {number} targetPosition
   */
  static setPosition (contentEle, targetPosition) {
    const range = Cursor.createRange(contentEle, targetPosition);
    range.collapse(false)
    const selection = window.getSelection();

    if (!selection) { return }
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

/**
 * @customElement
 * @tagname content-editable
 * @summary Short summary of the component's intended use.
 * @documentation https://konnorrogers.github.io/content-editable/components/content-editable
 * @status experimental
 * @since 1.0
 *
 * @event light-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ContentEditable extends BaseElement
  .defineProperties(/** @type {const} */ ({
    // value: { attribute: false, initialValue: null },
    defaultValue: { attribute: "value", initialValue: /** @type {string | null} */ (null) },
  }))
{
  /**
   * @override
   */
  static baseName = "content-editable"

  /**
   * @override
   */
  static styles = [
    baseStyles,
    componentStyles,
  ]

  /** @type Array<() => void> */
  #transactions

  /**
   * @type Array<string>
   */
  #content

  constructor () {
    super()
    this.defaultValue = this.getAttribute("value")

    this.#transactions = []
    this.#content = ["​"]

    this.newLine = "\n"
    // this.lineStart = `<span part="line">`
    // this.lineEnd = `</span>`
  }

  get editorElement () {
    return this.shadowRoot?.querySelector("pre")
  }

  cursorPosition () {
    const selection = this.currentSelection

    if (!selection) {
      return null
    }

    return selection.end
  }
  get currentSelection () {
    const editorElement = this.editorElement
    if (!editorElement) { return null }

    const selection = window.getSelection();

    if (!selection) { return null }

    const range = selection.getRangeAt(0);
    const clonedRange = range.cloneRange();
    clonedRange.selectNodeContents(editorElement);
    clonedRange.setEnd(range.endContainer, range.endOffset);
    const start = clonedRange.toString().length

    /**
     * @type {"forward" | "backward" | "none"}
     */
    // @ts-expect-error
    const direction = selection.direction

    const startNode = direction === "backward" ? selection.focusNode : selection.anchorNode
    const endNode = direction === "backward" ? selection.anchorNode : selection.focusNode

    return {
      start: start,
      end: start + range.toString().length,
      startNode,
      endNode
    };
  }

  /**
   * @param {InputEvent} e
   */
  __insertText (e) {
    e.preventDefault()
    if (!e.data) { return }

    const editorElement = this.editorElement
    const currentSelection = this.currentSelection

    if (editorElement == null) { return }
    if (currentSelection == null) { return }
    if (currentSelection.endNode == null) { return }

    this.#transactions.push(
      this.createTransaction().insertText(e.data, currentSelection),
      this.createTransaction().setCursorPosition(editorElement, currentSelection.end + 1)
    )
  }

  /**
   * @param {Event} e
   */
  __insertLineBreak (e) {
    const editorElement = this.editorElement
    const currentSelection = this.currentSelection

    if (editorElement == null) { return }
    if (currentSelection == null) { return }

    this.#transactions.push(
      this.createTransaction().insertLineBreak(currentSelection),
      this.createTransaction().setCursorPosition(editorElement, currentSelection.end + 1)
    )
  }

  createTransaction () {
    return new Transaction(this, this.#content)
  }

  /**
   * @param {InputEvent} e
   */
  handleBeforeInput (e) {
    if (e.isComposing) { return }

    console.log(e.inputType)
    // All level 2 input types: <https://w3c.github.io/input-events/#interface-InputEvent-Attributes>
    switch (e.inputType) {
 	    // insert typed plain text
      case "insertText":
        this.__insertText(e)
        break;
      // insert or replace existing text by means of a spell checker, auto-correct, writing suggestions or similar
      case "insertReplacementText":
        break;
 	    // insert a line break
      case "insertLineBreak":
        e.preventDefault()
        this.__insertLineBreak(e)
        break;
 	    // insert a paragraph break
      case "insertParagraph":
        e.preventDefault()
        this.__insertLineBreak(e)
        break;
 	    // insert a numbered list
      case "insertOrderedList":
        break;
 	    // insert a bulleted list
      case "insertUnorderedList":
        break;
 	    // insert a horizontal rule
      case "insertHorizontalRule":
        break;
 	    // replace the current selection with content stored in a kill buffer
      case "insertFromYank":
        break;
 	    // insert content by means of drop
      case "insertFromDrop":
        break;
 	    // paste content from clipboard or paste image from client provided image library
      case "insertFromPaste":
        break;
 	    // paste content from the clipboard as a quotation
      case "insertFromPasteAsQuotation":
        break;
 	    // transpose the last two grapheme cluster. that were entered
      case "insertTranspose":
        break;
 	    // replace the current composition string
      case "insertCompositionText":
        break;
 	    // insert a link
      case "insertLink":
        break;
 	    // delete a word directly before the caret position
      case "deleteWordBackward":
      break;
 	    // delete a word directly after the caret position
      case "deleteWordForward":
        break;
 	    // delete from the caret to the nearest visual line break before the caret position
      case "deleteSoftLineBackward":
        break;
 	    // delete from the caret to the nearest visual line break after the caret position
      case "deleteSoftLineForward":
        break;
 	    // delete from the nearest visual line break before the caret position to the nearest visual line break after the caret position
      case "deleteEntireSoftLine":
        break;
 	    // delete from the caret to the nearest beginning of a block element or br element before the caret position 	No 	Yes 	Collapsed
      case "deleteHardLineBackward":
        break;
 	    // delete from the caret to the nearest end of a block element or br element after the caret position
      case "deleteHardLineForward":
        break;
 	    // remove content from the DOM by means of drag
      case "deleteByDrag":
        break;
 	    // remove the current selection as part of a cut
      case "deleteByCut":
        break;
 	      // delete the selection without specifying the direction of the deletion and this intention is not covered by another inputType
      case "deleteContent":
        break;
 	      // delete the content directly before the caret position and this intention is not covered by another inputType or delete the selection with the selection collapsing to its start after the deletion
      case "deleteContentBackward":
        break;
 	    // delete the content directly after the caret position and this intention is not covered by another inputType or delete the selection with the selection collapsing to its end after the deletion
      case "deleteContentForward":
        break;
 	    // undo the last editing action
      case "historyUndo":
        break;
 	    // to redo the last undone editing action
      case "historyRedo":
        break;
 	    // initiate bold text
      case "formatBold":
        break;
 	    // initiate italic text
      case "formatItalic":
        break;
 	    // initiate underline text
      case "formatUnderline":
        break;
 	    // initiate stricken through text
      case "formatStrikeThrough":
        break;
 	    // initiate superscript text
      case "formatSuperscript":
        break;
 	      // initiate subscript text
      case "formatSubscript":
        break;
 	      // make the current selection fully justified
      case "formatJustifyFull":
        break;
 	    // center align the current selection
      case "formatJustifyCenter":
        break;
 	    // right align the current selection
      case "formatJustifyRight":
        break;
 	    // left align the current selection
      case "formatJustifyLeft":
        break;
 	    // indent the current selection
      case "formatIndent":
        break;
 	    // outdent the current selection
      case "formatOutdent":
        break;
 	    // remove all formatting from the current selection
      case "formatRemove":
        break;
 	    // set the text block direction
      case "formatSetBlockTextDirection":
        break;
 	    // set the text inline direction
      case "formatSetInlineTextDirection":
        break;
 	    // change the background color
      case "formatBackColor":
        break;
 	    // change the font color
      case "formatFontColor":
        break;
 	    // change the font name
      case "formatFontName":
        break;
    }

    this.flushTransactions()
    this.requestUpdate()
  }

  flushTransactions () {
    while (this.#transactions.length > 0) {
      const tr = this.#transactions.pop()
      tr && tr()
    }
  }

  renderContent () {
    return this.#content.map((content) => html`<div part="line">${content}</div>`)
  }

  /**
   * @override
   */
  render () {
    return html`<pre
      part="editor"
      contenteditable="true"
      @beforeinput=${this.handleBeforeInput}
    >${this.renderContent()}</pre>`
  }
}
