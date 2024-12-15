import StyleGlobal from "style-global" with { type: "css" };
import StylePageRoot from "style-page-root" with { type: "css" };

class PageRoot extends HTMLElement {

  static eventHandlerKeys = [
    "stops/redraw", "events/modal", "events/modal/close"
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
    if (key === "events/modal") {
      return async ({ detail }) => {
        const layer_map_el = this.shadowRoot.querySelector(
          "layer-map"
        );
        const event_modal_el = this.shadowRoot.querySelector(
          "event-modal"
        );
        event_modal_el.setAttribute(
          "stop_key", detail.stop_key
        )
        layer_map_el.panTo(detail.latitude, detail.longitude);
        event_modal_el.className = "";
        await event_modal_el.render();
      }
    }
    if (key === "events/modal/close") {
      return async ({ detail }) => {
        const layer_map_el = this.shadowRoot.querySelector(
          "layer-map"
        );
        layer_map_el.removeCircleType("events/modal");
      }
    }
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
