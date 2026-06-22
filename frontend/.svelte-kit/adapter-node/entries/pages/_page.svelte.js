import "clsx";
import { B as Button } from "../../chunks/Button.js";
import { L as Logo } from "../../chunks/Logo.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    $$renderer2.push(`<div class="min-h-screen bg-background text-text-primary overflow-hidden relative font-inter"><div class="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] opacity-30 pointer-events-none blur-[120px] bg-gradient-to-b from-primary/30 via-accent/10 to-transparent"></div> <div class="absolute top-1/4 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none blur-[150px] bg-accent/30 rounded-full"></div> <nav class="fixed top-0 z-50 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl"><div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8"><div class="flex h-16 items-center justify-between"><div class="flex items-center gap-3"><div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/10 border border-white/10">`);
    Logo($$renderer2, { size: "20", class: "text-white" });
    $$renderer2.push(`<!----></div> <span class="text-xl font-bold tracking-tight text-white font-outfit">GraDiOl</span></div> <div class="flex items-center gap-3">`);
    Button($$renderer2, {
      variant: "ghost",
      size: "sm",
      href: "/login",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Log in`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      variant: "primary",
      size: "sm",
      href: "/register",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->Sign up`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></div></div></nav> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
  });
}
export {
  _page as default
};
