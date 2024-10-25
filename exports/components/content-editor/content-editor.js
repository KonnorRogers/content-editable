import { css, html, LitElement } from "lit";
import {componentStyles} from './content-editor.styles.js'
import { baseStyles } from "../../styles/base.styles.js";

/**
 * @param {Node} node
 */
function nextNode(node) {
    if (node.hasChildNodes()) {
        return node.firstChild;
    } else {
        while (node && !node.nextSibling) {
            node = node.parentNode;
        }
        if (!node) {
            return null;
        }
        return node.nextSibling;
    }
}

function getRangeSelectedNodes(range) {
    var node = range.startContainer;
    var endNode = range.endContainer;

    // Special case for a range that is contained within a single node
    if (node == endNode) {
        return [node];
    }

    // Iterate nodes until we hit the end container
    var rangeNodes = [];
    while (node && node != endNode) {
        rangeNodes.push( node = nextNode(node) );
    }

    // Add partially selected nodes at the start of the range
    node = range.startContainer;
    while (node && node != range.commonAncestorContainer) {
        rangeNodes.unshift(node);
        node = node.parentNode;
    }

    return rangeNodes;
}

function getSelectedNodes() {
    var sel = window.getSelection();
    if (!sel) { return [] }


    if (!sel.isCollapsed) {
        return getRangeSelectedNodes(sel.getRangeAt(0));
    }
    return [];
}

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
            if (treewalker.currentNode.nodeType !== Node.TEXT_NODE) { continue }

            if (treewalker.currentNode?.parentElement?.closest("[part~='gutter']")) {
                continue
            }

            const textLength = treewalker.currentNode?.textContent?.length || 0;

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

                finalOffset += (treewalker.currentNode?.textContent?.length || 1)
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


        offset += (treewalker.currentNode?.textContent?.length || 1)
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
        return this.lineAt(offset)
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
            content: content.slice(start, end)
        }
    }

    /**
     * @param {Object} options
     * @param {number} options.start
     * @param {number} options.end
     */
    select({start, end}) {
        if (!this.contentEditableElement) { return }

        this.documentRange = new RangeHelper(this.contentEditableElement,start,end);
        const n = this.documentRange.toDOMRange();
        if (!n) {
            console.error("Failed to create range", {
                start,
                end
            })
            return
        }


        const selection = document.getSelection();

        if (!selection) { return }

        if (typeof selection.setBaseAndExtent === "function") {
            selection.setBaseAndExtent(
                n.startContainer,
                n.startOffset,
                n.endContainer || n.startContainer,
                n.endOffset || n.startOffset
            )
        } else {
            selection.removeAllRanges()
            selection.addRange(n)
        }

        this.update()
    }
    update = () => {
        let range = null

        const selection = document.getSelection()

        if (!selection) { return }

        let hasNode = false

        if (typeof selection.getComposedRanges === "function") {
            const staticRange = selection.getComposedRanges(this.contentEditableElement.getRootNode())[0]
            if (!staticRange) { return }

            hasNode = selection.containsNode(this.contentEditableElement)
        } else {
            range = selection.getRangeAt(0)
            hasNode = range.intersectsNode(this.contentEditableElement)
        }


        if (!range) { return }

        const rangeHelper = this.rangeHelper;

        if (!this.contentEditableElement)  { return }

        if (hasNode) {
            this.rangeHelper = RangeHelper.fromDOMRange(range, this.contentEditableElement)
            this.selection = this.document.content.slice(this.start, this.end)
        }

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
 * @property {HTMLElement} cursorElement - The cursor used for scrolling
 * @property {HTMLElement} [lineNumbersElement] - Element containing line numbers. This needs to be separate of contenteditable so we don't mess up calculations.
 * @property {string} [eventPrefix="content-editor"]
 */

class ContentDocument {
    /**
     * @param {ContentDocumentOptions} options
     */
    constructor(options) {
        this.content = options.content
        this.contentEditableElement = options.contentEditableElement
        this.cursorElement = options.cursorElement
        this.lineNumbersElement = options.lineNumbersElement
        this.eventPrefix = options.eventPrefix ?? "content-editor-"

        this.selection = new SelectionHelper(this, { eventPrefix: this.eventPrefix })
        this.history = new ContentDocumentHistory

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
        this.replaceText("\n​", start, end)
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
        const escapedHTML = this.escapeHTML(this.content)

        /** @type {Array<string>} */
        const lineNumbers = []
        /** @type {Array<string>} */
        const lineContents = []

        const lines = escapedHTML.split(/\n/)
        const lastLineIsEmpty = lines.length > 1 && !(lines[lines.length - 1])
        lines.forEach((content, index) => {
            // if (this.lineNumbersElement) {
            //     // (index + 1).toString()
            //     // lineNumbers.push(this.gutterStart + "" + this.gutterEnd)
            // }

            lineContents.push(
                // (index + 1).toString()
                this.gutterStart + (index + 1).toString() + this.gutterEnd +
                this.lineStart + (content + "\n") + this.lineEnd
            )
        })

        this.contentEditableElement.innerHTML = lineContents.join("")
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

            setTimeout(() => {
            this.selection.select({ start, end })
            // const contentEditableElement = this.contentEditableElement
            // const scroller = contentEditableElement.parentElement
            // const scrollerRect = scroller.getBoundingClientRect()
            // const selectionRect = this.selection.rangeHelper.toDOMRange().getClientRects()[0]

            // // TODO: Need to calculate height change here...
            // let top = selectionRect.top - scrollerRect.top
            // console.log(top)

            // this.cursorElement.style.top = `${top}px`
            // this.cursorElement.scrollIntoView()
            })
            // scroller.scrollTo(0, top)


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
        console.log(this.document.currentLine)
        if (this.document.currentLine.content === "​" || this.document.currentLine.content === "​\n") {
            console.log("has zwsp")
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
        this.setupEditor()

        const content = this.querySelector("[contenteditable='true']")?.textContent || "";

        this.contentEditor = new ContentEditor({
            eventPrefix: this.eventPrefix,
            content,
            contentEditableElement: this.contentEditableElement,
            cursorElement: this.cursorElement,
        })

        this.autofocus && this.focus()
        this.setAttribute("initialized", "")
        this.value = this.contentEditor.content
    }

    /**
     * @override
     */
    disconnectedCallback() {
        this.contentEditor?.destroy()
        super.disconnectedCallback()
    }

    // validate = t => {
    //     this.required && this.document.isEmpty ? (t.preventDefault(),
    //     this.internals.setValidity({
    //         valueMissing: true
    //     }, "This field is required.", this),
    //     this.focus()) : this.internals.setValidity({})
    // }

    /**
     * @override
     */
    render() {
        return html`<slot></slot>`
    }

    /**
     * @override
     * @param {FocusOptions} [options]
     */
    focus(options) {
        this.contentEditableElement?.focus(options)
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
        return this.contentEditor.content || ""
    }

    /**
     * @param {string | undefined | null} t
     */
    set value(t) {
        this.contentEditor.document.content = t || ""
        this.internals.setFormValue(t || "")
        this.internals.setValidity({})
        this.render()
    }
    get form() {
        return this.internals.form
    }
    setupEditor () {
        this.contentEditableElement = this.querySelector("[contenteditable='true']") || document.createElement("div")
        this.cursorElement = this.querySelector("[part~='cursor']")
        this.contentEditableElement.setAttribute("contenteditable", "true")
        if (this.contentEditableElement && !this.contentEditableElement.isConnected) {
            this.append(this.contentEditableElement)
        }

        this.lineNumbersElement = this.querySelector(".line-numbers") || document.createElement("div")
        this.lineNumbersElement.classList.add("line-numbers")
        if (this.lineNumbersElement && !this.lineNumbersElement.isConnected) {
            this.append(this.lineNumbersElement)
        }
    }
}

/**
 * @typedef {Object} ContentEditorOptions
 * @property {string} content
 * @property {string} [eventPrefix]
 * @property {HTMLElement} contentEditableElement - The element with `contenteditable="true"`
 * @property {HTMLElement} cursorElement - The element for scrolling the cursor into view.
 */

export class ContentEditor {
    /**
     * @param {ContentEditorOptions} options
     */
    constructor ({
        contentEditableElement,
        content,
        eventPrefix,
        cursorElement,
    }) {
        this.eventPrefix = eventPrefix || "content-editor-"

        this.document = new ContentDocument({
            content,
            contentEditableElement,
            cursorElement,
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
        this.contentEditableElement.addEventListener("keydown", this)
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
     * @param {Event} _evt
     */
    handleSelectionChange (_evt) {
        this.document?.selection.update()
    }

    /**
     * @param {KeyboardEvent} evt
     */
    handleKeydown (evt) {
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
// export {a as Document, g as Editor, o as History, i as Selection, n as Toolbar, v as Upload};
