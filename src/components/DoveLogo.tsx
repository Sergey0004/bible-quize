export function DoveLogo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 88 64"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Body */}
      <ellipse cx="34" cy="40" rx="20" ry="12" fill="currentColor" />
      {/* Head */}
      <circle cx="51" cy="27" r="11" fill="currentColor" />
      {/* Neck connector */}
      <ellipse cx="42" cy="34" rx="9" ry="7" fill="currentColor" />
      {/* Wing highlight */}
      <path
        d="M22 38 Q20 26 34 30 Q40 32 36 38"
        fill="white"
        fillOpacity="0.28"
      />
      {/* Tail feathers */}
      <path
        d="M14 42 Q5 36 7 44 Q5 49 14 45 Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M16 44 Q8 40 10 48 Q8 52 16 48 Z"
        fill="currentColor"
        opacity="0.60"
      />
      {/* Eye */}
      <circle cx="54" cy="25" r="2.2" fill="#1a0e04" />
      <circle cx="54.7" cy="24.3" r="0.8" fill="white" />
      {/* Beak */}
      <path d="M61 26 L68 28 L61 30 Z" fill="#d4973e" />
      {/* Branch */}
      <path
        d="M68 28 Q73 24 79 21"
        stroke="#8B6330"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* Olive leaves */}
      <ellipse
        cx="73"
        cy="21"
        rx="4.5"
        ry="2"
        fill="#3d7a34"
        transform="rotate(-35 73 21)"
      />
      <ellipse
        cx="78"
        cy="19"
        rx="4.5"
        ry="2"
        fill="#4d8c44"
        transform="rotate(-22 78 19)"
      />
      <ellipse
        cx="75"
        cy="26"
        rx="4"
        ry="1.8"
        fill="#3d7a34"
        transform="rotate(-55 75 26)"
      />
    </svg>
  )
}
