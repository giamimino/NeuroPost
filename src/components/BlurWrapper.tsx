import { Children } from '@/types/global';
import React from 'react';

const BlurWrapper = ({ children }: Children) => {
  return (
    <div className={`flex flex-col p-6 rounded-3xl border border-white/10 gap-6 bg-black/15 backdrop-blur-lg`}>
      {children}
    </div>
  );
}

export default BlurWrapper;
