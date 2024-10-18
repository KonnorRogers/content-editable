import { css } from "lit"

export const componentStyles = css`
:root {
  --house-border-radius: 0.5em;
}

:host {
  display: flex;
  flex-direction: column;
  flex-grow: 1;

}

:host:invalid {
  border: var(--color-negative) 2px solid;
}

/* Markdown Content */
::slotted(*) {
  caret-color: var(--color-link);
  flex-grow: 1;
  min-block-size: 50dvh;
  text-align: start;
  white-space: break-spaces;
}

::slotted(*:focus),
::slotted(*:active) {
  border: none;
  outline: transparent;
}
`
