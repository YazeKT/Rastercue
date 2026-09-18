/** Coalesce visual percentages only; diagnostics/completion retain order.
 * Native stdout/stderr and engine handlers are not filtered or changed.
 */
export function progressDelivery(callback: (event: undefined, data: unknown) => void, coalesce: boolean) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let pending: unknown;
  const flush = () => {
    if (timer) clearTimeout(timer);
    timer = undefined;
    if (pending !== undefined) { const value = pending; pending = undefined; callback(undefined, value); }
  };
  return {
    receive: (_event: unknown, data: unknown) => {
      if (coalesce && typeof data === 'string' && /^\s*(?:\d+(?:\.\d+)?%\s*)+$/.test(data)) {
        const values = data.match(/\d+(?:\.\d+)?%/g)!;
        pending = values[values.length - 1];
        if (!timer) timer = setTimeout(flush, 100);
      } else { flush(); callback(undefined, data); }
    },
    cancel: () => { if (timer) clearTimeout(timer); timer = undefined; pending = undefined; },
  };
}
