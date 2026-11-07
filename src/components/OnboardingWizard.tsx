import React, { useState } from 'react';
import { useAuraStore } from '../store/auraStore';
import {
  SupportedCurrency,
  ClassCategory,
  CURRENCY_CONFIGS,
  ClassVisibility,
  PrivateCapacityPreset,
  LocationType,
  InvitedStudentEntry,
} from '../types/aura';
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Shield,
  Upload,
  Globe,
  Lock,
  Users,
  KeyRound,
  MapPin,
  ClipboardList,
} from 'lucide-react';
import { AuraLeafBadge } from './AuraLeafLogo';

const SUGGESTED_CATEGORIES: string[] = [
  'Reformer',
  'Barre',
  'Flow',
  'Mat Pilates',
  'Sound Bath',
  'Yin Yoga',
  'Aerial / Flight',
  '皮拉提',
  '瑜珈',
  '私人教練',
  '頌缽音療',
  '重訓體能',
];

const ONBOARDING_NOTE_PRESETS = [
  {
    id: 'pilates_core',
    chipZh: '🧘 皮拉提斯防滑襪與核心',
    chipEn: '🧘 Pilates Grip Socks & Core',
    preZh:
      '請自備乾淨防滑五趾襪與溫水壺，建議提早 10 分鐘抵達暖身。今日將加強深層核心呼吸與骨盆穩定控制！',
    preEn:
      'Please bring clean grip socks and a water bottle; arrive 10 mins early for core breathwork and pelvic alignment.',
    postZh:
      '課後請補充 300ml 溫水，並於睡前進行 3 分鐘貓牛式呼吸與臀部伸展，釋放下背張力。',
    postEn:
      'Drink 300ml warm water after class and practice 3 mins of Cat-Cow breathwork before bed.',
  },
  {
    id: 'yoga_sound',
    chipZh: '🌿 瑜珈音療與心靈放鬆',
    chipEn: '🌿 Yoga Sound Bath & Relax',
    preZh:
      '教室已備妥高磅數瑜珈墊與眼枕，請穿著寬鬆保暖衣物，並於入場後將手機調至靜音模式。',
    preEn:
      'Mats and bolsters are provided. Wear cozy clothing and silence your mobile phone upon entry.',
    postZh:
      '音療與深層伸展後請多飲用溫開水幫助循環，今晚減少螢幕藍光，延續課堂平靜睡眠。',
    postEn:
      'Sip warm water to support circulation and minimize screen time tonight for deep restorative sleep.',
  },
  {
    id: 'strength_protein',
    chipZh: '🔥 肌力體能與高蛋白補充',
    chipEn: '🔥 Strength & Protein Recovery',
    preZh:
      '請穿著運動服裝與攜帶擦汗毛巾，課前 1 小時可補充適量碳水化合物以維持肌力表現。',
    preEn:
      'Wear supportive activewear. Have a light carb snack 1 hour prior for optimal output.',
    postZh:
      '課後黃金 30 分鐘內建議補充 20g 優質蛋白質，並針對臀腿肌群進行滾筒筋膜放鬆。',
    postEn:
      'Refuel with 20g clean protein within 30 mins after session and foam-roll tight muscle groups.',
  },
  {
    id: 'vip_bespoke',
    chipZh: '👑 私教專屬體態關懷',
    chipEn: '👑 Bespoke VIP Posture Care',
    preZh:
      '私教課前叮嚀：請穿著貼身運動服以便進行精準骨盆脊柱評估，若有緊繃部位請告知教練。',
    preEn:
      'VIP Prep: Wear form-fitting activewear for precision posture assessment.',
    postZh:
      '私教課後作業：每日早晚練習靠牆天使 10 次與死蟲式核心啟動 2 組，維持體態正位記憶。',
    postEn:
      'VIP Homework: Complete 10 Wall Angels and 2 sets of Deadbug core activation daily.',
  },
];

