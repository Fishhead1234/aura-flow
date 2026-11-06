import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { useAuraStore } from '../store/auraStore';
import {
  Camera,
  ImagePlus,
  QrCode,
  AlertCircle,
  CheckCircle2,
  X,
  RefreshCw,
} from 'lucide-react';

function playScanSuccessBeep() {
  try {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([50, 30, 80]);
    }
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(1318.5, ctx.currentTime + 0.14);
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.18);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.18);
  } catch {
    // Ignore audio context restriction errors
  }
}

export const QRScannerModal: React.FC = () => {
  const {
    isQrScannerOpen,
    setQrScannerOpen,
    setStudentOnboardingOpen,
    setWelcomeModalOpen,
    studios,
    sessions,
    bindStudentToCoach,
    navigateTo,
    openBookingDrawer,
    locale,
  } = useAuraStore();

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const dialogRef = useRef<HTMLDialogElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scannerInstanceRef = useRef<Html5Qrcode | null>(null);
  const isScanningStreamRef = useRef<boolean>(false);

  const [cameraState, setCameraState] = useState<'IDLE' | 'STARTING' | 'ACTIVE' | 'DENIED'>('IDLE');
  const [cameraErrorMsg, setCameraErrorMsg] = useState<string | null>(null);
  const [scanErrorMsg, setScanErrorMsg] = useState<string | null>(null);
  const [scanSuccessText, setScanSuccessText] = useState<string | null>(null);

  const stopCameraSafely = async () => {
    const instance = scannerInstanceRef.current;
    if (!instance) return;
    try {
      if (isScanningStreamRef.current) {
        isScanningStreamRef.current = false;
        await instance.stop();
      }
      instance.clear();
    } catch {
      // Ignore cleanup race conditions
    }
  };

  const handleClose = async () => {
    await stopCameraSafely();
    setCameraState('IDLE');
    setCameraErrorMsg(null);
    setScanErrorMsg(null);
    setScanSuccessText(null);
    setQrScannerOpen(false);
  };

  const handleDecodedPayload = async (rawText: string) => {
    const cleaned = rawText.trim();
    if (!cleaned) return;

    playScanSuccessBeep();
    await stopCameraSafely();

    if (typeof window !== 'undefined') {
      localStorage.setItem('auraflow_has_launched', 'true');
    }

    // Parse URL or token:
    // 1. Check for /vip/:token
    const vipMatch = cleaned.match(/\/vip\/([^/?#]+)/i);
    if (vipMatch && vipMatch[1]) {
      const token = vipMatch[1];
      setScanSuccessText(
        isZh
          ? `✓ 掃描成功！正在進入 VIP 專屬私教預約頁 (${token})...`
          : `✓ QR Verified! Opening VIP Private Session (${token})...`
      );
      setTimeout(() => {
        setQrScannerOpen(false);
        setStudentOnboardingOpen(false);
        setWelcomeModalOpen(false);
        setScanSuccessText(null);
        navigateTo({ path: 'vip_booking', inviteToken: token });
      }, 650);
      return;
    }

    // 2. Check for /class/:id or ?class=:id
    const classPathMatch = cleaned.match(/\/class\/([^/?#]+)/i);
    const classQueryMatch = cleaned.match(/[?&]class=([^&#]+)/i);
    const targetSessionId =
      (classPathMatch && classPathMatch[1]) || (classQueryMatch && classQueryMatch[1]);

    // 3. Check for /studio/:slug or /s/:slug
    const studioMatch = cleaned.match(/\/(?:studio|s)\/([^/?#]+)/i);
    const targetSlug = studioMatch && studioMatch[1] ? studioMatch[1] : null;

    if (targetSessionId) {
      const matchedSession = sessions.find((s) => s.id === targetSessionId);
      const matchedStudio =
        studios.find((st) => st.slug === targetSlug) ||
        (matchedSession ? studios.find((st) => st.id === matchedSession.studioId) : null) ||
        studios[0];

      setScanSuccessText(
        isZh
          ? `✓ 掃描成功！已配對「${matchedSession?.title || matchedStudio.name}」`
          : `✓ Matched class "${matchedSession?.title || matchedStudio.name}"!`
      );

      setTimeout(() => {
        setQrScannerOpen(false);
        setStudentOnboardingOpen(false);
        setWelcomeModalOpen(false);
        setScanSuccessText(null);
        bindStudentToCoach(matchedStudio.slug);
        if (matchedSession) {
          openBookingDrawer(matchedSession);
        }
      }, 650);
      return;
    }

    if (targetSlug) {
      const matchedStudio = studios.find((st) => st.slug === targetSlug) || studios[0];
      setScanSuccessText(
        isZh
          ? `✓ 掃描成功！已綁定專屬教室：${matchedStudio.name}`
          : `✓ Bound to studio: ${matchedStudio.name}`
      );
      setTimeout(() => {
        setQrScannerOpen(false);
        setStudentOnboardingOpen(false);
        setWelcomeModalOpen(false);
        setScanSuccessText(null);
        bindStudentToCoach(matchedStudio.slug);
      }, 650);
      return;
    }

    // 4. Check if rawText matches a studio code, slug, or coach name directly
    const lower = cleaned.toLowerCase();
    const matchedByCodeOrName =
      studios.find(
        (st) =>
          st.slug.toLowerCase() === lower ||
          (st.studioCode || '').toLowerCase() === lower ||
          st.name.toLowerCase().includes(lower) ||
          (st.coachName || '').toLowerCase().includes(lower)
      ) || studios[0];

    setScanSuccessText(
      isZh
        ? `✓ 掃描成功！正在前往 ${matchedByCodeOrName.name} (${matchedByCodeOrName.coachName || '主理教練'})`
        : `✓ Matched ${matchedByCodeOrName.name}! Navigating now...`
    );

    setTimeout(() => {
      setQrScannerOpen(false);
      setStudentOnboardingOpen(false);
      setWelcomeModalOpen(false);
      setScanSuccessText(null);
      bindStudentToCoach(matchedByCodeOrName.slug);
    }, 650);
  };

  const startLiveCamera = async () => {
    setCameraErrorMsg(null);
    setScanErrorMsg(null);
    setCameraState('STARTING');

    await stopCameraSafely();

    try {
      const readerEl = document.getElementById('aura-qr-live-reader');
      if (!readerEl) return;

      const html5QrCode = new Html5Qrcode('aura-qr-live-reader');
      scannerInstanceRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 210, height: 210 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          handleDecodedPayload(decodedText);
        },
        () => {
          // Per-frame decode misses are normal while aiming camera
        }
      );

      isScanningStreamRef.current = true;
      setCameraState('ACTIVE');
    } catch {
      isScanningStreamRef.current = false;
      setCameraState('DENIED');
      setCameraErrorMsg(
        isZh
          ? '無法開啟相機權限或未偵測到鏡頭。別擔心！請點擊下方「🖼️ 從相片圖庫選取 QR Code 截圖」直接讀取教練傳給您的圖片。'
          : 'Camera permission was denied or no camera was detected. You can select a QR code screenshot from your photo gallery below.'
      );
    }
  };

  // Sync <dialog> visibility & start camera when opened
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isQrScannerOpen) {
      if (!dialog.open) {
        dialog.showModal();
      }
      startLiveCamera();
    } else {
      if (dialog.open) {
        dialog.close();
      }
      stopCameraSafely();
    }

    const handleBackdropClick = (event: MouseEvent) => {
      if (!('closedBy' in HTMLDialogElement.prototype)) {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (!isDialogContent) {
          handleClose();
        }
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => {
      dialog.removeEventListener('click', handleBackdropClick);
    };
  }, [isQrScannerOpen]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanErrorMsg(null);
    await stopCameraSafely();
    setCameraState('IDLE');

    try {
      const fileScanner = new Html5Qrcode('aura-qr-file-decoder');
      const decodedText = await fileScanner.scanFile(file, false);
      fileScanner.clear();
      await handleDecodedPayload(decodedText);
    } catch {
      setScanErrorMsg(
        isZh
          ? '無法從此圖片辨識出有效的 QR Code，請確認圖片清晰且包含完整的教練或課程 QR Code。'
          : 'Could not decode a valid QR code from this image. Please choose a clear QR code screenshot.'
      );
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (!isQrScannerOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="qr-scanner-modal-title"
      onClose={handleClose}
      className="backdrop:bg-black/80 backdrop:backdrop-blur-xs p-0 m-auto w-full max-w-md rounded-3xl bg-[#1c1917] text-[#F5F2EB] border border-[#c5a059]/70 shadow-2xl overflow-hidden"
    >
      <div className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#3A332B] pb-3.5">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/50 text-[#EAD8B1] text-[11px] font-semibold mb-1">
              <QrCode className="w-3 h-3 text-[#c5a059]" />
              <span>
                {isZh ? '雙模態智慧掃描器 (2-Way Scanner)' : 'Camera & Gallery QR Scanner'}
              </span>
            </span>
            <h2
              id="qr-scanner-modal-title"
              className="font-serif text-xl font-medium text-[#F5F2EB]"
            >
              {isZh
                ? '📷 掃描教練或課程專屬 QR Code'
                : '📷 Scan Coach or Class QR Code'}
            </h2>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label={isZh ? '關閉掃描器' : 'Close Scanner'}
            className="w-8 h-8 rounded-full bg-[#2A241E] hover:bg-[#383028] flex items-center justify-center text-[#A89F91] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mode A: Live Camera Viewfinder with Square Frame & Animated Laser Scan Line */}
        <div className="relative rounded-2xl bg-[#12100E] border border-[#3A332B] overflow-hidden min-h-64 flex flex-col items-center justify-center">
          {/* Html5Qrcode Live Video Container */}
          <div id="aura-qr-live-reader" className="w-full h-full min-h-64" />
          {/* Hidden container dedicated to scanFile image decoding */}
          <div id="aura-qr-file-decoder" className="hidden" />

          {/* Focused Square Scanning Overlay + Animated Laser Line */}
          {cameraState === 'ACTIVE' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="relative w-52 h-52 rounded-2xl border-2 border-[#c5a059]/80 shadow-[0_0_0_9999px_rgba(18,16,14,0.45)]">
                {/* Corner Gold Accents */}
                <span className="absolute -top-0.5 -left-0.5 w-5 h-5 border-t-4 border-l-4 border-[#c5a059] rounded-tl-lg" />
                <span className="absolute -top-0.5 -right-0.5 w-5 h-5 border-t-4 border-r-4 border-[#c5a059] rounded-tr-lg" />
                <span className="absolute -bottom-0.5 -left-0.5 w-5 h-5 border-b-4 border-l-4 border-[#c5a059] rounded-bl-lg" />
                <span className="absolute -bottom-0.5 -right-0.5 w-5 h-5 border-b-4 border-r-4 border-[#c5a059] rounded-br-lg" />
                {/* Animated Laser Line */}
                <div className="absolute inset-x-2 h-0.5 bg-linear-to-r from-transparent via-[#c5a059] to-transparent shadow-[0_0_10px_#c5a059] animate-qr-laser" />
              </div>
            </div>
          )}

          {cameraState === 'STARTING' && (
            <div className="absolute inset-0 bg-[#141210]/95 flex flex-col items-center justify-center p-6 text-center space-y-2">
              <Camera className="w-8 h-8 text-[#c5a059] animate-pulse" />
              <p className="text-xs text-[#EAD8B1] font-medium">
                {isZh
                  ? '正在請求相機權限並啟動即時鏡頭...'
                  : 'Requesting camera permission & starting scanner...'}
              </p>
            </div>
          )}

          {cameraState === 'DENIED' && (
            <div className="absolute inset-0 bg-[#141210]/95 flex flex-col items-center justify-center p-5 text-center space-y-3">
              <div className="w-11 h-11 rounded-full bg-amber-500/15 border border-[#c5a059]/50 flex items-center justify-center text-[#c5a059]">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-xs text-[#E0D8CE] leading-relaxed max-w-xs">
                {cameraErrorMsg}
              </p>
              <button
                type="button"
                onClick={startLiveCamera}
                className="px-3.5 py-1.5 rounded-full bg-[#2A241E] hover:bg-[#383028] border border-[#4A4035] text-[11px] font-medium text-[#EAD8B1] inline-flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3 h-3 text-[#c5a059]" />
                <span>{isZh ? '重新嘗試開啟鏡頭' : 'Retry Camera Stream'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Success or Error Banner */}
        {scanSuccessText && (
          <div
            aria-live="polite"
            className="p-3 rounded-2xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-medium">{scanSuccessText}</span>
          </div>
        )}

        {scanErrorMsg && (
          <div
            aria-live="polite"
            className="p-3 rounded-2xl bg-rose-950/90 border border-rose-700 text-rose-200 text-xs flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{scanErrorMsg}</span>
          </div>
        )}

        {/* Mode B: Photo Gallery / Screenshot Upload Button */}
        <div className="pt-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-3 px-4 rounded-2xl bg-[#c5a059] hover:bg-[#d4af37] text-[#1c1917] text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
          >
            <ImagePlus className="w-4 h-4 shrink-0" />
            <span>
              {isZh
                ? '[ 🖼️ 從相片圖庫選取 QR Code 截圖 ]'
                : '[ 🖼️ Select QR Code Screenshot from Gallery ]'}
            </span>
          </button>
          <p className="text-[11px] text-[#8C8274] text-center mt-2">
            {isZh
              ? '支援直接讀取 LINE / Instagram 收到之課程、工作室或 VIP 私教 QR Code 截圖'
              : 'Supports decoding studio, class, or VIP invite QR screenshots from LINE or Instagram'}
          </p>
        </div>
      </div>
    </dialog>
  );
};
