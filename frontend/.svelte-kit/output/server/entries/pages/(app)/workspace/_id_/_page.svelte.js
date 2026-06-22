import { a as attr } from "../../../../../chunks/index2.js";
import { e as escape_html } from "../../../../../chunks/context.js";
import { A as AppSidebar } from "../../../../../chunks/AppSidebar.js";
import "@sveltejs/kit/internal";
import "../../../../../chunks/exports.js";
import "../../../../../chunks/utils2.js";
import "@sveltejs/kit/internal/server";
import "../../../../../chunks/state.svelte.js";
import "../../../../../chunks/client2.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let projects = [];
    let searchQuery = "";
    let filterMode = "all";
    let sortMode = "updated-desc";
    [...projects].filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) || (project.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) || project.id.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterMode === "all";
      return matchesSearch && matchesFilter;
    }).sort((left, right) => {
      return new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime();
    });
    $$renderer2.push(`<div class="flex h-screen overflow-hidden bg-background text-text-primary font-inter">`);
    AppSidebar($$renderer2);
    $$renderer2.push(`<!----> <main class="flex min-h-0 flex-1 flex-col overflow-hidden bg-background"><header class="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-background/80 px-8 backdrop-blur-xl"><div class="flex items-center gap-4"><nav class="flex items-center text-sm text-text-secondary"><a href="/dashboard" class="transition-colors hover:text-white">Dashboard</a> <svg class="mx-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg> <span class="font-medium text-white font-outfit">${escape_html("Workspace")}</span></nav></div> <div class="flex items-center gap-3">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></header> <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">`);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div class="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between"><div><h1 class="text-2xl font-bold text-white tracking-tight font-outfit">Project List</h1> <p class="mt-1 text-sm text-text-tertiary">Manage your workspace projects and their documents.</p></div> <div class="grid gap-3 sm:grid-cols-3 xl:w-[42rem]"><input type="search" placeholder="Search projects..."${attr("value", searchQuery)} class="w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white placeholder-text-tertiary focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors"/> `);
    $$renderer2.select(
      {
        value: filterMode,
        class: "w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors appearance-none"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "all", class: "bg-surface" }, ($$renderer4) => {
          $$renderer4.push(`All Projects`);
        });
        $$renderer3.option({ value: "with-documents", class: "bg-surface" }, ($$renderer4) => {
          $$renderer4.push(`Has Documents`);
        });
        $$renderer3.option({ value: "without-documents", class: "bg-surface" }, ($$renderer4) => {
          $$renderer4.push(`No Documents`);
        });
      }
    );
    $$renderer2.push(` `);
    $$renderer2.select(
      {
        value: sortMode,
        class: "w-full rounded-xl border border-white/10 bg-surface/50 px-4 py-2 text-sm text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors appearance-none"
      },
      ($$renderer3) => {
        $$renderer3.option({ value: "updated-desc", class: "bg-surface" }, ($$renderer4) => {
          $$renderer4.push(`Recently Updated`);
        });
        $$renderer3.option({ value: "name-asc", class: "bg-surface" }, ($$renderer4) => {
          $$renderer4.push(`Name A-Z`);
        });
        $$renderer3.option({ value: "docs-desc", class: "bg-surface" }, ($$renderer4) => {
          $$renderer4.push(`Most Documents`);
        });
      }
    );
    $$renderer2.push(`</div></div> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div class="flex items-center justify-center py-16"><div class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary"></div> <span class="ml-3 text-sm text-text-secondary">Loading projects...</span></div>`);
    }
    $$renderer2.push(`<!--]--></div></main></div>`);
  });
}
export {
  _page as default
};
