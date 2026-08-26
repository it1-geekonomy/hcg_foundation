/* =========================================================
   RIBBON PATH
========================================================= */

const RIBBON_PATH =
  "M38 262 C100 172 172 108 142 46 C126 8 54 8 38 46 C8 108 80 172 142 262";

/* =========================================================
   REVERSE-U LOOP ONLY
========================================================= */

const LOOP_PATH = "M142 46 C126 8 54 8 38 46";

/* =========================================================
   NOTCHES
========================================================= */

const NOTCH_LEFT = "48,278 20,256 42,254";
const NOTCH_RIGHT = "160,258 128,276 138,253";

/* =========================================================
   RIBBON
========================================================= */

export default function Ribbon({ id, delay, active }: { id: string; delay: number; active: boolean }) {
  return (
    <svg viewBox="0 0 200 285" className="h-72 w-auto" aria-hidden="true">
      <defs>
        {/* =================================================
            MAIN RIBBON
        ================================================= */}

        <linearGradient id={`base-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#FDC61D" />
          <stop offset="100%" stopColor="#FDC61D" />
        </linearGradient>

        {/* =================================================
            ORIGINAL SHEEN COLOR

            This is the same color from your animated
            sheen:

            #FFE486

            But this version is STATIC.
        ================================================= */}

        <linearGradient
          id={`loop-glow-${id}`}
          gradientUnits="userSpaceOnUse"
          x1="38"
          y1="8"
          x2="142"
          y2="46"
        >
          <stop offset="0%" stopColor="#FDC61D" />
          <stop offset="35%" stopColor="#FDC61D" />
          <stop offset="50%" stopColor="#FFE486" />
          <stop offset="65%" stopColor="#FDC61D" />
          <stop offset="100%" stopColor="#FDC61D" />
        </linearGradient>

        {/* =================================================
            SOFT GLOW FILTER

            Makes #FFE486 look luminous instead of like
            another solid ribbon.
        ================================================= */}

        <filter id={`loop-glow-filter-${id}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        {/* =================================================
            NOTCH MASK
        ================================================= */}

        <mask id={`notch-${id}`} maskUnits="userSpaceOnUse">
          <rect x="0" y="0" width="200" height="285" fill="white" />
          <polygon points={NOTCH_LEFT} fill="black" />
          <polygon points={NOTCH_RIGHT} fill="black" />
        </mask>
      </defs>

      <g mask={`url(#notch-${id})`}>
        {/* =================================================
            1. SOFT STATIC GLOW BEHIND LOOP

            Uses the same #FFE486 sheen color.
            NO ANIMATION.
        ================================================= */}

        <path
          d={LOOP_PATH}
          fill="none"
          stroke="#FFE486"
          strokeWidth={36}
          strokeLinecap="butt"
          filter={`url(#loop-glow-filter-${id})`}
          style={{
            opacity: active ? 0.45 : 0,
            transition: `opacity 1s ease-out ${delay}s`,
          }}
        />

        {/* =================================================
            2. MAIN RIBBON

            Remains #FDC61D.
        ================================================= */}

        <path
          d={RIBBON_PATH}
          fill="none"
          stroke={`url(#base-${id})`}
          strokeWidth={30}
          strokeLinecap="butt"
          style={{
            strokeDasharray: 800,
            strokeDashoffset: active ? 0 : 800,
            transition: `stroke-dashoffset 1.6s ease-out ${delay}s`,
          }}
        />

        <path
          d={LOOP_PATH}
          fill="none"
          stroke={`url(#loop-glow-${id})`}
          strokeWidth={30}
          strokeLinecap="butt"
          style={{
            opacity: active ? 1 : 0,
            transition: `opacity 0.8s ease-out ${delay}s`,
          }}
        />

        {/* =================================================
            4. VERY SOFT CENTER GLOW

            Adds the transparent glow around the
            #FFE486 sheen.
        ================================================= */}

        <path
          d={LOOP_PATH}
          fill="none"
          stroke="#FFE486"
          strokeWidth={20}
          strokeLinecap="butt"
          filter={`url(#loop-glow-filter-${id})`}
          style={{
            opacity: active ? 0.35 : 0,
            transition: `opacity 0.8s ease-out ${delay}s`,
          }}
        />

        <path d={RIBBON_PATH} fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth={31} strokeLinecap="butt" />
      </g>
    </svg>
  );
}