import "clsx";
import "@sveltejs/kit/internal";
import "../../../../../../../../chunks/exports.js";
import "../../../../../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../../../../../chunks/state.svelte.js";
import { A as AppSidebar } from "../../../../../../../../chunks/AppSidebar.js";
import { C as Card } from "../../../../../../../../chunks/Card.js";
import "../../../../../../../../chunks/client2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="flex min-h-screen bg-slate-950 text-slate-200">`);
    AppSidebar($$renderer2);
    $$renderer2.push(`<!----> <main class="flex-1 p-4 pt-20 sm:p-6 sm:pt-24 lg:p-8 lg:pt-8"><div class="mx-auto max-w-2xl"><div class="mb-6"><p class="text-sm uppercase tracking-[0.3em] text-red-400">Konfirmasi Hapus</p> <h1 class="mt-2 text-3xl font-bold text-white">Hapus Project</h1> <p class="mt-2 text-sm text-slate-400">Aksi ini tidak bisa dibatalkan dan akan menghapus seluruh dokumen di dalam project.</p></div> `);
    Card($$renderer2, {
      class: "border-red-500/20 p-6",
      children: ($$renderer3) => {
        {
          $$renderer3.push("<!--[-->");
          $$renderer3.push(`<div class="flex items-center justify-center py-14"><div class="h-8 w-8 animate-spin rounded-full border-2 border-slate-700 border-t-red-400"></div> <span class="ml-3 text-sm text-slate-500">Memuat data penghapusan...</span></div>`);
        }
        $$renderer3.push(`<!--]-->`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></main></div>`);
  });
}
export {
  _page as default
};
