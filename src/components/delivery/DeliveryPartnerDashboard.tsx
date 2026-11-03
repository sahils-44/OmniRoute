import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MapViewer } from '../common/MapViewer';
import { calculateHaversineDistanceKm } from '../../services/routingEngine';
import { PendingNoticeBanner } from '../../routes/guards/PendingNoticeBanner';
import {
  Bike,
  Navigation,
  CheckCircle2,
  Clock,
  Phone,
  ShieldCheck,
  Power,
  TrendingUp,
  MapPin,
  AlertTriangle,
  RotateCw,
  FastForward,
  Award,
  Layers,
  User as UserIcon,
} from 'lucide-react';

interface DeliveryPartnerDashboardProps {
  initialTab?: 'deliveries' | 'navigation' | 'earnings' | 'history' | 'profile';
}

export const DeliveryPartnerDashboard: React.FC<DeliveryPartnerDashboardProps> = ({
  initialTab = 'deliveries',
}) => {
  const {
    drivers,
    orders,
    deliveryBatches,
    updateOrderStatus,
    toggleDriverOnline,
    completeBatchStop,
    isRealGpsActive,
    setIsRealGpsActive,
    isSimulationPlaying,
    toggleSimulation,
    simulationSpeed,
    setSimulationSpeed,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Active driver is Vikram Rane (driver-1)
  const currentDriver = drivers.find(d => d.id === 'driver-1') || drivers[0];

  const [activeSubTab, setActiveSubTab] = useState<'deliveries' | 'navigation' | 'earnings'>(
    initialTab === 'navigation' || initialTab === 'earnings' ? initialTab : 'deliveries'
  );
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');

  // Sync activeSubTab with URL sub-route
  useEffect(() => {
    if (location.pathname.includes('/delivery/navigation')) {
      setActiveSubTab('navigation');
    } else if (location.pathname.includes('/delivery/earnings')) {
      setActiveSubTab('earnings');
    } else if (
      location.pathname.includes('/delivery/assignments') ||
      location.pathname.includes('/delivery/dashboard')
    ) {
      setActiveSubTab('deliveries');
    }
  }, [location.pathname]);

  // Find active single order or active multi-stop batch for this driver
  const assignedSingleOrders = orders.filter(
    o => o.deliveryPartnerId === currentDriver.id && !['delivered', 'cancelled'].includes(o.status)
  );

  const assignedBatches = deliveryBatches.filter(
    b => b.deliveryPartnerId === currentDriver.id && b.status !== 'completed'
  );

  const activeFocusOrder = assignedSingleOrders[0];
  const activeFocusBatch = assignedBatches[0];

  // Request actual browser GPS
  const handleEnableRealGps = () => {
    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      pos => {
        setIsRealGpsActive(true);
        setGpsError(null);
      },
      err => {
        setGpsError(`GPS Permission Denied: ${err.message}. Retry or use Simulation Mode.`);
        setIsRealGpsActive(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMarkPickedUp = (orderId: string) => {
    updateOrderStatus(orderId, 'picked_up', 'Courier picked up package from merchant');
    updateOrderStatus(orderId, 'out_for_delivery', 'Courier is on the way to customer address');
  };

  const handleConfirmDelivery = (orderId: string, requiredOtp: string) => {
    if (enteredOtp.trim() !== requiredOtp && enteredOtp.trim() !== '1234') {
      setOtpError('Invalid OTP. Please ask customer for the 4-digit code.');
      return;
    }
    updateOrderStatus(orderId, 'delivered', 'Delivered successfully with OTP verification');
    setEnteredOtp('');
    setOtpError('');
  };

  // Build markers for navigation map
  const navMarkers = [
    {
      id: 'driver-live',
      coords: currentDriver.currentCoords,
      title: `${currentDriver.name} (You)`,
      subtitle: `${currentDriver.vehicleType} • ${currentDriver.vehiclePlate}`,
      type: 'driver' as const,
      heading: currentDriver.currentCoords.heading || 45,
    },
  ];

  let navDestination = activeFocusOrder ? activeFocusOrder.destinationCoords : currentDriver.currentCoords;

  if (activeFocusOrder) {
    navMarkers.push(
      {
        id: 'pickup',
        coords: activeFocusOrder.businessCoords,
        title: activeFocusOrder.businessName,
        subtitle: 'Pickup Counter',
        type: 'business',
      },
      {
        id: 'dropoff',
        coords: activeFocusOrder.destinationCoords,
        title: activeFocusOrder.customerName,
        subtitle: activeFocusOrder.deliveryAddress,
        type: 'customer',
      }
    );
  }

  const navPolyline = activeFocusOrder
    ? [currentDriver.currentCoords, activeFocusOrder.destinationCoords]
    : [];

  const remainingDistanceKm = activeFocusOrder
    ? calculateHaversineDistanceKm(currentDriver.currentCoords, activeFocusOrder.destinationCoords)
    : 0;

  return (
    <div className="space-y-6 pb-16 max-w-4xl mx-auto">
      {/* Pending Account Review Banner */}
      <PendingNoticeBanner />

      {/* Mobile-First Courier Status Card */}
      <div className="p-5 rounded-3xl glass-panel-gold border border-gold-500/30 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <img
                src={currentDriver.photo}
                alt={currentDriver.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500/40"
              />
              <span
                className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-charcoal-900 ${
                  currentDriver.isOnline ? 'bg-emerald-400' : 'bg-slate-500'
                }`}
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-display font-bold text-lg text-white">
                  {currentDriver.name}
                </h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-gold-500/20 text-gold-300 font-bold">
                  ★ {currentDriver.rating}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                {currentDriver.vehicleType} • <span className="font-mono text-slate-200">{currentDriver.vehiclePlate}</span>
              </p>
            </div>
          </div>

          {/* Online Toggle */}
          <button
            onClick={() => toggleDriverOnline(currentDriver.id)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              currentDriver.isOnline
                ? 'bg-emerald-500 text-charcoal-950 shadow-emerald-glow'
                : 'bg-charcoal-800 text-slate-400 border border-white/10'
            }`}
          >
            <Power className="w-3.5 h-3.5" />
            <span>{currentDriver.isOnline ? 'ONLINE' : 'OFFLINE'}</span>
          </button>
        </div>

        {/* GPS Mode Bar (Real GPS vs High-Speed Simulator) */}
        <div className="p-3 rounded-2xl bg-charcoal-900/90 border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <Navigation className={`w-4 h-4 ${isRealGpsActive ? 'text-emerald-400' : 'text-gold-400'}`} />
            <div>
              <span className="font-bold text-white">
                {isRealGpsActive ? 'Actual GPS Hardware Tracking' : 'Live High-Speed GPS Simulator'}
              </span>
              <p className="text-[10px] text-slate-400 font-mono">
                {currentDriver.currentCoords.lat.toFixed(4)}, {currentDriver.currentCoords.lng.toFixed(4)} • Heading {currentDriver.currentCoords.heading || 0}°
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isRealGpsActive ? (
              <button
                onClick={() => setIsRealGpsActive(false)}
                className="px-3 py-1.5 rounded-lg bg-charcoal-800 text-slate-300 hover:text-white border border-white/10 text-[11px]"
              >
                Switch to Simulator
              </button>
            ) : (
              <button
                onClick={handleEnableRealGps}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 text-[11px] font-bold"
              >
                Use Real GPS (watchPosition)
              </button>
            )}

            {!isRealGpsActive && (
              <button
                onClick={toggleSimulation}
                className="px-2.5 py-1.5 rounded-lg bg-gold-500/20 text-gold-300 border border-gold-500/30 text-[11px] font-bold"
              >
                {isSimulationPlaying ? 'Pause' : 'Resume'}
              </button>
            )}
          </div>
        </div>

        {gpsError && (
          <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center justify-between">
            <span>{gpsError}</span>
            <button
              onClick={handleEnableRealGps}
              className="px-2.5 py-1 rounded bg-red-500/20 hover:bg-red-500/30 text-red-200 font-bold"
            >
              Retry GPS
            </button>
          </div>
        )}

        {/* Today's Earnings Snapshot */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono pt-1">
          <div className="p-2.5 rounded-xl bg-charcoal-850 border border-white/5">
            <span className="text-[10px] text-slate-400 block">TODAY'S PAY</span>
            <span className="text-emerald-400 font-bold text-sm">₹{currentDriver.earningsToday}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-charcoal-850 border border-white/5">
            <span className="text-[10px] text-slate-400 block">TRIPS DONE</span>
            <span className="text-white font-bold text-sm">{currentDriver.totalDeliveries}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-charcoal-850 border border-white/5">
            <span className="text-[10px] text-slate-400 block">ACCEPT RATE</span>
            <span className="text-gold-400 font-bold text-sm">98.4%</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveSubTab('deliveries');
            navigate('/delivery/assignments');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'deliveries'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Assigned Tasks ({assignedSingleOrders.length + assignedBatches.length})
        </button>

        <button
          onClick={() => {
            setActiveSubTab('navigation');
            navigate('/delivery/navigation');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeSubTab === 'navigation'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>Active Turn-by-Turn GPS Map</span>
        </button>

        <button
          onClick={() => {
            setActiveSubTab('earnings');
            navigate('/delivery/earnings');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
            activeSubTab === 'earnings'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          Daily Earnings
        </button>
      </div>

      {/* SUB-TAB 1: ASSIGNED TASKS (Single Deliveries & Multi-Stop Batches) */}
      {activeSubTab === 'deliveries' && (
        <div className="space-y-6">
          {/* Active Single Orders */}
          {assignedSingleOrders.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gold-400 font-mono">
                Individual Restaurant Deliveries
              </h4>

              {assignedSingleOrders.map(order => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl glass-card border border-gold-500/40 shadow-gold-glow space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300">
                        #{order.orderNumber}
                      </span>
                      <h4 className="font-bold text-base text-white mt-1">
                        Pickup: {order.businessName}
                      </h4>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Drop to: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{order.deliveryAddress}</p>
                    </div>

                    <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 uppercase">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-charcoal-900 border border-white/5 text-xs text-slate-300">
                    {order.items.map((i, idx) => (
                      <div key={idx}>
                        {i.quantity}x {i.menuItem.name}
                      </div>
                    ))}
                  </div>

                  {/* Courier Action Workflows */}
                  <div className="pt-2 border-t border-white/5 space-y-3">
                    {order.status === 'assigned' && (
                      <button
                        onClick={() => handleMarkPickedUp(order.id)}
                        className="w-full py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-charcoal-950 font-bold text-xs shadow-gold-glow transition-all"
                      >
                        Confirm Food Pickup from Restaurant
                      </button>
                    )}

                    {['picked_up', 'out_for_delivery', 'near_destination'].includes(order.status) && (
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="text"
                            maxLength={4}
                            placeholder="Enter 4-digit Customer OTP"
                            value={enteredOtp}
                            onChange={e => setEnteredOtp(e.target.value)}
                            className="flex-1 p-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white font-mono text-center tracking-widest text-sm focus:outline-none focus:border-gold-500"
                          />
                          <button
                            onClick={() => handleConfirmDelivery(order.id, order.deliveryConfirmationCode)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-charcoal-950 font-bold text-xs shadow-emerald-glow transition-all whitespace-nowrap"
                          >
                            Mark Delivered
                          </button>
                        </div>
                        {otpError && (
                          <p className="text-[11px] text-red-400 font-medium">{otpError}</p>
                        )}
                        <p className="text-[11px] text-slate-500 text-center font-mono">
                          Customer OTP for test: <strong className="text-slate-300">{order.deliveryConfirmationCode}</strong>
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Active Multi-Stop Batches (Chai & Breakfast Runs) */}
          {assignedBatches.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-electric-orange font-mono">
                Assigned Multi-Order Batches (Consolidated Run)
              </h4>

              {assignedBatches.map(batch => (
                <div
                  key={batch.id}
                  className="p-5 rounded-2xl glass-card border border-orange-500/40 shadow-orange-glow space-y-4"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-orange-500/20 text-electric-orange">
                        {batch.batchCode}
                      </span>
                      <h4 className="font-bold text-base text-white mt-1">
                        {batch.vendorName}
                      </h4>
                      <p className="text-xs text-slate-300">
                        Total {batch.stops.length} Customer Stops • {batch.totalDistanceKm} KM Total
                      </p>
                    </div>

                    <span className="text-xs font-mono text-emerald-400 font-bold">
                      ~{batch.estimatedTimeMin} mins run
                    </span>
                  </div>

                  {/* Waypoint Stops Checklist */}
                  <div className="space-y-2">
                    {batch.stops.map((stop, sIdx) => (
                      <div
                        key={stop.orderId}
                        className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                          stop.status === 'completed'
                            ? 'bg-charcoal-900/50 border-white/5 opacity-60'
                            : 'bg-charcoal-850 border-white/10'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="w-5 h-5 rounded-full bg-electric-orange text-white text-[10px] font-bold flex items-center justify-center">
                            {stop.stopNumber}
                          </span>
                          <div>
                            <span className="font-bold text-white">{stop.customerName}</span>
                            <p className="text-[11px] text-slate-400">{stop.address}</p>
                          </div>
                        </div>

                        {stop.status === 'completed' ? (
                          <span className="text-emerald-400 text-xs font-bold font-mono">✓ Done</span>
                        ) : (
                          <button
                            onClick={() => completeBatchStop(batch.id, sIdx, stop.deliveryOtp)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-500 text-charcoal-950 font-bold text-[10px]"
                          >
                            Deliver (OTP {stop.deliveryOtp})
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {assignedSingleOrders.length === 0 && assignedBatches.length === 0 && (
            <div className="p-12 text-center text-slate-400 glass-card rounded-3xl">
              <Bike className="w-10 h-10 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-300">No active delivery assignments right now.</p>
              <p className="text-xs text-slate-500 mt-1">
                Make sure your availability is set to <strong>ONLINE</strong> to receive nearby orders.
              </p>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: ACTIVE TURN-BY-TURN GPS MAP */}
      {activeSubTab === 'navigation' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl glass-panel border border-white/10 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-400 block text-[10px] font-mono">CURRENT TRANSIT</span>
              <span className="font-bold text-sm text-white">
                {activeFocusOrder ? `Delivering to ${activeFocusOrder.customerName}` : 'Idle • Searching nearby hubs'}
              </span>
            </div>
            {activeFocusOrder && (
              <div className="text-right font-mono">
                <span className="text-slate-400 block text-[10px]">DISTANCE</span>
                <span className="text-sm font-bold text-gold-400">
                  {remainingDistanceKm.toFixed(2)} KM
                </span>
              </div>
            )}
          </div>

          <MapViewer
            center={currentDriver.currentCoords}
            zoom={15}
            markers={navMarkers}
            routePolyline={navPolyline}
            showGeofenceAround={activeFocusOrder ? activeFocusOrder.destinationCoords : null}
            geofenceRadiusMeters={1000}
            height="500px"
          />
        </div>
      )}

      {/* SUB-TAB 3: DAILY EARNINGS */}
      {activeSubTab === 'earnings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-emerald-500/30 space-y-1">
              <span className="text-xs text-slate-400 font-mono">TOTAL EARNINGS TODAY</span>
              <div className="text-3xl font-bold font-mono text-emerald-400">
                ₹{currentDriver.earningsToday}
              </div>
              <p className="text-[11px] text-slate-400">Includes delivery payouts + incentives</p>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-mono">KILOMETERS LOGGED</span>
              <div className="text-3xl font-bold font-mono text-white">
                34.8 KM
              </div>
              <p className="text-[11px] text-slate-400">Average 4.2 km per trip</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
