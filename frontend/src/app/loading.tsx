import React from 'react';

export default function Loading() {
  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-base-100 z-[99999]">
      <div className="flex-1 flex items-center justify-center">
        <h1 className="text-4xl font-semibold tracking-wide text-base-content animate-pulse-scale">
          META IITGN
        </h1>
      </div>

      <p className="mb-8 text-xs tracking-widest text-base-content/50 uppercase">
        by metis
      </p>
    </div>
  );
}