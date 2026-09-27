export function CraneSVG({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 170 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <line
        x1="12"
        y1="142"
        x2="160"
        y2="142"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.4"
      />
      <line
        x1="92"
        y1="142"
        x2="100"
        y2="18"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="86"
        y1="142"
        x2="94"
        y2="18"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        x1="62"
        y1="16"
        x2="128"
        y2="16"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="100"
        y1="16"
        x2="100"
        y2="7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <line
        x1="102"
        y1="22"
        x2="162"
        y2="32"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
      />
      <line
        x1="102"
        y1="26"
        x2="160"
        y2="29"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.55"
      />
      <line
        x1="102"
        y1="22"
        x2="46"
        y2="13"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect
        x="30"
        y="8"
        width="20"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="118"
        y1="18"
        x2="150"
        y2="30"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.6"
      />
      <line
        x1="138"
        y1="29"
        x2="138"
        y2="74"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M138 74 v8 a7 7 0 0 0 14 0 v-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="148"
        y="88"
        width="12"
        height="10"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.8"
      />
    </svg>
  );
}

export function BlueprintSVG({ className = "" }) {
  const windows = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 4; c++) {
      windows.push([52 + c * 18, 66 + r * 16]);
    }
  }

  return (
    <svg
      className={className}
      viewBox="0 0 170 150"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern
          id="bt-grid-1"
          width="14"
          height="14"
          patternUnits="userSpaceOnUse"
        >
          <path
            d="M14 0H0V14"
            className="bt-grid"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.18"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect
        className="bt-page"
        width="170"
        height="150"
        fill="url(#bt-grid-1)"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
      <path d="M34 46 H130 V118 H34 Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M34 46 L60 20 H130 V46" stroke="currentColor" strokeWidth="1.5" />
      {windows.map(([x, y], i) => (
        <rect
          key={i}
          x={x}
          y={y}
          width="10"
          height="12"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          strokeOpacity="0.55"
        />
      ))}
      <rect
        x="63"
        y="96"
        width="18"
        height="22"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <line
        x1="24"
        y1="138"
        x2="146"
        y2="138"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.7"
      />
      <path
        d="M20 138 v8 M28 138 v8 M142 138 v8 M150 138 v8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeOpacity="0.7"
        strokeLinecap="round"
      />
      <circle
        cx="148"
        cy="20"
        r="9"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.6"
      />
      <path
        d="M148 9 v22 M137 20 h22"
        stroke="currentColor"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
    </svg>
  );
}

export function IsoBuilding({ className = "" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g>
        <polygon
          points="100,16 170,52 100,88 30,52"
          fill="#3e4f5f"
          stroke="#4e6376"
          strokeWidth="1"
        />
        <polygon
          points="30,52 100,88 100,150 30,114"
          fill="#26333f"
          stroke="#31404e"
          strokeWidth="1"
        />
        <polygon
          points="100,88 170,52 170,114 100,150"
          fill="#31404f"
          stroke="#4e6376"
          strokeWidth="1"
        />
        <line
          x1="100"
          y1="16"
          x2="170"
          y2="52"
          stroke="#ff6b16"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="16"
          x2="100"
          y2="0"
          stroke="#8b9aab"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="100" cy="2" r="2.4" fill="#ff6b16" />
        <polygon
          points="120,36 142,47 142,55 120,44"
          fill="#1c252e"
          opacity="0.8"
        />
        <rect x="52" y="52" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="64" y="52" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="52" y="68" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="64" y="68" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="128" y="52" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="140" y="52" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="128" y="68" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="140" y="68" width="10" height="14" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
        <rect x="90" y="96" width="20" height="30" fill="#17202a" stroke="#42546a" strokeWidth="0.8" />
      </g>
    </svg>
  );
}