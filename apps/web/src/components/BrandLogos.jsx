import React from 'react';

/**
 * 1. buildgate — The Gate for Systems (Architecture + Space + Light)
 * Derived from the official brand identity:
 * - 3 ascending architectural monolith planes framing an open negative-space passage
 * - Warm Ivory to Aura Amber sunlight ray passing through the threshold
 * - Poised celestial orb hovering above the gate
 */
export function BuildgateLogo({ className = "w-8 h-8", monochrome = false }) {
  if (monochrome) {
    return (
      <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M7 16L15 8V38L7 42V16Z" fill="currentColor" fillOpacity="0.4" />
        <path d="M19 12L28 4V42L19 46V12Z" fill="currentColor" fillOpacity="0.9" />
        <path d="M32 18L40 11V36L32 40V18Z" fill="currentColor" fillOpacity="0.6" />
        <circle cx="34" cy="7" r="3" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg 
      className={className} 
      viewBox="0 0 54 50" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Monolith 1 (Left Plane) */}
        <linearGradient id="bgMono1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F5F4F0" stopOpacity="0.9" />
          <stop offset="40%" stopColor="#CBD5E1" stopOpacity="0.75" />
          <stop offset="100%" stopColor="#1B2636" stopOpacity="0.9" />
        </linearGradient>

        {/* Monolith 2 (Center Dominant Portal Pillar) */}
        <linearGradient id="bgMono2" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#F5F4F0" />
          <stop offset="70%" stopColor="#94A3B8" />
          <stop offset="100%" stopColor="#0B1018" />
        </linearGradient>

        {/* Monolith 3 (Right Refractive Plane) */}
        <linearGradient id="bgMono3" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2E8F0" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#64748B" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#1E293B" stopOpacity="0.85" />
        </linearGradient>

        {/* Warm Sunlight Beam / Aura Passing Through Portal */}
        <linearGradient id="bgSunBeam" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.95" />
          <stop offset="30%" stopColor="#F59E0B" stopOpacity="0.7" />
          <stop offset="70%" stopColor="#D97706" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#F5F4F0" stopOpacity="0" />
        </linearGradient>

        {/* Floating Celestial Orb Gradient */}
        <radialGradient id="bgCelestialOrb" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="45%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#B45309" />
        </radialGradient>

        {/* Ambient Bloom Filter */}
        <filter id="bgSunGlow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#F59E0B" floodOpacity="0.6" />
        </filter>
        <filter id="bgPortalGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" floodColor="#000000" floodOpacity="0.5" />
        </filter>
      </defs>

      {/* Radiant Light Beam slicing through the threshold */}
      <path 
        d="M23 12L39 4L47 18L19 44L13 36L23 12Z" 
        fill="url(#bgSunBeam)" 
        opacity="0.55"
        style={{ mixBlendMode: 'screen' }}
      />

      {/* Left Monolith (Tilted Isometric Slab 1) */}
      <path 
        d="M8 18.5L16.5 10.5V38.5L8 43V18.5Z" 
        fill="url(#bgMono1)" 
        filter="url(#bgPortalGlow)"
      />
      {/* Slab 1 Bevel Reflection */}
      <path 
        d="M8 18.5L16.5 10.5L19 13L10.5 21L8 18.5Z" 
        fill="#FFFFFF" 
        opacity="0.4"
      />

      {/* Center Dominant Monolith (Pillar 2 — Towering Threshold) */}
      <path 
        d="M21 13L31.5 3.5V41.5L21 46.5V13Z" 
        fill="url(#bgMono2)" 
        filter="url(#bgPortalGlow)"
      />
      {/* Pillar 2 Bevel Top Reflection */}
      <path 
        d="M21 13L31.5 3.5L34.5 6.5L24 16L21 13Z" 
        fill="#FFFFFF" 
        opacity="0.6"
      />
      {/* Golden Light Catch on Pillar Inner Edge */}
      <path 
        d="M31.5 3.5V41.5L30 42.2V4.8L31.5 3.5Z" 
        fill="#FDE68A" 
        opacity="0.8"
      />

      {/* Right Monolith (Pillar 3 — Outer Aperture Frame) */}
      <path 
        d="M36 20.5L44.5 12.5V36.5L36 41V20.5Z" 
        fill="url(#bgMono3)" 
        filter="url(#bgPortalGlow)"
      />
      {/* Pillar 3 Top Bevel Reflection */}
      <path 
        d="M36 20.5L44.5 12.5L46.5 14.5L38 22.5L36 20.5Z" 
        fill="#FFFFFF" 
        opacity="0.3"
      />

      {/* Poised Celestial Orb hovering above threshold */}
      <circle 
        cx="39" 
        cy="7.5" 
        r="4" 
        fill="url(#bgCelestialOrb)" 
        filter="url(#bgSunGlow)"
      />
      <circle 
        cx="37.8" 
        cy="6.3" 
        r="1.2" 
        fill="#FFFFFF" 
        opacity="0.75" 
      />
    </svg>
  );
}

