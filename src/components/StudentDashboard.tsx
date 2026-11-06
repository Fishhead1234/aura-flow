import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import {
  Flame,
  Award,
  BookOpen,
  Plus,
  Check,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

const FEELING_TAGS_ZH = [
  '🌿 核心穩定有力',
  '✨ 肩頸徹底釋放',
  '🔥 臀腿微痠充實',
  '🧘 呼吸深層平靜',
];

const FEELING_TAGS_EN = [
  '🌿 Strong Core Control',
  '✨ Shoulders Released',
  '🔥 Good Glute Burn',
  '🧘 Deep Calm Breath',
];

export const StudentDashboard: React.FC = () => {
  const {
    locale,
    studio,
    bookings,
    sessions,
    bodyJournalEntries,
    addBodyJournalEntry,
  } = useAuraStore();

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';
  const tags = isZh ? FEELING_TAGS_ZH : FEELING_TAGS_EN;

  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [selectedSessionTitle, setSelectedSessionTitle] = useState(
    sessions[0]?.title || 'Dynamic Pilates'
  );
  const [selectedFeeling, setSelectedFeeling] = useState(tags[0]);
  const [noteInput, setNoteInput] = useState('');
  const [savedToast, setSavedToast] = useState(false);

  // Completed sessions count (seed base 5 + any confirmed/checked-in bookings + journal entries)
  const completedCount = Math.max(5, bookings.length + 3 + bodyJournalEntries.length - 2);
  const streakWeeks = 4;

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim()) return;

    const matchedSession = sessions.find((s) => s.title === selectedSessionTitle);
    addBodyJournalEntry({
      sessionTitle: selectedSessionTitle,
      instructorName: matchedSession?.instructor || studio.coachName || 'Elena Rostova',
      feelingTag: selectedFeeling,
      note: noteInput.trim(),
      energyLevel: 5,
    });

    setNoteInput('');
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2500);
  };

  return (
    <div className="mb-6 rounded-3xl bg-white border border-stone-200/80 p-5 shadow-xs">
      {/* Header Row: 我的運動歷程 (Movement Journey) + Streak Pill */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-2xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-aura-clay">
            <Flame className="w-4 h-4 fill-aura-clay" />
          </div>
          <div>
            <h2 className="font-serif text-base font-semibold text-stone-900">
              {isZh
                ? '我的運動歷程 (Movement Journey)'
                : 'My Movement Journey (我的運動歷程)'}
            </h2>
            <p className="text-[11px] text-stone-500">
              {isZh
                ? '每一次深呼吸與核心流動都是對身體的溫柔投資'
                : 'Track your weekly consistency & post-class body reflections'}
            </p>
          </div>
        </div>

        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-[11px] font-semibold text-amber-900 shrink-0">
          <span>🔥</span>
          <span>
            {isZh
              ? `連續第 ${streakWeeks} 週身心流動`
              : `${streakWeeks}-Week Active Streak`}
          </span>
        </span>
      </div>

      {/* Weekly Stats Row */}
      <div className="grid grid-cols-3 gap-2.5 mb-4">
        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
          <div className="text-lg font-bold font-mono text-stone-900">
            {completedCount}{' '}
            <span className="text-[11px] font-normal text-stone-500">
              {isZh ? '堂' : 'classes'}
            </span>
          </div>
          <div className="text-[10px] text-stone-500">
            {isZh ? '累積完成課堂' : 'Completed Sessions'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
          <div className="text-lg font-bold font-mono text-aura-clay">
            {streakWeeks}{' '}
            <span className="text-[11px] font-normal text-stone-500">
              {isZh ? '週' : 'wks'}
            </span>
          </div>
          <div className="text-[10px] text-stone-500">
            {isZh ? '活躍週數紀錄' : 'Active Streak'}
          </div>
        </div>

        <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200/60 text-center">
          <div className="text-lg font-bold font-mono text-emerald-700 flex items-center justify-center space-x-1">
            <Award className="w-4 h-4 text-emerald-600" />
            <span>Lv.2</span>
          </div>
          <div className="text-[10px] text-stone-500">
            {isZh ? '5堂里程碑已解鎖' : '5-Class Milestone'}
          </div>
        </div>
      </div>

      {/* Body Journal Section Header & Toggle */}
      <div className="pt-3 border-t border-stone-100">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-stone-800">
            <BookOpen className="w-3.5 h-3.5 text-aura-clay" />
            <span>
              {isZh ? '課後身體筆記 (Body Journal)' : 'Post-Class Body Journal (課後身體筆記)'}
            </span>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-stone-100 text-stone-600 font-mono">
              {bodyJournalEntries.length}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsJournalOpen(!isJournalOpen)}
            className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-aura-clay/10 hover:bg-aura-clay/20 text-aura-clay text-[11px] font-semibold transition-colors"
          >
            <Plus className="w-3 h-3" />
            <span>
              {isJournalOpen
                ? isZh
                  ? '收合筆記'
                  : 'Close'
                : isZh
                ? '撰寫課後感受'
                : 'Log Reflection'}
            </span>
            {isJournalOpen ? (
              <ChevronUp className="w-3 h-3" />
            ) : (
              <ChevronDown className="w-3 h-3" />
            )}
          </button>
        </div>

        {/* Quick Post-Class Reflection Form */}
        {isJournalOpen && (
          <form
            onSubmit={handleSaveJournal}
            className="mb-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-stone-200 space-y-3 text-xs"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label
                  htmlFor="journal-session-select"
                  className="block text-[11px] text-stone-600 mb-1 font-medium"
                >
                  {isZh ? '選擇剛完成的課堂' : 'Attended Session'}
                </label>
                <select
                  id="journal-session-select"
                  name="sessionTitle"
                  value={selectedSessionTitle}
                  onChange={(e) => setSelectedSessionTitle(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs text-stone-800 focus:outline-none focus:border-aura-clay"
                >
                  {sessions.map((s) => (
                    <option key={s.id} value={s.title}>
                      {s.title} ({s.instructor})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="block text-[11px] text-stone-600 mb-1 font-medium">
                  {isZh ? '身體覺察狀態' : 'Body Feeling'}
                </span>
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => setSelectedFeeling(tag)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                        selectedFeeling === tag
                          ? 'bg-aura-clay text-white border-aura-clay font-semibold'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label
                htmlFor="journal-note-textarea"
                className="block text-[11px] text-stone-600 mb-1 font-medium"
              >
                {isZh ? '課後身體筆記與心得' : 'Post-Class Body Reflection'}
              </label>
              <textarea
                id="journal-note-textarea"
                name="note"
                rows={2}
                required
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder={
                  isZh
                    ? '記錄今天的動作突破、核心感受或教練提醒的發力細節...'
                    : 'Record how your spine, core, or breath felt after today’s practice...'
                }
                className="w-full px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-aura-clay"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-1.5 rounded-full bg-aura-clay text-white text-xs font-semibold hover:bg-[#A25A44] transition-all shadow-2xs"
              >
                {isZh ? '儲存身體筆記' : 'Save Reflection'}
              </button>
            </div>
          </form>
        )}

        {savedToast && (
          <div className="mb-2.5 p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-1.5">
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span>
              {isZh
                ? '✓ 已記錄至您的課後身體筆記！'
                : '✓ Saved to your Body Journal!'}
            </span>
          </div>
        )}

        {/* Recent Body Journal Entries Preview */}
        <div className="space-y-2 max-h-44 overflow-y-auto pr-0.5">
          {bodyJournalEntries.slice(0, 3).map((entry) => (
            <div
              key={entry.id}
              className="p-3 rounded-2xl bg-stone-50/90 border border-stone-200/60 text-xs"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="font-semibold text-stone-800 flex items-center space-x-1.5">
                  <span>{entry.sessionTitle}</span>
                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-amber-100/80 text-amber-900 font-medium">
                    {entry.feelingTag}
                  </span>
                </div>
                <span className="text-[10px] text-stone-400 font-mono">
                  {entry.createdAt.substring(0, 10)}
                </span>
              </div>
              <p className="text-stone-600 text-[11px] leading-relaxed">{entry.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
