import { LitElement } from "lit";
import { DefineableMixin } from "web-component-define";
import { version } from "./version.js";
import { defineablePropertiesMixin } from "konnors-lit-helpers/exports/properties.js";

/**
 * @customElement
 */
export class BaseElement extends defineablePropertiesMixin(DefineableMixin(LitElement)) {
  /**
   * @type {Record<string, typeof HTMLElement & { define?: (...args: any[]) => void }>}
   */
  static dependencies = {};

  static version = version;

  constructor() {
    super();
    Object.entries(
      /** @type {typeof BaseElement} */ (this.constructor).dependencies,
    ).forEach(([name, ctor]) => {
      if (typeof ctor.define === "function") {
        ctor.define(name);
      } else {
        if (!customElements.get(name)) {
          customElements.define(name, ctor)
        }
      }
    });
  }

  /**
   * Gets directionality of the element
   * @returns {"ltr" | "rtl"}
   */
  getTextDirection() {
    return this.matches(":dir(rtl)") ? "rtl" : "ltr";
  }
}