/**
 * Full Wordmark: lowercase `buildgate` + `THE GATE FOR SYSTEMS`
 */
export function BuildgateWordmark({ className = "flex items-center gap-3", showTagline = true }) {
  return (
    <div className={className}>
      <BuildgateLogo className="w-9 h-9 shrink-0 drop-shadow-[0_0_16px_rgba(245,158,11,0.25)]" />
      <div className="flex flex-col">
        <span className="text-xl font-bold tracking-tight text-white font-sans lowercase leading-none">
          buildgate
        </span>
        {showTagline && (
          <span className="text-[9px] font-mono tracking-[0.2em] uppercase text-amber-200/70 font-semibold mt-1">
            The Gate for Systems
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * 2. buildvibe — Agentic Build Partner
 * Mobius topological loop with dark metallic agent sphere
 */
export function BuildvibeMark({ className = "w-8 h-8" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bvRibbon" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#A78BFA" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>
        <radialGradient id="bvSphere" cx="30%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="50%" stopColor="#1E293B" />
          <stop offset="100%" stopColor="#0B1018" />
        </radialGradient>
        <filter id="bvGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#8B5CF6" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Infinity / Mobius Continuous Topological Ribbon */}
      <path 
        d="M15 16C9 16 6 20 6 24C6 28 9 32 15 32C22 32 26 21 33 21C39 21 42 23 42 26C42 29 39 31 34 31C28 31 23 20 15 16Z" 
        stroke="url(#bvRibbon)" 
        strokeWidth="4" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        filter="url(#bvGlow)"
      />

      {/* Central Agent Sphere with Specular Highlight */}
      <circle cx="24" cy="24" r="7.5" fill="url(#bvSphere)" stroke="#818CF8" strokeWidth="1" />
      <ellipse cx="22" cy="21.5" rx="2.5" ry="1.5" fill="#FFFFFF" fillOpacity="0.6" />
      <circle cx="24" cy="24" r="2.5" fill="#A78BFA" opacity="0.9" />
    </svg>
  );
}

// Keep BuildvibeOrb as an alias for backwards compatibility
export function BuildvibeOrb({ className = "w-8 h-8", pulse = true }) {
  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <BuildvibeMark className="w-full h-full" />
      {pulse && (
        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-violet-400 animate-ping"></span>
      )}
    </div>
  );
}

/**
 * 3. legit.run — Verification for the AI Era
 * Precision glass prism / cyan refractive delta
 */
export function LegitRunLogo({ className = "w-8 h-8" }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 48 48" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="lrFacetA" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#80D8FF" />
          <stop offset="60%" stopColor="#00E5FF" />
          <stop offset="100%" stopColor="#00B0FF" />
        </linearGradient>
        <linearGradient id="lrFacetB" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#C6F2E1" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <filter id="lrGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="3" stdDeviation="5" floodColor="#00E5FF" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Hexagonal / Delta Precision Glass Prism */}
      <path 
        d="M24 6L40 15.5V34.5L24 44L8 34.5V15.5L24 6Z" 
        fill="#0B1018" 
        stroke="url(#lrFacetA)" 
        strokeWidth="1.5" 
        filter="url(#lrGlow)"
      />
      {/* Front Facet */}
      <path 
        d="M24 6L40 15.5L24 25L8 15.5L24 6Z" 
        fill="url(#lrFacetA)" 
        fillOpacity="0.35" 
      />
      {/* Left Verified Facet */}
      <path 
        d="M8 15.5L24 25V44L8 34.5V15.5Z" 
        fill="url(#lrFacetB)" 
        fillOpacity="0.45" 
      />
      {/* Right Depth Facet */}
      <path 
        d="M40 15.5L24 25V44L40 34.5V15.5Z" 
        fill="url(#lrFacetA)" 
        fillOpacity="0.15" 
      />
      {/* Verified Core Beacon */}
      <circle cx="24" cy="25" r="3.5" fill="#C6F2E1" />
    </svg>
  );
}

export function LegitRunMark(props) {
  return <LegitRunLogo {...props} />;
}

/**
 * 4. Voice Waveform for Tone of Voice
 */
export function VoiceWaveform({ className = "w-24 h-6", active = false }) {
  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {[40, 75, 100, 60, 85, 45, 90, 70, 35, 80, 95, 50, 65, 30].map((h, i) => (
        <span 
          key={i} 
          className="w-1 bg-gradient-to-t from-sky-500 to-indigo-400 rounded-full transition-all duration-300"
          style={{ 
            height: `${active ? h : Math.max(20, h * 0.4)}%`,
            opacity: active ? 0.9 : 0.4
          }}
        />
      ))}
    </div>
  );
}

