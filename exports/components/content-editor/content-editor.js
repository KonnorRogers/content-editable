import { html, LitElement } from "lit";
import { ref } from 'lit/directives/ref.js';
import {componentStyles} from './content-editor.styles.js'
import { baseStyles } from "../../styles/base.styles.js";

const zeroWidthWhitespace = "​"
// const zeroWidthWhitespace = " "

class BaseEvent extends CustomEvent {
    /**
     * @param {string} eventName
     * @param {EventInit} [options]
     */
    constructor(eventName, options) {
        if (!options) { options = {} }
        if (options.bubbles == null) { options.bubbles = true }
        if (options.cancelable == null) { options.cancelable = false }
        if (options.composed == null) { options.composed = false }
        super(eventName, options)
    }
}

class CESelectionChangeEvent extends BaseEvent {
    /**
     * @param {string} eventName
     * @param {EventInit & { detail: { start: number, end: number }}} options
     */
    constructor(eventName, options) {
        super(eventName, options)
    }
}

class CEChangeEvent extends BaseEvent {
    /**
     * @param {string} eventName
     * @param {EventInit & { detail: { previousContent: string, newContent: string }}} options
     */
    constructor(eventName, options) {
        super(eventName, options)
    }
}

class RangeHelper {
    /**
     * @param {StaticRange | Range} range
     * @param {Element} container
     */
    static fromDOMRange(range, container) {
        const {startOffset, startContainer, endOffset, endContainer} = range
        const start = findOffset(container, startContainer, startOffset);

        if (range.collapsed) {
            return new RangeHelper(container,start,start);
        }

        const end = findOffset(container, endContainer, endOffset);
        return new RangeHelper(container,start,end)
    }

    /**
     * @param {Element} container
     * @param {number} start
     * @param {number} end
     */
    constructor(container, start, end) {
        this.start = start || 0;
        this.end = end || 0;
        this.container = container
    }
    toDOMRange() {
        const range = document.createRange();
        const treewalker = document.createTreeWalker(this.container);

        range.setStart(this.container, 1)
        range.setEnd(this.container, this.container.childNodes.length / 2)
        let offset = 0
        let startFound = false
        let endFound = false

        while (treewalker.nextNode() && (!startFound || !endFound)) {
            if (
                treewalker.currentNode.nodeType !== Node.TEXT_NODE
            ) { continue }

            if (treewalker.currentNode?.parentElement?.closest("[part~='gutter']")) {
                continue
            }

            let textLength = treewalker.currentNode?.textContent?.length || 0;

            if (!startFound && offset + textLength >= this.start) {
                startFound = true

                const start = this.start - offset

                let node = treewalker.currentNode
                range.setStart(node, start)
            }

            if (!endFound && offset + textLength >= this.end) {
                endFound = true
                const end = this.end - offset

                let node = treewalker.currentNode
                range.setEnd(node, end)
            }

            offset += textLength
        }

        return range
    }

    /**
     * @param {RangeHelper} selection
     */
    isEqual(selection) {
        return this.container === selection.container && this.start === selection.start && this.end === selection.end
    }
}

/**
 * @param {Element | Node} container
 * @param {Element | Node} offsetContainer
 * @param {number} offset
 */
function findOffset(container, offsetContainer, offset) {
    if (offsetContainer.nodeType === Node.ELEMENT_NODE) {
        const startNode = offsetContainer.childNodes[offset];
        let finalOffset = 0;
        const treewalker = document.createTreeWalker(container);
        while (treewalker.nextNode()) {
            if (treewalker.currentNode === startNode) { return finalOffset; }

            // Keep walking until we get to a text node or new line.
            if (treewalker.currentNode.nodeType === Node.TEXT_NODE) {
                if (treewalker.currentNode?.parentElement?.closest("[part~='gutter']")) {
                    continue
                }

                let textLength = (treewalker.currentNode?.textContent?.length || 0)

                finalOffset += textLength
            }
        }
        return finalOffset
    }

    const treewalker = document.createTreeWalker(container);
    while (treewalker.nextNode()) {
        if (treewalker.currentNode === offsetContainer) {
            return offset;
        }

        if (treewalker.currentNode.nodeType !== Node.TEXT_NODE) { continue }
        if (treewalker.currentNode?.parentElement?.closest("[part~='gutter']")) {
            continue
        }

        let textLength = treewalker.currentNode?.textContent?.length || 0

        offset += textLength
    }
    return offset
}

