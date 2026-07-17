let goKeyHandled = false;

export function markGoKeyHandled() {
  goKeyHandled = true;
  queueMicrotask(() => { goKeyHandled = false; });
}

export function isGoKeyHandled(): boolean {
  return goKeyHandled;
}
