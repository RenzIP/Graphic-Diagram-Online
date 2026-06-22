import { redirect } from "@sveltejs/kit";
function load() {
  throw redirect(307, "/editor/demo");
}
export {
  load
};
