function t(t) {
    return "string" == typeof t
}
function e(t, e, n=null, s=!1) {
    return t.dispatchEvent(new CustomEvent(e,{
        bubbles: !0,
        detail: n,
        cancelable: s
    }))
}
class n extends HTMLElement {
    constructor() {
        super()
    }
    connectedCallback() {
        this.#t(),
        this.addEventListener("click", this.#e),
        this.#n?.addEventListener("change", this.#s)
    }
    disconnectedCallback() {
        this.#n?.removeEventListener("change", this.#s),
        this.removeEventListener("click", this.#e)
    }
    get #n() {
        return this.querySelector("[data-house-md-toolbar-file-picker]")
    }
    #t() {
        this.#r() && (this.innerHTML = this.#i())
    }
    #e = t => {
        const n = t.target.closest("[data-house-md-action]")?.dataset?.houseMdAction;
        n && (t.preventDefault(),
        e(this, "house-md:toolbar-action", {
            houseMdAction: n
        }))
    }
    ;
    #s = t => {
        for (const n of t.target.files)
            e(this, "house-md:toolbar-action", {
                houseMdAction: "uploadFile",
                file: n
            })
    }
    ;
    #r() {
        return 0 === this.children.length
    }
    #i() {
        return '\n        <button data-house-md-action="bold" title="Bold">\n          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m4.1 23c-.5 0-.7-.4-.7-.7v-20.6c0-.4.4-.7.7-.7h8.9c2 0 3.8.6 4.9 1.5 1.2 1 1.8 2.4 1.8 4.1s-.9 3.2-2.3 4.1c-.2 0-.3.3-.3.5s0 .4.3.5c1.9.8 3.2 2.7 3.2 5s-.7 3.6-2.1 4.7-3.3 1.7-5.6 1.7h-8.8zm4.2-18.1v5.1h3c1.2 0 2-.3 2.7-.7.6-.5.9-1.1.9-1.9s-.3-1.4-.8-1.8-1.3-.6-2.3-.6-2.4 0-3.5 0zm0 8.5v5.8h3.7c1.3 0 2.2-.3 2.8-.7s.9-1.2.9-2.2-.4-1.7-1-2.1-1.7-.7-2.9-.7-2.4 0-3.5 0z" fill-rule="evenodd"/></svg>\n        </button>\n        <button data-house-md-action="italic" title="Italic">\n          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.3 1h10.2v3.1h-3.5l-3.7 15.7h3.2v3.2h-11v-3.1h3.8l3.7-15.7h-2.8v-3.2z" fill-rule="evenodd"/></svg>\n        </button>\n        <button data-house-md-action="quote" title="Quote">\n          <svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg"><path d="m1.1 5.2c.6-.7 1.4-1.3 2.4-1.4 2.6-.4 4.2.4 5.3 1.9 2 2.3 1.9 5.1.6 7.6-1.3 2.4-4 4.6-7.2 5.1-.4 0-.7-.1-1-.4-.1-.3-.1-.7.3-1.1l1.1-1.1c.3-.4.6-.7.7-1.1s.3-.9 0-1.3c0-.4-.6-.7-1-1-1.2-.8-2.3-2.2-2.3-4.1.1-1.4.4-2.4 1.1-3.1z"/><path d="m14.6 5.2c.6-.7 1.6-1.1 2.6-1.4 2.4-.4 4.2.4 5.3 1.9 2 2.3 1.9 5.1.6 7.6-1.3 2.4-4 4.6-7.2 5.1-.4 0-.7-.1-1-.4-.1-.3-.1-.7.3-1.1l1.1-1.1c.3-.4.6-.7.7-1.1s.3-.9 0-1.3c-.1-.4-.6-.7-1-1-1.3-.6-2.4-2-2.4-3.9s.4-2.6 1-3.3z"/></svg>\n        </button>\n        <button data-house-md-action="code" title="Code">\n          <svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg"><path d="m.4 10.1c-.5.5-.5 1.4 0 1.9l5.3 5.3c.5.5 1.4.5 1.9 0s.5-1.4 0-1.9l-4.4-4.4 4.4-4.4c.5-.5.5-1.4 0-1.9s-1.3-.5-1.9 0c0 0-5.3 5.4-5.3 5.4zm17.9 7.2 5.3-5.3c.5-.5.5-1.4 0-1.9l-5.3-5.3c-.5-.5-1.4-.5-1.9 0s-.5 1.4 0 1.9l4.4 4.4-4.4 4.4c-.5.5-.5 1.4 0 1.9.5.4 1.4.4 1.9-.1z" fill-rule="evenodd"/></svg>\n        </button>\n        <button data-house-md-action="link" title="Link">\n          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="m9.4 14.5c-2.3-2.3-2.3-5.9 0-8.2l4.6-4.6c1.1-1 2.6-1.7 4.2-1.7s3 .5 4.1 1.7c2.3 2.3 2.3 5.9 0 8.2l-2.7 2.3c-.5.5-1.2.5-1.8 0-.5-.5-.5-1.2 0-1.7l2.7-2.3c1.4-1.3 1.4-3.4 0-4.7-.7-.7-1.5-.9-2.3-.9s-1.8.4-2.5.9l-4.7 4.5c-1.4 1.3-1.4 3.4 0 4.7.5.5.5 1.2 0 1.7-.1.3-.4.4-.8.4s-.5-.1-.8-.3z"/><path d="m1.7 22.3c-2.3-2.3-2.3-5.9 0-8.2l2.6-2.5c.5-.5 1.2-.5 1.8 0 .5.5.5 1.2 0 1.7l-2.6 2.5c-1.4 1.3-1.4 3.4 0 4.7.7.7 1.5.9 2.3.9s1.8-.4 2.3-.9l4.6-4.6c1.4-1.3 1.4-3.4 0-4.7-.5-.4-.5-1.2 0-1.7s1.2-.5 1.8 0c2.3 2.3 2.3 5.9 0 8.2l-4.6 4.6c-1 1-2.5 1.7-4.1 1.7s-3-.7-4.1-1.7z"/></svg>\n        </button>\n        <button data-house-md-action="bulletList" title="Bullet list">\n          <svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg"><path d="m2.1 4.8c1.1 0 2.1-.9 2.1-2.1s-1-2-2.1-2-2.1.9-2.1 2.1.9 2 2.1 2zm4.1-2c0-.8.6-1.4 1.4-1.4h15.1c.7 0 1.3.6 1.3 1.4s-.6 1.4-1.4 1.4h-15.1c-.7 0-1.3-.7-1.3-1.4zm1.3 6.8c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4h15.1c.8 0 1.4-.6 1.4-1.4s-.6-1.4-1.4-1.4zm0 8.3c-.8 0-1.4.6-1.4 1.4s.6 1.4 1.4 1.4h15.1c.8 0 1.4-.6 1.4-1.4s-.6-1.4-1.4-1.4zm-3.4-6.9c0 1.1-.9 2.1-2.1 2.1s-2-1-2-2.1.9-2.1 2.1-2.1 2 1 2 2.1zm-2 10.3c1.1 0 2.1-.9 2.1-2.1s-.9-2.1-2.1-2.1-2.1 1-2.1 2.1.9 2.1 2.1 2.1z" fill-rule="evenodd"/></svg>\n        </button>\n        <button data-house-md-action="numberList" title="Numbered list">\n          <svg viewBox="0 0 24 22" xmlns="http://www.w3.org/2000/svg"><path d="m0 .3h2.7v5.3h-1.4v-4h-1.3zm6.7 2.7c0-.7.6-1.3 1.3-1.3h14.7c.7 0 1.3.6 1.3 1.3s-.6 1.3-1.3 1.3h-14.7c-.7 0-1.3-.6-1.3-1.3zm1.3 6.7c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3h14.7c.7 0 1.3-.6 1.3-1.3s-.6-1.3-1.3-1.3zm0 8c-.7 0-1.3.6-1.3 1.3s.6 1.3 1.3 1.3h14.7c.7 0 1.3-.6 1.3-1.3s-.6-1.3-1.3-1.3zm-4.7-9.4h.7v1.3l-2 2.7h2v1.3h-4v-1.3l2.2-2.7h-2.2v-1.3zm-3.3 9.4v-1.3h4v5.3h-4v-1.3h2.7v-.7h-1.4v-1.3h1.3v-.7z" fill-rule="evenodd"/></svg>\n        </button>\n        <label title="Add Image">\n          <svg viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg"><path d="m22 20h-20c-1.1 0-2-.9-2-2.1v-15.8c0-1.2.9-2.1 2-2.1h20c1.1 0 2 .9 2 2.1v15.8c0 1.1-.9 2.1-2 2.1zm0-2.9v-14.5c0-.3-.2-.5-.5-.5h-19c-.3 0-.5.2-.5.5v14.5c0 .1.1.2.2.2s.2 0 .2-.1l2.2-3.3c.1-.2.3-.3.5-.3h.7l2.6-4c.1-.2.3-.3.5-.3h.7c.2 0 .4.1.5.3l5.3 8c0 .1.2.2.3.2h.3c.2 0 .4-.2.4-.4s0-.2 0-.2l-1.3-1.9c-.2-.2-.2-.6 0-.8l1.2-1.6c.1-.2.3-.3.5-.3h1.1c.2 0 .4 0 .5.3l3.2 4.4c0 .1.3.2.4 0 .2 0 .2 0 .2-.2zm-5.5-7.6c-1.4 0-2.5-1.2-2.5-2.6s1.1-2.6 2.5-2.6 2.5 1.2 2.5 2.6-1.1 2.6-2.5 2.6z" fill-rule="evenodd"/></svg>\n          <input type="file" data-house-md-toolbar-file-picker multiple style="display: none;">\n        </label>'
    }
}
customElements.define("house-md-toolbar", n);
class s {
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
class i {
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
        this.#l.isEqual(n) || e(this.element, "house-md:selectionchange", {
            start: this.start,
            end: this.end
        })
    }
    ;
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
        let e = window.getSelection().getRangeAt(0).endContainer;
        if (e.nodeType === Node.TEXT_NODE && (e = e.parentElement),
        this.contentElement.contains(e))
            return !!e.closest(t)
    }
}
class o {
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
class a {
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
class g extends HTMLElement {
    static formAssociated = !0;
    constructor() {
        super(),
        this.internals = this.attachInternals(),
        this.internals.ariaRole = "textbox"
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
customElements.define("house-md", g);
class v extends HTMLElement {
    #z;
    #$;
    #O;
    constructor() {
        super(),
        this.percentComplete = 0,
        this.status = "pending"
    }
    connectedCallback() {
        this.#t(),
        this.#W(),
        this.addEventListener("click", this.#e)
    }
    disconnectedCallback() {
        this.removeEventListener("click", this.#e)
    }
    async #W() {
        const t = new FormData;
        t.append("file", this.file),
        this.csrfParamName && t.append(this.csrfParamName, this.csrfToken),
        this.xhr = new XMLHttpRequest,
        this.xhr.open("POST", this.uploadsURL, !0),
        this.xhr.upload.onprogress = this.#q,
        this.xhr.onload = this.#P,
        this.xhr.onerror = this.#U,
        this.xhr.onabort = this.#K,
        this.xhr.send(t),
        this.status = "uploading",
        this.#t()
    }
    #t() {
        this.setAttribute("status", this.status),
        this.innerHTML = `\n      ${this.#Q()}\n      ${this.#V()}\n      ${this.#X()}\n      ${this.#j()}\n    `
    }
    #Q() {
        return "failed" === this.status ? "<button data-md-action='close' class='md-close' aria-label='Close'></button>" : ""
    }
    #V() {
        return `<div class="md-file">${this.file.name}</div>`
    }
    #X() {
        return `<progress aria-label="Uploading file…" class="md-progress-bar" max="100" value="${this.percentComplete}">${this.percentComplete}%</progress>`
    }
    #j() {
        return this.#O ? `<div class="md-error">${this.#O}</div>` : ""
    }
    #q = t => {
        t.lengthComputable && (this.percentComplete = t.loaded / t.total * 100),
        this.#t()
    }
    ;
    #P = async () => {
        if (this.xhr.status >= 400)
            this.status = "failed",
            this.#O = this.xhr.responseText || "Upload failed";
        else {
            const t = JSON.parse(this.xhr.responseText);
            await this.document.insertFile(t.fileName, t.fileUrl, t.mimetype),
            this.status = "complete",
            this.#Z()
        }
        this.#t()
    }
    ;
    #U = () => {
        this.status = "failed",
        this.#t()
    }
    ;
    #K = () => {
        this.status = "aborted",
        this.#t()
    }
    ;
    #e = t => {
        t.target.matches("[data-md-action=close]") && this.remove()
    }
    ;
    async #Z(t=500) {
        await function(t) {
            return new Promise((e => setTimeout(e, t)))
        }(t),
        this.remove()
    }
    get document() {
        return this.closest("house-md").document
    }
    get file() {
        return this.#z
    }
    set file(t) {
        this.#z = t
    }
    get uploadsURL() {
        return this.#$
    }
    set uploadsURL(t) {
        this.#$ = t
    }
    get csrfParamName() {
        return document.head.querySelector("meta[name=csrf-param]")?.content
    }
    get csrfToken() {
        return document.head.querySelector("meta[name=csrf-token]")?.content
    }
}
customElements.define("house-md-upload", v);
export {a as Document, g as Editor, o as History, i as Selection, n as Toolbar, v as Upload};
