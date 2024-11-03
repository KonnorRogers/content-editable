import{a as s}from"/content-editable/bridgetown/static/chunks/chunk-RBCSN77Y.js";import{a as i}from"/content-editable/bridgetown/static/chunks/chunk-B5BOCW3Q.js";import{a as l,b as a,f as p}from"/content-editable/bridgetown/static/chunks/chunk-OGRJXHW7.js";import{c as e}from"/content-editable/bridgetown/static/chunks/chunk-D4LECB4O.js";import"/content-editable/bridgetown/static/chunks/chunk-TYZC2ODH.js";import{a as r,d as o}from"/content-editable/bridgetown/static/chunks/chunk-LRPVQVZA.js";import"/content-editable/bridgetown/static/chunks/chunk-3JAYOADL.js";var n=r`
  :host {
    --padding: 0;

    display: none;
  }

  :host([active]) {
    display: block;
  }

  .tab-panel {
    display: block;
    padding: var(--padding);
  }
`;var m=0,t=class extends p{constructor(){super(...arguments),this.attrId=++m,this.componentId=`sl-tab-panel-${this.attrId}`,this.name="",this.active=!1}connectedCallback(){super.connectedCallback(),this.id=this.id.length>0?this.id:this.componentId,this.setAttribute("role","tabpanel")}handleActiveChange(){this.setAttribute("aria-hidden",this.active?"false":"true")}render(){return o`
      <slot
        part="base"
        class=${s({"tab-panel":!0,"tab-panel--active":this.active})}
      ></slot>
    `}};t.styles=[l,n];e([a({reflect:!0})],t.prototype,"name",2);e([a({type:Boolean,reflect:!0})],t.prototype,"active",2);e([i("active")],t.prototype,"handleActiveChange",1);var d=t;t.define("sl-tab-panel");export{d as default};
//# sourceMappingURL=/content-editable/bridgetown/static/chunks/tab-panel-PAG6F7N5.js.map
