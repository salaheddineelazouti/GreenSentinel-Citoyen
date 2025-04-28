import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, ArrowLeft, Check, Crosshair } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { getOfflineMap } from '../../services/location/offlineMap';

// Custom location marker icon
const locationIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Custom selected location marker icon
const selectedIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  shadowSize: [41, 41]
});

// Map click handler component
function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click: (e) => {
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Current location locator component
function LocationMarker({ onLocationFound }) {
  const map = useMap();

  useEffect(() => {
    if (!onLocationFound) return;
    
    map.locate();
    
    const handleLocationFound = (e) => {
      onLocationFound(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    };

    map.on('locationfound', handleLocationFound);
    return () => {
      map.off('locationfound', handleLocationFound);
    };
  }, [map, onLocationFound]);

  return null;
}

// Recenter button component
function RecenterButton({ location, label }) {
  const map = useMap();
  
  const handleClick = () => {
    if (location) {
      map.flyTo([location.lat, location.lng], 15);
    }
  };
  
  return (
    <button 
      onClick={handleClick}
      disabled={!location}
      className={`flex items-center justify-center p-2 rounded-lg ${
        location ? 'bg-white shadow-md text-emerald-500' : 'bg-gray-200 text-gray-400'
      }`}
    >
      <Crosshair size={18} className="mr-1" />
      <span className="text-sm">{label}</span>
    </button>
  );
}

// Main LocationPicker component
const LocationPicker = ({ currentLocation, onLocationSelect, onBack }) => {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapReady, setMapReady] = useState(false);
  const [defaultCenter] = useState([31.7917, -7.0926]); // Default to Morocco
  const [zoom] = useState(6);
  const [offlineMode, setOfflineMode] = useState(false);
  const [offlineMapTiles, setOfflineMapTiles] = useState(null);

  // Load offline map tiles if available
  useEffect(() => {
    const loadOfflineMap = async () => {
      try {
        const offline = await getOfflineMap();
        if (offline.available) {
          setOfflineMapTiles(offline.tiles);
          setOfflineMode(true);
        }
      } catch (error) {
        console.error("Failed to load offline maps:", error);
      }
    };

    loadOfflineMap();
  }, []);

  const handleMapClick = (latlng) => {
    setSelectedLocation(latlng);
  };

  const handleLocationFound = (latlng) => {
    // Don't automatically set as selected, just center map
    setMapReady(true);
  };

  const handleSubmit = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    } else if (currentLocation) {
      onLocationSelect(currentLocation);
    } else {
      alert('Please select a location on the map');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 flex items-center justify-between bg-white">
        <button onClick={onBack} className="flex items-center text-gray-600">
          <ArrowLeft size={20} className="mr-1" />
          Back
        </button>
        <h2 className="text-xl font-bold">Select Location</h2>
        <div className="w-6"></div> {/* Empty div for flex alignment */}
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <MapContainer 
          center={currentLocation ? [currentLocation.lat, currentLocation.lng] : defaultCenter} 
          zoom={currentLocation ? 15 : zoom} 
          style={{ height: '100%', width: '100%' }}
        >
          {/* Use offline map tiles if available, otherwise use OpenStreetMap */}
          {offlineMode && offlineMapTiles ? (
            <TileLayer
              url={offlineMapTiles.url}
              attribution={offlineMapTiles.attribution}
            />
          ) : (
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
          )}

          {/* Map click handler */}
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Current location detector */}
          <LocationMarker onLocationFound={handleLocationFound} />
          
          {/* Show current location marker */}
          {currentLocation && (
            <Marker 
              position={[currentLocation.lat, currentLocation.lng]} 
              icon={locationIcon}
            />
          )}
          
          {/* Show selected location marker */}
          {selectedLocation && (
            <Marker 
              position={[selectedLocation.lat, selectedLocation.lng]} 
              icon={selectedIcon}
            />
          )}

          {/* Map Controls */}
          <div className="absolute top-4 right-4 z-[1000] space-y-2">
            <RecenterButton location={currentLocation} label="My Location" />
          </div>
        </MapContainer>

        {/* Offline mode indicator */}
        {offlineMode && (
          <div className="absolute top-4 left-4 z-[1000] bg-yellow-100 px-3 py-1 rounded-full text-xs text-yellow-800 font-medium border border-yellow-300">
            Offline Map
          </div>
        )}

        {/* Selected location info panel */}
        <div className="absolute bottom-20 left-0 right-0 px-4 z-[1000]">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center mb-3">
              <MapPin size={20} className="text-emerald-500 mr-2" />
              <h3 className="font-bold">Location</h3>
            </div>
            
            {selectedLocation ? (
              <div className="text-sm mb-3">
                <p className="text-gray-700">Selected coordinates:</p>
                <p className="font-mono text-gray-900">
                  {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-3">
                Tap anywhere on the map to select a precise location
              </p>
            )}
            
            <button
              onClick={handleSubmit}
              disabled={!selectedLocation && !currentLocation}
              className={`w-full py-3 rounded-xl flex items-center justify-center font-medium ${
                (selectedLocation || currentLocation)
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-gray-200 text-gray-500'
              }`}
            >
              <Check size={20} className="mr-2" />
              {selectedLocation 
                ? "Use Selected Location"
                : currentLocation 
                  ? "Use My Current Location" 
                  : "Select a Location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
