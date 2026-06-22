import { d as attr_class, a as attr, b as stringify } from "../../../../chunks/index2.js";
import { A as AppSidebar, a as Avatar } from "../../../../chunks/AppSidebar.js";
import { B as Button } from "../../../../chunks/Button.js";
import { C as Card } from "../../../../chunks/Card.js";
import { I as Input } from "../../../../chunks/Input.js";
import { s as showToast } from "../../../../chunks/toast.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let settings = {
      theme: "dark",
      gridSize: 20
    };
    let isSaving = false;
    function saveSettings() {
      isSaving = true;
      setTimeout(
        () => {
          isSaving = false;
          showToast("Settings berhasil disimpan.", "success");
        },
        800
      );
    }
    $$renderer2.push(`<div class="flex h-screen overflow-hidden bg-slate-950 text-slate-200">`);
    AppSidebar($$renderer2);
    $$renderer2.push(`<!----> <main class="flex min-h-0 flex-1 flex-col overflow-hidden"><header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8"><h1 class="text-xl font-bold text-white">Settings</h1> `);
    Button($$renderer2, {
      variant: "primary",
      size: "sm",
      onclick: saveSettings,
      disabled: isSaving,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->${escape_html(isSaving ? "Saving..." : "Save Changes")}`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></header> <div class="flex-1 overflow-y-auto p-8"><div class="mx-auto max-w-2xl space-y-6">`);
    Card($$renderer2, {
      class: "border-slate-800 bg-slate-900 p-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="mb-4 text-lg font-medium text-white">Profile</h2> <div class="flex items-center gap-6"><div class="relative">`);
        Avatar($$renderer3, { initials: "JD", size: "lg" });
        $$renderer3.push(`<!----> <button class="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-white shadow-sm hover:bg-indigo-400" aria-label="Ubah avatar"><svg class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path></svg></button></div> <div class="flex-1 space-y-4"><div class="grid grid-cols-2 gap-4"><div>`);
        Input($$renderer3, { label: "First Name", value: "John" });
        $$renderer3.push(`<!----></div> <div>`);
        Input($$renderer3, { label: "Last Name", value: "Doe" });
        $$renderer3.push(`<!----></div></div> <div>`);
        Input($$renderer3, { label: "Email", value: "john@example.com", disabled: true });
        $$renderer3.push(`<!----></div></div></div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      class: "border-slate-800 bg-slate-900 p-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="mb-4 text-lg font-medium text-white">Preferences</h2> <div class="space-y-4"><div class="flex items-center justify-between"><div><div class="font-medium text-white">Theme</div> <div class="text-sm text-slate-500">Choose your interface appearance</div></div> `);
        $$renderer3.select(
          {
            class: "rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none",
            value: settings.theme
          },
          ($$renderer4) => {
            $$renderer4.option({ value: "light" }, ($$renderer5) => {
              $$renderer5.push(`Light`);
            });
            $$renderer4.option({ value: "dark" }, ($$renderer5) => {
              $$renderer5.push(`Dark`);
            });
            $$renderer4.option({ value: "system" }, ($$renderer5) => {
              $$renderer5.push(`System`);
            });
          }
        );
        $$renderer3.push(`</div> <div class="flex items-center justify-between"><div><div class="font-medium text-white">Email Notifications</div> <div class="text-sm text-slate-500">Receive updates about activity</div></div> <button${attr_class(`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${stringify("bg-indigo-500")}`)} aria-label="Toggle email notifications"><span${attr_class(`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${stringify("translate-x-6")}`)}></span></button></div></div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Card($$renderer2, {
      class: "border-slate-800 bg-slate-900 p-6",
      children: ($$renderer3) => {
        $$renderer3.push(`<h2 class="mb-4 text-lg font-medium text-white">Editor</h2> <div class="space-y-4"><div class="flex items-center justify-between"><div><div class="font-medium text-white">Auto-save</div> <div class="text-sm text-slate-500">Automatically save changes</div></div> <button${attr_class(`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${stringify("bg-indigo-500")}`)} aria-label="Toggle auto save"><span${attr_class(`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${stringify("translate-x-6")}`)}></span></button></div> <div class="flex items-center justify-between"><div><div class="font-medium text-white">Grid Size</div> <div class="text-sm text-slate-500">Default grid snapping size</div></div> <input type="number" class="w-20 rounded border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none"${attr("value", settings.gridSize)}/></div></div>`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div></main></div>`);
  });
}
export {
  _page as default
};
