import React, { useEffect, useRef, useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation, formatCurrency } from '../i18n/auraI18n';
import { X, CreditCard, Check, Sparkles, AlertCircle } from 'lucide-react';
import { PaymentMethodType } from '../types/aura';
import confetti from 'canvas-confetti';

export const BookingDrawer: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    locale,
    currency,
    isBookingDrawerOpen,
    closeBookingDrawer,
    selectedSessionForBooking,
    userPass,
    confirmBooking,
    currentUser,
    simulateStripePayment,
  } = useAuraStore();

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType>(
    userPass.creditsLeft > 0 ? 'PASS_CREDIT' : 'APPLE_PAY'
  );
  const [clientName, setClientName] = useState(currentUser.name || 'Maya Lin');
  const [clientEmail, setClientEmail] = useState(currentUser.email || 'maya@example.com');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  // Sync state when active persona changes
  useEffect(() => {
    setSelectedMethod(userPass.creditsLeft > 0 ? 'PASS_CREDIT' : 'APPLE_PAY');
    setClientName(currentUser.name);
    setClientEmail(currentUser.email);
  }, [userPass.creditsLeft, currentUser]);

  const tCommon = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);
  const tBooking = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'booking', key, params);

  // Sync modal state with <dialog> element
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isBookingDrawerOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setBookingSuccess(false);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isBookingDrawerOpen]);

  // Handle ESC or native dialog close
  const handleClose = () => {
    closeBookingDrawer();
  };

  const handleConfirm = () => {
    if (!selectedSessionForBooking) return;
    setIsSubmitting(true);

    setTimeout(() => {
      const res = confirmBooking(
        selectedSessionForBooking.id,
        selectedMethod,
        clientName,
        clientEmail
      );

      setIsSubmitting(false);

      if (res.success) {
        setBookingSuccess(true);
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#B86B53', '#7D8D7B', '#C5A059'],
        });
        setTimeout(() => {
          handleClose();
        }, 1600);
      }
    }, 600);
  };

  if (!selectedSessionForBooking) return null;

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-xs p-0 m-0 w-full max-w-md mx-auto my-auto fixed inset-x-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 rounded-t-3xl sm:rounded-3xl bg-[#F7F4EE] shadow-2xl border border-stone-200/80 overflow-hidden"
    >
      <div className="p-6 text-stone-900 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Drawer Header matching Screenshot 2 */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-900">
            {tBooking('checkoutTitle')}
          </h2>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-600 hover:bg-stone-300/80 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {bookingSuccess ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <Check className="w-8 h-8 stroke-[2.5]" />
            </div>
            <h3 className="font-serif text-xl font-medium text-stone-900">
              {tBooking('bookingSuccess')}
            </h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              {tBooking('bookingSuccessSub')}
            </p>
          </div>
        ) : (
          <>
            {/* Session Summary Card matching Screenshot 2 */}
            <div className="bg-white rounded-2xl p-4 shadow-2xs border border-stone-200/70 mb-5">
              <h4 className="font-serif text-base font-medium text-stone-900">
                {selectedSessionForBooking.title} - {formatCurrency(selectedSessionForBooking.price, currency, locale)}
              </h4>
              <p className="text-xs text-stone-500 mt-1">
                Fri, Nov 6 • 8:30 AM
              </p>
            </div>

            {/* Payment Method Section matching Screenshot 2 */}
            <div className="mb-5">
              <h3 className="font-serif text-lg font-medium text-stone-800 mb-3">
                {tBooking('paymentMethod')}
              </h3>

              <div className="space-y-3">
                {/* Option 1: Use 1 Class Pass Credit */}
                <button
                  type="button"
                  onClick={() => setSelectedMethod('PASS_CREDIT')}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                    selectedMethod === 'PASS_CREDIT'
                      ? 'bg-[#EFEAE2] border-stone-400 ring-1 ring-stone-400'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-stone-200/60 flex items-center justify-center text-stone-700">
                      <CreditCard className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-stone-900">
                        {tBooking('useClassPass')}
                      </div>
                      <div className="text-xs text-stone-500">
                        {tBooking('remainingCredits', { count: userPass.creditsLeft })}
                      </div>
                    </div>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      selectedMethod === 'PASS_CREDIT'
                        ? 'border-aura-clay bg-aura-clay text-white'
                        : 'border-stone-300 bg-white'
                    }`}
                  >
                    {selectedMethod === 'PASS_CREDIT' && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                </button>

                {/* Option 2: Pay with Credit or Mobile Pay / Apple Pay */}
                <div
                  onClick={() => setSelectedMethod('APPLE_PAY')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedMethod === 'APPLE_PAY' || selectedMethod === 'STRIPE_CARD'
                      ? 'bg-[#EFEAE2] border-stone-400 ring-1 ring-stone-400'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="text-xs font-medium text-stone-600 mb-2.5">
                    {tBooking('payWithCreditOrMobile')}
                  </div>

                  {/* Official Apple Pay Button matching Screenshot 2 */}
                  <button
                    type="button"
                    onClick={() => setSelectedMethod('APPLE_PAY')}
                    className="w-full h-11 rounded-xl bg-black text-white flex items-center justify-center space-x-1.5 hover:bg-neutral-800 transition-colors shadow-xs"
                  >
                    <span className="text-base font-semibold tracking-tighter">Pay</span>
                  </button>

                  <div className="mt-2 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedMethod('STRIPE_CARD')}
                      className="text-[11px] text-stone-500 hover:text-stone-800 underline underline-offset-2"
                    >
                      {tBooking('payCard')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Transparent Fee Ledger matching Screenshot 2 */}
            <div className="bg-[#ECE7DF]/70 rounded-2xl p-4 space-y-2 mb-6 border border-stone-200/50 text-xs">
              <div className="flex items-center justify-between text-stone-700">
                <span>{tBooking('subtotal')}:</span>
                <span className="font-medium text-stone-900">
                  {selectedMethod === 'PASS_CREDIT'
                    ? tBooking('orCredit')
                    : formatCurrency(selectedSessionForBooking.price, currency, locale)}
                </span>
              </div>

              <div className="flex items-center justify-between text-stone-700">
                <span className="flex items-center space-x-1">
                  <span>{tBooking('platformFee')}:</span>
                  <span className="text-[10px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-semibold">
                    0%
                  </span>
                </span>
                <span className="font-semibold text-emerald-800">
                  {tBooking('zeroPercent')}
                </span>
              </div>

              <div className="pt-2 border-t border-stone-300 flex items-center justify-between font-serif text-sm font-semibold text-stone-900">
                <span>{tBooking('total')}:</span>
                <span>
                  {selectedMethod === 'PASS_CREDIT'
                    ? '1 Credit'
                    : formatCurrency(selectedSessionForBooking.price, currency, locale)}
                </span>
              </div>

              {selectedMethod !== 'PASS_CREDIT' && simulateStripePayment && (
                <div className="mt-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-xl flex items-center space-x-1.5 border border-amber-200">
                  <span className="font-semibold">⚡ Dev Sandbox:</span>
                  <span>Stripe test charge will auto-approve ($0 real cost).</span>
                </div>
              )}
            </div>

            {/* Bottom Action Button matching Screenshot 2 */}
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirm}
              className="w-full py-3.5 rounded-2xl bg-[#3E423B] text-white font-medium text-sm hover:bg-stone-800 active:scale-[0.99] transition-all shadow-md flex items-center justify-center space-x-2"
            >
              {isSubmitting ? (
                <span>{tBooking('processingPayment')}</span>
              ) : (
                <span>{tBooking('confirmBooking')}</span>
              )}
            </button>
          </>
        )}
      </div>
    </dialog>
  );
};

