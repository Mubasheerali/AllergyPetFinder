import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { type Place } from "@shared/schema";
import { type MapViewport, type MapMarker } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Plus, Minus } from "lucide-react";
import "leaflet/dist/leaflet.css";
import { Icon, DivIcon, Marker as LeafletMarker } from "leaflet";

// Fix the default marker icon issue with Leaflet
// @ts-ignore
delete LeafletMarker.prototype._getIconUrl;
LeafletMarker.mergeOptions({
  icon: new Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  })
});

// Custom markers by safety status
const createCustomMarkerIcon = (allergySafe: boolean) => {
  const color = allergySafe ? "#4CAF50" : "#FFC107";
  return new DivIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36">
      <path d="M12 0C5.4 0 0 5.4 0 12c0 6.2 12 24 12 24s12-17.8 12-24c0-6.6-5.4-12-12-12z" fill="${color}"/>
      <circle cx="12" cy="12" r="6" fill="white"/>
    </svg>`,
    className: "",
    iconSize: [24, 36],
    iconAnchor: [12, 36],
    popupAnchor: [0, -36]
  });
};

// Component to update map view when center changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface MapViewProps {
  places: Place[];
  viewport: MapViewport;
  userLocation: { lat: number; lng: number } | null;
  onMarkerClick: (placeId: number) => void;
}

export function MapView({ places, viewport, userLocation, onMarkerClick }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);

  useEffect(() => {
    if (places) {
      // Convert places to markers
      const mapMarkers = places.map(place => ({
        id: place.id,
        position: { lat: place.latitude, lng: place.longitude },
        allergySafe: place.allergySafe,
        name: place.name
      }));
      setMarkers(mapMarkers);
    }
  }, [places]);

  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const center: [number, number] = [
    viewport.center.lat, 
    viewport.center.lng
  ];

  return (
    <div className="map-container rounded-lg overflow-hidden shadow-md bg-white mb-6 h-80 relative">
      <MapContainer
        center={center}
        zoom={viewport.zoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ChangeView center={center} zoom={viewport.zoom} />
        
        {/* User location marker */}
        {userLocation && (
          <Marker 
            position={[userLocation.lat, userLocation.lng]}
            icon={new DivIcon({
              html: `<div class="h-4 w-4 rounded-full bg-blue-500 border-2 border-white"></div>`,
              className: "",
              iconSize: [16, 16],
              iconAnchor: [8, 8]
            })}
          >
            <Popup>Your location</Popup>
          </Marker>
        )}
        
        {/* Place markers */}
        {markers.map(marker => (
          <Marker
            key={marker.id}
            position={[marker.position.lat, marker.position.lng]}
            icon={createCustomMarkerIcon(marker.allergySafe)}
            eventHandlers={{
              click: () => onMarkerClick(marker.id)
            }}
          >
            <Popup>{marker.name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Map controls */}
      <div className="absolute top-3 right-3 flex flex-col">
        <Button 
          className="bg-white text-black hover:bg-gray-100 mb-2 shadow-sm"
          size="icon"
          onClick={handleZoomIn}
        >
          <Plus className="h-4 w-4" />
        </Button>
        <Button 
          className="bg-white text-black hover:bg-gray-100 shadow-sm"
          size="icon"
          onClick={handleZoomOut}
        >
          <Minus className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Map legend */}
      <div className="absolute bottom-3 right-3 bg-white p-2 rounded-lg shadow-sm text-xs">
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
          <span>Allergy-Safe</span>
        </div>
        <div className="flex items-center mb-1">
          <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
          <span>Some Concerns</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 rounded-full bg-gray-400 mr-2"></div>
          <span>Not Verified</span>
        </div>
      </div>
    </div>
  );
}
