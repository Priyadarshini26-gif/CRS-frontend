import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const LocationMarker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const mapEvents = useMap();

  useEffect(() => {
    const handleMapClick = (e) => {
      const newPos = e.latlng;
      setPosition(newPos);
      onLocationSelect([newPos.lng, newPos.lat]);
    };

    mapEvents.on('click', handleMapClick);

    return () => {
      mapEvents.off('click', handleMapClick);
    };
  }, [mapEvents, onLocationSelect]);

  return position === null ? null : (
    <Marker
      position={[position.lat, position.lng]}
      draggable={true}
      eventHandlers={{
        dragend: (e) => {
          const newPos = e.target.getLatLng();
          setPosition(newPos);
          onLocationSelect([newPos.lng, newPos.lat]);
        }
      }}
    >
      <Popup>Issue location (draggable)</Popup>
    </Marker>
  );
};

const Map = ({ onLocationSelect, initialLocation = null, readOnly = false }) => {
  const [position, setPosition] = useState(initialLocation ? [initialLocation[1], initialLocation[0]] : [20.5937, 78.9629]); // Default to India center

  useEffect(() => {
    if (initialLocation) {
      setPosition([initialLocation[1], initialLocation[0]]);
    }
  }, [initialLocation]);

  const handleLocationSelect = (coords) => {
    onLocationSelect(coords);
  };

  return (
    <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={position}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly && <LocationMarker onLocationSelect={handleLocationSelect} />}
        {initialLocation && readOnly && (
          <Marker position={[initialLocation[1], initialLocation[0]]}>
            <Popup>Issue Location</Popup>
          </Marker>
        )}
      </MapContainer>
      {!readOnly && (
        <div className="bg-blue-50 p-2 text-sm text-gray-700">
          📍 Click on the map to place a marker. Drag to adjust the exact location.
        </div>
      )}
    </div>
  );
};

export default Map;
