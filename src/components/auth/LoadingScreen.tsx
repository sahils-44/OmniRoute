import React from 'react';
import { Compass, Bike, Sparkles } from 'lucide-react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-[99999] bg-charcoal-950 flex flex-col items-center justify-center p-6 text-slate-100 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-gold-500/10 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-electric-orange/10 blur-[90px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full text-center space-y-6">
        {/* Animated Brand Logo */}
        <div className="relative">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-1 shadow-gold-glow animate-pulse">
            <div className="w-full h-full bg-charcoal-950 rounded-[22px] flex items-center justify-center">
              <Compass className="w-10 h-10 text-gold-400 animate-spin" style={{ animationDuration: '6s' }} />
            </div>
          </div>
          <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shadow-emerald-glow animate-ping">
          </div>
        </div>

        {/* Brand Title */}
        <div>
          <h1 className="text-3xl font-black font-display tracking-tight text-white">
            Omni<span className="gold-gradient-text">Route</span>™
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono tracking-wider uppercase">
            Smart Logistics & Multi-Vendor Fleet Cloud
          </p>
        </div>

        {/* Animated Moving Courier Track */}
        <div className="w-full max-w-xs space-y-2">
          <div className="relative w-full h-8 overflow-hidden">
            {/* Moving Scooter Animation */}
            <div
              className="absolute text-xl"
              style={{
                animation: 'scooter-move 2.2s cubic-bezier(0.4, 0, 0.2, 1) infinite',
              }}
            >
              🛵
            </div>
          </div>

          {/* Glowing Loading Progress Bar */}
          <div className="w-full h-1.5 rounded-full bg-charcoal-850 overflow-hidden border border-white/10 relative">
            <div
              className="h-full bg-gradient-to-r from-gold-500 via-amber-400 to-electric-orange rounded-full shadow-gold-glow animate-shimmer"
              style={{
                width: '65%',
                animation: 'progress-flow 2s ease-in-out infinite alternate',
              }}
            ></div>
          </div>
        </div>

        {/* Status text */}
        <div className="flex items-center space-x-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Connecting to Firebase Auth & Live GPS Grid...</span>
        </div>
      </div>

      <style>{`
        @keyframes scooter-move {
          0% { left: -10%; transform: scaleX(1); }
          48% { left: 95%; transform: scaleX(1); }
          50% { left: 95%; transform: scaleX(-1); }
          98% { left: -10%; transform: scaleX(-1); }
          100% { left: -10%; transform: scaleX(1); }
        }
        @keyframes progress-flow {
          0% { width: 25%; }
          100% { width: 90%; }
        }
      `}</style>
    </div>
  );
};
