import React from 'react'


export function HostAvatar({ className = "w-28 h-28" }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <div className="absolute inset-0 rounded-full bg-purple-600/40 blur-xl animate-pulse" />
      
      <svg viewBox="0 0 120 120" className="w-full h-full relative z-10 drop-shadow-[0_0_18px_rgba(168,85,247,0.9)]">
        <defs>
          <linearGradient id="hostCrownGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#713f12" />
          </linearGradient>
          <linearGradient id="hostPlumeCrimson" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="50%" stopColor="#c026d3" />
            <stop offset="100%" stopColor="#581c87" />
          </linearGradient>
          <linearGradient id="hostDarkPlate" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="30%" stopColor="#334155" />
            <stop offset="75%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#090d16" />
          </linearGradient>
          <linearGradient id="hostVisorCyan" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
          <radialGradient id="hostShieldBg" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e1b4b" />
            <stop offset="70%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </radialGradient>
        </defs>

        <circle cx="60" cy="60" r="56" fill="url(#hostShieldBg)" stroke="url(#hostCrownGold)" strokeWidth="2.5" />
        <circle cx="60" cy="60" r="52" fill="none" stroke="#a855f7" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

        <path d="M28 28 C20 8, 100 8, 92 28 C84 14, 36 14, 28 28 Z" fill="url(#hostPlumeCrimson)" stroke="#fda4af" strokeWidth="1" />
        
        <path d="M42 26 L50 14 L60 22 L70 14 L78 26 Z" fill="url(#hostCrownGold)" stroke="#ca8a04" strokeWidth="1" />
        <circle cx="50" cy="14" r="2" fill="#ef4444" />
        <circle cx="60" cy="22" r="2" fill="#38bdf8" />
        <circle cx="70" cy="14" r="2" fill="#ef4444" />

        <path d="M22 42 C12 30, 16 16, 26 12 C30 22, 32 34, 30 46 Z" fill="url(#hostCrownGold)" />
        <path d="M98 42 C108 30, 104 16, 94 12 C90 22, 88 34, 90 46 Z" fill="url(#hostCrownGold)" />

        <path d="M30 40 C30 22, 90 22, 90 40 C90 68, 78 92, 60 102 C42 92, 30 68, 30 40 Z" fill="url(#hostDarkPlate)" stroke="url(#hostCrownGold)" strokeWidth="2" />

        <path d="M32 44 C46 36, 74 36, 88 44 L86 50 C72 44, 48 44, 34 50 Z" fill="url(#hostCrownGold)" />

        <path d="M30 52 L46 80 L54 80 L44 52 Z" fill="#1e293b" stroke="url(#hostCrownGold)" strokeWidth="1" />
        <path d="M90 52 L74 80 L66 80 L76 52 Z" fill="#1e293b" stroke="url(#hostCrownGold)" strokeWidth="1" />

        <path d="M38 56 L82 56 L80 63 L65 63 L65 84 L55 84 L55 63 L40 63 Z" fill="url(#hostVisorCyan)" />

        <circle cx="60" cy="38" r="9" fill="#090d16" stroke="url(#hostCrownGold)" strokeWidth="1.5" />
        <text x="60" y="42" textAnchor="middle" fill="#fde047" fontSize="10" fontWeight="900" fontFamily="sans-serif">H</text>

        <path d="M46 94 C54 100, 66 100, 74 94 L82 106 L38 106 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
      </svg>
    </div>
  )
}

