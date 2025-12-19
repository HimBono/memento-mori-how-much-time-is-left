
import React from 'react';

interface TimeCardProps {
  label: string;
  value: number;
  unit: string;
  color: string;
}

const TimeCard: React.FC<TimeCardProps> = ({ label, value, unit, color }) => {
  const formattedValue = new Intl.NumberFormat().format(Math.floor(value));

  return (
    <div className={`glass p-6 rounded-2xl shadow-xl transition-transform hover:scale-105 border-t-4 ${color}`}>
      <p className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">{label}</p>
      <div className="flex items-baseline gap-2">
        <h3 className="text-3xl font-bold text-white">{formattedValue}</h3>
        <span className="text-slate-500 text-sm">{unit}</span>
      </div>
    </div>
  );
};

export default TimeCard;
