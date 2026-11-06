import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import {
  Pin,
  Sparkles,
  PlayCircle,
  BookmarkCheck,
  Pencil,
  Check,
  Image as ImageIcon,
} from 'lucide-react';

interface CoachStudioFeedProps {
  isCoachMode?: boolean;
}

export const CoachStudioFeed: React.FC<CoachStudioFeedProps> = ({
  isCoachMode = false,
}) => {
  const {
    locale,
    studio,
    userPass,
    boundStudioSlug,
    favoriteStudioSlugs,
    updateWeeklyTip,
    addBodyJournalEntry,
  } = useAuraStore();

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const tip = studio.weeklyTip || {
    id: 'tip-default',
    studioId: studio.id,
    coachName: studio.coachName || 'Elena Rostova',
    coachAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    title: isZh
      ? '本週動作指引：器械核心骨盆中立位與課後胸椎延展'
      : 'Weekly Form Tip: Neutral Pelvis on Reformer & Post-Class Thoracic Stretch',
    content: isZh
      ? '練習 Reformer 腿部推蹬 (Footwork) 時，請專注將肋骨下緣輕柔收回、維持骨盆水平中立，避免下背拱起代償。課後建議搭配 3 分鐘貓牛式呼吸與胸椎旋轉伸展，能有效釋放整週久坐的肩頸緊繃！'
      : 'During Reformer Footwork, draw your lower ribs gently in and maintain a neutral pelvis without overarching your lumbar spine. Pair with 3 minutes of thoracic rotation stretches after class.',
    mediaUrl:
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=700&auto=format&fit=crop&q=80',
    mediaType: 'IMAGE' as const,
    focusTag: isZh ? '核心控制 & 課後伸展' : 'Core Form & Recovery',
    pinnedAt: '2026-11-02T08:00:00.000Z',
  };

  const [isEditing, setIsEditing] = useState(false);
  const [titleInput, setTitleInput] = useState(tip.title);
  const [focusTagInput, setFocusTagInput] = useState(tip.focusTag);
  const [contentInput, setContentInput] = useState(tip.content);
  const [mediaUrlInput, setMediaUrlInput] = useState(tip.mediaUrl || '');
  const [savedBookmark, setSavedBookmark] = useState(false);
  const [pinnedToast, setPinnedToast] = useState(false);

  const isEligibleStudent =
    isCoachMode ||
    (userPass && userPass.creditsLeft > 0) ||
    boundStudioSlug === studio.slug ||
    (favoriteStudioSlugs && favoriteStudioSlugs.includes(studio.slug));

  const handleSavePinnedTip = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput.trim() || !contentInput.trim()) return;
    updateWeeklyTip({
      title: titleInput.trim(),
      focusTag: focusTagInput.trim() || (isZh ? '課後提醒' : 'Form Tip'),
      content: contentInput.trim(),
      mediaUrl: mediaUrlInput.trim() || undefined,
      coachName: studio.coachName || 'Elena Rostova',
    });
    setIsEditing(false);
    setPinnedToast(true);
    setTimeout(() => setPinnedToast(false), 2500);
  };

  const handleBookmarkToJournal = () => {
    addBodyJournalEntry({
      sessionTitle: tip.title,
      instructorName: tip.coachName,
      feelingTag: '📌 教練本週動作指引筆記',
      note: tip.content,
      energyLevel: 5,
    });
    setSavedBookmark(true);
    setTimeout(() => setSavedBookmark(false), 2500);
  };

  if (isCoachMode) {
    return (
      <div className="mb-6 rounded-2xl bg-[#221E1A] border border-[#3A332B] p-5 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-[#2E271E] border border-[#C5A059]/40 flex items-center justify-center text-[#C5A059]">
              <Pin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-sm font-semibold text-[#F5F2EB]">
                  {isZh
                    ? '本週動作指引 / 課後提醒 (Weekly Form Tip & Stretches)'
                    : 'Pinned Weekly Form Tip & Post-Class Stretches'}
                </h4>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 font-semibold">
                  {isZh ? '已置頂於學員首頁' : 'Pinned on Student Feed'}
                </span>
              </div>
              <p className="text-[11px] text-[#8C8274]">
                {isZh
                  ? '課包會員與已綁定您的學員打開課表即可閱讀本週練習重點與居家伸展提醒'
                  : 'Visible to active pass holders and students who favorited your studio'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditing(!isEditing)}
            className="px-3.5 py-1.5 rounded-full bg-[#2E2822] hover:bg-[#3A322A] border border-[#4A4035] text-xs font-medium text-[#EAD8B1] flex items-center space-x-1.5 shrink-0 self-start sm:self-auto"
          >
            <Pencil className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{isEditing ? (isZh ? '收合編輯' : 'Close') : isZh ? '編輯本週指引' : 'Edit Weekly Tip'}</span>
          </button>
        </div>

        {pinnedToast && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs flex items-center space-x-1.5">
            <Check className="w-4 h-4" />
            <span>
              {isZh
                ? '✓ 已更新並置頂本週動作指引！學員端已即時同步。'
                : '✓ Weekly Form Tip updated & pinned to student feed!'}
            </span>
          </div>
        )}

        {isEditing ? (
          <form onSubmit={handleSavePinnedTip} className="space-y-3 pt-2 border-t border-[#302B24] text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label htmlFor="tip-title-input" className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '本週指引標題 (Tip Title)' : 'Weekly Tip Title'}
                </label>
                <input
                  id="tip-title-input"
                  name="tipTitle"
                  type="text"
                  required
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
              <div>
                <label htmlFor="tip-tag-input" className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '主題標籤 (Focus Tag)' : 'Focus Tag'}
                </label>
                <input
                  id="tip-tag-input"
                  name="tipTag"
                  type="text"
                  value={focusTagInput}
                  onChange={(e) => setFocusTagInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>

            <div>
              <label htmlFor="tip-content-input" className="block text-[#A89F91] mb-1 font-medium">
                {isZh ? '動作要領與課後伸展說明 (Form & Stretch Notes)' : 'Form Guidance & Stretch Instructions'}
              </label>
              <textarea
                id="tip-content-input"
                name="tipContent"
                rows={3}
                required
                value={contentInput}
                onChange={(e) => setContentInput(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div>
              <label htmlFor="tip-media-input" className="block text-[#A89F91] mb-1 font-medium flex items-center space-x-1">
                <ImageIcon className="w-3.5 h-3.5 text-[#C5A059]" />
                <span>{isZh ? '示範圖片或短片連結 (選填 Image / Video URL)' : 'Image or Video URL (Optional)'}</span>
              </label>
              <input
                id="tip-media-input"
                name="tipMediaUrl"
                type="url"
                value={mediaUrlInput}
                onChange={(e) => setMediaUrlInput(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono focus:outline-none focus:border-[#C5A059]"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 rounded-full border border-[#3A332B] text-[#A89F91]"
              >
                {isZh ? '取消' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-1.5 rounded-full bg-[#C5A059] text-[#161412] font-semibold hover:bg-[#D4AF37]"
              >
                {isZh ? '📌 儲存並置頂發布' : '📌 Pin to Student Feed'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-3.5 rounded-xl bg-[#181614] border border-[#352E26] flex flex-col sm:flex-row gap-3.5 items-start">
            {tip.mediaUrl && (
              <img
                src={tip.mediaUrl}
                alt={tip.title}
                className="w-full sm:w-28 h-24 rounded-xl object-cover border border-[#3A332B] shrink-0"
              />
            )}
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#2E2822] text-[#C5A059] border border-[#423930]">
                  {tip.focusTag}
                </span>
                <span className="text-[11px] text-[#8C8274]">by {tip.coachName}</span>
              </div>
              <div className="text-xs font-semibold text-[#F5F2EB]">{tip.title}</div>
              <p className="text-xs text-[#A89F91] mt-1 leading-relaxed">{tip.content}</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Student-Facing Pinned Weekly Form Tip Card
  return (
    <div className="mb-6 rounded-3xl bg-white border border-amber-200/90 shadow-xs overflow-hidden">
      <div className="bg-linear-to-r from-[#2D2620] to-[#1F1A16] px-4 py-2.5 text-[#F5F2EB] flex items-center justify-between">
        <div className="flex items-center space-x-1.5 text-[11px] font-semibold text-[#EAD8B1]">
          <Pin className="w-3.5 h-3.5 text-[#C5A059]" />
          <span>
            {isZh
              ? '本週動作指引 / 課後提醒 (Weekly Form Tip & Stretches)'
              : 'Weekly Form Tip & Post-Class Stretches'}
          </span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#EAD8B1] border border-[#C5A059]/40">
          {tip.focusTag}
        </span>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-center space-x-2.5">
          <img
            src={tip.coachAvatar}
            alt={tip.coachName}
            className="w-8 h-8 rounded-full object-cover border border-stone-200"
          />
          <div>
            <div className="text-xs font-semibold text-stone-900">{tip.title}</div>
            <div className="text-[10px] text-stone-500">
              {isZh
                ? `${tip.coachName} 主理教練置頂分享 • 課包學員與收藏會員專屬`
                : `Pinned by Coach ${tip.coachName} • For Pass Holders & Bound Students`}
            </div>
          </div>
        </div>

        {isEligibleStudent ? (
          <>
            <p className="text-xs text-stone-700 leading-relaxed">{tip.content}</p>

            {tip.mediaUrl && (
              <div className="relative rounded-2xl overflow-hidden border border-stone-200/80 h-36">
                <img
                  src={tip.mediaUrl}
                  alt={tip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-2 right-2 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[10px] flex items-center space-x-1">
                  <PlayCircle className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>{isZh ? '居家課後延展示範' : 'Stretch Guide'}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] text-stone-400 flex items-center space-x-1">
                <Sparkles className="w-3 h-3 text-aura-clay" />
                <span>
                  {isZh ? '課後溫和伸展有助減少延遲性痠痛' : 'Gentle recovery improves mobility'}
                </span>
              </span>

              <button
                type="button"
                onClick={handleBookmarkToJournal}
                className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-stone-100 hover:bg-amber-50 text-stone-700 hover:text-amber-900 border border-stone-200 text-[11px] font-medium transition-colors"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-aura-clay" />
                <span>
                  {savedBookmark
                    ? isZh
                      ? '✓ 已存入身體筆記'
                      : '✓ Saved to Journal'
                    : isZh
                    ? '存入課後身體筆記'
                    : 'Save to Body Journal'}
                </span>
              </button>
            </div>
          </>
        ) : (
          <div className="p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
            {isZh
              ? '🔒 綁定此教練或持有有效課包即可解鎖本週完整動作指引與居家伸展教學。'
              : '🔒 Bind this coach or hold an active pass to unlock the full weekly form tip.'}
          </div>
        )}
      </div>
    </div>
  );
};
