import React from 'react';

/**
 * Official Aura Flow brand mark: rose-gold concentric rings with a central wave.
 * Source artwork lives in /public (logo-mark.png = emblem, logo-full.png = emblem + wordmark).
 */
const LOGO_MARK_SRC = '/logo-mark.png';

interface AuraLogoProps {
  className?: string;
  size?: number;
  customLogo?: string;
}

export const AuraLogoMark: React.FC<AuraLogoProps> = ({ className = 'w-5 h-5', size, customLogo }) => (
  <img
    src={customLogo || LOGO_MARK_SRC}
    alt="Logo"
    width={size}
    height={size}
    draggable={false}
    className={`object-cover select-none ${className}`}
  />
);

export const AuraLogoBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  customLogo?: string;
}> = ({ size = 'md', className = '', customLogo }) => {
  const sizeMap = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  return (
    <div
      className={`rounded-full overflow-hidden bg-[#1F1E1C] ring-1 ring-[#C9A27A]/40 shadow-xs shrink-0 ${sizeMap[size]} ${className}`}
    >
      <AuraLogoMark customLogo={customLogo} className="w-full h-full object-cover" />
    </div>
  );
};

// Backwards-compatible aliases (previous leaf logo names used across components)
export const AuraLeafLogo = AuraLogoMark;
export const AuraLeafBadge = AuraLogoBadge;
