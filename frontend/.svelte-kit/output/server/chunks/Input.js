import { d as attr_class, a as attr, g as attributes, c as bind_props, b as stringify } from "./index2.js";
import { e as escape_html } from "./context.js";
function Input($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      type = "text",
      value = void 0,
      placeholder = "",
      label,
      error,
      class: className = "",
      id = crypto.randomUUID(),
      $$slots,
      $$events,
      ...rest
    } = $$props;
    $$renderer2.push(`<div${attr_class(`w-full flex flex-col gap-1.5 ${stringify(className)}`)}>`);
    if (label) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<label${attr("for", id)} class="text-sm font-medium text-slate-300">${escape_html(label)}</label>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="relative"><input${attributes(
      {
        id,
        type,
        value,
        placeholder,
        class: `flex h-11 w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white placeholder:text-slate-500 shadow-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:border-primary/50 hover:border-white/20 disabled:cursor-not-allowed disabled:opacity-50 ${stringify(error ? "border-error/50 focus-visible:ring-error/50 focus-visible:border-error/50" : "")}`,
        ...rest
      },
      void 0,
      void 0,
      void 0,
      4
    )}/></div> `);
    if (error) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="text-xs text-error font-medium">${escape_html(error)}</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, { value });
  });
}
export {
  Input as I
};
