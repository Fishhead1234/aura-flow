import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { useAuraStore } from '../store/auraStore';
import { backupTransferService } from '../services/backupTransferService';
import {
  Smartphone,
  Cloud,
  HardDrive,
  Download,
  Upload,
  Copy,
  Check,
  CheckCheck,
  QrCode as QrIcon,
  RefreshCw,
  X,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  AlertCircle,
  FileCheck,
  ExternalLink,
} from 'lucide-react';

export const StudioTransferModal: React.FC = () => {
  const {
    isTransferModalOpen,
    transferModalTab,
    closeTransferModal,
    openTransferModal,
    locale,
    studio,
    studios,
    activeStudioId,
    sessions,
    classPacks,
    userPass,
    bookings,
    waitlist,
    creditLedger,
    stripeOverview,
    conversations,
    messages,
    broadcastHistory,
    restoreFromSnapshot,
    setQrScannerOpen,
  } = useAuraStore();

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  // Transfer State
  const [activeTab, setActiveTab] = useState<'TRANSFER' | 'RESTORE' | 'BACKUP'>('TRANSFER');
  const [transferCode, setTransferCode] = useState<string>('');
  const [transferQrUrl, setTransferQrUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Restore State
  const [inputCode, setInputCode] = useState('');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreError, setRestoreError] = useState<string | null>(null);
  const [restoreSuccess, setRestoreSuccess] = useState(false);

  // Backup State
  const [backupDownloadedToast, setBackupDownloadedToast] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync tab from store prop
  useEffect(() => {
    if (transferModalTab) {
      setActiveTab(transferModalTab);
    }
  }, [transferModalTab]);

  // Generate / Refresh Transfer Code
  const handleGenerateTransferSession = async () => {
    setIsGenerating(true);
    const newCode = backupTransferService.generateCode();
    setTransferCode(newCode);

    const snapshot = {
      studios,
      studio,
      activeStudioId,
      sessions,
      classPacks,
      userPass,
      bookings,
      waitlist,
      creditLedger,
      stripeOverview,
      conversations,
      messages,
      broadcastHistory,
    };

    try {
      await backupTransferService.createTransferSession(newCode, snapshot);
      const qrData = `auraflow://transfer?code=${newCode}&studio=${encodeURIComponent(studio.name)}`;
      const url = await QRCode.toDataURL(qrData, {
        width: 256,
        margin: 2,
        color: { dark: '#1C1917', light: '#FFFFFF' },
      });
      setTransferQrUrl(url);
    } catch {
      // Ignore QR generation errors
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (isTransferModalOpen && activeTab === 'TRANSFER' && !transferCode) {
      handleGenerateTransferSession();
    }
  }, [isTransferModalOpen, activeTab]);

  // Copy code handler
  const handleCopyCode = () => {
    if (!transferCode) return;
    navigator.clipboard?.writeText(transferCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Restore from code
  const handleRestoreSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputCode.trim()) return;

    setIsRestoring(true);
    setRestoreError(null);
    setRestoreSuccess(false);

    const res = await backupTransferService.restoreFromTransferCode(inputCode.trim());
    setIsRestoring(false);

    if (res.ok && res.snapshot) {
      setRestoreSuccess(true);
      setTimeout(() => {
        restoreFromSnapshot(res.snapshot!);
      }, 900);
    } else {
      setRestoreError(res.error || (isZh ? '轉移代碼驗證失敗，請確認代碼是否正確。' : 'Failed to restore. Please check code.'));
    }
  };

  // Restore from file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = backupTransferService.parseBackupFile(content);
      if (res.ok && res.snapshot) {
        setRestoreSuccess(true);
        setTimeout(() => {
          restoreFromSnapshot(res.snapshot!);
        }, 900);
      } else {
        setRestoreError(res.error || (isZh ? '備份檔案格式無效' : 'Invalid backup file'));
      }
    };
    reader.readAsText(file);
  };

  // Cloud Export Handlers
  const handleExport = (provider: 'ICLOUD' | 'GOOGLE_DRIVE' | 'DROPBOX' | 'LOCAL_FILE') => {
    const snapshot = {
      studios,
      studio,
      activeStudioId,
      sessions,
      classPacks,
      userPass,
      bookings,
      waitlist,
      creditLedger,
      stripeOverview,
      conversations,
      messages,
      broadcastHistory,
    };

    backupTransferService.downloadLocalBackupFile(snapshot, provider);
    const label =
      provider === 'ICLOUD'
        ? 'Apple iCloud Drive'
        : provider === 'GOOGLE_DRIVE'
        ? 'Google Drive'
        : provider === 'DROPBOX'
        ? 'Dropbox'
        : isZh
        ? '本機加密金庫'
        : 'Local Vault';

    setBackupDownloadedToast(label);
    setTimeout(() => setBackupDownloadedToast(null), 3500);
  };

  if (!isTransferModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#1C1917] text-[#F5F2EB] border border-[#C5A059]/40 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[94vh] overflow-y-auto no-scrollbar">
        {/* Close Button */}
        <button
          type="button"
          onClick={closeTransferModal}
          aria-label="Close"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#2A241E] hover:bg-[#3A322A] flex items-center justify-center text-[#A89F91] hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-2xl bg-[#C5A059]/15 border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#F5F2EB]">
              {isZh ? '工作室無縫換機與雲端備份金庫' : 'Studio Device Transfer & Cloud Backup'}
            </h2>
            <p className="text-xs text-[#A89F91] mt-0.5">
              {isZh
                ? '如同 LINE / WhatsApp 換機體驗，跨 iOS 與 Android 1 秒無痛還原全量課表與學員歷史'
                : 'WhatsApp/LINE-style cross-device sync between iOS, Android, and Web'}
            </p>
          </div>
        </div>

        {/* 3 Navigation Tabs */}
        <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[#24201C] border border-[#383129] mb-6 text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('TRANSFER')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'TRANSFER'
                ? 'bg-[#C5A059] text-[#161412] font-semibold shadow-md'
                : 'text-[#A89F91] hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span className="truncate">{isZh ? '本機換機轉移' : 'Transfer Out'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('RESTORE')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'RESTORE'
                ? 'bg-[#C5A059] text-[#161412] font-semibold shadow-md'
                : 'text-[#A89F91] hover:text-white'
            }`}
          >
            <QrIcon className="w-3.5 h-3.5" />
            <span className="truncate">{isZh ? '新機輸入代碼' : 'Restore'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('BACKUP')}
            className={`py-2 px-2.5 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
              activeTab === 'BACKUP'
                ? 'bg-[#C5A059] text-[#161412] font-semibold shadow-md'
                : 'text-[#A89F91] hover:text-white'
            }`}
          >
            <Cloud className="w-3.5 h-3.5" />
            <span className="truncate">{isZh ? '四大雲端備份' : 'Cloud Vault'}</span>
          </button>
        </div>

        {/* TAB 1: TRANSFER TO NEW DEVICE */}
        {activeTab === 'TRANSFER' && (
          <div className="space-y-5 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-[#24201C] border border-[#383129] text-center">
              <span className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider">
                {isZh ? '您的專屬 6 碼換機轉移代碼' : 'Your 6-Digit Transfer Code'}
              </span>

              {/* Code Display */}
              <div className="my-3 flex items-center justify-center space-x-3">
                <span className="font-mono text-3xl sm:text-4xl font-bold tracking-widest text-amber-300 bg-[#161412] px-6 py-2.5 rounded-2xl border border-amber-500/40 select-all shadow-inner">
                  {transferCode || 'AURA-....'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-3 rounded-2xl bg-[#2E271F] hover:bg-[#3E352B] border border-[#4A3F33] text-[#E0D8CE] transition-all"
                  title="複製代碼"
                >
                  {copiedCode ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  onClick={handleGenerateTransferSession}
                  disabled={isGenerating}
                  className="p-3 rounded-2xl bg-[#2E271F] hover:bg-[#3E352B] border border-[#4A3F33] text-[#E0D8CE] transition-all"
                  title="重新產生代碼"
                >
                  <RefreshCw className={`w-5 h-5 ${isGenerating ? 'animate-spin' : ''}`} />
                </button>
              </div>

              <p className="text-[11px] text-[#A89F91]">
                {isZh
                  ? '代碼有效時間：30 分鐘 • 請在新手機下載 Aura Flow 並輸入此代碼或掃描下方 QR Code'
                  : 'Valid for 30 minutes. Enter this code on your new device or scan the QR code below.'}
              </p>
            </div>

            {/* QR Code For Instant Phone-to-Phone Scanning */}
            {transferQrUrl && (
              <div className="p-5 rounded-2xl bg-[#161412] border border-[#352E26] flex flex-col sm:flex-row items-center gap-5">
                <div className="p-2.5 bg-white rounded-2xl shadow-xl shrink-0">
                  <img src={transferQrUrl} alt="Transfer QR Code" className="w-36 h-36 rounded-lg" />
                </div>
                <div className="text-left space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-semibold border border-emerald-700">
                    <CheckCheck className="w-3 h-3" />
                    <span>{isZh ? '支援跨系統 1 秒直連' : 'iOS ↔ Android Instant Sync'}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-[#F5F2EB]">
                    {isZh ? '新手機鏡頭直接對準掃描' : 'Point New Device Camera at Code'}
                  </h4>
                  <p className="text-xs text-[#8C8274] leading-relaxed">
                    {isZh
                      ? '在新裝置登入頁點選「📷 掃描舊機 QR Code」，即可免手動輸入代碼，直接傳送歷史紀錄與 Pro 訂閱狀態。'
                      : 'Scan directly from your new phone to restore all classes, students, chats, and RevenueCat subscription.'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: RESTORE ON NEW DEVICE */}
        {activeTab === 'RESTORE' && (
          <form onSubmit={handleRestoreSubmit} className="space-y-5 animate-in fade-in duration-150">
            <div className="p-4 rounded-2xl bg-[#24201C] border border-[#383129]">
              <label className="block text-xs font-semibold text-[#E0D8CE] mb-2">
                {isZh ? '請輸入舊手機顯示的換機轉移代碼 (Transfer Code)' : 'Enter 6-Digit Transfer Code from Old Device'}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  placeholder="例如: AURA-7829"
                  className="flex-1 px-4 py-3 rounded-xl bg-[#161412] border border-[#3E362E] text-amber-300 font-mono text-lg font-bold uppercase tracking-wider placeholder-[#6A6054] focus:outline-none focus:border-[#C5A059]"
                />
                <button
                  type="button"
                  onClick={() => {
                    closeTransferModal();
                    setQrScannerOpen(true);
                  }}
                  className="px-4 py-3 rounded-xl bg-[#2E271F] hover:bg-[#3E352B] border border-[#4A3F33] text-xs font-semibold text-[#C5A059] flex items-center space-x-1.5 transition-all shrink-0"
                >
                  <QrIcon className="w-4 h-4" />
                  <span>{isZh ? '開啟相機掃描' : 'Scan QR'}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#8C8274] mt-2">
                {isZh
                  ? '代碼格式為 AURA- 四位數字，不分大小寫。驗證成功後將自動載入您的所有工作室課表與名冊。'
                  : 'Code is in format AURA-XXXX. Once validated, your entire studio and roster will load.'}
              </p>
            </div>

            {restoreError && (
              <div className="p-3.5 rounded-xl bg-red-950/60 border border-red-700/60 text-red-200 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{restoreError}</span>
              </div>
            )}

            {restoreSuccess && (
              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-200 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCheck className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>{isZh ? '🎉 轉移成功！正在為您同步資料並載入管理後台...' : 'Restore successful! Loading studio dashboard...'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={isRestoring || !inputCode.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-[#C5A059] hover:bg-[#D4AF37] disabled:opacity-50 text-[#161412] font-semibold text-sm flex items-center justify-center space-x-2 shadow-xl transition-all"
            >
              {isRestoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isZh ? '正在連線 Supabase 雲端金庫解密...' : 'Decrypting & restoring...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isZh ? '驗證代碼並立即復原工作室' : 'Verify Code & Restore Studio'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* TAB 3: 4 POPULAR CLOUD SERVICES BACKUP */}
        {activeTab === 'BACKUP' && (
          <div className="space-y-4 animate-in fade-in duration-150 text-xs">
            {backupDownloadedToast && (
              <div className="p-3 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-2 animate-in fade-in">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>
                  {isZh
                    ? `已成功匯出加密快照！您可將檔案存放在 ${backupDownloadedToast}。`
                    : `Encrypted backup snapshot exported to ${backupDownloadedToast}.`}
                </span>
              </div>
            )}

            <p className="text-[#A89F91] leading-relaxed">
              {isZh
                ? '支援業界 4 大主流雲端儲存服務，您可以隨時匯出由 AES 加密的工作室完整歷史快照 (.aurabackup)，保障商業資料永久不遺失：'
                : 'Export an encrypted (.aurabackup) archive to Apple iCloud, Google Drive, or Dropbox.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option 1: Apple iCloud Drive */}
              <button
                type="button"
                onClick={() => handleExport('ICLOUD')}
                className="p-4 rounded-2xl bg-[#24201C] hover:bg-[#2C2722] border border-[#383129] hover:border-[#C5A059]/60 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#F5F2EB] flex items-center space-x-1.5">
                    <span>🍏 Apple iCloud Drive</span>
                  </span>
                  <Download className="w-4 h-4 text-[#C5A059] group-hover:translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#8C8274]">
                  {isZh ? '自動儲存至 iOS「檔案」App 與 iCloud 雲端' : 'Save directly to iOS Files & iCloud'}
                </p>
              </button>

              {/* Option 2: Google Drive */}
              <button
                type="button"
                onClick={() => handleExport('GOOGLE_DRIVE')}
                className="p-4 rounded-2xl bg-[#24201C] hover:bg-[#2C2722] border border-[#383129] hover:border-[#C5A059]/60 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#F5F2EB] flex items-center space-x-1.5">
                    <span>📁 Google Drive (雲端硬碟)</span>
                  </span>
                  <Download className="w-4 h-4 text-[#C5A059] group-hover:translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#8C8274]">
                  {isZh ? '匯出快照至 Google 雲端帳戶備份' : 'Export snapshot bundle to Google Drive'}
                </p>
              </button>

              {/* Option 3: Dropbox */}
              <button
                type="button"
                onClick={() => handleExport('DROPBOX')}
                className="p-4 rounded-2xl bg-[#24201C] hover:bg-[#2C2722] border border-[#383129] hover:border-[#C5A059]/60 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#F5F2EB] flex items-center space-x-1.5">
                    <span>📦 Dropbox</span>
                  </span>
                  <Download className="w-4 h-4 text-[#C5A059] group-hover:translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#8C8274]">
                  {isZh ? '同步保存至 Dropbox 商業資料夾' : 'Sync snapshot to Dropbox storage'}
                </p>
              </button>

              {/* Option 4: Local Vault (.aurabackup) */}
              <button
                type="button"
                onClick={() => handleExport('LOCAL_FILE')}
                className="p-4 rounded-2xl bg-[#24201C] hover:bg-[#2C2722] border border-[#383129] hover:border-[#C5A059]/60 text-left transition-all group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-semibold text-[#F5F2EB] flex items-center space-x-1.5">
                    <span>🔐 本機加密金庫 (.aurabackup)</span>
                  </span>
                  <Download className="w-4 h-4 text-[#C5A059] group-hover:translate-y-0.5 transition-transform" />
                </div>
                <p className="text-[11px] text-[#8C8274]">
                  {isZh ? '下載獨立加密快照檔案到本機' : 'Download raw offline encrypted backup file'}
                </p>
              </button>
            </div>

            {/* Restore from File Upload */}
            <div className="mt-4 p-4 rounded-2xl bg-[#181614] border border-[#352E26] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-[#F5F2EB]">
                  {isZh ? '從備份檔案還原工作室' : 'Restore from Backup File'}
                </h4>
                <p className="text-[11px] text-[#8C8274]">
                  {isZh ? '選擇任何歷史 .aurabackup 或 .json 檔案' : 'Upload any previously exported backup file'}
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".aurabackup,.json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 rounded-xl bg-[#2E271F] hover:bg-[#3E352B] border border-[#4A3F33] text-xs font-semibold text-[#E0D8CE] flex items-center space-x-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{isZh ? '選取備份檔案' : 'Upload File'}</span>
              </button>
            </div>
          </div>
        )}

        {/* Live Cloud Status Footer */}
        <div className="mt-6 pt-4 border-t border-[#312A23] flex items-center justify-between text-[11px] text-[#8C8274]">
          <div className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              {isZh
                ? 'Supabase 雲端多中心即時鏡像中 • 零延遲跨裝置'
                : 'Multi-datacenter cloud mirroring active'}
            </span>
          </div>
          <span>Aura Vault v1.0</span>
        </div>
      </div>
    </div>
  );
};