/**
 * 5. Stack Badges (Cursor, Lovable, v0, Replit, Next.js, Supabase, Stripe, etc.)
 */
export function StackBadge({ name, className = "w-5 h-5" }) {
  switch (name.toLowerCase()) {
    case 'cursor':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M4 4L19 11L12 13L9 20L4 4Z" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" strokeLinejoin="round" />
        </svg>
      );
    case 'lovable':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.28 2 8.5C2 5.42 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.09C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.42 22 8.5C22 12.28 18.6 15.36 13.45 20.04L12 21.35Z" fill="#F43F5E" />
        </svg>
      );
    case 'v0':
      return (
        <div className={`${className} flex items-center justify-center font-black text-[10px] bg-white text-black rounded font-mono`}>
          v0
        </div>
      );
    case 'replit':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M6 5H13V9H6V5Z" fill="#F97316" />
          <path d="M11 9H18V13H11V9Z" fill="#F97316" />
          <path d="M6 13H13V17H6V13Z" fill="#F97316" />
        </svg>
      );
    case 'bolt':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M13 2L4 14H12L11 22L20 10H12L13 2Z" fill="#EAB308" />
        </svg>
      );
    case 'nextjs':
    case 'next.js':
      return (
        <div className={`${className} flex items-center justify-center font-black text-[9px] bg-black text-white rounded-full border border-white/20 font-mono`}>
          N
        </div>
      );
    case 'supabase':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
          <path d="M13.5 2L4 14.5H12L10.5 22L20 9.5H12L13.5 2Z" fill="#3ECF8E" />
        </svg>
      );
    case 'stripe':
      return (
        <div className={`${className} flex items-center justify-center font-black text-[10px] bg-[#635BFF] text-white rounded font-sans`}>
          S
        </div>
      );
    default:
      return (
        <div className={`${className} rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white`}>
          {name.charAt(0).toUpperCase()}
        </div>
      );
  }
}
