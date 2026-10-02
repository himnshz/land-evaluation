import React from 'react';

export const Squiggle: React.FC<{ className?: string; color?: string }> = ({
  className = 'w-24 h-4',
  color = '#8B5CF6'
}) => (
  <svg
    viewBox="0 0 100 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="none"
  >
    <path
      d="M2 10C12 2 18 18 28 10C38 2 44 18 54 10C64 2 70 18 80 10C90 2 95 18 98 10"
      stroke={color}
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const MemphisConfetti: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`pointer-events-none absolute inset-0 overflow-hidden select-none -z-10 ${className}`}>
    {/* Circle 1 - Violet */}
    <div className="absolute top-4 left-6 w-5 h-5 rounded-full bg-[#8B5CF6]/20 border-2 border-[#1E293B] rotate-12" />
    {/* Yellow Star / Asterisk */}
    <div className="absolute top-8 right-12 w-6 h-6 text-[#FBBF24] font-bold text-xl select-none animate-pulse">
      ✦
    </div>
    {/* Pink Triangle */}
    <div className="absolute top-1/2 left-2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-b-[14px] border-b-[#F472B6] rotate-[25deg]" />
    {/* Mint Square */}
    <div className="absolute bottom-6 right-8 w-4 h-4 rounded-sm bg-[#34D399] border-2 border-[#1E293B] rotate-45" />
    {/* Dot clusters */}
    <div className="absolute top-1/3 right-4 flex gap-1">
      <div className="w-1.5 h-1.5 rounded-full bg-[#1E293B]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#1E293B]" />
      <div className="w-1.5 h-1.5 rounded-full bg-[#1E293B]" />
    </div>
  </div>
);

export const PlayfulBadge: React.FC<{
  children: React.ReactNode;
  color?: 'purple' | 'pink' | 'yellow' | 'mint' | 'slate' | 'white';
  className?: string;
  size?: 'sm' | 'md';
}> = ({ children, color = 'purple', className = '', size = 'md' }) => {
  const colorStyles = {
    purple: 'bg-[#8B5CF6] text-white',
    pink: 'bg-[#F472B6] text-white',
    yellow: 'bg-[#FBBF24] text-[#1E293B]',
    mint: 'bg-[#34D399] text-[#1E293B]',
    slate: 'bg-[#F1F5F9] text-[#1E293B]',
    white: 'bg-white text-[#1E293B]'
  };

  const sizeStyles = {
    sm: 'text-[10px] px-2 py-0.5 border',
    md: 'text-xs px-2.5 py-1 border-2'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 font-bold rounded-full border-[#1E293B] shadow-[2px_2px_0px_0px_#1E293B] font-mono tracking-wide ${colorStyles[color]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const FloatingIconBadge: React.FC<{
  icon: React.ReactNode;
  bgColor?: string;
  className?: string;
}> = ({ icon, bgColor = '#8B5CF6', className = '' }) => (
  <div
    className={`w-10 h-10 rounded-full border-2 border-[#1E293B] flex items-center justify-center text-white shadow-[3px_3px_0px_#1E293B] transition-transform duration-200 hover:scale-110 ${className}`}
    style={{ backgroundColor: bgColor }}
  >
    {icon}
  </div>
);
