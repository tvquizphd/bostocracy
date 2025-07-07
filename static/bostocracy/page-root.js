import StyleGlobal from "style-global" with { type: "css" };
import StylePageRoot from "style-page-root" with { type: "css" };
import { get_events } from "api";

class PageRoot extends HTMLElement {

  static eventHandlerKeys = [
    "stops/redraw", "events/modal", "events/modal/close",
    "events/found", "events/reload"
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
    const copy = template.content.cloneNode(true)
    const layer_map_el = copy.querySelector(
      "layer-map"
    );
    const event_list_el = copy.querySelector(
      "event-list"
    );
    const toggle_el = copy.querySelector(
      ".toggle"
    );
    const toggle_button = copy.querySelector(
      "button"
    );
    if (toggle_button) {
      toggle_button.addEventListener("click", async () => {
        const show = toggle_el.getAttribute("show");
        const show_stops = show == "events";
        event_list_el.setAttribute(
          "events", layer_map_el.getAttribute("events")
        );
        toggle_el.setAttribute(
          "show", show_stops ? "stops" : "events"
        )
        await event_list_el.render();  
      });
    }
    const events = await get_events();
    layer_map_el.setAttribute("events", JSON.stringify(events));
    event_list_el.setAttribute("events", JSON.stringify(events));
    this.shadowRoot.appendChild(copy);
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
        if (detail.edit) {
          event_modal_el.setAttribute(
            "stop_key", detail.stop_key
          )
          layer_map_el.panToNewEvent(
            detail.latitude, detail.longitude,
            { stop_key: detail.stop_key }
          );
          event_modal_el.className = "";
          await event_modal_el.render();
        }
        else {
          layer_map_el.panToLocation(
            detail.latitude, detail.longitude
          );
        }
      }
    }
    if (key === "events/modal/close") {
      return async () => {
        const event_modal_el = this.shadowRoot.querySelector(
          "event-modal"
        );
        event_modal_el.className = "hide";
        const layer_map_el = this.shadowRoot.querySelector(
          "layer-map"
        );
        layer_map_el.removeCircleType("events/modal");
      }
    }
    if (key === "events/found") {
      return async ({ detail }) => {
        const { events } = detail;
        const toggle_el = this.shadowRoot.querySelector(
          ".toggle"
        );
        const event_list_el = this.shadowRoot.querySelector(
          "event-list"
        );
        event_list_el.setAttribute(
          "events", JSON.stringify(events)
        );
        toggle_el.setAttribute("show", "events");
        event_list_el.render();
      }
    }
    if (key === "events/reload") {
      return async () => {
        const layer_map_el = this.shadowRoot.querySelector(
          "layer-map"
        );
        const event_list_el = this.shadowRoot.querySelector(
          "event-list"
        );
        const events = await get_events();
        layer_map_el.setAttribute("events", JSON.stringify(events));
        event_list_el.setAttribute("events", JSON.stringify(events));
        layer_map_el.drawFoundEvents();
        event_list_el.render();
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
