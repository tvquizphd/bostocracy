import StyleGlobal from "style-global" with { type: "css" };
import StyleStopList from "style-stop-list" with { type: "css" };

class StopList extends HTMLElement {

  static eventHandlerKeys = [
    "stops/redraw"
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [
      StyleGlobal, StyleStopList
    ];
  }

  async connectedCallback() {
    await this.render();
  }

  async render() {
    this.shadowRoot.innerHTML = "";
    const ids = this.getAttribute("ids").split(" ");
    ids.forEach(id => {
      const el = document.createElement("div"); 
      el.innerText = id; // TODO
      this.shadowRoot.appendChild(el);
    })
  }

}

export { StopList };
