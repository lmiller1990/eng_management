export const throttle = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) => {
  let isWaiting = false;

  return (...args: T) => {
    if (isWaiting) {
      return;
    }

    callback(...args);
    isWaiting = true;

    setTimeout(() => {
      isWaiting = false;
    }, delay);
  };
};

export function csrfToken(): string {
  const meta = document.querySelector(
    'meta[name="csrf-token"]',
  ) as HTMLMetaElement;
  return meta?.content || "";
}
