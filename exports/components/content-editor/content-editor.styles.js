import { css } from "lit"

export const componentStyles = css`
:host {
  position: relative !important;
  box-sizing: border-box !important;
  display: flex !important;
  flex-direction: column !important;
  outline: 1px solid green;
}

:host:invalid {
  border: 2px solid red;
}
`
