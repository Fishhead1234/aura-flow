import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { useSubscription } from '../hooks/useSubscription';
import { AuraLogoBadge } from './AuraLeafLogo';
import { calculateEarlyBirdTier } from '../services/backupTransferService';
import { modalTopClearance } from '../utils/safeArea';
import {
  Check,
  Sparkles,
  ShieldCheck,
  X,
  Crown,
  Zap,
  Globe,
  MessageSquare,
  CreditCard,
  Flame,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';

export const PaywallModal: React.FC = () => {
  const { locale, currency, studio } = useAuraStore();
  const {
    isPaywallModalOpen,
    paywallTriggerReason,
    closePaywall,
    startFreeTrial,
    restorePurchases,
  } = useSubscription();

  const [selectedPlan, setSelectedPlan] = useState<'MONTHLY' | 'ANNUAL'>('MONTHLY');
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isPaywallModalOpen) return null;

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';
  const isTwd = currency === 'TWD';

  // Early-Bird Decaying Calculation
  const earlyBird = calculateEarlyBirdTier(studio, currency);
  const hasEarlyBird = earlyBird.tier > 0;

  const monthlyOriginalDisplay = isTwd || isZh ? 'NT$ 690 / 月' : 'US$ 29.00 / mo';
  const annualOriginalDisplay = isTwd || isZh ? 'NT$ 550 / 月 (年繳 NT$ 6,600)' : 'US$ 23.00 / mo (billed annually)';

  const handleActivateWithOffer = (type: 'EARLY_BIRD' | 'TRIAL') => {
    setIsProcessing(true);
    setTimeout(() => {
      startFreeTrial();
      setIsProcessing(false);
      confetti({
        particleCount: 80,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#C5A059', '#10B981', '#F5F2EB', '#F59E0B'],
      });
    }, 650);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{ paddingTop: modalTopClearance }}
    >
      <div className="relative w-full max-w-lg rounded-3xl bg-[#1C1917] text-[#F5F2EB] border border-[#C5A059]/50 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={closePaywall}
          aria-label="Close Paywall"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#2A241E] hover:bg-[#3A322A] flex items-center justify-center text-[#A89F91] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-[#C5A059]/40 text-xs font-semibold text-[#C5A059]">
            <Crown className="w-3.5 h-3.5" />
            <span>
              {isZh
                ? 'RevenueCat Pro 認證 • 30 天全功能免費試用'
                : 'RevenueCat Pro • 30-Day Free Trial'}
            </span>
          </div>

          {hasEarlyBird && (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-linear-to-r from-red-500/20 to-amber-500/20 border border-amber-400/50 text-xs font-bold text-amber-300 animate-pulse">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span>{isZh ? earlyBird.badgeZh : earlyBird.badgeEn}</span>
            </div>
          )}
        </div>

        {/* Context Headline */}
        <div className="flex items-center space-x-3 mb-3">
          <AuraLogoBadge size="md" className="w-12 h-12 shrink-0" />
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#F5F2EB]">
              {paywallTriggerReason === 'SHARE_LINK'
                ? isZh
                  ? '開通專屬公開預約連結，立即開始接單'
                  : 'Unlock Your Live Booking Link & Start Accepting Clients'
                : isZh
                ? '發布您的課表，正式開放學員線上預約'
                : 'Publish Your Studio Schedule & Go Live'}
            </h2>
            <p className="text-xs text-[#A89F91] mt-0.5">
              {isZh
                ? `${studio.name || '您的工作室'} 課表已準備就緒！試用期間享 0% 平台抽成與無限預約名額。`
                : `${studio.name || 'Your studio'} is ready! Enjoy 0% platform commission & unlimited bookings.`}
            </p>
          </div>
        </div>

        {/* Early-Bird Decaying Discount Callout Banner */}
        {hasEarlyBird && (
          <div className="my-4 p-4 rounded-2xl bg-gradient-to-r from-[#2B1D12] via-[#241A14] to-[#1F1712] border border-[#C5A059]/50 shadow-md">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center space-x-2 text-xs font-bold text-[#E6C687]">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{isZh ? '早鳥加速轉換特惠 (Early-Bird Incentive)' : 'Early-Bird Incentive'}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold border border-amber-400/30">
                {isZh ? `倒數 ${earlyBird.daysLeft} 天` : `${earlyBird.daysLeft} Days Left`}
              </span>
            </div>
            <p className="text-xs font-semibold text-[#F5F2EB]">
              {isZh ? earlyBird.headlineZh : earlyBird.headlineEn}
            </p>
            <p className="text-[11px] text-[#A89F91] mt-1">
              {isZh
                ? `於試用期內提前開通，即可鎖定首 ${earlyBird.discountMonths} 個月半價；若選擇年繳方案，折抵金（NT$ ${earlyBird.annualCreditAmount}）將直接於首年扣除！`
                : `Activate during trial to lock in 50% off for ${earlyBird.discountMonths} months or get equivalent credit on Annual.`}
            </p>
          </div>
        )}

        {/* Pro Benefits List */}
        <div className="my-4 p-4 rounded-2xl bg-[#24201C] border border-[#362F28] space-y-2.5 text-xs">
          <div className="flex items-start space-x-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#F5F2EB]">
                {isZh ? '專屬獨立預約網站 (/studio/' + studio.slug + ')' : `Private Branded Booking URL (/studio/${studio.slug})`}
              </span>
              <p className="text-[11px] text-[#8C8274]">
                {isZh
                  ? '純淨無廣告、絕不顯示其他競爭教室，打造高質感專屬門面。'
                  : '100% private and ad-free. Never shows competitor studios on your direct link.'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#F5F2EB]">
                {isZh ? '0% 平台交易抽成 • 全多元金流直連' : '0% Platform Commission • Direct Instant Payouts'}
              </span>
              <p className="text-[11px] text-[#8C8274]">
                {isZh
                  ? '支援 Apple Pay、信用卡、LINE Pay、街口支付與銀行轉帳末五碼對帳。'
                  : 'Accept Apple Pay, Stripe Cards, LINE Pay, JKOPAY, and Bank Transfers directly.'}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-2.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-[#F5F2EB]">
                {isZh ? '自動候補遞補瀑布流 + LINE 官方帳號雙向通知' : 'Automated Waitlist Waterfall & LINE OA Broadcasts'}
              </span>
              <p className="text-[11px] text-[#8C8274]">
                {isZh
                  ? '名額釋出自動通知候補第 1 順位，並開啟城市「探索精選課程」免費曝光。'
                  : 'Instant waitlist spot offers + opt-in placement on the public Explore Studios directory.'}
              </p>
            </div>
          </div>
        </div>

        {/* Plan Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {/* Monthly Plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan('MONTHLY')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedPlan === 'MONTHLY'
                ? 'bg-[#2E271F] border-[#C5A059] ring-1 ring-[#C5A059]'
                : 'bg-[#221E1A] border-[#352E26] hover:border-[#4A4035]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#EAD8B1]">
                {isZh ? '月度彈性方案' : 'Monthly Pro'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 font-semibold">
                {isZh ? '首 30 天免費' : '30 Days Free'}
              </span>
            </div>

            {hasEarlyBird ? (
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-serif text-lg font-bold text-[#C5A059]">
                    {isTwd ? `NT$ ${earlyBird.monthlyDiscountedPrice}` : `$${earlyBird.monthlyDiscountedPrice}`}
                  </span>
                  <span className="text-xs text-[#8C8274] line-through font-normal">
                    {isTwd ? 'NT$ 690' : '$29'}
                  </span>
                  <span className="text-xs text-[#A89F91]">/ 月</span>
                </div>
                <div className="text-[10px] text-amber-300 font-medium mt-0.5">
                  {isZh
                    ? `提早開通享前 ${earlyBird.discountMonths} 個月半價`
                    : `50% off for first ${earlyBird.discountMonths} months`}
                </div>
              </div>
            ) : (
              <div>
                <div className="font-serif text-lg font-bold text-[#F5F2EB]">{monthlyOriginalDisplay}</div>
                <div className="text-[10px] text-[#8C8274] mt-0.5">
                  {isZh ? '隨時可於後台一鍵取消，無綁約' : 'Cancel anytime • Zero lock-in'}
                </div>
              </div>
            )}
          </button>

          {/* Annual Plan */}
          <button
            type="button"
            onClick={() => setSelectedPlan('ANNUAL')}
            className={`p-4 rounded-2xl border text-left transition-all ${
              selectedPlan === 'ANNUAL'
                ? 'bg-[#2E271F] border-[#C5A059] ring-1 ring-[#C5A059]'
                : 'bg-[#221E1A] border-[#352E26] hover:border-[#4A4035]'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-[#EAD8B1]">
                {isZh ? '年度創始館長方案' : 'Annual Founder'}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                {hasEarlyBird
                  ? isZh
                    ? `現折 NT$ ${earlyBird.annualCreditAmount}`
                    : `Save $${earlyBird.annualCreditAmount}`
                  : isZh
                  ? '省下 20%'
                  : 'Save 20%'}
              </span>
            </div>

            {hasEarlyBird ? (
              <div>
                <div className="flex items-baseline space-x-1.5">
                  <span className="font-serif text-lg font-bold text-emerald-400">
                    {isTwd ? `NT$ ${earlyBird.annualFinalPrice.toLocaleString()}` : `$${earlyBird.annualFinalPrice}`}
                  </span>
                  <span className="text-xs text-[#8C8274] line-through font-normal">
                    {isTwd ? 'NT$ 6,600' : '$276'}
                  </span>
                  <span className="text-xs text-[#A89F91]">/ 年</span>
                </div>
                <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
                  {isZh
                    ? `早鳥折抵 NT$ ${earlyBird.annualCreditAmount} (月均只要 NT$ ${Math.round(earlyBird.annualFinalPrice / 12)})`
                    : `Credit applied ($${(earlyBird.annualFinalPrice / 12).toFixed(1)}/mo)`}
                </div>
              </div>
            ) : (
              <div>
                <div className="font-serif text-lg font-bold text-[#F5F2EB]">{annualOriginalDisplay}</div>
                <div className="text-[10px] text-[#8C8274] mt-0.5">
                  {isZh ? '含首 30 天免費試用 + 優先客服' : 'Includes 30-day free trial + priority support'}
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Dual Actions: Early Bird vs Standard Trial */}
        <div className="space-y-2.5">
          {hasEarlyBird ? (
            <>
              {/* Early-Bird Fast-Track Button */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleActivateWithOffer('EARLY_BIRD')}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#C5A059] to-[#E6C687] hover:from-[#D4AF37] hover:to-[#F3D79B] text-[#161412] font-bold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all active:scale-[0.99]"
              >
                <Flame className="w-4 h-4 text-[#161412] fill-[#161412]" />
                <span>
                  {isProcessing
                    ? isZh
                      ? '正在鎖定早鳥優惠中...'
                      : 'Locking in early-bird promo...'
                    : selectedPlan === 'ANNUAL'
                    ? isZh
                      ? `🔥 立即啟用年繳並現折 NT$ ${earlyBird.annualCreditAmount} (只要 NT$ ${earlyBird.annualFinalPrice.toLocaleString()})`
                      : `🔥 Activate Annual with $${earlyBird.annualCreditAmount} Off ($${earlyBird.annualFinalPrice}/yr)`
                    : isZh
                    ? `🔥 立即啟用並鎖定首 ${earlyBird.discountMonths} 個月半價 (現省 NT$ ${earlyBird.annualCreditAmount})`
                    : `🔥 Activate & Lock In 50% Off First ${earlyBird.discountMonths} Mo`}
                </span>
              </button>

              {/* Standard 30-day Free Trial Option */}
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleActivateWithOffer('TRIAL')}
                className="w-full py-2.5 px-4 rounded-xl bg-[#241F1A] hover:bg-[#2F2720] border border-[#453A2D] text-xs font-medium text-[#C8BFB2] flex items-center justify-center space-x-1.5 transition-all"
              >
                <span>
                  {isZh
                    ? '先免費試用 30 天 ($0 今日扣款，30 天後依標準費率計費)'
                    : 'Continue 30-Day Free Trial ($0 Today, standard rate applies after)'}
                </span>
              </button>
            </>
          ) : (
            <button
              type="button"
              disabled={isProcessing}
              onClick={() => handleActivateWithOffer('TRIAL')}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] font-semibold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all active:scale-[0.99]"
            >
              <Sparkles className="w-4 h-4" />
              <span>
                {isProcessing
                  ? isZh
                    ? '正在透過 RevenueCat 開通試用...'
                    : 'Activating 30-Day Free Trial...'
                  : isZh
                  ? '免費展開 30 天試用並發布課表 (NT$ 0 今日扣款)'
                  : 'Start 30-Day Free Trial & Publish Schedule ($0 Today)'}
              </span>
            </button>
          )}
        </div>

        {/* Restore & Footer */}
        <div className="mt-4 flex items-center justify-between text-[11px] text-[#8C8274]">
          <button
            type="button"
            onClick={restorePurchases}
            className="underline hover:text-[#E0D8CE] transition-colors"
          >
            {isZh ? '恢復購買紀錄 (Restore Purchases)' : 'Restore Purchases'}
          </button>
          <span>
            {isZh ? '由 RevenueCat & Stripe 安全加密處理' : 'Secured by RevenueCat & Stripe'}
          </span>
        </div>
      </div>
    </div>
  );
};
