import React from 'react';

interface AuraLeafLogoProps {
  className?: string;
  size?: number;
  color?: string;
}

export const AuraLeafLogo: React.FC<AuraLeafLogoProps> = ({
  className = 'w-5 h-5 text-aura-clay',
  size,
  color,
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="currentColor"
      className={className}
      style={color ? { color } : undefined}
      aria-label="Aura Flow Botanical Leaf"
    >
      {/* Central Curved Stem */}
      <path
        d="M6 21C7.8 16.5 10.5 11 12 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Crown Leaf */}
      <path
        d="M12 4C13.8 2.2 12.2 0.8 11.2 0.6C10.2 0.8 8.8 2.2 12 4Z"
        fill="currentColor"
      />
      {/* Upper Right Leaf */}
      <path
        d="M11.8 6.5C14.8 5 18 5.8 18.8 7.2C18.2 9.2 15 9.2 11.8 6.5Z"
        fill="currentColor"
      />
      {/* Upper Left Leaf */}
      <path
        d="M11 9C8.2 7.2 5 8 4.2 9.4C4.8 11.4 8 11.4 11 9Z"
        fill="currentColor"
      />
      {/* Middle Right Leaf */}
      <path
        d="M10.2 12.5C13.2 11 16.5 11.8 17.2 13.2C16.6 15.2 13.5 15.2 10.2 12.5Z"
        fill="currentColor"
      />
      {/* Lower Left Leaf */}
      <path
        d="M9.2 15C6.4 13.5 3.2 14.2 2.5 15.6C3.1 17.6 6.2 17.6 9.2 15Z"
        fill="currentColor"
      />
      {/* Base Sprout Dot */}
      <circle cx="6" cy="21" r="0.8" fill="currentColor" />
    </svg>
  );
};

export const AuraLeafBadge: React.FC<{
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}> = ({ size = 'md', className = '' }) => {
  const sizeMap = {
    sm: { container: 'w-7 h-7', icon: 'w-4 h-4' },
    md: { container: 'w-9 h-9', icon: 'w-5 h-5' },
    lg: { container: 'w-12 h-12', icon: 'w-7 h-7' },
  };

  const current = sizeMap[size];

  return (
    <div
      className={`rounded-full bg-aura-clay/15 border border-aura-clay/30 flex items-center justify-center text-aura-clay shadow-xs shrink-0 ${current.container} ${className}`}
    >
      <AuraLeafLogo className={current.icon} />
    </div>
  );
};
