import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { PlaceCard } from '@/components/explore/PlaceCard';
import { Place } from '@shared/schema';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

// Mock user for demo, in a real app this would come from authentication
const DEMO_USER = {
  id: 1,
  username: 'emily',
  displayName: 'Emily',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80',
  allergies: ['Peanuts', 'Dairy', 'Pet Dander']
};

export default function FavoritesPage() {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedPlaceId, setSelectedPlaceId] = useState<number | null>(null);
  const { toast } = useToast();
  
  // Fetch user favorites
  const { data: favoritePlaces = [], isLoading } = useQuery<Place[]>({
    queryKey: [`/api/users/${DEMO_USER.id}/favorites`],
  });
  
  // Get user location
  const getUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
      },
      (error) => {
        console.error("Error getting location:", error);
      }
    );
  };
  
  // Get location on component mount
  useState(() => {
    getUserLocation();
  });
  
  // Handle removing a place from favorites
  const handleRemoveFromFavorites = async (placeId: number) => {
    try {
      await apiRequest("DELETE", "/api/favorites", {
        userId: DEMO_USER.id,
        placeId
      });
      
      // Invalidate favorites query to refresh the list
      queryClient.invalidateQueries({ queryKey: [`/api/users/${DEMO_USER.id}/favorites`] });
      
      toast({
        title: "Success",
        description: "Place removed from favorites",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove from favorites",
      });
    }
  };
  
  // Handle place selection for details view
  const handlePlaceSelect = (placeId: number) => {
    setSelectedPlaceId(placeId);
  };
  
  // Selected place for dialog
  const selectedPlace = selectedPlaceId 
    ? favoritePlaces.find(p => p.id === selectedPlaceId) 
    : null;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader user={DEMO_USER} />
      
      <main className="flex-grow flex flex-col md:flex-row">
        <Sidebar user={DEMO_USER} />
        
        <div className="flex-grow p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
          <h1 className="text-2xl font-bold mb-6">Your Favorite Places</h1>
          
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-lg shadow-sm overflow-hidden h-72 animate-pulse">
                  <div className="w-full h-40 bg-gray-200"></div>
                  <div className="p-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {favoritePlaces.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center shadow-sm">
                  <h2 className="text-xl font-medium mb-2">No favorites yet</h2>
                  <p className="text-gray-500 mb-4">
                    You haven't added any places to your favorites yet. Explore pet-friendly places and add them to your favorites!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoritePlaces.map(place => (
                    <PlaceCard
                      key={place.id}
                      place={place}
                      isFavorite={true}
                      userLocation={userLocation}
                      userId={DEMO_USER.id}
                      onViewDetails={handlePlaceSelect}
                      onFavoriteToggle={async () => {
                        await handleRemoveFromFavorites(place.id);
                      }}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <MobileNavigation activePage="favorites" />
      
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
