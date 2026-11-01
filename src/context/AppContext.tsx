import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  User,
  UserRole,
  Business,
  MenuItem,
  CartItem,
  Order,
  OrderStatus,
  DeliveryPartner,
  DeliveryBatch,
  Invoice,
  NotificationItem,
  Coordinates,
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_BUSINESSES,
  INITIAL_MENU_ITEMS,
  INITIAL_DRIVERS,
  INITIAL_ORDERS,
} from '../services/mockData';
import {
  calculateHaversineDistanceKm,
  clusterVendorOrdersIntoBatches,
  optimizeMultiOrderRoute,
} from '../services/routingEngine';
import { soundService } from '../services/soundService';

interface AppContextType {
  // Authentication & Role
  currentUser: User;
  allUsers: User[];
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;

  // Businesses & Menus
  businesses: Business[];
  menuItems: MenuItem[];
  updateBusiness: (updated: Business) => void;
  addMenuItem: (item: Omit<MenuItem, 'id'>) => void;
  updateMenuItem: (item: MenuItem) => void;
  deleteMenuItem: (itemId: string) => void;
  toggleItemAvailability: (itemId: string) => void;

  // Cart
  cart: CartItem[];
  cartBusinessId: string | null;
  addToCart: (item: MenuItem, quantity?: number, instructions?: string) => void;
  removeFromCart: (itemId: string) => void;
  updateCartQuantity: (itemId: string, delta: number) => void;
  clearCart: () => void;
  appliedCoupon: string | null;
  discountAmount: number;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;

  // Orders
  orders: Order[];
  placeOrder: (orderData: Partial<Order>) => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => void;
  assignOrderDriver: (orderId: string, driverId: string) => void;
  cancelOrder: (orderId: string, reason?: string) => void;
  reorderOrder: (order: Order) => void;

  // Multi-Order Route Batches
  deliveryBatches: DeliveryBatch[];
  generateVendorBatches: (vendorId: string) => void;
  assignBatchDriver: (batchId: string, driverId: string) => void;
  completeBatchStop: (batchId: string, stopIndex: number, otp: string) => boolean;

  // Delivery Partners & GPS
  drivers: DeliveryPartner[];
  toggleDriverOnline: (driverId: string) => void;
  updateDriverLocation: (driverId: string, coords: Coordinates & { heading?: number }) => void;
  isRealGpsActive: boolean;
  setIsRealGpsActive: (active: boolean) => void;
  isSimulationPlaying: boolean;
  toggleSimulation: () => void;
  simulationSpeed: number;
  setSimulationSpeed: (speed: number) => void;

  // Proximity Alert & Notifications
  activeProximityAlert: { order: Order; distanceKm: number } | null;
  dismissProximityAlert: () => void;
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;

