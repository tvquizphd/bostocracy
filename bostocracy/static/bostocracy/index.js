import { LayerMap } from "layer-map";
import { StopList } from "stop-list";
import { PageRoot } from "page-root";
import { toggle_tab } from "actions";
import { 
  events, tabs, default_tab
} from "constants";

const index = (user) => {
  // Default Tab
  customElements.define(
    default_tab, eventReceiver(
      PageRoot, PageRoot.eventHandlerKeys
    )
  );
  // Map Layer 
  customElements.define(
    "layer-map", eventSender(LayerMap)
  );
  // List of MBTA stops
  customElements.define(
    "stop-list", StopList
  )
  // Tab selection
  tabs.forEach(tab => {
    [
      ...document.getElementsByClassName(`select-${tab}`)
    ].forEach(
      match => match.addEventListener(
        "click", () => toggle_tab(tab, user)
      )
    );
  });
  // By default
  toggle_tab(default_tab, user);
};


const eventSender = (element) => {
  return class extends element {
    sendCustomEvent(key, detail) {
      if (!events.has(key)) {
        throw new Error(`Invalid Custom Event: "${key}"`);
      }
      const [bubbles, composed] = [true, true];
      this.shadowRoot.dispatchEvent(new CustomEvent(
        key, { detail, bubbles, composed }
      ));
    }
  }
}

const eventReceiver = (element, keys=[]) => {
  if (!keys.every(key => events.has(key))) {
    throw new Error(`Invalid Custom Events`);
  }
  return class extends element {
    async connectedCallback() {
      await super.connectedCallback();
      keys.forEach(
        key => this.addEventListener(
          key, this.toEventHandler(key)
        )
      )
    }
  }
}


const inherit = (element, attrs=["self"]) => {
  return class extends element {
    render() {
      const host = this.getRootNode().host;
      attrs.forEach(attr => {
        if (!host.hasAttribute(attr)) return;
        this.setAttribute(attr, host.getAttribute(attr));
      });
      super.render();
    }
  }
}


export { index }
