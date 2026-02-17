/**
 * Throttle a function to run at most once per `wait` ms.
 * Uses trailing edge (fires after quiet period).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => void>(
  fn: T,
  wait: number,
): T {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let lastArgs: any[] | null = null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const throttled = (...args: any[]) => {
    lastArgs = args;
    if (timeoutId === null) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        if (lastArgs) {
          fn(...lastArgs);
          lastArgs = null;
        }
      }, wait);
    }
  };

  return throttled as T;
}
