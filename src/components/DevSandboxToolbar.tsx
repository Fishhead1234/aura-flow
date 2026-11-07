import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { PersonaType } from '../types/aura';
import {
  Wrench,
  UserCheck,
  RotateCcw,
  ChevronUp,
  CreditCard,
  RefreshCw,
} from 'lucide-react';

export const DevSandboxToolbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  const {
    locale,
    activePersona,
    switchPersona,
    simulateStripePayment,
    setSimulateStripePayment,
    resetDatabaseToSeedState,
    resetToCleanGuestState,
    resetAsNewCoach,
    setDevSandboxVisible,
    currentRoute,
    currentUser,
  } = useAuraStore();

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const handleSeedReset = () => {
    resetDatabaseToSeedState();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2000);
  };

  const handleCleanReset = () => {
    resetToCleanGuestState();
    setIsExpanded(false);
  };

  const quickRolePills: {
    id: PersonaType;
    labelZh: string;
    labelEn: string;
  }[] = [
    {
      id: 'new_student',
      labelZh: '👤 新學員 (New Student)',
      labelEn: '👤 New Student',
    },
    {
      id: 'new_owner',
      labelZh: '🧘 新教練 (Unonboarded Instructor)',
      labelEn: '🧘 Unonboarded Instructor',
    },
    {
      id: 'elena_owner',
      labelZh: '👑 現有教練 (Elena Rostova - Pro)',
      labelEn: '👑 Elena Rostova - Pro',
    },
  ];

  const personas: {
    id: PersonaType;
    label: string;
    roleDesc: string;
    targetRoute: string;
  }[] = [
    {
      id: 'elena_owner',
      label: isZh ? '👑 現有教練 (Elena Rostova - Pro)' : 'Elena Rostova - Studio Owner (Pro)',
      roleDesc: isZh
        ? '進入 /admin 完整管理後台（含課表、撥款與 LINE 訊息收件匣）'
        : 'Navigates to /admin to test schedule management & Stripe payouts',
      targetRoute: '/admin',
    },
    {
      id: 'maya_student',
      label: isZh ? '🎫 既有學員 Maya Lin (剩餘 2 堂課包點數)' : 'Maya Lin - Enrolled Student (2 Passes)',
      roleDesc: isZh
        ? '進入 /studio/sol-sanctuary 測試一鍵點數扣抵預約'
        : 'Navigates to /studio/sol-sanctuary to test 1-click pass booking',
      targetRoute: '/studio/sol-sanctuary',
    },
    {
      id: 'new_student',
      label: isZh ? '👤 新學員 (New Student - 0 預約紀錄)' : 'New Student (0 Passes / Clean Feed)',
      roleDesc: isZh
        ? '進入公開探索與課表頁，測試 Apple Pay / LINE Pay / 轉帳結帳'
        : 'Displays public explore & booking feed with zero prior bookings',
      targetRoute: '/explore',
    },
    {
      id: 'new_owner',
      label: isZh ? '🧘 新教練 (Unonboarded Instructor)' : 'Unonboarded Instructor (Step 1 Wizard)',
      roleDesc: isZh
        ? '重設教練狀態並啟動步驟 1 免費開通精靈與發布前 Paywall'
        : 'Resets instructor state and launches Step 1 of Onboarding Wizard',
      targetRoute: '/onboarding',
    },
  ];

  const currentPersonaConfig = personas.find((p) => p.id === activePersona) || personas[0];

  return (
    <div className="fixed bottom-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      {!isExpanded ? (
        /* Collapsed Floating Pill */
        <div className="pointer-events-auto flex items-center space-x-1.5">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-[#181614]/95 text-amber-300 border border-amber-500/40 shadow-xl backdrop-blur-md hover:bg-black transition-all hover:scale-105 active:scale-95 text-xs font-medium"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
            </span>
            <Wrench className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-white">
              {isZh ? '開發測試沙盒 (Dev Sandbox)' : 'Dev Sandbox Mode'}
            </span>
            <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#2A241E] text-[#E0D8CE] border border-[#3E342A] text-[10px]">
              {currentPersonaConfig.label.split(' (')[0]}
            </span>
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
          </button>

          <button
            type="button"
            onClick={() => setDevSandboxVisible(false)}
            title={isZh ? '隱藏並鎖定開發者工具' : 'Lock & Hide Dev Tools'}
            className="px-3 py-2.5 rounded-full bg-[#181614]/95 hover:bg-red-950 text-stone-400 hover:text-red-300 border border-stone-700/60 shadow-xl backdrop-blur-md text-xs font-medium transition-all"
          >
            {isZh ? '✕ 隱藏' : '✕ Hide'}
          </button>
        </div>
      ) : (
        /* Expanded Floating Sandbox Card */
        <div className="pointer-events-auto bg-[#1C1815] text-[#F5F2EB] border border-[#3E372F] shadow-2xl rounded-3xl p-5 max-w-xl w-full backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#302B24] mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  {isZh ? '開發者沙盒與角色模擬器' : 'Developer Sandbox & Role Simulator'}
                </h3>
                <p className="text-[10px] text-[#8C8274]">
                  {isZh
                    ? '一鍵切換新學員、新教練開通流程或重設為全新首次安裝狀態'
                    : 'Instant multi-role switcher & clean first-run state simulator'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  setDevSandboxVisible(false);
                  setIsExpanded(false);
                }}
                className="px-2.5 py-1 rounded-full bg-red-950/70 hover:bg-red-900 border border-red-700/60 text-xs text-red-200 transition-colors"
              >
                {isZh ? '✕ 隱藏開發工具 (Lock & Hide)' : '✕ Lock & Hide'}
              </button>
              <button
                onClick={() => setIsExpanded(false)}
                className="px-2.5 py-1 rounded-full bg-[#2A241E] hover:bg-[#383028] text-xs text-[#A89F91] transition-colors"
              >
                {isZh ? '收合 ▾' : 'Minimize ▾'}
              </button>
            </div>
          </div>

          {/* 1. Primary Reset Actions: Clean Guest & Reset as New Coach */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={handleCleanReset}
              className="py-2.5 px-3 rounded-2xl bg-red-950/90 hover:bg-red-900 text-red-200 border border-red-700/80 text-xs font-semibold flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.99]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-red-300" />
              <span>
                {isZh
                  ? '🔄 重設為全新訪客 (Clean State)'
                  : '🔄 Reset to Clean State'}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                resetAsNewCoach();
                setIsExpanded(false);
              }}
              className="py-2.5 px-3 rounded-2xl bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-600/70 text-xs font-semibold flex items-center justify-center space-x-2 shadow-md transition-all active:scale-[0.99]"
            >
              <UserCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {isZh
                  ? '🔄 重設為全新教練 (Clean Coach)'
                  : '🔄 Reset as New Coach'}
              </span>
            </button>
          </div>

          {/* 2. Quick Role Switcher Pills */}
          <div className="mb-4">
            <label className="block text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider mb-2 flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>{isZh ? '快速角色切換 (Quick Role Switcher)' : 'Quick Role Switcher Pills'}</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {quickRolePills.map((pill) => {
                const isSelected = activePersona === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => switchPersona(pill.id)}
                    className={`px-3 py-2 rounded-xl border text-[11px] font-semibold transition-all text-center ${
                      isSelected
                        ? 'bg-[#C5A059] text-[#161412] border-[#C5A059] shadow-sm'
                        : 'bg-[#26211C] text-[#E0D8CE] border-[#3E342A] hover:border-[#C5A059]/60'
                    }`}
                  >
                    {isZh ? pill.labelZh : pill.labelEn}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Full Persona Dropdown (includes Maya Lin 2-Pass Student) */}
          <div className="space-y-1.5 mb-4">
            <select
              aria-label="Switch Persona"
              value={activePersona}
              onChange={(e) => switchPersona(e.target.value as PersonaType)}
              className="w-full bg-[#26211C] border border-[#443A30] text-[#F5F2EB] text-xs rounded-xl px-3 py-2 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
            >
              {personas.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.label}
                </option>
              ))}
            </select>

            <p className="text-[11px] text-[#A89F91] italic pt-0.5">
              ↳ {currentPersonaConfig.roleDesc}
            </p>
          </div>

          {/* Sandbox Controls Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[#302B24] mb-3">
            {/* Simulate Stripe Payment Toggle */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-[#26211C] border border-[#3E342A]">
              <div className="flex items-center space-x-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <div>
                  <div className="text-xs font-semibold text-white">
                    {isZh ? '模擬免刷卡測試結帳' : 'Simulate Stripe'}
                  </div>
                  <div className="text-[10px] text-[#8C8274]">
                    {isZh ? '自動核准 $0 測試交易' : 'Auto-approve test cards'}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSimulateStripePayment(!simulateStripePayment)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  simulateStripePayment ? 'bg-emerald-600' : 'bg-stone-700'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    simulateStripePayment ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Restore Seed Database Button */}
            <button
              type="button"
              onClick={handleSeedReset}
              className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#26211C] border border-[#3E342A] hover:border-amber-400/50 hover:bg-[#302A24] text-xs font-semibold text-amber-200 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>{isZh ? '還原預設示範資料庫' : 'Restore Demo Seed Data'}</span>
            </button>
          </div>

          {/* Reset Toast Feedback */}
          {resetToast && (
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs text-center font-medium animate-in fade-in">
              {isZh
                ? '✓ 已還原預設示範課表（5 堂課、Elena 教練與 Maya 學員點數）！'
                : '✓ Database restored to seed state!'}
            </div>
          )}

          {/* Footer Info */}
          <div className="pt-2 text-[10px] text-[#8C8274] flex items-center justify-between">
            <span>
              Route:{' '}
              <span className="font-mono text-[#C5A059]">
                {currentRoute.path === 'public_studio'
                  ? `/studio/${currentRoute.slug}`
                  : currentRoute.path === 'vip_booking'
                  ? `/vip/${currentRoute.inviteToken}`
                  : `/${currentRoute.path}`}
              </span>
            </span>
            <span>
              User: <span className="text-[#E0D8CE]">{currentUser.name}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
