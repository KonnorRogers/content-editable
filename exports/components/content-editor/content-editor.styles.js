import { css } from "lit"

export const componentStyles = css`
    :host, *, :after, :before {
      box-sizing: border-box;
    }
    :host {
      display: block;
    }
    [contenteditable="true"] {
      caret-color: var(--color-link);
      text-align: start;
      margin: 0;
      overflow: auto;
      display: grid;
      grid-template-columns: max-content 1fr;
      place-content: start;
      white-space: pre;
      word-wrap: normal;
      min-height: 100%;
      padding: 0;
      outline: none;
      overflow: auto;
      font-family: monospace;
      line-height: 1.8;
      position: relative;
      overflow-anchor: none;
      max-block-size:  500px;
      border: 1px solid #eee;
    }

    [contenteditable="true"] > [part~="gutter"] {
      -webkit-user-select: none;
      user-select: none;
      text-align: end;
      display: inline-block;
      border-right: 1px solid #ddd;
      background-color: #f5f5f5;
      padding-inline-end: 4px;
      padding-inline-start: 6px;
      min-width: 2ch;
      color: #888;
      font-variant-numeric: tabular-nums;
    }

    /** Fix a bug in firefox around selections. */
    [contenteditable="true"] > [part~="gutter"]::selection {
      background: transparent;
    }

    [contenteditable="true"] > [part~="line"] {
      min-height: 1lh;
      min-width: max(max-content, 100%);
      display: block;
      padding: 0px 2px 0px 6px;
      width: max(100%, max-content);
      background: white;
    }

    [contenteditable="true"] > [part~="active-line"] {
      background-color: lightblue;
    }
`
