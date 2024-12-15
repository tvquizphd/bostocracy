import StyleGlobal from "style-global" with { type: "css" };
import StyleEventForm from "style-event-form" with { type: "css" };

class EventForm extends HTMLElement {

  static eventHandlerKeys = [
  ];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [
      StyleGlobal, StyleEventForm
    ];
  }

  async connectedCallback() {
    await this.render();
  }

  now() {
    const now = new Date();
    const tz_minutes = now.getTimezoneOffset();
    now.setTime(now.getTime() - (tz_minutes*60*1000));
    return now.toISOString().split('.').shift().slice(0,-3);
  }

  async render() {
    this.shadowRoot.innerHTML = "";
    const template = document.getElementById("event-form-view");
    const copy = template.content.cloneNode(true);
    const datetime_el = copy.getElementById("datetime");
    datetime_el.setAttribute("value", this.now());
    datetime_el.setAttribute("min", this.now());

    const [ form, token ] = [
      "form", "[name=csrfmiddlewaretoken]"
    ].map(
      selector => copy.querySelector(selector)
    );
    this.addEventListeners({
      form, token: token.value
    });
    this.shadowRoot.appendChild(copy);
  }

  addEventListeners({ form, token }) {
    console.log(form, token)
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const inputs = new Map(
        new FormData(e.target)
      );
      const data = {
        body: inputs.get("body", "")
      }
      const result = await post_post(data, token);
      if (result.error) {
        console.log(result);
      }
      this.getRootNode().host.render();
      return false;
    });
  }
}

export { EventForm };
