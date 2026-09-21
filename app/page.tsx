'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const App = dynamic(() => import('../src/App'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-[#0F1012] flex flex-col items-center justify-center space-y-3">
      <div className="w-12 h-12 rounded-xl bg-black border border-stone-800 flex items-center justify-center shadow-lg animate-pulse">
        <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
      </div>
      <span className="text-xs font-semibold text-stone-400 tracking-wider font-display">Wholetailing CRM Aveiro</span>
    </div>
  )
});

export default function HomePage() {
  return <App />;
}
