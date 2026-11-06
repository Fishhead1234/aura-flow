import React, { useState, useEffect } from 'react';
import { useAuraStore } from '../store/auraStore';
import { ClassSession } from '../types/aura';
import {
  Zap,
  Users,
  BellRing,
  CheckCircle2,
  Sparkles,
  Megaphone,
  ClipboardList,
} from 'lucide-react';

interface AdminClassDetailModalProps {
  session: ClassSession | null;
  initialMode?: 'VACANCY' | 'ROSTER_OVERRIDE';
  onClose: () => void;
}

export const AdminClassDetailModal: React.FC<AdminClassDetailModalProps> = ({
  session,
  initialMode = 'VACANCY',
  onClose,
}) => {
  const {
    locale,
    studio,
    waitlist,
    notifyLastMinuteVacancy,
    updateSessionNotes,
    broadcastToRoster,
  } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const [activeMode, setActiveMode] = useState<'VACANCY' | 'ROSTER_OVERRIDE'>(initialMode);
  const [targetAudience, setTargetAudience] = useState<
    'WAITLIST_AND_FAVORITES' | 'FAVORITES_ONLY' | 'WAITLIST_ONLY'
  >('WAITLIST_AND_FAVORITES');
  const [messageText, setMessageText] = useState('');
  const [sentSuccess, setSentSuccess] = useState(false);

  // 1-Click Class Roster Broadcast Override & Notes state
  const [preClassNoteEdit, setPreClassNoteEdit] = useState('');
  const [postClassHomeworkEdit, setPostClassHomeworkEdit] = useState('');
  const [adHocSupplementNote, setAdHocSupplementNote] = useState('');
  const [overrideSentSuccess, setOverrideSentSuccess] = useState(false);

  const spotsOpen = session ? Math.max(1, session.capacity - session.bookedCount) : 1;
  const waitlistForSession = session
    ? waitlist.filter((w) => w.sessionId === session.id)
    : [];

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!session) return;
    const spots = Math.max(1, session.capacity - session.bookedCount);
    const timeRange = `${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`;
    const defaultMsg = isZh
      ? `✨ 剛剛釋出 ${spots} 席名額！您收藏的「${session.title} (${timeRange})」目前有即時空缺，可直接一鍵扣點預約，額滿即止 🌿`
      : `✨ ${spots} last-minute spot(s) just opened for "${session.title} (${timeRange})"! Since you favorited this time slot, you get priority 1-click booking.`;
    setMessageText(defaultMsg);
    setPreClassNoteEdit(
      session.preClassNote ||
        (isZh
          ? '請自備乾淨防滑五趾襪與溫水壺，建議提早 10 分鐘抵達暖身。'
          : 'Please bring grip socks and a water bottle; arrive 10 mins early to warm up.')
    );
    setPostClassHomeworkEdit(
      session.postClassHomework ||
        (isZh
          ? '課後請補充 300ml 溫開水，睡前進行 3 分鐘貓牛式呼吸與臀部伸展。'
          : 'Drink 300ml warm water after class and practice 3 mins of Cat-Cow & hip stretches.')
    );
    setAdHocSupplementNote(
      isZh
        ? `【臨時補充叮嚀】今日「${session.title}」因氣候微涼，教室已調高恆溫空調，請學員攜帶保暖外套於課後穿戴，並準時入場！`
        : `[Ad-Hoc Class Note] For today's "${session.title}", please bring a light jacket for post-class cool-down and arrive 5 mins early!`
    );
    setSentSuccess(false);
    setOverrideSentSuccess(false);
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

  const handleDispatchRosterOverride = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionNotes(session.id, preClassNoteEdit, postClassHomeworkEdit);
    const dispatchBody =
      adHocSupplementNote.trim() || preClassNoteEdit.trim();
    if (dispatchBody) {
      broadcastToRoster(session.id, dispatchBody, ['IN_APP', 'LINE_OA']);
    }
    setOverrideSentSuccess(true);
    setTimeout(() => {
      setOverrideSentSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#C5A059]/60 w-full max-w-lg text-[#F5F2EB] shadow-2xl max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#3A332B] pb-4 mb-4">
          <div>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <button
                type="button"
                onClick={() => setActiveMode('ROSTER_OVERRIDE')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center space-x-1 transition-all border ${
                  activeMode === 'ROSTER_OVERRIDE'
                    ? 'bg-[#C5A059] text-[#161412] border-[#C5A059]'
                    : 'bg-[#181614] text-[#A89F91] border-[#3A332B] hover:text-[#F5F2EB]'
                }`}
              >
                <Megaphone className="w-3 h-3" />
                <span>
                  {isZh
                    ? '[ 📢 臨時補充課堂提醒 ]'
                    : '[ 📢 Ad-Hoc Roster Note Override ]'}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('VACANCY')}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center space-x-1 transition-all border ${
                  activeMode === 'VACANCY'
                    ? 'bg-amber-500/25 text-amber-200 border-[#C5A059]'
                    : 'bg-[#181614] text-[#A89F91] border-[#3A332B] hover:text-[#F5F2EB]'
                }`}
              >
                <Zap className="w-3 h-3" />
                <span>
                  {isZh ? '⚡ 釋出即時空缺' : '⚡ Last-Minute Vacancy'}
                </span>
              </button>
            </div>

            <h3 className="font-serif text-xl font-medium text-[#F5F2EB]">
              {activeMode === 'ROSTER_OVERRIDE'
                ? isZh
                  ? '📢 臨時補充課堂提醒 & 課前/課後叮嚀覆寫'
                  : '📢 1-Click Class Roster Broadcast Override'
                : isZh
                ? '⚡ 釋出即時空缺 (Notify Waitlist / Active Students)'
                : '⚡ Notify Waitlist & Favorited Students'}
            </h3>
            <p className="text-xs text-[#A89F91] mt-0.5 font-mono">
              {session.title} • {session.startTime.substring(11, 16)} -{' '}
              {session.endTime.substring(11, 16)} •{' '}
              {isZh
                ? `已預約 ${session.bookedCount}/${session.capacity} 席`
                : `Booked ${session.bookedCount}/${session.capacity}`}
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

        {activeMode === 'ROSTER_OVERRIDE' ? (
          <form onSubmit={handleDispatchRosterOverride} className="space-y-4 text-xs">
            {/* Ad-Hoc Immediate Broadcast Override */}
            <div>
              <label
                htmlFor="adhoc-override-textarea"
                className="block text-[#EAD8B1] font-semibold mb-1"
              >
                {isZh
                  ? '📢 當日名單即時補充提醒 (一鍵發送給本堂已報名學員)'
                  : '📢 Instant Ad-Hoc Note to Today’s Booked Roster'}
              </label>
              <p className="text-[10px] text-[#8C8274] mb-1.5">
                {isZh
                  ? '若今日教室異動、溫度調整或訓練計畫變更，可立即向本堂課學員推播補充說明'
                  : 'If plans or studio setup change today, instantly push an ad-hoc note to booked students'}
              </p>
              <textarea
                id="adhoc-override-textarea"
                rows={2}
                value={adHocSupplementNote}
                onChange={(e) => setAdHocSupplementNote(e.target.value)}
                style={
                  {
                    fieldSizing: 'content',
                    minBlockSize: '2.75lh',
                    maxBlockSize: '7lh',
                  } as React.CSSProperties
                }
                className="w-full h-auto px-3.5 py-2.5 rounded-2xl bg-[#181614] border border-[#C5A059]/60 text-[#F5F2EB] text-xs leading-relaxed focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            {/* Editable Pre-Class Note & Post-Class Homework on Session Pass */}
            <div className="p-3.5 rounded-2xl bg-[#181614] border border-[#352E26] space-y-3">
              <div className="flex items-center space-x-1.5 text-[#C5A059] font-semibold text-xs">
                <ClipboardList className="w-3.5 h-3.5" />
                <span>
                  {isZh
                    ? '同步更新學員預約憑證上之「課前叮嚀 / 課後作業」'
                    : 'Sync Pre-Class Note & Post-Class Homework on Student Pass'}
                </span>
              </div>

              <div>
                <label
                  htmlFor="override-preclass-note"
                  className="block text-[11px] text-[#A89F91] mb-1"
                >
                  {isZh ? '📋 課前叮嚀 (Pre-Class Note)' : '📋 Pre-Class Note'}
                </label>
                <textarea
                  id="override-preclass-note"
                  rows={2}
                  value={preClassNoteEdit}
                  onChange={(e) => setPreClassNoteEdit(e.target.value)}
                  style={
                    {
                      fieldSizing: 'content',
                      minBlockSize: '2.5lh',
                      maxBlockSize: '6lh',
                    } as React.CSSProperties
                  }
                  className="w-full h-auto px-3 py-2 rounded-xl bg-[#221E1A] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div>
                <label
                  htmlFor="override-postclass-homework"
                  className="block text-[11px] text-[#A89F91] mb-1"
                >
                  {isZh
                    ? '🌿 課後伸展與作業 (Post-Class Homework)'
                    : '🌿 Post-Class Homework'}
                </label>
                <textarea
                  id="override-postclass-homework"
                  rows={2}
                  value={postClassHomeworkEdit}
                  onChange={(e) => setPostClassHomeworkEdit(e.target.value)}
                  style={
                    {
                      fieldSizing: 'content',
                      minBlockSize: '2.5lh',
                      maxBlockSize: '6lh',
                    } as React.CSSProperties
                  }
                  className="w-full h-auto px-3 py-2 rounded-xl bg-[#221E1A] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            {overrideSentSuccess && (
              <div
                aria-live="polite"
                className="p-3 rounded-xl bg-emerald-950/90 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>
                  {isZh
                    ? `📢 已同步更新課堂叮嚀並推播通知本堂 ${Math.max(1, session.bookedCount)} 位已預約學員！`
                    : `📢 Updated session notes & dispatched ad-hoc reminder to ${Math.max(1, session.bookedCount)} booked students!`}
                </span>
              </div>
            )}

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
                className="px-5 py-2.5 rounded-full bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] font-bold flex items-center space-x-1.5 transition-all shadow-md"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>
                  {isZh
                    ? '📢 儲存並立即推播補充提醒'
                    : '📢 Save & Send Ad-Hoc Roster Note'}
                </span>
              </button>
            </div>
          </form>
        ) : (
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
        )}
      </div>
    </div>
  );
};
