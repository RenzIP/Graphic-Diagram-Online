import { e as ensure_array_like, d as attr_class, b as stringify } from "../../../../chunks/index2.js";
import { A as AppSidebar, a as Avatar } from "../../../../chunks/AppSidebar.js";
import { B as Button } from "../../../../chunks/Button.js";
import { C as Card } from "../../../../chunks/Card.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer) {
  let members = [
    {
      id: "1",
      name: "John Doe",
      email: "john@example.com",
      role: "Owner",
      initials: "JD",
      status: "active"
    },
    {
      id: "2",
      name: "Alice Smith",
      email: "alice@example.com",
      role: "Editor",
      initials: "AS",
      status: "active"
    },
    {
      id: "3",
      name: "Bob Jones",
      email: "bob@example.com",
      role: "Viewer",
      initials: "BJ",
      status: "invited"
    }
  ];
  $$renderer.push(`<div class="flex h-screen overflow-hidden bg-slate-950 text-slate-200">`);
  AppSidebar($$renderer);
  $$renderer.push(`<!----> <main class="flex min-h-0 flex-1 flex-col overflow-hidden"><header class="flex h-16 shrink-0 items-center justify-between border-b border-slate-800 bg-slate-950 px-8"><h1 class="text-xl font-bold text-white">Team Members</h1> <div class="flex items-center gap-4">`);
  Button($$renderer, {
    variant: "primary",
    size: "sm",
    children: ($$renderer2) => {
      $$renderer2.push(`<svg class="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path></svg> Invite Member`);
    },
    $$slots: { default: true }
  });
  $$renderer.push(`<!----></div></header> <div class="flex-1 overflow-y-auto p-8"><div class="mx-auto max-w-4xl space-y-6">`);
  Card($$renderer, {
    class: "overflow-hidden border-slate-800 bg-slate-900",
    children: ($$renderer2) => {
      $$renderer2.push(`<div class="border-b border-slate-800 px-6 py-4"><h2 class="text-lg font-medium text-white">Manage Team</h2> <p class="mt-1 text-sm text-slate-400">Invite colleagues to collaborate on your diagrams.</p></div> <div class="divide-y divide-slate-800"><!--[-->`);
      const each_array = ensure_array_like(members);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let member = each_array[$$index];
        $$renderer2.push(`<div class="flex items-center justify-between px-6 py-4"><div class="flex items-center gap-4">`);
        Avatar($$renderer2, { initials: member.initials, size: "md" });
        $$renderer2.push(`<!----> <div><div class="font-medium text-white">${escape_html(member.name)}</div> <div class="text-sm text-slate-500">${escape_html(member.email)}</div></div></div> <div class="flex items-center gap-4"><span${attr_class(`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${stringify(member.status === "active" ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400")}`)}>${escape_html(member.status)}</span> `);
        $$renderer2.select(
          {
            class: "rounded border border-slate-700 bg-slate-800 px-2 py-1 text-sm text-slate-300 focus:border-indigo-500 focus:outline-none",
            value: member.role
          },
          ($$renderer3) => {
            $$renderer3.option({ value: "Owner" }, ($$renderer4) => {
              $$renderer4.push(`Owner`);
            });
            $$renderer3.option({ value: "Editor" }, ($$renderer4) => {
              $$renderer4.push(`Editor`);
            });
            $$renderer3.option({ value: "Viewer" }, ($$renderer4) => {
              $$renderer4.push(`Viewer`);
            });
          }
        );
        $$renderer2.push(` <button class="text-slate-500 hover:text-red-400" aria-label="Remove member"><svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg></button></div></div>`);
      }
      $$renderer2.push(`<!--]--></div>`);
    },
    $$slots: { default: true }
  });
  $$renderer.push(`<!----></div></div></main></div>`);
}
export {
  _page as default
};
