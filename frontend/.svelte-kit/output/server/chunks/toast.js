function showToast(message, type = "info") {
  if (typeof window === "undefined") return;
  window.__gradiol_toast?.(message, type);
}
export {
  showToast as s
};
