import React from 'react';
import { cn } from '../../lib/utils';

export const BackgroundBeams = ({ className }) => {
  return (
    <div
      className={cn(
        'absolute inset-0 z-0 h-full w-full overflow-hidden pointer-events-none',
        className
      )}
    >
      {/* Background Radial Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,#3b82f61a,transparent)]" />

      {/* Grid Pattern with fade mask */}
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f293718_1px,transparent_1px),linear-gradient(to_bottom,#1f293718_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"
      />

      {/* Animated glowing beam blobs */}
      <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl animate-pulse-glow" />
      <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '2s' }} />
    </div>
  );
};

export default BackgroundBeams;
