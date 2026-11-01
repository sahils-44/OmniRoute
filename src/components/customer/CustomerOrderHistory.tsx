import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Order } from '../../types';
import {
  Clock,
  CheckCircle2,
  Calendar,
  FileText,
  RotateCcw,
  Navigation,
  XCircle,
  AlertCircle,
} from 'lucide-react';

interface CustomerOrderHistoryProps {
  onSelectTrackOrder: (orderId: string) => void;
}

export const CustomerOrderHistory: React.FC<CustomerOrderHistoryProps> = ({
  onSelectTrackOrder,
}) => {
  const { orders, currentUser, viewInvoice, reorderOrder, cancelOrder } = useApp();
  const [filter, setFilter] = useState<'all' | 'active' | 'scheduled' | 'completed'>('all');

  const myOrders = orders.filter(o => o.customerId === currentUser.id);

  const filteredOrders = myOrders.filter(o => {
    if (filter === 'active') return !['delivered', 'cancelled'].includes(o.status);
    if (filter === 'scheduled') return o.isScheduled && o.status !== 'cancelled';
    if (filter === 'completed') return o.status === 'delivered';
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-white/10 pb-3">
        {(['all', 'active', 'scheduled', 'completed'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${
              filter === tab
                ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {tab} Orders ({myOrders.filter(o => {
              if (tab === 'active') return !['delivered', 'cancelled'].includes(o.status);
              if (tab === 'scheduled') return o.isScheduled;
              if (tab === 'completed') return o.status === 'delivered';
              return true;
            }).length})
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 text-center text-slate-400 glass-card rounded-3xl">
            <p className="text-sm">No orders matching this category.</p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const isActive = !['delivered', 'cancelled'].includes(order.status);

            return (
              <div
                key={order.id}
                className="p-5 rounded-2xl glass-card border border-white/10 hover:border-gold-500/30 transition-all space-y-4"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-white/5 pb-3">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 border border-gold-500/30">
                        #{order.orderNumber}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      {order.isScheduled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                          <Calendar className="w-3 h-3" />
                          <span>Scheduled: {order.scheduledTime}</span>
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-bold text-white mt-1">
                      {order.businessName}
                    </h3>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-1 rounded-full capitalize ${
                        order.status === 'delivered'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : order.status === 'cancelled'
                          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                          : 'bg-gold-500/20 text-gold-300 border border-gold-500/30 animate-pulse'
                      }`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                    <span className="font-mono text-sm font-bold text-white">
                      ₹{order.total}
                    </span>
                  </div>
                </div>

                {/* Items preview */}
                <div className="text-xs text-slate-300 space-y-1">
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

                {/* Action Shortcuts */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5 text-xs">
                  <div className="text-[11px] text-slate-400">
                    Paid via <span className="font-semibold text-slate-200">{order.paymentMethod.replace('_', ' ').toUpperCase()}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isActive && (
                      <button
                        onClick={() => onSelectTrackOrder(order.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-charcoal-950 font-bold transition-all shadow-emerald-glow"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>Live GPS Track</span>
                      </button>
                    )}

                    <button
                      onClick={() => viewInvoice(order)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-charcoal-800 hover:bg-charcoal-750 text-gold-400 border border-gold-500/30 font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Invoice</span>
                    </button>

                    <button
                      onClick={() => reorderOrder(order)}
                      className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 font-medium transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>

                    {['pending', 'accepted'].includes(order.status) && (
                      <button
                        onClick={() => cancelOrder(order.id, 'Cancelled by customer')}
                        className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-medium transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
