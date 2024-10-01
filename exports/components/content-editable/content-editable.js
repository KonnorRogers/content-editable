/**
 * @param {any} t
 */
function isString(t) {
    return "string" == typeof t
}


/**
 * @param {Element} element
 * @param {string} eventName
 * @param {null | Record<string, unknown>} [detail=null]
 */
function emit(element, eventName, detail=null, cancelable = false) {
    return element.dispatchEvent(new CustomEvent(eventName ,{
        bubbles: !0,
        detail,
        cancelable,
    }))
}
class Range {
    start = 0;
    end = 0;

    static fromDOMRange(t, e) {
        const {startOffset: n, startContainer: i, endOffset: o, endContainer: l} = t
          , a = r(e, i, n);
        if (t.collapsed)
            return new s(e,a,a);
        const c = r(e, l, o);
        return new s(e,a,c)
    }
    constructor(t, e, n) {
        this.container = t,
        this.start = e,
        this.end = n
    }
    toDOMRange() {
        const t = document.createRange();
        t.setStart(this.container, 1),
        t.setEnd(this.container, this.container.childNodes.length);
        const e = document.createTreeWalker(this.container, NodeFilter.SHOW_TEXT);
        let n = 0
          , s = !1
          , r = !1;
        for (; e.nextNode() && (!s || !r); ) {
            const i = e.currentNode.textContent.length;
            n + i >= this.start && !s && (s = !0,
            t.setStart(e.currentNode, this.start - n)),
            n + i >= this.end && !r && (r = !0,
            t.setEnd(e.currentNode, this.end - n)),
            n += i
        }
        return t
    }
    isEqual(t) {
        return this.container === t.container && this.start === t.start && this.end === t.end
    }
}
function r(t, e, n) {
    return e.nodeType === Node.ELEMENT_NODE ? function(t, e, n) {
        const s = e.childNodes[n];
        let r = 0;
        const i = document.createTreeWalker(t);
        for (; i.nextNode(); ) {
            if (i.currentNode === s)
                return r;
            i.currentNode.nodeType === Node.TEXT_NODE && (r += i.currentNode.textContent.length)
        }
        return r
    }(t, e, n) : function(t, e, n) {
        const s = document.createTreeWalker(t, NodeFilter.SHOW_TEXT);
        for (; s.nextNode(); ) {
            if (s.currentNode === e)
                return n;
            n += s.currentNode.textContent.length
        }
        return n
    }(t, e, n)
}
class Selection {
    #o;
    #l;
    #a;
    constructor(t) {
        this.#o = t,
        this.#l = new s(this.contentElement,0,0),
        this.#a = ""
    }
    current() {
        return {
            start: this.start,
            end: this.end,
            selection: this.#a
        }
    }
    currentLine() {
        return this.lineAt(this.end)
    }
    previousLine() {
        const {content: t} = this.#o
          , e = Math.max(t.lastIndexOf("\n", this.start - 1), 0);
        return this.lineAt(e)
    }
    lineAt(t) {
        const {content: e} = this.#o
          , n = Math.max(e.lastIndexOf("\n", t - 1) + 1, 0)
          , s = e.indexOf("\n", t)
          , r = -1 === s ? e.length : s + 1;
        return {
            start: n,
            end: r,
            content: e.slice(n, r)
        }
    }
    select({start: t, end: e}) {
        this.documentRange = new s(this.contentElement,t,e);
        const n = this.documentRange.toDOMRange();
        if (n) {
            const t = window.getSelection();
            t.removeAllRanges(),
            t.addRange(n),
            this.update()
        } else
            console.error("Failed to create range", {
                start: t,
                end: e
            })
    }
    update = () => {
        const t = document.getSelection()?.getRangeAt(0)
          , n = this.#l;
        t.intersectsNode(this.contentElement) && (this.#l = s.fromDOMRange(t, this.contentElement),
        this.#a = this.#o.content.slice(this.start, this.end)),
        this.#l.isEqual(n) || emit(this.element, "house-md:selectionchange", {
            start: this.start,
            end: this.end
        })
    };
    get start() {
        return this.#l.start
    }
    get end() {
        return this.#l.end
    }
    get element() {
        return this.#o.element
    }
    get contentElement() {
        return this.#o.contentElement
    }
    get isEmpty() {
        return this.start === this.end
    }
    get isMultiline() {
        return this.current().selection.includes("\n")
    }
    get isBold() {
        return this.#c("strong")
    }
    get isItalic() {
        return this.#c("em")
    }
    get isStrikethrough() {
        return this.#c("s")
    }
    get isLink() {
        return this.#c(".link")
    }
    get isCode() {
        return this.#c(".code")
    }
    get isQuote() {
        return this.#c(".quote")
    }
    get isBulletList() {
        return this.#c(".ul-li")
    }
    get isNumberList() {
        return this.#c(".ol-li")
    }
    #c(t) {
      const selection = window.getSelection()
      if (!selection) { return }
      /**
       * @type {HTMLElement | null | Node}
       */
      let e = selection.getRangeAt(0).endContainer;
      if (e.nodeType === Node.TEXT_NODE && (e = e.parentElement) && this.contentElement.contains(e))
          if (e instanceof HTMLElement) {
            return !!e.closest(t)
          }
      }
    }
}
class History {
    static saveInterval = 1e3;
    constructor(t=500) {
        this.maxSize = t,
        this.undoStack = [],
        this.redoStack = []
    }
    undo(t) {
        const e = this.undoStack.pop();
        return e ? (this.redoStack.push(t),
        e) : {}
    }
    redo(t) {
        const e = this.redoStack.pop();
        return e ? (this.undoStack.push(t),
        e) : {}
    }
    add = function(t) {
        let e;
        return (...n) => {
            e || (t(...n),
            e = setTimeout(( () => {
                e = null
            }
            ), o.saveInterval))
        }
    }((t => {
        this.undoStack.push(t),
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
    constructor(t, e) {
        this.content = t,
        this.element = e,
        this.selection = new i(this),
        this.history = new o
    }
    select(t, e) {
        this.selection.select({
            start: t,
            end: e
        })
    }
    insertText(t) {
        this.replaceText(t, this.currentSelection.start, this.currentSelection.end)
    }
    replaceText(t, e, n) {
        const s = this.content.slice(0, e)
          , r = `${s}${t}${this.content.slice(n)}`
          , i = {
            start: s.length + t.length,
            end: s.length + t.length
        };
        this.#h(),
        this.#d(r, i)
    }
    insertParagraph(t, e) {
        this.select(t, e),
        this.selection.isBulletList ? this.#u() : this.selection.isNumberList ? this.#m() : this.replaceText("\n", t, e)
    }
    insertLink(t, e, n="") {
        const {start: s, end: r} = this.currentSelection
          , i = ` ${n}[${t}](${e}) `;
        this.replaceText(i, s, r),
        this.selection.select({
            start: s + i.length,
            end: s + i.length
        })
    }
    insertFile(t, e, n) {
        n.startsWith("image/") ? this.insertImage(t, e) : this.insertLink(t, e)
    }
    insertImage(t, e) {
        this.insertLink(t, e, "!")
    }
    deleteText(t, e) {
        this.replaceText("", Math.max(t, 0), e)
    }
    deleteCurrentLine() {
        const {start: t, end: e} = this.currentLine;
        this.deleteText(t, e)
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
        const {content: e, start: n, end: s} = this.history.undo(this.#x);
        t(e) && this.#d(e, {
            start: n,
            end: s
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
    #h() {
        this.history.add(this.#x)
    }
    #d(t, n) {
        const s = this.content;
        this.content = t,
        this.element.value = t,
        this.selection.select(n),
        e(this.element, "house-md:change", {
            previousContent: s,
            newContent: t
        })
    }
    get #x() {
        const {start: t, end: e} = this.currentSelection;
        return {
            content: this.content,
            start: t,
            end: e
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
class c {
    #S;
    constructor(t) {
        this.#S = t
    }
    asPlainText() {
        const t = (new window.DOMParser).parseFromString(this.#S, "text/html");
        return this.#A(t.body).trim()
    }
    #A(t) {
        return t.nodeType === Node.TEXT_NODE ? t.nodeValue : Array.from(t.childNodes).map(( (e, n) => {
            const s = this.#k(e)
              , r = n > 0 && this.#k(t.childNodes[n - 1]);
            return (s && r ? "\n\n" : "") + this.#A(e)
        }
        )).join("")
    }
    #k(t) {
        return ["BR", "DIV", "H1", "H2", "H3", "H4", "H5", "H6", "LI", "P", "TR"].includes(t.tagName)
    }
}
class h {
    constructor(t) {
        this.document = t
    }
    handleInput(t, e) {
        t.preventDefault();
        const n = this[`${t.inputType}Handler`];
        if (n) {
            const r = t.getTargetRanges()[0]
              , {start: i, end: o} = s.fromDOMRange(r, e);
            n.call(this, t, i, o)
        } else
            console.error("Not handling:", t.inputType)
    }
    insertTextHandler(t, e, n) {
        this.#C(t, e, n)
    }
    insertCompositionTextHandler(t, e, n) {
        this.#C(t, e, n)
    }
    insertParagraphHandler(t, e, n) {
        this.document.insertParagraph(e, n)
    }
    insertLinkHandler(t, e, n) {
        this.#C(t, e, n)
    }
    insertFromYankHandler(t, e, n) {
        this.#C(t, e, n)
    }
    insertFromDropHandler(t, e, n) {
        this.#C(t, e, n)
    }
    insertFromPasteAsQuotationHandler(t, e, n) {
        const s = t.dataTransfer.getData("text/plain");
        this.document.replaceText(`> ${s}`, e, n)
    }
    insertTransposeHandler(t, e, n) {
        this.#C(t, e, n)
    }
    insertReplacementTextHandler(t, e, n) {
        this.#C(t, e, n)
    }
    insertFromPasteHandler(t, e, n) {
        this.#C(t, e, n)
    }
    deleteContentBackwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteByCutHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteWordBackwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteWordForwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteSoftLineBackwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteSoftLineForwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteEntireSoftLineHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteHardLineBackwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteHardLineForwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteByDragHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteContentHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    deleteContentForwardHandler(t, e, n) {
        this.document.deleteText(e, n)
    }
    #C(t, e, n) {
        let s;
        if (t.data)
            s = t.data;
        else {
            const e = t.dataTransfer.getData("text/html");
            s = e ? new c(e).asPlainText() : t.dataTransfer.getData("text/plain")
        }
        this.document.replaceText(s, e, n)
    }
}
class d {
    constructor(t, e) {
        this.element = t.closest("house-md"),
        this.file = e
    }
    upload() {
        if (e(this.element, "house-md:before-upload", {
            file: this.file
        })) {
            const t = document.createElement("house-md-upload");
            t.file = this.file,
            t.uploadsURL = this.#$,
            this.element.appendChild(t)
        }
    }
    get #$() {
        return this.element.dataset.uploadsUrl || document.head.querySelector("meta[name=house-uploads-url]")?.content || "/uploads"
    }
}
class u {
    constructor(t) {
        this.document = t
    }
    handleAction(t, e) {
        const n = this[t];
        n ? n.call(this, e) : console.error("Not handling:", t)
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
    uploadFile({file: t}) {
        new d(this.document.element,t).upload()
    }
}
class m {
    constructor(t) {
        this.element = t.closest("house-md")
    }
    handleDragOver(t) {
        t.preventDefault()
    }
    async handleDrop(t) {
        t.preventDefault();
        for (const e of t.dataTransfer.items)
            "file" === e.kind && new d(this.element,e.getAsFile()).upload()
    }
}
const p = {
    "Ctrl+B": "bold",
    "Ctrl+I": "italic",
    "Ctrl+S": "strikethrough",
    "Ctrl+Z": "undo",
    "Ctrl+Shift+Z": "redo"
};
export default class ContentEditable extends HTMLElement {
    static formAssociated = true;
    constructor() {
        super()
        this.internals = this.attachInternals(),
        this.internals.role = "textbox"
    }
    connectedCallback() {
        const t = this.querySelector(".house-md-content")?.textContent || this.textContent;
        this.document = new a(t,this),
        this.#H(),
        this.#y(),
        this.inputHandler = new h(this.document),
        this.actionHandler = new u(this.document),
        this.dropAndDropHandler = new m(this),
        this.autofocus && this.focus(),
        this.setAttribute("initialized", ""),
        this.value = t
    }
    disconnectedCallback() {
        this.#N()
    }
    validate = t => {
        this.required && this.document.isEmpty ? (t.preventDefault(),
        this.internals.setValidity({
            valueMissing: !0
        }, "This field is required.", this.element),
        this.focus()) : this.internals.setValidity({})
    }
    ;
    render() {
        this.document.render()
    }
    focus() {
        this.contentWrapper.focus()
    }
    get required() {
        return this.hasAttribute("required")
    }
    set required(t) {
        t ? this.setAttribute("required", "") : this.removeAttribute("required")
    }
    get autofocus() {
        return this.hasAttribute("autofocus")
    }
    set autofocus(t) {
        t ? this.setAttribute("autofocus", "") : this.removeAttribute("autofocus")
    }
    get value() {
        return this.document.content
    }
    set value(t) {
        this.document.content = t,
        this.internals.setFormValue(t),
        this.internals.setValidity({}),
        this.render()
    }
    get form() {
        return this.internals.form
    }
    #H() {
        this.textContent = "",
        this.toolbar = this.#_(),
        this.contentWrapper = document.createElement("div"),
        this.contentWrapper.classList.add("house-md-content"),
        this.contentWrapper.setAttribute("contenteditable", !0),
        this.append(this.contentWrapper),
        this.getAttribute("tabindex") || this.contentWrapper.setAttribute("tabindex", 0)
    }
    #_() {
        if (this.getAttribute("toolbar"))
            return document.getElementById(this.getAttribute("toolbar"));
        {
            const t = document.createElement("house-md-toolbar");
            return this.prepend(t),
            t
        }
    }
    #y() {
        this.addEventListener("beforeinput", this.#D),
        this.addEventListener("keydown", this.#I),
        this.addEventListener("dragover", this.#B),
        this.addEventListener("drop", this.#F),
        this.toolbar.addEventListener("house-md:toolbar-action", this.#R),
        document.addEventListener("selectionchange", this.#M),
        this.internals.form.addEventListener("submit", this.validate)
    }
    #N() {
        this.removeEventListener("beforeinput", this.#D),
        this.removeEventListener("keydown", this.#I),
        this.removeEventListener("dragover", this.#B),
        this.removeEventListener("drop", this.#F),
        this.toolbar.removeEventListener("house-md:toolbar-action", this.#R),
        document.removeEventListener("selectionchange", this.#M),
        this.internals.form.removeEventListener("submit", this.validate)
    }
    #D = t => {
        this.inputHandler.handleInput(t, this.contentWrapper)
    }
    ;
    #I(t) {
        const e = function(t) {
            return p[function(t) {
                const e = [];
                return (t.metaKey || t.ctrlKey) && e.push("Ctrl"),
                t.altKey && e.push("Alt"),
                t.shiftKey && e.push("Shift"),
                e.push(t.key.toUpperCase()),
                e.join("+")
            }(t)]
        }(t);
        e && (t.preventDefault(),
        this.actionHandler.handleAction(e))
    }
    #B = t => {
        this.dropAndDropHandler.handleDragOver(t)
    }
    ;
    #F = t => {
        this.dropAndDropHandler.handleDrop(t)
    }
    ;
    #R = ({detail: t}) => {
        this.actionHandler.handleAction(t.houseMdAction, t)
    }
    ;
    #M = () => {
        this.document.selection.update()
    }
}
customElements.define("house-md", ContentEditable);
export {Document, ContentEditable, History, i as Selection};

