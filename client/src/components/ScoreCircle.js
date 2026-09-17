import React from 'react';

const ScoreCircle = ({ score, label, size = 120 }) => {
  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s) => {
    if (s >= 70) return '#48bb78';
    if (s >= 50) return '#f6ad55';
    return '#fc8181';
  };

  const color = getColor(score);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#2d3142"
          strokeWidth="10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="middle"
          fill={color}
          fontSize={size / 4.5}
          fontWeight="700"
          fontFamily="Inter, sans-serif"
        >
          {score}%
        </text>
      </svg>
      <span style={{ fontSize: '0.82rem', color: '#8892a4', textAlign: 'center' }}>{label}</span>
    </div>
  );
};

export default ScoreCircle;

// That ScoreCircle component is a visual progress indicator. It’s designed to show a numeric score (like a percentage) inside a circular chart, with color coding to reflect performance levels.