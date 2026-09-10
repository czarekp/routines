// Warms the browser's module cache for the other route chunks once the home
// view has painted, so the later lazy() import in router.tsx resolves
// instantly instead of costing a network+parse round trip on first tap.
// Scheduled via requestIdleCallback (falling back to setTimeout — Safari has
// no requestIdleCallback) so it never competes with the home view's own paint.
export function prefetchRouteChunks(): () => void {
  const prefetch = () => {
    void import("@/views/new/new-routine-view");
    void import("@/views/routine/routine-view");
    void import("@/views/routine-edit/routine-edit-view");
  };

  if (typeof requestIdleCallback === "function") {
    const id = requestIdleCallback(prefetch);
    return () => cancelIdleCallback(id);
  }
  const id = setTimeout(prefetch, 1);
  return () => clearTimeout(id);
}
