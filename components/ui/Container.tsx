import React from 'react';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  size?: 'default' | 'layout' | 'wide'; // default: 1520px, layout: 1440px, wide: 1880px
}

export const Container: React.FC<ContainerProps> = ({ children, className = '', size = 'default' }) => {
  const maxWidth =
    size === 'wide'
      ? 'max-w-[1880px]'
      : size === 'layout'
        ? 'max-w-[1440px]'
        : 'max-w-[1520px]';
  
  return (
    <div className={`${maxWidth} mx-auto px-4 md:px-8 ${className}`}>
      {children}
    </div>
  );
};
