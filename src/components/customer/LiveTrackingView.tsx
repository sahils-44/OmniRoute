import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order, OrderStatus } from '../../types';
import { MapViewer } from '../common/MapViewer';
import { calculateHaversineDistanceKm } from '../../services/routingEngine';
import {
  Bike,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  ShieldCheck,
  FileText,
  Navigation,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';

interface LiveTrackingViewProps {
  orderId?: string;
  onBackToBrowser: () => void;
}

export const LiveTrackingView: React.FC<LiveTrackingViewProps> = ({
  orderId,
  onBackToBrowser,
}) => {
  const { orders, drivers, viewInvoice, currentUser } = useApp();

  // Find target order or default to the most active/latest one
  const targetOrder = orderId
    ? orders.find(o => o.id === orderId)
    : orders.find(o => o.customerId === currentUser.id && o.status !== 'delivered') || orders[0];

  const [callSimulated, setCallSimulated] = useState(false);

  if (!targetOrder) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>No active orders found.</p>
        <button
          onClick={onBackToBrowser}
          className="mt-4 px-4 py-2 rounded-xl bg-gold-500 text-charcoal-950 font-bold text-xs"
        >
          Browse Restaurants
        </button>
      </div>
    );
  }

  const assignedDriver = drivers.find(d => d.id === targetOrder.deliveryPartnerId);

  // Calculate live remaining distance
  const currentDriverCoords = assignedDriver
    ? assignedDriver.currentCoords
    : targetOrder.businessCoords;

  const distanceRemainingKm = calculateHaversineDistanceKm(
    currentDriverCoords,
    targetOrder.destinationCoords
  );

  const isNear = distanceRemainingKm <= 1.0;

  // 10 Status Stages mapped to human checkpoints
  const orderSteps: { status: OrderStatus; label: string; icon: string }[] = [
    { status: 'pending', label: 'Order Placed', icon: '📝' },
    { status: 'accepted', label: 'Confirmed', icon: '✅' },
    { status: 'preparing', label: 'In Kitchen', icon: '🍳' },
    { status: 'ready_for_pickup', label: 'Packed & Ready', icon: '📦' },
    { status: 'assigned', label: 'Courier Assigned', icon: '🛵' },
    { status: 'picked_up', label: 'Picked Up', icon: '🚀' },
    { status: 'out_for_delivery', label: 'In Transit', icon: '📍' },
    { status: 'near_destination', label: 'Within 1 KM', icon: '🎯' },
    { status: 'delivered', label: 'Delivered', icon: '🎉' },
  ];

  const currentStepIndex = orderSteps.findIndex(s => s.status === targetOrder.status);

  // Markers for MapViewer
  const markers = [
    {
      id: 'biz',
      coords: targetOrder.businessCoords,
      title: targetOrder.businessName,
      subtitle: 'Pickup Location',
      type: 'business' as const,
    },
    {
      id: 'dest',
      coords: targetOrder.destinationCoords,
      title: targetOrder.customerName,
      subtitle: targetOrder.deliveryAddress,
      type: 'customer' as const,
    },
  ];

  if (assignedDriver) {
    markers.push({
      id: 'driver',
      coords: assignedDriver.currentCoords,
      title: `${assignedDriver.name} (${assignedDriver.vehiclePlate})`,
      subtitle: `Delivery Partner • ${distanceRemainingKm.toFixed(2)} km away`,
      type: 'driver' as const,
      heading: assignedDriver.currentCoords.heading || 45,
    });
  }

  // Route Polyline
  const routePoints = [
    targetOrder.businessCoords,
    assignedDriver ? assignedDriver.currentCoords : targetOrder.businessCoords,
    targetOrder.destinationCoords,
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner & Invoice Shortcut */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-white/10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-gold-500/20 text-gold-300 border border-gold-500/30">
              #{targetOrder.orderNumber}
            </span>
            <span className="text-xs text-slate-400">
              Placed at {new Date(targetOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <h2 className="text-xl font-bold font-display text-white mt-1">
            Tracking from {targetOrder.businessName}
          </h2>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => viewInvoice(targetOrder)}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 border border-gold-500/30 text-xs font-semibold transition-all shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Tax Invoice</span>
          </button>
          <button
            onClick={onBackToBrowser}
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-medium transition-colors"
          >
            Browse More
          </button>
        </div>
      </div>

      {/* 1 KM Proximity Alert Badge if within radius */}
      {isNear && targetOrder.status !== 'delivered' && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-charcoal-900 border-2 border-emerald-500/60 shadow-emerald-glow flex items-center justify-between animate-pulse">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
              <Navigation className="w-5 h-5 text-emerald-400 animate-spin-slow" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center space-x-1.5">
                <span>Your delivery partner is just 1 KM away!</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                Current separation: <strong>{distanceRemainingKm.toFixed(2)} KM</strong>. Please keep OTP <strong>{targetOrder.deliveryConfirmationCode}</strong> ready.
              </p>
            </div>
          </div>
          <div className="hidden sm:block font-mono text-emerald-400 text-sm font-bold">
            ~2 Mins Away
          </div>
        </div>
      )}

      {/* Interactive Map & Telemetry Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Real-time Map Viewer */}
        <div className="lg:col-span-2 space-y-3">
          <MapViewer
            center={targetOrder.destinationCoords}
            zoom={14}
            markers={markers}
            routePolyline={routePoints}
            showGeofenceAround={targetOrder.destinationCoords}
            geofenceRadiusMeters={1000}
            height="460px"
          />

          {/* Quick Telemetry Bar */}
          <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-charcoal-900/90 border border-white/5 text-xs text-center font-mono">
            <div>
              <span className="text-slate-500 block text-[10px]">DISTANCE REMAINING</span>
              <span className="text-white font-bold text-sm text-gold-400">
                {distanceRemainingKm.toFixed(2)} KM
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">ESTIMATED ARRIVAL</span>
              <span className="text-white font-bold text-sm text-emerald-400">
                {targetOrder.estimatedDeliveryTime || 'In 12 Mins'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">VERIFICATION OTP</span>
              <span className="text-white font-bold text-sm text-cyan-400">
                {targetOrder.deliveryConfirmationCode}
              </span>
            </div>
          </div>
        </div>

        {/* Courier Details & Order Timeline */}
        <div className="space-y-4">
          {/* Driver Card */}
          {assignedDriver ? (
            <div className="p-4 rounded-2xl glass-panel border border-white/10 space-y-3">
              <div className="flex items-center space-x-3">
                <img
                  src={assignedDriver.photo}
                  alt={assignedDriver.name}
                  className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-500/50"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <h4 className="font-bold text-sm text-white truncate">
                      {assignedDriver.name}
                    </h4>
                    <span className="text-[10px] text-gold-400 font-bold">★ {assignedDriver.rating}</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    {assignedDriver.vehicleType} • <span className="font-mono text-slate-300">{assignedDriver.vehiclePlate}</span>
                  </p>
                </div>
              </div>

              {/* Call / Chat Simulation */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5">
                <button
                  onClick={() => {
                    setCallSimulated(true);
                    setTimeout(() => setCallSimulated(false), 3000);
                  }}
                  className="py-2 px-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{callSimulated ? 'Dialing...' : 'Call Partner'}</span>
                </button>
                <button
                  onClick={() => alert(`Direct in-app messaging connected with ${assignedDriver.name}.`)}
                  className="py-2 px-3 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 text-xs font-medium border border-white/10 transition-colors flex items-center justify-center space-x-1.5"
                >
                  <MessageSquare className="w-3.5 h-3.5 text-gold-400" />
                  <span>Message</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-charcoal-900 border border-white/10 text-center py-6">
              <Bike className="w-8 h-8 text-gold-400 mx-auto animate-bounce" />
              <p className="text-xs font-bold text-white mt-2">Assigning Courier Partner...</p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Connecting with nearest electric scooter partner
              </p>
            </div>
          )}

          {/* Vertical Order Timeline Progress */}
          <div className="p-5 rounded-2xl glass-panel border border-white/10 space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Live Delivery Milestones
            </h4>

            <div className="space-y-3 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-white/10 before:-z-0">
              {orderSteps.map((step, idx) => {
                const isPassed = idx <= currentStepIndex;
                const isCurrent = idx === currentStepIndex;

                return (
                  <div key={step.status} className="flex items-center space-x-3 relative z-10">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-gold-500 text-charcoal-950 ring-4 ring-gold-500/20 shadow-gold-glow scale-110'
                          : isPassed
                          ? 'bg-emerald-500 text-charcoal-950'
                          : 'bg-charcoal-800 text-slate-500 border border-white/10'
                      }`}
                    >
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-xs font-semibold ${
                          isCurrent
                            ? 'text-gold-300 font-bold'
                            : isPassed
                            ? 'text-white'
                            : 'text-slate-500'
                        }`}
                      >
                        {step.label}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Ordered Items Summary */}
          <div className="p-4 rounded-2xl bg-charcoal-900 border border-white/10 text-xs space-y-2">
            <div className="font-bold text-slate-300 flex justify-between">
              <span>Items in Order</span>
              <span className="font-mono text-gold-400">Total: ₹{targetOrder.total}</span>
            </div>
            <div className="divide-y divide-white/5">
              {targetOrder.items.map((item, idx) => (
                <div key={idx} className="py-1.5 flex justify-between text-slate-400">
                  <span>
                    {item.quantity}x {item.menuItem.name}
                  </span>
                  <span className="font-mono">₹{item.menuItem.price * item.quantity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
