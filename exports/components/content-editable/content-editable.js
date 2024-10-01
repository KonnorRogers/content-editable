function isString(t) {
    return "string" == typeof t
}

/**
 * @param {Element} element
 * @param {string} eventName
 * @param {Record<string, unknown> | null} [detail=null]
 * @param {boolean} [cancelable=false]
 */
function emit(element, eventName, detail=null, cancelable = false) {
    return element.dispatchEvent(new CustomEvent(eventName,{
        bubbles: true,
        detail,
        cancelable
    }))
}

class Selection {
    /**
     * @param {StaticRange | Range} range
     * @param {Element} container
     */
    static fromDOMRange(range, container) {
        const {startOffset, startContainer, endOffset, endContainer} = range
        const selectionStart = findOffset(container, startContainer, startOffset);
        if (range.collapsed) {
            return new Selection(container,selectionStart,selectionStart);
        }

        const selectionEnd = findOffset(container, endContainer, endOffset);

        return new Selection(container, selectionStart, selectionEnd)
    }

    /**
     * @param {Node} container
     * @param {number} [start=0]
     * @param {number} [end=0]
     */
    constructor(container, start, end) {
        this.container = container,
        this.start = start || 0
        this.end = end || 0
    }
    toDOMRange() {
        const range = document.createRange();
        range.setStart(this.container, 1),
        range.setEnd(this.container, this.container.childNodes.length);
        const e = document.createTreeWalker(this.container, NodeFilter.SHOW_TEXT);
        let n = 0
          , s = !1
          , r = !1;
        for (; e.nextNode() && (!s || !r); ) {
            const i = (e.currentNode.textContent?.length || 0);
            n + i >= this.start && !s && (s = !0,
            range.setStart(e.currentNode, this.start - n)),
            n + i >= this.end && !r && (r = !0,
            range.setEnd(e.currentNode, this.end - n)),
            n += i
        }
        return range
    }

    /**
     * @param {Selection} selection
     */
    isEqual(selection) {
        return this.container === selection.container && this.start === selection.start && this.end === selection.end
    }
}

/**
 * @param {Node} root
 * @param {Node} node
 * @param {number} index
 */
function getOffsetFromElement (root, node, index) {
    const childNode = node.childNodes[index];
    let offset = 0;
    const treewalker = document.createTreeWalker(root);
    while (treewalker.nextNode()) {
        if (treewalker.currentNode === childNode) {
            return offset;
        }
        treewalker.currentNode.nodeType === Node.TEXT_NODE && (offset += (treewalker.currentNode.textContent?.length || 0))
    }
    return offset
}

/**
 * @param {Node} root
 * @param {Node} node
 * @param {number} index
 */
function getOffsetFromNode(root, node, index) {
        const treewalker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
        while (treewalker.nextNode()) {
            if (treewalker.currentNode === node) {
                return index;
            }
            index += (treewalker.currentNode.textContent?.length || 0)
        }
        return index
    }



/**
 * @param {Node} root
 * @param {Node} node
 * @param {number} index
 */
function findOffset (root, node, index) {
    return node.nodeType === Node.ELEMENT_NODE ? getOffsetFromElement(root, node, index) : getOffsetFromNode(root, node, index)
}
class SelectionManager {
    #document;
    #selection;
    #content;

    /**
     * @param {Document} document
     */
    constructor(document) {
        this.#document = document
        this.#selection = new Selection(this.contentElement,0,0),
        this.#content = ""
    }
    current() {
        return {
            start: this.start,
            end: this.end,
            selection: this.#content
        }
    }
    currentLine() {
        return this.lineAt(this.end)
    }
    previousLine() {
        const {content} = this.#document
        const index = Math.max(content.lastIndexOf("\n", this.start - 1), 0);
        return this.lineAt(index)
    }

    /**
     * @param {number} index
     */
    lineAt(index) {
        const {content} = this.#document
        const start = Math.max(content.lastIndexOf("\n", index - 1) + 1, 0)
        const s = content.indexOf("\n", start)
        const end = -1 === s ? content.length : s + 1;
        return {
            start,
            end,
            content: content.slice(start, end)
        }
    }

