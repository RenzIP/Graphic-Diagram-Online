import { f as attr_style, b as stringify } from "../../../../chunks/index2.js";
import "@sveltejs/kit/internal";
import "../../../../chunks/exports.js";
import "../../../../chunks/utils2.js";
import { e as escape_html } from "../../../../chunks/context.js";
import "clsx";
import "@sveltejs/kit/internal/server";
import "../../../../chunks/state.svelte.js";
import { B as Button } from "../../../../chunks/Button.js";
import { I as Input } from "../../../../chunks/Input.js";
import { b as authApi } from "../../../../chunks/auth.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let loading = false;
    let form = {
      full_name: "",
      email: "",
      password: "",
      confirmPassword: "",
      role: "user"
    };
    let errors = {};
    function signUpWithGoogle() {
      loading = true;
      window.location.href = authApi.getGoogleLoginUrl();
    }
    function signUpWithGitHub() {
      loading = true;
      window.location.href = authApi.getGitHubLoginUrl();
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="w-full"><div class="mb-8"><h2 class="text-3xl font-bold text-white font-outfit tracking-tight">Create an account</h2> <p class="mt-2 text-text-secondary text-sm">Daftarkan akun JWT Anda untuk mulai mengelola workspace</p></div> <form class="space-y-4"><div class="grid grid-cols-1 md:grid-cols-2 gap-4"><div class="md:col-span-2">`);
      Input($$renderer3, {
        label: "Nama Lengkap",
        placeholder: "Masukkan nama lengkap",
        error: errors.full_name,
        get value() {
          return form.full_name;
        },
        set value($$value) {
          form.full_name = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div class="md:col-span-2">`);
      Input($$renderer3, {
        label: "Email Address",
        type: "email",
        placeholder: "nama@email.com",
        error: errors.email,
        get value() {
          return form.email;
        },
        set value($$value) {
          form.email = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div> <div>`);
      Input($$renderer3, {
        label: "Password",
        type: "password",
        placeholder: "Min. 6 karakter",
        error: errors.password,
        get value() {
          return form.password;
        },
        set value($$value) {
          form.password = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----> `);
      if (form.password.length > 0) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="mt-2 flex gap-1 h-1 w-full rounded-full overflow-hidden bg-white/10"><div class="h-full bg-error transition-all"${attr_style(`width: ${stringify(form.password.length > 2 ? "100%" : "0%")}`)}></div> <div class="h-full bg-warning transition-all"${attr_style(`width: ${stringify(form.password.length > 4 ? "100%" : "0%")}`)}></div> <div class="h-full bg-success transition-all"${attr_style(`width: ${stringify(form.password.length >= 6 ? "100%" : "0%")}`)}></div></div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> <div>`);
      Input($$renderer3, {
        label: "Confirm Password",
        type: "password",
        placeholder: "Ulangi password",
        error: errors.confirmPassword,
        get value() {
          return form.confirmPassword;
        },
        set value($$value) {
          form.confirmPassword = $$value;
          $$settled = false;
        }
      });
      $$renderer3.push(`<!----></div></div> <div class="pt-2"><label for="role" class="mb-1.5 block text-sm font-medium text-slate-300">Account Role</label> `);
      $$renderer3.select(
        {
          id: "role",
          value: form.role,
          class: "flex h-11 w-full rounded-xl border border-white/10 bg-surface/50 px-4 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:border-white/20 transition-all duration-300 appearance-none"
        },
        ($$renderer4) => {
          $$renderer4.option({ value: "user", class: "bg-surface text-white" }, ($$renderer5) => {
            $$renderer5.push(`Standard User`);
          });
          $$renderer4.option({ value: "admin", class: "bg-surface text-white" }, ($$renderer5) => {
            $$renderer5.push(`Administrator`);
          });
        }
      );
      $$renderer3.push(` `);
      if (errors.role) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<p class="mt-1 text-xs text-error font-medium">${escape_html(errors.role)}</p>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--></div> `);
      Button($$renderer3, {
        variant: "primary",
        size: "lg",
        class: "w-full mt-6",
        type: "submit",
        disabled: loading,
        children: ($$renderer4) => {
          if (loading) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`Create Account`);
          }
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></form> <div class="relative my-8"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div> <div class="relative flex justify-center"><span class="bg-background px-4 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">Atau daftar dengan</span></div></div> <div class="grid grid-cols-2 gap-4">`);
      Button($$renderer3, {
        variant: "outline",
        class: "w-full justify-center",
        onclick: signUpWithGoogle,
        disabled: loading,
        children: ($$renderer4) => {
          $$renderer4.push(`<svg class="mr-2 h-5 w-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"></path><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path></svg> Google`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----> `);
      Button($$renderer3, {
        variant: "outline",
        class: "w-full justify-center",
        onclick: signUpWithGitHub,
        disabled: loading,
        children: ($$renderer4) => {
          $$renderer4.push(`<svg class="mr-2 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> GitHub`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="text-center text-xs text-text-tertiary mt-8">By signing up, you agree to our <a href="#terms" class="text-primary hover:text-primary-hover transition-colors">Terms of Service</a> and <a href="#privacy" class="text-primary hover:text-primary-hover transition-colors">Privacy Policy</a>.</div> <div class="mt-6 text-center text-sm text-text-secondary">Already have an account? <a href="/login" class="font-medium text-primary hover:text-primary-hover transition-colors">Log in</a></div></div>`);
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
