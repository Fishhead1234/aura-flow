import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { PersonaType } from '../types/aura';
import {
  Wrench,
  UserCheck,
  Zap,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Shield,
  Sparkles,
  Check,
} from 'lucide-react';

export const DevSandboxToolbar: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [resetToast, setResetToast] = useState(false);

  const {
    activePersona,
    switchPersona,
    simulateStripePayment,
    setSimulateStripePayment,
    resetDatabaseToSeedState,
    currentRoute,
    userPass,
    currentUser,
  } = useAuraStore();

  const handleReset = () => {
    resetDatabaseToSeedState();
    setResetToast(true);
    setTimeout(() => setResetToast(false), 2000);
  };

  const personas: {
    id: PersonaType;
    label: string;
    roleDesc: string;
    targetRoute: string;
  }[] = [
    {
      id: 'elena_owner',
      label: 'Elena Rostova - Studio Owner',
      roleDesc: 'Navigates to /admin to test schedule management & Stripe payouts',
      targetRoute: '/admin',
    },
    {
      id: 'maya_student',
      label: 'Maya Lin - Enrolled Student (2 Passes)',
      roleDesc: 'Navigates to /s/sol-sanctuary to test 1-click pass booking',
      targetRoute: '/s/sol-sanctuary',
    },
    {
      id: 'new_student',
      label: 'New Student (0 Passes)',
      roleDesc: 'Navigates to /s/sol-sanctuary to test Stripe card / Apple Pay checkout',
      targetRoute: '/s/sol-sanctuary',
    },
    {
      id: 'new_owner',
      label: 'New Studio Owner',
      roleDesc: 'Navigates to /onboarding to test the 3-step studio creation flow',
      targetRoute: '/onboarding',
    },
  ];

  const currentPersonaConfig = personas.find((p) => p.id === activePersona) || personas[0];

  return (
    <div className="fixed bottom-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
      {!isExpanded ? (
        /* Collapsed Floating Pill */
        <button
          onClick={() => setIsExpanded(true)}
          className="pointer-events-auto flex items-center space-x-2.5 px-4 py-2.5 rounded-full bg-[#181614]/95 text-amber-300 border border-amber-500/40 shadow-xl backdrop-blur-md hover:bg-black transition-all hover:scale-105 active:scale-95 text-xs font-medium"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <Wrench className="w-3.5 h-3.5 text-amber-400" />
          <span className="font-semibold text-white">Dev Sandbox Mode</span>
          <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-[#2A241E] text-[#E0D8CE] border border-[#3E342A] text-[10px]">
            {currentPersonaConfig.label.split(' - ')[0]}
          </span>
          <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
        </button>
      ) : (
        /* Expanded Floating Sandbox Card */
        <div className="pointer-events-auto bg-[#1C1815] text-[#F5F2EB] border border-[#3E372F] shadow-2xl rounded-3xl p-5 max-w-lg w-full backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#302B24] mb-4">
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Wrench className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                  Developer Sandbox Toolbar
                </h3>
                <p className="text-[10px] text-[#8C8274]">
                  SQLite dev.db active • Local multi-role environment
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsExpanded(false)}
              className="px-2.5 py-1 rounded-full bg-[#2A241E] hover:bg-[#383028] text-xs text-[#A89F91] transition-colors"
            >
              Minimize ▾
            </button>
          </div>

          {/* Persona Switcher Dropdown */}
          <div className="space-y-1.5 mb-4">
            <label className="block text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider flex items-center space-x-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Switch Persona</span>
            </label>

            <select
              aria-label="Switch Persona"
              value={activePersona}
              onChange={(e) => switchPersona(e.target.value as PersonaType)}
              className="w-full bg-[#26211C] border border-[#443A30] text-[#F5F2EB] text-xs rounded-xl px-3 py-2.5 font-medium focus:outline-none focus:ring-1 focus:ring-amber-400 cursor-pointer"
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
                  <div className="text-xs font-semibold text-white">Simulate Stripe</div>
                  <div className="text-[10px] text-[#8C8274]">Auto-approve test cards</div>
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

            {/* Reset Database Button */}
            <button
              onClick={handleReset}
              className="flex items-center justify-center space-x-2 p-3 rounded-2xl bg-[#26211C] border border-[#3E342A] hover:border-amber-400/50 hover:bg-[#302A24] text-xs font-semibold text-amber-200 transition-all shadow-xs"
            >
              <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
              <span>Reset Database to Seed State</span>
            </button>
          </div>

          {/* Reset Toast Feedback */}
          {resetToast && (
            <div className="p-2 rounded-xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs text-center font-medium animate-in fade-in">
              ✓ Database reset to seed state! 5 classes, Elena (Owner), and Maya (2 passes) restored.
            </div>
          )}

          {/* Footer Info */}
          <div className="pt-2 text-[10px] text-[#8C8274] flex items-center justify-between">
            <span>
              Current Route:{' '}
              <span className="font-mono text-[#C5A059]">
                {currentRoute.path === 'public_studio' ? `/s/${currentRoute.slug}` : `/${currentRoute.path}`}
              </span>
            </span>
            <span>
              Logged In: <span className="text-[#E0D8CE]">{currentUser.name}</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