export const OnboardingWizard: React.FC = () => {
  const { createStudioWithOnboarding, locale } = useAuraStore();
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  // STEP 1 STATE
  const [studioName, setStudioName] = useState('Sol Sanctuary');
  const [studioSlug, setStudioSlug] = useState('sol-sanctuary');
  const [tagline, setTagline] = useState('Mindful Reformer & Dynamic Movement Sanctuary');
  const [logoUrl, setLogoUrl] = useState<string>('');

  // STEP 2 STATE
  const [currency, setCurrency] = useState<SupportedCurrency>('TWD');
  const [cancelHours, setCancelHours] = useState(12);
  const [waitlistMins, setWaitlistMins] = useState(30);

  // STEP 3 STATE
  const [className, setClassName] = useState('Morning Reformer Sculpt');
  const [category, setCategory] = useState<ClassCategory>('Reformer');
  const [visibility, setVisibility] = useState<ClassVisibility>('PUBLIC');
  const [privatePreset, setPrivatePreset] = useState<PrivateCapacityPreset>('1_ON_1');
  const [assignmentMode, setAssignmentMode] = useState<'UNASSIGNED' | 'MANUAL'>('UNASSIGNED');
  const [manualClientName, setManualClientName] = useState('');
  const [manualClientContact, setManualClientContact] = useState('');
  const [pinCode, setPinCode] = useState('');

  const [capacity, setCapacity] = useState<number | string>(8);
  const [price, setPrice] = useState<number | string>(800);
  const [instructor, setInstructor] = useState('Jordan B.');
  const [roomName, setRoomName] = useState('Reformer Studio A');
  const [locationType, setLocationType] = useState<LocationType>('STUDIO');
  const [address, setAddress] = useState('');

  const [preClassNote, setPreClassNote] = useState(
    isZh ? ONBOARDING_NOTE_PRESETS[0].preZh : ONBOARDING_NOTE_PRESETS[0].preEn
  );
  const [postClassHomework, setPostClassHomework] = useState(
    isZh ? ONBOARDING_NOTE_PRESETS[0].postZh : ONBOARDING_NOTE_PRESETS[0].postEn
  );

  const handleNameChange = (val: string) => {
    setStudioName(val);
    const slug = val
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setStudioSlug(slug || 'studio');
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVisibilityChange = (nextVis: ClassVisibility) => {
    setVisibility(nextVis);
    if (nextVis === 'PRIVATE') {
      setCategory(isZh ? '私人教練' : 'Private 1-on-1');
      setRoomName(isZh ? 'VIP 專屬私教包廂' : 'VIP Private Room');
      setCapacity(1);
      setPrice(currency === 'TWD' ? 2200 : 85);
      setPreClassNote(isZh ? ONBOARDING_NOTE_PRESETS[3].preZh : ONBOARDING_NOTE_PRESETS[3].preEn);
      setPostClassHomework(isZh ? ONBOARDING_NOTE_PRESETS[3].postZh : ONBOARDING_NOTE_PRESETS[3].postEn);
    } else {
      setCapacity(8);
      setPrice(currency === 'TWD' ? 800 : 28);
    }
  };

  const handleApplyNotePreset = (preset: (typeof ONBOARDING_NOTE_PRESETS)[number]) => {
    setPreClassNote(isZh ? preset.preZh : preset.preEn);
    setPostClassHomework(isZh ? preset.postZh : preset.postEn);
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedCapacity = Math.max(1, Number(capacity) || 1);
    const parsedPrice = Math.max(0, Number(price) || 0);

    const invitedStudents: InvitedStudentEntry[] = [];
    if (visibility === 'PRIVATE' && assignmentMode === 'MANUAL' && manualClientName.trim()) {
      invitedStudents.push({
        id: `stu-new-${Date.now()}`,
        name: manualClientName.trim(),
        email: manualClientContact.includes('@')
          ? manualClientContact.trim()
          : `${manualClientName.toLowerCase().replace(/\s+/g, '.')}@client.vip`,
        phone: !manualClientContact.includes('@') ? manualClientContact.trim() : undefined,
        status: 'AWAITING',
      });
    }

    createStudioWithOnboarding({
      name: studioName,
      slug: studioSlug,
      tagline,
      logoUrl: logoUrl || undefined,
      currency,
      cancelWindowHrs: cancelHours,
      waitlistMins,
      firstClass: {
        title: className.trim() || 'Signature Session',
        category: category.trim() || 'Reformer',
        instructor: instructor.trim() || 'Coach',
        capacity: parsedCapacity,
        price: parsedPrice,
        roomName: roomName.trim() || 'Main Studio',
        visibility,
        privatePreset: visibility === 'PRIVATE' ? privatePreset : undefined,
        pinCode: visibility === 'PRIVATE' && pinCode.trim().length === 4 ? pinCode.trim() : undefined,
        invitedStudents: visibility === 'PRIVATE' ? invitedStudents : undefined,
        locationType,
        address: address.trim() || undefined,
        preClassNote: preClassNote.trim() || undefined,
        postClassHomework: postClassHomework.trim() || undefined,
      },
    });
  };

  return (
    <div className="min-h-screen bg-aura-bg text-aura-charcoal py-8 px-4 flex items-center justify-center">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-stone-200/80">
        {/* Step Indicator Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2.5">
            <AuraLeafBadge size="sm" customLogo={logoUrl} />
            <span className="font-serif text-xl font-semibold text-aura-charcoal">
              {isZh ? '工作室快速開通精靈' : 'Instructor Onboarding'}
            </span>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
            {isZh ? `步驟 ${step} / 3` : `Step ${step} of 3`}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-stone-200 rounded-full mb-8 overflow-hidden">
          <div
            className="h-full bg-aura-clay transition-all duration-300"
            style={{ width: `${(step / 3) * 100}%` }}
          />
        </div>

        {/* STEP 1: STUDIO NAME, SLUG & CUSTOM LOGO UPLOAD */}
        {step === 1 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 mb-1">
                {isZh ? '為您的工作室命名與設定品牌' : 'Name your Studio & Brand'}
              </h2>
              <p className="text-xs text-stone-500">
                {isZh
                  ? '設定品牌名稱、上傳個人教練頭像/Logo，以及專屬公開預約網址。'
                  : 'Choose your brand name, upload a custom logo/avatar, and set your public link.'}
              </p>
            </div>

            {/* Custom Logo Upload with Preview */}
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/90 flex items-center space-x-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300 flex items-center justify-center shrink-0 shadow-xs">
                {logoUrl ? (
                  <img src={logoUrl} alt="Logo Preview" className="w-full h-full object-cover" />
                ) : (
                  <AuraLeafBadge size="md" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-stone-800 mb-1">
                  {isZh ? '上傳教室/個人教練 Logo 或頭像' : 'Upload Studio Logo / Coach Avatar'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoFileChange}
                  className="text-[11px] text-stone-500 file:mr-2.5 file:py-1 file:px-2.5 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-aura-clay file:text-white hover:file:bg-[#A25A44] cursor-pointer"
                />
                <p className="text-[10px] text-stone-400 mt-1">
                  {isZh
                    ? '將自動取代預設標誌並顯示於學員預約首頁與課表'
                    : 'Replaces default mark on your public booking page'}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isZh ? '工作室名稱 (Studio Name)' : 'Studio Name'}
                </label>
                <input
                  type="text"
                  required
                  value={studioName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Sol Sanctuary"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isZh ? '公開預約專屬網址 (URL Slug)' : 'Public Booking URL Slug'}
                </label>
                <div className="flex items-center rounded-2xl bg-stone-50 border border-stone-300 px-3.5 py-2.5 text-xs text-stone-500 focus-within:ring-2 focus-within:ring-aura-clay">
                  <span className="text-stone-400 select-none">/s/</span>
                  <input
                    type="text"
                    required
                    value={studioSlug}
                    onChange={(e) =>
                      setStudioSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))
                    }
                    className="w-full bg-transparent text-stone-900 font-mono text-xs focus:outline-none"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1">
                  {isZh ? '學員預約網址：' : 'Students will book at: '}
                  <span className="font-mono text-aura-clay font-medium">/s/{studioSlug}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isZh ? '品牌標語 / 工作室簡介' : 'Tagline / Studio Philosophy'}
                </label>
                <input
                  type="text"
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  placeholder="e.g. Boutique Reformer & Movement Sanctuary"
                  className="w-full px-4 py-2.5 rounded-2xl bg-stone-50 border border-stone-300 text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
                />
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!studioName.trim() || !studioSlug.trim()}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-aura-clay text-white text-xs font-semibold shadow-md hover:bg-[#A25A44] transition-all disabled:opacity-50"
              >
                <span>{isZh ? '下一步：設定幣別與規則' : 'Continue to Step 2'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: CURRENCY & STUDIO RULES */}
        {step === 2 && (
          <div className="space-y-5 animate-fade-in">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 mb-1">
                {isZh ? '收款幣別與預約規則' : 'Currency & Studio Rules'}
              </h2>
              <p className="text-xs text-stone-500">
                {isZh
                  ? '選擇工作室結帳幣別與自動候補遞補時限。'
                  : 'Configure payout currency and automated waitlist waterfall timers.'}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  {isZh ? '工作室結帳幣別' : 'Studio Billing Currency'}
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['TWD', 'USD', 'HKD', 'JPY', 'SGD'] as SupportedCurrency[]).map((curr) => {
                    const conf = CURRENCY_CONFIGS[curr];
                    const isSelected = currency === curr;
                    return (
                      <button
                        type="button"
                        key={curr}
                        onClick={() => setCurrency(curr)}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between text-xs transition-all ${
                          isSelected
                            ? 'bg-aura-clay text-white border-aura-clay font-semibold shadow-xs'
                            : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <div className="flex items-center space-x-1.5">
                          <span>{conf.flag}</span>
                          <span>{curr}</span>
                        </div>
                        <span className="font-mono">{conf.symbol}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>{isZh ? '免費取消截止時限' : 'Free Cancellation Cutoff'}</span>
                  <span className="font-mono text-aura-clay">{cancelHours} Hours before start</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="48"
                  step="2"
                  value={cancelHours}
                  onChange={(e) => setCancelHours(Number(e.target.value))}
                  className="w-full accent-aura-clay"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  {isZh
                    ? '於開課前超過此時數取消將自動全額退還點數。'
                    : 'Cancellations before this window automatically refund class passes.'}
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-stone-700 mb-1">
                  <span>{isZh ? '候補保留時限' : 'Waitlist Offer Expiry Window'}</span>
                  <span className="font-mono text-aura-clay">{waitlistMins} Minutes</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="60"
                  step="5"
                  value={waitlistMins}
                  onChange={(e) => setWaitlistMins(Number(e.target.value))}
                  className="w-full accent-aura-clay"
                />
                <p className="text-[11px] text-stone-400 mt-1">
                  {isZh
                    ? '名額釋出時，第一順位候補學員保留確認之分鐘數。'
                    : 'When a spot opens, #1 in line has this window to claim before it rolls to #2.'}
                </p>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-700 shrink-0" />
                <span>$29.00/mo flat subscription. 0% platform transaction commissions.</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isZh ? '上一步' : 'Back'}</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="flex items-center space-x-2 px-6 py-3 rounded-full bg-aura-clay text-white text-xs font-semibold shadow-md hover:bg-[#A25A44] transition-all"
              >
                <span>{isZh ? '下一步：建立第一堂課' : 'Continue to Step 3'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: CREATE FIRST CLASS WITH PUBLIC/PRIVATE, CLIENT INPUT, LOCATION & PRE/POST NOTES */}
        {step === 3 && (
          <form onSubmit={handleFinish} className="space-y-4 animate-fade-in text-xs">
            <div>
              <h2 className="font-serif text-2xl font-medium text-stone-900 mb-1">
                {isZh ? '建立您的第一堂課程' : 'Create Your First Class'}
              </h2>
              <p className="text-xs text-stone-500">
                {isZh
                  ? '設定招牌課程或 VIP 私教包班以啟動您的專屬課表。'
                  : 'Set up a signature session or private 1-on-1 to launch your schedule.'}
              </p>
            </div>

            {/* 1. PUBLIC VS. PRIVATE TOGGLE */}
            <div className="p-1 rounded-2xl bg-stone-100 border border-stone-200 flex">
              <button
                type="button"
                onClick={() => handleVisibilityChange('PUBLIC')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  visibility === 'PUBLIC'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>{isZh ? '🌐 公開課表 (Public)' : '🌐 Public'}</span>
              </button>
              <button
                type="button"
                onClick={() => handleVisibilityChange('PRIVATE')}
                className={`flex-1 py-2 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                  visibility === 'PRIVATE'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>{isZh ? '🔒 專屬私教 / 受邀制 (Private / 1-on-1)' : '🔒 Private / 1-on-1'}</span>
              </button>
            </div>

            {/* 2. PRIVATE DEDICATED PANEL */}
            {visibility === 'PRIVATE' && (
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-300 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-amber-900 flex items-center space-x-1">
                    <span>👑</span>
                    <span>{isZh ? '私教包班規格與學員指定' : 'Private Preset & Client'}</span>
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900 font-semibold">
                    {isZh ? '課表已隱藏' : 'Hidden from Schedule'}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: '1_ON_1' as PrivateCapacityPreset, labelZh: '1對1 單人', cap: 1 },
                    { id: '1_ON_2' as PrivateCapacityPreset, labelZh: '1對2 雙人', cap: 2 },
                    { id: 'SMALL_GROUP' as PrivateCapacityPreset, labelZh: '3-6人 小班', cap: 4 },
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setPrivatePreset(p.id);
                        setCapacity(p.cap);
                      }}
                      className={`py-1.5 rounded-xl border text-center transition-all ${
                        privatePreset === p.id
                          ? 'bg-amber-800 text-white font-semibold border-amber-800'
                          : 'bg-white text-stone-700 border-amber-200 hover:bg-amber-100/50'
                      }`}
                    >
                      {p.labelZh}
                    </button>
                  ))}
                </div>

                {/* 1-on-1 Trainer & Client Assignment */}
                <div className="space-y-1.5">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignmentMode('UNASSIGNED')}
                      className={`flex-1 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        assignmentMode === 'UNASSIGNED'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      {isZh ? '🔗 產生不指定學員連結' : 'Open Claim Link'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignmentMode('MANUAL')}
                      className={`flex-1 py-1.5 rounded-xl border text-[11px] font-semibold transition-all ${
                        assignmentMode === 'MANUAL'
                          ? 'bg-stone-900 text-white border-stone-900'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      {isZh ? '👤 指定新學員' : 'Assign Student'}
                    </button>
                  </div>

                  {assignmentMode === 'MANUAL' ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <input
                        type="text"
                        value={manualClientName}
                        onChange={(e) => setManualClientName(e.target.value)}
                        placeholder={isZh ? '學員姓名 (如 林小姐 Sarah)' : 'Student Name'}
                        className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-aura-clay"
                      />
                      <input
                        type="text"
                        value={manualClientContact}
                        onChange={(e) => setManualClientContact(e.target.value)}
                        placeholder={isZh ? '電話或 Email (如 0912-345-678)' : 'Phone or Email'}
                        className="px-3 py-1.5 rounded-xl bg-white border border-stone-300 text-xs focus:outline-none focus:ring-1 focus:ring-aura-clay"
                      />
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-800/90 leading-tight">
                      {isZh
                        ? '首位點擊私教 VIP 邀請連結的學員將直接鎖定此名額。'
                        : 'First student to claim the VIP invite link will book this spot.'}
                    </p>
                  )}

                  {/* Optional 4-Digit PIN */}
                  <div className="pt-1 flex items-center space-x-2">
                    <span className="text-[11px] font-medium text-amber-900 flex items-center space-x-1 shrink-0">
                      <KeyRound className="w-3 h-3 text-amber-700" />
                      <span>{isZh ? '預約 PIN 碼 (選填):' : 'PIN (Optional):'}</span>
                    </span>
                    <input
                      type="text"
                      maxLength={4}
                      value={pinCode}
                      onChange={(e) => setPinCode(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      placeholder="e.g. 8829"
                      className="w-24 px-2.5 py-1 rounded-xl bg-white border border-amber-300 text-center font-mono text-xs focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                {isZh ? '課程名稱 (Class Title)' : 'Class Title'}
              </label>
              <input
                type="text"
                required
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                placeholder="e.g. Morning Reformer Sculpt"
                className="w-full px-4 py-2 rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
              />
            </div>

            {/* Manual Category Entry + Quick Pick Tags */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                {isZh
                  ? '課程分類 (可直接手動輸入任意分類或點選下方標籤)'
                  : 'Category (Type any custom category or select)'}
              </label>
              <input
                type="text"
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder={isZh ? '例如：空中瑜珈、Flight、器械皮拉提、1對1私教...' : 'Type category...'}
                className="w-full px-4 py-2 rounded-2xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-2 focus:ring-aura-clay"
              />
              <div className="mt-1.5 flex flex-wrap items-center gap-1">
                {SUGGESTED_CATEGORIES.slice(0, 8).map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setCategory(tag)}
                    className={`text-[10px] px-2 py-0.5 rounded-full border transition-all ${
                      category === tag
                        ? 'bg-aura-clay text-white font-semibold border-aura-clay'
                        : 'bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* 3. DYNAMIC LOCATION & ADDRESS INPUT */}
            <div>
              <label className="block text-stone-700 font-semibold mb-1">
                {isZh ? '場地類型與詳細地址 (Location)' : 'Location Type & Address'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-1.5">
                {[
                  { id: 'STUDIO' as LocationType, labelZh: '🏢 合作場館', labelEn: '🏢 Studio' },
                  { id: 'CUSTOM' as LocationType, labelZh: '📍 自訂地址', labelEn: '📍 Custom' },
                  { id: 'CLIENT_HOME' as LocationType, labelZh: '🏡 到府指導', labelEn: '🏡 Home' },
                  { id: 'OUTDOOR' as LocationType, labelZh: '🌳 戶外/其他', labelEn: '🌳 Outdoor' },
                ].map((loc) => (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setLocationType(loc.id)}
                    className={`py-1.5 px-1 rounded-xl border text-[11px] font-semibold text-center transition-all ${
                      locationType === loc.id
                        ? 'bg-aura-clay text-white border-aura-clay shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {isZh ? loc.labelZh : loc.labelEn}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  required
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  placeholder={isZh ? '場館/教室名稱 (如 Studio A)' : 'Room Name'}
                  className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-aura-clay"
                />
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder={
                    isZh
                      ? '地址 (如 台北市信義路四段88號)'
                      : 'Street Address (e.g. 88 Xinyi Rd)'
                  }
                  className="px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-aura-clay"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {isZh ? '人數上限 (Capacity Cap)' : 'Capacity Cap'}
                </label>
                <input
                  type="number"
                  min="1"
                  step="1"
                  required
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  placeholder="e.g. 8"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-aura-clay"
                />
              </div>

              <div>
                <label className="block text-stone-700 font-semibold mb-1">
                  {isZh ? `體驗單價 (${currency} - 無限制)` : `Price (${currency})`}
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 1599"
                  className="w-full px-3 py-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-900 focus:outline-none focus:ring-1 focus:ring-aura-clay"
                />
              </div>
            </div>

            {/* 4. PRE & POST-WORKOUT NOTES IN ONBOARDING WITH PRESET CHIPS */}
            <div className="space-y-2 pt-1 border-t border-stone-200">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800 flex items-center space-x-1">
                  <ClipboardList className="w-3.5 h-3.5 text-aura-clay" />
                  <span>{isZh ? '課堂叮嚀與課後作業' : 'Pre-Class Notes & Homework'}</span>
                </span>
                <span className="text-[10px] text-stone-400">
                  {isZh ? '1-Tap 快速套用範本：' : '1-Tap Presets:'}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5">
                {ONBOARDING_NOTE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleApplyNotePreset(preset)}
                    className="text-[10px] px-2.5 py-1 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200 transition-colors"
                  >
                    {isZh ? preset.chipZh : preset.chipEn}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    {isZh ? '課前叮嚀 (開課前 2 小時發送)' : 'Pre-Class Prep Note'}
                  </label>
                  <textarea
                    rows={2}
                    value={preClassNote}
                    onChange={(e) => setPreClassNote(e.target.value)}
                    className="w-full p-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-aura-clay resize-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                    {isZh ? '課後伸展與作業 (下課後發送)' : 'Post-Class Homework'}
                  </label>
                  <textarea
                    rows={2}
                    value={postClassHomework}
                    onChange={(e) => setPostClassHomework(e.target.value)}
                    className="w-full p-2 rounded-xl bg-stone-50 border border-stone-300 text-stone-800 text-[11px] focus:outline-none focus:ring-1 focus:ring-aura-clay resize-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 flex items-center justify-between border-t border-stone-200">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex items-center space-x-1 text-xs text-stone-500 hover:text-stone-800"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{isZh ? '上一步' : 'Back'}</span>
              </button>
              <button
                type="submit"
                className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-emerald-800 text-white text-xs font-semibold shadow-md hover:bg-emerald-900 transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isZh
                    ? '免費完成建立並進入後台 (免綁卡)'
                    : 'Complete Free Setup & Enter Studio Admin'}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
