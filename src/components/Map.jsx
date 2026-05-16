import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { issuesAPI } from '../services/api';

// Fix for default Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Category color mapping
const getCategoryColor = (category) => {
  const colorMap = {
    electricity: '#FFD700',
    road: '#FF6347',
    garbage: '#8B4513',
    water: '#4169E1',
    sidewalk: '#FF8C00',
    tree: '#228B22',
    traffic: '#FF1493',
    other: '#808080'
  };
  return colorMap[category] || '#808080';
};

// Create custom marker icon with category color
const createCategoryMarker = (color) => {
  return L.divIcon({
    html: `<div style="background-color: ${color}; border: 2px solid white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [30, 30],
    className: 'custom-marker'
  });
};

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

// Component to display issues from backend API
const IssueMarkers = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const mapEvents = useMap();

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await issuesAPI.getIssues({ status: 'approved' });
        console.log('API Response:', response);
        console.log('Full response.data:', response.data);
        console.log('Issues data:', response.data.issues);
        console.log('Total issues:', response.data.total);
        setIssues(response.data.issues || []);
      } catch (err) {
        console.error('Failed to fetch issues:', err);
        setIssues([]);
      } finally {
        setLoading(false);
      }
    };

    fetchIssues();
  }, []);

  console.log('IssueMarkers - loading:', loading, 'issues count:', issues.length);

  if (loading || issues.length === 0) {
    console.log('No issues to display - loading:', loading, 'issues.length:', issues.length);
    return null;
  }

  return (
    <>
      {issues.map((issue) => {
        const coords = issue.location?.coordinates;
        if (!coords || !Array.isArray(coords) || coords.length < 2) {
          return null;
        }
        
        const [lng, lat] = coords;
        const color = getCategoryColor(issue.category);
        const markerIcon = createCategoryMarker(color);

        return (
          <Marker
            key={issue._id}
            position={[lat, lng]}
            icon={markerIcon}
          >
            <Popup className="issue-popup">
              <div className="w-48">
                <h4 className="font-semibold text-gray-900 text-sm mb-1">{issue.title}</h4>
                <p className="text-xs text-gray-600 mb-2">
                  <span className="inline-block bg-blue-100 text-blue-800 px-2 py-0.5 rounded mr-1">
                    {issue.category}
                  </span>
                  <span className="inline-block bg-green-100 text-green-800 px-2 py-0.5 rounded">
                    {issue.status}
                  </span>
                </p>
                <p className="text-xs text-gray-700 mb-2 line-clamp-2">
                  {issue.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">👍 {issue.votes} votes</span>
                  <a
                    href={`/issues/${issue._id}`}
                    className="text-blue-500 hover:underline font-semibold"
                  >
                    View
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
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

  const categoryLegend = [
    { category: 'electricity', label: 'Electricity', color: '#FFD700' },
    { category: 'road', label: 'Road', color: '#FF6347' },
    { category: 'garbage', label: 'Garbage', color: '#8B4513' },
    { category: 'water', label: 'Water', color: '#4169E1' },
    { category: 'sidewalk', label: 'Sidewalk', color: '#FF8C00' },
    { category: 'tree', label: 'Tree', color: '#228B22' },
    { category: 'traffic', label: 'Traffic', color: '#FF1493' },
    { category: 'other', label: 'Other', color: '#808080' }
  ];

  return (
    <div className="w-full">
      {/* Legend */}
      {readOnly && (
        <div className="bg-white border border-gray-300 rounded-lg p-4 mb-3 shadow-md">
          <h3 className="font-semibold text-gray-900 mb-3 text-sm">Issue Category Legend</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {categoryLegend.map(item => (
              <div key={item.category} className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-full border-2 border-white flex-shrink-0"
                  style={{
                    backgroundColor: item.color,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                  }}
                ></div>
                <span className="text-xs text-gray-700">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="w-full h-96 rounded-lg overflow-hidden border border-gray-300">
        <MapContainer
          center={position}
          zoom={5}
          scrollWheelZoom={true}
          className="w-full h-full"
        >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly && <LocationMarker onLocationSelect={handleLocationSelect} />}
        {readOnly && !initialLocation && <IssueMarkers />}
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
    </div>
  );
};

export default Map;
