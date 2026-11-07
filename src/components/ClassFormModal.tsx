import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation } from '../i18n/auraI18n';
import {
  ClassCategory,
  ClassVisibility,
  PrivateCapacityPreset,
  InvitedStudentEntry,
  LocationType,
  CURRENCY_CONFIGS,
} from '../types/aura';
import { Globe, Lock, Users, KeyRound, UserPlus, Check, ChevronDown, ClipboardList } from 'lucide-react';

interface ClassFormModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CLASS_NOTES_PRESETS = [
  {
    id: 'pilates_core',
    chipZh: '[ 🧘 皮拉提斯防滑襪與核心 ]',
    chipEn: '[ 🧘 Pilates Grip Socks & Core ]',
    preZh:
      '請自備乾淨防滑五趾襪與溫水壺，建議提早 10 分鐘抵達暖身。今日將加強深層核心橫膈膜呼吸與骨盆穩定控制！',
    preEn:
      'Please bring clean grip socks and a water bottle. Arrive 10 mins early to warm up; today we focus on deep core breathwork and pelvic stability.',
    postZh:
      '課後請補充 300ml 溫水，並於睡前進行 3 分鐘「貓牛式呼吸」與「鴿式臀部拉伸」，釋放下背與髖關節張力。',
    postEn:
      'Drink 300ml of warm water after class and practice 3 minutes of Cat-Cow breathwork & Pigeon hip stretch before bed.',
  },
  {
    id: 'yoga_sound',
    chipZh: '[ 🌿 瑜珈音療與心靈放鬆 ]',
    chipEn: '[ 🌿 Yoga Sound Bath & Mindfulness ]',
    preZh:
      '教室已備妥高磅數瑜珈墊、抱枕與精油眼枕，請穿著寬鬆保暖衣物，並於入場後將手機調至靜音模式。',
    preEn:
      'Heavyweight mats, bolsters, and aromatherapy eye pillows are provided. Wear cozy layered clothing and silence your phone upon entry.',
    postZh:
      '音療與深層伸展後請多飲用溫開水幫助代謝循環，今晚減少螢幕藍光刺激，延續課堂平靜的睡眠品質。',
    postEn:
      'Sip warm water to support lymphatic circulation and minimize screen time tonight to preserve deep restorative sleep.',
  },
  {
    id: 'strength_protein',
    chipZh: '[ 🔥 肌力體能與高蛋白補充 ]',
    chipEn: '[ 🔥 Strength & Protein Recovery ]',
    preZh:
      '請穿著包覆性佳之運動服裝與攜帶擦汗毛巾，課前 1 小時可補充適量碳水化合物以維持高強度肌力表現。',
    preEn:
      'Wear supportive athletic attire and bring a sweat towel. Have a light carb snack 1 hour prior for optimal strength output.',
    postZh:
      '課後黃金 30 分鐘內建議補充 20g 優質蛋白質（如無糖豆漿或乳清蛋白），並針對臀腿肌群進行滾筒筋膜放鬆。',
    postEn:
      'Refuel with 20g of clean protein within 30 minutes after class and foam-roll your glutes and hamstrings for 90 seconds.',
  },
  {
    id: 'vip_bespoke',
    chipZh: '[ 👑 私教專屬體態關懷 ]',
    chipEn: '[ 👑 Bespoke VIP Posture Care ]',
    preZh:
      '專屬私教課前叮嚀：請穿著貼身舒適運動服以便進行精準骨盆與脊柱體態評估，若有近期緊繃部位請於課前告知教練。',
    preEn:
      'VIP Private Prep: Wear form-fitting activewear for precision posture & spinal alignment assessment. Let your coach know of any tight areas.',
    postZh:
      '私教課後專屬作業：每日早晚練習「靠牆天使 (Wall Angels)」10 次與「死蟲式 (Deadbug)」核心啟動 2 組，維持體態正位記憶。',
    postEn:
      'VIP Post-Class Homework: Complete 10 Wall Angels and 2 sets of Deadbug core activation morning and evening to lock in postural alignment.',
  },
];

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
  const [locationType, setLocationType] = useState<LocationType>('STUDIO');
  const [address, setAddress] = useState('');
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
  const [activeNotePresetId, setActiveNotePresetId] = useState<string>('pilates_core');
  const [preClassNote, setPreClassNote] = useState<string>(
    isZh ? CLASS_NOTES_PRESETS[0].preZh : CLASS_NOTES_PRESETS[0].preEn
  );
  const [postClassHomework, setPostClassHomework] = useState<string>(
    isZh ? CLASS_NOTES_PRESETS[0].postZh : CLASS_NOTES_PRESETS[0].postEn
  );

  if (!isOpen) return null;

  const handleApplyNotePreset = (preset: (typeof CLASS_NOTES_PRESETS)[number]) => {
    setActiveNotePresetId(preset.id);
    setPreClassNote(isZh ? preset.preZh : preset.preEn);
    setPostClassHomework(isZh ? preset.postZh : preset.postEn);
  };

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
      locationType,
      address: address.trim(),
      level: 'All Levels',
      visibility,
      privatePreset: visibility === 'PRIVATE' ? privatePreset : undefined,
      pinCode: visibility === 'PRIVATE' && cleanPin.length === 4 ? cleanPin : undefined,
      invitedStudents: visibility === 'PRIVATE' ? invitedStudents : undefined,
      preClassNote: preClassNote.trim() || undefined,
      postClassHomework: postClassHomework.trim() || undefined,
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
                placeholder="e.g. Studio A"
                className="w-full px-3 py-2 rounded-xl bg-[#181614] border border-[#3A332B] text-[#F5F2EB] text-xs focus:outline-none focus:border-[#C5A059]"
              />
            </div>
          </div>

          {/* Dynamic Location Type Selector */}
          <div>
            <label className="block text-[#A89F91] mb-1.5 font-medium">
              {isZh ? '場地地點類型 (Location Type)' : 'Location Type'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2">
              {[
                { id: 'STUDIO' as LocationType, labelZh: '🏢 合作工作室', labelEn: '🏢 Studio' },
                { id: 'CUSTOM' as LocationType, labelZh: '📍 自訂地址', labelEn: '📍 Custom' },
                { id: 'CLIENT_HOME' as LocationType, labelZh: '🏡 到府指導', labelEn: '🏡 Home' },
                { id: 'OUTDOOR' as LocationType, labelZh: '🌳 戶外/其他', labelEn: '🌳 Outdoor' },
              ].map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => setLocationType(loc.id)}
                  className={`py-1.5 px-2 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                    locationType === loc.id
                      ? 'bg-[#C5A059] text-[#161412] border-[#C5A059]'
                      : 'bg-[#181614] text-[#A89F91] border-[#3A332B] hover:text-white'
                  }`}
                >
                  {isZh ? loc.labelZh : loc.labelEn}
                </button>
              ))}
            </div>

            <div>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={
                  isZh
                    ? '詳細地址（如：台北市大安區信義路四段88號3樓）'
                    : 'Street Address & Room (e.g. 88 Xinyi Rd Sec 4, 3F)'
                }
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

          {/* Collapsible Section: 課堂叮嚀與課後作業 (Class Notes & Homework) using native <details> per search-hidden-content */}
          <details
            open
            className="group rounded-2xl bg-[#1A1714] border border-[#3A332B] overflow-hidden transition-all"
          >
            <summary className="flex items-center justify-between px-4 py-3 cursor-pointer select-none list-none hover:bg-[#24201B] transition-colors">
              <div className="flex items-center space-x-2">
                <ClipboardList className="w-4 h-4 text-[#C5A059]" />
                <span className="text-xs font-semibold text-[#EAD8B1]">
                  {isZh
                    ? '課堂叮嚀與課後作業 (Class Notes & Homework)'
                    : 'Class Notes & Homework (Automated Care)'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 font-medium">
                  {isZh ? '自動推播關懷' : 'Auto-Push'}
                </span>
              </div>
              <ChevronDown className="w-4 h-4 text-[#A89F91] transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="p-4 pt-3 border-t border-[#2E2822] space-y-3.5">
              {/* 1-Tap Preset Chips */}
              <div>
                <span className="block text-[10px] text-[#8C8274] mb-1.5 font-medium">
                  {isZh
                    ? '⚡ 一鍵帶入專業叮嚀範本 (1-Tap Preset Templates)：'
                    : '⚡ 1-Tap Preset Care Templates:'}
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {CLASS_NOTES_PRESETS.map((preset) => {
                    const isSelected = activeNotePresetId === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleApplyNotePreset(preset)}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-medium border transition-all ${
                          isSelected
                            ? 'bg-[#C5A059] text-[#161412] border-[#C5A059] font-semibold shadow-2xs'
                            : 'bg-[#24201C] text-[#E0C99E] border-[#3E352B] hover:border-[#C5A059]/60'
                        }`}
                      >
                        {isZh ? preset.chipZh : preset.chipEn}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field A: 課前叮嚀 (Pre-Class Note) */}
              <div>
                <label
                  htmlFor="pre-class-note-textarea"
                  className="block text-xs font-semibold text-[#F5F2EB] mb-0.5"
                >
                  {isZh ? '📋 課前叮嚀 (Pre-Class Note)' : '📋 Pre-Class Note'}
                </label>
                <p className="text-[10px] text-[#8C8274] mb-1.5">
                  {isZh
                    ? '將於開課前 2 小時自動推播提醒學員（如著裝須知、當日訓練重點）'
                    : 'Automatically pushed to booked students 2 hours before class (attire, focus points)'}
                </p>
                <textarea
                  id="pre-class-note-textarea"
                  name="preClassNote"
                  rows={2}
                  value={preClassNote}
                  onChange={(e) => setPreClassNote(e.target.value)}
                  placeholder={
                    isZh
                      ? '例如：請自備防滑襪與水壺，今日將針對核心穩定與肩胛控制進行深度練習...'
                      : 'e.g. Please wear grip socks and bring water; today focuses on core stability...'
                  }
                  style={
                    {
                      fieldSizing: 'content',
                      minBlockSize: '2.75lh',
                      maxBlockSize: '8lh',
                    } as React.CSSProperties
                  }
                  className="w-full h-auto px-3 py-2 rounded-xl bg-[#141210] border border-[#3A332B] text-[#F5F2EB] text-xs leading-relaxed focus:outline-none focus:border-[#C5A059]"
                />
              </div>

              {/* Field B: 課後伸展與作業 (Post-Class Homework) */}
              <div>
                <label
                  htmlFor="post-class-homework-textarea"
                  className="block text-xs font-semibold text-[#F5F2EB] mb-0.5"
                >
                  {isZh
                    ? '🌿 課後伸展與作業 (Post-Class Homework)'
                    : '🌿 Post-Class Homework & Stretches'}
                </label>
                <p className="text-[10px] text-[#8C8274] mb-1.5">
                  {isZh
                    ? '將於下課後 1 小時自動發送給出席學員（如居家伸展建議、水分補充）'
                    : 'Automatically sent to attending students 1 hour after class (home stretches, hydration)'}
                </p>
                <textarea
                  id="post-class-homework-textarea"
                  name="postClassHomework"
                  rows={2}
                  value={postClassHomework}
                  onChange={(e) => setPostClassHomework(e.target.value)}
                  placeholder={
                    isZh
                      ? '例如：課後請補充 300ml 溫水，睡前進行 3 分鐘貓牛式與鴿式伸展...'
                      : 'e.g. Drink 300ml warm water and do 3 mins of Cat-Cow & Pigeon stretch before sleep...'
                  }
                  style={
                    {
                      fieldSizing: 'content',
                      minBlockSize: '2.75lh',
                      maxBlockSize: '8lh',
                    } as React.CSSProperties
                  }
                  className="w-full h-auto px-3 py-2 rounded-xl bg-[#141210] border border-[#3A332B] text-[#F5F2EB] text-xs leading-relaxed focus:outline-none focus:border-[#C5A059]"
                />
              </div>
            </div>
          </details>

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
