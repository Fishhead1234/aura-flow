import React, { useState, useEffect, useRef } from 'react';
import { useAuraStore } from '../store/auraStore';
import { getTranslation } from '../i18n/auraI18n';
import { X, Send, Sparkles, MessageCircle, ShieldCheck } from 'lucide-react';
import { AuraLeafBadge } from './AuraLeafLogo';

export const StudentChatModal: React.FC = () => {
  const {
    locale,
    isStudentChatOpen,
    studentChatSessionContext,
    closeStudentChat,
    studio,
    conversations,
    messages,
    sendStudentInquiry,
    currentUser,
  } = useAuraStore();

  const [inputText, setInputText] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const tBooking = (key: string, params?: Record<string, string | number>) =>
    getTranslation(locale, 'booking', key, params);

  // Find user's conversation (Maya Lin's conv-maya-01 or user's)
  const currentConversation = conversations.find(
    (c) => c.studentId === currentUser.id || c.studentEmail === currentUser.email
  ) || conversations[0];

  const convMessages = currentConversation ? messages[currentConversation.id] || [] : [];

  useEffect(() => {
    if (isStudentChatOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [isStudentChatOpen, convMessages.length]);

  if (!isStudentChatOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendStudentInquiry(inputText.trim());
    setInputText('');
    setToastMessage(tBooking('inquirySentToast'));
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleQuickChip = (prompt: string) => {
    sendStudentInquiry(prompt);
    setToastMessage(tBooking('inquirySentToast'));
    setTimeout(() => setToastMessage(''), 3000);
  };

  const quickPrompts = locale === 'zh-TW'
    ? [
        '請問初學者可以參加這堂課嗎？',
        '需要自備防滑襪還是現場有販售？',
        '教室有提供置物櫃與更衣淋浴間嗎？',
      ]
    : [
        'Is this class suitable for complete beginners?',
        'Do I need grip socks or are they available on-site?',
        'Are lockers and changing showers available?',
      ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF7F2] rounded-3xl w-full max-w-lg border border-stone-300 shadow-2xl flex flex-col h-[600px] max-h-[92vh] overflow-hidden text-stone-900 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-5 py-4 bg-white border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <AuraLeafBadge size="sm" className="w-10 h-10 border border-[#D9C4A1]" />
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-serif text-base font-semibold text-stone-900">
                  {tBooking('studentChatTitle')}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                  {locale === 'zh-TW' ? '教練在線' : 'Online'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {studio.name} • Elena Rostova
              </p>
            </div>
          </div>

          <button
            onClick={closeStudentChat}
            className="w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Session context banner if opened from a specific session */}
        {studentChatSessionContext && studentChatSessionContext.sessionTitle && (
          <div className="px-5 py-2.5 bg-amber-50/80 border-b border-amber-200/60 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-amber-900">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>
                {locale === 'zh-TW' ? '諮詢課堂：' : 'Session: '}
                <strong className="font-medium">{studentChatSessionContext.sessionTitle}</strong>
              </span>
            </div>
          </div>
        )}

        {/* Message Thread */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="text-center my-1">
            <span className="text-[11px] px-3 py-1 rounded-full bg-stone-200/60 text-stone-600">
              {locale === 'zh-TW' ? '站內私密安全對話 • 0 廣告推銷' : 'Private Direct Messaging • 0 Spam'}
            </span>
          </div>

          {convMessages.map((msg) => {
            const isMe = msg.senderRole === 'STUDENT';
            const isSystem = msg.senderRole === 'SYSTEM';

            if (isSystem) {
              return (
                <div key={msg.id} className="p-3 rounded-2xl bg-amber-100/70 border border-amber-300/70 text-xs text-amber-900 shadow-2xs">
                  <div className="font-semibold flex items-center space-x-1.5 mb-1">
                    <span>📢</span>
                    <span>{msg.senderName}</span>
                  </div>
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-center space-x-1.5 mb-1 text-[11px] text-stone-500">
                  <span>{msg.senderName}</span>
                  {msg.channel === 'LINE_OA' && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 font-medium">
                      LINE OA
                    </span>
                  )}
                </div>

                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs ${
                    isMe
                      ? 'bg-aura-clay text-white rounded-br-xs'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-bl-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>

                <span className="text-[10px] text-stone-400 mt-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Toast confirmation */}
        {toastMessage && (
          <div className="mx-4 mb-2 p-2 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-800 text-xs flex items-center space-x-2 animate-in fade-in">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Quick Question Chips */}
        <div className="px-4 py-2 bg-stone-100/70 border-t border-stone-200 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-medium text-stone-500 uppercase tracking-wider shrink-0">
            {locale === 'zh-TW' ? '常見快速提問：' : 'Quick Ask:'}
          </span>
          {quickPrompts.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickChip(chip)}
              className="text-[11px] px-3 py-1 rounded-full bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 shrink-0 transition-colors shadow-2xs"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Row */}
        <form onSubmit={handleSend} className="p-4 bg-white border-t border-stone-200 flex items-center space-x-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={tBooking('inquiryPlaceholder')}
            className="flex-1 px-4 py-2.5 rounded-full bg-stone-100 border border-stone-200 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-aura-clay"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="w-10 h-10 rounded-full bg-aura-clay text-white flex items-center justify-center hover:bg-[#A25A44] transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
