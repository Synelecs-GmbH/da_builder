import React from 'react';

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
}

export const Btn: React.FC<Props> = ({ variant = 'secondary', size = 'md', style, children, ...rest }) => {
  const base: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    borderRadius: 'var(--radius)',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    transition: 'background 0.15s, border-color 0.15s, color 0.15s',
    cursor: rest.disabled ? 'not-allowed' : 'pointer',
    opacity: rest.disabled ? 0.5 : 1,
    padding: size === 'sm' ? '3px 8px' : '5px 12px',
    fontSize: size === 'sm' ? 12 : 13,
  };

  const variants: Record<string, React.CSSProperties> = {
    primary: { background: 'var(--accent)', color: '#fff', border: '1px solid transparent' },
    secondary: { background: 'var(--bg3)', color: 'var(--text)', border: '1px solid var(--border)' },
    ghost: { background: 'transparent', color: 'var(--text2)', border: '1px solid transparent' },
    danger: { background: 'rgba(248,81,73,0.1)', color: 'var(--red)', border: '1px solid rgba(248,81,73,0.3)' },
  };

  return (
    <button style={{ ...base, ...variants[variant], ...style }} {...rest}>
      {children}
    </button>
  );
};