/**
 * @template {ContentDocument} T
 */
class SelectionHelper {
    /**
     * @param {T} contentDocument
     * @param {{eventPrefix?: string}} [options={}]
     */
    constructor(contentDocument, options = {}) {
        if (!options) { options = {} }

        const { eventPrefix } = options

        this.document = contentDocument
        this.rangeHelper = new RangeHelper(/** @type {HTMLElement} */ (this.contentEditableElement),0,0)
        this.selection = ""
        this.eventPrefix = eventPrefix || "content-editor-"
    }
    current() {
        return {
            start: this.start,
            end: this.end,
            selection: this.selection
        }
    }
    currentLine() {
        return this.lineAt(this.end)
    }

    previousLine() {
        const {content} = this.document
        const offset = Math.max(content.lastIndexOf("\n", this.start - 1), 0);
        return Object.assign(this.lineAt(offset), { selectedContent: "" })
    }

    nextLine () {
        const {content} = this.document
        const offset = Math.max(content.lastIndexOf("\n", this.end) + 1, 0);
        return Object.assign(this.lineAt(offset), { selectedContent: "" })
    }

    moveUp () {
        if ((this.getCurrentLineNumber() || 1) <= 1) {
            this.select({ start: 0, end: 0 })
            return
        }

        const currentLine = this.currentLine()
        const currentLineOffset = currentLine.selectedContent.length + 1
        const prevLineOffset = (this.document.selection.start - currentLineOffset) // Brings us to beginning of line
        const previousLine = this.lineAt(Math.max(prevLineOffset, 0))
        console.log(previousLine.content)

        let inc = 1

        if (previousLine.content.startsWith(zeroWidthWhitespace)) {
            inc = 2
        }

        const offset = prevLineOffset - previousLine.content.length + inc// + Math.min(currentLineOffset, previousLine.content.length)
        this.select({ start: offset, end: offset })
    }

    moveDown () {
        const currentLine = this.currentLine()
        const currentLineNumber = (this.getCurrentLineNumber() || 1)
        if (currentLineNumber >= this.document.content.split("\n").length) {
            this.select({ start: currentLine.end, end: currentLine.end})
            return
        }

        let currentLineOffset = Math.max(currentLine.selectedContent.length - 1, 0)

        let nextLineOffset = (this.document.selection.start - currentLineOffset + Math.max(currentLine.content.length, 2)) // Brings us to beginning of next line

        const nextLine = this.lineAt(Math.min(nextLineOffset, this.document.content.length))

        console.log({
            currentLineOffset,
            nextLineLength: nextLine.content.length
        })

        const offset = nextLineOffset // + Math.max(Math.min(nextLine.content.length, currentLineOffset), 0)
        this.select({ start: offset, end: offset })
    }

    /**
     * @param {number} offset
     */
    lineAt(offset) {
        const {content} = this.document
        const start = Math.max(content.lastIndexOf("\n", offset - 1) + 1, 0)
        const startOffset = content.indexOf("\n", offset)
        const end = -1 === startOffset ? content.length : startOffset + 1;
        return {
            start,
            end,
            content: content.slice(start, end),
            selectedContent: content.slice(start, offset),
        }
    }

    /**
     * @param {Range | null | undefined} [range]
     */
    getCurrentLineNumber (range) {
        if (!range) {
            const rangeHelper = new RangeHelper(this.contentEditableElement,this.start,this.end);
            range = rangeHelper.toDOMRange();
        }

        if (range.collapsed) {
            const lineEl = range.endContainer?.parentElement?.closest("[part~='line']")
            const children = this.contentEditableElement.children
            const index = Array.prototype.indexOf.call(children, lineEl)
            let lineNumber = null
            if (index >= 0) {
                lineNumber = (Math.max(0, (index - 1)) / 2) + 1
                return lineNumber
            }
            return null
        }

        return null
    }

