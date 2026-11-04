import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { SupportedCurrency, ClassCategory, CURRENCY_CONFIGS } from '../types/aura';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Shield, Calendar, DollarSign, Building } from 'lucide-react';
import { AuraLeafBadge } from './AuraLeafLogo';

const SUGGESTED_CATEGORIES: string[] = [
  'Reformer',
  'Barre',
  'Flow',
  'Mat Pilates',
  'Sound Bath',
  'Yin Yoga',
  'Aerial / Flight',
  '皮拉提',
  '瑜珈',
  '私人教練',
  '頌缽音療',
  '重訓體能',
];

export const OnboardingWizard: React.FC = () => {
  const { createStudioWithOnboarding, locale } = useAuraStore();
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
  const [capacity, setCapacity] = useState<number | string>(8);
  const [price, setPrice] = useState<number | string>(28);
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
    const parsedCapacity = Math.max(1, Number(capacity) || 1);
    const parsedPrice = Math.max(0, Number(price) || 0);

    createStudioWithOnboarding({
      name: studioName,
      slug: studioSlug,
      currency,
      cancelWindowHrs: cancelHours,
      waitlistMins,
      firstClass: {
        title: className.trim() || 'Signature Session',
        category: category.trim() || 'Reformer',
        instructor: instructor.trim() || 'Coach',
        capacity: parsedCapacity,
        price: parsedPrice,
        roomName: roomName.trim() || 'Main Studio',
      },
    });
  };

  return (
    <div className="min-h-screen bg-aura-bg text-aura-charcoal py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2.5">
            <AuraLeafBadge size="sm" />
            <span className="font-serif text-xl font-semibold text-aura-charcoal">
              {locale === 'zh-TW' ? '工作室快速開通精靈' : 'Instructor Onboarding'}
            </span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            {locale === 'zh-TW' ? `步驟 ${step} / 3` : `Step ${step} of 3`}
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
                {locale === 'zh-TW' ? '為您的工作室命名' : 'Name your Studio'}
              </h2>
              <p className="text-xs text-stone-500">
                {locale === 'zh-TW'
                  ? '設定品牌名稱與專屬公開預約網址。'
                  : 'Choose the brand name and the public booking link your students will use.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {locale === 'zh-TW' ? '工作室名稱 (Studio Name)' : 'Studio Name'}
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
                  {locale === 'zh-TW' ? '公開預約專屬網址 (URL Slug)' : 'Public Booking URL Slug'}
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
                  {locale === 'zh-TW' ? '學員預約網址：' : 'Students will book at: '}
                  <span className="font-mono text-aura-clay font-medium">/s/{studioSlug}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {locale === 'zh-TW' ? '品牌標語 / 工作室簡介' : 'Tagline / Studio Philosophy'}
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
                <span>{locale === 'zh-TW' ? '下一步：設定幣別與規則' : 'Continue to Step 2'}</span>
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
                {locale === 'zh-TW' ? '收款幣別與預約規則' : 'Currency & Studio Rules'}
              </h2>
              <p className="text-xs text-stone-500">
                {locale === 'zh-TW'
                  ? '選擇工作室結帳幣別與自動候補遞補時限。'
                  : 'Configure payout currency and automated waitlist waterfall timers.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {locale === 'zh-TW' ? '工作室結帳幣別' : 'Studio Billing Currency'}
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
                  <span>{locale === 'zh-TW' ? '免費取消截止時限' : 'Free Cancellation Cutoff'}</span>
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
                  {locale === 'zh-TW'
                    ? '於開課前超過此時數取消將自動全額退還點數。'
                    : 'Cancellations before this window automatically refund class passes.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>{locale === 'zh-TW' ? '候補保留時限' : 'Waitlist Offer Expiry Window'}</span>
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
                  {locale === 'zh-TW'
                    ? '名額釋出時，第一順位候補學員保留確認之分鐘數。'
                    : 'When a spot opens, #1 in line has this window to claim before it rolls to #2.'}
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
                <span>{locale === 'zh-TW' ? '上一步' : 'Back'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-aura-clay text-white text-xs font-semibold shadow-md hover:bg-[#A25A44] transition-all"
              >
                <span>{locale === 'zh-TW' ? '下一步：建立第一堂課' : 'Continue to Step 3'}</span>
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
                {locale === 'zh-TW' ? '建立您的第一堂課程' : 'Create Your First Class'}
              </h2>
              <p className="text-xs text-stone-500">
                {locale === 'zh-TW'
                  ? '設定招牌課程以啟動您的公開預約課表（支援任意自訂分類與金額）。'
                  : 'Set up a signature session to launch your public schedule.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {locale === 'zh-TW' ? '課程名稱 (Class Title)' : 'Class Title'}
                </label>
                <input
                  type="text"
                  required
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. Flight Class, Morning Reformer Sculpt"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                />
              </div>

              {/* Manual Category Entry + Quick Pick Tags */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {locale === 'zh-TW'
                    ? '課程分類 (Category — 可直接輸入任意自訂分類或點擊下方標籤)'
                    : 'Category (Type any custom category or select below)'}
                </label>
                <input
                  type="text"
                  required
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder={
                    locale === 'zh-TW'
                      ? '直接輸入任意分類，例如：空中瑜珈、Flight、器械皮拉提、1對1私教...'
                      : 'Type any custom category (e.g. Flight, Aerial, Reformer, Barre, 1-on-1 PT)...'
                  }
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                />
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-stone-400 mr-1">
                    {locale === 'zh-TW' ? '快速選擇：' : 'Quick select:'}
                  </span>
                  {SUGGESTED_CATEGORIES.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setCategory(tag)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full border transition-all ${
                        category === tag
                          ? 'bg-aura-clay text-white font-semibold border-aura-clay shadow-2xs'
                          : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {locale === 'zh-TW' ? '授課教練 (Instructor)' : 'Instructor'}
                  </label>
                  <input
                    type="text"
                    required
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="e.g. Jordan B"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {locale === 'zh-TW' ? '教室 / 場地 (Room)' : 'Studio Room'}
                  </label>
                  <input
                    type="text"
                    required
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="e.g. Studio A"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {locale === 'zh-TW' ? '人數上限 (Capacity Cap)' : 'Capacity Cap (Hard Limit)'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="e.g. 4"
                    className="w-full px-3.5 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    {locale === 'zh-TW' ? `單堂體驗價 (${currency})` : `Drop-In Price (${currency})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 1599"
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
                <span>{locale === 'zh-TW' ? '上一步' : 'Back'}</span>
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-7 py-3 rounded-full bg-emerald-800 text-white text-xs font-semibold shadow-md hover:bg-emerald-900 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{locale === 'zh-TW' ? '啟動工作室並進入管理後台' : 'Launch Studio & Enter Admin'}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
