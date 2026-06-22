import { a as attr, e as ensure_array_like } from "../../../../chunks/index2.js";
import { A as AppSidebar } from "../../../../chunks/AppSidebar.js";
import { B as Button } from "../../../../chunks/Button.js";
import { C as Card } from "../../../../chunks/Card.js";
import { M as Modal, D as DIAGRAM_TYPES } from "../../../../chunks/constants.js";
import { I as Input } from "../../../../chunks/Input.js";
import "../../../../chunks/client2.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let searchQuery = "";
    let showNewDiagramModal = false;
    let showNewWorkspaceModal = false;
    let showNewProjectModal = false;
    let workspaces = [];
    let totalProjects = 0;
    let totalDocuments = 0;
    let newWsName = "";
    let newWsDescription = "";
    let selectedWorkspaceId = "";
    let newProjectName = "";
    let newDiagramTitle = "";
    let creatingDiagram = false;
    function timeAgo(dateStr) {
      const now = /* @__PURE__ */ new Date();
      const date = new Date(dateStr);
      const diff = Math.floor((now.getTime() - date.getTime()) / 1e3);
      if (diff < 60) return "just now";
      if (diff < 3600) return `${Math.floor(diff / 60)} mins ago`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
      return `${Math.floor(diff / 86400)} days ago`;
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="flex h-screen overflow-hidden bg-background text-text-primary font-inter">`);
      AppSidebar($$renderer3);
      $$renderer3.push(`<!----> <main class="flex min-h-0 flex-1 flex-col overflow-hidden bg-background"><header class="flex h-16 shrink-0 items-center justify-between border-b border-white/5 bg-background/80 px-8 backdrop-blur-xl"><h1 class="text-xl font-bold text-white tracking-tight font-outfit">Dashboard</h1> <div class="flex w-1/3 items-center gap-4"><div class="relative w-full group"><div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><svg class="h-4 w-4 text-text-secondary group-focus-within:text-primary transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> <input type="text" placeholder="Search diagrams..."${attr("value", searchQuery)} class="w-full rounded-xl border border-white/10 bg-surface/50 py-2.5 pr-4 pl-10 text-sm text-white placeholder-text-tertiary shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-all duration-300 hover:border-white/20"/></div> `);
      Button($$renderer3, {
        variant: "primary",
        size: "sm",
        onclick: () => showNewDiagramModal = true,
        class: "whitespace-nowrap shadow-[0_0_15px_rgba(99,102,241,0.2)]",
        children: ($$renderer4) => {
          $$renderer4.push(`<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg> New Diagram`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div></header> <div class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"><section class="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">`);
      Card($$renderer3, {
        class: "p-6 bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface/80 transition-all duration-300",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex items-center gap-3 mb-2"><div class="p-2 bg-primary/10 rounded-xl"><svg class="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"></path></svg></div> <p class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Workspace</p></div> <p class="text-3xl font-bold text-white">${escape_html(workspaces.length)}</p>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Card($$renderer3, {
        class: "p-6 bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface/80 transition-all duration-300",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex items-center gap-3 mb-2"><div class="p-2 bg-accent/10 rounded-xl"><svg class="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg></div> <p class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Project</p></div> <p class="text-3xl font-bold text-white">${escape_html(totalProjects)}</p>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Card($$renderer3, {
        class: "p-6 bg-surface/50 border-white/5 hover:border-white/10 hover:bg-surface/80 transition-all duration-300",
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="flex items-center gap-3 mb-2"><div class="p-2 bg-[#06b6d4]/10 rounded-xl"><svg class="w-5 h-5 text-[#06b6d4]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg></div> <p class="text-xs font-semibold uppercase tracking-wider text-text-tertiary">Documents</p></div> <p class="text-3xl font-bold text-white">${escape_html(totalDocuments)}</p>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></section> <section class="mb-12"><div class="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between"><div><h2 class="text-lg font-semibold text-white tracking-tight font-outfit">Your Workspaces</h2> <p class="text-sm text-text-secondary mt-1">Manage your team's projects and diagrams.</p></div> `);
      Button($$renderer3, {
        onclick: () => showNewWorkspaceModal = true,
        variant: "secondary",
        size: "sm",
        class: "bg-card border-white/10 hover:bg-surface",
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->+ New Workspace`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3"><!--[-->`);
      const each_array = ensure_array_like(workspaces);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let workspace = each_array[$$index];
        Card($$renderer3, {
          class: "p-6 bg-surface/30 border-white/5 hover:border-primary/30 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300",
          children: ($$renderer4) => {
            $$renderer4.push(`<div class="flex items-start justify-between gap-3"><div><h3 class="text-base font-semibold text-white flex items-center gap-2">${escape_html(workspace.name)}</h3> <p class="mt-1.5 text-sm text-text-secondary line-clamp-2">${escape_html(workspace.description || "Workspace tanpa deskripsi")}</p></div> <span class="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-wider text-text-tertiary font-medium">${escape_html(workspace.role)}</span></div> <div class="mt-6 pt-4 border-t border-white/5 flex items-center justify-between"><div class="text-xs text-text-tertiary">Updated ${escape_html(timeAgo(workspace.updated_at))}</div> <div class="flex gap-2">`);
            Button($$renderer4, {
              href: `/workspace/${workspace.id}`,
              size: "sm",
              variant: "ghost",
              class: "text-primary hover:text-white hover:bg-primary/20",
              children: ($$renderer5) => {
                $$renderer5.push(`<!---->View`);
              },
              $$slots: { default: true }
            });
            $$renderer4.push(`<!----></div></div>`);
          },
          $$slots: { default: true }
        });
      }
      $$renderer3.push(`<!--]--></div></section> <section class="mb-12"><h2 class="mb-5 text-lg font-semibold text-white tracking-tight font-outfit">Quick Start</h2> <div class="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-5"><button class="group relative flex flex-col items-center rounded-xl border border-dashed border-white/10 bg-surface/20 p-5 text-left transition-all duration-300 hover:border-primary/50 hover:bg-primary/5 hover:-translate-y-1"><div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20 text-primary"><svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></div> <span class="text-sm font-medium text-text-secondary group-hover:text-white">Blank Diagram</span></button> <!--[-->`);
      const each_array_1 = ensure_array_like(DIAGRAM_TYPES);
      for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
        let template = each_array_1[$$index_1];
        $$renderer3.push(`<button class="group flex flex-col items-center rounded-xl border border-white/5 bg-surface/40 p-5 text-left transition-all duration-300 hover:border-white/20 hover:bg-surface/80 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"><div class="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-card border border-white/5 text-2xl transition-transform duration-300 group-hover:scale-110 shadow-sm">${escape_html(template.icon)}</div> <span class="text-sm font-medium text-text-secondary group-hover:text-white">${escape_html(template.name)}</span></button>`);
      }
      $$renderer3.push(`<!--]--></div></section> <section><h2 class="mb-5 text-lg font-semibold text-white tracking-tight font-outfit">Recent Diagrams</h2> `);
      {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="flex items-center justify-center py-12"><div class="h-8 w-8 animate-spin rounded-full border-2 border-white/10 border-t-primary"></div></div>`);
      }
      $$renderer3.push(`<!--]--></section></div></main></div> `);
      Modal($$renderer3, {
        get open() {
          return showNewDiagramModal;
        },
        set open($$value) {
          showNewDiagramModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-6"><h3 class="mb-5 text-lg font-semibold text-white font-outfit">Create New Diagram</h3> `);
          if (workspaces.length === 0) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<p class="mb-4 text-sm text-text-secondary bg-surface/50 p-4 rounded-xl border border-white/10">You need a workspace first. <button class="text-primary font-medium hover:text-primary-hover ml-1">Create one</button></p>`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`<div class="mb-5 space-y-4">`);
            Input($$renderer4, {
              label: "Diagram Title",
              placeholder: "Untitled Diagram",
              get value() {
                return newDiagramTitle;
              },
              set value($$value) {
                newDiagramTitle = $$value;
                $$settled = false;
              }
            });
            $$renderer4.push(`<!----> <div><label for="ws-select" class="mb-1.5 block text-sm font-medium text-text-secondary">Workspace</label> `);
            $$renderer4.select(
              {
                id: "ws-select",
                value: selectedWorkspaceId,
                class: "w-full rounded-xl border border-white/10 bg-surface px-3 py-2.5 text-sm text-white shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors appearance-none"
              },
              ($$renderer5) => {
                $$renderer5.push(`<!--[-->`);
                const each_array_3 = ensure_array_like(workspaces);
                for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
                  let ws = each_array_3[$$index_3];
                  $$renderer5.option({ value: ws.id }, ($$renderer6) => {
                    $$renderer6.push(`${escape_html(ws.name)}`);
                  });
                }
                $$renderer5.push(`<!--]-->`);
              }
            );
            $$renderer4.push(`</div></div> <div class="mb-2"><p class="mb-3 block text-sm font-medium text-text-secondary">Select Diagram Type</p> <div class="grid grid-cols-3 gap-3"><!--[-->`);
            const each_array_4 = ensure_array_like(DIAGRAM_TYPES);
            for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
              let dt = each_array_4[$$index_4];
              $$renderer4.push(`<button class="flex flex-col items-center rounded-xl border border-white/10 bg-surface/50 p-4 text-center transition-all hover:border-primary/50 hover:bg-surface"${attr("disabled", creatingDiagram, true)}><span class="mb-2 text-2xl drop-shadow-md">${escape_html(dt.icon)}</span> <span class="text-[11px] font-medium text-text-tertiary uppercase tracking-wide">${escape_html(dt.name)}</span></button>`);
            }
            $$renderer4.push(`<!--]--></div></div>`);
          }
          $$renderer4.push(`<!--]--></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Modal($$renderer3, {
        get open() {
          return showNewWorkspaceModal;
        },
        set open($$value) {
          showNewWorkspaceModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-6"><h3 class="mb-1.5 text-lg font-semibold text-white tracking-tight font-outfit">Create Workspace</h3> <p class="text-sm text-text-secondary mb-5">Step 1: Create a collaborative workspace for your team.</p> <form class="space-y-4">`);
          Input($$renderer4, {
            label: "Workspace Name",
            placeholder: "My Awesome Team",
            get value() {
              return newWsName;
            },
            set value($$value) {
              newWsName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div><label for="ws-desc" class="mb-1.5 block text-sm font-medium text-text-secondary">Description <span class="text-text-tertiary font-normal">(optional)</span></label> <textarea id="ws-desc"${attr("rows", 3)} placeholder="What is this workspace for?" class="w-full rounded-xl border border-white/10 bg-surface px-3 py-2.5 text-sm text-white placeholder-text-tertiary shadow-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 focus:outline-none transition-colors resize-none hover:border-white/20">`);
          const $$body = escape_html(newWsDescription);
          if ($$body) {
            $$renderer4.push(`${$$body}`);
          }
          $$renderer4.push(`</textarea></div> <div class="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">`);
          Button($$renderer4, {
            variant: "ghost",
            onclick: () => showNewWorkspaceModal = false,
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->Cancel`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Button($$renderer4, {
            variant: "primary",
            type: "submit",
            disabled: !newWsName.trim(),
            class: "px-6",
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->${escape_html("Continue to Project →")}`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></form></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Modal($$renderer3, {
        get open() {
          return showNewProjectModal;
        },
        set open($$value) {
          showNewProjectModal = $$value;
          $$settled = false;
        },
        children: ($$renderer4) => {
          $$renderer4.push(`<div class="p-6"><h3 class="mb-1.5 text-lg font-semibold text-white tracking-tight font-outfit">Create Project</h3> <p class="text-sm text-text-secondary mb-5">Step 2: Create a project inside your workspace to organize diagrams.</p> <form class="space-y-4">`);
          Input($$renderer4, {
            label: "Project Name",
            placeholder: "Sprint 1 Design Docs",
            get value() {
              return newProjectName;
            },
            set value($$value) {
              newProjectName = $$value;
              $$settled = false;
            }
          });
          $$renderer4.push(`<!----> <div class="bg-surface/50 p-4 rounded-xl border border-white/10 mt-4"><div class="flex items-center gap-3"><div class="p-2 bg-primary/10 rounded-xl text-primary"><svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg></div> <div><p class="text-sm font-medium text-white">Instant Setup</p> <p class="text-xs text-text-tertiary">An empty flowchart diagram will be created automatically.</p></div></div></div> <div class="flex justify-end gap-3 pt-4 border-t border-white/10 mt-6">`);
          Button($$renderer4, {
            variant: "ghost",
            onclick: () => showNewProjectModal = false,
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->Cancel`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----> `);
          Button($$renderer4, {
            variant: "primary",
            type: "submit",
            disabled: !newProjectName.trim(),
            class: "px-6",
            children: ($$renderer5) => {
              $$renderer5.push(`<!---->${escape_html("Create & Open Editor")}`);
            },
            $$slots: { default: true }
          });
          $$renderer4.push(`<!----></div></form></div>`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!---->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
  });
}
export {
  _page as default
};
