import React, { useEffect, useRef, useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation } from '../i18n/auraI18n';
import { X, ShieldCheck, Zap, Bell, CheckCircle2 } from 'lucide-react';
import { WaitlistMode } from '../types/aura';

export const WaitlistModal: React.FC = () => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const {
    locale,
    isWaitlistModalOpen,
    closeWaitlistModal,
    selectedWaitlistSession,
    waitlist,
    joinWaitlist,
  } = useAuraStore();

  const [mode, setMode] = useState<WaitlistMode>('VIP_PREAUTH');
  const [name, setName] = useState('Chloe Martin');
  const [email, setEmail] = useState('chloe.martin@example.com');
  const [phone, setPhone] = useState('+1 (555) 762-9012');
  const [submitted, setSubmitted] = useState(false);

  const tCommon = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);
  const tBooking = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'booking', key, params);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isWaitlistModalOpen) {
      if (!dialog.open) {
        dialog.showModal();
        setSubmitted(false);
      }
    } else {
      if (dialog.open) {
        dialog.close();
      }
    }
  }, [isWaitlistModalOpen]);

  if (!selectedWaitlistSession) return null;

  const queuePosition =
    waitlist.filter((w) => w.sessionId === selectedWaitlistSession.id).length + 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    joinWaitlist(selectedWaitlistSession.id, name, email, phone, mode);
    setSubmitted(true);
    setTimeout(() => {
      closeWaitlistModal();
    }, 1500);
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={closeWaitlistModal}
      className="backdrop:bg-black/50 backdrop:backdrop-blur-xs p-0 m-0 w-full max-w-md mx-auto my-auto fixed inset-x-0 bottom-0 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 rounded-t-3xl sm:rounded-3xl bg-[#F7F4EE] shadow-2xl border border-stone-200/80 overflow-hidden"
    >
      <div className="p-6 text-stone-900 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <div>
            <span className="text-[11px] font-semibold text-aura-clay uppercase tracking-wider">
              {tBooking('yourQueuePosition', { pos: queuePosition })}
            </span>
            <h2 className="font-serif text-2xl font-medium tracking-tight text-stone-900 mt-0.5">
              {tBooking('joinWaitlistTitle')}
            </h2>
          </div>
          <button
            onClick={closeWaitlistModal}
            className="w-8 h-8 rounded-full bg-stone-200/60 flex items-center justify-center text-stone-600 hover:bg-stone-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="py-10 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-medium text-stone-900">
              Added to Waitlist!
            </h3>
            <p className="text-xs text-stone-600 max-w-xs mx-auto">
              You are #{queuePosition} in line for {selectedWaitlistSession.title}. We will alert you immediately when a spot opens.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-xs text-stone-600 leading-relaxed">
              {tBooking('joinWaitlistSub')}
            </p>

            {/* Waitlist Mode Selector */}
            <div className="space-y-2.5">
              {/* VIP Option */}
              <div
                onClick={() => setMode('VIP_PREAUTH')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  mode === 'VIP_PREAUTH'
                    ? 'bg-amber-50/80 border-amber-400 ring-1 ring-amber-400'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2 text-amber-900 font-semibold text-sm">
                    <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
                    <span>{tBooking('waitlistModeVip')}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1 pl-6">
                  {tBooking('waitlistModeVipDesc')}
                </p>
              </div>

              {/* Standard Option */}
              <div
                onClick={() => setMode('STANDARD')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  mode === 'STANDARD'
                    ? 'bg-stone-200/70 border-stone-400 ring-1 ring-stone-400'
                    : 'bg-white border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center space-x-2 text-stone-900 font-semibold text-sm">
                  <Bell className="w-4 h-4 text-stone-600" />
                  <span>{tBooking('waitlistModeStandard')}</span>
                </div>
                <p className="text-xs text-stone-600 mt-1 pl-6">
                  {tBooking('waitlistModeStandardDesc')}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="space-y-2.5 pt-2">
              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {tBooking('fullName')}
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-aura-clay"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {tBooking('emailAddress')}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-aura-clay"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-stone-700 mb-1">
                  {tBooking('phoneNumber')}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-aura-clay"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full mt-4 py-3.5 rounded-2xl bg-aura-charcoal text-white font-medium text-sm hover:bg-stone-800 transition-colors shadow-md"
            >
              Confirm Waitlist Entry
            </button>
          </form>
        )}
      </div>
    </dialog>
  );
};

