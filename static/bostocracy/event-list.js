import StyleGlobal from "style-global" with { type: "css" };
import StyleEventList from "style-event-list" with { type: "css" };
import { get_mbta_stops } from "api";

class EventList extends HTMLElement {

  static eventHandlerKeys = [ ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [
      StyleGlobal, StyleEventList
    ];
  }

  async connectedCallback() {
    await this.render();
  }

  async render() {
    const stop_map = await get_mbta_stops();
    this.shadowRoot.innerHTML = "";
    const events = JSON.parse(
      this.getAttribute("events")
    );
    const stop_key = this.getAttribute("stop_key");
    events.forEach(ev => {
      const el = document.createElement("button"); 
      const name_el = document.createElement("div"); 
      const blank_el = document.createElement("div"); 
      const org_el = document.createElement("div"); 
      const stop_el = document.createElement("div"); 
      const date_el = document.createElement("div"); 
      const time_el = document.createElement("div"); 
      const stop = stop_map.get(ev.stop_key);
      
      name_el.innerText = ev.title;
      org_el.innerText = ev.org;
      stop_el.innerText = stop.name;
      date_el.innerText = (
        new Date(ev.datetime).toLocaleDateString()
      );
      time_el.innerText = (
        new Date(ev.datetime).toLocaleTimeString()
      );
      [
        name_el, blank_el,
        org_el, stop_el,
        date_el, time_el
      ].forEach(item => {
        el.appendChild(item);
      })
      el.addEventListener("click", () => {
        this.sendCustomEvent("events/modal", {
          ...stop, stop_key: ev.stop_key,
          edit: false
        })
      });
      this.shadowRoot.appendChild(el);
    })
  }

}

export { EventList };
