import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { ClassSession } from '../types/aura';
import { formatCurrency, formatTimeRange } from '../i18n/auraI18n';
import {
  ClipboardList,
  Sparkles,
  CheckCircle2,
  Clock,
  MessageCircle,
  X,
  Calendar,
  MapPin,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface SessionCareCardProps {
  session: ClassSession;
  defaultPhase?: 'AUTO' | 'PRE_CLASS' | 'POST_CLASS';
}

export const SessionCareCard: React.FC<SessionCareCardProps> = ({
  session,
  defaultPhase = 'PRE_CLASS',
}) => {
  const { locale, markSessionHomeworkDone, addBodyJournalEntry } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  // Determine initial phase from currentTime vs classStartTime / classEndTime, with interactive toggle for easy testing
  const computeInitialPhase = (): 'PRE_CLASS' | 'POST_CLASS' => {
    if (defaultPhase === 'PRE_CLASS' || defaultPhase === 'POST_CLASS') {
      return defaultPhase;
    }
    const now = Date.now();
    const endMs = Date.parse(session.endTime);
    if (!Number.isNaN(endMs) && now > endMs) {
      return 'POST_CLASS';
    }
    return 'PRE_CLASS';
  };

  const [phase, setPhase] = useState<'PRE_CLASS' | 'POST_CLASS'>(computeInitialPhase);
  const [localDone, setLocalDone] = useState(Boolean(session.homeworkCompleted));

  const isDone = localDone || Boolean(session.homeworkCompleted);

  const preNote =
    session.preClassNote ||
    (isZh
      ? '請自備乾淨防滑襪與水壺，建議於開課前 10 分鐘抵達教室暖身並調整呼吸節奏。'
      : 'Please bring grip socks and a water bottle. Arrive 10 minutes before class to warm up.');

  const postHomework =
    session.postClassHomework ||
    (isZh
      ? '課後請補充 300ml 溫開水，睡前進行 3 分鐘貓牛式呼吸與深層臀腿伸展，幫助筋膜恢復。'
      : 'Drink 300ml of warm water after class and do 3 minutes of Cat-Cow breathwork & hip stretches tonight.');

  const handleMarkHomeworkDone = () => {
    if (isDone) return;
    setLocalDone(true);
    markSessionHomeworkDone(session.id);
    addBodyJournalEntry({
      sessionTitle: session.title,
      instructorName: session.instructor,
      feelingTag: isZh ? '🌿 已完成課後拉伸作業' : '🌿 Completed Post-Class Stretches',
      note: isZh
        ? `完成教練課後放鬆作業：${postHomework}`
        : `Completed coach post-class homework: ${postHomework}`,
      energyLevel: 5,
    });
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#7D8D7B', '#C5A059', '#B86B53'],
    });
  };

  return (
    <div className="rounded-2xl border border-stone-200/90 bg-[#FBF9F5] p-4 text-left shadow-2xs space-y-3">
      {/* Phase Header + Interactive Time-State Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-1.5">
          {phase === 'PRE_CLASS' ? (
            <>
              <ClipboardList className="w-4 h-4 text-aura-clay shrink-0" />
              <span className="text-xs font-bold text-stone-900">
                {isZh ? '📋 授課教練課前提醒' : '📋 Instructor Pre-Class Prep Note'}
              </span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="text-xs font-bold text-emerald-950">
                {isZh ? '🌿 課後放鬆作業與叮嚀' : '🌿 Post-Class Care & Homework'}
              </span>
            </>
          )}
        </div>

        {/* Time-phase switch pills so user can test both currentTime < classStartTime and currentTime > classEndTime */}
        <div className="inline-flex items-center rounded-full bg-stone-200/75 p-0.5 text-[10px] font-medium">
          <button
            type="button"
            onClick={() => setPhase('PRE_CLASS')}
            className={`px-2 py-0.5 rounded-full transition-all ${
              phase === 'PRE_CLASS'
                ? 'bg-white text-stone-900 shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isZh ? '課前 (Before)' : 'Pre-Class'}
          </button>
          <button
            type="button"
            onClick={() => setPhase('POST_CLASS')}
            className={`px-2 py-0.5 rounded-full transition-all ${
              phase === 'POST_CLASS'
                ? 'bg-emerald-700 text-white shadow-2xs font-semibold'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            {isZh ? '課後 (After)' : 'Post-Class'}
          </button>
        </div>
      </div>

      {phase === 'PRE_CLASS' ? (
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-xs text-stone-800 leading-relaxed">
            {preNote}
          </div>
          <div className="flex items-center justify-between text-[10px] text-stone-500">
            <span className="flex items-center space-x-1">
              <Clock className="w-3 h-3 text-aura-clay" />
              <span>
                {isZh
                  ? '開課前 2 小時已自動推播提醒'
                  : 'Auto-dispatched 2 hours prior to class start'}
              </span>
            </span>
            <span className="font-medium text-stone-700">{session.instructor}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2.5">
          <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed">
            {postHomework}
          </div>

          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[10px] text-stone-500">
              {isZh
                ? '下課後 1 小時自動發送 • 完成將同步紀錄至運動歷程'
                : 'Auto-sent 1h after class • Logs to your Movement Journey'}
            </span>

            <button
              type="button"
              onClick={handleMarkHomeworkDone}
              disabled={isDone}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all shrink-0 ${
                isDone
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs active:scale-95'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>
                {isDone
                  ? isZh
                    ? '✓ 今日已完成拉伸 (Done!)'
                    : '✓ Stretches Completed!'
                  : isZh
                  ? '[ ✓ 今日已完成拉伸 (Mark as Done) ]'
                  : '[ ✓ Mark as Done ]'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

interface StudentClassDetailModalProps {
  session: ClassSession | null;
  onClose: () => void;
}

export const StudentClassDetailModal: React.FC<StudentClassDetailModalProps> = ({
  session,
  onClose,
}) => {
  const { locale, currency, studio, openBookingDrawer, openStudentChat } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  if (!session) return null;

  const spotsLeft = Math.max(0, session.capacity - session.bookedCount);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#F7F4EE] rounded-3xl p-6 border border-stone-200 w-full max-w-md text-stone-900 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-stone-200/80 pb-3">
          <div>
            <span className="inline-block px-2.5 py-0.5 rounded-full bg-stone-200/80 text-stone-700 text-[10px] font-semibold mb-1">
              {session.category} • {session.level}
            </span>
            <h3 className="font-serif text-xl font-medium text-stone-900">{session.title}</h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              {formatTimeRange(session.startTime, session.endTime, locale)}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-full bg-stone-200/70 flex items-center justify-center text-stone-600 hover:bg-stone-300 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Instructor & Studio Info */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white border border-stone-200/70">
          <div className="flex items-center space-x-3">
            <img
              src={session.instructorAvatar}
              alt={session.instructor}
              className="w-10 h-10 rounded-full object-cover border border-stone-200"
            />
            <div>
              <div className="text-xs font-semibold text-stone-900">{session.instructor}</div>
              <div className="text-[11px] text-stone-500 flex items-center space-x-1 mt-0.5">
                <MapPin className="w-3 h-3 text-aura-clay" />
                <span>
                  {studio.name} • {session.roomName}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm font-bold text-stone-900 font-mono">
              {formatCurrency(session.price, currency, locale)}
            </div>
            <div className="text-[10px] text-aura-clay font-medium">
              {isZh ? `剩餘 ${spotsLeft} 席` : `${spotsLeft} spots left`}
            </div>
          </div>
        </div>

        {/* Dedicated Pre-Class Reminder & Post-Class Homework Card */}
        <SessionCareCard session={session} defaultPhase="PRE_CLASS" />

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              openStudentChat(session.id, session.title);
            }}
            className="flex-1 py-2.5 px-3 rounded-2xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-800 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5 text-aura-clay" />
            <span>{isZh ? '💬 聯絡授課教練' : '💬 Message Instructor'}</span>
          </button>

          {spotsLeft > 0 && (
            <button
              type="button"
              onClick={() => {
                onClose();
                openBookingDrawer(session);
              }}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-aura-clay hover:bg-[#A25A44] text-white text-xs font-semibold flex items-center justify-center space-x-1.5 transition-colors shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>{isZh ? '立即預約此課程' : 'Book Session'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
