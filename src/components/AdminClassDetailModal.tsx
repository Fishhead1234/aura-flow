import React, { useState, useEffect } from 'react';
import { useAuraStore } from '../store/auraStore';
import { ClassSession, LocationType } from '../types/aura';
import {
  Zap,
  Users,
  BellRing,
  CheckCircle2,
  Sparkles,
  Megaphone,
  ClipboardList,
  QrCode,
  Edit3,
  Calendar,
  Trash2,
  AlertTriangle,
  MapPin,
  Building,
  Home,
  Trees,
} from 'lucide-react';
import { QRShareModal, QRSharePayload } from './QRShareModal';

export type AdminClassModalMode = 'EDIT' | 'RESCHEDULE' | 'CANCEL' | 'ROSTER_OVERRIDE' | 'VACANCY';

interface AdminClassDetailModalProps {
  session: ClassSession | null;
  initialMode?: AdminClassModalMode;
  onClose: () => void;
}

export const AdminClassDetailModal: React.FC<AdminClassDetailModalProps> = ({
  session,
  initialMode = 'EDIT',
  onClose,
}) => {
  const {
    locale,
    studio,
    currency,
    waitlist,
    notifyLastMinuteVacancy,
    updateSessionNotes,
    broadcastToRoster,
    editSession,
    rescheduleSession,
    cancelSession,
  } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const [activeMode, setActiveMode] = useState<AdminClassModalMode>(initialMode);

  // EDIT MODE STATE
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCapacity, setEditCapacity] = useState<number>(8);
  const [editPrice, setEditPrice] = useState<number>(28);
  const [editInstructor, setEditInstructor] = useState('');
  const [editRoomName, setEditRoomName] = useState('');
  const [editLocationType, setEditLocationType] = useState<LocationType>('STUDIO');
  const [editAddress, setEditAddress] = useState('');
  const [editPreNote, setEditPreNote] = useState('');
  const [editPostNote, setEditPostNote] = useState('');
  const [editSuccessToast, setEditSuccessToast] = useState(false);

  // RESCHEDULE MODE STATE
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleStartTime, setRescheduleStartTime] = useState('');
  const [rescheduleEndTime, setRescheduleEndTime] = useState('');
  const [rescheduleSuccessToast, setRescheduleSuccessToast] = useState(false);

  // CANCEL MODE STATE
  const [cancelReasonInput, setCancelReasonInput] = useState('');
  const [cancelSuccessToast, setCancelSuccessToast] = useState(false);

  // VACANCY & ROSTER OVERRIDE STATES
  const [targetAudience, setTargetAudience] = useState<
    'WAITLIST_AND_FAVORITES' | 'FAVORITES_ONLY' | 'WAITLIST_ONLY'
  >('WAITLIST_AND_FAVORITES');
  const [vacancyMessage, setVacancyMessage] = useState('');
  const [vacancySentSuccess, setVacancySentSuccess] = useState(false);
  const [adHocSupplementNote, setAdHocSupplementNote] = useState('');
  const [overrideSentSuccess, setOverrideSentSuccess] = useState(false);

  // QR Modal
  const [qrPayload, setQrPayload] = useState<QRSharePayload | null>(null);

  useEffect(() => {
    setActiveMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!session) return;

    // Populate edit fields
    setEditTitle(session.title || '');
    setEditCategory(session.category || 'Reformer');
    setEditCapacity(session.capacity || 8);
    setEditPrice(session.price || 0);
    setEditInstructor(session.instructor || '');
    setEditRoomName(session.roomName || 'Main Studio');
    setEditLocationType(session.locationType || 'STUDIO');
    setEditAddress(session.address || '');
    setEditPreNote(session.preClassNote || '');
    setEditPostNote(session.postClassHomework || '');

    // Populate reschedule fields
    const sessionDate = session.startTime ? session.startTime.substring(0, 10) : '2026-11-04';
    const startTimeStr = session.startTime ? session.startTime.substring(11, 16) : '09:00';
    const endTimeStr = session.endTime ? session.endTime.substring(11, 16) : '10:00';
    setRescheduleDate(sessionDate);
    setRescheduleStartTime(startTimeStr);
    setRescheduleEndTime(endTimeStr);

    // Populate vacancy message
    const spots = Math.max(1, session.capacity - session.bookedCount);
    const timeRange = `${startTimeStr} - ${endTimeStr}`;
    setVacancyMessage(
      isZh
        ? `✨ 剛剛釋出 ${spots} 席名額！您收藏的「${session.title} (${timeRange})」目前有即時空缺，可直接一鍵扣點預約，額滿即止 🌿`
        : `✨ ${spots} last-minute spot(s) just opened for "${session.title} (${timeRange})"! Since you favorited this time slot, you get priority 1-click booking.`
    );

    // Populate ad-hoc note
    setAdHocSupplementNote(
      isZh
        ? `【臨時補充叮嚀】今日「${session.title}」因氣候微涼，教室已調高恆溫空調，請學員攜帶保暖外套於課後穿戴，並準時入場！`
        : `[Ad-Hoc Class Note] For today's "${session.title}", please bring a light jacket for post-class cool-down and arrive 5 mins early!`
    );

    setEditSuccessToast(false);
    setRescheduleSuccessToast(false);
    setCancelSuccessToast(false);
    setVacancySentSuccess(false);
    setOverrideSentSuccess(false);
  }, [session, isZh]);

  if (!session) return null;

  const waitlistForSession = waitlist.filter((w) => w.sessionId === session.id);
  const watchersCount = Math.max(3, waitlistForSession.length + 2);

  // 1. Handle Edit Save
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTitle.trim()) return;

    editSession(session.id, {
      title: editTitle.trim(),
      category: editCategory.trim(),
      capacity: Math.max(1, Number(editCapacity) || 1),
      price: Math.max(0, Number(editPrice) || 0),
      instructor: editInstructor.trim() || session.instructor,
      roomName: editRoomName.trim() || 'Studio A',
      locationType: editLocationType,
      address: editAddress.trim(),
      preClassNote: editPreNote.trim() || undefined,
      postClassHomework: editPostNote.trim() || undefined,
    });

    setEditSuccessToast(true);
    setTimeout(() => {
      setEditSuccessToast(false);
      onClose();
    }, 1200);
  };

  // 2. Handle Reschedule
  const handleConfirmReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rescheduleDate || !rescheduleStartTime || !rescheduleEndTime) return;

    const newStartIso = `${rescheduleDate}T${rescheduleStartTime}:00.000Z`;
    const newEndIso = `${rescheduleDate}T${rescheduleEndTime}:00.000Z`;

    rescheduleSession(session.id, newStartIso, newEndIso, true);
    setRescheduleSuccessToast(true);
    setTimeout(() => {
      setRescheduleSuccessToast(false);
      onClose();
    }, 1500);
  };

  // 3. Handle Cancel Class
  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    cancelSession(session.id, cancelReasonInput.trim());
    setCancelSuccessToast(true);
    setTimeout(() => {
      setCancelSuccessToast(false);
      onClose();
    }, 1500);
  };

  // 4. Handle Vacancy Dispatch
  const handleDispatchVacancy = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vacancyMessage.trim()) return;
    notifyLastMinuteVacancy(session.id, targetAudience, vacancyMessage.trim());
    setVacancySentSuccess(true);
    setTimeout(() => {
      setVacancySentSuccess(false);
      onClose();
    }, 1500);
  };

  // 5. Handle Roster Override Broadcast
  const handleDispatchRosterOverride = (e: React.FormEvent) => {
    e.preventDefault();
    updateSessionNotes(session.id, editPreNote, editPostNote);
    if (adHocSupplementNote.trim()) {
      broadcastToRoster(session.id, adHocSupplementNote.trim(), ['IN_APP', 'LINE_OA']);
    }
    setOverrideSentSuccess(true);
    setTimeout(() => {
      setOverrideSentSuccess(false);
      onClose();
    }, 1500);
  };

  const handleOpenQR = () => {
    const originUrl =
      typeof window !== 'undefined' ? window.location.origin : 'https://auraflow-bay.vercel.app';
    const isPrivate = session.visibility === 'PRIVATE';
    const token = session.inviteToken || `vip-${session.id}`;
    const directUrl = isPrivate
      ? `${originUrl}/vip/${token}`
      : `${originUrl}/studio/${studio.slug}?class=${session.id}`;
    setQrPayload({
      title: session.title,
      subtitle: `${studio.name} • ${session.roomName}`,
      dateTimeText: `${session.startTime.substring(0, 10)} • ${session.startTime.substring(11, 16)} - ${session.endTime.substring(11, 16)}`,
      coachName: session.instructor,
      url: directUrl,
      badgeText: isPrivate
        ? isZh
          ? '👑 VIP 受邀私教專屬 QR Code'
          : '👑 VIP Private Session QR'
        : isZh
        ? '📷 單堂課程預約 QR Code'
        : 'Class Booking QR',
      fileNamePrefix: `class-${session.id}-qr`,
    });
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#C5A059]/60 w-full max-w-xl text-[#F5F2EB] shadow-2xl max-h-[92vh] overflow-y-auto">
          {/* Header & Tabs */}
          <div className="border-b border-[#3A332B] pb-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="font-serif text-lg font-bold text-[#EAD8B1] truncate max-w-sm">
                    {session.title}
                  </h3>
                  {session.status === 'CANCELLED' && (
                    <span className="px-2 py-0.5 rounded-full bg-red-950/80 border border-red-700/80 text-red-300 text-[10px] font-bold">
                      {isZh ? '已取消' : 'Cancelled'}
                    </span>
                  )}
                  {session.status === 'RESCHEDULED' && (
                    <span className="px-2 py-0.5 rounded-full bg-amber-950/80 border border-amber-600/80 text-amber-300 text-[10px] font-bold">
                      {isZh ? '已改期' : 'Rescheduled'}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#8C8274] mt-0.5 font-mono">
                  {session.startTime.substring(0, 10)} • {session.startTime.substring(11, 16)} -{' '}
                  {session.endTime.substring(11, 16)} • {session.bookedCount}/{session.capacity}{' '}
                  {isZh ? '已報名' : 'Booked'}
                </p>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={handleOpenQR}
                  title={isZh ? '查看課程 QR Code' : 'Class QR Code'}
                  className="p-2 rounded-xl bg-[#181614] hover:bg-[#2A241E] border border-[#C5A059]/40 text-[#C5A059] transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-2 rounded-xl text-[#8C8274] hover:text-white transition-colors text-base font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                type="button"
                onClick={() => setActiveMode('EDIT')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1 transition-all shrink-0 ${
                  activeMode === 'EDIT'
                    ? 'bg-[#C5A059] text-[#161412] shadow-xs'
                    : 'bg-[#181614] text-[#A89F91] hover:text-white border border-[#3A332B]'
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isZh ? '✏️ 編輯課程' : 'Edit Class'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('RESCHEDULE')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1 transition-all shrink-0 ${
                  activeMode === 'RESCHEDULE'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-[#181614] text-[#A89F91] hover:text-white border border-[#3A332B]'
                }`}
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>{isZh ? '⏰ 調整時間 / 改期' : 'Reschedule'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('CANCEL')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1 transition-all shrink-0 ${
                  activeMode === 'CANCEL'
                    ? 'bg-red-800 text-white shadow-xs'
                    : 'bg-[#181614] text-red-400 hover:text-red-300 border border-[#3A332B]'
                }`}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isZh ? '🗑️ 取消課程' : 'Cancel Session'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('ROSTER_OVERRIDE')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1 transition-all shrink-0 ${
                  activeMode === 'ROSTER_OVERRIDE'
                    ? 'bg-[#3A3022] text-[#EAD8B1] border border-[#C5A059]'
                    : 'bg-[#181614] text-[#A89F91] hover:text-white border border-[#3A332B]'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>{isZh ? '📢 叮嚀推播' : 'Roster Broadcast'}</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveMode('VACANCY')}
                className={`px-3 py-1.5 rounded-xl font-semibold flex items-center space-x-1 transition-all shrink-0 ${
                  activeMode === 'VACANCY'
                    ? 'bg-amber-500/30 text-amber-200 border border-amber-500/60'
                    : 'bg-[#181614] text-[#A89F91] hover:text-white border border-[#3A332B]'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                <span>{isZh ? '⚡ 釋出空缺' : 'Vacancy Filler'}</span>
              </button>
            </div>
          </div>

          {/* TAB 1: EDIT CLASS */}
          {activeMode === 'EDIT' && (
            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '課程名稱 (Class Title)' : 'Class Title'}
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">
                    {isZh ? '分類 (Category)' : 'Category'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">
                    {isZh ? '授課教練 (Instructor)' : 'Instructor'}
                  </label>
                  <input
                    type="text"
                    required
                    value={editInstructor}
                    onChange={(e) => setEditInstructor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {/* Dynamic Location Type Selector */}
              <div>
                <label className="block text-[#A89F91] mb-1.5 font-medium">
                  {isZh ? '場地類型 (Location Type)' : 'Location Type'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
                  {[
                    { id: 'STUDIO' as LocationType, labelZh: '🏢 合作場館', labelEn: '🏢 Studio' },
                    { id: 'CUSTOM' as LocationType, labelZh: '📍 自訂地址', labelEn: '📍 Custom' },
                    { id: 'CLIENT_HOME' as LocationType, labelZh: '🏡 到府指導', labelEn: '🏡 Home' },
                    { id: 'OUTDOOR' as LocationType, labelZh: '🌳 戶外/其他', labelEn: '🌳 Outdoor' },
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => setEditLocationType(loc.id)}
                      className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                        editLocationType === loc.id
                          ? 'bg-[#C5A059] text-[#161412] border-[#C5A059]'
                          : 'bg-[#181614] text-[#A89F91] border-[#3A332B] hover:text-white'
                      }`}
                    >
                      {isZh ? loc.labelZh : loc.labelEn}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      value={editRoomName}
                      onChange={(e) => setEditRoomName(e.target.value)}
                      placeholder={isZh ? '教室名稱 (如 Studio A)' : 'Room Name'}
                      className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editAddress}
                      onChange={(e) => setEditAddress(e.target.value)}
                      placeholder={isZh ? '詳細地址 (如 台北市信義路四段88號)' : 'Street Address'}
                      className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">
                    {isZh ? '人數上限 (Capacity)' : 'Capacity Cap'}
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    required
                    value={editCapacity}
                    onChange={(e) => setEditCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">
                    {isZh ? `體驗單價 (${currency})` : `Price (${currency})`}
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '課前叮嚀 (Pre-Class Note)' : 'Pre-Class Note'}
                </label>
                <textarea
                  rows={2}
                  value={editPreNote}
                  onChange={(e) => setEditPreNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '課後作業與放鬆 (Post-Class Homework)' : 'Post-Class Homework'}
                </label>
                <textarea
                  rows={2}
                  value={editPostNote}
                  onChange={(e) => setEditPostNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>

              {editSuccessToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-center font-medium animate-in fade-in">
                  {isZh ? '✓ 課程資訊已成功更新！' : '✓ Class details updated successfully!'}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#A89F91] hover:text-white"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] font-semibold shadow-md transition-all"
                >
                  {isZh ? '💾 儲存課程更新' : 'Save Changes'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: RESCHEDULE */}
          {activeMode === 'RESCHEDULE' && (
            <form onSubmit={handleConfirmReschedule} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-amber-300">
                      {isZh ? '改期確認與學員推播通知' : 'Reschedule Confirmation & Alerts'}
                    </div>
                    <p className="text-[11px] text-amber-200/90 mt-1 leading-relaxed">
                      {isZh
                        ? `檢測到此課程有 ${session.bookedCount} 位學員已報名、${watchersCount} 位學員已加入收藏。確認改期後系統將自動發送改期通知給所有相關學員。`
                        : `Detected ${session.bookedCount} booked student(s) and ${watchersCount} wishlist watcher(s). Confirming will automatically broadcast a reschedule alert to all affected students.`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '調整日期 (New Date)' : 'New Date'}
                </label>
                <input
                  type="date"
                  required
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">
                    {isZh ? '開課時間 (Start Time)' : 'Start Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleStartTime}
                    onChange={(e) => setRescheduleStartTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
                <div>
                  <label className="block text-[#A89F91] mb-1 font-medium">
                    {isZh ? '下課時間 (End Time)' : 'End Time'}
                  </label>
                  <input
                    type="time"
                    required
                    value={rescheduleEndTime}
                    onChange={(e) => setRescheduleEndTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059]"
                  />
                </div>
              </div>

              {rescheduleSuccessToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-center font-medium animate-in fade-in">
                  {isZh
                    ? '✓ 課程時間已調整，並已向學員發送改期通知！'
                    : '✓ Reschedule confirmed and notification dispatched!'}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#A89F91] hover:text-white"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{isZh ? '確認改期並發送通知' : 'Confirm Reschedule'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: CANCEL SESSION */}
          {activeMode === 'CANCEL' && (
            <form onSubmit={handleConfirmCancel} className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-red-950/50 border border-red-700/60 text-red-200">
                <div className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-red-300 text-sm">
                      {isZh ? '確定取消此堂課程？' : 'Cancel this session?'}
                    </div>
                    <p className="text-[11px] text-red-200/90 mt-1 leading-relaxed">
                      {isZh
                        ? `系統將自動退回 ${session.bookedCount} 位已報名學員的課包堂數/款項，並發送取消通知至學員 App 與 LINE 官方帳號。`
                        : `The system will automatically refund passes/credits to ${session.bookedCount} booked student(s) and broadcast a cancellation alert via App & LINE.`}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '取消原因 (選填，將顯示於學員推播)' : 'Cancellation Reason (Optional)'}
                </label>
                <input
                  type="text"
                  value={cancelReasonInput}
                  onChange={(e) => setCancelReasonInput(e.target.value)}
                  placeholder={
                    isZh
                      ? '例如：教練身體不適、教室設備緊急保養...'
                      : 'e.g. Instructor health emergency / studio maintenance...'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-red-500"
                />
              </div>

              {cancelSuccessToast && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-center font-medium animate-in fade-in">
                  {isZh
                    ? '✓ 課程已取消，學員堂數已全額退回並發送通知！'
                    : '✓ Session cancelled, passes refunded, and alerts sent!'}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#A89F91] hover:text-white"
                >
                  {isZh ? '返回' : 'Back'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-700 hover:bg-red-800 text-white font-semibold shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isZh ? '確定取消課程並退款' : 'Confirm Cancel & Refund'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: ROSTER OVERRIDE */}
          {activeMode === 'ROSTER_OVERRIDE' && (
            <form onSubmit={handleDispatchRosterOverride} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-[#2A231A] border border-[#C5A059]/40 text-[#EAD8B1]">
                <div className="flex items-center space-x-2 mb-1">
                  <Megaphone className="w-4 h-4 text-[#C5A059]" />
                  <span className="font-semibold text-xs text-[#C5A059]">
                    {isZh ? '臨時補充課堂提醒推播' : 'Ad-Hoc Class Note Override'}
                  </span>
                </div>
                <p className="text-[11px] text-[#A89F91]">
                  {isZh
                    ? '即時更新課堂叮嚀，並發送推播通知給已報名學員（如著裝更正、天氣提醒）。'
                    : 'Dispatches real-time notes to enrolled students via In-App and LINE OA.'}
                </p>
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '補充叮嚀內容 (Broadcast Message)' : 'Broadcast Message'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={adHocSupplementNote}
                  onChange={(e) => setAdHocSupplementNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-[#C5A059] resize-none"
                />
              </div>

              {overrideSentSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-center font-medium animate-in fade-in">
                  {isZh ? '✓ 叮嚀推播已成功發送！' : '✓ Broadcast sent to roster!'}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#A89F91] hover:text-white"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-[#161412] font-semibold shadow-md transition-all"
                >
                  {isZh ? '立即發送叮嚀推播' : 'Send Broadcast'}
                </button>
              </div>
            </form>
          )}

          {/* TAB 5: VACANCY */}
          {activeMode === 'VACANCY' && (
            <form onSubmit={handleDispatchVacancy} className="space-y-4 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-600/50 text-amber-200">
                <div className="flex items-center space-x-2 mb-1">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold text-xs text-amber-300">
                    {isZh ? '釋出即時空缺推播' : 'Notify Waitlist & Favorites'}
                  </span>
                </div>
                <p className="text-[11px] text-amber-200/90">
                  {isZh
                    ? `目前尚有 ${Math.max(1, session.capacity - session.bookedCount)} 席空缺，可一鍵推播給候補或收藏學員。`
                    : `${Math.max(1, session.capacity - session.bookedCount)} spot(s) remaining. Target priority students.`}
                </p>
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1.5 font-medium">
                  {isZh ? '推播受眾 (Target Audience)' : 'Target Audience'}
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'WAITLIST_AND_FAVORITES', labelZh: '候補 + 收藏學員', labelEn: 'All Priority' },
                    { id: 'FAVORITES_ONLY', labelZh: '僅限收藏學員', labelEn: 'Favorites Only' },
                    { id: 'WAITLIST_ONLY', labelZh: '僅限候補學員', labelEn: 'Waitlist Only' },
                  ].map((aud) => (
                    <button
                      key={aud.id}
                      type="button"
                      onClick={() => setTargetAudience(aud.id as any)}
                      className={`py-2 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                        targetAudience === aud.id
                          ? 'bg-amber-500/30 text-amber-200 border-amber-500/80'
                          : 'bg-[#181614] text-[#A89F91] border-[#3A332B] hover:text-white'
                      }`}
                    >
                      {isZh ? aud.labelZh : aud.labelEn}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#A89F91] mb-1 font-medium">
                  {isZh ? '推播訊息內容' : 'Notification Message'}
                </label>
                <textarea
                  rows={3}
                  required
                  value={vacancyMessage}
                  onChange={(e) => setVacancyMessage(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-white focus:outline-none focus:border-amber-400 resize-none"
                />
              </div>

              {vacancySentSuccess && (
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/60 text-emerald-300 text-center font-medium animate-in fade-in">
                  {isZh ? '✓ 空缺推播已成功發送！' : '✓ Vacancy alert dispatched!'}
                </div>
              )}

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#A89F91] hover:text-white"
                >
                  {isZh ? '取消' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-[#161412] font-semibold shadow-md transition-all"
                >
                  {isZh ? '發送即時空缺推播' : 'Send Vacancy Alert'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      {qrPayload && <QRShareModal payload={qrPayload} onClose={() => setQrPayload(null)} />}
    </>
  );
};
