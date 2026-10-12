// src/components/Logo.tsx
'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 30, text: 18, gap: 10 },
    md: { icon: 36, text: 21, gap: 11 },
    lg: { icon: 46, text: 28, gap: 13 },
  };

  const s = sizes[size];

  return (
    <div
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: s.gap,
        userSelect: 'none',
        lineHeight: 1,
      }}
    >
      {/* Sleek Minimalist Geometric Icon Mark */}
      <svg
        width={s.icon}
        height={s.icon}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
      >
        <defs>
          <linearGradient id={`mimikGrad-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <linearGradient id={`mimikBg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#131728" />
            <stop offset="100%" stopColor="#0b0e1b" />
          </linearGradient>
        </defs>

        {/* Squircle Background Container with Subtle Border */}
        <rect
          width="36"
          height="36"
          rx="10"
          fill={`url(#mimikBg-${size})`}
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1"
        />

        {/* Futuristic Interlocking "M" (Mimicry Wave & Avatar Silhouette) */}
        <path
          d="M8.5 25.5V13.8C8.5 11.2 10.6 9.8 13.2 11.8L18 15.6L22.8 11.8C25.4 9.8 27.5 11.2 27.5 13.8V25.5"
          stroke={`url(#mimikGrad-${size})`}
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Core Glowing AI Node */}
        <circle cx="18" cy="20.5" r="2.2" fill="#ec4899" />
      </svg>

      {/* Brand Name Typography - Single Clean Horizontal Line */}
      {showText && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            whiteSpace: 'nowrap',
            letterSpacing: '-0.4px',
            fontFamily: 'inherit',
          }}
        >
          <span
            style={{
              fontSize: s.text,
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.5px',
            }}
          >
            Mimik
          </span>
          <span
            style={{
              fontSize: s.text,
              fontWeight: 800,
              background: 'linear-gradient(135deg, #818cf8 0%, #c084fc 50%, #f472b6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginLeft: 4,
            }}
          >
            AI
          </span>
        </div>
      )}
    </div>
  );
}
