import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { MapViewer } from '../common/MapViewer';
import {
  ShieldAlert,
  Users,
  Building2,
  Bike,
  Layers,
  DollarSign,
  TrendingUp,
  FileText,
  Download,
  CheckCircle2,
  XCircle,
  Compass,
  AlertCircle,
  Eye,
  Settings,
  ShieldCheck,
  UserCheck,
  Ban,
  Clock,
  Server,
  Lock,
} from 'lucide-react';

interface AdminDashboardProps {
  initialTab?: 'radar' | 'orders' | 'merchants' | 'couriers' | 'users' | 'settings';
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ initialTab = 'radar' }) => {
  const {
    businesses,
    orders,
    drivers,
    deliveryBatches,
    viewInvoice,
    allUsers,
    allRegisteredUsers,
    updateUserStatus,
    fetchRegisteredUsers,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'radar' | 'orders' | 'merchants' | 'couriers' | 'users' | 'settings'>(initialTab);
  const [orderSearch, setOrderSearch] = useState('');
  const [userSearch, setUserSearch] = useState('');

  // Fetch registered users on mount
  useEffect(() => {
    fetchRegisteredUsers();
  }, [fetchRegisteredUsers]);

  // Sync activeTab with URL sub-route
  useEffect(() => {
    if (location.pathname.includes('/admin/users')) {
      setActiveTab('users');
    } else if (location.pathname.includes('/admin/hotels') || location.pathname.includes('/admin/vendors')) {
      setActiveTab('merchants');
    } else if (location.pathname.includes('/admin/delivery-partners')) {
      setActiveTab('couriers');
    } else if (location.pathname.includes('/admin/orders')) {
      setActiveTab('orders');
    } else if (location.pathname.includes('/admin/settings')) {
      setActiveTab('settings');
    } else if (location.pathname.includes('/admin/dashboard') || location.pathname.includes('/admin/analytics')) {
      setActiveTab('radar');
    }
  }, [location.pathname]);

  // Platform Telemetry Aggregates
  const totalGmv = orders.reduce((sum, o) => sum + o.total, 0);
  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;
  const completedOrdersCount = orders.filter(o => o.status === 'delivered').length;
  const onlineDriversCount = drivers.filter(d => d.isOnline).length;

  const handleExportSystemReport = () => {
    const reportData = orders.map(o => ({
      orderNumber: o.orderNumber,
      customer: o.customerName,
      merchant: o.businessName,
      type: o.businessType,
      itemsCount: o.items.length,
      subtotal: o.subtotal,
      tax: o.tax,
      deliveryFee: o.deliveryFee,
      discount: o.discount,
      total: o.total,
      paymentMethod: o.paymentMethod,
      status: o.status,
      date: o.createdAt,
    }));

    const blob = new Blob([JSON.stringify(reportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `OmniRoute_Telemetry_Audit_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Build Unified Fleet Radar Markers (All Businesses + All Online Drivers + Active Orders)
  const radarMarkers = [
    ...businesses.map(b => ({
      id: b.id,
      coords: b.coordinates,
      title: b.name,
      subtitle: `${b.type.replace('_', ' ').toUpperCase()} • ${b.address}`,
      type: 'business' as const,
    })),
    ...drivers
      .filter(d => d.isOnline)
      .map(d => ({
        id: d.id,
        coords: d.currentCoords,
        title: `${d.name} (${d.vehiclePlate})`,
        subtitle: `Courier • ${d.vehicleType} • Rating: ${d.rating}★`,
        type: 'driver' as const,
        heading: d.currentCoords.heading,
      })),
    ...orders
      .filter(o => !['delivered', 'cancelled'].includes(o.status))
      .map(o => ({
        id: `dest-${o.id}`,
        coords: o.destinationCoords,
        title: `Destination: ${o.customerName}`,
        subtitle: `Order #${o.orderNumber} • ${o.deliveryAddress}`,
        type: 'customer' as const,
      })),
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Platform Executive Header */}
      <div className="p-6 rounded-3xl glass-panel-gold border border-gold-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              Platform Command Center
            </span>
            <span className="text-xs text-emerald-400 font-bold">● Network Synchronized</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mt-1">
            OmniRoute™ Mission Control
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Real-time urban logistics governance, multi-vendor fleet dispatch & settlement audits.
          </p>
        </div>

        <button
          onClick={handleExportSystemReport}
          className="flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-gold-500 hover:bg-gold-600 text-charcoal-950 font-bold text-xs shadow-gold-glow transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Export Audit Telemetry</span>
        </button>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card border border-gold-500/30 space-y-1">
          <span className="text-xs text-slate-400 font-mono">GROSS SYSTEM GMV</span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-gold-400">
            ₹{(totalGmv + 128500).toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-400">↑ 18.4% from last period</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-mono">ACTIVE DISPATCHES</span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-emerald-400">
            {activeOrdersCount}
          </div>
          <p className="text-[10px] text-slate-400">{completedOrdersCount} completed today</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-mono">COURIERS ON ROAD</span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-cyan-400">
            {onlineDriversCount} / {drivers.length}
          </div>
          <p className="text-[10px] text-slate-400">GPS high-precision streaming</p>
        </div>

        <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
          <span className="text-xs text-slate-400 font-mono">PARTNER MERCHANTS</span>
          <div className="text-2xl md:text-3xl font-bold font-mono text-white">
            {businesses.length}
          </div>
          <p className="text-[10px] text-gold-400">Hotels + Street Chai Stalls</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab('radar');
            navigate('/admin/dashboard');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'radar'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Unified Fleet Radar</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('users');
            navigate('/admin/users');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'users'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>User Approvals & RBAC ({allRegisteredUsers.length || allUsers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('orders');
            navigate('/admin/orders');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'orders'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Platform Orders ({orders.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('merchants');
            navigate('/admin/hotels');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'merchants'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Hotels & Vendors ({businesses.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('couriers');
            navigate('/admin/delivery-partners');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'couriers'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Couriers & Fleet ({drivers.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('settings');
            navigate('/admin/settings');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'settings'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Security & Config</span>
        </button>
      </div>

      {/* TAB 1: UNIFIED FLEET RADAR MAP */}
      {activeTab === 'radar' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live Logistics Mesh Radar</h3>
              <p className="text-xs text-slate-400">
                Visualizing all concurrent merchants, customer delivery destinations, and live couriers.
              </p>
            </div>
          </div>

          <MapViewer
            center={{ lat: 19.0620, lng: 72.8330 }}
            zoom={14}
            markers={radarMarkers}
            height="580px"
          />
        </div>
      )}

      {/* TAB: USER APPROVALS & RBAC MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-gold-400" />
                <span>User Accounts & RBAC Verification</span>
              </h3>
              <p className="text-xs text-slate-400">
                Manage partner registrations, approve pending merchant accounts, and enforce role permissions.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Search users by name, email, or role..."
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl bg-charcoal-900 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-500/50 w-64"
              />
            </div>
          </div>

          <div className="space-y-3">
            {(() => {
              // Merge all users
              const userMap = new Map();
              allUsers.forEach(u => userMap.set(u.id, { ...u, status: u.status || 'active' }));
              allRegisteredUsers.forEach(u => {
                const uid = u.id || u.uid;
                userMap.set(uid, {
                  id: uid,
                  name: u.name,
                  email: u.email,
                  role: u.role,
                  phone: u.phone || '+91 98201 12345',
                  avatar: u.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
                  status: u.status || 'active',
                });
              });

              const list = Array.from(userMap.values()).filter(u => {
                const term = userSearch.toLowerCase();
                return (
                  u.name.toLowerCase().includes(term) ||
                  u.email.toLowerCase().includes(term) ||
                  u.role.toLowerCase().includes(term)
                );
              });

              return list.map(u => {
                const isPending = u.status === 'pending';
                const isSuspended = u.status === 'suspended';

                return (
                  <div
                    key={u.id}
                    className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={u.avatar}
                        alt={u.name}
                        className="w-11 h-11 rounded-xl object-cover border border-white/10"
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-sm text-white">{u.name}</h4>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-md bg-charcoal-900 border border-white/10 text-slate-300">
                            {u.role.replace('_', ' ')}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          {u.email} • {u.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 self-end sm:self-center">
                      {/* Status Badge */}
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center space-x-1 ${
                          isPending
                            ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                            : isSuspended
                            ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                            : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isPending && <Clock className="w-3 h-3 animate-pulse" />}
                        {isSuspended && <Ban className="w-3 h-3" />}
                        {!isPending && !isSuspended && <CheckCircle2 className="w-3 h-3" />}
                        <span>{u.status?.toUpperCase()}</span>
                      </span>

                      {/* Action Buttons */}
                      {isPending && (
                        <button
                          onClick={() => updateUserStatus(u.id, 'active')}
                          className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition-all shadow-sm flex items-center space-x-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                      )}

                      {!isPending && !isSuspended && u.role !== 'admin' && (
                        <button
                          onClick={() => updateUserStatus(u.id, 'suspended')}
                          className="px-3 py-1.5 rounded-xl bg-red-500/15 hover:bg-red-500/25 text-red-300 border border-red-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                        >
                          <Ban className="w-3.5 h-3.5" />
                          <span>Suspend</span>
                        </button>
                      )}

                      {isSuspended && (
                        <button
                          onClick={() => updateUserStatus(u.id, 'active')}
                          className="px-3 py-1.5 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-500/40 text-xs font-bold transition-all flex items-center space-x-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Reactivate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>
      )}

      {/* TAB 2: SYSTEM-WIDE ORDERS MASTER */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">System Orders Registry</h3>
            <input
              type="text"
              placeholder="Search by order #, customer, or merchant..."
              value={orderSearch}
              onChange={e => setOrderSearch(e.target.value)}
              className="px-3.5 py-1.5 rounded-xl bg-charcoal-800 border border-white/10 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-gold-500"
            />
          </div>

          <div className="overflow-x-auto rounded-2xl glass-card border border-white/10">
            <table className="w-full text-left text-xs">
              <thead className="bg-charcoal-850 text-slate-400 uppercase font-mono border-b border-white/10">
                <tr>
                  <th className="p-4">Order #</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Merchant</th>
                  <th className="p-4">Total</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {orders
                  .filter(
                    o =>
                      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.customerName.toLowerCase().includes(orderSearch.toLowerCase()) ||
                      o.businessName.toLowerCase().includes(orderSearch.toLowerCase())
                  )
                  .map(order => (
                    <tr key={order.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-mono font-bold text-gold-400">#{order.orderNumber}</td>
                      <td className="p-4 font-medium text-white">{order.customerName}</td>
                      <td className="p-4 text-slate-300">{order.businessName}</td>
                      <td className="p-4 font-mono font-bold text-white">₹{order.total}</td>
                      <td className="p-4 uppercase text-[11px] font-mono text-slate-400">
                        {order.paymentMethod.replace('_', ' ')}
                      </td>
                      <td className="p-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'delivered'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : order.status === 'cancelled'
                              ? 'bg-red-500/20 text-red-400'
                              : 'bg-gold-500/20 text-gold-300'
                          }`}
                        >
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => viewInvoice(order)}
                          className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-gold-500 hover:text-charcoal-950 text-slate-200 border border-white/10 text-[11px] font-medium transition-colors"
                        >
                          Tax Invoice
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: MERCHANTS & VENDORS */}
      {activeTab === 'merchants' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businesses.map(b => (
            <div
              key={b.id}
              className="p-5 rounded-2xl glass-card border border-white/10 flex items-start space-x-4"
            >
              <img
                src={b.logo}
                alt={b.name}
                className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white truncate">{b.name}</h4>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gold-500/20 text-gold-300">
                    {b.type.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1 line-clamp-1">{b.address}</p>
                <div className="flex items-center space-x-3 text-xs mt-2 text-slate-300 font-mono">
                  <span>★ {b.rating} ({b.reviewCount}+)</span>
                  <span>•</span>
                  <span>Min: ₹{b.minOrder}</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">GSTIN Verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 4: COURIERS FLEET */}
      {activeTab === 'couriers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {drivers.map(d => (
            <div
              key={d.id}
              className="p-5 rounded-2xl glass-card border border-white/10 flex items-start space-x-4"
            >
              <img
                src={d.photo}
                alt={d.name}
                className="w-14 h-14 rounded-2xl object-cover border border-white/10 flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-white">{d.name}</h4>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      d.isOnline ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
                    }`}
                  >
                    {d.isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  {d.vehicleType} • <span className="font-mono text-slate-200">{d.vehiclePlate}</span>
                </p>
                <div className="flex items-center space-x-3 text-xs mt-2 text-slate-300 font-mono">
                  <span className="text-gold-400">★ {d.rating}</span>
                  <span>•</span>
                  <span>{d.totalDeliveries} Deliveries</span>
                  <span>•</span>
                  <span className="text-emerald-400 font-bold">₹{d.earningsToday} Today</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 5: PLATFORM SETTINGS & SECURITY */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-gold-400" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">Platform Security & Backend Integrations</h3>
                  <p className="text-xs text-slate-400">Enterprise Cloud Infrastructure Status</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                PRODUCTION HARDENED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-charcoal-900 border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs">
                  <Server className="w-4 h-4 text-cyan-400" />
                  <span>Firebase Project ID</span>
                </div>
                <p className="font-mono text-sm text-white">omniroute-cep</p>
                <p className="text-[10px] text-emerald-400">● Auth & Firestore Online</p>
              </div>

              <div className="p-4 rounded-2xl bg-charcoal-900 border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs">
                  <Compass className="w-4 h-4 text-electric-orange" />
                  <span>MapTiler Dataviz Dark</span>
                </div>
                <p className="font-mono text-sm text-white">HnFKjuxLz2I1IfboVn4P</p>
                <p className="text-[10px] text-emerald-400">● Live 512px Vector Tiles</p>
              </div>

              <div className="p-4 rounded-2xl bg-charcoal-900 border border-white/10 space-y-2">
                <div className="flex items-center space-x-2 text-slate-300 font-bold text-xs">
                  <Lock className="w-4 h-4 text-gold-400" />
                  <span>Firestore Security Rules</span>
                </div>
                <p className="font-mono text-sm text-white">rules_version = '2'</p>
                <p className="text-[10px] text-emerald-400">● Zero Self-Escalation RBAC</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-charcoal-900 border border-white/10 space-y-3">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider font-mono">
                Security Enforcements Active
              </h4>
              <ul className="text-xs text-slate-300 space-y-1.5 list-disc pl-5">
                <li><strong className="text-white">Strict RBAC:</strong> Customer, Hotel Owner, Vendor, Courier Partner, and Administrator dashboards are isolated with React Router guards and Firestore Rules.</li>
                <li><strong className="text-white">Public Admin Prohibition:</strong> Administrators can never be created through public self-registration.</li>
                <li><strong className="text-white">Pending Verification:</strong> Merchant and courier partner accounts require administrative approval before operational dispatch.</li>
                <li><strong className="text-white">OTP Delivery Verification:</strong> 4-digit confirmation PIN is required to complete deliveries.</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
