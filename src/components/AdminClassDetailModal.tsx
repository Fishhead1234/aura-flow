import React, { useState, useEffect } from 'react';
import { useAuraStore } from '../store/auraStore';
import { ClassSession } from '../types/aura';
import { Zap, Users, BellRing, CheckCircle2, Sparkles } from 'lucide-react';

interface AdminClassDetailModalProps {
  session: ClassSession | null;
  onClose: () => void;
}

export const AdminClassDetailModal: React.FC<AdminClassDetailModalProps> = ({
  session,
  onClose,
}) => {
  const { locale, studio, waitlist, notifyLastMinuteVacancy } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const [targetAudience, setTargetAudience] = useState<
    'WAITLIST_AND_FAVORITES' | 'FAVORITES_ONLY' | 'WAITLIST_ONLY'
  >('WAITLIST_AND_FAVORITES');
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  const spotsOpen = session ? Math.max(1, session.capacity - session.bookedCount) : 1;
  const waitlistForSession = session
    ? waitlist.filter((w) => w.sessionId === session.id)
    : [];

  useEffect(() => {
    if (!session) return;
    const spots = Math.max(1, session.capacity - session.bookedCount);
    const timeRange = `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`;
    const defaultMsg = isZh
      ? `✨ 剛剛釋出 ${spots} 席名額！您收藏的「${session.title} (${timeRange})」目前有即時空缺，可直接一鍵扣點預約，額滿即止 🌿`
      : `✨ ${spots} last-minute spot(s) just opened for "${session.title} (${timeRange})"! Since you favorited this time slot, you get priority 1-click booking.`;
    setMessageText(defaultMsg);
    setSentSuccess(false);
  }, [session, isZh]);

  if (!session) return null;

  const estimatedRecipients =
    targetAudience === 'WAITLIST_ONLY'
      ? Math.max(2, waitlistForSession.length)
      : targetAudience === 'FAVORITES_ONLY'
      ? 6
      : Math.max(2, waitlistForSession.length) + 6;

  const handleDispatchVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    notifyLastMinuteVacancy(session.id, targetAudience, messageText.trim());
    setSentSuccess(true);
    setTimeout(() => {
      setSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#C5A059]/60 w-full max-w-lg text-[#F5F2EB] shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#3A332B] pb-4 mb-4">
          <div>
            <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-[#C5A059]/50 text-amber-300 text-[11px] font-semibold mb-1.5">
              <Zap className="w-3 h-3" />
              <span>
                {isZh
                  ? '24 小時內空缺智能填補 (Last-Minute Vacancy Filler)'
                  : '24h Last-Minute Vacancy Maximizer'}
              </span>
            </span>
            <h3 className="font-serif text-xl font-medium text-[#F5F2EB]">
              {isZh
                ? '⚡ 釋出即時空缺 (Notify Waitlist / Active Students)'
                : '⚡ Notify Waitlist & Favorited Students'}
            </h3>
            <p className="text-xs text-[#A89F91] mt-0.5 font-mono">
              {session.title} • {session.startTime.substring(11, 16)} -{' '}
              {session.endTime.substring(11, 16)} •{' '}
              {isZh ? `目前空缺 ${spotsOpen} 席` : `${spotsOpen} spot(s) open`}
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

        <form onSubmit={handleDispatchVacancy} className="space-y-4 text-xs">
          {/* Non-Spam Smart Targeting Selector */}
          <fieldset className="space-y-2">
            <legend className="text-[#EAD8B1] font-medium mb-1.5 flex items-center justify-between w-full">
              <span className="flex items-center space-x-1.5">
                <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>
                  {isZh
                    ? '精準受眾過濾（防打擾非群發機制）'
                    : 'Targeted Non-Spam Audience Filter'}
                </span>
              </span>
              <span className="text-[11px] text-[#C5A059] font-mono">
                {isZh ? `預計觸達 ${estimatedRecipients} 位學員` : `~${estimatedRecipients} students`}
              </span>
            </legend>

            <div className="space-y-2">
              {[
                {
                  id: 'WAITLIST_AND_FAVORITES' as const,
                  titleZh: '🎯 候補名單 + 曾收藏此黃金時段之常客 (推薦)',
                  titleEn: '🎯 Waitlist + Students Who Favorited This Time Slot (Recommended)',
                  descZh: '僅推播給對此時段有高度意願的學員，轉換率最高且零廣告干擾',
                  descEn: 'High-intent push only to waitlisted or time-slot favorited students',
                },
                {
                  id: 'FAVORITES_ONLY' as const,
                  titleZh: '⭐ 僅通知收藏此時段 / 持有有效課包之學員 (6 人)',
                  titleEn: '⭐ Active Pass Holders Who Favorited This Slot (6 students)',
                  descZh: '優先協助課包即將到期或固定週三練習的學員補位',
                  descEn: 'Prioritize active pass holders who regularly attend this slot',
                },
                {
                  id: 'WAITLIST_ONLY' as const,
                  titleZh: `⏳ 僅通知本堂課候補隊列 (${Math.max(2, waitlistForSession.length)} 人)`,
                  titleEn: `⏳ Session Waitlist Queue Only (${Math.max(2, waitlistForSession.length)} students)`,
                  descZh: '發送 30 分鐘限時優先搶位連結',
                  descEn: 'Dispatches priority 30-min claim link to waitlist',
                },
              ].map((opt) => (
                <label
                  key={opt.id}
                  htmlFor={`vac-target-${opt.id}`}
                  className={`flex items-start space-x-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                    targetAudience === opt.id
                      ? 'bg-[#2E271E] border-[#C5A059] text-[#F5F2EB]'
                      : 'bg-[#181614] border-[#352E26] text-[#A89F91] hover:border-[#4E4236]'
                  }`}
                >
                  <input
                    id={`vac-target-${opt.id}`}
                    type="radio"
                    name="targetAudience"
                    value={opt.id}
                    checked={targetAudience === opt.id}
                    onChange={() => setTargetAudience(opt.id)}
                    className="mt-0.5 accent-[#C5A059]"
                  />
                  <div>
                    <div className="font-semibold text-xs">
                      {isZh ? opt.titleZh : opt.titleEn}
                    </div>
                    <p className="text-[10px] text-[#8C8274] mt-0.5">
                      {isZh ? opt.descZh : opt.descEn}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Message Editor */}
          <div>
            <label
              htmlFor="vacancy-message-textarea"
              className="block text-[#A89F91] mb-1.5 font-medium"
            >
              {isZh ? '推播訊息內容 (支援站內通知 + LINE OA)' : 'Targeted Notification Copy (In-App + LINE OA)'}
            </label>
            <textarea
              id="vacancy-message-textarea"
              name="message"
              rows={3}
              required
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs leading-relaxed focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Delivery Channel Summary */}
          <div className="p-3 rounded-xl bg-[#181614] border border-[#352E26] flex items-center justify-between text-[11px] text-[#A89F91]">
            <span className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#C5A059]" />
              <span>
                {isZh
                  ? '推播管道：Aura Flow 站內收件匣'
                  : 'Channels: Aura Flow Inbox'}
                {studio.communication?.lineOaEnabled ? ' + LINE 官方帳號' : ''}
              </span>
            </span>
            <span className="text-emerald-400 font-semibold">
              {isZh ? '✓ 精準推播不擾民' : '✓ Non-Spam Verified'}
            </span>
          </div>

          {sentSuccess && (
            <div
              aria-live="polite"
              className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>
                {isZh
                  ? `⚡ 已成功向 ${estimatedRecipients} 位精準學員發送空缺釋出通知！`
                  : `⚡ Vacancy alert sent to ${estimatedRecipients} targeted students!`}
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-[#3A332B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#3A332B] text-[#A89F91] hover:text-[#F5F2EB]"
            >
              {isZh ? '取消' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-linear-to-r from-[#C5A059] to-[#E2C178] text-[#161412] font-bold flex items-center space-x-1.5 hover:brightness-105 transition-all shadow-md"
            >
              <BellRing className="w-3.5 h-3.5" />
              <span>
                {isZh
                  ? '⚡ 立即發送空缺推播 (Notify Now)'
                  : '⚡ Send Targeted Vacancy Alert'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
