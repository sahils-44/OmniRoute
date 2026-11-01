import React, { useState } from 'react';
import { Business, MenuItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { X, Plus, Minus, ShoppingBag, Flame, Sparkles, Check } from 'lucide-react';

interface MenuModalProps {
  business: Business;
  onClose: () => void;
  onOpenCart: () => void;
}

export const MenuModal: React.FC<MenuModalProps> = ({ business, onClose, onOpenCart }) => {
  const { menuItems, addToCart, cart } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [addedItemId, setAddedItemId] = useState<string | null>(null);
  const [specialNote, setSpecialNote] = useState<string>('');

  const bizItems = menuItems.filter(i => i.businessId === business.id);
  const categories = ['All', ...Array.from(new Set(bizItems.map(i => i.category)))];

  const displayedItems = selectedCategory === 'All'
    ? bizItems
    : bizItems.filter(i => i.category === selectedCategory);

  const handleAddToCart = (item: MenuItem) => {
    addToCart(item, 1, specialNote);
    setAddedItemId(item.id);
    setTimeout(() => setAddedItemId(null), 1200);
  };

  const getItemQuantityInCart = (itemId: string) => {
    const found = cart.find(c => c.menuItem.id === itemId);
    return found ? found.quantity : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-charcoal-900 border border-white/10 rounded-3xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Banner Hero */}
        <div className="relative h-48 md:h-56 w-full flex-shrink-0">
          <img
            src={business.banner}
            alt={business.name}
            className="w-full h-full object-cover brightness-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/40 to-transparent"></div>

          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-charcoal-900/80 text-white hover:bg-charcoal-800 transition-colors border border-white/10"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Business Info Header */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider bg-gold-500/20 text-gold-300 border border-gold-500/30">
                  {business.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-300 flex items-center space-x-1">
                  <span>★</span> <strong className="text-white">{business.rating}</strong> ({business.reviewCount}+ ratings)
                </span>
              </div>
              <h2 className="mt-1 text-2xl md:text-3xl font-bold font-display text-white">
                {business.name}
              </h2>
              <p className="text-xs text-slate-300 line-clamp-1 max-w-xl mt-0.5">
                {business.description}
              </p>
            </div>

            <div className="hidden sm:block text-right">
              <div className="text-xs font-mono text-emerald-400 font-bold">
                ⚡ ~{business.deliveryTimeMin} mins delivery
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Min. Order: ₹{business.minOrder}
              </div>
            </div>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="px-6 py-3 bg-charcoal-850 border-b border-white/10 flex items-center space-x-2 overflow-x-auto flex-shrink-0">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-gold-500 text-charcoal-950 font-bold shadow-gold-glow'
                  : 'bg-charcoal-800 text-slate-300 hover:text-white hover:bg-charcoal-750'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Menu Items List Grid */}
        <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedItems.map(item => {
            const inCartQty = getItemQuantityInCart(item.id);
            const isJustAdded = addedItemId === item.id;

            return (
              <div
                key={item.id}
                className="glass-card rounded-2xl p-4 flex space-x-4 border border-white/5 hover:border-gold-500/30 transition-all group"
              >
                {/* Item Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`w-2.5 h-2.5 rounded-sm border ${
                          item.isVeg
                            ? 'border-emerald-500 bg-emerald-500/20'
                            : 'border-red-500 bg-red-500/20'
                        }`}
                        title={item.isVeg ? 'Vegetarian' : 'Non-Vegetarian'}
                      />
                      <h4 className="font-bold text-sm text-white group-hover:text-gold-300 transition-colors">
                        {item.name}
                      </h4>
                    </div>

                    <p className="mt-1 text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>

                    {item.calories && (
                      <div className="mt-1.5 flex items-center space-x-1 text-[11px] text-slate-500 font-mono">
                        <Flame className="w-3 h-3 text-electric-orange" />
                        <span>{item.calories} kcal • {item.preparationTimeMin}m prep</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-white/5">
                    <div className="flex items-baseline space-x-1.5 font-mono">
                      <span className="text-base font-bold text-gold-400">
                        ₹{item.price}
                      </span>
                      {item.originalPrice && (
                        <span className="text-xs text-slate-500 line-through">
                          ₹{item.originalPrice}
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => handleAddToCart(item)}
                      disabled={!item.isAvailable}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                        !item.isAvailable
                          ? 'bg-charcoal-800 text-slate-500 cursor-not-allowed'
                          : isJustAdded
                          ? 'bg-emerald-500 text-charcoal-950 font-bold'
                          : inCartQty > 0
                          ? 'bg-gold-500 text-charcoal-950 shadow-gold-glow'
                          : 'bg-white/10 hover:bg-gold-500 hover:text-charcoal-950 text-white'
                      }`}
                    >
                      {isJustAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added!</span>
                        </>
                      ) : inCartQty > 0 ? (
                        <>
                          <span>In Cart ({inCartQty})</span>
                          <Plus className="w-3.5 h-3.5" />
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Thumbnail Image */}
                <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 relative">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {!item.isAvailable && (
                    <div className="absolute inset-0 bg-charcoal-950/80 backdrop-blur-xs flex items-center justify-center text-[10px] font-bold text-red-400 uppercase">
                      Sold Out
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Checkout Bar */}
        {cart.length > 0 && cart[0].menuItem.businessId === business.id && (
          <div className="p-4 bg-charcoal-950 border-t border-white/10 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">
                {cart.reduce((a, b) => a + b.quantity, 0)} items selected
              </div>
              <div className="text-sm font-bold font-mono text-gold-400">
                Subtotal: ₹{cart.reduce((a, b) => a + b.quantity * b.menuItem.price, 0)}
              </div>
            </div>

            <button
              onClick={() => {
                onClose();
                onOpenCart();
              }}
              className="flex items-center space-x-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-500 to-amber-500 text-charcoal-950 font-bold text-sm shadow-gold-glow hover:brightness-110 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Proceed to Checkout</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
