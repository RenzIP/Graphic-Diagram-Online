import { s as store_get, u as unsubscribe_stores } from "../../../../chunks/index2.js";
import { g as goto } from "../../../../chunks/client.js";
import { B as Button } from "../../../../chunks/Button.js";
import { I as Input } from "../../../../chunks/Input.js";
import { p as page } from "../../../../chunks/stores.js";
import { a as applyAuthSession, b as authApi } from "../../../../chunks/auth.js";
import { s as showToast } from "../../../../chunks/toast.js";
import { e as escape_html } from "../../../../chunks/context.js";
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let loading = false;
    let error = "";
    let form = { email: "", password: "" };
    let errors = {};
    let redirectTo = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("redirect") || "/dashboard";
    let oauthError = store_get($$store_subs ??= {}, "$page", page).url.searchParams.get("error");
    function signInWithGoogle() {
      if (typeof window !== "undefined") localStorage.removeItem("use_mock_api");
      loading = true;
      error = "";
      window.location.href = authApi.getGoogleLoginUrl();
    }
    function signInWithGitHub() {
      if (typeof window !== "undefined") localStorage.removeItem("use_mock_api");
      loading = true;
      error = "";
      window.location.href = authApi.getGitHubLoginUrl();
    }
    async function handleDemoMode() {
      loading = true;
      try {
        if (typeof window !== "undefined") {
          localStorage.setItem("use_mock_api", "true");
          const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItMTIzIiwibmFtZSI6IkRlbW8gVXNlciIsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiJ9.mocksignature";
          localStorage.setItem("auth_token", token);
          const secure = window.location.protocol === "https:" ? "; Secure" : "";
          document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax${secure}`;
        }
        applyAuthSession({
          token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJtb2NrLXVzZXItMTIzIiwibmFtZSI6IkRlbW8gVXNlciIsImVtYWlsIjoiZGVtb0BleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiJ9.mocksignature",
          user: {
            id: "mock-user-123",
            email: "demo@example.com",
            full_name: "Demo User",
            avatar_url: null
          }
        });
        showToast("Masuk menggunakan Mode Demo (Tanpa Backend).", "success");
        await goto(redirectTo);
      } catch (err) {
        showToast("Gagal masuk ke mode demo.", "error");
      } finally {
        loading = false;
      }
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      $$renderer3.push(`<div class="w-full"><div class="mb-8"><h2 class="text-3xl font-bold text-white font-outfit tracking-tight">Welcome back</h2> <p class="mt-2 text-text-secondary text-sm">Login dengan JWT API untuk mengakses workspace Anda</p></div> `);
      if (oauthError || error) {
        $$renderer3.push("<!--[-->");
        $$renderer3.push(`<div class="mb-6 rounded-xl border border-error/20 bg-error/10 px-4 py-3 text-sm text-red-400 flex items-center gap-3"><svg class="h-5 w-5 text-error flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ${escape_html(oauthError || error)}</div>`);
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]--> <form class="space-y-5">`);
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
      $$renderer3.push(`<!----> `);
      Input($$renderer3, {
        label: "Password",
        type: "password",
        placeholder: "Minimal 6 karakter",
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
      Button($$renderer3, {
        variant: "primary",
        size: "lg",
        class: "w-full mt-2",
        type: "submit",
        disabled: loading,
        children: ($$renderer4) => {
          if (loading) {
            $$renderer4.push("<!--[-->");
            $$renderer4.push(`<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Memproses...`);
          } else {
            $$renderer4.push("<!--[!-->");
            $$renderer4.push(`Sign In`);
          }
          $$renderer4.push(`<!--]-->`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></form> <div class="mt-4">`);
      Button($$renderer3, {
        variant: "outline",
        class: "w-full border-success/30 bg-success/5 text-success hover:bg-success/10",
        onclick: handleDemoMode,
        disabled: loading,
        children: ($$renderer4) => {
          $$renderer4.push(`<!---->Coba Mode Demo (Tanpa Backend)`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="relative my-8"><div class="absolute inset-0 flex items-center"><div class="w-full border-t border-white/10"></div></div> <div class="relative flex justify-center"><span class="bg-background px-4 text-xs font-medium uppercase tracking-[0.2em] text-text-tertiary">Atau lanjutkan dengan</span></div></div> <div class="grid grid-cols-2 gap-4">`);
      Button($$renderer3, {
        variant: "outline",
        class: "w-full justify-center",
        onclick: signInWithGoogle,
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
        onclick: signInWithGitHub,
        disabled: loading,
        children: ($$renderer4) => {
          $$renderer4.push(`<svg class="mr-2 h-5 w-5 text-white" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> GitHub`);
        },
        $$slots: { default: true }
      });
      $$renderer3.push(`<!----></div> <div class="mt-8 text-center text-sm text-text-secondary">Don't have an account? <a href="/register" class="font-medium text-primary hover:text-primary-hover transition-colors">Sign up</a></div></div>`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    if ($$store_subs) unsubscribe_stores($$store_subs);
  });
}
export {
  _page as default
};
