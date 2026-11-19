import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export const Button = ({
  borderRadius = '1rem',
  children,
  as: Component = 'button',
  containerClassName,
  borderClassName,
  duration = 3000,
  className,
  ...otherProps
}) => {
  return (
    <Component
      className={cn(
        'bg-transparent relative text-base p-[1px] overflow-hidden inline-flex items-center justify-center font-semibold',
        containerClassName
      )}
      style={{
        borderRadius: borderRadius,
      }}
      {...otherProps}
    >
      <div
        className="absolute inset-0"
        style={{ borderRadius: `calc(${borderRadius} * 0.96)` }}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: duration / 1000,
            repeat: Infinity,
            ease: 'linear',
          }}
          className={cn(
            'h-28 w-28 opacity-80 bg-[radial-gradient(#38bdf8_40%,transparent_60%)] absolute -top-4 -left-4',
            borderClassName
          )}
        />
      </div>

      <div
        className={cn(
          'relative bg-slate-900 border border-slate-800 backdrop-blur-xl text-white flex items-center justify-center w-full h-full text-sm antialiased px-6 py-3',
          className
        )}
        style={{
          borderRadius: `calc(${borderRadius} * 0.96)`,
        }}
      >
        {children}
      </div>
    </Component>
  );
};

export default Button;
