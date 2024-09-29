import { html } from "lit"

import { BaseElement } from "../../../internal/base-element.js";
import { baseStyles } from "../../styles/base.styles.js";
import { componentStyles } from "./content-editable.styles.js";

/**
 * @customElement
 * @tagname content-editable
 * @summary Short summary of the component's intended use.
 * @documentation https://konnorrogers.github.io/content-editable/components/content-editable
 * @status experimental
 * @since 1.0
 *
 * @event light-event-name - Emitted as an example.
 *
 * @slot - The default slot.
 *
 * @csspart base - The component's base wrapper.
 *
 * @cssproperty --example - An example CSS custom property.
 */
export default class ContentEditable extends BaseElement
  .defineProperties(/** @type {const} */ ({
    value: { attribute: false, initialValue: null },
    defaultValue: { attribute: "value", initialValue: null },
  }))
{
  /**
   * @override
   */
  static baseName = "content-editable"

  /**
   * @override
   */
  static styles = [
    baseStyles,
    componentStyles,
  ]

  constructor () {
    super()
    this.defaultValue = this.getAttribute("value")
  }

  /**
   * @override
   */
  render () {
    return html`<pre part="editor" contenteditable="true">${this.value}</pre>`
  }
}
