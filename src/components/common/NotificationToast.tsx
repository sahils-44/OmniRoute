import React from 'react';
import { useApp } from '../../context/AppContext';
import { Bell, Navigation, X, ShieldCheck } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { activeProximityAlert, dismissProximityAlert, switchRole } = useApp();

  if (!activeProximityAlert) return null;

  const { order, distanceKm } = activeProximityAlert;

  return (
    <div className="fixed top-20 right-4 md:right-8 z-[9999] max-w-md w-full animate-bounce-once">
      <div className="relative overflow-hidden rounded-2xl bg-charcoal-900/95 border-2 border-emerald-500/80 p-5 shadow-[0_20px_50px_rgba(16,185,129,0.35)] backdrop-blur-2xl">
        {/* Pulsing Emerald Radar Ring background effect */}
        <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none animate-pulse"></div>

        <div className="flex items-start space-x-4">
          {/* Radar Radar Icon */}
          <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/40 flex items-center justify-center">
            <div className="radar-ring absolute w-10 h-10 rounded-full border border-emerald-400"></div>
            <Navigation className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Proximity Geofence</span>
              </span>
              <button
                onClick={dismissProximityAlert}
                className="text-slate-400 hover:text-white transition-colors p-1"
                aria-label="Dismiss alert"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <h4 className="mt-2 text-base font-bold text-white tracking-tight">
              Your delivery partner is just 1 KM away!
            </h4>

            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-emerald-400">{order.deliveryPartnerName || 'Your Courier'}</span> is approaching your address with order from <span className="text-white font-medium">{order.businessName}</span>.
            </p>

            <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/10 text-xs">
              <div className="flex items-center space-x-1.5 text-slate-300 font-mono">
                <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                <span>OTP: <strong className="text-gold-300">{order.deliveryConfirmationCode}</strong></span>
              </div>
              <div className="font-mono text-emerald-400 font-bold">
                {distanceKm.toFixed(2)} KM Remaining
              </div>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={() => {
                  switchRole('customer');
                  dismissProximityAlert();
                }}
                className="flex-1 py-1.5 px-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-charcoal-950 text-xs font-bold transition-all shadow-emerald-glow text-center"
              >
                View Live Tracker
              </button>
              <button
                onClick={dismissProximityAlert}
                className="py-1.5 px-3 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-300 text-xs font-medium border border-white/10 transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
