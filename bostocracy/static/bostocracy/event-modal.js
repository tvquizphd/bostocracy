import StyleGlobal from "style-global" with { type: "css" };
import StyleEventModal from "style-event-modal" with { type: "css" };

class EventModal extends HTMLElement {

  static eventHandlerKeys = [
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [
      StyleGlobal, StyleEventModal
    ];
  }

  async connectedCallback() {
    await this.render();
  }

  async render() {
    this.shadowRoot.innerHTML = "";
    const template = document.getElementById("event-modal-view");
    const copy = template.content.cloneNode(true);
    const button_el = copy.querySelector("button");
    button_el.addEventListener("click", () => {
      this.className = "hide";
    });
    this.shadowRoot.appendChild(copy);
  }
}

export { EventModal };
