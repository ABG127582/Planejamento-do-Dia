import React from 'react';

interface ProgressRingProps {
  radius: number;
  stroke: number;
  progress: number;
}

const ProgressRing: React.FC<ProgressRingProps> = ({ radius, stroke, progress }) => {
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="rotate-[-90deg] transition-all duration-500"
      >
        <circle
          className="text-gray-200 dark:text-gray-700"
          strokeWidth={stroke}
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          className="text-primary transition-all duration-500 ease-out"
          strokeWidth={stroke}
          strokeDasharray={circumference + ' ' + circumference}
          style={{ strokeDashoffset }}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>
      <div className="absolute text-xs font-bold text-gray-700 dark:text-gray-200">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

export default ProgressRing;