import React from 'react';
import { PencilLine } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../src/context/AuthContext';

interface PublicPageEditButtonProps {
  to?: string;
  onClick?: () => void;
  label?: string;
  className?: string;
}

export const PublicPageEditButton: React.FC<PublicPageEditButtonProps> = ({
  to,
  onClick,
  label = '수정하기',
  className = '',
}) => {
  const { user, userProfile, isAdmin, loading } = useAuth();

  if (loading || !user || !userProfile || !isAdmin || (!to && !onClick)) {
    return null;
  }

  const buttonClassName =
    'inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50';

  return (
    <div className={`flex justify-end ${className}`}>
      {onClick ? (
        <button type="button" onClick={onClick} className={buttonClassName}>
          <PencilLine size={16} />
          {label}
        </button>
      ) : (
        <Link to={to!} className={buttonClassName}>
          <PencilLine size={16} />
          {label}
        </Link>
      )}
    </div>
  );
};
