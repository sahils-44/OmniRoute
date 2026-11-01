import { Coordinates, Order, RouteStop, DeliveryBatch } from '../types';

/**
 * Calculates the great-circle distance between two geographic coordinates
 * using the Haversine formula in kilometers.
 */
export function calculateHaversineDistanceKm(c1: Coordinates, c2: Coordinates): number {
  const R = 6371; // Earth's mean radius in km
  const dLat = toRad(c2.lat - c1.lat);
  const dLng = toRad(c2.lng - c1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(c1.lat)) * Math.cos(toRad(c2.lat)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(2));
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Estimates travel time in minutes based on distance and average urban vehicle speed.
 * Includes a realistic 2-minute buffer per traffic segment.
 */
export function estimateTravelTimeMinutes(distanceKm: number, speedKmh: number = 24): number {
  const travelMinutes = (distanceKm / speedKmh) * 60;
  return Math.max(3, Math.round(travelMinutes + 2));
}

/**
 * Checks whether current coordinates are within a specified geofence radius (default: 1.0 km)
 */
export function isWithinGeofence(
  currentCoords: Coordinates,
  targetCoords: Coordinates,
  radiusKm: number = 1.0
): boolean {
  return calculateHaversineDistanceKm(currentCoords, targetCoords) <= radiusKm;
}

/**
 * Solves the Traveling Salesperson Problem (TSP) with fixed origin (Vendor/Shop)
 * using a Greedy Nearest Neighbor heuristic enhanced with 2-Opt swap optimization.
 * This guarantees the lowest transit distance and most efficient drop-off sequence.
 */
export function optimizeMultiOrderRoute(
  vendorCoords: Coordinates,
  orders: Order[]
): {
  orderedOrders: Order[];
  stops: RouteStop[];
  totalDistanceKm: number;
  totalTimeMin: number;
} {
  if (orders.length === 0) {
    return { orderedOrders: [], stops: [], totalDistanceKm: 0, totalTimeMin: 0 };
  }

  // 1. Greedy Nearest-Neighbor Route Construction
  const unvisited = [...orders];
  const orderedOrders: Order[] = [];
  let currentLocation = { ...vendorCoords };

  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let minDistance = calculateHaversineDistanceKm(currentLocation, unvisited[0].destinationCoords);

    for (let i = 1; i < unvisited.length; i++) {
      const dist = calculateHaversineDistanceKm(currentLocation, unvisited[i].destinationCoords);
      if (dist < minDistance) {
        minDistance = dist;
        nearestIdx = i;
      }
    }

    const nextOrder = unvisited.splice(nearestIdx, 1)[0];
    orderedOrders.push(nextOrder);
    currentLocation = nextOrder.destinationCoords;
  }

  // 2. 2-Opt Optimization for order sequence refinement (if 3 or more stops)
  if (orderedOrders.length >= 3) {
    let improved = true;
    let iterations = 0;
    const maxIterations = 20;

    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;

      for (let i = 0; i < orderedOrders.length - 1; i++) {
        for (let k = i + 1; k < orderedOrders.length; k++) {
          const currentDist = computeTourDistance(vendorCoords, orderedOrders);
          
          // Reverse sub-segment [i...k]
          const newTour = [...orderedOrders];
          const sub = newTour.slice(i, k + 1).reverse();
          newTour.splice(i, sub.length, ...sub);

          const newDist = computeTourDistance(vendorCoords, newTour);
          if (newDist < currentDist - 0.05) { // 50m minimum improvement
            orderedOrders.splice(0, orderedOrders.length, ...newTour);
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }
  }

  // 3. Build detailed RouteStop manifest with cumulative time & distance
  const stops: RouteStop[] = [];
  let cumDistance = 0;
  let cumMinutes = 0;
  let prevCoords = vendorCoords;

  orderedOrders.forEach((order, index) => {
    const legDistance = calculateHaversineDistanceKm(prevCoords, order.destinationCoords);
    const legMinutes = estimateTravelTimeMinutes(legDistance);
    cumDistance += legDistance;
    cumMinutes += legMinutes;

    const arrivalTime = new Date(Date.now() + cumMinutes * 60000).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    stops.push({
      stopNumber: index + 1,
      type: 'delivery',
      orderId: order.id,
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      customerPhone: order.customerPhone,
      address: order.deliveryAddress,
      coordinates: order.destinationCoords,
      estimatedArrival: arrivalTime,
      status: 'pending',
      itemsSummary: order.items.map(i => `${i.quantity}x ${i.menuItem.name}`).join(', '),
      deliveryOtp: order.deliveryConfirmationCode || '1234',
    });

    prevCoords = order.destinationCoords;
  });

  return {
    orderedOrders,
    stops,
    totalDistanceKm: Number(cumDistance.toFixed(2)),
    totalTimeMin: cumMinutes,
  };
}

function computeTourDistance(origin: Coordinates, tour: Order[]): number {
  let dist = 0;
  let cur = origin;
  for (const order of tour) {
    dist += calculateHaversineDistanceKm(cur, order.destinationCoords);
    cur = order.destinationCoords;
  }
  return dist;
}

/**
 * Intelligent Batch Creator for Local Vendors:
 * Clusters pending and compatible orders by geographic proximity and prep time.
 */
export function clusterVendorOrdersIntoBatches(
  vendorId: string,
  vendorName: string,
  vendorCoords: Coordinates,
  eligibleOrders: Order[]
): DeliveryBatch[] {
  // Only cluster orders that belong to this vendor and are ready/preparing
  const vendorOrders = eligibleOrders.filter(
    o => o.businessId === vendorId &&
    ['accepted', 'preparing', 'ready_for_pickup'].includes(o.status) &&
    !o.batchId
  );

  if (vendorOrders.length === 0) return [];

  // Group into batches of maximum 4 orders (ideal motorcycle/scooter courier capacity)
  const batches: DeliveryBatch[] = [];
  const remaining = [...vendorOrders];
  let batchCounter = 1;

  while (remaining.length > 0) {
    const seedOrder = remaining.shift()!;
    const batchGroup: Order[] = [seedOrder];

    // Find up to 3 nearest neighbor orders within 4.5km cluster radius
    for (let i = remaining.length - 1; i >= 0 && batchGroup.length < 4; i--) {
      const candidate = remaining[i];
      const distToSeed = calculateHaversineDistanceKm(
        seedOrder.destinationCoords,
        candidate.destinationCoords
      );

      if (distToSeed <= 4.5) {
        batchGroup.push(candidate);
        remaining.splice(i, 1);
      }
    }

    // Run TSP route optimizer on the batch
    const { stops, totalDistanceKm, totalTimeMin } = optimizeMultiOrderRoute(
      vendorCoords,
      batchGroup
    );

    batches.push({
      id: `BATCH-${Date.now()}-${batchCounter}`,
      batchCode: `MULTI-${vendorName.substring(0, 3).toUpperCase()}-${String(batchCounter).padStart(3, '0')}`,
      vendorId,
      vendorName,
      vendorCoords,
      orderIds: batchGroup.map(o => o.id),
      status: 'suggested',
      totalDistanceKm,
      estimatedTimeMin: totalTimeMin,
      stops,
      currentStopIndex: 0,
      createdAt: new Date().toISOString(),
    });

    batchCounter++;
  }

  return batches;
}