const WARRIOR_BADGES = [
  {
    name: "Gothic Sallet Knight",
    ringColor: "border-cyan-400 shadow-[0_0_14px_rgba(6,182,212,0.6)]",
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="salletSteel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="40%" stopColor="#94a3b8" />
            <stop offset="80%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#090d16" />
        <path d="M22 38 C22 18, 78 18, 78 38 L84 56 L68 56 L68 76 L50 88 L32 76 L32 56 L16 56 Z" fill="url(#salletSteel)" stroke="#38bdf8" strokeWidth="1.5" />
        <path d="M50 18 L50 42" stroke="#f8fafc" strokeWidth="2" strokeLinecap="round" />
        <path d="M16 54 C36 48, 64 48, 84 54" fill="none" stroke="#38bdf8" strokeWidth="2" />
        <rect x="28" y="44" width="44" height="4" rx="2" fill="#06b6d4" className="animate-pulse" />
        <path d="M36 68 L50 78 L64 68 L60 84 L40 84 Z" fill="#1e293b" stroke="#64748b" strokeWidth="1" />
      </svg>
    )
  },
  {
    name: "Templar Crusader",
    ringColor: "border-amber-400 shadow-[0_0_14px_rgba(251,191,36,0.6)]",
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <defs>
          <linearGradient id="crusaderGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill="#120e09" />
        <path d="M26 36 C26 18, 74 18, 74 36 L72 74 L50 86 L28 74 Z" fill="#334155" stroke="url(#crusaderGold)" strokeWidth="2" />
        <path d="M46 22 L54 22 L54 78 L46 78 Z" fill="url(#crusaderGold)" />
        <path d="M28 42 L72 42 L72 50 L28 50 Z" fill="url(#crusaderGold)" />
        <rect x="32" y="44" width="16" height="3" rx="1" fill="#f59e0b" />
        <rect x="52" y="44" width="16" height="3" rx="1" fill="#f59e0b" />
        <circle cx="38" cy="62" r="1.5" fill="#090d16" />
        <circle cx="42" cy="62" r="1.5" fill="#090d16" />
        <circle cx="58" cy="62" r="1.5" fill="#090d16" />
        <circle cx="62" cy="62" r="1.5" fill="#090d16" />
      </svg>
    )
  },
  {
    name: "Shadow Assassin",
    ringColor: "border-purple-500 shadow-[0_0_14px_rgba(168,85,247,0.6)]",
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#0b0714" />
        <path d="M18 84 C18 28, 30 12, 50 12 C70 12, 82 28, 82 84 C68 76, 32 76, 18 84 Z" fill="#2e1065" stroke="#a855f7" strokeWidth="2" />
        <path d="M26 78 C26 36, 34 22, 50 22 C66 22, 74 36, 74 78 C62 70, 38 70, 26 78 Z" fill="#030712" />
        <ellipse cx="41" cy="46" rx="5" ry="2.5" fill="#c084fc" className="animate-pulse" />
        <ellipse cx="59" cy="46" rx="5" ry="2.5" fill="#c084fc" className="animate-pulse" />
        <path d="M34 54 C44 52, 56 52, 66 54 L64 74 L36 74 Z" fill="#1f1338" stroke="#7e22ce" strokeWidth="1" />
        <polygon points="50,26 47,38 53,38" fill="#a855f7" />
      </svg>
    )
  },
  {
    name: "Viking Warlord",
    ringColor: "border-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.6)]",
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#160b05" />
        <path d="M22 34 C10 24, 12 8, 20 2 C24 14, 26 24, 28 32 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        <path d="M78 34 C90 24, 88 8, 80 2 C76 14, 74 24, 72 32 Z" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
        <path d="M26 36 C26 20, 74 20, 74 36 L72 48 L50 52 L28 48 Z" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <path d="M34 44 C34 38, 66 38, 66 44 L64 56 L52 52 L50 58 L48 52 L36 56 Z" fill="#334155" stroke="#f59e0b" strokeWidth="1.5" />
        <circle cx="42" cy="46" r="2.5" fill="#fef08a" />
        <circle cx="58" cy="46" r="2.5" fill="#fef08a" />
        <path d="M30 52 C30 84, 50 94, 50 94 C50 94, 70 84, 70 52 C60 62, 40 62, 30 52 Z" fill="#c2410c" stroke="#9a3412" strokeWidth="1.5" />
        <circle cx="50" cy="80" r="3" fill="#fbbf24" />
      </svg>
    )
  },
  {
    name: "Crimson Knight",
    ringColor: "border-rose-500 shadow-[0_0_14px_rgba(244,63,94,0.6)]",
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#15080c" />
        <path d="M22 22 C36 12, 64 12, 78 22 C66 30, 34 30, 22 22 Z" fill="#fb7185" stroke="#e11d48" strokeWidth="1.5" />
        <path d="M26 34 C26 22, 74 22, 74 34 L78 54 L50 86 L22 54 Z" fill="#1e1b4b" stroke="#f43f5e" strokeWidth="2" />
        <path d="M32 46 L68 46 L60 56 L40 56 Z" fill="#e11d48" className="animate-pulse" />
        <line x1="42" y1="64" x2="58" y2="64" stroke="#fb7185" strokeWidth="2" />
        <line x1="45" y1="70" x2="55" y2="70" stroke="#fb7185" strokeWidth="2" />
      </svg>
    )
  },
  {
    name: "Valkyrie Maiden",
    ringColor: "border-emerald-400 shadow-[0_0_14px_rgba(16,185,129,0.6)]",
    render: () => (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#041f18" />
        <path d="M16 28 C28 14, 38 24, 36 38 C28 34, 20 34, 16 28 Z" fill="#a7f3d0" stroke="#34d399" strokeWidth="1.5" />
        <path d="M84 28 C72 14, 62 24, 64 38 C72 34, 80 34, 84 28 Z" fill="#a7f3d0" stroke="#34d399" strokeWidth="1.5" />
        <path d="M30 36 C42 30, 58 30, 70 36 L68 42 C58 38, 42 38, 32 42 Z" fill="#059669" stroke="#6ee7b7" strokeWidth="1.5" />
        <polygon points="50,28 46,38 54,38" fill="#34d399" />
        <circle cx="50" cy="48" r="15" fill="#fed7aa" />
        <path d="M30 44 C30 64, 36 78, 38 84" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M70 44 C70 64, 64 78, 62 84" stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <circle cx="44" cy="46" r="2" fill="#059669" />
        <circle cx="56" cy="46" r="2" fill="#059669" />
      </svg>
    )
  }
]

export function PlayerAvatar({ index = 0, name = "", className = "w-16 h-16" }) {
  let hash = index
  if (name && typeof name === 'string') {
    hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  }
  const preset = WARRIOR_BADGES[Math.abs(hash) % WARRIOR_BADGES.length]

  return (
    <div 
      title={preset.name}
      className={`relative rounded-full border-2 p-0.5 bg-slate-950 ${preset.ringColor} ${className} transition-transform hover:scale-110 duration-200 cursor-pointer shadow-lg`}
    >
      {preset.render()}
    </div>
  )
}
