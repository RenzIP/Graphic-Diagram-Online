import { s as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { p as page } from "../../../../chunks/stores.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("redirect") || "/dashboard";
    $$renderer2.push(`<div class="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-slate-950 p-4"><div class="pointer-events-none absolute top-0 left-0 z-0 h-full w-full overflow-hidden"><div class="absolute top-[-10%] left-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-indigo-600/10 blur-[100px]"></div> <div class="absolute right-[-10%] bottom-[-10%] h-[50%] w-[50%] animate-pulse rounded-full bg-purple-600/10 blur-[100px] delay-1000"></div></div> <div class="z-10 flex min-h-[200px] flex-col items-center justify-center text-center">`);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-indigo-400 border-t-transparent"></div> <p class="text-lg font-medium text-white">Completing sign-in...</p> <p class="mt-1 text-sm text-slate-400">Please wait while we verify your account</p>`);
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
