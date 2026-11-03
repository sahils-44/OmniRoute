import React from 'react';
import { useApp } from '../../context/AppContext';
import { Clock, ShieldAlert, CheckCircle2, Mail } from 'lucide-react';

export const PendingNoticeBanner: React.FC = () => {
  const { currentUser, updateUserStatus } = useApp();

  if (currentUser.role === 'customer' || currentUser.role === 'admin') {
    return null;
  }

  if (currentUser.status === 'suspended') {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-red-500/15 border border-red-500/40 text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-red-200">Account Access Suspended</h4>
            <p className="text-xs text-red-300/80">
              This partner account has been temporarily suspended by OmniRoute Administration. Please contact compliance.
            </p>
          </div>
        </div>
        <a
          href="mailto:support@omniroute.com"
          className="px-3.5 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-white font-bold text-xs border border-red-500/40 transition-colors flex items-center space-x-1.5 w-fit"
        >
          <Mail className="w-3.5 h-3.5" />
          <span>Contact Compliance</span>
        </a>
      </div>
    );
  }

  if (currentUser.status === 'pending') {
    return (
      <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h4 className="font-bold text-sm text-amber-200">Partner Account Under Review</h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                PENDING APPROVAL
              </span>
            </div>
            <p className="text-xs text-amber-300/80 mt-0.5">
              Your registration documents are being verified by OmniRoute Administration. Menu publishing and courier assignments will unlock upon approval.
            </p>
          </div>
        </div>

        {/* Instant evaluation helper */}
        <button
          onClick={() => updateUserStatus(currentUser.id, 'active')}
          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-gold-500 hover:brightness-110 text-charcoal-950 font-bold text-xs transition-all shadow-gold-glow flex items-center space-x-1.5 w-fit flex-shrink-0"
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>Admin Instant Verify (Demo)</span>
        </button>
      </div>
    );
  }

  return null;
};
