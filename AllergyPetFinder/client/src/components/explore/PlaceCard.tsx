import { useState } from "react";
import { type Place } from "@shared/schema";
import { calculateDistance, formatDistance } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Heart, 
  MapPin, 
  ArrowRight, 
  Star, 
  Info, 
  Shield 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface PlaceCardProps {
  place: Place;
  isFavorite?: boolean;
  userLocation?: { lat: number; lng: number } | null;
  userId?: number;
  onViewDetails: (placeId: number) => void;
  onFavoriteToggle?: (placeId: number) => Promise<void>;
}

export function PlaceCard({ 
  place, 
  isFavorite = false,
  userLocation = null,
  userId,
  onViewDetails,
  onFavoriteToggle 
}: PlaceCardProps) {
  const [favorite, setFavorite] = useState<boolean>(isFavorite);
  const [isTogglingFavorite, setIsTogglingFavorite] = useState<boolean>(false);
  const { toast } = useToast();
  
  const distance = userLocation 
    ? calculateDistance(userLocation.lat, userLocation.lng, place.latitude, place.longitude)
    : null;
  
  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!userId) {
      toast({
        title: "Authentication required",
        description: "Please log in to save favorites",
        variant: "destructive"
      });
      return;
    }
    
    if (isTogglingFavorite) return;
    
    try {
      setIsTogglingFavorite(true);
      
      if (favorite) {
        await apiRequest("DELETE", "/api/favorites", {
          userId,
          placeId: place.id
        });
      } else {
        await apiRequest("POST", "/api/favorites", {
          userId,
          placeId: place.id
        });
      }
      
      setFavorite(!favorite);
      
      if (onFavoriteToggle) {
        await onFavoriteToggle(place.id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorites",
        variant: "destructive"
      });
    } finally {
      setIsTogglingFavorite(false);
    }
  };
  
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img 
          src={place.imageUrl || 'https://images.unsplash.com/photo-1541623089466-8e867014addb?crop=entropy&cs=tinysrgb&fit=crop&fm=jpg&h=300&ixid=MnwxfDB8MXxyYW5kb218MHx8cGV0LWZyaWVuZGx5fHx8fHx8MTcxODkzMzM0OA&ixlib=rb-4.0.3&q=80&w=500'} 
          alt={place.name} 
          className="w-full h-40 object-cover"
        />
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "absolute top-2 right-2 bg-white rounded-full p-1 shadow-sm",
            favorite && "text-accent"
          )}
          onClick={handleFavoriteToggle}
          disabled={isTogglingFavorite || !userId}
        >
          <Heart className={cn(favorite && "fill-current")} />
        </Button>
        <div className={cn(
          "absolute top-2 left-2 text-white text-xs px-2 py-1 rounded-full flex items-center",
          place.allergySafe ? "bg-primary" : "bg-amber-500"
        )}>
          {place.allergySafe ? (
            <>
              <Shield className="h-3 w-3 mr-1" />
              <span>Allergy-Safe</span>
            </>
          ) : (
            <>
              <Info className="h-3 w-3 mr-1" />
              <span>Some Concerns</span>
            </>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{place.name}</h3>
          {place.rating && (
            <div className="flex items-center bg-primary-light bg-opacity-20 text-primary-dark rounded px-2 py-1 text-sm">
              <Star className="h-4 w-4 mr-1" />
              <span>{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        
        <p className="text-gray-700 text-sm mb-2">{place.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-3">
          {place.allergyFeatures.map((feature, index) => (
            <Badge 
              key={index} 
              variant="outline" 
              className="bg-green-50 text-green-700 border-green-200"
            >
              {feature}
            </Badge>
          ))}
        </div>
        
        <div className="flex justify-between items-center text-sm">
          {distance !== null && (
            <span className="flex items-center text-gray-500">
              <MapPin className="h-3 w-3 mr-1" />
              <span>{formatDistance(distance)}</span>
            </span>
          )}
          <Button 
            variant="ghost" 
            className="text-blue-600 p-0 h-auto flex items-center hover:bg-transparent hover:underline"
            onClick={() => onViewDetails(place.id)}
          >
            <span>View Details</span>
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
