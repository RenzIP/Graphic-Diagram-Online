import { s as store_get, u as unsubscribe_stores } from "../../../../../../../chunks/index2.js";
import { p as page } from "../../../../../../../chunks/stores.js";
import { A as AppSidebar } from "../../../../../../../chunks/AppSidebar.js";
import { B as Button } from "../../../../../../../chunks/Button.js";
import { C as Card } from "../../../../../../../chunks/Card.js";
import "../../../../../../../chunks/client2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    $$renderer2.push(`<div class="flex min-h-screen bg-slate-950 text-slate-200">`);
    AppSidebar($$renderer2);
    $$renderer2.push(`<!----> <main class="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8"><div class="mx-auto max-w-6xl"><div class="mb-6 flex flex-wrap items-center justify-between gap-3"><div><p class="text-sm uppercase tracking-[0.3em] text-slate-500">Detail Data</p> <h1 class="mt-2 text-3xl font-bold text-white">Detail Project</h1> <p class="mt-2 text-sm text-slate-400">Menampilkan ringkasan data utama dan daftar dokumen yang terkait.</p></div> <div class="flex flex-wrap gap-2">`);
    Button($$renderer2, {
      href: `/workspace/${store_get($$store_subs ??= {}, "$page", page).params.id}`,
      variant: "ghost",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Kembali`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      href: `/workspace/${store_get($$store_subs ??= {}, "$page", page).params.id}/projects/edit/${store_get($$store_subs ??= {}, "$page", page).params.projectId}`,
      variant: "secondary",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Edit`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      href: `/workspace/${store_get($$store_subs ??= {}, "$page", page).params.id}/projects/delete/${store_get($$store_subs ??= {}, "$page", page).params.projectId}`,
      variant: "danger",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Hapus`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div> `);
    {
      $$renderer2.push("<!--[-->");
      Card($$renderer2, {
        class: "p-10",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="flex items-center justify-center py-14"><div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-indigo-500"></div> <span class="ml-3 text-sm text-slate-500">Memuat detail project...</span></div>`);
        },
        $$slots: { default: true }
      });
    }
    $$renderer2.push(`<!--]--></div></main></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
