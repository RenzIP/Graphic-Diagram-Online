import { redirect } from "@sveltejs/kit";
const PUBLIC_ROUTES = ["/", "/login", "/register", "/auth/callback", "/demo"];
const handle = async ({ event, resolve }) => {
  const { pathname } = event.url;
  const isPublic = PUBLIC_ROUTES.some((route) => pathname === route) || pathname.startsWith("/_app") || pathname.startsWith("/api");
  if (!isPublic) {
    const token = event.cookies.get("auth_token");
    if (!token) {
      throw redirect(303, `/login?redirect=${encodeURIComponent(pathname)}`);
    }
    event.locals.accessToken = token;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      event.locals.userId = payload.sub;
    } catch {
      event.cookies.delete("auth_token", { path: "/" });
      throw redirect(303, "/login");
    }
  }
  return resolve(event);
};
export {
  handle
};
