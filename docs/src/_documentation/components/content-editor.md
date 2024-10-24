---
---


## Examples

<light-preview
  preview-mode="shadow-dom"
  script-scope="shadow-dom"
>
  <script slot="code" type="text/plain">
    <style>
    *, :after, :before {
      box-sizing: border-box;
    }
    [contenteditable="true"] {
      caret-color: var(--color-link);
      text-align: start;
      white-space: break-spaces;
      margin: 0;
      flex-grow: 2;
      flex-shrink: 0;
      display: grid;
      grid-template-columns: auto auto;
      place-content: start;
      white-space: pre;
      word-wrap: normal;
      min-height: 100%;
      padding: 4px 0;
      outline: none;
    }

    [contenteditable="true"] > [part~="gutter"] {
      -webkit-user-select: none;
      user-select: none;
      text-align: end;
      display: inline-block;
      border-right: 1px solid #ddd;
      padding: 0 .5em;
      color: #888;
      font-variant-numeric: tabular-nums;
    }
    [contenteditable="true"] > [part~="line"] {
      min-height: 1lh;
      min-width: 1ch;
      display: block;
      white-space: pre;
      word-wrap: normal;
      padding: 0px 2px 0px 6px;
    }

    [part~="scroller"] {
      display: flex;
      align-items: flex-start;
      font-family: monospace;
      line-height: 1.4;
      height: 100%;
      overflow: auto;
      position: relative;
      z-index: 0;
      overflow-anchor: none;
      max-block-size:  500px;
    }

    </style>
    <content-editor>
      <div part="scroller">
        <div part="cursor" style="position: absolute; height: 1px; width: 1px; top: var(--top, 0px); left: var(--left, 0px);"></div>
        <div part="content" contenteditable="true"></div>
      </div>
    </content-editor>
  </script>
</light-preview>

### First Example
