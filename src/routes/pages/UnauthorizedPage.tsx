import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { ShieldAlert, LogOut, Compass, Mail } from 'lucide-react';

export const UnauthorizedPage: React.FC = () => {
  const { currentUser, logoutUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuspended = (location.state as { suspended?: boolean } | null)?.suspended || currentUser.status === 'suspended';

  const getRoleDashboardPath = () => {
    switch (currentUser.role) {
      case 'customer':
        return '/customer/dashboard';
      case 'restaurant_owner':
      case 'hotel_owner':
        return '/hotel/dashboard';
      case 'vendor':
        return '/vendor/dashboard';
      case 'delivery_partner':
        return '/delivery/dashboard';
      case 'admin':
        return '/admin/dashboard';
      default:
        return '/customer/dashboard';
    }
  };

  const roleNameMap: Record<string, string> = {
    customer: 'Customer',
    restaurant_owner: 'Hotel Owner',
    hotel_owner: 'Hotel Owner',
    vendor: 'Local Street Vendor',
    delivery_partner: 'Delivery Partner',
    admin: 'Platform Administrator',
  };

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col justify-center items-center p-4 relative overflow-hidden text-slate-100">
      {/* Background glow */}
      <div className="absolute top-1/3 -left-20 w-80 h-80 rounded-full bg-red-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-80 h-80 rounded-full bg-gold-500/10 blur-[120px] pointer-events-none" />

      <div className="max-w-md w-full glass-panel-gold rounded-3xl p-8 border border-red-500/30 shadow-2xl text-center space-y-6 relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-red-500/15 border border-red-500/40 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8 text-red-400" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-red-400 px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">
            {isSuspended ? 'HTTP 403 • ACCOUNT SUSPENDED' : 'HTTP 403 • ACCESS RESTRICTED'}
          </span>
          <h1 className="text-2xl font-display font-extrabold text-white">
            {isSuspended ? 'Account Suspended' : 'Unauthorized Role Access'}
          </h1>
          <p className="text-xs text-slate-400 leading-relaxed">
            {isSuspended ? (
              <>
                Your account <span className="font-bold text-gold-400">{currentUser.name}</span> has been temporarily suspended by OmniRoute administration. Please contact platform operations.
              </>
            ) : (
              <>
                You are signed in as <span className="font-bold text-gold-400">{currentUser.name}</span> with the role of{' '}
                <span className="font-bold text-white uppercase">{roleNameMap[currentUser.role] || currentUser.role}</span>.
                This URL belongs to a restricted role workspace.
              </>
            )}
          </p>
        </div>

        <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/10 text-left text-xs space-y-1">
          <p className="font-semibold text-slate-300">
            {isSuspended ? 'Compliance Action Required:' : 'Role Security Enforcement:'}
          </p>
          <p className="text-slate-400 text-[11px]">
            {isSuspended
              ? 'Security locks prevent suspended accounts from performing delivery operations, order dispatches, or vendor transactions.'
              : 'OmniRoute strictly isolates access to prevent cross-account data leakage across hotel kitchens, vendor orders, couriers, and administrators.'}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          {!isSuspended ? (
            <button
              onClick={() => navigate(getRoleDashboardPath())}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 hover:brightness-110 text-charcoal-950 font-bold text-xs shadow-gold-glow flex items-center justify-center space-x-2 transition-all"
            >
              <Compass className="w-4 h-4" />
              <span>Go to My Dashboard</span>
            </button>
          ) : (
            <a
              href="mailto:support@omniroute.com"
              className="w-full py-3 px-4 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white font-bold text-xs border border-red-500/40 flex items-center justify-center space-x-2 transition-colors"
            >
              <Mail className="w-4 h-4" />
              <span>Contact Compliance</span>
            </a>
          )}

          <button
            onClick={async () => {
              await logoutUser();
              navigate('/login');
            }}
            className="w-full sm:w-auto py-3 px-4 rounded-xl bg-charcoal-900 hover:bg-white/5 border border-white/10 text-slate-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