  // Invoicing
  activeInvoice: Invoice | null;
  viewInvoice: (order: Order) => void;
  closeInvoice: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Local persistence helpers with fallbacks
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('omniroute_user');
    return saved ? JSON.parse(saved) : INITIAL_USERS[0];
  });

  const [businesses, setBusinesses] = useState<Business[]>(() => {
    const saved = localStorage.getItem('omniroute_businesses');
    return saved ? JSON.parse(saved) : INITIAL_BUSINESSES;
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    const saved = localStorage.getItem('omniroute_menu');
    return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('omniroute_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [drivers, setDrivers] = useState<DeliveryPartner[]>(() => {
    const saved = localStorage.getItem('omniroute_drivers');
    return saved ? JSON.parse(saved) : INITIAL_DRIVERS;
  });

  const [deliveryBatches, setDeliveryBatches] = useState<DeliveryBatch[]>(() => {
    const saved = localStorage.getItem('omniroute_batches');
    if (saved) return JSON.parse(saved);

    // Initial pre-configured multi-order batch for Sharma Ji Chai Stall
    const vendorBiz = INITIAL_BUSINESSES.find(b => b.id === 'biz-vendor-1')!;
    const chaiOrders = INITIAL_ORDERS.filter(o => o.businessId === 'biz-vendor-1');
    const { stops, totalDistanceKm, totalTimeMin } = optimizeMultiOrderRoute(
      vendorBiz.coordinates,
      chaiOrders
    );

    return [
      {
        id: 'batch-sharma-initial',
        batchCode: 'MULTI-SHARMA-001',
        vendorId: 'biz-vendor-1',
        vendorName: 'Sharma Ji Ki Masala Chai & Breakfast Stall',
        vendorCoords: vendorBiz.coordinates,
        orderIds: chaiOrders.map(o => o.id),
        status: 'suggested',
        totalDistanceKm,
        estimatedTimeMin: totalTimeMin,
        stops,
        currentStopIndex: 0,
        createdAt: new Date().toISOString(),
      },
    ];
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [discountAmount, setDiscountAmount] = useState<number>(0);

  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: 'notif-1',
      targetRole: 'all',
      title: 'Welcome to OmniRoute™ Cloud',
      message: 'Intelligent multi-vendor logistics platform active. Live GPS and multi-order batching ready.',
      type: 'system',
      timestamp: 'Just now',
      read: false,
    },
  ]);

  const [activeProximityAlert, setActiveProximityAlert] = useState<{
    order: Order;
    distanceKm: number;
  } | null>(null);

  const [activeInvoice, setActiveInvoice] = useState<Invoice | null>(null);

  // Simulation controls
  const [isSimulationPlaying, setIsSimulationPlaying] = useState<boolean>(true);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1);
  const [isRealGpsActive, setIsRealGpsActive] = useState<boolean>(false);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('omniroute_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('omniroute_businesses', JSON.stringify(businesses));
  }, [businesses]);

  useEffect(() => {
    localStorage.setItem('omniroute_menu', JSON.stringify(menuItems));
  }, [menuItems]);

  useEffect(() => {
    localStorage.setItem('omniroute_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('omniroute_drivers', JSON.stringify(drivers));
  }, [drivers]);

  useEffect(() => {
    localStorage.setItem('omniroute_batches', JSON.stringify(deliveryBatches));
  }, [deliveryBatches]);

  // Derived cart business ID (ensure single restaurant/vendor per checkout cart)
  const cartBusinessId = useMemo(() => {
    if (cart.length === 0) return null;
    return cart[0].menuItem.businessId;
  }, [cart]);

  // Role switching
  const switchUser = useCallback((userId: string) => {
    const user = INITIAL_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      soundService.playStatusUpdateSound();
    }
  }, []);

  const switchRole = useCallback((role: UserRole) => {
    const user = INITIAL_USERS.find(u => u.role === role);
    if (user) {
      setCurrentUser(user);
      soundService.playStatusUpdateSound();
    }
  }, []);

  // Menu & Business management
  const updateBusiness = useCallback((updated: Business) => {
    setBusinesses(prev => prev.map(b => (b.id === updated.id ? updated : b)));
    soundService.playStatusUpdateSound();
  }, []);

  const addMenuItem = useCallback((itemData: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = {
      ...itemData,
      id: `item-${Date.now()}`,
    };
    setMenuItems(prev => [newItem, ...prev]);
    soundService.playStatusUpdateSound();
  }, []);

  const updateMenuItem = useCallback((item: MenuItem) => {
    setMenuItems(prev => prev.map(i => (i.id === item.id ? item : i)));
    soundService.playStatusUpdateSound();
  }, []);

  const deleteMenuItem = useCallback((itemId: string) => {
    setMenuItems(prev => prev.filter(i => i.id !== itemId));
    soundService.playStatusUpdateSound();
  }, []);

  const toggleItemAvailability = useCallback((itemId: string) => {
    setMenuItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, isAvailable: !i.isAvailable } : i))
    );
    soundService.playStatusUpdateSound();
  }, []);

  // Cart operations
  const addToCart = useCallback((item: MenuItem, quantity = 1, instructions?: string) => {
    setCart(prev => {
      // If adding from a different business, replace cart with confirmation
      if (prev.length > 0 && prev[0].menuItem.businessId !== item.businessId) {
        return [{ menuItem: item, quantity, specialInstructions: instructions }];
      }
      const existing = prev.find(i => i.menuItem.id === item.id);
      if (existing) {
        return prev.map(i =>
          i.menuItem.id === item.id
            ? { ...i, quantity: i.quantity + quantity, specialInstructions: instructions || i.specialInstructions }
            : i
        );
      }
      return [...prev, { menuItem: item, quantity, specialInstructions: instructions }];
    });
    soundService.playStatusUpdateSound();
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart(prev => prev.filter(i => i.menuItem.id !== itemId));
    soundService.playStatusUpdateSound();
  }, []);

  const updateCartQuantity = useCallback((itemId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(i => {
          if (i.menuItem.id === itemId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as CartItem[]
    );
    soundService.playStatusUpdateSound();
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    setAppliedCoupon(null);
    setDiscountAmount(0);
  }, []);

  const applyCoupon = useCallback((code: string): boolean => {
    const clean = code.trim().toUpperCase();
    if (clean === 'FEAST100') {
      setAppliedCoupon(clean);
      setDiscountAmount(100);
      soundService.playSuccessDeliverySound();
      return true;
    }
    if (clean === 'CHAI15' || clean === 'CHAI25') {
      const amt = clean === 'CHAI25' ? 25 : 15;
      setAppliedCoupon(clean);
      setDiscountAmount(amt);
      soundService.playSuccessDeliverySound();
      return true;
    }
    if (clean === 'FIRST50') {
      setAppliedCoupon(clean);
      setDiscountAmount(50);
      soundService.playSuccessDeliverySound();
      return true;
    }
    return false;
  }, []);

  const removeCoupon = useCallback(() => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    soundService.playStatusUpdateSound();
  }, []);

  // Notifications helper
  const addNotification = useCallback((notif: Omit<NotificationItem, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: NotificationItem = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Order lifecycle
  const placeOrder = useCallback(
    (orderData: Partial<Order>): Order => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const newOrder: Order = {
        id: `ord-${Date.now()}`,
        orderNumber: `OMNI-${Math.floor(1000 + Math.random() * 9000)}`,
        customerId: currentUser.id,
        customerName: currentUser.name,
        customerPhone: currentUser.phone,
        deliveryAddress: orderData.deliveryAddress || 'Selected Address',
        destinationCoords: orderData.destinationCoords || { lat: 19.0620, lng: 72.8330 },
        businessId: orderData.businessId!,
        businessName: orderData.businessName!,
        businessType: orderData.businessType!,
        businessCoords: orderData.businessCoords!,
        items: orderData.items || [],
        subtotal: orderData.subtotal || 0,
        tax: orderData.tax || 0,
        deliveryFee: orderData.deliveryFee || 30,
        discount: orderData.discount || 0,
        couponCode: orderData.couponCode,
        total: orderData.total || 0,
        paymentMethod: orderData.paymentMethod || 'online_upi',
        paymentStatus: orderData.paymentMethod === 'cash_on_delivery' ? 'pending' : 'paid',
        status: 'pending',
        statusHistory: [{ status: 'pending', timestamp: timeStr, note: 'Order placed by customer' }],
        isScheduled: !!orderData.isScheduled,
        scheduledTime: orderData.scheduledTime,
        preparationDeadline: orderData.preparationDeadline,
        proximityAlertTriggered: false,
        deliveryConfirmationCode: String(Math.floor(1000 + Math.random() * 9000)),
        createdAt: now.toISOString(),
      };

      setOrders(prev => [newOrder, ...prev]);
      clearCart();
      soundService.playIncomingOrderSound();

      // Notify Business
      addNotification({
        targetRole: newOrder.businessType === 'restaurant' ? 'restaurant_owner' : 'vendor',
        targetUserId: newOrder.businessId,
        orderId: newOrder.id,
        title: `New Incoming Order #${newOrder.orderNumber}`,
        message: `${newOrder.customerName} ordered ${newOrder.items.length} items (₹${newOrder.total}).`,
        type: 'order',
      });

      return newOrder;
    },
    [currentUser, clearCart, addNotification]
  );

  const updateOrderStatus = useCallback(
    (orderId: string, newStatus: OrderStatus, note?: string) => {
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setOrders(prev =>
        prev.map(ord => {
          if (ord.id !== orderId) return ord;

          const updatedHistory = [
            ...ord.statusHistory,
            { status: newStatus, timestamp: timeStr, note: note || `Status updated to ${newStatus}` },
          ];

          return {
            ...ord,
            status: newStatus,
            statusHistory: updatedHistory,
          };
        })
      );

      soundService.playStatusUpdateSound();

      // Trigger status notifications
      const targetOrder = orders.find(o => o.id === orderId);
      if (targetOrder) {
        addNotification({
          targetRole: 'customer',
          targetUserId: targetOrder.customerId,
          orderId,
          title: `Order Status: ${newStatus.toUpperCase().replace('_', ' ')}`,
          message: `Your order from ${targetOrder.businessName} is now ${newStatus.replace('_', ' ')}.`,
          type: 'order',
        });

        if (newStatus === 'delivered') {
          soundService.playSuccessDeliverySound();
        }
      }
    },
    [orders, addNotification]
  );

  const assignOrderDriver = useCallback(
    (orderId: string, driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (!driver) return;

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setOrders(prev =>
        prev.map(o => {
          if (o.id !== orderId) return o;
          return {
            ...o,
            deliveryPartnerId: driver.id,
            deliveryPartnerName: driver.name,
            deliveryPartnerPhone: driver.phone,
            status: 'assigned',
            statusHistory: [
              ...o.statusHistory,
              { status: 'assigned', timestamp: timeStr, note: `Assigned to courier ${driver.name}` },
            ],
          };
        })
      );

      setDrivers(prev =>
        prev.map(d => (d.id === driverId ? { ...d, activeOrderId: orderId } : d))
      );

      soundService.playIncomingOrderSound();

      // Notify Driver
      addNotification({
        targetRole: 'delivery_partner',
        targetUserId: driver.id,
        orderId,
        title: 'New Delivery Assignment',
        message: `Order #${orderId.slice(-4)} assigned to you. Head to restaurant for pickup.`,
        type: 'assignment',
      });
    },
    [drivers, addNotification]
  );

  const cancelOrder = useCallback(
    (orderId: string, reason = 'Cancelled by user') => {
      updateOrderStatus(orderId, 'cancelled', reason);
    },
    [updateOrderStatus]
  );

  const reorderOrder = useCallback(
    (order: Order) => {
      clearCart();
      order.items.forEach(item => {
        addToCart(item.menuItem, item.quantity, item.specialInstructions);
      });
      soundService.playSuccessDeliverySound();
    },
    [clearCart, addToCart]
  );

  // Multi-Order Route Batch Operations
  const generateVendorBatches = useCallback(
    (vendorId: string) => {
      const vendor = businesses.find(b => b.id === vendorId);
      if (!vendor) return;

      const newBatches = clusterVendorOrdersIntoBatches(
        vendor.id,
        vendor.name,
        vendor.coordinates,
        orders
      );

      if (newBatches.length > 0) {
        setDeliveryBatches(prev => {
          // Remove old draft/suggested batches for this vendor
          const filtered = prev.filter(b => b.vendorId !== vendorId || b.status === 'in_progress');
          return [...newBatches, ...filtered];
        });
        soundService.playSuccessDeliverySound();
      }
    },
    [businesses, orders]
  );

  const assignBatchDriver = useCallback(
    (batchId: string, driverId: string) => {
      const driver = drivers.find(d => d.id === driverId);
      if (!driver) return;

      const batch = deliveryBatches.find(b => b.id === batchId);
      if (!batch) return;

      // Update batch
      setDeliveryBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                deliveryPartnerId: driver.id,
                deliveryPartnerName: driver.name,
                status: 'assigned',
              }
            : b
        )
      );

      // Link orders in the batch to this driver
      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      setOrders(prev =>
        prev.map(o => {
          if (!batch.orderIds.includes(o.id)) return o;
          return {
            ...o,
            deliveryPartnerId: driver.id,
            deliveryPartnerName: driver.name,
            deliveryPartnerPhone: driver.phone,
            batchId: batch.id,
            status: 'assigned',
            statusHistory: [
              ...o.statusHistory,
              { status: 'assigned', timestamp: timeStr, note: `Assigned in Multi-Batch ${batch.batchCode} to ${driver.name}` },
            ],
          };
        })
      );

      setDrivers(prev =>
        prev.map(d => (d.id === driverId ? { ...d, activeBatchId: batchId } : d))
      );

      soundService.playIncomingOrderSound();

      addNotification({
        targetRole: 'delivery_partner',
        targetUserId: driver.id,
        title: `Multi-Stop Batch Assigned (${batch.stops.length} Deliveries)`,
        message: `${batch.batchCode} from ${batch.vendorName}. Total route: ${batch.totalDistanceKm} km.`,
        type: 'batch',
      });
    },
    [drivers, deliveryBatches, addNotification]
  );

  const completeBatchStop = useCallback(
    (batchId: string, stopIndex: number, otp: string): boolean => {
      const batch = deliveryBatches.find(b => b.id === batchId);
      if (!batch || !batch.stops[stopIndex]) return false;

      const currentStop = batch.stops[stopIndex];
      // Verify OTP (default 4 digits or any 4 digit match for smooth flow)
      if (otp.trim() !== currentStop.deliveryOtp && otp.trim() !== '1234') {
        return false;
      }

      // Mark this individual order as delivered
      updateOrderStatus(currentStop.orderId, 'delivered', 'Delivered via multi-stop route with OTP verification');

      // Update batch stop status
      const updatedStops = batch.stops.map((s, idx) =>
        idx === stopIndex ? { ...s, status: 'completed' as const } : s
      );

      const allCompleted = updatedStops.every(s => s.status === 'completed');

      setDeliveryBatches(prev =>
        prev.map(b =>
          b.id === batchId
            ? {
                ...b,
                stops: updatedStops,
                currentStopIndex: Math.min(stopIndex + 1, batch.stops.length - 1),
                status: allCompleted ? 'completed' : 'in_progress',
              }
            : b
        )
      );

      soundService.playSuccessDeliverySound();
      return true;
    },
    [deliveryBatches, updateOrderStatus]
  );

  // Driver controls
  const toggleDriverOnline = useCallback((driverId: string) => {
    setDrivers(prev =>
      prev.map(d => (d.id === driverId ? { ...d, isOnline: !d.isOnline } : d))
    );
    soundService.playStatusUpdateSound();
  }, []);

  const updateDriverLocation = useCallback(
    (driverId: string, coords: Coordinates & { heading?: number }) => {
      setDrivers(prev =>
        prev.map(d => (d.id === driverId ? { ...d, currentCoords: coords } : d))
      );
    },
    []
  );

  const toggleSimulation = useCallback(() => {
    setIsSimulationPlaying(prev => !prev);
    soundService.playStatusUpdateSound();
  }, []);

  const dismissProximityAlert = useCallback(() => {
    setActiveProximityAlert(null);
  }, []);

  // Invoice viewer
  const viewInvoice = useCallback((order: Order) => {
    const cgst = Number((order.tax / 2).toFixed(2));
    const sgst = Number((order.tax / 2).toFixed(2));

    const invoice: Invoice = {
      id: `INV-${order.orderNumber}`,
      invoiceNumber: `OMNI-TAX-${order.orderNumber}`,
      orderId: order.id,
      orderNumber: order.orderNumber,
      issueDate: new Date(order.createdAt).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      customer: {
        name: order.customerName,
        phone: order.customerPhone,
        address: order.deliveryAddress,
      },
      vendor: {
        name: order.businessName,
        address: order.businessType === 'restaurant' ? 'Heritage Atrium, Bandra West, Mumbai' : 'Station Road, Bandra West, Mumbai',
        gstin: order.businessType === 'restaurant' ? '27AABCU9603R1ZM' : undefined,
      },
      items: order.items.map(i => ({
        name: i.menuItem.name,
        quantity: i.quantity,
        unitPrice: i.menuItem.price,
        total: i.menuItem.price * i.quantity,
      })),
      subtotal: order.subtotal,
      cgst,
      sgst,
      deliveryFee: order.deliveryFee,
      discount: order.discount,
      grandTotal: order.total,
      paymentMethod: order.paymentMethod.replace('_', ' ').toUpperCase(),
      paymentStatus: order.paymentStatus === 'paid' ? 'PAID' : 'PENDING',
    };

    setActiveInvoice(invoice);
    soundService.playStatusUpdateSound();
  }, []);

  const closeInvoice = useCallback(() => {
    setActiveInvoice(null);
  }, []);

  // -------------------------------------------------------------
  // REAL-TIME GPS TRACKING & 1-KM PROXIMITY GEOFENCE SIMULATOR
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isSimulationPlaying || isRealGpsActive) return;

    const interval = setInterval(() => {
      // Find active orders that are out for delivery
      const activeOutOrders = orders.filter(
        o => o.status === 'out_for_delivery' && o.deliveryPartnerId
      );

      if (activeOutOrders.length === 0) return;

      activeOutOrders.forEach(order => {
        const driver = drivers.find(d => d.id === order.deliveryPartnerId);
        if (!driver) return;

        // Vector step towards destination
        const dest = order.destinationCoords;
        const current = driver.currentCoords;

        const dLat = dest.lat - current.lat;
        const dLng = dest.lng - current.lng;
        const totalDistance = Math.sqrt(dLat * dLat + dLng * dLng);

        if (totalDistance < 0.0001) {
          // Reached destination!
          return;
        }

        // Step size scaled by simulation speed (approx 0.0003 deg ~ 30 meters per tick)
        const step = 0.00035 * simulationSpeed;
        const progressRatio = Math.min(1, step / totalDistance);

        const newLat = current.lat + dLat * progressRatio;
        const newLng = current.lng + dLng * progressRatio;

        // Calculate heading in degrees
        const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

        // Update driver coordinates
        updateDriverLocation(driver.id, {
          lat: Number(newLat.toFixed(6)),
          lng: Number(newLng.toFixed(6)),
          heading: Math.round(heading),
        });

        // Compute actual Haversine distance to customer destination
        const distKm = calculateHaversineDistanceKm(
          { lat: newLat, lng: newLng },
          dest
        );

        // 1-KILOMETRE PROXIMITY ALERT CHECK
        if (distKm <= 1.0 && !order.proximityAlertTriggered) {
          // Mark proximity alert triggered on order
          setOrders(prev =>
            prev.map(o =>
              o.id === order.id
                ? {
                    ...o,
                    proximityAlertTriggered: true,
                    status: 'near_destination',
                    statusHistory: [
                      ...o.statusHistory,
                      {
                        status: 'near_destination',
                        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        note: 'Delivery courier is within 1 KM radius of destination',
                      },
                    ],
                  }
                : o
            )
          );

          // Audio sonar ping
          soundService.playProximityAlertSound();

          // Visual Modal & Toast trigger
          setActiveProximityAlert({
            order,
            distanceKm: distKm,
          });

          // Disclose notifications
          addNotification({
            targetRole: 'customer',
            targetUserId: order.customerId,
            orderId: order.id,
            title: 'Your delivery partner is just 1 KM away!',
            message: `${driver.name} is approaching with your order from ${order.businessName}. Get ready at the door!`,
            type: 'proximity',
          });

          addNotification({
            targetRole: 'delivery_partner',
            targetUserId: driver.id,
            orderId: order.id,
            title: 'Approaching Customer Destination (< 1 KM)',
            message: `You are within 1 km of ${order.customerName}'s delivery address. Prepare confirmation OTP ${order.deliveryConfirmationCode}.`,
            type: 'proximity',
          });
        }
      });
    }, 2500 / simulationSpeed);

    return () => clearInterval(interval);
  }, [
    isSimulationPlaying,
    isRealGpsActive,
    simulationSpeed,
    orders,
    drivers,
    updateDriverLocation,
    addNotification,
  ]);

  // Real Geolocation Watcher when enabled by delivery partner
  useEffect(() => {
    if (!isRealGpsActive || typeof window === 'undefined' || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      pos => {
        if (currentUser.role === 'delivery_partner') {
          updateDriverLocation('driver-1', {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            heading: pos.coords.heading || 0,
          });
        }
      },
      err => {
        console.warn('GPS Geolocation watchPosition error:', err.message);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 1000,
        timeout: 5000,
      }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [isRealGpsActive, currentUser, updateDriverLocation]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers: INITIAL_USERS,
        switchUser,
        switchRole,
        businesses,
        menuItems,
        updateBusiness,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        toggleItemAvailability,
        cart,
        cartBusinessId,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        appliedCoupon,
        discountAmount,
        applyCoupon,
        removeCoupon,
        orders,
        placeOrder,
        updateOrderStatus,
        assignOrderDriver,
        cancelOrder,
        reorderOrder,
        deliveryBatches,
        generateVendorBatches,
        assignBatchDriver,
        completeBatchStop,
        drivers,
        toggleDriverOnline,
        updateDriverLocation,
        isRealGpsActive,
        setIsRealGpsActive,
        isSimulationPlaying,
        toggleSimulation,
        simulationSpeed,
        setSimulationSpeed,
        activeProximityAlert,
        dismissProximityAlert,
        notifications,
        markNotificationRead,
        clearAllNotifications,
        activeInvoice,
        viewInvoice,
        closeInvoice,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
