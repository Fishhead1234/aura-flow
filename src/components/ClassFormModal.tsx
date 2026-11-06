import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation } from '../i18n/auraI18n';
import {
  ClassCategory,
  ClassVisibility,
  PrivateCapacityPreset,
  InvitedStudentEntry,
  CURRENCY_CONFIGS,
} from '../types/aura';
import { Globe, Lock, Users, KeyRound, UserPlus, Check } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ROSTER_CANDIDATES = [
  {
    id: 'usr-maya-student',
    name: 'Maya Lin',
    email: 'maya@example.com',
    phone: '+886 912-345-678',
  },
  {
    id: 'usr-lucas-student',
    name: 'Lucas Chen (陳立安)',
    email: 'lucas.chen@example.com',
    phone: '+886 928-888-123',
  },
  {
    id: 'usr-sophia-student',
    name: 'Sophia Wang',
    email: 'sophia.w@example.com',
    phone: '+886 933-777-999',
  },
  {
    id: 'usr-selina-student',
    name: 'Selina Chen',
    email: 'selina@example.com',
    phone: '+1 (555) 443-8991',
  },
  {
    id: 'usr-david-student',
    name: 'David Lin',
    email: 'david.lin@example.com',
    phone: '+1 (555) 902-1144',
  },
];

