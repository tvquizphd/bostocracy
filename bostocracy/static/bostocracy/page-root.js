import StyleGlobal from "style-global" with { type: "css" };
import StylePageRoot from "style-page-root" with { type: "css" };

class PageRoot extends HTMLElement {

  static eventHandlerKeys = [
    "stops/redraw"
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [
      StyleGlobal, StylePageRoot
    ];
  }

  async connectedCallback() {
    await this.render();
  }

  async render() {
    this.shadowRoot.innerHTML = "";
    const template = document.getElementById("page-root-view");
    this.shadowRoot.appendChild(template.content.cloneNode(true));
  }

  toEventHandler(key) {
    if (key === "stops/redraw") {
      return async ({ detail }) => {
        const stop_list_el = this.shadowRoot.querySelector(
          "stop-list"
        );
        stop_list_el.setAttribute(
          "ids", detail.stop_ids.join(" ")
        )
        await stop_list_el.render();
      }
    }
  }

}

export { PageRoot };
