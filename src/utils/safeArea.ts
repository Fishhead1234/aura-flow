/**
 * Safe-Area Inset Helper for Android Standalone / TWA / Capacitor Native
 * Resolves zero-value env(safe-area-inset-top) and env(safe-area-inset-bottom)
 * when running edge-to-edge on Android devices.
 */

export function checkIsStandaloneAndroid(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;

  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: fullscreen)').matches ||
    Boolean((window.navigator as any).standalone) ||
    Boolean((window as any).Capacitor?.isNativePlatform?.());

  const isAndroid = /Android/i.test(navigator.userAgent);
  return isStandalone && isAndroid;
}

export const isStandaloneAndroid: boolean =
  typeof window !== 'undefined' ? checkIsStandaloneAndroid() : false;

/**
 * Top header safe padding:
 * Guaranteed 38px minimum on Android Standalone/TWA to clear status bar icons (clock/battery).
 */
export const safeAreaTop = isStandaloneAndroid
  ? 'max(env(safe-area-inset-top, 0px), 38px)'
  : 'env(safe-area-inset-top, 0px)';

/**
 * Bottom navigation safe padding:
 * Guaranteed 20px minimum on Android Standalone/TWA to clear system gesture bar.
 */
export const safeAreaBottom = isStandaloneAndroid
  ? 'max(env(safe-area-inset-bottom, 0px), 20px)'
  : 'env(safe-area-inset-bottom, 0px)';

/**
 * Modal & Drawer top clearance:
 * Minimum top clearance for fixed inset-0 modal backdrops.
 */
export const modalTopClearance = isStandaloneAndroid
  ? 'calc(max(env(safe-area-inset-top, 0px), 38px) + 12px)'
  : 'calc(env(safe-area-inset-top, 0px) + 12px)';

