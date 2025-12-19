import React from 'react';

interface InsightCardProps {
  label: string;
  count: number;
  icon?: React.ReactNode;
  description: string;
}

const InsightCard: React.FC<InsightCardProps> = ({ label, count, description }) => {
  return (
    <div className="mystic-card" style={{ textAlign: 'center' }}>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{new Intl.NumberFormat().format(count)}</div>
      <p style={{ fontSize: '0.8rem', color: '#666', marginTop: '5px' }}>{description}</p>
    </div>
  );
};

export default InsightCard;
