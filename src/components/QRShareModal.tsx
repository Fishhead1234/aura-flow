import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { useAuraStore } from '../store/auraStore';
import { Download, Copy, CheckCheck, QrCode, Sparkles, X } from 'lucide-react';

export interface QRSharePayload {
  title: string;
  subtitle?: string;
  dateTimeText?: string;
  coachName: string;
  url: string;
  badgeText?: string;
  fileNamePrefix?: string;
}

interface QRShareModalProps {
  payload: QRSharePayload | null;
  onClose: () => void;
}

export const QRShareModal: React.FC<QRShareModalProps> = ({ payload, onClose }) => {
  const { locale } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const dialogRef = useRef<HTMLDialogElement>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [downloadedToast, setDownloadedToast] = useState(false);

  // Sync <dialog> modal open/close & attach Safari light-dismiss fallback per modern-web-guidance
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (payload) {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
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
          dialog.close();
        }
      }
    };

    dialog.addEventListener('click', handleBackdropClick);
    return () => dialog.removeEventListener('click', handleBackdropClick);
  }, [payload]);

  // Generate real 256x256 high-contrast QR Code via `qrcode` package
  useEffect(() => {
    if (!payload?.url) {
      setQrDataUrl('');
      return;
    }

    let cancelled = false;
    QRCode.toDataURL(payload.url, {
      width: 256,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: '#1C1917',
        light: '#FFFFFF',
      },
    })
      .then((dataUrl) => {
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setQrDataUrl('');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [payload?.url]);

  if (!payload) return null;

  const handleCopyUrl = () => {
    navigator.clipboard?.writeText(payload.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2500);
  };

  const handleDownloadPng = () => {
    if (!qrDataUrl) return;
    const safePrefix = (payload.fileNamePrefix || payload.title || 'auraflow-qr')
      .toLowerCase()
      .replace(/[^a-z0-9-_]+/gi, '-')
      .replace(/^-+|-+$/g, '');
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${safePrefix || 'auraflow-qr'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadedToast(true);
    setTimeout(() => setDownloadedToast(false), 2500);
  };

  return (
    <dialog
      ref={dialogRef}
      closedby="any"
      aria-labelledby="qr-share-modal-title"
      onClose={onClose}
      className="backdrop:bg-black/75 backdrop:backdrop-blur-xs p-0 m-auto w-full max-w-md rounded-3xl bg-[#1c1917] text-[#F5F2EB] border border-[#c5a059]/70 shadow-2xl overflow-hidden"
    >
      <div className="p-6 space-y-5">
        {/* Top Header */}
        <div className="flex items-start justify-between border-b border-[#3A332B] pb-3.5">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#c5a059]/20 border border-[#c5a059]/50 text-[#EAD8B1] text-[11px] font-semibold mb-1.5">
              <QrCode className="w-3 h-3 text-[#c5a059]" />
              <span>
                {payload.badgeText ||
                  (isZh ? '專屬預約 QR Code 通行證' : 'Direct Booking QR Code')}
              </span>
            </span>
            <h2
              id="qr-share-modal-title"
              className="font-serif text-xl font-medium text-[#F5F2EB]"
            >
              {isZh ? '課程與教室專屬 QR Code' : 'Studio & Class QR Code'}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label={isZh ? '關閉視窗' : 'Close'}
            className="w-8 h-8 rounded-full bg-[#2A241E] hover:bg-[#383028] flex items-center justify-center text-[#A89F91] hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* High-Contrast 256x256 QR Code Card */}
        <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-linear-to-b from-[#26211C] to-[#181512] border border-[#c5a059]/40 shadow-inner">
          <div className="p-3.5 rounded-2xl bg-white shadow-lg border-2 border-[#c5a059]">
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR Code for ${payload.title}`}
                width={256}
                height={256}
                className="w-64 h-64 block rounded-lg"
              />
            ) : (
              <div className="w-64 h-64 flex items-center justify-center text-xs text-stone-400">
                {isZh ? '正在產生高解析 QR Code...' : 'Generating 256×256 QR Code...'}
              </div>
            )}
          </div>

          {/* Class / Studio Title, Date/Time & Coach Name below the QR Code */}
          <div className="mt-4 text-center space-y-1">
            <h3 className="font-serif text-lg font-semibold text-[#F5F2EB]">
              {payload.title}
            </h3>
            {payload.dateTimeText && (
              <p className="text-xs font-mono text-[#c5a059]">{payload.dateTimeText}</p>
            )}
            <p className="text-xs text-[#A89F91]">
              {isZh ? '授課教練：' : 'Instructor: '}
              <span className="text-[#EAD8B1] font-medium">{payload.coachName}</span>
              {payload.subtitle ? ` • ${payload.subtitle}` : ''}
            </p>
          </div>

          {/* Encoded Direct URL Pill */}
          <div className="mt-3 w-full px-3 py-1.5 rounded-xl bg-[#141210] border border-[#352E26] text-[11px] font-mono text-[#c5a059] text-center truncate">
            {payload.url}
          </div>
        </div>

        {/* Toast Notification */}
        {(copiedUrl || downloadedToast) && (
          <div
            aria-live="polite"
            className="p-2.5 rounded-xl bg-emerald-950/90 border border-emerald-600/70 text-emerald-300 text-xs flex items-center justify-center space-x-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 shrink-0" />
            <span>
              {copiedUrl
                ? isZh
                  ? '✓ 已複製專屬連結至剪貼簿！'
                  : '✓ Direct booking link copied to clipboard!'
                : isZh
                ? '✓ 已下載 256×256 PNG QR Code 圖片！'
                : '✓ Downloaded 256×256 PNG QR Code!'}
            </span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleDownloadPng}
            className="w-full py-3 px-4 rounded-xl bg-[#c5a059] hover:bg-[#d4af37] text-[#1c1917] text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-md"
          >
            <Download className="w-4 h-4 shrink-0" />
            <span>
              {isZh
                ? '[ 📥 下載 QR Code 圖片 (PNG) ]'
                : '[ 📥 Download QR Code Image (PNG) ]'}
            </span>
          </button>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="w-full py-2.5 px-4 rounded-xl bg-[#29231D] hover:bg-[#352D25] border border-[#c5a059]/50 text-[#EAD8B1] text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
          >
            {copiedUrl ? (
              <>
                <CheckCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>
                  {isZh ? '✓ 已複製專屬連結 (Copied!)' : '✓ URL Copied to Clipboard!'}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-[#c5a059] shrink-0" />
                <span>
                  {isZh
                    ? '[ 📋 複製專屬連結 (Copy URL) ]'
                    : '[ 📋 Copy Direct Link (Copy URL) ]'}
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
};
