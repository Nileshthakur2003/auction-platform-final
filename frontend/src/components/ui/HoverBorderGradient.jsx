import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const HoverBorderGradient = ({
  children,
  containerClassName,
  className,
  as: Tag = 'button',
  duration = 1,
  clockwise = true,
  ...props
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        'relative flex rounded-full border border-slate-800 bg-slate-950/80 p-[1px] transition-all duration-300 hover:border-blue-500/50 hover:shadow-[0_0_25px_rgba(59,130,246,0.3)]',
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          'w-full text-white z-10 bg-slate-950 px-5 py-2.5 rounded-full flex items-center justify-center font-medium',
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          'flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]'
        )}
        style={{
          filter: 'blur(3px)',
          position: 'absolute',
          width: '100%',
          height: '100%',
        }}
        initial={{ background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, transparent 60%)' }}
        animate={{
          background: hovered
            ? 'radial-gradient(circle, rgba(99,102,241,0.8) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, transparent 60%)',
        }}
        transition={{ duration }}
      />
    </Tag>
  );
};

export default HoverBorderGradient;
