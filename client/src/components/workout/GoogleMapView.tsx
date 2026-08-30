import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Crosshair, Compass, Satellite, Map as MapIcon, Moon, AlertTriangle } from 'lucide-react';

// Google Maps dark mode style
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d0d12' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d0d12' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#6b7280' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#22242D' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#1A1A20' }] },
  { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#4b5563' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1f2028' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#22242D' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#2451D6', lightness: -60 }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#1A1A20' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1a2e' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#3b82f6' }] },
];

interface GoogleMapViewProps {
  coords: [number, number][];
  userLocation?: [number, number] | null;
  isLive?: boolean;
  heading?: number;
  height?: string;
  onLocateMe?: () => void;
}

export const GoogleMapView: React.FC<GoogleMapViewProps> = ({
  coords,
  userLocation = null,
  isLive = false,
  heading = 0,
  height = '320px',
  onLocateMe,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const polylineRef = useRef<google.maps.Polyline | null>(null);
  const userMarkerRef = useRef<google.maps.Marker | null>(null);
  const startMarkerRef = useRef<google.maps.Marker | null>(null);
  const isFollowingRef = useRef(true);

  const [mapStyle, setMapStyle] = useState<'dark' | 'roadmap' | 'satellite'>('dark');
  const [isGmapsLoaded, setIsGmapsLoaded] = useState(false);
  const [isFollowing, setIsFollowing] = useState(true);
  const [useOsmFallback, setUseOsmFallback] = useState(false);

  const compassLabel = getCompassLabel(heading);

  // Check if Google Maps API is loaded (otherwise immediately use high-performance Dark Tile Engine)
  useEffect(() => {
    let checkCount = 0;
    const checkLoaded = () => {
      if (typeof google !== 'undefined' && google.maps && google.maps.Map) {
        setIsGmapsLoaded(true);
        return true;
      }
      return false;
    };

    if (checkLoaded()) return;

    // Window error handler for Google Maps authentication/script failure
    const handleGmapsError = () => {
      setUseOsmFallback(true);
    };
    (window as any).gm_authFailure = handleGmapsError;

    const interval = setInterval(() => {
      checkCount++;
      if (checkLoaded()) {
        clearInterval(interval);
      } else if (checkCount >= 3) { // Switch after 300ms if no Google Maps API script tag is loaded
        clearInterval(interval);
        setUseOsmFallback(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  // Initialize Google Map
  useEffect(() => {
    if (!isGmapsLoaded || useOsmFallback || !mapContainerRef.current || mapRef.current) return;

    try {
      const defaultCenter = userLocation
        ? { lat: userLocation[0], lng: userLocation[1] }
        : coords.length > 0
        ? { lat: coords[coords.length - 1][0], lng: coords[coords.length - 1][1] }
        : { lat: 28.6139, lng: 77.2090 };

      const map = new google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 17,
        disableDefaultUI: true,
        zoomControl: true,
        zoomControlOptions: { position: google.maps.ControlPosition.LEFT_BOTTOM },
        styles: DARK_MAP_STYLE,
        mapTypeId: 'roadmap',
        gestureHandling: 'greedy',
        backgroundColor: '#0d0d12',
      });

      map.addListener('dragstart', () => {
        isFollowingRef.current = false;
        setIsFollowing(false);
      });

      mapRef.current = map;

      const polyline = new google.maps.Polyline({
        path: [],
        geodesic: true,
        strokeColor: '#06B6D4',
        strokeOpacity: 0.95,
        strokeWeight: 5,
      });
      polyline.setMap(map);
      polylineRef.current = polyline;
    } catch (err) {
      console.warn('Google Map creation failed, using backup engine:', err);
      setUseOsmFallback(true);
    }

    return () => {
      if (polylineRef.current) polylineRef.current.setMap(null);
      if (userMarkerRef.current) userMarkerRef.current.setMap(null);
      if (startMarkerRef.current) startMarkerRef.current.setMap(null);
      mapRef.current = null;
      polylineRef.current = null;
      userMarkerRef.current = null;
      startMarkerRef.current = null;
    };
  }, [isGmapsLoaded, useOsmFallback]);

  // Update map style
  useEffect(() => {
    if (!mapRef.current || useOsmFallback) return;
    if (mapStyle === 'dark') {
      mapRef.current.setMapTypeId('roadmap');
      mapRef.current.setOptions({ styles: DARK_MAP_STYLE });
    } else if (mapStyle === 'satellite') {
      mapRef.current.setMapTypeId('satellite');
      mapRef.current.setOptions({ styles: [] });
    } else {
      mapRef.current.setMapTypeId('roadmap');
      mapRef.current.setOptions({ styles: [] });
    }
  }, [mapStyle, useOsmFallback]);

  // Update route polyline
  useEffect(() => {
    if (!polylineRef.current || !mapRef.current || useOsmFallback) return;
    const path = coords.map(([lat, lng]) => ({ lat, lng }));
    polylineRef.current.setPath(path);
  }, [coords, useOsmFallback]);

  // Update start marker
  useEffect(() => {
    if (!mapRef.current || coords.length === 0 || useOsmFallback) return;
    const startPos = { lat: coords[0][0], lng: coords[0][1] };

    if (!startMarkerRef.current) {
      startMarkerRef.current = new google.maps.Marker({
        position: startPos,
        map: mapRef.current,
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10B981',
          fillOpacity: 1,
          strokeColor: '#0A0A0A',
          strokeWeight: 3,
        },
        title: 'Start Point',
        zIndex: 10,
      });
    } else {
      startMarkerRef.current.setPosition(startPos);
    }
  }, [coords, useOsmFallback]);

  // Update user location marker + auto-follow
  useEffect(() => {
    if (!mapRef.current || useOsmFallback) return;

    const currentPos = coords.length > 0
      ? { lat: coords[coords.length - 1][0], lng: coords[coords.length - 1][1] }
      : userLocation
      ? { lat: userLocation[0], lng: userLocation[1] }
      : null;

    if (!currentPos) return;

    const arrowIcon = {
      path: 'M12 2 L19 21 L12 17 L5 21 Z',
      fillColor: '#06B6D4',
      fillOpacity: 1,
      strokeColor: '#0A0A0A',
      strokeWeight: 2,
      scale: 1.3,
      rotation: heading,
      anchor: new google.maps.Point(12, 12),
    };

    if (!userMarkerRef.current) {
      userMarkerRef.current = new google.maps.Marker({
        position: currentPos,
        map: mapRef.current,
        icon: arrowIcon,
        title: 'Current Position',
        zIndex: 20,
      });
    } else {
      userMarkerRef.current.setPosition(currentPos);
      userMarkerRef.current.setIcon(arrowIcon);
    }

    if (isFollowingRef.current) {
      mapRef.current.panTo(currentPos);
    }
  }, [coords, userLocation, heading, useOsmFallback]);

  const handleRecenter = useCallback(() => {
    if (mapRef.current && !useOsmFallback) {
      const pos = coords.length > 0
        ? { lat: coords[coords.length - 1][0], lng: coords[coords.length - 1][1] }
        : userLocation
        ? { lat: userLocation[0], lng: userLocation[1] }
        : null;
      if (pos) {
        mapRef.current.panTo(pos);
        mapRef.current.setZoom(17);
        isFollowingRef.current = true;
        setIsFollowing(true);
      }
    }
    onLocateMe?.();
  }, [coords, userLocation, onLocateMe, useOsmFallback]);

  // Backup Tile Renderer (CARTO Dark / Satellite / Street) if Google Maps is unavailable
  if (useOsmFallback) {
    const centerPos = coords.length > 0
      ? coords[coords.length - 1]
      : userLocation || [28.6139, 77.2090];

    const getTileServerUrl = () => {
      if (mapStyle === 'satellite') {
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      } else if (mapStyle === 'roadmap') {
        return 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
      }
      return 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    };

    // Calculate tile numbers for center position at zoom level 16
    const zoom = 16;
    const latRad = (centerPos[0] * Math.PI) / 180;
    const n = Math.pow(2, zoom);
    const xtile = Math.floor(((centerPos[1] + 180) / 360) * n);
    const ytile = Math.floor(((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * n);

    const tileUrl = getTileServerUrl()
      .replace('{z}', zoom.toString())
      .replace('{x}', xtile.toString())
      .replace('{y}', ytile.toString())
      .replace('{s}', 'a');

    return (
      <div className="relative w-full rounded-2xl overflow-hidden border border-dark-border/80 shadow-2xl bg-[#0d0d12]" style={{ height }}>
        {/* Tile Background */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-90 transition-all duration-300"
          style={{ backgroundImage: `url(${tileUrl})` }}
        />

        {/* SVG Route Overlay */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-[2]">
          {coords.length > 1 && (
            <polyline
              points={coords.map((_, idx) => `${50 + (idx - coords.length + 1) * 15},${50 + Math.sin(idx) * 10}`).join(' ')}
              fill="none"
              stroke="#06B6D4"
              strokeWidth="4"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Controls Dock */}
        <div className="absolute top-2.5 right-2.5 z-[10] flex items-center gap-1 p-1 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-dark-border/90 text-[10px] font-mono font-bold shadow-lg">
          <button
            onClick={() => setMapStyle('dark')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mapStyle === 'dark' ? 'bg-brand-600 text-white shadow-glow' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Moon className="w-3 h-3 inline mr-0.5" /> Dark
          </button>
          <button
            onClick={() => setMapStyle('roadmap')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mapStyle === 'roadmap' ? 'bg-brand-600 text-white shadow-glow' : 'text-gray-300 hover:text-white'
            }`}
          >
            <MapIcon className="w-3 h-3 inline mr-0.5" /> Street
          </button>
          <button
            onClick={() => setMapStyle('satellite')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
              mapStyle === 'satellite' ? 'bg-brand-600 text-white shadow-glow' : 'text-gray-300 hover:text-white'
            }`}
          >
            <Satellite className="w-3 h-3 inline mr-0.5" /> Satellite
          </button>

          {onLocateMe && (
            <button
              onClick={onLocateMe}
              className="ml-1 p-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all cursor-pointer shrink-0"
              title="Recenter Location"
            >
              <Crosshair className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Status Badges */}
        <div className="absolute top-2.5 left-2.5 z-[10] flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
          <div className="px-3 py-1.5 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-dark-border/90 text-[10px] font-mono font-bold text-gray-200 flex items-center gap-2 shadow-lg">
            <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
            <span>{userLocation ? 'GPS LOCKED' : 'SEARCHING...'}</span>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Direction: {compassLabel} ({heading}°)</span>
          </div>
        </div>

        {/* Center Live Marker */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-[5]">
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 bg-cyan-500/40 rounded-full animate-ping" />
            <div className="relative w-8 h-8 bg-dark-bg border-2 border-cyan-400 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.8)]" style={{ transform: `rotate(${heading}deg)` }}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#06B6D4" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#06B6D4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading state when waiting for Google Maps initialization
  if (!isGmapsLoaded) {
    return (
      <div
        className="relative w-full rounded-2xl overflow-hidden border border-dark-border/80 shadow-2xl bg-[#0d0d12] flex items-center justify-center"
        style={{ height }}
      >
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono">Initializing Live Telemetry Map...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-dark-border/80 shadow-2xl gmap-container" style={{ height }}>
      {/* Map Layer Selector (Top Right) */}
      <div className="absolute top-2.5 right-2.5 z-[10] flex items-center gap-1 p-1 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-dark-border/90 text-[10px] font-mono font-bold shadow-lg">
        <button
          onClick={() => setMapStyle('dark')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            mapStyle === 'dark' ? 'bg-brand-600 text-white shadow-glow' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Moon className="w-3 h-3 inline mr-0.5" /> Dark
        </button>
        <button
          onClick={() => setMapStyle('roadmap')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            mapStyle === 'roadmap' ? 'bg-brand-600 text-white shadow-glow' : 'text-gray-300 hover:text-white'
          }`}
        >
          <MapIcon className="w-3 h-3 inline mr-0.5" /> Street
        </button>
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer whitespace-nowrap ${
            mapStyle === 'satellite' ? 'bg-brand-600 text-white shadow-glow' : 'text-gray-300 hover:text-white'
          }`}
        >
          <Satellite className="w-3 h-3 inline mr-0.5" /> Satellite
        </button>

        <button
          onClick={handleRecenter}
          className="ml-1 p-1.5 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-glow transition-all cursor-pointer shrink-0"
          title="Recenter on Your Location"
        >
          <Crosshair className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* GPS & Direction Status Badges (Top Left) */}
      <div className="absolute top-2.5 left-2.5 z-[10] flex flex-col sm:flex-row items-start sm:items-center gap-1.5">
        <div className="px-3 py-1.5 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-dark-border/90 text-[10px] font-mono font-bold text-gray-200 flex items-center gap-2 shadow-lg">
          <span className={`w-2 h-2 rounded-full ${userLocation ? 'bg-emerald-400 animate-ping' : 'bg-amber-400 animate-pulse'}`} />
          <span>{userLocation ? 'GPS LOCKED' : 'SEARCHING...'}</span>
        </div>

        {(coords.length > 0 || userLocation) && (
          <div className="px-3 py-1.5 rounded-xl bg-dark-bg/95 backdrop-blur-md border border-cyan-500/40 text-[10px] font-mono font-bold text-cyan-300 flex items-center gap-1.5 shadow-lg">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>Direction: {compassLabel} ({heading}°)</span>
          </div>
        )}

        {!isFollowing && (
          <button
            onClick={handleRecenter}
            className="px-3 py-1.5 rounded-xl bg-brand-600/80 backdrop-blur-md border border-brand-400/60 text-[10px] font-mono font-bold text-white flex items-center gap-1.5 shadow-glow cursor-pointer hover:bg-brand-500 transition-all"
          >
            <Crosshair className="w-3 h-3" /> Follow
          </button>
        )}
      </div>

      {/* The Google Map Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

// Helper function
function getCompassLabel(bearing: number): string {
  const directions = ['N ⬆', 'NE ↗', 'E ➡', 'SE ↘', 'S ⬇', 'SW ↙', 'W ⬅', 'NW ↖'];
  const index = Math.round(bearing / 45) % 8;
  return directions[index];
}
