import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Business, BusinessType } from '../../types';
import { ThreeHeroScene } from '../common/ThreeHeroScene';
import { MenuModal } from './MenuModal';
import { CartDrawer } from './CartDrawer';
import { LiveTrackingView } from './LiveTrackingView';
import { CustomerOrderHistory } from './CustomerOrderHistory';
import {
  Search,
  SlidersHorizontal,
  Star,
  Clock,
  Sparkles,
  ShoppingBag,
  Navigation,
  Compass,
  Coffee,
  Utensils,
  Store,
  Layers,
} from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { businesses, orders, currentUser } = useApp();

  const [activeTab, setActiveTab] = useState<'browse' | 'track' | 'history'>('browse');
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [trackedOrderId, setTrackedOrderId] = useState<string | undefined>(undefined);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // Check for active orders for this customer
  const activeOrders = orders.filter(
    o => o.customerId === currentUser.id && !['delivered', 'cancelled'].includes(o.status)
  );

  const filteredBusinesses = businesses.filter(b => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.cuisine.some(c => c.toLowerCase().includes(searchQuery.toLowerCase())) ||
      b.description.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === 'all') return matchesSearch;
    if (filterType === 'restaurant') return matchesSearch && b.type === 'restaurant';
    if (filterType === 'street_vendor')
      return matchesSearch && ['chai_stall', 'street_vendor', 'bakery'].includes(b.type);
    return matchesSearch;
  });

  const handleOrderSuccess = (newOrderId: string) => {
    setTrackedOrderId(newOrderId);
    setActiveTab('track');
  };

  return (
    <div className="space-y-8 pb-16">
      {/* View Switcher Tabs & Active Order Notification */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveTab('browse')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'browse'
                ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Discover & Order</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('track');
              setTrackedOrderId(undefined);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 relative ${
              activeTab === 'track'
                ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Live GPS Tracker</span>
            {activeOrders.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
              activeTab === 'history'
                ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Order History</span>
          </button>
        </div>

        {/* Active Order Quick Pill */}
        {activeOrders.length > 0 && activeTab !== 'track' && (
          <button
            onClick={() => {
              setTrackedOrderId(activeOrders[0].id);
              setActiveTab('track');
            }}
            className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-all animate-pulse"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Order #{activeOrders[0].orderNumber} in transit • Track Live</span>
          </button>
        )}
      </div>

      {/* VIEW: LIVE GPS TRACKING */}
      {activeTab === 'track' && (
        <LiveTrackingView
          orderId={trackedOrderId}
          onBackToBrowser={() => setActiveTab('browse')}
        />
      )}

      {/* VIEW: ORDER HISTORY */}
      {activeTab === 'history' && (
        <CustomerOrderHistory
          onSelectTrackOrder={orderId => {
            setTrackedOrderId(orderId);
            setActiveTab('track');
          }}
        />
      )}

      {/* VIEW: DISCOVER & BROWSE */}
      {activeTab === 'browse' && (
        <div className="space-y-8 animate-in fade-in duration-300">
          {/* 3D Hero Scene Banner */}
          <div className="relative rounded-3xl overflow-hidden glass-panel-gold border border-gold-500/30 p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-7 space-y-4 z-10">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-gold-500/20 border border-gold-500/30 text-gold-300 text-xs font-bold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                  <span>Next-Gen Smart Logistics Cloud</span>
                </div>

                <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-white leading-tight">
                  Grand Dining & <br />
                  <span className="gold-gradient-text">Local Chai Delivered Fast.</span>
                </h1>

                <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
                  Connecting luxury hotels and local street corner chai vendors with intelligent multi-stop route optimization and sub-kilometer live GPS tracking.
                </p>

                {/* Quick Search */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2 max-w-md">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      placeholder="Search biryani, chai, vada pav, sushi..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-charcoal-900/90 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        filterType === 'all'
                          ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                          : 'bg-charcoal-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType('restaurant')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        filterType === 'restaurant'
                          ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                          : 'bg-charcoal-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Hotels
                    </button>
                    <button
                      onClick={() => setFilterType('street_vendor')}
                      className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        filterType === 'street_vendor'
                          ? 'bg-electric-orange text-white font-bold shadow-orange-glow'
                          : 'bg-charcoal-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      Chai & Vendors
                    </button>
                  </div>
                </div>
              </div>

              {/* 3D WebGL Hero Canvas Container */}
              <div className="lg:col-span-5 relative">
                <ThreeHeroScene />
              </div>
            </div>
          </div>

          {/* Model Differentiator Callout: Traditional Hotel vs Local Chai Multi-Delivery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => setFilterType('restaurant')}
              className={`p-5 rounded-2xl glass-card border cursor-pointer transition-all ${
                filterType === 'restaurant' ? 'border-gold-500 bg-gold-500/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Model A: Traditional Restaurant Delivery</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Order from fine-dining hotels, tracked from chef to your dining table.
                  </p>
                </div>
              </div>
            </div>

            <div
              onClick={() => setFilterType('street_vendor')}
              className={`p-5 rounded-2xl glass-card border cursor-pointer transition-all ${
                filterType === 'street_vendor' ? 'border-electric-orange bg-electric-orange/5' : 'border-white/10'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-electric-orange">
                  <Coffee className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Model B: Local Vendor Multi-Order Routing</h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Fresh morning chai & breakfast batched with nearby deliveries for max speed.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Business Catalog Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold text-xl text-white">
                  Featured Kitchens & Stalls
                </h3>
                <p className="text-xs text-slate-400">
                  Showing {filteredBusinesses.length} verified food merchants
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredBusinesses.map(biz => {
                const isVendor = ['chai_stall', 'street_vendor', 'bakery'].includes(biz.type);

                return (
                  <div
                    key={biz.id}
                    onClick={() => setSelectedBusiness(biz)}
                    className="glass-card rounded-3xl overflow-hidden border border-white/10 hover:border-gold-500/40 transition-all cursor-pointer group flex flex-col justify-between"
                  >
                    <div>
                      {/* Image Banner */}
                      <div className="relative h-44 w-full overflow-hidden">
                        <img
                          src={biz.banner}
                          alt={biz.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-transparent to-transparent"></div>

                        {/* Badges */}
                        <div className="absolute top-3 left-3 flex items-center space-x-1.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                              isVendor
                                ? 'bg-orange-500/80 text-white'
                                : 'bg-gold-500/80 text-charcoal-950'
                            }`}
                          >
                            {biz.type.replace('_', ' ')}
                          </span>
                          {biz.isFeatured && (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-charcoal-900/80 text-gold-300 border border-gold-500/40 backdrop-blur-md">
                              ★ Featured
                            </span>
                          )}
                        </div>

                        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-charcoal-900/80 border border-white/10 text-xs font-mono font-bold text-emerald-400 backdrop-blur-md flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{biz.deliveryTimeMin}m</span>
                        </div>

                        {/* Rating Pill */}
                        <div className="absolute bottom-3 left-3 flex items-center space-x-1 text-xs font-bold text-white bg-charcoal-900/90 px-2.5 py-1 rounded-xl border border-white/10 backdrop-blur-md">
                          <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                          <span>{biz.rating}</span>
                          <span className="text-slate-400 font-normal">({biz.reviewCount}+)</span>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-5 space-y-2">
                        <h4 className="font-display font-bold text-lg text-white group-hover:text-gold-300 transition-colors">
                          {biz.name}
                        </h4>
                        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                          {biz.description}
                        </p>

                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {biz.cuisine.map(c => (
                            <span
                              key={c}
                              className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/5"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Footer Action */}
                    <div className="p-4 px-5 bg-charcoal-900/60 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-slate-400">
                        Min. Order: <strong className="text-slate-200">₹{biz.minOrder}</strong>
                      </span>
                      <button className="px-3.5 py-1.5 rounded-xl bg-gold-500/20 text-gold-300 border border-gold-500/30 group-hover:bg-gold-500 group-hover:text-charcoal-950 font-bold transition-all shadow-sm">
                        View Menu & Order
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Menu Modal */}
      {selectedBusiness && (
        <MenuModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onOpenCart={() => setIsCartOpen(true)}
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
};
