import { tabs } from "tags";

const toggle_tab = async (tab, options={}) => {
  const other_tabs = tabs.filter(other => other !== tab).map(
    tab => document.querySelector(tab)
  );
  other_tabs.filter(other => other).forEach(
    other => other.style.display = "none"
  );
  const element = document.querySelector(tab);
  add_options(element, options);
  await element.render();
  element.style.display = "grid";
}

const add_options = (element, options, allow) => {
  Object.entries(options).forEach(([key, value]) => {
    element.setAttribute(key, value)
  });
}

export { toggle_tab }
