import React from 'react';

interface TooltipProps {
  content?: React.ReactNode;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  return <>{children}</>;
};
