import React, { useEffect, useState } from 'react';
import { MapPin, Navigation, LocateFixed, AlertTriangle } from 'lucide-react';
import { LiveAlert } from '../types';

interface MapPanelProps {
  alert: LiveAlert | null;
}

const MapPanel: React.FC<MapPanelProps> = ({ alert }) => {
  // SECURITY: API Key must be loaded from environment variables
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const [userLoc, setUserLoc] = useState<{lat: number; lng: number} | null>(null);
  const [isLocating, setIsLocating] = useState(true);

  useEffect(() => {
    let watchId: number;

    if (navigator.geolocation) {
      // Use watchPosition for real-time tracking
      watchId = navigator.geolocation.watchPosition(
        (position) => {
          setUserLoc({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setIsLocating(false);
        },
        (error) => {
          console.warn("Location access denied or unavailable:", error);
          setIsLocating(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setIsLocating(false);
    }

    return () => {
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, []);
  
  if (!apiKey) {
    return (
      <div className="h-64 w-full bg-grid-800 rounded-lg border border-gray-800 mb-6 flex items-center justify-center flex-col text-grid-warning p-4">
        <AlertTriangle className="w-8 h-8 mb-2" />
        <p className="text-sm font-mono text-center">GOOGLE_MAPS_API_KEY not configured.</p>
        <p className="text-xs text-gray-500 mt-2">Please add to environment variables.</p>
      </div>
    );
  }

  // Determine the source for the iframe
  let mapSrc = '';
  let statusLabel = '';
  let isUserLocation = false;
  
  // Priority 1: Specific Alert Coordinates (Operational Mode)
  if (alert?.location) {
    mapSrc = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${alert.location.lat},${alert.location.lng}&zoom=14&maptype=satellite`;
    statusLabel = `${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)}`;
  } 
  // Priority 2: Alert District Name (Operational Mode)
  else if (alert?.district) {
    const query = encodeURIComponent(`${alert.district}, New York, NY`);
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${query}&zoom=13&maptype=satellite`;
    statusLabel = alert.district;
  } 
  // Priority 3: User Real-time Location (Idle/Monitoring Mode)
  else if (userLoc) {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=${userLoc.lat},${userLoc.lng}&zoom=15&maptype=satellite`;
    statusLabel = "YOUR LOCATION";
    isUserLocation = true;
  }
  // Priority 4: Default Fallback
  else {
    mapSrc = `https://www.google.com/maps/embed/v1/place?key=${apiKey}&q=New+York,+NY&zoom=11&maptype=satellite`;
    statusLabel = isLocating ? "ACQUIRING SIGNAL..." : "MONITORING REGION";
  }

  return (
    <div 
      className="h-64 w-full bg-grid-800 rounded-lg p-1 border border-gray-800 mb-6 relative overflow-hidden group"
      role="region"
      aria-label={alert ? `Satellite Map of ${alert.district}` : "Satellite Map"}
    >
        <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-2 pointer-events-none">
            <h3 className="text-gray-300 text-xs font-mono uppercase tracking-wider flex items-center">
                {isUserLocation ? (
                   <Navigation className="w-3 h-3 mr-1 text-grid-success animate-pulse" aria-hidden="true" />
                ) : isLocating && !alert ? (
                   <LocateFixed className="w-3 h-3 mr-1 text-grid-warning animate-spin" aria-hidden="true" />
                ) : (
                   <MapPin className="w-3 h-3 mr-1 text-grid-accent" aria-hidden="true" />
                )}
                {isUserLocation ? "Local Uplink Active" : isLocating && !alert ? "Triangulating..." : "Live District Feed"}
            </h3>
        </div>
        
        <iframe
            title="District Map"
            width="100%"
            height="100%"
            style={{ border: 0, filter: 'grayscale(30%) contrast(1.2)' }}
            loading="lazy"
            allowFullScreen
            src={mapSrc}
            className="rounded opacity-80 group-hover:opacity-100 transition-opacity duration-500"
        ></iframe>

        <div className="absolute bottom-2 right-2 z-10 pointer-events-none">
             <span className={`text-[10px] font-mono text-white/90 px-2 py-1 rounded backdrop-blur border ${isUserLocation ? 'bg-emerald-900/40 border-emerald-500/30' : 'bg-black/50 border-transparent'}`}>
                 {statusLabel}
             </span>
        </div>
    </div>
  );
};

export default React.memo(MapPanel);