import React from 'react';
import { cn } from '../../lib/utils';

export const BentoGrid = ({ className, children }) => {
  return (
    <div
      className={cn(
        'grid md:auto-rows-[18rem] grid-cols-1 md:grid-cols-3 gap-4 max-w-7xl mx-auto',
        className
      )}
    >
      {children}
    </div>
  );
};

export const BentoGridItem = ({
  className,
  title,
  description,
  header,
  icon,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'row-span-1 rounded-2xl group/bento hover:shadow-2xl transition duration-300 shadow-input p-5 bg-slate-900/60 border border-slate-800/80 backdrop-blur-md justify-between flex flex-col space-y-4 hover:border-blue-500/50 hover:bg-slate-900/90 relative overflow-hidden',
        onClick ? 'cursor-pointer' : '',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover/bento:opacity-100 transition duration-300 pointer-events-none" />
      {header}
      <div className="group-hover/bento:translate-x-1 transition duration-200 z-10">
        {icon}
        <div className="font-bold text-slate-100 text-lg mb-1 mt-2">
          {title}
        </div>
        <div className="font-normal text-slate-400 text-sm leading-relaxed">
          {description}
        </div>
      </div>
    </div>
  );
};

export default BentoGrid;
