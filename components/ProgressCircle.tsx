import React from 'react';

interface ProgressCircleProps {
  percent: number;
}

const ProgressCircle: React.FC<ProgressCircleProps> = ({ percent }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(percent, 100) / 100) * circumference;

  return (
    <div style={{ position: 'relative', width: '140px', height: '140px' }}>
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)' }}>
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#333"
          strokeWidth="8"
          fill="transparent"
        />
        <circle
          cx="70"
          cy="70"
          r={radius}
          stroke="#e0e0e0"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          style={{ strokeDashoffset, transition: 'stroke-dashoffset 1s ease-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
        <span style={{ fontFamily: 'Cinzel', fontSize: '24px', fontWeight: 'bold' }}>{Math.floor(percent)}%</span>
        <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#888' }}>LIVED</span>
      </div>
    </div>
  );
};

export default ProgressCircle;
