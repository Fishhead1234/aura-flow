import React from 'react';
import { useAuraStore } from '../store/auraStore';
import { Calendar, Compass, MessageCircle } from 'lucide-react';
import { isStandaloneAndroid, safeAreaBottom } from '../utils/safeArea';

export interface BottomNavProps {
  activeTab?: 'studio' | 'explore';
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab = 'studio' }) => {
  const { locale, studio, boundStudioSlug, navigateTo, openStudentChat } = useAuraStore();
  const isZh = locale === 'zh-TW' || locale === 'zh-CN';

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-30 md:hidden bg-[#F7F4EE]/95 backdrop-blur-md border-t border-stone-200 px-6 py-2 flex items-center justify-around transition-all"
      style={{
        paddingBottom: isStandaloneAndroid
          ? 'max(env(safe-area-inset-bottom, 0px), 20px)'
          : 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <button
        type="button"
        onClick={() =>
          navigateTo({
            path: 'public_studio',
            slug: boundStudioSlug || studio.slug || 'sol-sanctuary',
          })
        }
        className={`flex flex-col items-center space-y-0.5 text-[11px] font-medium transition-colors ${
          activeTab === 'studio' ? 'text-aura-clay font-semibold' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span>{isZh ? '專屬課表' : 'My Studio'}</span>
      </button>

      <button
        type="button"
        onClick={() => navigateTo({ path: 'explore' })}
        className={`flex flex-col items-center space-y-0.5 text-[11px] font-medium transition-colors ${
          activeTab === 'explore' ? 'text-aura-clay font-semibold' : 'text-stone-500 hover:text-stone-900'
        }`}
      >
        <Compass className="w-4 h-4" />
        <span>{isZh ? '探索 (Explore)' : 'Explore'}</span>
      </button>

      <button
        type="button"
        onClick={() => openStudentChat()}
        className="flex flex-col items-center space-y-0.5 text-stone-500 hover:text-stone-900 font-medium text-[11px] transition-colors"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{isZh ? '聯絡教練' : 'Message Coach'}</span>
      </button>
    </nav>
  );
};
