import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Coordinates, RouteStop } from '../../types';

interface MapMarker {
  id: string;
  coords: Coordinates;
  title: string;
  subtitle?: string;
  type: 'business' | 'customer' | 'driver' | 'stop';
  stopNumber?: number;
  heading?: number;
}

interface MapViewerProps {
  center?: Coordinates;
  zoom?: number;
  markers?: MapMarker[];
  routePolyline?: Coordinates[];
  showGeofenceAround?: Coordinates | null;
  geofenceRadiusMeters?: number;
  height?: string;
  className?: string;
}

export const MapViewer: React.FC<MapViewerProps> = ({
  center = { lat: 19.0620, lng: 72.8330 },
  zoom = 14,
  markers = [],
  routePolyline = [],
  showGeofenceAround = null,
  geofenceRadiusMeters = 1000,
  height = '420px',
  className = '',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const layersRef = useRef<L.LayerGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_API_KEY;
    const isMapTilerConfigured = MAPTILER_KEY && MAPTILER_KEY !== 'your_maptiler_api_key';

    const tileUrl = isMapTilerConfigured
      ? `https://api.maptiler.com/maps/dataviz-dark/{z}/{x}/{y}.png?key=${MAPTILER_KEY}`
      : 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';

    const map = L.map(mapContainerRef.current, {
      center: [center.lat, center.lng],
      zoom,
      zoomControl: true,
      attributionControl: true,
    });

    // MapTiler Dataviz Dark Basemap Layer
    L.tileLayer(tileUrl, {
      maxZoom: 19,
      tileSize: 512,
      zoomOffset: isMapTilerConfigured ? -1 : 0,
      subdomains: isMapTilerConfigured ? '' : 'abcd',
      attribution: isMapTilerConfigured
        ? '&copy; <a href="https://www.maptiler.com/copyright/" target="_blank">MapTiler</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank">OpenStreetMap</a>'
        : '&copy; <a href="https://carto.com/">CartoDB</a>',
    }).addTo(map);

    const layerGroup = L.layerGroup().addTo(map);
    layersRef.current = layerGroup;
    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Markers, Route Polyline and Geofence
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layerGroup = layersRef.current;
    if (!map || !layerGroup) return;

    layerGroup.clearLayers();

    const bounds = L.latLngBounds([]);

    // 1. Render Route Polyline
    if (routePolyline.length >= 2) {
      const latLngs = routePolyline.map(c => [c.lat, c.lng] as [number, number]);
      
      // Shadow / glow path
      L.polyline(latLngs, {
        color: '#FF5722',
        weight: 6,
        opacity: 0.35,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      // Core electric gold-orange route path
      const mainPath = L.polyline(latLngs, {
        color: '#D4AF37',
        weight: 3.5,
        dashArray: '6, 8',
        opacity: 0.95,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(layerGroup);

      latLngs.forEach(ll => bounds.extend(ll));
    }

    // 2. Render 1-KM Geofence Radius Circle
    if (showGeofenceAround) {
      const circle = L.circle([showGeofenceAround.lat, showGeofenceAround.lng], {
        radius: geofenceRadiusMeters,
        color: '#10B981',
        weight: 1.5,
        fillColor: '#10B981',
        fillOpacity: 0.12,
        dashArray: '4, 6',
      }).addTo(layerGroup);

      circle.bindTooltip('1.0 KM Delivery Proximity Geofence Zone', {
        permanent: false,
        direction: 'top',
        className: 'bg-charcoal-900 text-emerald-400 border border-emerald-500/40 px-2 py-1 rounded text-xs',
      });

      bounds.extend([showGeofenceAround.lat, showGeofenceAround.lng]);
    }

    // 3. Render Custom Markers
    markers.forEach(m => {
      bounds.extend([m.coords.lat, m.coords.lng]);

      let iconHtml = '';
      let iconSize: [number, number] = [36, 36];
      let iconAnchor: [number, number] = [18, 18];

      if (m.type === 'business') {
        iconSize = [42, 42];
        iconAnchor = [21, 42];
        iconHtml = `
          <div style="position:relative; width:42px; height:42px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg, #FFD700, #B8860B); border:2px solid #FFF; box-shadow:0 0 16px rgba(212,175,55,0.7); display:flex; align-items:center; justify-content:center; color:#000; font-weight:800; font-size:16px;">
              🏪
            </div>
            <div style="position:absolute; bottom:-6px; width:0; height:0; border-left:6px solid transparent; border-right:6px solid transparent; border-top:8px solid #B8860B;"></div>
          </div>
        `;
      } else if (m.type === 'customer') {
        iconSize = [38, 38];
        iconAnchor = [19, 38];
        iconHtml = `
          <div style="position:relative; width:38px; height:38px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:36px; height:36px; border-radius:50%; background:linear-gradient(135deg, #06B6D4, #3B82F6); border:2px solid #FFF; box-shadow:0 0 14px rgba(6,182,212,0.6); display:flex; align-items:center; justify-content:center; color:#FFF; font-weight:bold; font-size:14px;">
              📍
            </div>
            <div style="position:absolute; bottom:-5px; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:7px solid #3B82F6;"></div>
          </div>
        `;
      } else if (m.type === 'stop') {
        // Sequential Numbered Waypoint Marker (1, 2, 3...)
        iconSize = [36, 36];
        iconAnchor = [18, 36];
        iconHtml = `
          <div style="position:relative; width:36px; height:36px; display:flex; align-items:center; justify-content:center;">
            <div style="position:absolute; width:34px; height:34px; border-radius:50%; background:linear-gradient(135deg, #FF5722, #D84315); border:2px solid #FFF; box-shadow:0 0 14px rgba(255,87,34,0.7); display:flex; align-items:center; justify-content:center; color:#FFF; font-weight:900; font-size:13px; font-family:sans-serif;">
              ${m.stopNumber || 1}
            </div>
            <div style="position:absolute; bottom:-5px; width:0; height:0; border-left:5px solid transparent; border-right:5px solid transparent; border-top:7px solid #D84315;"></div>
          </div>
        `;
      } else if (m.type === 'driver') {
        // Live Moving Courier Marker with Radar Ping Ring
        iconSize = [44, 44];
        iconAnchor = [22, 22];
        const heading = m.heading || 0;
        iconHtml = `
          <div style="position:relative; width:44px; height:44px; display:flex; align-items:center; justify-content:center;">
            <div class="radar-ring" style="position:absolute; width:36px; height:36px; border-radius:50%; border:2px solid #10B981; pointer-events:none;"></div>
            <div style="width:36px; height:36px; border-radius:50%; background:#0E0E14; border:2.5px solid #10B981; box-shadow:0 0 18px rgba(16,185,129,0.8); display:flex; align-items:center; justify-content:center; transform:rotate(${heading}deg); transition:transform 0.4s ease;">
              🛵
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-icon',
        html: iconHtml,
        iconSize,
        iconAnchor,
      });

      const marker = L.marker([m.coords.lat, m.coords.lng], { icon: customIcon }).addTo(layerGroup);

      marker.bindPopup(`
        <div style="font-family:'Plus Jakarta Sans',sans-serif; min-width:160px; padding:4px;">
          <div style="font-weight:700; color:#D4AF37; font-size:14px; margin-bottom:2px;">${m.title}</div>
          ${m.subtitle ? `<div style="font-size:12px; color:#9CA3AF; line-height:1.3;">${m.subtitle}</div>` : ''}
          <div style="margin-top:6px; font-size:11px; font-family:monospace; color:#6B7280;">
            ${m.coords.lat.toFixed(4)}, ${m.coords.lng.toFixed(4)}
          </div>
        </div>
      `);
    });

    // Auto-fit bounds if we have points
    if (bounds.isValid() && (markers.length > 1 || routePolyline.length > 0)) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 16 });
    }
  }, [markers, routePolyline, showGeofenceAround, geofenceRadiusMeters]);

  return (
    <div className={`relative w-full rounded-2xl overflow-hidden border border-white/10 ${className}`}>
      <div ref={mapContainerRef} style={{ width: '100%', height }} />

      {/* Floating Map Legend Overlay */}
      <div className="absolute bottom-3 left-3 z-[1000] px-3 py-2 rounded-xl bg-charcoal-900/90 border border-white/10 backdrop-blur-md text-[11px] font-medium flex items-center space-x-3 text-slate-300 pointer-events-none">
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-gold-500 shadow-gold-glow"></span>
          <span>Pickup</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-electric-orange shadow-orange-glow"></span>
          <span>Waypoints</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Live GPS</span>
        </div>
      </div>
    </div>
  );
};