    /**
     * @param {number} lineNumber
     */
    setActiveLineNumber (lineNumber) {
      Array.prototype.forEach.call(this.contentEditableElement.children, (el) => el.part.remove("active-line"))
      const child = this.contentEditableElement.children[((lineNumber - 1) * 2) + 1]
      child.part.add("active-line")
    }

    /**
     * @param {Object} options
     * @param {number} options.start
     * @param {number} options.end
     */
    select({start, end}) {
        if (!this.contentEditableElement) { return }

        this.documentRange = new RangeHelper(this.contentEditableElement,start,end);

        let range = this.documentRange.toDOMRange();

        if (!range) {
            console.error("Failed to create range", {
                start,
                end
            })
            return
        }

        /**
         * TODO: We should cache these checks by moving them to a ResizeObserver.
         */
        const caretRect = range.getBoundingClientRect();
        const containerRect = this.contentEditableElement.getBoundingClientRect();

        // Calculate if the caret is out of view
        // TODO: Calculate right / left scrolling as well.
        if (caretRect.bottom > containerRect.bottom) {
            // Scroll down
            this.contentEditableElement.scrollTop += caretRect.bottom - containerRect.bottom + (caretRect.height / 2);
        } else if (caretRect.bottom + containerRect.height < containerRect.bottom) {
            // Scroll up normal. We're at the "top" of the contenteditable.
            this.contentEditableElement.scrollTop -= containerRect.top - caretRect.top;
        } else if (caretRect.top < containerRect.top) {
            // Scroll up + 1 extra line.
            this.contentEditableElement.scrollTop -= containerRect.top - caretRect.top - (caretRect.height);
        }

        const selection = document.getSelection();

        if (!selection) { return }

        if (typeof selection.setBaseAndExtent === "function") {
            selection.setBaseAndExtent(
                range.startContainer,
                range.startOffset,
                range.endContainer || range.startContainer,
                range.endOffset || range.startOffset
            )
        } else {
            selection.removeAllRanges()
            selection.addRange(range)
        }

        this.update()
    }

    updateRange () {
        let range = null

        const rootNode = this.contentEditableElement.getRootNode()
        // @ts-expect-error
        const selection = rootNode.getSelection?.() || document.getSelection()

        if (!selection) { return }
        if (!this.contentEditableElement)  { return }

        let hasNode = true

        // Special handling of shadow dom in safari.
        if (typeof selection.getComposedRanges === "function" && rootNode instanceof ShadowRoot) {
            const staticRange = selection.getComposedRanges(rootNode)[0]
            if (!staticRange) { return }

            /**
             * @type {Node | Element | null | undefined}
             */
            let parent = staticRange.startContainer
            while ((parent = parent?.parentElement)) {
                if (parent === this.contentEditableElement) {
                    hasNode = true
                    break;
                }
            }
            range = staticRange
        } else {
            range = selection.getRangeAt(0)
            hasNode = range.intersectsNode(this.contentEditableElement)
        }

        if (!range) { return }

        if (hasNode) {
            this.rangeHelper = RangeHelper.fromDOMRange(range, this.contentEditableElement)
            this.selection = this.document.content.slice(this.start, this.end)

            const lineNumber = this.getCurrentLineNumber(this.rangeHelper.toDOMRange())

            if (lineNumber != null) {
                this.setActiveLineNumber(lineNumber)
                this.currentLineNumber = lineNumber
            }
        }
    }
    update = () => {
        const rangeHelper = this.rangeHelper;

        this.updateRange()

        if (this.rangeHelper.isEqual(rangeHelper)) { return }

        const selectionChangeEvent = new CESelectionChangeEvent(`${this.eventPrefix}selectionchange`, {
            detail: {
                start: this.start,
                end: this.end
            }
        })

        this.contentEditableElement.dispatchEvent(selectionChangeEvent)
    }

