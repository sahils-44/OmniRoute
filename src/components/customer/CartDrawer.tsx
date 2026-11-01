import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SAVED_ADDRESSES } from '../../services/mockData';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Calendar,
  Clock,
  Tag,
  CreditCard,
  Banknote,
  Smartphone,
  ShieldCheck,
  ArrowRight,
  MapPin,
  Check,
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ isOpen, onClose, onOrderSuccess }) => {
  const {
    cart,
    businesses,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    appliedCoupon,
    discountAmount,
    applyCoupon,
    removeCoupon,
    placeOrder,
  } = useApp();

  const [selectedAddress, setSelectedAddress] = useState(SAVED_ADDRESSES[0]);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('Today');
  const [scheduleTime, setScheduleTime] = useState('08:30 PM');
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'online_upi' | 'online_card' | 'cash_on_delivery'>('online_upi');
  const [isPlacing, setIsPlacing] = useState(false);

  if (!isOpen) return null;

  const currentBusiness = cart.length > 0 ? businesses.find(b => b.id === cart[0].menuItem.businessId) : null;

  const subtotal = cart.reduce((acc, item) => acc + item.menuItem.price * item.quantity, 0);
  const tax = currentBusiness ? Number((subtotal * currentBusiness.taxRate).toFixed(2)) : 0;
  const deliveryFee = subtotal > 500 ? 0 : 35;
  const finalTotal = Math.max(0, subtotal + tax + deliveryFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const ok = applyCoupon(couponInput);
    if (!ok) {
      setCouponError('Invalid promo code. Try FEAST100 or CHAI15');
      setTimeout(() => setCouponError(''), 3000);
    } else {
      setCouponInput('');
      setCouponError('');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0 || !currentBusiness) return;
    setIsPlacing(true);

    setTimeout(() => {
      const newOrder = placeOrder({
        businessId: currentBusiness.id,
        businessName: currentBusiness.name,
        businessType: currentBusiness.type,
        businessCoords: currentBusiness.coordinates,
        deliveryAddress: selectedAddress.address,
        destinationCoords: selectedAddress.coordinates,
        items: cart,
        subtotal,
        tax,
        deliveryFee,
        discount: discountAmount,
        couponCode: appliedCoupon || undefined,
        total: finalTotal,
        paymentMethod,
        isScheduled,
        scheduledTime: isScheduled ? `${scheduleDate} at ${scheduleTime}` : undefined,
      });

      setIsPlacing(false);
      onClose();
      onOrderSuccess(newOrder.id);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-[60] flex justify-end bg-charcoal-950/70 backdrop-blur-sm transition-all">
      <div className="relative w-full max-w-md h-full bg-charcoal-900 border-l border-white/10 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 px-6 bg-charcoal-850 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-white">Your Order</h3>
            {currentBusiness && (
              <p className="text-xs text-gold-400 font-medium">{currentBusiness.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {cart.length === 0 ? (
            <div className="text-center py-16 text-slate-400 space-y-3">
              <div className="w-16 h-16 rounded-full bg-charcoal-800 border border-white/5 mx-auto flex items-center justify-center text-2xl">
                🛒
              </div>
              <p className="font-medium text-slate-300">Your basket is empty</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Explore fine dining restaurants and local street vendors to fill your appetite.
              </p>
            </div>
          ) : (
            <>
              {/* Itemized Cart List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Selected Dishes</span>
                  <button
                    onClick={clearCart}
                    className="text-red-400 hover:text-red-300 text-[11px]"
                  >
                    Clear All
                  </button>
                </div>

                {cart.map(item => (
                  <div
                    key={item.menuItem.id}
                    className="p-3 rounded-xl bg-charcoal-850 border border-white/5 flex items-center justify-between"
                  >
                    <div className="flex-1 min-w-0 pr-3">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className={`w-2 h-2 rounded-sm ${
                            item.menuItem.isVeg ? 'bg-emerald-400' : 'bg-red-400'
                          }`}
                        />
                        <h5 className="text-xs font-bold text-white truncate">
                          {item.menuItem.name}
                        </h5>
                      </div>
                      <span className="text-xs font-mono text-gold-400">
                        ₹{item.menuItem.price * item.quantity}
                      </span>
                    </div>

                    {/* Stepper Controls */}
                    <div className="flex items-center space-x-2 bg-charcoal-800 rounded-lg p-1 border border-white/5">
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, -1)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold font-mono text-white w-4 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.menuItem.id, 1)}
                        className="p-1 rounded text-slate-400 hover:text-white"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Address Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                  <MapPin className="w-3.5 h-3.5 text-gold-400" />
                  <span>Delivery Destination</span>
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {SAVED_ADDRESSES.map(addr => (
                    <button
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-3 rounded-xl border text-left text-xs transition-all ${
                        selectedAddress.id === addr.id
                          ? 'bg-gold-500/10 border-gold-500/50 text-white'
                          : 'bg-charcoal-850 border-white/5 text-slate-400 hover:border-white/10'
                      }`}
                    >
                      <div className="font-bold text-slate-200">{addr.label}</div>
                      <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                        {addr.address}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Order Scheduling Engine (Section 10) */}
              <div className="p-3.5 rounded-xl bg-charcoal-850 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-xs font-bold text-white">Schedule for Later</div>
                      <p className="text-[10px] text-slate-400">Pre-order for an upcoming meal</p>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={isScheduled}
                    onChange={e => setIsScheduled(e.target.checked)}
                    className="w-4 h-4 rounded accent-gold-500 cursor-pointer"
                  />
                </div>

                {isScheduled && (
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400">Date</span>
                      <select
                        value={scheduleDate}
                        onChange={e => setScheduleDate(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-charcoal-800 border border-white/10 text-white text-xs font-mono"
                      >
                        <option value="Today">Today</option>
                        <option value="Tomorrow">Tomorrow</option>
                        <option value="Day after Tomorrow">Day after Tomorrow</option>
                      </select>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400">Slot</span>
                      <select
                        value={scheduleTime}
                        onChange={e => setScheduleTime(e.target.value)}
                        className="w-full mt-1 p-2 rounded-lg bg-charcoal-800 border border-white/10 text-white text-xs font-mono"
                      >
                        <option value="01:30 PM">01:30 PM (Lunch)</option>
                        <option value="05:00 PM">05:00 PM (Hi-Tea)</option>
                        <option value="08:30 PM">08:30 PM (Dinner)</option>
                        <option value="10:00 PM">10:00 PM (Late Night)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Promo Code & Discounts */}
              <div className="space-y-2">
                <form onSubmit={handleApplyCoupon} className="flex space-x-2">
                  <div className="relative flex-1">
                    <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Coupon: FEAST100, CHAI15"
                      value={couponInput}
                      onChange={e => setCouponInput(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 rounded-xl bg-charcoal-850 border border-white/10 text-xs text-white uppercase placeholder:text-slate-500 focus:outline-none focus:border-gold-500/50"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-charcoal-800 hover:bg-gold-500 hover:text-charcoal-950 text-slate-200 text-xs font-bold border border-white/10 transition-all"
                  >
                    Apply
                  </button>
                </form>

                {couponError && (
                  <p className="text-[11px] text-red-400 font-medium">{couponError}</p>
                )}

                {appliedCoupon && (
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs">
                    <span className="text-emerald-400 font-medium">
                      Coupon <strong>{appliedCoupon}</strong> applied (-₹{discountAmount})
                    </span>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-white text-[11px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">Payment Option</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online_upi')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'online_upi'
                        ? 'bg-gold-500/10 border-gold-500 text-gold-300 font-bold'
                        : 'bg-charcoal-850 border-white/5 text-slate-400'
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span className="text-[11px]">Instant UPI</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online_card')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'online_card'
                        ? 'bg-gold-500/10 border-gold-500 text-gold-300 font-bold'
                        : 'bg-charcoal-850 border-white/5 text-slate-400'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span className="text-[11px]">Card / Net</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash_on_delivery')}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center space-y-1 ${
                      paymentMethod === 'cash_on_delivery'
                        ? 'bg-gold-500/10 border-gold-500 text-gold-300 font-bold'
                        : 'bg-charcoal-850 border-white/5 text-slate-400'
                    }`}
                  >
                    <Banknote className="w-4 h-4" />
                    <span className="text-[11px]">Cash on Del.</span>
                  </button>
                </div>
              </div>

              {/* Financial Bill Breakdown */}
              <div className="p-4 rounded-2xl bg-charcoal-850 border border-white/5 space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-400">
                  <span>Subtotal</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                {tax > 0 && (
                  <div className="flex justify-between text-slate-400">
                    <span>GST (CGST + SGST)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Delivery Partner Fee</span>
                  <span>{deliveryFee === 0 ? <span className="text-emerald-400 font-sans">FREE</span> : `₹${deliveryFee}`}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400 font-medium">
                    <span>Discount</span>
                    <span>-₹{discountAmount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-white/10">
                  <span className="font-sans">Grand Total</span>
                  <span className="text-gold-400">₹{finalTotal.toFixed(2)}</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Checkout Footer Bar */}
        {cart.length > 0 && (
          <div className="p-4 bg-charcoal-950 border-t border-white/10">
            <button
              onClick={handleCheckout}
              disabled={isPlacing}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-gold-500 via-gold-400 to-amber-500 text-charcoal-950 font-bold text-sm shadow-gold-glow hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center space-x-2"
            >
              {isPlacing ? (
                <span>Generating Order...</span>
              ) : (
                <>
                  <span>
                    {isScheduled ? 'Schedule Order' : 'Place Order'} • ₹{finalTotal.toFixed(2)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
