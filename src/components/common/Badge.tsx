import React from 'react';

interface Props {
  children: React.ReactNode;
  color?: 'green' | 'yellow' | 'gray' | 'blue' | 'red';
}

const colors = {
  green: { bg: 'rgba(63,185,80,0.15)', text: 'var(--green)', border: 'rgba(63,185,80,0.3)' },
  yellow: { bg: 'rgba(210,153,34,0.15)', text: 'var(--yellow)', border: 'rgba(210,153,34,0.3)' },
  gray: { bg: 'rgba(139,148,158,0.15)', text: 'var(--text2)', border: 'rgba(139,148,158,0.3)' },
  blue: { bg: 'rgba(31,111,235,0.15)', text: 'var(--accent-hover)', border: 'rgba(31,111,235,0.3)' },
  red: { bg: 'rgba(248,81,73,0.15)', text: 'var(--red)', border: 'rgba(248,81,73,0.3)' },
};

export const Badge: React.FC<Props> = ({ children, color = 'gray' }) => {
  const c = colors[color];
  return (
    <span style={{
      display: 'inline-block',
      fontSize: 11,
      fontWeight: 600,
      padding: '1px 6px',
      borderRadius: 4,
      background: c.bg,
      color: c.text,
      border: `1px solid ${c.border}`,
      letterSpacing: '0.3px',
    }}>
      {children}
    </span>
  );
};
