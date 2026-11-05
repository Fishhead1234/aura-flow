import { useAuraStore } from '../store/auraStore';

/**
 * Value-First Subscription & RevenueCat Entitlement Hook
 * Inspects whether the active instructor/studio has an active Pro subscription (`isPro`),
 * and exposes helpers to trigger the RevenueCat 14-day free trial paywall or activate Pro.
 */
export function useSubscription() {
  const {
    studio,
    activePersona,
    isPaywallModalOpen,
    paywallTriggerReason,
    openPaywallModal,
    closePaywallModal,
    activateProSubscription,
  } = useAuraStore();

  // Elena Rostova (existing Pro studio owner) is Pro by default unless overridden
  const isPro = Boolean(
    studio.isPro ?? (activePersona === 'elena_owner')
  );

  return {
    isPro,
    isLive: Boolean(studio.isLive ?? isPro),
    isPaywallModalOpen,
    paywallTriggerReason,
    openPaywall: openPaywallModal,
    closePaywall: closePaywallModal,
    startFreeTrial: activateProSubscription,
    restorePurchases: activateProSubscription,
  };
}
