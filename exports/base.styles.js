import { css } from "lit";

export const baseStyles = css`
  *,
  *:after,
  *:before {
    box-sizing: border-box;
  }

  :host(:dir(rtl)) *,
  :host(:dir(rtl)) *:after,
  :host(:dir(rtl)) *:before {
    direction: rtl;
  }

  :host(:dir(ltr)) *,
  :host(:dir(ltr)) *:after,
  :host(:dir(ltr)) *:before {
    direction: ltr;
  }

  .visually-hidden:not(:focus-within) {
    position: absolute;
    overflow: hidden;
    clip: rect(0 0 0 0);
    clip-path: inset(50%);
    width: 1px;
    height: 1px;
    white-space: nowrap;
  }

  [hidden] {
    display: none !important;
  }

  :host {
    display: block;
  }
`;
