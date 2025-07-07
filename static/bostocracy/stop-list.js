import StyleGlobal from "style-global" with { type: "css" };
import StyleStopList from "style-stop-list" with { type: "css" };
import { get_mbta_stops } from "api";

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
    const stop_map = await get_mbta_stops();
    this.shadowRoot.innerHTML = "";
    const ids = this.getAttribute("ids").split(" ");
    ids.filter(id => stop_map.has(id)).forEach(id => {
      const el = document.createElement("button"); 
      const stop = stop_map.get(id);
      el.innerText = stop.name;
      el.addEventListener("click", () => {
        this.sendCustomEvent("events/modal", {
          ...stop, stop_key: id,
          edit: true
        })
      })
      this.shadowRoot.appendChild(el);
    })
  }

}

export { StopList };
