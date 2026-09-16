import React, { useState } from 'react';
import { FiUser } from 'react-icons/fi';

interface UserAvatarProps {
  src?: string | null;
  name?: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  name,
  size = 36,
  className = '',
  style = {},
}) => {
  const [imgError, setImgError] = useState(false);

  // Helper for initials
  const getInitials = (fullName?: string) => {
    if (!fullName || !fullName.trim()) return '';
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const initials = getInitials(name);
  const dimension = typeof size === 'number' ? `${size}px` : size;

  const baseStyle: React.CSSProperties = {
    width: dimension,
    height: dimension,
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontSize: typeof size === 'number' ? `${Math.max(12, Math.floor(size * 0.4))}px` : '0.85rem',
    background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    color: '#ffffff',
    userSelect: 'none',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    ...style,
  };

  if (src && !imgError && !src.includes('pravatar.cc')) {
    return (
      <img
        src={src}
        alt={name || 'Avatar'}
        className={className}
        style={baseStyle}
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className={className} style={baseStyle} title={name || 'User'}>
      {initials ? initials : <FiUser size={typeof size === 'number' ? Math.floor(size * 0.5) : 16} />}
    </div>
  );
};

export default UserAvatar;