    get start() {
        return this.rangeHelper.start
    }
    get end() {
        return this.rangeHelper.end
    }
    get contentEditableElement() {
        return this.document.contentEditableElement
    }
    get isEmpty() {
        return this.start === this.end
    }
    get isMultiline() {
        return this.current().selection.includes("\n")
    }

    /**
     * This is useful if you ever build a markdown editor.
     * this.hasQuery("h1") -> checks if the selection has a "h1" element.
     * @param {string} selector - a querySelector to be passed to `.closest()`
     */
    hasQuery(selector) {
        /**
         * @type {HTMLElement | Node | undefined | null}
         */
        let e = window.getSelection()?.getRangeAt(0)?.endContainer;
        if (!e) { return false }

        if (e.nodeType === Node.TEXT_NODE) {
            const parentElement = e.parentElement

            if (
                parentElement instanceof HTMLElement
                && this.contentEditableElement
                && this.contentEditableElement.contains(parentElement)
            ) {
                return !!parentElement.closest(selector)
            }
        }
        return false
    }
}

class ContentDocumentHistory {
    static saveInterval = 1e3;
    constructor(t=500) {
        this.maxSize = t

        /**
         * @type {Array<ContentDocument["currentState"]>}
         */
        this.undoStack = []

        /**
         * @type {Array<ContentDocument["currentState"]>}
         */
        this.redoStack = []
    }

    /**
     * @param {ContentDocument["currentState"]} t
     */
    undo(t) {
        const e = this.undoStack.pop();
        if (e) {
            this.redoStack.push(t)
            return e
        }
        return null
    }

    /**
     * @param {ContentDocument["currentState"]} t
     */
    redo(t) {
        const e = this.redoStack.pop();
        if (e) {
            this.undoStack.push(t)
            return e
        }
        return null
    }

    /**
     * @param {ContentDocument["currentState"]} transaction
     */
    add = (transaction) => {
        this.undoStack.push(transaction)
        this.redoStack = []
        this.undoStack.length > this.maxSize && this.undoStack.shift()
    }
}

/**
 * @typedef {Object} ContentDocumentOptions
 * @property {string} content - initial string
 * @property {HTMLElement} contentEditableElement - The actual "contenteditable" element.
 * @property {string} [eventPrefix="content-editor"]
 */

class ContentDocument {
    /**
     * @param {ContentDocumentOptions} options
     */
    constructor(options) {
        this.content = options.content
        this.contentEditableElement = options.contentEditableElement
        this.eventPrefix = options.eventPrefix ?? "content-editor-"

        this.selection = new SelectionHelper(this, { eventPrefix: this.eventPrefix })
        this.history = new ContentDocumentHistory

        this.gutterStart = `<div part="gutter">`

        this.gutterStart = `<div part="gutter" readonly contenteditable="false">`
        this.gutterEnd = `</div>`
        this.lineStart = `<div part="line">`
        this.lineEnd = `</div>`
    }

    /**
     * @param {number} start
     * @param {number} end
     */
    select(start, end) {
        this.selection.select({
            start,
            end
        })
    }

    /**
     * @param {string} text
     */
    insertText(text) {
        this.replaceText(text, this.currentSelection.start, this.currentSelection.end)
    }

    /**
     * @param {string} text
     * @param {number} start
     * @param {number} end
     */
    replaceText(text, start, end) {
        const before = this.content.slice(0, start)
        const after = this.content.slice(end)
        const newText = `${before}${text}${after}`
        const selection = {
            start: before.length + text.length,
            end: before.length + text.length
        };

        this.addHistory()
        this.updateEditor(newText, selection)
    }

    /**
     * @param {number} start
     * @param {number} end
     */
    insertParagraph(start, end) {
        this.select(start, end)
        this.replaceText("\n" + zeroWidthWhitespace, start, end)
    }