    /**
     * @param {Object} obj
     * @param {number} obj.start
     * @param {number} obj.end
     */
    select({start, end}) {
        this.documentRange = new Selection(this.contentElement,start,end);
        const range = this.documentRange.toDOMRange();
        if (range) {
            const selection = document.getSelection() || window.getSelection();
            if (!selection) {
                return
            }

            selection.removeAllRanges(),
            selection.addRange(range),
            this.update()
            return
        }

        console.error("Failed to create range", {
            start,
            end
        })
    }

    update = () => {
        const selection = window.getSelection()

        if (!selection) { return }

        const t = selection.getRangeAt(0)
        const n = this.#selection;
        t.intersectsNode(this.contentElement) && (this.#selection = Selection.fromDOMRange(t, this.contentElement),
        this.#content = this.#document.content.slice(this.start, this.end)),
        this.#selection.isEqual(n) || emit(/** @type {Element} */ (this.element), "house-md:selectionchange", {
            start: this.start,
            end: this.end
        })
    }
    ;
    get start() {
        return this.#selection.start
    }
    get end() {
        return this.#selection.end
    }
    get element() {
        return this.#document.element
    }
    get contentElement() {
        return this.#document.contentElement
    }
    get isEmpty() {
        return this.start === this.end
    }
    get isMultiline() {
        return this.current().selection.includes("\n")
    }
    get isBold() {
        return this.#isActive("strong")
    }
    get isItalic() {
        return this.#isActive("em")
    }
    get isStrikethrough() {
        return this.#isActive("s")
    }
    get isLink() {
        return this.#isActive(".link")
    }
    get isCode() {
        return this.#isActive(".code")
    }
    get isQuote() {
        return this.#isActive(".quote")
    }
    get isBulletList() {
        return this.#isActive(".ul-li")
    }
    get isNumberList() {
        return this.#isActive(".ol-li")
    }

    /**
     * @param {string} selector
     */
    #isActive(selector) {
        const selection = document.getSelection() || window.getSelection()
        if (!selection) { return }

        /**
         * @type {Node | Element | null}
         */
        let e = selection.getRangeAt(0).endContainer;
        if (e.nodeType === Node.TEXT_NODE && (e = e.parentElement),
        this.contentElement.contains(e)) {
            if (!(e instanceof Element)) { return false }

            return !!e.closest(selector)
        }
    }
}
class History {
    static saveInterval = 1e3;

    /**
     * @param {number} [maxSize=500]
     */
    constructor(maxSize=500) {
        this.maxSize = maxSize

        /**
         * @type {((...args: any[]) => unknown)[]}
         */
        this.undoStack = []

        /**
         * @type {((...args: any[]) => unknown)[]}
         */
        this.redoStack = []
    }

    /**
     * @template {Record<string, unknown>} T
     * @param {T} val
     */
    undo(val) {
        const e = this.undoStack.pop();

        if (e) {
            this.redoStack.push(val)
        }
        return e ? e : {}
    }

    /**
     * @param {(...args: any[]) => unknown} callback
     */
    redo(callback) {
        const e = this.redoStack.pop();

        if (e) {
            this.undoStack.push(callback)
        }
        return e ? e : {}
    }

