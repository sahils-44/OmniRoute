import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Compass, HelpCircle } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { currentUser, isGuestDemo, firebaseUser } = useApp();
  const navigate = useNavigate();

  const handleReturn = () => {
    if (!firebaseUser && !isGuestDemo) {
      navigate('/login');
      return;
    }

    switch (currentUser.role) {
      case 'customer':
        navigate('/customer/dashboard');
        break;
      case 'restaurant_owner':
      case 'hotel_owner':
        navigate('/hotel/dashboard');
        break;
      case 'vendor':
        navigate('/vendor/dashboard');
        break;
      case 'delivery_partner':
        navigate('/delivery/dashboard');
        break;
      case 'admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/customer/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      <div className="max-w-md w-full glass-panel-gold rounded-3xl p-8 border border-gold-500/30 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-gold-500/15 border border-gold-500/30 mx-auto flex items-center justify-center">
          <HelpCircle className="w-8 h-8 text-gold-400" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-gold-400 px-2 py-0.5 rounded bg-gold-500/10 border border-gold-500/20">
            HTTP 404 • ROUTE NOT FOUND
          </span>
          <h1 className="text-2xl font-display font-extrabold text-white">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-400">
            The requested destination or endpoint does not exist on the OmniRoute Logistics Grid.
          </p>
        </div>

        <button
          onClick={handleReturn}
          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:brightness-110 text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center justify-center space-x-2 transition-all"
        >
          <Compass className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
};
