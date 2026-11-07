import React, { useState, useEffect, useRef } from 'react';
import { useAuraStore } from '../store/auraStore';
import { Lock, ShieldCheck, X, Sparkles } from 'lucide-react';

export const DevPinModal: React.FC = () => {
  const { isDevPinModalOpen, setDevPinModalOpen, setDevSandboxVisible, locale } = useAuraStore();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  useEffect(() => {
    if (isDevPinModalOpen) {
      setPin('');
      setError(false);
      setSuccess(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isDevPinModalOpen]);

  if (!isDevPinModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.trim() === '8888') {
      setSuccess(true);
      setError(false);
      setTimeout(() => {
        setDevSandboxVisible(true);
        setDevPinModalOpen(false);
      }, 500);
    } else {
      setError(true);
      setPin('');
      inputRef.current?.focus();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div className="bg-[#1C1815] text-[#F5F2EB] border border-amber-500/40 shadow-2xl rounded-3xl p-6 max-w-sm w-full relative">
        <button
          type="button"
          onClick={() => setDevPinModalOpen(false)}
          className="absolute top-4 right-4 text-[#8C8274] hover:text-white transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mb-3 shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-serif text-lg font-bold text-amber-300">
            {isZh ? '🔐 管理員開發者模式' : '🔐 Developer Mode Authentication'}
          </h3>
          <p className="text-xs text-[#A89F91] mt-1">
            {isZh
              ? '偵測到 Logo 連續 9 次點擊。請輸入開發者專屬 PIN 碼以解鎖測試沙盒。'
              : '9 logo taps detected. Enter the 4-digit Dev PIN to unlock testing tools.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              ref={inputRef}
              type="password"
              maxLength={8}
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="e.g. 8888"
              className="w-full text-center text-xl tracking-widest font-mono py-3 px-4 rounded-2xl bg-[#26211C] border border-[#3E342A] text-white focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400"
            />
            {error && (
              <p className="text-xs text-red-400 text-center mt-2 animate-in fade-in">
                {isZh ? 'PIN 碼錯誤，請重新輸入 (預設: 8888)' : 'Incorrect PIN. Default is 8888.'}
              </p>
            )}
            {success && (
              <p className="text-xs text-emerald-400 text-center mt-2 flex items-center justify-center space-x-1 animate-in fade-in">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{isZh ? '驗證成功！已解鎖沙盒工具' : 'Verified! Dev Sandbox mounted'}</span>
              </p>
            )}
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setDevPinModalOpen(false)}
              className="flex-1 py-2.5 rounded-xl bg-[#2A241E] hover:bg-[#383028] text-xs font-semibold text-[#A89F91] transition-colors"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={!pin.trim()}
              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#161412] text-xs font-bold shadow-md transition-all disabled:opacity-50"
            >
              {isZh ? '確認解鎖' : 'Unlock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
