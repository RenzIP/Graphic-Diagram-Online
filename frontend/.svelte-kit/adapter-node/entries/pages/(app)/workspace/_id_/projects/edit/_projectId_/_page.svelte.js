import { s as store_get, u as unsubscribe_stores } from "../../../../../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../../../../../chunks/exports.js";
import "../../../../../../../../chunks/utils2.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../../../../../chunks/state.svelte.js";
import { p as page } from "../../../../../../../../chunks/stores.js";
import { A as AppSidebar } from "../../../../../../../../chunks/AppSidebar.js";
import { B as Button } from "../../../../../../../../chunks/Button.js";
import { C as Card } from "../../../../../../../../chunks/Card.js";
import "../../../../../../../../chunks/client2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex min-h-screen bg-slate-950 text-slate-200">`);
      AppSidebar($$renderer3);
      $$renderer3.push(`<!----> <main class="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8"><div class="mx-auto max-w-3xl"><div class="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p class="text-sm uppercase tracking-[0.3em] text-slate-500">Edit Data</p> <h1 class="mt-2 text-3xl font-bold text-white">Edit Project</h1> <p class="mt-2 text-sm text-slate-400">Perbarui informasi project tanpa mengubah struktur tema aplikasi.</p></div> `);
      Button($$renderer3, {
        href: `/workspace/${store_get($$store_subs ??= {}, "$page", page).params.id}/projects/${store_get($$store_subs ??= {}, "$page", page).params.projectId}`,
        variant: "ghost",
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->Kembali ke Detail`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> `);
      Card($$renderer3, {
        class: "p-6",
        children: ($$renderer4) => {
          {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<div class="flex items-center justify-center py-14"><div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div> <span class="ml-3 text-sm text-slate-500">Memuat form edit...</span></div>`);
          }
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></main></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
