import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { SupportedCurrency, ClassCategory, CURRENCY_CONFIGS } from '../types/aura';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Shield, Calendar, DollarSign, Building } from 'lucide-react';

export const OnboardingWizard: React.FC = () => {
  const { createStudioWithOnboarding, navigateTo } = useAuraStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [studioName, setStudioName] = useState('Sol Sanctuary');
  const [studioSlug, setStudioSlug] = useState('sol-sanctuary');
  const [tagline, setTagline] = useState('Mindful Reformer & Dynamic Movement Sanctuary');

  const [currency, setCurrency] = useState<SupportedCurrency>('USD');
  const [cancelHours, setCancelHours] = useState(12);
  const [waitlistMins, setWaitlistMins] = useState(30);

  const [className, setClassName] = useState('Morning Reformer Sculpt');
  const [category, setCategory] = useState<ClassCategory>('Reformer');
  const [capacity, setCapacity] = useState(8);
  const [price, setPrice] = useState(28);
  const [instructor, setInstructor] = useState('Lena S.');
  const [roomName, setRoomName] = useState('Reformer Studio A');

  const handleNameChange = (val: string) => {
    setStudioName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStudioSlug(slug || 'studio');
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    createStudioWithOnboarding({
      name: studioName,
      slug: studioSlug,
      currency,
      cancelWindowHrs: cancelHours,
      waitlistMins,
      firstClass: {
        title: className,
        category,
        instructor,
        capacity: Number(capacity),
        price: Number(price),
        roomName,
      },
    });
  };

  return (
    <div className="min-h-screen bg-aura-bg text-aura-charcoal py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">✨</span>
            <span className="font-serif text-xl font-semibold text-aura-charcoal">
              Instructor Onboarding
            </span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            Step {step} of 3
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-stone-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-aura-clay transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* STEP 1: STUDIO NAME & SLUG */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 mb-1">
                Name your Studio
              </h2>
              <p className="text-xs text-stone-500">
                Choose the brand name and the public booking link your students will use.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Studio Name
                </label>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sol Sanctuary"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Public Booking URL Slug
                </label>
                <div className="flex items-center rounded-2xl bg-stone-50 border border-stone-300 px-3.5 py-2.5 text-xs text-stone-500 focus-within:ring-2 focus-within:ring-aura-clay">
                  <span className="text-stone-400 select-none">/s/</span>
                  <input
                    type="text"
                    required
                    value={studioSlug}
                    onChange={(e) => setStudioSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    className="w-full bg-transparent text-stone-900 font-mono text-xs focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  Students will book at: <span className="font-mono text-aura-clay font-medium">/s/{studioSlug}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Tagline / Studio Philosophy
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Boutique Reformer & Movement Sanctuary"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!studioName.trim() || !studioSlug.trim()}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-aura-clay text-white text-xs font-semibold shadow-md hover:bg-[#A25A44] transition-all disabled:opacity-50"
              >
                <span>Continue to Step 2</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CURRENCY & BOOKING POLICIES */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 mb-1">
                Currency & Studio Rules
              </h2>
              <p className="text-xs text-stone-500">
                Configure payout currency and automated waitlist waterfall timers.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Studio Billing Currency
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['USD', 'TWD', 'HKD', 'JPY', 'SGD'] as SupportedCurrency[]).map((curr) => {
                    const conf = CURRENCY_CONFIGS[curr];
                    const isSelected = currency === curr;
                    return (
                      <button
                        type="button"
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-aura-clay text-white border-aura-clay font-semibold shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span>{conf.flag}</span>
                          <span>{curr}</span>
                        </div>
                        <span className="font-mono">{conf.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Free Cancellation Cutoff</span>
                  <span className="font-mono text-aura-clay">{cancelHours} Hours before start</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="48"
                  step="2"
                  value={cancelHours}
                  onChange={(e) => setCancelHours(Number(e.target.value))}
                  className="w-full accent-aura-clay"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  Cancellations before this window automatically refund class passes.
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>Waitlist Offer Expiry Window</span>
                  <span className="font-mono text-aura-clay">{waitlistMins} Minutes</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={waitlistMins}
                  onChange={(e) => setWaitlistMins(Number(e.target.value))}
                  className="w-full accent-aura-clay"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  When a spot opens, #1 in line has 30 mins to claim before it rolls to #2.
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                <span>$29.00/mo flat subscription. 0% platform transaction commissions.</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-aura-clay text-white text-xs font-semibold shadow-md hover:bg-[#A25A44] transition-all"
              >
                <span>Continue to Step 3</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CREATE FIRST CLASS */}
        {step === 3 && (
          <form onSubmit={handleFinish} className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 mb-1">
                Create Your First Class
              </h2>
              <p className="text-xs text-stone-500">
                Set up a signature session to launch your public schedule.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Class Title
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Morning Reformer Sculpt"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ClassCategory)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                  >
                    <option value="Reformer">Reformer</option>
                    <option value="Flow">Flow</option>
                    <option value="Sound Bath">Sound Bath</option>
                    <option value="Yin Yoga">Yin Yoga</option>
                    <option value="Mat Pilates">Mat Pilates</option>
                    <option value="Barre">Barre</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Instructor
                  </label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Capacity Cap (Hard Limit)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Drop-In Price ({currency})
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="500"
                    required
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-7 py-3 rounded-full bg-emerald-800 text-white text-xs font-semibold shadow-md hover:bg-emerald-900 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Launch Studio & Enter Admin</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
