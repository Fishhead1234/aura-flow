import React from 'react';

/**
 * Official Aura Flow brand mark: rose-gold concentric rings with a central wave.
 * Source artwork lives in /public (logo-mark.png = emblem, logo-full.png = emblem + wordmark).
 */
const LOGO_MARK_SRC = '/logo-mark.png';

interface AuraLogoProps {
  className?: string;
  size?: number;
}

export const AuraLogoMark: React.FC<AuraLogoProps> = ({ className = 'w-5 h-5', size }) => (
  <img
    src={LOGO_MARK_SRC}
    alt="Aura Flow"
    width={size}
    height={size}
    draggable={false}
    className={`object-cover select-none ${className}`}
  />
);

export const AuraLogoBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`rounded-full overflow-hidden bg-[#1F1E1C] ring-1 ring-[#C9A27A]/40 shadow-xs shrink-0 ${sizeMap[size]} ${className}`}
    >
      <AuraLogoMark className="w-full h-full" />
    </div>
  );
};

// Backwards-compatible aliases (previous leaf logo names used across components)
export const AuraLeafLogo = AuraLogoMark;
export const AuraLeafBadge = AuraLogoBadge;
