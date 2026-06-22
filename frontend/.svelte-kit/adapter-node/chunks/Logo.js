import { a as attr, d as attr_class, j as clsx } from "./index2.js";
function Logo($$renderer, $$props) {
  let { size = 28, class: className = "" } = $$props;
  $$renderer.push(`<svg${attr("width", size)}${attr("height", size)} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"${attr_class(clsx(className))}><rect x="3" y="3" width="6" height="6" rx="1.5"></rect><rect x="15" y="3" width="6" height="6" rx="1.5"></rect><rect x="9" y="15" width="6" height="6" rx="1.5"></rect><path d="M6 9v2a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V9"></path><path d="M12 13v2"></path></svg>`);
}
export {
  Logo as L
};