export const ClassFormModal: React.FC<ClassFormModalProps> = ({ isOpen, onClose }) => {
  const { locale, currency, studio, addSession } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  const tCommon = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'common', key, params);
  const tAdmin = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'admin', key, params);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ClassCategory>('Reformer');
  const [instructor, setInstructor] = useState(
    studio.coachName || (studio.name ? `${studio.name.split(' ')[0]} Coach` : 'Elena Rostova')
  );
  const [roomName, setRoomName] = useState('Reformer Studio A');
  const [visibility, setVisibility] = useState<ClassVisibility>('PUBLIC');
  const [privatePreset, setPrivatePreset] = useState<PrivateCapacityPreset>('1_ON_1');
  const [capacity, setCapacity] = useState<number>(8);
  const [price, setPrice] = useState<number>(currency === 'TWD' ? 800 : 28);
  const [pinCode, setPinCode] = useState('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(['usr-maya-student']);
  const [customStudentName, setCustomStudentName] = useState('');
  const [customStudentEmail, setCustomStudentEmail] = useState('');
  const [customStudents, setCustomStudents] = useState<
    { id: string; name: string; email: string; phone?: string }[]
  >([]);

  if (!isOpen) return null;

  const handleVisibilityChange = (nextVis: ClassVisibility) => {
    setVisibility(nextVis);
    if (nextVis === 'PRIVATE') {
      setCategory(isZh ? '私人教練' : 'Private 1-on-1');
      setRoomName(isZh ? 'VIP 專屬私教包廂' : 'VIP Private Suite');
      if (privatePreset === '1_ON_1') setCapacity(1);
      else if (privatePreset === '1_ON_2') setCapacity(2);
      else setCapacity(4);
      setPrice(currency === 'TWD' ? 2200 : 85);
    } else {
      setCapacity(8);
      setPrice(currency === 'TWD' ? 800 : 28);
    }
  };

  const handlePresetChange = (preset: PrivateCapacityPreset) => {
    setPrivatePreset(preset);
    if (preset === '1_ON_1') setCapacity(1);
    else if (preset === '1_ON_2') setCapacity(2);
    else setCapacity(4);
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddCustomStudent = () => {
    if (!customStudentName.trim()) return;
    const newId = `usr-custom-${Date.now()}`;
    const newEntry = {
      id: newId,
      name: customStudentName.trim(),
      email:
        customStudentEmail.trim() ||
        `${customStudentName.trim().toLowerCase().replace(/\s+/g, '.')}@vip.client`,
    };
    setCustomStudents((prev) => [...prev, newEntry]);
    setSelectedStudentIds((prev) => [...prev, newId]);
    setCustomStudentName('');
    setCustomStudentEmail('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const allCandidates = [...ROSTER_CANDIDATES, ...customStudents];
    const invitedStudents: InvitedStudentEntry[] =
      visibility === 'PRIVATE'
        ? allCandidates
            .filter((c) => selectedStudentIds.includes(c.id))
            .map((c) => ({
              id: c.id,
              name: c.name,
              email: c.email,
              phone: c.phone,
              status: 'AWAITING',
            }))
        : [];

    const cleanPin = pinCode.replace(/\D/g, '').slice(0, 4);

    addSession({
      title: title.trim(),
      category,
      instructor: instructor.trim(),
      instructorAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      startTime: '2026-11-06T14:00:00.000Z',
      endTime: '2026-11-06T15:00:00.000Z',
      durationMins: 60,
      capacity,
      price,
      roomName: roomName.trim(),
      level: 'All Levels',
      visibility,
      privatePreset: visibility === 'PRIVATE' ? privatePreset : undefined,
      pinCode: visibility === 'PRIVATE' && cleanPin.length === 4 ? cleanPin : undefined,
      invitedStudents: visibility === 'PRIVATE' ? invitedStudents : undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#221E1A] rounded-3xl p-6 border border-[#3A332B] w-full max-w-xl text-[#F5F2EB] shadow-2xl my-8 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 border-b border-[#3A332B] pb-3">
          <div>
            <h3 className="font-serif text-xl font-medium text-[#C5A059]">
              {tAdmin('createClass')}
            </h3>
            <p className="text-[11px] text-[#8C8274] mt-0.5">
              {isZh
                ? '支援公開團體課表或隱藏式 VIP 受邀私教包班'
                : 'Configure a public group session or an invite-only VIP private class'}
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

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* 1. Segmented Visibility Selector (Radio group inside fieldset per modern-web-guidance) */}
          <fieldset className="space-y-2">
            <legend className="block text-[#A89F91] font-medium mb-1.5">
              {isZh ? '課堂曝光與預約權限 (Visibility Settings)' : 'Class Visibility Settings'}
            </legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <label
                htmlFor="vis-public"
                className={`flex items-start space-x-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  visibility === 'PUBLIC'
                    ? 'bg-[#2E2822] border-[#C5A059] text-[#F5F2EB] shadow-sm'
                    : 'bg-[#181614] border-[#3A332B] text-[#A89F91] hover:border-[#574B3E]'
                }`}
              >
                <input
                  id="vis-public"
                  type="radio"
                  name="visibility"
                  value="PUBLIC"
                  checked={visibility === 'PUBLIC'}
                  onChange={() => handleVisibilityChange('PUBLIC')}
                  className="mt-0.5 accent-[#C5A059]"
                />
                <div>
                  <div className="font-semibold text-xs flex items-center space-x-1.5">
                    <Globe className="w-3.5 h-3.5 text-emerald-400" />
                    <span>{isZh ? '🌐 公開課表 (Public)' : '🌐 Public Schedule'}</span>
                  </div>
                  <p className="text-[10px] text-[#8C8274] mt-0.5 leading-snug">
                    {isZh
                      ? '顯示於工作室公開課表，所有學員皆可自由預約'
                      : 'Visible on your public studio schedule for all students'}
                  </p>
                </div>
              </label>

              <label
                htmlFor="vis-private"
                className={`flex items-start space-x-2.5 p-3 rounded-2xl border cursor-pointer transition-all ${
                  visibility === 'PRIVATE'
                    ? 'bg-amber-950/40 border-[#C5A059] text-[#F5F2EB] shadow-sm'
                    : 'bg-[#181614] border-[#3A332B] text-[#A89F91] hover:border-[#574B3E]'
                }`}
              >
                <input
                  id="vis-private"
                  type="radio"
                  name="visibility"
                  value="PRIVATE"
                  checked={visibility === 'PRIVATE'}
                  onChange={() => handleVisibilityChange('PRIVATE')}
                  className="mt-0.5 accent-[#C5A059]"
                />
                <div>
                  <div className="font-semibold text-xs flex items-center space-x-1.5 text-amber-300">
                    <Lock className="w-3.5 h-3.5 text-[#C5A059]" />
                    <span>
                      {isZh
                        ? '🔒 專屬私教 / 受邀制 (Private / Invite-Only)'
                        : '🔒 Private / Invite-Only'}
                    </span>
                  </div>
                  <p className="text-[10px] text-[#A89F91] mt-0.5 leading-snug">
                    {isZh
                      ? '於公開課表隱藏，僅限持有 VIP 邀請連結之指定學員預約'
                      : 'Hidden from public schedule; accessible only via VIP link'}
                  </p>
                </div>
              </label>
            </div>
          </fieldset>

          {/* Class Title */}
          <div>
            <label htmlFor="class-title-input" className="block text-[#A89F91] mb-1 font-medium">
              {tAdmin('className')}
            </label>
            <input
              id="class-title-input"
              name="title"
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                visibility === 'PRIVATE'
                  ? isZh
                    ? '例如：Maya 專屬 1對1 器械皮拉提體態評估'
                    : 'e.g. 1-on-1 Bespoke Reformer Session'
                  : tAdmin('classNamePlaceholder')
              }
              className="w-full px-3 py-2.5 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
            />
          </div>

          {/* Flexible Class Category */}
          <div>
            <label htmlFor="class-category-input" className="block text-[#A89F91] mb-1 font-medium">
              {tAdmin('category')}
            </label>
            <input
              id="class-category-input"
              name="category"
              type="text"
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder={tAdmin('categoryCustomPlaceholder')}
              className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
            />
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] text-[#706658] mr-1">{tAdmin('suggestedTagsLabel')}</span>
              {[
                '私人教練',
                '1對1皮拉提',
                '雙人包班',
                '企業包班',
                '皮拉提',
                '瑜珈',
                '頌缽音療',
                'Reformer',
              ].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setCategory(tag)}
                  className={`text-[10px] px-2.5 py-0.5 rounded-full border transition-colors ${
                    category === tag
                      ? 'bg-[#C5A059] text-[#161412] font-semibold border-[#C5A059]'
                      : 'bg-[#1E1B18] text-[#A89F91] border-[#3A332B] hover:text-[#F5F2EB]'
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Private / Invite-Only Dedicated Settings Panel */}
          {visibility === 'PRIVATE' && (
            <div className="p-4 rounded-2xl bg-linear-to-br from-[#2B231A] to-[#1D1915] border border-[#C5A059]/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#EAD8B1] flex items-center space-x-1.5">
                  <span>👑</span>
                  <span>
                    {isZh
                      ? '專屬私教包班設定 (VIP Private Configuration)'
                      : 'VIP Private Session Configuration'}
                  </span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C5A059]/20 text-[#C5A059] border border-[#C5A059]/40 font-semibold">
                  {isZh ? '公開課表已隱藏' : 'Hidden from Public'}
                </span>
              </div>

              {/* Configurable Capacity Presets (1-on-1, 1-on-2, Small Group 3-6) */}
              <fieldset>
                <legend className="block text-[11px] text-[#E0C99E] mb-1.5 font-medium flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>
                    {isZh ? '包班人數規格 (Private Session Size)' : 'Private Session Capacity Preset'}
                  </span>
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    {
                      id: '1_ON_1' as PrivateCapacityPreset,
                      labelZh: '1-on-1 單人私教',
                      labelEn: '1-on-1 Private',
                      subZh: '1 席專屬名額',
                      subEn: '1 Exclusive Spot',
                    },
                    {
                      id: '1_ON_2' as PrivateCapacityPreset,
                      labelZh: '1-on-2 雙人包班',
                      labelEn: '1-on-2 Duet',
                      subZh: '2 席好友/伴侶',
                      subEn: '2 Spots (Duet)',
                    },
                    {
                      id: 'SMALL_GROUP' as PrivateCapacityPreset,
                      labelZh: '3-6人 小班包班',
                      labelEn: 'Small Group (3-6)',
                      subZh: '3–6 席私人小班',
                      subEn: '3–6 Private Group',
                    },
                  ].map((preset) => (
                    <label
                      key={preset.id}
                      htmlFor={`preset-${preset.id}`}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition-all ${
                        privatePreset === preset.id
                          ? 'bg-[#C5A059] text-[#161412] border-[#C5A059] font-semibold'
                          : 'bg-[#181614] text-[#E0D8CE] border-[#3A332B] hover:border-[#C5A059]/60'
                      }`}
                    >
                      <input
                        id={`preset-${preset.id}`}
                        type="radio"
                        name="privatePreset"
                        value={preset.id}
                        checked={privatePreset === preset.id}
                        onChange={() => handlePresetChange(preset.id)}
                        className="sr-only"
                      />
                      <div className="text-xs">{isZh ? preset.labelZh : preset.labelEn}</div>
                      <div
                        className={`text-[10px] mt-0.5 ${
                          privatePreset === preset.id ? 'text-[#161412]/80' : 'text-[#8C8274]'
                        }`}
                      >
                        {isZh ? preset.subZh : preset.subEn}
                      </div>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* Optional 4-Digit PIN Code Input */}
              <div>
                <label
                  htmlFor="vip-pin-code"
                  className="block text-[11px] text-[#E0C99E] mb-1 font-medium flex items-center space-x-1.5"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#C5A059]" />
                  <span>
                    {isZh
                      ? '4 位數預約通行 PIN 碼 (選填，保護私教連結)'
                      : '4-Digit Access PIN Code (Optional)'}
                  </span>
                </label>
                <input
                  id="vip-pin-code"
                  name="pinCode"
                  type="text"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck={false}
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder={
                    isZh ? '例如：8829 (留空則免輸入密碼)' : 'e.g. 8829 (Leave blank for no PIN)'
                  }
                  className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] font-mono tracking-widest text-xs focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Pre-Select Invited Student(s) from Studio Roster */}
              <div>
                <label className="block text-[11px] text-[#E0C99E] mb-1.5 font-medium">
                  {isZh
                    ? '指定受邀學員並預留名額 (Select Student(s) from Roster)'
                    : 'Pre-Reserve Spot for Roster Student(s)'}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
                  {[...ROSTER_CANDIDATES, ...customStudents].map((stu) => {
                    const isChecked = selectedStudentIds.includes(stu.id);
                    return (
                      <button
                        key={stu.id}
                        type="button"
                        onClick={() => toggleStudentSelection(stu.id)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border text-left transition-all ${
                          isChecked
                            ? 'bg-[#382E22] border-[#C5A059] text-[#F5F2EB]'
                            : 'bg-[#181614] border-[#352E26] text-[#A89F91] hover:border-[#574B3E]'
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="text-xs font-medium truncate">{stu.name}</div>
                          <div className="text-[10px] text-[#8C8274] truncate">{stu.email}</div>
                        </div>
                        <span
                          className={`w-4 h-4 rounded-md flex items-center justify-center shrink-0 border ${
                            isChecked
                              ? 'bg-[#C5A059] border-[#C5A059] text-[#161412]'
                              : 'border-[#4A4035]'
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 stroke-[2.5]" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Quick Add Custom VIP Student */}
                <div className="mt-2.5 flex flex-col sm:flex-row gap-1.5">
                  <input
                    type="text"
                    value={customStudentName}
                    onChange={(e) => setCustomStudentName(e.target.value)}
                    placeholder={isZh ? '+ 新增受邀學員姓名' : '+ Add student name'}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                  />
                  <input
                    type="email"
                    value={customStudentEmail}
                    onChange={(e) => setCustomStudentEmail(e.target.value)}
                    placeholder={isZh ? '學員 Email (選填)' : 'Student Email (Optional)'}
                    className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#181614] border border-[#3A332B] text-xs text-[#F5F2EB] focus:outline-none focus:border-[#C5A059]"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomStudent}
                    className="px-3 py-1.5 rounded-lg bg-[#2E2822] hover:bg-[#3A322A] border border-[#4A4035] text-[#C5A059] text-xs font-semibold flex items-center justify-center space-x-1 shrink-0"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>{isZh ? '加入名單' : 'Add'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="class-instructor-input" className="block text-[#A89F91] mb-1 font-medium">
                {tAdmin('instructor')}
              </label>
              <input
                id="class-instructor-input"
                name="instructor"
                type="text"
                required
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label htmlFor="class-room-input" className="block text-[#A89F91] mb-1 font-medium">
                {tAdmin('room')}
              </label>
              <input
                id="class-room-input"
                name="roomName"
                type="text"
                required
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="class-capacity-input" className="block text-[#A89F91] mb-1 font-medium">
                {tAdmin('hardCapacity')}
              </label>
              <input
                id="class-capacity-input"
                name="capacity"
                type="number"
                min="1"
                step="1"
                required
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
              />
            </div>
            <div>
              <label htmlFor="class-price-input" className="block text-[#A89F91] mb-1 font-medium">
                {tAdmin('price')} ({CURRENCY_CONFIGS[currency].symbol})
              </label>
              <input
                id="class-price-input"
                name="price"
                type="number"
                min="0"
                step="any"
                required
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-sm focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-[#3A332B]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full border border-[#3A332B] text-[#A89F91] hover:text-[#F5F2EB]"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-full bg-[#C5A059] text-[#161412] font-semibold hover:bg-[#D4AF37] transition-all"
            >
              {visibility === 'PRIVATE'
                ? isZh
                  ? '建立專屬私教課並產生邀請連結'
                  : 'Create VIP Session & Link'
                : tAdmin('saveSession')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
