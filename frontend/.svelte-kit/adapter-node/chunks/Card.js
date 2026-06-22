import { g as attributes, b as stringify } from "./index2.js";
function Card($$renderer, $$props) {
  let { class: className = "", children, $$slots, $$events, ...rest } = $$props;
  $$renderer.push(`<div${attributes({
    class: `glass-card rounded-2xl overflow-hidden transition-all duration-300 ${stringify(className)}`,
    ...rest
  })}>`);
  children?.($$renderer);
  $$renderer.push(`<!----></div>`);
}
export {
  Card as C
};
