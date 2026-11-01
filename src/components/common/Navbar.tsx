import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import {
  ShoppingBag,
  Bell,
  Play,
  Pause,
  FastForward,
  User as UserIcon,
  Sparkles,
  ChevronDown,
  Compass,
  Store,
  UtensilsCrossed,
  Bike,
  ShieldAlert,
  Check,
} from 'lucide-react';

interface NavbarProps {
  onOpenCart?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart }) => {
  const {
    currentUser,
    switchRole,
    cart,
    notifications,
    markNotificationRead,
    clearAllNotifications,
    isSimulationPlaying,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  const cartTotalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const unreadCount = notifications.filter(n => !n.read).length;

  const roleLabels: Record<UserRole, { label: string; icon: React.ReactNode; color: string }> = {
    customer: { label: 'Customer', icon: <ShoppingBag className="w-3.5 h-3.5" />, color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' },
    restaurant_owner: { label: 'Hotel Owner', icon: <UtensilsCrossed className="w-3.5 h-3.5" />, color: 'text-gold-400 border-gold-500/40 bg-gold-500/10' },
    vendor: { label: 'Local Vendor (Chai)', icon: <Store className="w-3.5 h-3.5" />, color: 'text-electric-orange border-orange-500/40 bg-orange-500/10' },
    delivery_partner: { label: 'Delivery Partner', icon: <Bike className="w-3.5 h-3.5" />, color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
    admin: { label: 'Administrator', icon: <ShieldAlert className="w-3.5 h-3.5" />, color: 'text-purple-400 border-purple-500/40 bg-purple-500/10' },
  };

  const handleSpeedCycle = () => {
    if (simulationSpeed === 1) setSimulationSpeed(2);
    else if (simulationSpeed === 2) setSimulationSpeed(5);
    else setSimulationSpeed(1);
  };

  return (
    <header className="sticky top-0 z-50 w-full glass-panel border-b border-white/10 px-4 lg:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-600 via-gold-400 to-amber-200 p-0.5 shadow-gold-glow flex items-center justify-center">
            <div className="w-full h-full bg-charcoal-950 rounded-[10px] flex items-center justify-center">
              <Compass className="w-5 h-5 text-gold-400 animate-spin-slow" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-display font-extrabold text-xl tracking-tight text-white">
                Omni<span className="gold-gradient-text">Route</span>
              </span>
              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                PRO 2.4
              </span>
            </div>
            <p className="text-[10px] text-slate-400 hidden sm:block">
              Smart Multi-Vendor Logistics & GPS Grid
            </p>
          </div>
        </div>

        {/* Central Role Selector Switcher */}
        <div className="hidden md:flex items-center space-x-1 p-1 rounded-xl bg-charcoal-900/90 border border-white/10 backdrop-blur-md">
          {(Object.keys(roleLabels) as UserRole[]).map(roleKey => {
            const role = roleLabels[roleKey];
            const isActive = currentUser.role === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => switchRole(roleKey)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  isActive
                    ? `${role.color} border shadow-sm font-bold`
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {role.icon}
                <span>{role.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Action Tools: Simulation Control, Cart, Notifications & Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Simulation GPS Controls */}
          <div className="hidden sm:flex items-center space-x-1 bg-charcoal-900/80 border border-white/10 rounded-lg p-1 text-xs">
            <button
              onClick={toggleSimulation}
              className={`p-1.5 rounded-md transition-colors ${
                isSimulationPlaying
                  ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                  : 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              }`}
              title={isSimulationPlaying ? 'Pause GPS simulation' : 'Play GPS simulation'}
            >
              {isSimulationPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={handleSpeedCycle}
              className="px-2 py-1 rounded-md text-[11px] font-mono font-bold text-gold-400 hover:bg-white/5 flex items-center space-x-1"
              title="Cycle Simulation Speed (1x, 2x, 5x)"
            >
              <FastForward className="w-3 h-3" />
              <span>{simulationSpeed}x</span>
            </button>
          </div>

          {/* Cart Trigger (visible for Customer) */}
          {currentUser.role === 'customer' && (
            <button
              onClick={onOpenCart}
              className="relative p-2 rounded-xl bg-charcoal-900 border border-white/10 hover:border-gold-500/40 text-slate-300 hover:text-gold-400 transition-all shadow-sm"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartTotalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-electric-orange text-white text-[10px] font-black flex items-center justify-center shadow-orange-glow animate-pulse">
                  {cartTotalItems}
                </span>
              )}
            </button>
          )}

          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(prev => !prev)}
              className="relative p-2 rounded-xl bg-charcoal-900 border border-white/10 hover:border-gold-500/40 text-slate-300 hover:text-gold-400 transition-all shadow-sm"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-charcoal-950 text-[10px] font-black flex items-center justify-center animate-ping"></span>
              )}
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-charcoal-950 text-[10px] font-black flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl glass-panel-gold border border-gold-500/30 shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <div className="flex items-center space-x-1.5">
                    <Sparkles className="w-4 h-4 text-gold-400" />
                    <span className="font-bold text-sm text-white">Live Alerts Grid</span>
                  </div>
                  {notifications.length > 0 && (
                    <button
                      onClick={clearAllNotifications}
                      className="text-[11px] text-slate-400 hover:text-white transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-center py-6 text-xs text-slate-400">
                      No notifications at this moment
                    </p>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        onClick={() => markNotificationRead(n.id)}
                        className={`p-3 rounded-xl border text-xs transition-all cursor-pointer ${
                          n.read
                            ? 'bg-charcoal-900/50 border-white/5 opacity-70'
                            : 'bg-charcoal-850 border-gold-500/30'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-bold text-slate-200">{n.title}</span>
                          <span className="text-[10px] font-mono text-slate-400">{n.timestamp}</span>
                        </div>
                        <p className="mt-1 text-slate-300 leading-snug">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Mobile Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleMenu(prev => !prev)}
              className="flex items-center space-x-2 p-1.5 rounded-xl bg-charcoal-900 border border-white/10 hover:border-gold-500/40 transition-colors"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-7 h-7 rounded-lg object-cover border border-gold-500/30"
              />
              <span className="text-xs font-semibold text-slate-200 hidden lg:inline-block max-w-[100px] truncate">
                {currentUser.name.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showRoleMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl glass-panel border border-white/15 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 border-b border-white/10">
                  <p className="text-xs font-bold text-white truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-gold-400 capitalize">{currentUser.role.replace('_', ' ')}</p>
                </div>

                <div className="mt-1 py-1">
                  <p className="px-3 py-1 text-[10px] uppercase font-mono text-slate-500">
                    Switch Workspace Role
                  </p>
                  {(Object.keys(roleLabels) as UserRole[]).map(roleKey => {
                    const r = roleLabels[roleKey];
                    const isCur = currentUser.role === roleKey;
                    return (
                      <button
                        key={roleKey}
                        onClick={() => {
                          switchRole(roleKey);
                          setShowRoleMenu(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                          isCur
                            ? 'bg-gold-500/20 text-gold-300 font-bold'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {r.icon}
                          <span>{r.label}</span>
                        </div>
                        {isCur && <Check className="w-3.5 h-3.5 text-gold-400" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
