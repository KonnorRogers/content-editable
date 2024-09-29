import { css } from "lit"

export const componentStyles = css`
  :host {
    display: block;
  }

  [part~="editor"] {
    margin: 0;
    padding: 0;
    tab-size: var(--tab-size, 2);
    max-height: 400px;
    overflow: auto;
    min-height: 200px;
    border: 1px solid red;
  }

  [part~="editor"]:is(:focus-within) {
    outline: transparent;
    border: 1px solid dodgerblue;
  }
`
