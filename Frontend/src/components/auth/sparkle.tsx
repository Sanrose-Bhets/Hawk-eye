const sparkles = [
  { top: '10%', left: '15%', size: 14, delay: 0 },
  { top: '20%', left: '75%', size: 10, delay: 0.5 },
  { top: '35%', left: '40%', size: 16, delay: 1 },
  { top: '45%', left: '85%', size: 12, delay: 1.5 },
  { top: '55%', left: '20%', size: 8, delay: 2 },
  { top: '65%', left: '60%', size: 14, delay: 0.3 },
  { top: '75%', left: '10%', size: 10, delay: 0.8 },
  { top: '80%', left: '80%', size: 12, delay: 1.2 },
  { top: '15%', left: '55%', size: 8, delay: 1.8 },
  { top: '90%', left: '45%', size: 10, delay: 0.6 },
  { top: '30%', left: '90%', size: 14, delay: 2.2 },
  { top: '50%', left: '5%', size: 10, delay: 1.4 },
];

function SparkleIcon({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L14.09 8.26L20 9.27L15.55 13.97L16.91 20L12 16.9L7.09 20L8.45 13.97L4 9.27L9.91 8.26L12 2Z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

export function Sparkles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {sparkles.map((s, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: s.top,
            left: s.left,
            animation: `twinkle 3s ease-in-out ${s.delay}s infinite`,
          }}
        >
          <SparkleIcon size={s.size} />
        </div>
      ))}
    </div>
  );
}
