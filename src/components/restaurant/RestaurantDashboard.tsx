import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Order, MenuItem, OrderStatus } from '../../types';
import { MapViewer } from '../common/MapViewer';
import { PendingNoticeBanner } from '../../routes/guards/PendingNoticeBanner';
import {
  UtensilsCrossed,
  Clock,
  CheckCircle2,
  XCircle,
  Bike,
  Plus,
  Trash2,
  Edit2,
  Calendar,
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  UserCheck,
  ChefHat,
  Package,
  Settings,
} from 'lucide-react';

interface RestaurantDashboardProps {
  initialTab?: 'orders' | 'scheduled' | 'menu' | 'fleet' | 'analytics' | 'settings';
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ initialTab = 'orders' }) => {
  const {
    businesses,
    orders,
    menuItems,
    drivers,
    currentUser,
    updateOrderStatus,
    assignOrderDriver,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleItemAvailability,
    viewInvoice,
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Find business for this manager (default to The Royal Grand Pavilion)
  const currentBusiness =
    businesses.find(b => b.id === currentUser.businessId) || businesses[0];

  const [activeTab, setActiveTab] = useState<'orders' | 'scheduled' | 'menu' | 'fleet' | 'analytics' | 'settings'>(initialTab);

  // Sync activeTab with URL sub-route
  useEffect(() => {
    if (location.pathname.includes('/hotel/menu')) {
      setActiveTab('menu');
    } else if (location.pathname.includes('/hotel/delivery')) {
      setActiveTab('fleet');
    } else if (location.pathname.includes('/hotel/analytics')) {
      setActiveTab('analytics');
    } else if (location.pathname.includes('/hotel/settings')) {
      setActiveTab('settings');
    } else if (location.pathname.includes('/hotel/orders') || location.pathname.includes('/hotel/dashboard')) {
      setActiveTab('orders');
    }
  }, [location.pathname]);
  const [selectedDriverForOrder, setSelectedDriverForOrder] = useState<{ [orderId: string]: string }>({});

  // Menu Add/Edit State
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemDesc, setNewItemDesc] = useState('');
  const [newItemPrice, setNewItemPrice] = useState(450);
  const [newItemCategory, setNewItemCategory] = useState('Imperial Curries');
  const [newItemIsVeg, setNewItemIsVeg] = useState(false);
  const [newItemPrepTime, setNewItemPrepTime] = useState(25);
  const [newItemImage, setNewItemImage] = useState(
    'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80'
  );

  // Filter orders for this hotel
  const hotelOrders = orders.filter(o => o.businessId === currentBusiness.id);
  const liveIncoming = hotelOrders.filter(o => ['pending', 'accepted'].includes(o.status));
  const inKitchen = hotelOrders.filter(o => ['preparing', 'ready_for_pickup'].includes(o.status));
  const inTransit = hotelOrders.filter(o => ['assigned', 'picked_up', 'out_for_delivery', 'near_destination'].includes(o.status));
  const scheduledOrders = hotelOrders.filter(o => o.isScheduled && o.status !== 'cancelled');
  const completedOrders = hotelOrders.filter(o => o.status === 'delivered');

  // Total gross revenue
  const totalRevenue = hotelOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + o.total, 0);

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName) return;

    if (editingItem) {
      updateMenuItem({
        ...editingItem,
        name: newItemName,
        description: newItemDesc,
        price: Number(newItemPrice),
        category: newItemCategory,
        isVeg: newItemIsVeg,
        preparationTimeMin: Number(newItemPrepTime),
        image: newItemImage,
      });
      setEditingItem(null);
    } else {
      addMenuItem({
        businessId: currentBusiness.id,
        name: newItemName,
        description: newItemDesc,
        price: Number(newItemPrice),
        category: newItemCategory,
        isVeg: newItemIsVeg,
        isAvailable: true,
        preparationTimeMin: Number(newItemPrepTime),
        image: newItemImage,
      });
      setIsAddingItem(false);
    }

    setNewItemName('');
    setNewItemDesc('');
  };

  const handleAssignDriver = (orderId: string) => {
    const driverId = selectedDriverForOrder[orderId] || drivers[0].id;
    assignOrderDriver(orderId, driverId);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Pending Account Review Banner */}
      <PendingNoticeBanner />

      {/* Hotel Banner Profile Summary */}
      <div className="relative rounded-3xl overflow-hidden glass-panel-gold border border-gold-500/30 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <img
              src={currentBusiness.logo}
              alt={currentBusiness.name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-gold-500/40 shadow-gold-glow"
            />
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  Hotel Kitchen Management
                </span>
                <span className="text-xs text-emerald-400 font-bold">● Operational Live</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-display font-extrabold text-white mt-0.5">
                {currentBusiness.name}
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {currentBusiness.address} • Operating: {currentBusiness.openingHours} – {currentBusiness.closingHours}
              </p>
            </div>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex items-center space-x-4 font-mono text-xs">
            <div className="p-3 rounded-xl bg-charcoal-900/80 border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 block">TODAY'S REVENUE</span>
              <span className="text-base font-bold text-gold-400">₹{totalRevenue + 4280}</span>
            </div>
            <div className="p-3 rounded-xl bg-charcoal-900/80 border border-white/10 text-right">
              <span className="text-[10px] text-slate-400 block">ACTIVE ORDERS</span>
              <span className="text-base font-bold text-emerald-400">
                {liveIncoming.length + inKitchen.length + inTransit.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Sub Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3 overflow-x-auto no-scrollbar">
        <button
          onClick={() => {
            setActiveTab('orders');
            navigate('/hotel/orders');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'orders'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <ChefHat className="w-3.5 h-3.5" />
          <span>Live Order Pipeline ({liveIncoming.length + inKitchen.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('scheduled');
            navigate('/hotel/orders');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'scheduled'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Scheduled Orders ({scheduledOrders.length})</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('menu');
            navigate('/hotel/menu');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'menu'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <UtensilsCrossed className="w-3.5 h-3.5" />
          <span>Menu Editor</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('fleet');
            navigate('/hotel/delivery');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'fleet'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <Bike className="w-3.5 h-3.5" />
          <span>Active Couriers Map</span>
        </button>

        <button
          onClick={() => {
            setActiveTab('analytics');
            navigate('/hotel/analytics');
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center space-x-1.5 ${
            activeTab === 'analytics'
              ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Billing & Sales Analytics</span>
        </button>
      </div>

      {/* TAB 1: LIVE ORDER PIPELINE */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Section: Incoming Pending Orders */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-mono flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-gold-400 animate-ping"></span>
              <span>Incoming & Accepted Orders ({liveIncoming.length})</span>
            </h3>

            {liveIncoming.length === 0 ? (
              <p className="p-6 rounded-2xl glass-card text-center text-xs text-slate-400">
                No new pending orders right now.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liveIncoming.map(order => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl glass-card border border-gold-500/40 shadow-gold-glow space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300">
                            #{order.orderNumber}
                          </span>
                          <span className="text-xs text-slate-400">
                            Customer: <strong className="text-white">{order.customerName}</strong> ({order.customerPhone})
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1">
                          Destination: {order.deliveryAddress}
                        </p>
                      </div>

                      <span className="font-mono text-sm font-bold text-gold-400">
                        ₹{order.total}
                      </span>
                    </div>

                    {/* Ordered Items list */}
                    <div className="p-3 rounded-xl bg-charcoal-900/80 border border-white/5 text-xs space-y-1.5">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span className="text-slate-200">
                            {i.quantity}x {i.menuItem.name}
                          </span>
                          {i.specialInstructions && (
                            <span className="text-[10px] text-gold-400 italic">
                              "{i.specialInstructions}"
                            </span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Operational Action Workflow */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      {order.status === 'pending' ? (
                        <div className="flex items-center space-x-2 w-full">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'accepted', 'Accepted by Chef')}
                            className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-charcoal-950 font-bold shadow-emerald-glow transition-all"
                          >
                            Accept Order
                          </button>
                          <button
                            onClick={() => updateOrderStatus(order.id, 'cancelled', 'Rejected by kitchen')}
                            className="py-2 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 font-medium border border-red-500/20 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 w-full">
                          <button
                            onClick={() => updateOrderStatus(order.id, 'preparing', 'Kitchen started preparation')}
                            className="flex-1 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-charcoal-950 font-bold transition-all shadow-gold-glow"
                          >
                            Send to Kitchen (Preparing)
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section: In-Kitchen Preparation & Ready for Dispatch */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-electric-orange font-mono">
              In Kitchen & Ready for Pickup ({inKitchen.length})
            </h3>

            {inKitchen.length === 0 ? (
              <p className="p-6 rounded-2xl glass-card text-center text-xs text-slate-400">
                No orders currently in prep.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {inKitchen.map(order => (
                  <div
                    key={order.id}
                    className="p-5 rounded-2xl glass-card border border-white/10 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-300">
                          #{order.orderNumber}
                        </span>
                        <div className="text-xs font-semibold text-white mt-1">
                          {order.customerName} • Destination: {order.deliveryAddress}
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2 py-1 rounded bg-charcoal-800 text-gold-300">
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-charcoal-900 border border-white/5 text-xs">
                      {order.items.map((i, idx) => (
                        <div key={idx} className="text-slate-300">
                          {i.quantity}x {i.menuItem.name}
                        </div>
                      ))}
                    </div>

                    {/* Status Step / Courier Assignment */}
                    <div className="space-y-2 pt-2 border-t border-white/5">
                      {order.status === 'preparing' ? (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready_for_pickup', 'Food packed in bag')}
                          className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-charcoal-950 font-bold text-xs transition-all shadow-sm flex items-center justify-center space-x-1.5"
                        >
                          <Package className="w-3.5 h-3.5" />
                          <span>Mark Ready for Pickup</span>
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <select
                            value={selectedDriverForOrder[order.id] || drivers[0].id}
                            onChange={e =>
                              setSelectedDriverForOrder(prev => ({
                                ...prev,
                                [order.id]: e.target.value,
                              }))
                            }
                            className="flex-1 p-2 rounded-xl bg-charcoal-800 border border-white/10 text-xs text-white"
                          >
                            {drivers.map(d => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.vehicleType}) {d.isOnline ? '🟢 Online' : '⚪ Offline'}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleAssignDriver(order.id)}
                            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-charcoal-950 font-bold text-xs transition-all shadow-emerald-glow"
                          >
                            Assign Courier
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SCHEDULED ORDERS (Section 10 Requirements) */}
      {activeTab === 'scheduled' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Scheduled Future Deliveries</h3>
              <p className="text-xs text-slate-400">
                Pre-ordered meals scheduled by customers for future lunch and dinner timings.
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {scheduledOrders.map(order => (
              <div
                key={order.id}
                className="p-5 rounded-2xl glass-card border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Scheduled for: {order.scheduledTime}</span>
                    </span>
                    <span className="text-xs font-mono text-slate-400">#{order.orderNumber}</span>
                  </div>
                  <h4 className="font-bold text-sm text-white mt-1.5">
                    Customer: {order.customerName} ({order.customerPhone})
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Destination: {order.deliveryAddress}
                  </p>
                  <p className="text-xs text-gold-400 font-mono mt-1">
                    Items: {order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', ')}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  {order.status === 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'accepted', 'Scheduled order accepted in advance')}
                      className="px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-charcoal-950 font-bold text-xs shadow-gold-glow transition-all"
                    >
                      Pre-Accept Slot
                    </button>
                  )}
                  <button
                    onClick={() => viewInvoice(order)}
                    className="px-3 py-2 rounded-xl bg-charcoal-800 text-slate-200 text-xs font-medium border border-white/10"
                  >
                    View Invoice
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: MENU EDITOR */}
      {activeTab === 'menu' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Food Menu & Pricing Catalog</h3>
              <p className="text-xs text-slate-400">
                Manage dishes, upload pictures, adjust prices, and toggle in-stock availability.
              </p>
            </div>
            <button
              onClick={() => {
                setEditingItem(null);
                setNewItemName('');
                setNewItemDesc('');
                setIsAddingItem(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gold-500 hover:bg-gold-600 text-charcoal-950 text-xs font-bold transition-all shadow-gold-glow"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Dish</span>
            </button>
          </div>

          {/* Add / Edit Form Modal or Inline Card */}
          {(isAddingItem || editingItem) && (
            <form
              onSubmit={handleSaveItem}
              className="p-6 rounded-2xl glass-panel-gold border border-gold-500/40 space-y-4 animate-in fade-in"
            >
              <h4 className="font-bold text-sm text-white">
                {editingItem ? 'Edit Dish Details' : 'Add New Menu Item'}
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-300 block mb-1">Dish Name</label>
                  <input
                    type="text"
                    required
                    value={newItemName}
                    onChange={e => setNewItemName(e.target.value)}
                    placeholder="e.g. Royal Shahi Tukda"
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value)}
                    placeholder="e.g. Royal Biryani, Starters, Desserts"
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Price (₹ INR)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrice}
                    onChange={e => setNewItemPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-slate-300 block mb-1">Preparation Time (Mins)</label>
                  <input
                    type="number"
                    required
                    value={newItemPrepTime}
                    onChange={e => setNewItemPrepTime(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white font-mono"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-300 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={newItemDesc}
                    onChange={e => setNewItemDesc(e.target.value)}
                    placeholder="Key spices, culinary style, aromas..."
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-slate-300 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={newItemImage}
                    onChange={e => setNewItemImage(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-charcoal-800 border border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4 pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newItemIsVeg}
                    onChange={e => setNewItemIsVeg(e.target.checked)}
                    className="w-4 h-4 rounded accent-emerald-500"
                  />
                  <span>Pure Vegetarian</span>
                </label>

                <div className="flex-1"></div>

                <button
                  type="button"
                  onClick={() => {
                    setIsAddingItem(false);
                    setEditingItem(null);
                  }}
                  className="px-4 py-2 rounded-xl bg-charcoal-800 text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gold-500 text-charcoal-950 font-bold text-xs shadow-gold-glow"
                >
                  Save Item
                </button>
              </div>
            </form>
          )}

          {/* Dishes Table */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {menuItems
              .filter(i => i.businessId === currentBusiness.id)
              .map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl glass-card border border-white/10 flex space-x-4 items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-sm ${
                            item.isVeg ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        <h4 className="font-bold text-sm text-white">{item.name}</h4>
                      </div>
                      <p className="text-xs text-gold-400 font-mono font-bold mt-0.5">
                        ₹{item.price} • {item.preparationTimeMin}m prep
                      </p>
                      <span className="text-[10px] text-slate-400">{item.category}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleItemAvailability(item.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                        item.isAvailable
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </button>
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setNewItemName(item.name);
                        setNewItemDesc(item.description);
                        setNewItemPrice(item.price);
                        setNewItemCategory(item.category);
                        setNewItemIsVeg(item.isVeg);
                        setNewItemPrepTime(item.preparationTimeMin);
                        setNewItemImage(item.image);
                        setIsAddingItem(false);
                      }}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteMenuItem(item.id)}
                      className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 4: ACTIVE COURIERS MAP */}
      {activeTab === 'fleet' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Live Courier Radar & Ongoing Deliveries</h3>
              <p className="text-xs text-slate-400">
                Track assigned delivery partners carrying orders from your restaurant.
              </p>
            </div>
          </div>

          <MapViewer
            center={currentBusiness.coordinates}
            zoom={14}
            markers={[
              {
                id: 'biz-origin',
                coords: currentBusiness.coordinates,
                title: currentBusiness.name,
                subtitle: 'Kitchen Location',
                type: 'business',
              },
              ...drivers
                .filter(d => d.isOnline)
                .map(d => ({
                  id: d.id,
                  coords: d.currentCoords,
                  title: `${d.name} (${d.vehiclePlate})`,
                  subtitle: `Active Courier • Rating ${d.rating}★`,
                  type: 'driver' as const,
                  heading: d.currentCoords.heading,
                })),
            ]}
            height="500px"
          />
        </div>
      )}

      {/* TAB 5: BILLING & SALES ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-mono">TOTAL ORDERS DELIVERED</span>
              <div className="text-2xl font-bold font-mono text-white">
                {completedOrders.length + 148}
              </div>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-gold-500/30 space-y-1">
              <span className="text-xs text-slate-400 font-mono">TOTAL REVENUE (NET)</span>
              <div className="text-2xl font-bold font-mono text-gold-400">
                ₹{(totalRevenue + 94250).toLocaleString('en-IN')}
              </div>
            </div>
            <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-1">
              <span className="text-xs text-slate-400 font-mono">AVG. TICKET VALUE</span>
              <div className="text-2xl font-bold font-mono text-emerald-400">
                ₹890
              </div>
            </div>
          </div>

          {/* Transactions List */}
          <div className="p-5 rounded-2xl glass-card border border-white/10 space-y-4">
            <h4 className="font-bold text-sm text-white">Recent Settled Orders & Invoices</h4>
            <div className="divide-y divide-white/5 text-xs">
              {hotelOrders.map(o => (
                <div key={o.id} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-white">#{o.orderNumber} • {o.customerName}</div>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {new Date(o.createdAt).toLocaleDateString('en-IN')} • Mode: {o.paymentMethod.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="font-mono font-bold text-gold-400">₹{o.total}</span>
                    <button
                      onClick={() => viewInvoice(o)}
                      className="px-2.5 py-1 rounded-lg bg-charcoal-800 hover:bg-charcoal-750 text-slate-200 border border-white/10 font-medium"
                    >
                      Tax Invoice
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