    /**
     * @param {number} start
     * @param {number} end
     */
    deleteText(start, end) {
        this.replaceText("", Math.max(start, 0), end)
    }

    deleteCurrentLine() {
        const {start, end} = this.currentLine;
        this.deleteText(start, end)
    }

    undo() {
        const state = this.history.undo(this.currentState)
        if (!state) { return }

        const {content, start, end} = state;
        this.updateEditor(content, {
            start,
            end
        })
    }
    redo() {
        const state = this.history.redo(this.currentState);
        if (!state) { return }

        const {content, start, end} = state
        this.updateEditor(content, {
            start,
            end
        })
    }

    /**
    * @param {string} str
    */
    escapeHTML(str) {
        return str.replaceAll(/&/g, "&amp;")
        .replaceAll(/</g, "&lt;")
        .replaceAll(/>/g, "&gt;")
        .replaceAll(/"/g, "&quot;")
        .replaceAll(/'/g, "&#039;")
    }

    render() {
        const ary = this.content.split(/\n/)
        const lines = ary.map((content, index) => {
            const lineNumber = (index + 1).toString()
            const gutter = `${this.gutterStart}${lineNumber}${this.gutterEnd}`
            const line = `${this.lineStart}${content + "\n"}${this.lineEnd}`
            return `${gutter}${line}`
        })

        this.contentEditableElement.textContent = ""
        this.contentEditableElement.innerHTML = lines.join("")
    }

    get isEmpty() {
        return !this.content?.trim()
    }
    get currentSelection() {
        return this.selection.current()
    }
    get currentLine() {
        return this.selection.currentLine()
    }

    /**
     * @param {boolean} bool
     * @param {string} startText
     * @param {string} [endText=startText]
     */
    toggleSurround(bool, startText, endText=startText) {
        bool ? this.addSurround(startText, endText) : this.deleteSurround(startText, endText)
    }

    /**
     * @param {string} startText
     * @param {string} [endText=startText]
     */
    addSurround(startText, endText=startText) {
        const { start, end, selection } = this.currentSelection
        const i = `${startText}${selection}${endText}`;
        this.replaceText(i, start, end),
        this.selection.select({
            start,
            end: start + selection.length + startText.length + endText.length
        })
    }

    /**
     * @param {string} startText
     * @param {string} [endText=startText]
     */
    deleteSurround(startText, endText=startText) {
        const {start, end, selection} = this.currentSelection;
        if (selection.startsWith(startText) && selection.endsWith(endText)) {
            this.replaceText("", end - endText.length, end)
            this.replaceText("", start, start + startText.length)
            this.selection.select({
                start,
                end: end - startText.length - endText.length
            })
        }
    }

    /**
     * @param {string} text
     */
    insertAtStart (text) {
        const {start, end} = this.currentSelection
        const currentLine = this.currentLine;
        this.replaceText(text, currentLine.start, currentLine.start)
        this.selection.select({
            start: start + text.length,
            end: end + text.length
        })
    }

    /**
     * @param {string | RegExp} strOrRegexp
     */
    deleteFromStart (strOrRegexp) {
        const {start, end} = this.currentSelection
        const currentLine = this.currentLine;
        if (strOrRegexp instanceof RegExp) {
            const regex = strOrRegexp
            const e = currentLine.content.match(regex);
            if (!e) {return};
            strOrRegexp = e[0]
        }

        const str = strOrRegexp
        if (currentLine.content.startsWith(str)) {
            this.deleteText(currentLine.start, currentLine.start + str.length)
            this.selection.select({
                start: start - str.length,
                end: end - str.length
            })
        }
    }
    addHistory () {
        this.history.add(this.currentState)
    }

    /**
     * @param {string} text
     * @param {{ start: number, end: number }} selection
     */
    updateEditor (text, selection) {
        const s = this.content;
        this.content = text
        const render = /** @type {any} */ (this.render())

        const changeEvent = new CEChangeEvent(`${this.eventPrefix}change`, {
            detail: {
                previousContent: s,
                newContent: text
            }
        })

        const sync = () => {
            const { start, end } = selection

            this.selection.select({ start, end })
            this.contentEditableElement.dispatchEvent(changeEvent)
        }

        if (typeof render === "object" && "then" in render) {
            render.then(() => {
                sync()
            })
        } else {
            sync()
        }

    }
    get currentState () {
        const {start, end} = this.currentSelection;
        return {
            content: this.content,
            start,
            end
        }
    }
}
class HTMLParser {
    #text;

    /**
     * @param {string} text
     */
    constructor(text) {
        this.#text = text
    }
    asPlainText() {
        const t = (new window.DOMParser).parseFromString(this.#text, "text/html");

        return this.parse(t.body)?.trim()
    }

    /**
     * @param {Node} t
     * @return {string}
     */
    parse(t) {
        return t.nodeType === Node.TEXT_NODE ? (t.nodeValue || "") : Array.from(t.childNodes).map(( (e, n) => {
            const isBlockTag = this.isBlockTag(e)
            const r = n > 0 && this.isBlockTag(t.childNodes[n - 1]);
            return (isBlockTag && r ? "\n\n" : "") + this.parse(e)
        }
        )).join("")
    }

    /**
     * @param {HTMLElement | Node} node
     */
    isBlockTag (node) {
        if ("tagName" in node) {
            return ["BR", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "P", "TR"].includes(node.tagName)
        }

        return false
    }
}

/** @typedef {import("./content-editor-globals.js").InputHandlers} InputHandlers */

/**
 * @implements {InputHandlers}
 */
class InputHandler {
    /**
     * @param {ContentDocument} t
     */
    constructor(t) {
        this.document = t
    }

    /**
     * @param {InputEvent} evt
     * @param {HTMLElement} container
     */
    handleInput(evt, container) {
        evt.preventDefault();
        const key = `${evt.inputType}`

        if (key in this) {
            const callback = this[/** @type {keyof this} */ (key)];
            if (typeof callback === "function") {
                const r = evt.getTargetRanges()[0]
                const {start, end} = RangeHelper.fromDOMRange(r, container);
                callback.call(this, evt, start, end)
            } else {
                console.error("Not handling:", evt.inputType)
            }
        } else {
            console.error("Not handling:", evt.inputType)
        }

    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertText(evt, start, end) {
        let str;
        if (evt.data) {
            str = evt.data;
        } else if (evt.dataTransfer) {
            const text = evt.dataTransfer.getData("text/html");
            str = text ? new HTMLParser(text).asPlainText() : evt.dataTransfer.getData("text/plain")
        }

        this.document.replaceText(str || "", start, end)
    }


    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    insertLineBreak (_evt, start, end) {
        this.document.insertParagraph(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} _start
     * @param {number} _end
     */
    historyRedo (_evt, _start, _end) {
        this.document.redo()
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} _start
     * @param {number} _end
     */
    historyUndo (_evt, _start, _end) {
        this.document.undo()
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertCompositionText(evt, start, end) {
        this.insertText(evt, start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    insertParagraph(_evt, start, end) {
        this.document.insertParagraph(start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromYank(evt, start, end) {
        this.insertText(evt, start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromDrop(evt, start, end) {
        this.insertText(evt, start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromPasteAsQuotation(evt, start, end) {
        const str = evt.dataTransfer?.getData("text/plain") || "";
        this.document.replaceText(`> ${str}`, start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertTranspose(evt, start, end) {
        this.insertText(evt, start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertReplacementText(evt, start, end) {
        this.insertText(evt, start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromPaste(evt, start, end) {
        this.insertText(evt, start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteContentBackward(_evt, start, end) {
        if (this.document.currentLine.content === "\n" || this.document.currentLine.content === zeroWidthWhitespace) {
            start -= 1
        }
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteByCut(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteWordBackward(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteWordForward(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteSoftLineBackward(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteSoftLineForward(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteEntireSoftLine(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteHardLineBackward(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteHardLineForward(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteContent(_evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} _evt
     * @param {number} start
     * @param {number} end
     */
    deleteContentForward(_evt, start, end) {
        this.document.deleteText(start, end)
    }
}

class ActionHandler {
    /**
     * @param {ContentDocument} document
     */
    constructor(document) {
        this.document = document
    }

    /**
     * @template {Exclude<keyof this & InputEvent["inputType"], "handleAction" | "constructor">} T
     * @param {Omit<string, T> | T & {}} t
     * @param {Event} e
     */
    handleAction(t, e) {
        const handler = this[/** @type {keyof this} */ (t)];
        typeof handler === "function" ? handler.call(this, e) : console.error("Not handling:", t)
    }
    undo() {
        this.document.undo()
    }
    redo() {
        this.document.redo()
    }
}

export default class ContentEditorElement extends LitElement {
    static formAssociated = true

    /**
     * @override
     */
    static styles = [
        baseStyles,
        componentStyles,
    ]

    constructor() {
        super()
        this.internals = this.attachInternals()
        this.internals.role = "textbox"

        this.eventPrefix = "content-editor-"
    }

    /**
     * @override
     */
    connectedCallback() {
        super.connectedCallback()

        this.updateComplete.then(() => {
            this.contentEditor = new ContentEditor({
                eventPrefix: this.eventPrefix,
                content: this.value || "",
                contentEditableElement: /** @type {HTMLElement} */ (this.contentEditableElement),
            })

            this.autofocus && this.focus()
            this.setAttribute("initialized", "")
            this.value = this.contentEditor.content
        })
    }

    /**
     * @override
     */
    disconnectedCallback() {
        this.contentEditor?.destroy()
        super.disconnectedCallback()
    }

    /**
     * @override
     */
    render() {
        return html`<div contenteditable="true" draggable="false" ${ref(/** @type {any} */ (this.contentEditableChanged))}></div>`
    }

    /**
     * @param {HTMLElement} contentEditableElement
     */
    contentEditableChanged (contentEditableElement) {
        this.contentEditableElement = contentEditableElement
    }

    /**
     * @override
     * @param {FocusOptions} [options]
     */
    focus(options) {
        const contentEditableElement = this.contentEditableElement
        if (contentEditableElement) {
            contentEditableElement.focus(options)
        }
    }

    get required() {
        return this.hasAttribute("required")
    }
    set required(t) {
        t ? this.setAttribute("required", "") : this.removeAttribute("required")
    }

    /**
     * @override
     */
    get autofocus() {
        return this.hasAttribute("autofocus")
    }

    /**
     * @override
     */
    set autofocus(t) {
        t ? this.setAttribute("autofocus", "") : this.removeAttribute("autofocus")
    }

    get value() {
        return this.contentEditor?.content || ""
    }

    /**
     * @param {string | undefined | null} val
     */
    set value(val) {
        const editor = this.contentEditor
        if (editor) {
            editor.document.content = val || ""
        }
        this.internals.setFormValue(val || "")
        this.internals.setValidity({})
        this.render()
    }
    get form() {
        return this.internals.form
    }
}

/**
 * @typedef {Object} ContentEditorOptions
 * @property {string} content
 * @property {string} [eventPrefix]
 * @property {HTMLElement} contentEditableElement - The element with `contenteditable="true"`
 */

export class ContentEditor {
    /**
     * @param {ContentEditorOptions} options
     */
    constructor ({
        contentEditableElement,
        content,
        eventPrefix,
    }) {
        this.eventPrefix = eventPrefix || "content-editor-"

        this.document = new ContentDocument({
            content,
            contentEditableElement,
            eventPrefix: this.eventPrefix,
        })
        this.inputHandler = new InputHandler(this.document)
        this.actionHandler = new ActionHandler(this.document)
        this.keybindings = {
            "Ctrl+Z": "undo",
            "Ctrl+Shift+Z": "redo"
        };

        this.render()
        this.contentEditableElement.addEventListener("beforeinput", this)
        this.contentEditableElement.addEventListener("focusin", this)
        this.contentEditableElement.addEventListener("keydown", this)
        this.contentEditableElement.addEventListener("copy", this)
        document.addEventListener("selectionchange", this)
    }

    destroy () {
        document.removeEventListener("selectionchange", this)
        this.contentEditableElement.removeEventListener("beforeinput", this)
        this.contentEditableElement.removeEventListener("keydown", this)
    }

    /**
     * @param {CESelectionChangeEvent} _evt
     */
    handleChange (_evt) {
        this.render()
    }

    /**
     * @param {Event} evt
     */
    handleEvent (evt) {
         switch (evt.type) {
            case "beforeinput":
                 this.handleBeforeInput(/** @type {InputEvent} */ (evt))
                 break;
             case "keydown":
                 this.handleKeydown(/** @type {KeyboardEvent} */ (evt))
                 break;
             case "selectionchange":
                 this.handleSelectionChange(/** @type {Event} */ (evt))
                 break;
            case `${this.eventPrefix}change`:
                 this.handleChange(/** @type {CEChangeEvent} */ (evt))
                 break;
             case "copy":
                const selection = document.getSelection();
                 if (selection) {
                    evt.preventDefault();
                    /** @type {ClipboardEvent} */ (evt)?.clipboardData?.setData("text/plain", selection.toString().replaceAll(zeroWidthWhitespace, ""));
                 }
                 break;
             case "focusin":
                 // setTimeout(() => {
                 //     requestAnimationFrame(() => {
                 //         this.document.selection.updateRange()
                 //     })
                 // })
                 break;
             default:
                 console.error("Not handling: ", evt.type)
         }
    }

    /**
     * @param {InputEvent} evt
     */
    handleBeforeInput (evt) {
        this.inputHandler.handleInput(evt, this.contentEditableElement)
    }

    /**
     * @param {Event} evt
     */
    handleSelectionChange (evt) {
        this.document?.selection.update()
    }

    /**
     * @param {KeyboardEvent} evt
     */
    handleKeydown (evt) {
        if (evt.key === "ArrowUp") {
            evt.preventDefault()
            this.document.selection.moveUp()
        }

        if (evt.key === "ArrowDown") {
            evt.preventDefault()
            this.document.selection.moveDown()
        }

        if (evt.key === "ArrowRight") {
            const {
                selectedContent
            } = this.document.selection.lineAt(this.document.selection.end + 1)

            // When its a blank line, handle it slightly differently.
            if (selectedContent === "") {
                evt.preventDefault()
                this.document.select(this.document.selection.start + 2, this.document.selection.start + 2)
            }
        }
        if (evt.key === "ArrowLeft") {
            const {
                selectedContent
            } = this.document.selection.lineAt(this.document.selection.end - 1)

            // When its a blank line, handle it slightly differently.
            if (selectedContent === "") {
                const offset = Math.max(0, this.document.selection.start - 2)
                this.document.select(offset, offset)
                evt.preventDefault()
            }
        }
        const keyboardEvt = /** @type {KeyboardEvent} */ (evt)
        const keybinding = this.normalizeKeybinding(keyboardEvt)

        let actionKey = null
        if (keybinding in this.keybindings) {
            actionKey = this.keybindings[/** @type {keyof typeof this.keybindings} */ (keybinding)]
        }

        if (actionKey) {
            evt.preventDefault()
            this.actionHandler.handleAction(actionKey, evt)
        }
    }

    /**
     * @param {KeyboardEvent} evt
     */
    normalizeKeybinding (evt) {
        const ary = [];
        ;(evt.metaKey || evt.ctrlKey) && ary.push("Ctrl")

        evt.altKey && ary.push("Alt")
        evt.shiftKey && ary.push("Shift")
        ary.push(evt.key.toUpperCase())

        return ary.join("+")
    }

    get content () {
        return this.document.content
    }

    get contentEditableElement () {
        return this.document.contentEditableElement
    }

    render () {
        return this.document.render()
    }
}
customElements.define("content-editor", ContentEditorElement);
