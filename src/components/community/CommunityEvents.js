import React, { useState, useEffect } from 'react';
import { getUpcomingEvents, registerForEvent } from '../../services/api/eventService';

/**
 * CommunityEvents component for displaying and managing community environmental events
 */
const CommunityEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('upcoming');
  const [location, setLocation] = useState(null);

  // Load events on component mount and when filter changes
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get user's location if filter is 'nearby'
        if (filter === 'nearby' && !location) {
          await getCurrentLocation();
        }
        
        // Prepare options for the API request
        const options = {
          type: filter,
          limit: 10,
          page: 1
        };
        
        // Add location parameters if available
        if (location && filter === 'nearby') {
          options.latitude = location.latitude;
          options.longitude = location.longitude;
          options.radius = 50; // 50km radius
        }
        
        const response = await getUpcomingEvents(options);
        setEvents(response.events || []);
      } catch (err) {
        console.error('Error fetching events:', err);
        setError('Failed to load events. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchEvents();
  }, [filter, location]);

  // Get user's current location
  const getCurrentLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser');
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(userLocation);
          resolve(userLocation);
        },
        (err) => {
          console.error('Error getting location:', err);
          setError('Unable to retrieve your location. Please check your permissions.');
          reject(err);
        }
      );
    });
  };

  // Handle event registration
  const handleRegister = async (eventId) => {
    try {
      await registerForEvent(eventId);
      
      // Update the event in the list to show registered status
      setEvents(prevEvents => 
        prevEvents.map(event => 
          event.id === eventId 
            ? { ...event, isRegistered: true } 
            : event
        )
      );
      
      // Show success message (in a real app, use a toast or notification system)
      alert('Registration successful! You will receive updates about this event.');
    } catch (err) {
      console.error('Error registering for event:', err);
      alert('Failed to register for event. Please try again.');
    }
  };

  return (
    <div className="community-events-container">
      <h2 className="text-2xl font-bold text-green-700 mb-4">Community Events</h2>
      
      {/* Filter tabs */}
      <div className="filter-tabs mb-6">
        <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
          <button 
            className={`px-4 py-2 rounded-md ${filter === 'upcoming' ? 'bg-green-600 text-white' : 'bg-transparent text-gray-700'}`}
            onClick={() => setFilter('upcoming')}
          >
            Upcoming
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${filter === 'nearby' ? 'bg-green-600 text-white' : 'bg-transparent text-gray-700'}`}
            onClick={() => setFilter('nearby')}
          >
            Nearby
          </button>
          <button 
            className={`px-4 py-2 rounded-md ${filter === 'popular' ? 'bg-green-600 text-white' : 'bg-transparent text-gray-700'}`}
            onClick={() => setFilter('popular')}
          >
            Popular
          </button>
        </div>
      </div>
      
      {/* Loading and error states */}
      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}
      
      {/* Events list */}
      {!loading && !error && events.length === 0 && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No events found. Check back later!</p>
        </div>
      )}
      
      {!loading && !error && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(event => (
            <div key={event.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              {/* Event image */}
              <div className="h-40 bg-gray-300 relative">
                {event.imageUrl ? (
                  <img 
                    src={event.imageUrl} 
                    alt={event.title} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full bg-green-100">
                    <span className="text-green-700">No image available</span>
                  </div>
                )}
                
                {/* Event type badge */}
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                  {event.type}
                </div>
              </div>
              
              {/* Event details */}
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{event.title}</h3>
                
                <p className="text-sm text-gray-600 mb-2">
                  {new Date(event.date).toLocaleDateString()} at {event.time}
                </p>
                
                <p className="text-sm text-gray-600 mb-3">
                  <span className="font-semibold">Location:</span> {event.location}
                </p>
                
                <p className="text-sm text-gray-700 mb-4 line-clamp-3">
                  {event.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    {event.registeredCount} people registered
                  </span>
                  
                  {event.isRegistered ? (
                    <button 
                      className="bg-green-100 text-green-700 px-4 py-2 rounded-md font-medium text-sm"
                      disabled
                    >
                      Registered ✓
                    </button>
                  ) : (
                    <button 
                      className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-sm"
                      onClick={() => handleRegister(event.id)}
                    >
                      Register
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommunityEvents;
