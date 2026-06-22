import { d as attr_class, a as attr, b as stringify, s as store_get, e as ensure_array_like, u as unsubscribe_stores } from "./index2.js";
import { e as escape_html } from "./context.js";
import { B as Button } from "./Button.js";
import { L as Logo } from "./Logo.js";
import { p as page } from "./stores.js";
import "@sveltejs/kit/internal";
import "./exports.js";
import "./utils2.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "./state.svelte.js";
import { c as currentUser } from "./auth.js";
import "./client2.js";
function Avatar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let {
      src,
      alt = "Avatar",
      initials = "User",
      size = "md",
      class: className = ""
    } = $$props;
    const sizeClasses = {
      sm: "w-8 h-8 text-xs",
      md: "w-10 h-10 text-sm",
      lg: "w-12 h-12 text-base",
      xl: "w-16 h-16 text-lg"
    };
    function getInitials(name) {
      return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
    }
    $$renderer2.push(`<div${attr_class(`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-700 bg-slate-800 ${stringify(sizeClasses[size])} ${stringify(className)}`)}>`);
    if (src) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<img${attr("src", src)}${attr("alt", alt)} class="h-full w-full object-cover"/>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<span class="font-medium text-slate-300">${escape_html(getInitials(initials))}</span>`);
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
function AppSidebar($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let activePath = store_get($$store_subs ??= {}, "$page", page).url.pathname;
    let workspaces = [];
    let mobileOpen = false;
    let user = store_get($$store_subs ??= {}, "$currentUser", currentUser);
    let userInitials = user?.full_name ? user.full_name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : user?.email?.slice(0, 2).toUpperCase() ?? "??";
    const wsColors = ["indigo", "orange", "emerald", "pink", "cyan", "amber"];
    if (mobileOpen) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<button class="fixed inset-0 z-30 bg-slate-950/75 lg:hidden" aria-label="Close navigation"></button>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <button class="fixed top-4 left-4 z-50 flex h-11 w-11 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-200 shadow-lg lg:hidden" aria-label="Open navigation"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button> <aside${attr_class(`fixed inset-y-0 left-0 z-40 flex h-full w-72 -translate-x-full flex-col border-r border-white/5 bg-background/95 backdrop-blur-xl transition-transform duration-200 lg:static lg:w-64 lg:translate-x-0 ${stringify(mobileOpen ? "translate-x-0" : "")}`)}><div class="flex h-16 items-center border-b border-white/5 px-6"><div class="flex items-center gap-2">`);
    Logo($$renderer2, { size: "14", class: "text-white" });
    $$renderer2.push(`<!----> <span class="text-lg font-bold tracking-tight text-white font-outfit">GraDiOl</span></div></div> <div class="flex-1 space-y-6 overflow-y-auto px-3 py-6"><div><h3 class="mb-2 px-3 text-xs font-semibold tracking-wider text-slate-500 uppercase">Platform</h3> <div class="space-y-1">`);
    Button($$renderer2, {
      variant: activePath === "/dashboard" ? "secondary" : "ghost",
      class: "w-full justify-start hover-premium",
      href: "/dashboard",
      onclick: () => mobileOpen = false,
      children: ($$renderer3) => {
        $$renderer3.push(`<svg class="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg> Dashboard`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: activePath.startsWith("/team") ? "secondary" : "ghost",
      class: "w-full justify-start hover-premium",
      href: "/team",
      onclick: () => mobileOpen = false,
      children: ($$renderer3) => {
        $$renderer3.push(`<svg class="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> Team Members`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: activePath.startsWith("/settings") ? "secondary" : "ghost",
      class: "w-full justify-start hover-premium",
      href: "/settings",
      onclick: () => mobileOpen = false,
      children: ($$renderer3) => {
        $$renderer3.push(`<svg class="mr-3 h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg> Settings`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div> <div><div class="mb-2 flex items-center justify-between px-3"><h3 class="text-xs font-semibold tracking-wider text-slate-500 uppercase">Workspaces</h3> <a href="/dashboard" class="text-slate-500 transition-colors hover:text-white" aria-label="Create Workspace"><svg class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></a></div> <div class="space-y-1">`);
    if (workspaces.length === 0) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<p class="px-3 text-xs text-slate-600">No workspaces yet</p>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<!--[-->`);
      const each_array = ensure_array_like(workspaces);
      for (let i = 0, $$length = each_array.length; i < $$length; i++) {
        let ws = each_array[i];
        Button($$renderer2, {
          variant: activePath === `/workspace/${ws.id}` ? "secondary" : "ghost",
          class: "w-full justify-start pl-3 text-sm",
          href: `/workspace/${ws.id}`,
          onclick: () => mobileOpen = false,
          children: ($$renderer3) => {
            $$renderer3.push(`<span${attr_class(`mr-3 h-2 w-2 shrink-0 rounded-full bg-${wsColors[i % wsColors.length]}-500`)}></span> <span class="truncate">${escape_html(ws.name)}</span>`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--></div></div></div> <div class="border-t border-slate-800 p-4"><div class="relative"><button class="flex w-full cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-slate-800">`);
    Avatar($$renderer2, { size: "sm", initials: userInitials });
    $$renderer2.push(`<!----> <div class="min-w-0 flex-1 text-left"><div class="truncate text-sm font-medium text-white">${escape_html(user?.full_name || "User")}</div> <div class="truncate text-xs text-slate-500">${escape_html(user?.email || "")}</div></div> <svg class="h-4 w-4 shrink-0 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 9l4-4 4 4m0 6l-4 4-4-4"></path></svg></button> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div></aside>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  AppSidebar as A,
  Avatar as a
};
