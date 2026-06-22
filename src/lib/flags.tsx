export function IsraelFlag({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 14"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* White background */}
      <rect width="20" height="14" fill="white" />
      {/* Top blue stripe */}
      <rect y="2" width="20" height="2.4" fill="#0038B8" />
      {/* Bottom blue stripe */}
      <rect y="9.6" width="20" height="2.4" fill="#0038B8" />
      {/* Star of David — two outline equilateral triangles centered at (10, 7) */}
      {/* Triangle pointing up: apex (10,5), base (8.27,8.5) → (11.73,8.5) */}
      <polygon
        points="10,5 8.27,8.5 11.73,8.5"
        fill="none"
        stroke="#0038B8"
        strokeWidth="0.65"
        strokeLinejoin="round"
      />
      {/* Triangle pointing down: apex (10,9), top-L (8.27,5.5) → top-R (11.73,5.5) */}
      <polygon
        points="10,9 8.27,5.5 11.73,5.5"
        fill="none"
        stroke="#0038B8"
        strokeWidth="0.65"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function UsaFlag({ className }: { className?: string }) {
  // 13 stripes: each 14/13 ≈ 1.077px tall in a 20×14 viewBox.
  // Canton covers the top 7 stripes (7 × 1.077 ≈ 7.54px) × 8px wide.
  const sh = 14 / 13; // stripe height
  return (
    <svg
      viewBox="0 0 20 14"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      focusable="false"
    >
      {/* Red background (odd stripes) */}
      <rect width="20" height="14" fill="#B22234" />
      {/* White stripes — even positions (0-indexed: stripes 1,3,5,7,9,11) */}
      {[1, 3, 5, 7, 9, 11].map((n) => (
        <rect key={n} y={n * sh} width="20" height={sh} fill="white" />
      ))}
      {/* Blue canton */}
      <rect width="8" height={7 * sh} fill="#3C3B6E" />
      {/* Stars — 3 rows of 3 alternating with 3 rows of 2, radius 0.42 */}
      {(
        [
          [0.9, 2.7, 4.5, 6.3],
          [1.8, 3.6, 5.4],
          [0.9, 2.7, 4.5, 6.3],
          [1.8, 3.6, 5.4],
          [0.9, 2.7, 4.5, 6.3],
          [1.8, 3.6, 5.4],
        ] as number[][]
      ).map((row, ri) =>
        row.map((cx) => (
          <circle
            key={`${ri}-${cx}`}
            cx={cx}
            cy={sh * (ri * 1.1 + 0.55)}
            r="0.42"
            fill="white"
          />
        )),
      )}
    </svg>
  );
}
