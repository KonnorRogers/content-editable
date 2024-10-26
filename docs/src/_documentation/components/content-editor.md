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
      margin: 0;
      display: grid;
      grid-template-columns: auto auto;
      place-content: start;
      white-space: pre;
      word-wrap: normal;
      min-height: 100%;
      padding: 4px 0;
      outline: none;
      overflow: auto;
      font-family: monospace;
      line-height: 1.4;
      position: relative;
      overflow-anchor: none;
      max-block-size:  500px;
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
      padding: 0px 2px 0px 6px;
    }

    </style>
    <content-editor>
      <div part="content" contenteditable="true"></div>
    </content-editor>
  </script>
</light-preview>

### First Example
