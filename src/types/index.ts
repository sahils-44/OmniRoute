export type UserRole =
  | 'customer'
  | 'restaurant_owner'
  | 'hotel_owner'
  | 'vendor'
  | 'delivery_partner'
  | 'admin';

export type UserStatus = 'active' | 'pending' | 'suspended';

export type BusinessType = 'restaurant' | 'street_vendor' | 'bakery' | 'chai_stall' | 'grocery';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  avatar: string;
  status?: UserStatus;
  businessId?: string; // If restaurant owner or vendor
  createdAt?: string;
  updatedAt?: string;
}

export interface Business {
  id: string;
  name: string;
  type: BusinessType;
  tagline: string;
  description: string;
  rating: number;
  reviewCount: number;
  address: string;
  coordinates: Coordinates;
  banner: string;
  logo: string;
  cuisine: string[];
  openingHours: string;
  closingHours: string;
  minOrder: number;
  deliveryTimeMin: number;
  taxRate: number; // e.g. 0.05 for 5% GST
  isOpen: boolean;
  isFeatured?: boolean;
}

export interface MenuItem {
  id: string;
  businessId: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  image: string;
  isVeg: boolean;
  isAvailable: boolean;
  preparationTimeMin: number;
  calories?: number;
  tags?: string[];
}

export interface CartItem {
  menuItem: MenuItem;
  quantity: number;
  specialInstructions?: string;
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready_for_pickup'
  | 'assigned'
  | 'picked_up'
  | 'out_for_delivery'
  | 'near_destination'
  | 'delivered'
  | 'cancelled';

export interface OrderStatusHistoryItem {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  destinationCoords: Coordinates;
  
  businessId: string;
  businessName: string;
  businessType: BusinessType;
  businessCoords: Coordinates;
  
  items: {
    menuItem: MenuItem;
    quantity: number;
    specialInstructions?: string;
  }[];
  
  subtotal: number;
  tax: number;
  deliveryFee: number;
  discount: number;
  couponCode?: string;
  total: number;
  
  paymentMethod: 'cash_on_delivery' | 'online_card' | 'online_upi';
  paymentStatus: 'paid' | 'pending';
  
  status: OrderStatus;
  statusHistory: OrderStatusHistoryItem[];
  
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  deliveryPartnerPhone?: string;
  batchId?: string;
  
  isScheduled: boolean;
  scheduledTime?: string; // ISO or human readable
  preparationDeadline?: string;
  estimatedDeliveryTime?: string;
  
  proximityAlertTriggered: boolean;
  deliveryConfirmationCode: string; // 4 digit OTP
  createdAt: string;
}

export interface DeliveryPartner {
  id: string;
  name: string;
  phone: string;
  vehicleType: 'Electric Scooter' | 'Bike' | 'Van';
  vehiclePlate: string;
  photo: string;
  rating: number;
  isOnline: boolean;
  currentCoords: Coordinates & { heading?: number };
  activeOrderId?: string;
  activeBatchId?: string;
  totalDeliveries: number;
  earningsToday: number;
}

export interface RouteStop {
  stopNumber: number;
  type: 'pickup' | 'delivery';
  orderId: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  address: string;
  coordinates: Coordinates;
  estimatedArrival: string;
  status: 'pending' | 'reached' | 'completed';
  itemsSummary: string;
  deliveryOtp: string;
}

export interface DeliveryBatch {
  id: string;
  batchCode: string;
  vendorId: string;
  vendorName: string;
  vendorCoords: Coordinates;
  orderIds: string[];
  deliveryPartnerId?: string;
  deliveryPartnerName?: string;
  status: 'draft' | 'suggested' | 'assigned' | 'in_progress' | 'completed';
  totalDistanceKm: number;
  estimatedTimeMin: number;
  stops: RouteStop[];
  currentStopIndex: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  orderId: string;
  orderNumber: string;
  issueDate: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  vendor: {
    name: string;
    address: string;
    gstin?: string;
    phone?: string;
  };
  items: {
    name: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  cgst: number;
  sgst: number;
  deliveryFee: number;
  discount: number;
  grandTotal: number;
  paymentMethod: string;
  paymentStatus: 'PAID' | 'PENDING';
}

export interface NotificationItem {
  id: string;
  targetRole: UserRole | 'all';
  targetUserId?: string;
  orderId?: string;
  title: string;
  message: string;
  type: 'order' | 'proximity' | 'system' | 'assignment' | 'batch';
  timestamp: string;
  read: boolean;
}

export interface AddressPreset {
  id: string;
  label: string;
  address: string;
  coordinates: Coordinates;
  isDefault?: boolean;
}

export interface HotelRecord {
  id: string;
  ownerId: string;
  hotelName: string;
  address: string;
  location: Coordinates;
  status: UserStatus;
  createdAt?: string;
  cuisine?: string[];
  rating?: number;
}

export interface VendorRecord {
  id: string;
  ownerId: string;
  vendorName: string;
  address: string;
  location: Coordinates;
  status: UserStatus;
  createdAt?: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetId?: string;
  targetType?: string;
  timestamp: string;
  details?: string;
}
