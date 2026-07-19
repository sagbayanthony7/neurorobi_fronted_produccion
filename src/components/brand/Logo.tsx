import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = '', size = 48, showText = true }) => {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="drop-shadow-lg transition-transform hover:scale-105"
      >
        <defs>
          {/* Bear gradient definition */}
          <linearGradient id="bearGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0d9488" stopOpacity="0.85" /> {/* Teal-600 */}
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.95" /> {/* Emerald-500 */}
          </linearGradient>

          {/* Node glow filters */}
          <filter id="glowTeal" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowIndigo" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glowRose" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* --- FRIENDLY BEAR SILHOUETTE --- */}
        {/* Left Ear */}
        <circle cx="55" cy="55" r="28" fill="url(#bearGrad)" />
        <circle cx="55" cy="55" r="14" fill="#ffffff" opacity="0.3" />

        {/* Right Ear */}
        <circle cx="145" cy="55" r="28" fill="url(#bearGrad)" />
        <circle cx="145" cy="55" r="14" fill="#ffffff" opacity="0.3" />

        {/* Head */}
        <circle cx="100" cy="100" r="60" fill="url(#bearGrad)" />

        {/* Cheeks blush */}
        <circle cx="65" cy="115" r="12" fill="#e11d48" opacity="0.25" />
        <circle cx="135" cy="115" r="12" fill="#e11d48" opacity="0.25" />

        {/* Snout */}
        <ellipse cx="100" cy="120" rx="22" ry="16" fill="#ffffff" opacity="0.9" />

        {/* Bear Nose */}
        <path d="M92 114 C92 110, 108 110, 108 114 C108 120, 92 120, 92 114 Z" fill="#0f172a" />
        {/* Smile */}
        <path d="M94 125 Q100 132 106 125" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* --- GLOWING NEURAL NETWORK NODES & LINKS --- */}
        {/* Synapse Lines */}
        <line x1="65" y1="80" x2="100" y2="60" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3,3" opacity="0.8" />
        <line x1="135" y1="80" x2="100" y2="60" stroke="#ffffff" strokeWidth="2.5" strokeDasharray="3,3" opacity="0.8" />
        <line x1="65" y1="80" x2="100" y2="100" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
        <line x1="135" y1="80" x2="100" y2="100" stroke="#ffffff" strokeWidth="2.5" opacity="0.6" />
        <line x1="100" y1="60" x2="100" y2="100" stroke="#6366f1" strokeWidth="2" strokeDasharray="4,2" opacity="0.75" />
        <line x1="65" y1="80" x2="55" y2="55" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />
        <line x1="135" y1="80" x2="145" y2="55" stroke="#ffffff" strokeWidth="1.5" opacity="0.4" />

        {/* Left Eye Node - Glowing Teal */}
        <circle cx="65" cy="80" r="10" fill="#2dd4bf" filter="url(#glowTeal)" />
        <circle cx="65" cy="80" r="4" fill="#ffffff" />

        {/* Right Eye Node - Glowing Teal */}
        <circle cx="135" cy="80" r="10" fill="#2dd4bf" filter="url(#glowTeal)" />
        <circle cx="135" cy="80" r="4" fill="#ffffff" />

        {/* Forehead Node - Glowing Violet/Indigo */}
        <circle cx="100" cy="60" r="9" fill="#818cf8" filter="url(#glowIndigo)" />
        <circle cx="100" cy="60" r="3.5" fill="#ffffff" />

        {/* Third Eye Node / Core Processor Node - Glowing Rose */}
        <circle cx="100" cy="100" r="12" fill="#fb7185" filter="url(#glowRose)" />
        <circle cx="100" cy="100" r="5" fill="#ffffff" className="animate-ping" />
      </svg>
      {showText && (
        <div className="flex flex-col">
          <span className="text-xl font-bold tracking-tight text-slate-800 leading-none">
            Neurorobi
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-teal-600 font-sans">
            IoT Clinical Toy
          </span>
        </div>
      )}
    </div>
  );
};
