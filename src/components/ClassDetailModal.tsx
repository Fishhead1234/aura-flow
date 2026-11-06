import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { ClassSession } from '../types/aura';
import { formatCurrency } from '../i18n/auraI18n';
import {
  Link2,
  MessageCircle,
  CheckCheck,
  ExternalLink,
  KeyRound,
  Clock,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface ClassDetailModalProps {
  session: ClassSession | null;
  onClose: () => void;
}

export function buildVipInviteText(
  session: ClassSession,
  studioName: string,
  originUrl: string,
  isZh: boolean
): { url: string; message: string } {
  const token = session.inviteToken || `vip-${session.id}`;
  const url = `${originUrl}/vip/${token}`;
  const datePart = session.startTime.substring(0, 10);
  const timePart = `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`;
  const invitedNames =
    session.invitedStudents && session.invitedStudents.length > 0
      ? session.invitedStudents.map((s) => s.name).join('、')
      : isZh
      ? '貴賓學員'
      : 'VIP Guest';

  const pinLine = session.pinCode
    ? isZh
      ? `\n🔐 專屬通行 PIN 碼：${session.pinCode}`
      : `\n🔐 Access PIN: ${session.pinCode}`
    : '';

  const message = isZh
    ? `👑【${studioName} • 專屬私教受邀通知】\n${invitedNames} 您好！教練 ${session.instructor} 已為您保留專屬包班席次：\n\n✨ 課程：${session.title}\n📅 時間：${datePart} ${timePart}\n📍 地點：${studioName} (${session.roomName})${pinLine}\n\n👇 請點選下方專屬連結確認並完成預約：\n${url}`
    : `👑 [${studioName} • Private Session Invitation]\nHi ${invitedNames}, Coach ${session.instructor} has reserved a private spot for you:\n\n✨ Class: ${session.title}\n📅 Time: ${datePart} ${timePart}\n📍 Room: ${studioName} (${session.roomName})${pinLine}\n\n👇 Confirm your private booking here:\n${url}`;

  return { url, message };
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({ session, onClose }) => {
  const { locale, currency, studio, navigateTo } = useAuraStore();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFullMsg, setCopiedFullMsg] = useState(false);

  if (!session) return null;

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';
  const originUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://auraflow-bay.vercel.app';
  const token = session.inviteToken || `vip-${session.id}`;
  const { url, message } = buildVipInviteText(session, studio.name, originUrl, isZh);

  const handleCopyVipLink = () => {
    navigator.clipboard?.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyMessage = () => {
    navigator.clipboard?.writeText(message);
    setCopiedFullMsg(true);
    setTimeout(() => setCopiedFullMsg(false), 2500);
  };

  const handleShareToLine = () => {
    navigator.clipboard?.writeText(message);
    const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(message)}`;
    window.open(lineUrl, '_blank', 'noopener,noreferrer');
  };

  const handlePreviewVipPage = () => {
    onClose();
    navigateTo({ path: 'vip_booking', inviteToken: token });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1E1A16] rounded-3xl p-6 border border-[#C5A059]/60 w-full max-w-lg text-[#F5F2EB] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#3A332B] pb-4 mb-4">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-[#C5A059]/50 text-[#EAD8B1] text-[11px] font-semibold mb-2">
              <span>👑</span>
              <span>{isZh ? '專屬受邀制 (VIP Invite Generator)' : 'Private / Invite-Only Session'}</span>
            </span>
            <h3 className="font-serif text-xl font-medium text-[#F5F2EB]">{session.title}</h3>
            <p className="text-xs text-[#A89F91] mt-0.5 font-mono">
              {session.startTime.substring(0, 10)} • {session.startTime.substring(11, 16)} -{' '}
              {session.endTime.substring(11, 16)} • {formatCurrency(session.price, currency, locale)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[#8C8274] hover:text-[#F5F2EB] text-lg font-bold"
          >
            ✕
          </button>
        </div>

        {/* Invited Students & Confirmation Status */}
        <div className="mb-4">
          <div className="text-[11px] font-semibold text-[#C5A059] uppercase tracking-wider mb-2">
            {isZh ? '受邀學員預約狀態 (Invited Roster Status)' : 'Invited Student Roster Status'}
          </div>
          <div className="space-y-2">
            {session.invitedStudents && session.invitedStudents.length > 0 ? (
              session.invitedStudents.map((stu) => (
                <div
                  key={stu.id}
                  className="p-3 rounded-xl bg-[#161310] border border-[#352E26] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-[#F5F2EB]">{stu.name}</div>
                    <div className="text-[10px] text-[#8C8274]">{stu.email}</div>
                  </div>
                  {stu.status === 'BOOKED' || session.bookedCount >= session.capacity ? (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-700/70 text-emerald-300 text-[11px] font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isZh ? '✓ 已預約確認 (Booked)' : '✓ Booked'}</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[11px] font-semibold">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{isZh ? '⏳ 待學員確認 (Awaiting Confirmation)' : '⏳ Awaiting Confirmation'}</span>
                    </span>
                  )}
                </div>
              ))
            ) : (
              <div className="p-3 rounded-xl bg-[#161310] border border-[#352E26] flex items-center justify-between text-xs">
                <span className="text-[#A89F91]">
                  {isZh ? '持連結之受邀貴賓學員' : 'Any VIP student with invite link'}
                </span>
                {session.bookedCount > 0 ? (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/90 border border-emerald-700/70 text-emerald-300 text-[11px] font-semibold">
                    {isZh ? '✓ 已預約確認 (Booked)' : '✓ Booked'}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full bg-amber-950/80 border border-amber-700/60 text-amber-300 text-[11px] font-semibold">
                    {isZh ? '⏳ 待學員確認 (Awaiting Confirmation)' : '⏳ Awaiting Confirmation'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Direct Link & Optional PIN */}
        <div className="p-3.5 rounded-2xl bg-[#161310] border border-[#352E26] mb-4 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#8C8274]">
              {isZh ? '專屬私教預約網址：' : 'Direct VIP Booking Link:'}
            </span>
            {session.pinCode && (
              <span className="inline-flex items-center space-x-1 text-[11px] font-mono text-[#C5A059]">
                <KeyRound className="w-3 h-3" />
                <span>PIN: {session.pinCode}</span>
              </span>
            )}
          </div>
          <div className="font-mono text-xs text-[#EAD8B1] break-all bg-[#221E1A] px-3 py-2 rounded-xl border border-[#3A332B]">
            {url}
          </div>
        </div>

        {/* Pre-written VIP Invitation Message Preview */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-[#A89F91]">
              {isZh ? '預先擬好之專屬邀請訊息 (Pre-formatted Invite Message)' : 'Pre-formatted VIP Invitation Message'}
            </span>
            <button
              type="button"
              onClick={handleCopyMessage}
              className="text-[11px] text-[#C5A059] hover:underline"
            >
              {copiedFullMsg
                ? isZh
                  ? '✓ 已複製完整文案'
                  : '✓ Message Copied'
                : isZh
                ? '複製完整邀請文案'
                : 'Copy Full Text'}
            </button>
          </div>
          <pre className="p-3.5 rounded-2xl bg-[#161310] border border-[#352E26] text-xs text-[#E0D8CE] whitespace-pre-wrap font-sans leading-relaxed">
            {message}
          </pre>
        </div>

        {/* Primary Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
          <button
            type="button"
            onClick={handleCopyVipLink}
            className="py-2.5 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md transition-all"
          >
            {copiedLink ? (
              <>
                <CheckCheck className="w-4 h-4" />
                <span>{isZh ? '已複製專屬邀請連結！' : 'VIP Link Copied!'}</span>
              </>
            ) : (
              <>
                <Link2 className="w-4 h-4" />
                <span>
                  {isZh ? '🔗 複製專屬邀請連結 (Copy VIP Link)' : '🔗 Copy VIP Link'}
                </span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleShareToLine}
            className="py-2.5 px-4 rounded-xl bg-[#06C755] hover:bg-[#05b34c] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>{isZh ? '💬 一鍵分享至 LINE' : '💬 Share to LINE'}</span>
          </button>
        </div>

        {/* Preview Student VIP Booking Page Button */}
        <button
          type="button"
          onClick={handlePreviewVipPage}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2A241E] hover:bg-[#362E26] border border-[#4A4035] text-xs font-medium text-[#EAD8B1] flex items-center justify-center space-x-1.5 transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>
            {isZh
              ? '預覽學員端 VIP 專屬預約頁面 (/vip/' + token + ')'
              : 'Preview Student VIP Booking Page (/vip/' + token + ')'}
          </span>
          <ExternalLink className="w-3.5 h-3.5 text-[#C5A059]" />
        </button>
      </div>
    </div>
  );
};