    add =
        /**
        * @template {(...args: any[]) => any} T
        * @param {T} callback
        */
        function throttle (callback) {
        /**
         * @type {null | ReturnType<typeof setTimeout>}
         */
        let e;
        /**
         * @param {any[]} n
         */
        return (...n) => {
            e || callback(...n)

            e = setTimeout((() => {
                e = null
            }), History.saveInterval)
        }
    }((callback => {
        this.undoStack.push(callback),
        this.redoStack = [],
        this.undoStack.length > this.maxSize && this.undoStack.shift()
    }
    ))
}
function l(t) {
    let e = t;
    return e = function(t) {
        return t = t.replaceAll(/&/g, "&amp;"),
        t = t.replaceAll(/</g, "&lt;"),
        t = t.replaceAll(/>/g, "&gt;"),
        t = t.replaceAll(/"/g, "&quot;"),
        t = t.replaceAll(/'/g, "&#039;"),
        t
    }(e),
    e = function(t) {
        return t = function(t) {
            return t = t.replaceAll(/(?<!\*)\*\*\*([^*]+)\*\*\*(?!\*)/gm, "<strong><em>***$1***</em></strong>"),
            t = t.replaceAll(/(?<!_)___([^_]+)___(?!_)/gm, "<strong><em>___$1___</em></strong>"),
            t
        }(t),
        t = function(t) {
            return t = t.replaceAll(/(?<!\*)\*\*([^*]+)\*\*(?!\*)/gm, "<strong>**$1**</strong>"),
            t = t.replaceAll(/(?<!_)__([^_]+)__(?!_)/gm, "<strong>__$1__</strong>"),
            t
        }(t),
        t = function(t) {
            return t = t.replaceAll(/(?<!\*)\*([^*]+)\*(?!\*)/gm, "<em>*$1*</em>"),
            t = t.replaceAll(/(?<!_)_([^_]+)_(?!_)/gm, "<em>_$1_</em>"),
            t
        }(t),
        t = function(t) {
            return t.replaceAll(/~~(.*)?~~/gm, "<s>~~$1~~</s>")
        }(t),
        t = function(t) {
            return t.replaceAll(/==(.*?)==/gm, "<mark>==$1==</mark>")
        }(t),
        t
    }(e),
    e = function(t) {
        return t = function(t) {
            return t = t.replaceAll(/^# (.*)$/gm, '<span class="h1"># $1</span>'),
            t = t.replaceAll(/^## (.*)$/gm, '<span class="h2">## $1</span>'),
            t = t.replaceAll(/^### (.*)$/gm, '<span class="h3">### $1</span>'),
            t = t.replaceAll(/^#### (.*)$/gm, '<span class="h4">#### $1</span>'),
            t = t.replaceAll(/^##### (.*)$/gm, '<span class="h5">##### $1</span>'),
            t = t.replaceAll(/^###### (.*)$/gm, '<span class="h6">###### $1</span>'),
            t
        }(t),
        t = function(t) {
            return t.replaceAll(/^(\d+\.\s.*)$/gm, '<span class="ol-li">$1</span>')
        }(t),
        t = function(t) {
            return t.replaceAll(/^(-\s.*)$/gm, '<span class="ul-li">$1</span>')
        }(t),
        t = function(t) {
            return t.replaceAll(/^&gt;(.*)$/gm, '<span class="quote">>$1</span>')
        }(t),
        t
    }(e),
    e = function(t) {
        return function(t) {
            return t.replaceAll(/\n---\n/gm, '\n<span class="hr">---</span>\n')
        }(t)
    }(e),
    e = function(t) {
        return t.replaceAll(/(?<!!)\[(.*?)\]\((.*?)\)/gm, '<span class="link">[$1]($2)</span>')
    }(e),
    e = function(t) {
        return t.replaceAll(/!\[(.*?)\]\((.*?)\)/gm, '<span class="img">$&</span>')
    }(e),
    e = function(t) {
        return t = t.replaceAll(/^```(.*?)```$/gms, '<span class="code">```$1```</span>'),
        t = t.replaceAll(/([^`])`([^`]+)`([^`])/gm, '$1<span class="code">`$2`</span>$3'),
        t
    }(e),
    e = function(t) {
        return t.replaceAll(/&lt;!--(.*?)--&gt;/gm, '<span class="comment">&lt;!--$1--&gt;</span>')
    }(e),
    e
}
class Document {
    /**
     * @param {string} content
     * @param {Element} element
     */
    constructor(content, element) {
        this.content = content
        this.element = element
        this.selection = new SelectionManager(this)
        this.history = new History
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
        const startString = this.content.slice(0, start)
        const endString = this.content.slice(end)
        const finalString = `${startString}${text}${endString}`
        const i = {
            start: finalString.length + text.length,
            end: finalString.length + text.length
        };
        this.addHistory(),
        this.#d(finalString, i)
    }


    /**
     * @param {number} start
     * @param {number} end
     */
    insertParagraph(start, end) {
        this.select(start, end)

        if (this.selection.isBulletList) {
            this.#u()
            return
        }

        if (this.selection.isNumberList) {
            this.#m()
            return
        }

        this.replaceText("\n", start, end)
    }

    /**
     * @param {string} str
     * @param {string} href
     * @param {string} [n=""]
     */
    insertLink(str, href, n="") {
        const {start, end} = this.currentSelection
        const text = ` ${n}[${str}](${href}) `;
        this.replaceText(text, start, end),
        this.selection.select({
            start: start + text.length,
            end: start + text.length
        })
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
    toggleBold() {
        this.#p(this.selection.isBold, "**")
    }
    toggleItalic() {
        this.#p(this.selection.isItalic, "_")
    }
    toggleStrikethrough() {
        this.#p(this.selection.isStrikethrough, "~~")
    }
    toggleCode() {
        const [t,e] = this.selection.isMultiline ? ["```\n", "\n```"] : ["`", "`"];
        this.#p(this.selection.isCode, t, e)
    }
    toggleLink() {
        this.selection.isLink ? this.#g() : this.#v()
    }
    toggleQuote() {
        this.selection.isQuote ? this.#f("> ") : this.#L("> ")
    }
    toggleBulletList() {
        this.selection.isBulletList ? this.#f("- ") : this.#L("- ")
    }
    toggleNumberList() {
        this.selection.isNumberList ? this.#f(/\d+\. /) : this.#L(`${this.#b + 1}. `)
    }
    undo() {
        const {content, start, end} = this.history.undo(this.#cloneCurrentSelection);
        isString(content) && this.#d(content, {
            start,
            end
        })
    }
    redo() {
        const {content: e, start: n, end: s} = this.history.redo(this.#x);
        t(e) && this.#d(e, {
            start: n,
            end: s
        })
    }
    render() {
        this.contentElement.innerHTML = l(this.content) + "<wbr/>"
    }
    get isEmpty() {
        return !this.content.trim()
    }
    get contentElement() {
        return this.element.contentWrapper
    }
    get currentSelection() {
        return this.selection.current()
    }
    get currentLine() {
        return this.selection.currentLine()
    }
    #p(t, e, n=e) {
        t ? this.#w(e, n) : this.#T(e, n)
    }
    #T(t, e=t) {
        const {start: n, end: s, selection: r} = this.currentSelection
          , i = `${t}${r}${e}`;
        this.replaceText(i, n, s),
        this.selection.select({
            start: n,
            end: n + r.length + t.length + e.length
        })
    }
    #w(t, e=t) {
        const {start: n, end: s, selection: r} = this.currentSelection;
        r.startsWith(t) && r.endsWith(e) && (this.replaceText("", s - e.length, s),
        this.replaceText("", n, n + t.length),
        this.selection.select({
            start: n,
            end: s - t.length - e.length
        }))
    }
    #v() {
        const {start: t, end: e, selection: n} = this.currentSelection
          , s = this.selection.isEmpty
          , r = s ? "title" : n;
        this.replaceText(`[${r}](url)`, t, e),
        s ? this.selection.select({
            start: t + 1,
            end: t + r.length + 1
        }) : this.selection.select({
            start: t + n.length + 3,
            end: t + n.length + 6
        })
    }
    #g() {
        const {start: t, end: e, selection: n} = this.currentSelection
          , s = n.replace(/\[(.*)\]\(.*\)/, "$1");
        this.replaceText(s, t, e)
    }
    #u() {
        this.#E.match(/^-\s+$/) ? this.deleteCurrentLine() : (this.replaceText("\n", this.currentSelection.end, this.currentSelection.end),
        this.replaceText("- ", this.currentSelection.end + 1, this.currentSelection.end + 1))
    }
    #m() {
        this.#E.match(/^\d+\.\s+$/) ? this.deleteCurrentLine() : (this.replaceText("\n", this.currentSelection.end, this.currentSelection.end),
        this.replaceText(`${this.#b + 1}. `, this.currentSelection.end + 1, this.currentSelection.end + 1))
    }
    #L(t) {
        const {start: e, end: n} = this.currentSelection
          , s = this.currentLine;
        this.replaceText(t, s.start, s.start),
        this.selection.select({
            start: e + t.length,
            end: n + t.length
        })
    }
    #f(t) {
        const {start: e, end: n} = this.currentSelection
          , s = this.currentLine;
        if (t instanceof RegExp) {
            const e = s.content.match(t);
            if (!e)
                return;
            t = e[0]
        }
        s.content.startsWith(t) && (this.deleteText(s.start, s.start + t.length),
        this.selection.select({
            start: e - t.length,
            end: n - t.length
        }))
    }
    addHistory() {
        this.history.add(this.#x)
    }
    #d(t, n) {
        const s = this.content;
        this.content = t,
        this.element.value = t,
        this.selection.select(n),
        emit(this.element, "house-md:change", {
            previousContent: s,
            newContent: t
        })
    }
    get #cloneCurrentSelection() {
        const {start, end} = this.currentSelection;
        return {
            content: this.content,
            start,
            end,
        }
    }
    get #E() {
        return this.currentLine.content
    }
    get #b() {
        const t = this.selection.previousLine().content.match(/^(\d+). /);
        return t ? parseInt(t[1]) : 0
    }
}
class Parser {
    #S;
    constructor(t) {
        this.#S = t
    }
    asPlainText() {
        const t = (new window.DOMParser).parseFromString(this.#S, "text/html");
        return this.sanitize(t.body).trim()
    }

    /**
     * @param {Node} t
     */
    sanitize(t) {
        return t.nodeType === Node.TEXT_NODE ? t.nodeValue : Array.from(t.childNodes).map(( (node, index) => {
            const s = this.isAllowedTag(node)
              , r = n > 0 && this.isAllowedTag(t.childNodes[index - 1]);
            return (s && r ? "\n\n" : "") + this.sanitize(e)
        }
        )).join("")
    }
    isAllowedTag(t) {
        return ["BR", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "P", "TR"].includes(t.tagName)
    }
}
class InputHandler {
    constructor(t) {
        this.document = t
    }

