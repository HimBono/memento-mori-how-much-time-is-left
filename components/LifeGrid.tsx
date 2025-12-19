import React from 'react';

interface LifeGridProps {
  weeksLived: number;
  totalWeeks: number;
}

const LifeGrid: React.FC<LifeGridProps> = ({ weeksLived, totalWeeks }) => {
  const total = Math.ceil(totalWeeks);
  const lived = Math.floor(weeksLived);

  return (
    <div className="mystic-card">
      <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Your Life in Weeks</h3>
        <div style={{ fontSize: '0.8rem', color: '#6e7a74' }}>
          <span style={{ marginRight: '15px' }}>■ Lived</span>
          <span style={{ opacity: 0.7 }}>□ Future</span>
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(7px, 1fr))',
        gap: '3px',
        paddingRight: '6px'
      }}>
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`grid-cell ${i < lived ? 'lived' : ''}`}
            title={`Week ${i + 1}`}
          />
        ))}
      </div>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.9rem', color: '#aaa', fontStyle: 'italic' }}>
          "The blank squares are yours to fill."
        </p>
      </div>
    </div>
  );
};

export default LifeGrid;
