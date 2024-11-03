import{a as B}from"/content-editable/bridgetown/static/chunks/chunk-6RK7MPLA.js";import{a as A}from"/content-editable/bridgetown/static/chunks/chunk-7J4CYV6I.js";import{a as f}from"/content-editable/bridgetown/static/chunks/chunk-RBCSN77Y.js";import{a as F}from"/content-editable/bridgetown/static/chunks/chunk-O2G3XBIV.js";import{a as u}from"/content-editable/bridgetown/static/chunks/chunk-B5BOCW3Q.js";import{a as w,b as l,c as V,e as q,f as E}from"/content-editable/bridgetown/static/chunks/chunk-OGRJXHW7.js";import"/content-editable/bridgetown/static/chunks/chunk-UQ2MYQ3D.js";import{c as o}from"/content-editable/bridgetown/static/chunks/chunk-D4LECB4O.js";import{b as z,c as T}from"/content-editable/bridgetown/static/chunks/chunk-BEQZCWYM.js";import{a as $}from"/content-editable/bridgetown/static/chunks/chunk-XSARY5PV.js";import{a as n,b as y,c as C}from"/content-editable/bridgetown/static/chunks/chunk-TYZC2ODH.js";import{a as d,b as m,d as p,g as c,h as g}from"/content-editable/bridgetown/static/chunks/chunk-LRPVQVZA.js";import"/content-editable/bridgetown/static/chunks/chunk-3JAYOADL.js";var S=d`
  :host {
    display: inline-block;
  }

  .checkbox {
    position: relative;
    display: inline-flex;
    align-items: flex-start;
    font-family: var(--sl-input-font-family);
    font-weight: var(--sl-input-font-weight);
    color: var(--sl-input-label-color);
    vertical-align: middle;
    cursor: pointer;
  }

  .checkbox--small {
    --toggle-size: var(--sl-toggle-size-small);
    font-size: var(--sl-input-font-size-small);
  }

  .checkbox--medium {
    --toggle-size: var(--sl-toggle-size-medium);
    font-size: var(--sl-input-font-size-medium);
  }

  .checkbox--large {
    --toggle-size: var(--sl-toggle-size-large);
    font-size: var(--sl-input-font-size-large);
  }

  .checkbox__control {
    flex: 0 0 auto;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: var(--toggle-size);
    height: var(--toggle-size);
    border: solid var(--sl-input-border-width) var(--sl-input-border-color);
    border-radius: 2px;
    background-color: var(--sl-input-background-color);
    color: var(--sl-color-neutral-0);
    transition:
      var(--sl-transition-fast) border-color,
      var(--sl-transition-fast) background-color,
      var(--sl-transition-fast) color,
      var(--sl-transition-fast) box-shadow;
  }

  .checkbox__input {
    position: absolute;
    opacity: 0;
    padding: 0;
    margin: 0;
    pointer-events: none;
  }

  .checkbox__checked-icon,
  .checkbox__indeterminate-icon {
    display: inline-flex;
    width: var(--toggle-size);
    height: var(--toggle-size);
  }

  /* Hover */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-input-border-color-hover);
    background-color: var(--sl-input-background-color-hover);
  }

  /* Focus */
  .checkbox:not(.checkbox--checked):not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Checked/indeterminate */
  .checkbox--checked .checkbox__control,
  .checkbox--indeterminate .checkbox__control {
    border-color: var(--sl-color-primary-600);
    background-color: var(--sl-color-primary-600);
  }

  /* Checked/indeterminate + hover */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__control:hover,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__control:hover {
    border-color: var(--sl-color-primary-500);
    background-color: var(--sl-color-primary-500);
  }

  /* Checked/indeterminate + focus */
  .checkbox.checkbox--checked:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control,
  .checkbox.checkbox--indeterminate:not(.checkbox--disabled) .checkbox__input:focus-visible ~ .checkbox__control {
    outline: var(--sl-focus-ring);
    outline-offset: var(--sl-focus-ring-offset);
  }

  /* Disabled */
  .checkbox--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .checkbox__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    line-height: var(--toggle-size);
    margin-inline-start: 0.5em;
    user-select: none;
    -webkit-user-select: none;
  }

  :host([required]) .checkbox__label::after {
    content: var(--sl-input-required-content);
    color: var(--sl-input-required-content-color);
    margin-inline-start: var(--sl-input-required-content-offset);
  }
`;var I=(e="value")=>(r,s)=>{let i=r.constructor,R=i.prototype.attributeChangedCallback;i.prototype.attributeChangedCallback=function(k,O,x){var v;let a=i.getPropertyOptions(e),P=typeof a.attribute=="string"?a.attribute:e;if(k===P){let h=a.converter||m,_=(typeof h=="function"?h:(v=h?.fromAttribute)!=null?v:m.fromAttribute)(x,a.type);this[e]!==_&&(this[s]=_)}R.call(this,k,O,x)}};var U=d`
  .form-control .form-control__label {
    display: none;
  }

  .form-control .form-control__help-text {
    display: none;
  }

  /* Label */
  .form-control--has-label .form-control__label {
    display: inline-block;
    color: var(--sl-input-label-color);
    margin-bottom: var(--sl-spacing-3x-small);
  }

  .form-control--has-label.form-control--small .form-control__label {
    font-size: var(--sl-input-label-font-size-small);
  }

  .form-control--has-label.form-control--medium .form-control__label {
    font-size: var(--sl-input-label-font-size-medium);
  }

  .form-control--has-label.form-control--large .form-control__label {
    font-size: var(--sl-input-label-font-size-large);
  }

  :host([required]) .form-control--has-label .form-control__label::after {
    content: var(--sl-input-required-content);
    margin-inline-start: var(--sl-input-required-content-offset);
    color: var(--sl-input-required-content-color);
  }

  /* Help text */
  .form-control--has-help-text .form-control__help-text {
    display: block;
    color: var(--sl-input-help-text-color);
    margin-top: var(--sl-spacing-3x-small);
  }

  .form-control--has-help-text.form-control--small .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-small);
  }

  .form-control--has-help-text.form-control--medium .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-medium);
  }

  .form-control--has-help-text.form-control--large .form-control__help-text {
    font-size: var(--sl-input-help-text-font-size-large);
  }

  .form-control--has-help-text.form-control--radio-group .form-control__help-text {
    margin-top: var(--sl-spacing-2x-small);
  }
`;var b=y(class extends C{constructor(e){if(super(e),e.type!==n.PROPERTY&&e.type!==n.ATTRIBUTE&&e.type!==n.BOOLEAN_ATTRIBUTE)throw Error("The `live` directive is not allowed on child or event bindings");if(!z(e))throw Error("`live` bindings can only contain a single expression")}render(e){return e}update(e,[r]){if(r===c||r===g)return r;let s=e.element,i=e.name;if(e.type===n.PROPERTY){if(r===s[i])return c}else if(e.type===n.BOOLEAN_ATTRIBUTE){if(!!r===s.hasAttribute(i))return c}else if(e.type===n.ATTRIBUTE&&s.getAttribute(i)===r+"")return c;return T(e),r}});var t=class extends E{constructor(){super(...arguments),this.formControlController=new B(this,{value:e=>e.checked?e.value||"on":void 0,defaultValue:e=>e.defaultChecked,setValue:(e,r)=>e.checked=r}),this.hasSlotController=new A(this,"help-text"),this.hasFocus=!1,this.title="",this.name="",this.size="medium",this.disabled=!1,this.checked=!1,this.indeterminate=!1,this.defaultChecked=!1,this.form="",this.required=!1,this.helpText=""}get validity(){return this.input.validity}get validationMessage(){return this.input.validationMessage}firstUpdated(){this.formControlController.updateValidity()}handleClick(){this.checked=!this.checked,this.indeterminate=!1,this.emit("sl-change")}handleBlur(){this.hasFocus=!1,this.emit("sl-blur")}handleInput(){this.emit("sl-input")}handleInvalid(e){this.formControlController.setValidity(!1),this.formControlController.emitInvalidEvent(e)}handleFocus(){this.hasFocus=!0,this.emit("sl-focus")}handleDisabledChange(){this.formControlController.setValidity(this.disabled)}handleStateChange(){this.input.checked=this.checked,this.input.indeterminate=this.indeterminate,this.formControlController.updateValidity()}click(){this.input.click()}focus(e){this.input.focus(e)}blur(){this.input.blur()}checkValidity(){return this.input.checkValidity()}getForm(){return this.formControlController.getForm()}reportValidity(){return this.input.reportValidity()}setCustomValidity(e){this.input.setCustomValidity(e),this.formControlController.updateValidity()}render(){let e=this.hasSlotController.test("help-text"),r=this.helpText?!0:!!e;return p`
      <div
        class=${f({"form-control":!0,"form-control--small":this.size==="small","form-control--medium":this.size==="medium","form-control--large":this.size==="large","form-control--has-help-text":r})}
      >
        <label
          part="base"
          class=${f({checkbox:!0,"checkbox--checked":this.checked,"checkbox--disabled":this.disabled,"checkbox--focused":this.hasFocus,"checkbox--indeterminate":this.indeterminate,"checkbox--small":this.size==="small","checkbox--medium":this.size==="medium","checkbox--large":this.size==="large"})}
        >
          <input
            class="checkbox__input"
            type="checkbox"
            title=${this.title}
            name=${this.name}
            value=${$(this.value)}
            .indeterminate=${b(this.indeterminate)}
            .checked=${b(this.checked)}
            .disabled=${this.disabled}
            .required=${this.required}
            aria-checked=${this.checked?"true":"false"}
            aria-describedby="help-text"
            @click=${this.handleClick}
            @input=${this.handleInput}
            @invalid=${this.handleInvalid}
            @blur=${this.handleBlur}
            @focus=${this.handleFocus}
          />

          <span
            part="control${this.checked?" control--checked":""}${this.indeterminate?" control--indeterminate":""}"
            class="checkbox__control"
          >
            ${this.checked?p`
                  <sl-icon part="checked-icon" class="checkbox__checked-icon" library="system" name="check"></sl-icon>
                `:""}
            ${!this.checked&&this.indeterminate?p`
                  <sl-icon
                    part="indeterminate-icon"
                    class="checkbox__indeterminate-icon"
                    library="system"
                    name="indeterminate"
                  ></sl-icon>
                `:""}
          </span>

          <div part="label" class="checkbox__label">
            <slot></slot>
          </div>
        </label>

        <div
          aria-hidden=${r?"false":"true"}
          class="form-control__help-text"
          id="help-text"
          part="form-control-help-text"
        >
          <slot name="help-text">${this.helpText}</slot>
        </div>
      </div>
    `}};t.styles=[w,U,S];t.dependencies={"sl-icon":F};o([q('input[type="checkbox"]')],t.prototype,"input",2);o([V()],t.prototype,"hasFocus",2);o([l()],t.prototype,"title",2);o([l()],t.prototype,"name",2);o([l()],t.prototype,"value",2);o([l({reflect:!0})],t.prototype,"size",2);o([l({type:Boolean,reflect:!0})],t.prototype,"disabled",2);o([l({type:Boolean,reflect:!0})],t.prototype,"checked",2);o([l({type:Boolean,reflect:!0})],t.prototype,"indeterminate",2);o([I("checked")],t.prototype,"defaultChecked",2);o([l({reflect:!0})],t.prototype,"form",2);o([l({type:Boolean,reflect:!0})],t.prototype,"required",2);o([l({attribute:"help-text"})],t.prototype,"helpText",2);o([u("disabled",{waitUntilFirstUpdate:!0})],t.prototype,"handleDisabledChange",1);o([u(["checked","indeterminate"],{waitUntilFirstUpdate:!0})],t.prototype,"handleStateChange",1);var D=t;t.define("sl-checkbox");export{D as default};
/*! Bundled license information:

lit-html/directives/live.js:
  (**
   * @license
   * Copyright 2020 Google LLC
   * SPDX-License-Identifier: BSD-3-Clause
   *)
*/
//# sourceMappingURL=/content-editable/bridgetown/static/chunks/checkbox-35KCUUJR.js.map