    /**
     * @param {InputEvent} evt
     * @param {Element} element
     */
    handleInput(evt, element) {
        evt.preventDefault();
        const key = /** @type {keyof this} */ (`${evt.inputType}Handler`)
        const n = /** @type {Function | null} */ (this[key]);
        if (n) {
            const range = evt.getTargetRanges()[0]

            const {start, end} = Selection.fromDOMRange(range, element);
            n.call(this, t, start, end)
        } else
            console.error("Not handling:", evt.inputType)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertTextHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertCompositionTextHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertParagraphHandler(evt, start, end) {
        this.document.insertParagraph(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertLinkHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromYankHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromDropHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromPasteAsQuotationHandler(evt, start, end) {
        const s = evt.dataTransfer?.getData("text/plain");
        this.document.replaceText(`> ${s}`, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertTransposeHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertReplacementTextHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertFromPasteHandler(evt, start, end) {
        this.insertText(evt, start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteContentBackwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteByCutHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteWordBackwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteWordForwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteSoftLineBackwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteSoftLineForwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteEntireSoftLineHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteHardLineBackwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }
    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteHardLineForwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteByDragHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteContentHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    deleteContentForwardHandler(evt, start, end) {
        this.document.deleteText(start, end)
    }

    /**
     * @param {InputEvent} evt
     * @param {number} start
     * @param {number} end
     */
    insertText(evt, start, end) {
        let str;
        const data = evt.data
        if (data) {
            str = data;
        } else {
            const e = evt.dataTransfer?.getData("text/html");
            str = e ? new Parser(e).asPlainText() : evt.dataTransfer?.getData("text/plain")
        }
        this.document.replaceText(str, start, end)
    }
}
class ActionHandler {
    /**
     * @param {Document} document
     */
    constructor(document) {
        this.document = document
    }


    /**
     * @param {keyof this} action
     * @param {unknown} [params]
     */
    handleAction (action, params) {
        const fn = this[action];
        typeof fn === "function" ? fn.call(this, params) : console.error("Not handling:", t)
    }
    bold() {
        this.document.toggleBold()
    }
    italic() {
        this.document.toggleItalic()
    }
    strikethrough() {
        this.document.toggleStrikethrough()
    }
    quote() {
        this.document.toggleQuote()
    }
    code() {
        this.document.toggleCode()
    }
    link() {
        this.document.toggleLink()
    }
    bulletList() {
        this.document.toggleBulletList()
    }
    numberList() {
        this.document.toggleNumberList()
    }
    undo() {
        this.document.undo()
    }
    redo() {
        this.document.redo()
    }
}

const KEYBINDINGS = /** @type {const} */ ({
    "Ctrl+B": "bold",
    "Ctrl+I": "italic",
    "Ctrl+S": "strikethrough",
    "Ctrl+Z": "undo",
    "Ctrl+Shift+Z": "redo"
});
export default class Editor extends HTMLElement {
    static formAssociated = true;
    constructor() {
        super()
        this.internals = this.attachInternals(),
        this.internals.role = "textbox"

        this.addEventListener("beforeinput", this.handleBeforeInput)
        this.addEventListener("keydown", this.handleKeydown)
    }

    connectedCallback() {
        this.setAttribute("role", "textbox")
        const t = this.querySelector(".house-md-content")?.textContent || this.textContent || "";
        this.document = new Document(t,this)
        this.setupDOM()
        this.setupListeners()
        this.inputHandler = new InputHandler(this.document)
        this.actionHandler = new ActionHandler(this.document)
        this.autofocus && this.focus()
        this.setAttribute("initialized", ""),
        this.value = t
    }
    disconnectedCallback() {
        this.removeListeners()
    }

    /**
     * @param {Event} evt
     */
    validate = (evt) => {
        this.required && this.document?.isEmpty ? (evt.preventDefault(),
        this.internals.setValidity({
            valueMissing: true
        }, "This field is required.", this),
        this.focus()) : this.internals.setValidity({})
    }
    ;
    render() {
        this.document?.render()
    }

    /**
     * @override
     * @param {FocusOptions} [options]
     */
    focus(options) {
        this.contentWrapper?.focus(options)
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
        return this.document?.content
    }
    set value(val) {
        const doc = this.document
        if (!doc) { return }

        doc.content = val || ""
        this.internals.setFormValue(val || "")
        this.internals.setValidity({})
        this.render()
    }

    get form() {
        return this.internals.form
    }
    setupDOM() {
        this.textContent = "",
        this.contentWrapper = document.createElement("div"),
        this.contentWrapper.classList.add("house-md-content"),
        this.contentWrapper.setAttribute("contenteditable", "true"),
        this.append(this.contentWrapper),
        this.getAttribute("tabindex") || this.contentWrapper.setAttribute("tabindex", "0")
    }
    setupListeners() {
        document.addEventListener("selectionchange", this.handleSelectionChange)
        // this.internals.form.addEventListener("submit", this.validate)
    }
    removeListeners() {
        document.removeEventListener("selectionchange", this.handleSelectionChange)
        // this.internals.form.removeEventListener("submit", this.validate)
    }

    /**
     * @param {InputEvent} evt
     */
    handleBeforeInput = (evt) => {
        if (this.inputHandler && this.contentWrapper) {
            this.inputHandler.handleInput(evt, this.contentWrapper)
        }
    }

    /**
     * @param {KeyboardEvent} evt
     */
    handleKeydown (evt) {
        const pressedKeys = [];

        if (evt.metaKey || evt.ctrlKey) {
            pressedKeys.push("Ctrl")
        }

        if (evt.altKey) {
            pressedKeys.push("Alt")
        }

        if (evt.shiftKey) {
            pressedKeys.push("Shift")
        }

        const key = evt.key.toUpperCase()
        pressedKeys.push(key)
        const keybinding = /** @type {keyof KEYBINDINGS} */ (pressedKeys.join("+"))
        const action = KEYBINDINGS[keybinding]

        action && evt.preventDefault()
        action && this.actionHandler?.handleAction(action)
    }

    handleSelectionChange = () => {
        this.document?.selection.update()
    }
}

export {Document, Editor, History, Selection};
