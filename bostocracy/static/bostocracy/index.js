import { EventsMap } from "events-map";
import { toggle_tab } from "actions";
import { tabs, default_tab } from "tags";


const index = (user) => {
  // Tabs
  customElements.define(default_tab, EventsMap);
  // Within the tabs
  //customElements.define("one-post", inherit(OnePost));

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
