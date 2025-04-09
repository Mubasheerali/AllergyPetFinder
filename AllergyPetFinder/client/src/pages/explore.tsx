import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { SearchAndFilter } from '@/components/explore/SearchAndFilter';
import { PlaceCard } from '@/components/explore/PlaceCard';
import { MapView } from '@/components/explore/MapView';
import { type MapViewport, type SearchFilters } from '@/lib/types';
import { Place } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Map, ListFilter } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Mock user for demo, in a real app this would come from authentication
const DEMO_USER = {
  id: 1,
  username: 'emily',
  displayName: 'Emily',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80',
  allergies: ['Peanuts', 'Dairy', 'Pet Dander']
};

export default function ExplorePage() {
  // State for UI
  const [viewType, setViewType] = useState<'map' | 'list'>('map');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [searchFilters, setSearchFilters] = useState<SearchFilters>({
    query: '',
    allergyFilters: ['Peanut-Free']
  });
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const [viewport, setViewport] = useState<MapViewport>({
    center: { lat: 37.7749, lng: -122.4194 }, // Default to San Francisco
    zoom: 13
  });
  const [sortOption, setSortOption] = useState<string>('rating');
  
  const { toast } = useToast();

  // Fetch places data
  const { data: places = [] } = useQuery<Place[]>({
    queryKey: ['/api/places'],
  });

  // Fetch user favorites if we had authentication
  const { data: favoriteIds = [] } = useQuery<number[]>({
    queryKey: [`/api/users/${DEMO_USER.id}/favorites`],
    select: (data: Place[]) => data.map(place => place.id)
  });

  // Get user location on component mount or when "Near Me" is clicked
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setViewport({
          center: { lat: latitude, lng: longitude },
          zoom: 14
        });
        toast({
          title: "Location Updated",
          description: "Showing places near your current location.",
        });
      },
      (error) => {
        console.error("Error getting location:", error);
        toast({
          variant: "destructive",
          title: "Location Error",
          description: error.message || "Unable to get your location.",
        });
      }
    );
  };

  // Set user location on initial load if available
  useEffect(() => {
    getUserLocation();
  }, []);

  // Handle search and filter changes
  const handleSearch = (filters: SearchFilters) => {
    setSearchFilters(filters);
  };

  // Handle place selection
  const handlePlaceSelect = (placeId: number) => {
    setSelectedPlaceId(placeId);
  };

  // Filter and sort places based on search criteria
  const filteredPlaces = places
    .filter(place => {
      // Filter by search query
      if (searchFilters.query && !place.name.toLowerCase().includes(searchFilters.query.toLowerCase()) && 
          !place.description.toLowerCase().includes(searchFilters.query.toLowerCase())) {
        return false;
      }
      
      // Filter by allergy features
      if (searchFilters.allergyFilters.length > 0) {
        // Check if any of the selected filters match the place's features
        const hasMatchingFeature = searchFilters.allergyFilters.some(filter => 
          place.allergyFeatures.includes(filter)
        );
        if (!hasMatchingFeature) return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      // Sort by selected option
      if (sortOption === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      } else if (sortOption === 'distance' && userLocation) {
        // Basic distance calculation
        const distA = Math.pow(a.latitude - userLocation.lat, 2) + Math.pow(a.longitude - userLocation.lng, 2);
        const distB = Math.pow(b.latitude - userLocation.lat, 2) + Math.pow(b.longitude - userLocation.lng, 2);
        return distA - distB;
      }
      return 0;
    });

  // Find selected place for dialog
  const selectedPlace = selectedPlaceId ? places.find(p => p.id === selectedPlaceId) : null;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader user={DEMO_USER} />
      
      <main className="flex-grow flex flex-col md:flex-row">
        <Sidebar user={DEMO_USER} />
        
        <div className="flex-grow p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
          <SearchAndFilter 
            onSearch={handleSearch} 
            onUseMyLocation={getUserLocation} 
          />
          
          {/* Map & List toggle view */}
          <div className="flex items-center mb-4">
            <div className="bg-white rounded-lg shadow-sm inline-flex">
              <Button
                variant={viewType === 'map' ? 'default' : 'ghost'}
                className={viewType === 'map' ? 'rounded-r-none' : 'rounded-r-none'}
                onClick={() => setViewType('map')}
              >
                <Map className="mr-1 h-4 w-4" />
                Map
              </Button>
              <Button
                variant={viewType === 'list' ? 'default' : 'ghost'}
                className={viewType === 'list' ? 'rounded-l-none' : 'rounded-l-none'}
                onClick={() => setViewType('list')}
              >
                <ListFilter className="mr-1 h-4 w-4" />
                List
              </Button>
            </div>
            
            <div className="ml-auto">
              <Select
                value={sortOption}
                onValueChange={setSortOption}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                  <SelectItem value="distance">Distance</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Map View */}
          {viewType === 'map' && (
            <MapView
              places={filteredPlaces}
              viewport={viewport}
              userLocation={userLocation}
              onMarkerClick={handlePlaceSelect}
            />
          )}
          
          {/* Results list */}
          <h2 className="font-semibold text-xl mb-4">Pet-Friendly Places Near You</h2>
          
          {filteredPlaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {filteredPlaces.map(place => (
                <PlaceCard
                  key={place.id}
                  place={place}
                  isFavorite={favoriteIds.includes(place.id)}
                  userLocation={userLocation}
                  userId={DEMO_USER.id}
                  onViewDetails={handlePlaceSelect}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg p-8 text-center shadow-sm">
              <h3 className="text-lg font-medium mb-2">No places found</h3>
              <p className="text-gray-500 mb-4">
                Try adjusting your search filters or exploring a different area.
              </p>
              <Button onClick={() => setSearchFilters({ query: '', allergyFilters: [] })}>
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <MobileNavigation activePage="explore" />
      
      {/* Place Detail Dialog */}
      <Dialog open={!!selectedPlaceId} onOpenChange={(open) => !open && setSelectedPlaceId(null)}>
        {selectedPlace && (
          <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{selectedPlace.name}</DialogTitle>
              <DialogDescription>
                {selectedPlace.address}
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-2">
              <img 
                src={selectedPlace.imageUrl || 'https://images.unsplash.com/photo-1541623089466-8e867014addb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8cGV0LWZyaWVuZGx5fHx8fHx8MTcxODkzMzM0OA&ixlib=rb-4.0.3&q=80&w=500'} 
                alt={selectedPlace.name}
                className="w-full h-48 object-cover rounded-md"
              />
              
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="font-medium">Description</h3>
                  <p className="text-gray-700 mt-1">{selectedPlace.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium">Allergy Features</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedPlace.allergyFeatures.map((feature, index) => (
                      <span 
                        key={index}
                        className="bg-green-50 text-green-700 px-2 py-1 rounded-full text-xs"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium">Safety Status</h3>
                  <div className={`flex items-center mt-2 ${
                    selectedPlace.allergySafe 
                      ? "text-green-700" 
                      : "text-amber-600"
                  }`}>
                    {selectedPlace.allergySafe ? (
                      <>
                        <div className="w-3 h-3 rounded-full bg-green-600 mr-2"></div>
                        <span>Verified Allergy-Safe</span>
                      </>
                    ) : (
                      <>
                        <div className="w-3 h-3 rounded-full bg-amber-500 mr-2"></div>
                        <span>Some Allergy Concerns</span>
                      </>
                    )}
                  </div>
                </div>
                
                {selectedPlace.rating && (
                  <div>
                    <h3 className="font-medium">Rating</h3>
                    <div className="flex items-center mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <svg 
                            key={i}
                            className={`w-5 h-5 ${
                              i < Math.floor(selectedPlace.rating || 0) 
                                ? "text-amber-400 fill-current" 
                                : "text-gray-300 fill-current"
                            }`}
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                          </svg>
                        ))}
                      </div>
                      <span className="ml-2 text-gray-600">{selectedPlace.rating.toFixed(1)}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
