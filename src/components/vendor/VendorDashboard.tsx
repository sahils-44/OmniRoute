import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Order, DeliveryBatch, RouteStop } from '../../types';
import { MapViewer } from '../common/MapViewer';
import { optimizeMultiOrderRoute } from '../../services/routingEngine';

import {
  Store,
  Coffee,
  CheckCircle2,
  XCircle,
  Bike,
  Sparkles,
  Navigation,
  Layers,
  Clock,
  ArrowRight,
  TrendingUp,
  MapPin,
  RefreshCw,
  Zap,
  Check,
  Split,
  Plus,
} from 'lucide-react';

interface VendorDashboardProps {
  initialTab?: 'batching' | 'orders' | 'menu' | 'sales' | 'inventory';
}

export const VendorDashboard: React.FC<VendorDashboardProps> = ({ initialTab = 'batching' }) => {
  const {
    businesses,
    orders,
    menuItems,
    drivers,
    deliveryBatches,
    generateVendorBatches,
    assignBatchDriver,
    completeBatchStop,
    toggleItemAvailability,
    currentUser,
    updateOrderStatus,
    viewInvoice,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Current vendor is Sharma Ji Ki Masala Chai & Breakfast Stall
  const currentVendor =
    businesses.find(b => b.id === currentUser.businessId) ||
    businesses.find(b => b.id === 'biz-vendor-1') ||
    businesses[0];

  const [activeTab, setActiveTab] = useState<'batching' | 'orders' | 'menu' | 'sales'>(
    initialTab === 'inventory' ? 'menu' : initialTab
  );

  // Sync activeTab with URL sub-route
  useEffect(() => {
    if (location.pathname.includes('/vendor/orders')) {
      setActiveTab('orders');
    } else if (location.pathname.includes('/vendor/products') || location.pathname.includes('/vendor/inventory')) {
      setActiveTab('menu');
    } else if (location.pathname.includes('/vendor/analytics')) {
      setActiveTab('sales');
    } else if (location.pathname.includes('/vendor/dashboard')) {
      setActiveTab('batching');
    }
  }, [location.pathname]);
  const [selectedBatchDriver, setSelectedBatchDriver] = useState<string>(drivers[0].id);
  const [otpInput, setOtpInput] = useState<{ [stopIdx: number]: string }>({});

  // Filter orders for this vendor
  const vendorOrders = orders.filter(o => o.businessId === currentVendor.id);
  const vendorBatches = deliveryBatches.filter(b => b.vendorId === currentVendor.id);
  const activeBatch = vendorBatches.find(b => ['suggested', 'assigned', 'in_progress'].includes(b.status)) || vendorBatches[0];

  // Daily totals
  const dailyCash = vendorOrders
    .filter(o => o.paymentMethod === 'cash_on_delivery' && o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const dailyUpi = vendorOrders
    .filter(o => o.paymentMethod !== 'cash_on_delivery' && o.status !== 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const totalCupsBrewed = vendorOrders.reduce((sum, o) => {
    const chaiItems = o.items.filter(i => i.menuItem.name.toLowerCase().includes('chai'));
    return sum + chaiItems.reduce((s, ci) => s + ci.quantity, 0);
  }, 48);

  const handleGenerateBatch = () => {
    generateVendorBatches(currentVendor.id);
  };

  const handleAssignDriverToBatch = (batchId: string) => {
    assignBatchDriver(batchId, selectedBatchDriver);
  };

  const handleVerifyAndCompleteStop = (batchId: string, stopIdx: number) => {
    const enteredOtp = otpInput[stopIdx] || '1234';
    const success = completeBatchStop(batchId, stopIdx, enteredOtp);
    if (!success) {
      alert('Invalid OTP. Please ask customer for correct 4-digit code (Hint: Default is 1234 or shown on order).');
    }
  };

  // Build markers and polyline for the multi-order batch map
  const batchMarkers = [
    {
      id: 'vendor-origin',
      coords: currentVendor.coordinates,
      title: currentVendor.name,
      subtitle: 'Chai Stall & Food Counter',
      type: 'business' as const,
    },
  ];

  const batchPolyline = [currentVendor.coordinates];

  if (activeBatch) {
    activeBatch.stops.forEach(stop => {
      batchMarkers.push({
        id: `stop-${stop.stopNumber}`,
        coords: stop.coordinates,
        title: `Stop ${stop.stopNumber}: ${stop.customerName}`,
        subtitle: `${stop.address} • ETA: ${stop.estimatedArrival}`,
        type: 'stop' as const,
        stopNumber: stop.stopNumber,
      });
      batchPolyline.push(stop.coordinates);
    });

    if (activeBatch.deliveryPartnerId) {
      const assigned = drivers.find(d => d.id === activeBatch.deliveryPartnerId);
      if (assigned) {
        batchMarkers.push({
          id: 'batch-driver',
          coords: assigned.currentCoords,
          title: `${assigned.name} (${assigned.vehiclePlate})`,
          subtitle: `Active Courier on Batch • Rating ${assigned.rating}★`,
          type: 'driver' as const,
          heading: assigned.currentCoords.heading,
        });
      }
    }
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Vendor Profile Header */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-gold border border-gold-500/30 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-2xl bg-orange-500/20 border-2 border-orange-500/40 p-2 flex items-center justify-center text-3xl shadow-orange-glow">
              ☕
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-orange-500/20 text-electric-orange border border-orange-500/30">
                  Local Street Vendor & Chai Seller
                </span>
                <span className="text-xs text-emerald-400 font-bold">● Stall Open</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mt-0.5">
                {currentVendor.name}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentVendor.address} • Quick Multi-Order Neighborhood Delivery
              </p>
            </div>
          </div>

          {/* Quick Counter Metrics */}
          <div className="flex items-center space-x-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-charcoal-900/80 border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 block">CHAI CUPS BREWED</span>
              <span className="text-base font-bold text-electric-orange">{totalCupsBrewed}</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900/80 border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 block">PENDING ORDERS</span>
              <span className="text-base font-bold text-gold-400">
                {vendorOrders.filter(o => o.status !== 'delivered').length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab('batching');
            navigate('/vendor/dashboard');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'batching'
              ? 'bg-electric-orange text-white shadow-orange-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>Smart Multi-Order Routing Hub</span>
          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/20 font-mono">CORE</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            navigate('/vendor/orders');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'orders'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>All Customer Orders ({vendorOrders.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('menu');
            navigate('/vendor/products');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'menu'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Coffee className="w-3.5 h-3.5" />
          <span>Stall Quick Menu & Stock</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('sales');
            navigate('/vendor/analytics');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'sales'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          <span>Daily Cash Tally</span>
        </button>
      </div>

      {/* TAB 1: SMART MULTI-ORDER ROUTE DELIVERY (CORE DIFFERENTIATOR) */}
      {activeTab === 'batching' && (
        <div className="space-y-6">
          {/* Explanation Callout */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-orange-950/40 via-charcoal-900 to-charcoal-900 border border-orange-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-electric-orange animate-ping"></span>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Smart Multi-Customer Batching Engine (Test Scenario 2)
                </h3>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                Rather than dispatching 5 couriers separately for nearby orders, our dynamic Traveling Salesperson / 2-Opt routing algorithm groups compatible chai & breakfast orders into a single consolidated delivery trip.
              </p>
            </div>

            <button
              onClick={handleGenerateBatch}
              className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-electric-orange hover:bg-orange-600 text-white font-bold text-xs transition-all shadow-orange-glow whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-Cluster & Optimize</span>
            </button>
          </div>

          {activeBatch ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Batch Manifest Card */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-5 rounded-2xl glass-card border border-gold-500/30 space-y-4">
                  <div className="flex items-start justify-between border-b border-white/10 pb-3">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                        {activeBatch.batchCode}
                      </span>
                      <h4 className="font-bold text-base text-white mt-1">
                        Consolidated Batch Manifest
                      </h4>
                      <p className="text-xs text-slate-400">
                        {activeBatch.stops.length} Customer Deliveries in 1 Single Run
                      </p>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase ${
                        activeBatch.status === 'completed'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : activeBatch.status === 'assigned'
                          ? 'bg-cyan-500/20 text-cyan-400'
                          : 'bg-gold-500/20 text-gold-300'
                      }`}
                    >
                      {activeBatch.status}
                    </span>
                  </div>

                  {/* Route Telemetry Specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-mono">
                    <div className="p-2.5 rounded-xl bg-charcoal-800 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">TOTAL DISTANCE</span>
                      <span className="text-gold-400 font-bold">{activeBatch.totalDistanceKm} KM</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-charcoal-800 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">ESTIMATED RUN</span>
                      <span className="text-emerald-400 font-bold">~{activeBatch.estimatedTimeMin} Mins</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-charcoal-800 border border-white/5">
                      <span className="text-[10px] text-slate-400 block">FUEL SAVED</span>
                      <span className="text-cyan-400 font-bold">~68%</span>
                    </div>
                  </div>

                  {/* Driver Assignment for this Batch */}
                  <div className="p-3.5 rounded-xl bg-charcoal-900 border border-white/5 space-y-2">
                    <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                      <span>Assigned Delivery Partner:</span>
                      {activeBatch.deliveryPartnerName && (
                        <span className="text-emerald-400 font-mono text-[11px]">
                          ✓ {activeBatch.deliveryPartnerName}
                        </span>
                      )}
                    </label>

                    <div className="flex items-center space-x-2">
                      <select
                        value={selectedBatchDriver}
                        onChange={e => setSelectedBatchDriver(e.target.value)}
                        className="flex-1 p-2 rounded-xl bg-charcoal-800 border border-white/10 text-xs text-white"
                      >
                        {drivers.map(d => (
                          <option key={d.id} value={d.id}>
                            {d.name} ({d.vehicleType} • {d.vehiclePlate}) {d.isOnline ? '🟢' : '⚪'}
                          </option>
                        ))}
                      </select>
                      <button
                        onClick={() => handleAssignDriverToBatch(activeBatch.id)}
                        className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-charcoal-950 font-bold text-xs shadow-emerald-glow transition-all"
                      >
                        Assign Batch
                      </button>
                    </div>
                  </div>

                  {/* Sequential Route Stops List */}
                  <div className="space-y-2">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                      Optimized Waypoint Sequence
                    </h5>

                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {activeBatch.stops.map((stop, sIdx) => {
                        const isDone = stop.status === 'completed';

                        return (
                          <div
                            key={stop.orderId}
                            className={`p-3 rounded-xl border text-xs transition-all ${
                              isDone
                                ? 'bg-charcoal-900/40 border-white/5 opacity-60'
                                : 'bg-charcoal-850 border-white/10 hover:border-gold-500/30'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-2">
                                <span className="w-5 h-5 rounded-full bg-electric-orange text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                                  {stop.stopNumber}
                                </span>
                                <div>
                                  <div className="font-bold text-white flex items-center space-x-1.5">
                                    <span>{stop.customerName}</span>
                                    {isDone && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                                  </div>
                                  <p className="text-[11px] text-slate-400 mt-0.5">
                                    {stop.address}
                                  </p>
                                  <p className="text-[10px] text-gold-400 font-mono mt-1">
                                    {stop.itemsSummary}
                                  </p>
                                </div>
                              </div>

                              <span className="font-mono text-[10px] text-slate-400 whitespace-nowrap">
                                ETA {stop.estimatedArrival}
                              </span>
                            </div>

                            {/* Verify Stop Completion with OTP */}
                            {!isDone && (
                              <div className="mt-2 pt-2 border-t border-white/5 flex items-center justify-between">
                                <span className="text-[10px] text-slate-500 font-mono">
                                  Confirmation OTP: <strong className="text-slate-300">{stop.deliveryOtp}</strong>
                                </span>
                                <button
                                  onClick={() => handleVerifyAndCompleteStop(activeBatch.id, sIdx)}
                                  className="px-2.5 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500 hover:text-charcoal-950 font-bold text-[10px] transition-all"
                                >
                                  Confirm Delivered
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Route Map Container */}
              <div className="lg:col-span-7 space-y-3">
                <MapViewer
                  center={currentVendor.coordinates}
                  zoom={14}
                  markers={batchMarkers}
                  routePolyline={batchPolyline}
                  height="580px"
                />

                {/* Legend callout */}
                <div className="p-3 rounded-xl bg-charcoal-900 border border-white/5 flex items-center justify-between text-xs text-slate-400">
                  <span>
                    Pickup Origin: <strong className="text-gold-400">{currentVendor.name}</strong>
                  </span>
                  <span>
                    Stops Sequence: <strong className="text-white">1 → 2 → 3 → 4 → 5</strong>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400 glass-card rounded-3xl">
              <p>No active delivery batches found.</p>
              <button
                onClick={handleGenerateBatch}
                className="mt-4 px-4 py-2 rounded-xl bg-electric-orange text-white font-bold text-xs shadow-orange-glow"
              >
                Create New Multi-Order Batch
              </button>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ALL CUSTOMER ORDERS */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
            All Current Chai & Snack Orders ({vendorOrders.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {vendorOrders.map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl glass-card border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300">
                      #{order.orderNumber}
                    </span>
                    <h4 className="font-bold text-sm text-white mt-1">
                      {order.customerName} ({order.customerPhone})
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">{order.deliveryAddress}</p>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-gold-400 block">
                      ₹{order.total}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : 'bg-gold-500/20 text-gold-300'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-charcoal-900 border border-white/5 text-xs text-slate-300">
                  {order.items.map((i, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span>
                        {i.quantity}x {i.menuItem.name}
                      </span>
                      <span className="font-mono text-slate-400">
                        ₹{i.quantity * i.menuItem.price}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Mode: {order.paymentMethod.replace('_', ' ').toUpperCase()}
                  </span>
                  <button
                    onClick={() => viewInvoice(order)}
                    className="px-3 py-1 rounded-lg bg-charcoal-800 text-slate-200 border border-white/10"
                  >
                    Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: STALL QUICK MENU & STOCK TOGGLES */}
      {activeTab === 'menu' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Counter Items & Quick Inventory</h3>
              <p className="text-xs text-slate-400">
                Tap to instantly mark out of stock if fresh batch is brewing or sold out.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems
              .filter(i => i.businessId === currentVendor.id)
              .map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl glass-card border border-white/10 flex items-center justify-between space-x-4"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      <p className="font-mono text-xs text-gold-400 font-bold mt-0.5">
                        ₹{item.price} • {item.preparationTimeMin} mins
                      </p>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleItemAvailability(item.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      item.isAvailable
                        ? 'bg-emerald-500 text-charcoal-950 shadow-emerald-glow'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30'
                    }`}
                  >
                    {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: DAILY CASH TALLY */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-mono">PHYSICAL CASH COLLECTED</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                ₹{dailyCash + 380}
              </div>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-gold-500/30 space-y-1">
              <span className="text-xs text-slate-400 font-mono">ONLINE / UPI SETTLED</span>
              <div className="text-2xl font-bold font-mono text-gold-400">
                ₹{dailyUpi + 1940}
              </div>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-mono">TOTAL REVENUE TODAY</span>
              <div className="text-2xl font-bold font-mono text-white">
                ₹{dailyCash + dailyUpi + 2320}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
