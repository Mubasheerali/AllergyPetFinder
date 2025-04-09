// Additional client-side types
export interface UserSession {
  id: number;
  username: string;
  displayName: string;
  avatarUrl?: string;
  allergies: string[];
}

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface MapViewport {
  center: Coordinates;
  zoom: number;
}

export type MapMarker = {
  id: number;
  position: Coordinates;
  allergySafe: boolean;
  name: string;
};

export interface SearchFilters {
  query: string;
  allergyFilters: string[];
}

export type PageRoute = 'explore' | 'community' | 'favorites' | 'profile';

export interface TimeAgo {
  value: number;
  unit: 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';
}

export const formatTimeAgo = (date: Date): TimeAgo => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    if (days > 30) {
      const months = Math.floor(days / 30);
      if (months > 12) {
        const years = Math.floor(months / 12);
        return { value: years, unit: 'year' };
      }
      return { value: months, unit: 'month' };
    }
    if (days > 7) {
      const weeks = Math.floor(days / 7);
      return { value: weeks, unit: 'week' };
    }
    return { value: days, unit: 'day' };
  }
  
  if (hours > 0) {
    return { value: hours, unit: 'hour' };
  }
  
  if (minutes > 0) {
    return { value: minutes, unit: 'minute' };
  }
  
  return { value: seconds, unit: 'second' };
};

export const formatTimeAgoString = (date: Date): string => {
  const { value, unit } = formatTimeAgo(date);
  return `${value} ${unit}${value !== 1 ? 's' : ''} ago`;
};

export const calculateDistance = (
  lat1: number, 
  lon1: number, 
  lat2: number, 
  lon2: number
): number => {
  // Simple implementation for distance calculation
  // Using Haversine formula to calculate distance between two points
  const R = 6371; // Radius of the Earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km
  
  return distance;
};

const deg2rad = (deg: number): number => {
  return deg * (Math.PI / 180);
};

export const formatDistance = (distance: number): string => {
  if (distance < 1) {
    // Convert to yards/feet for US or meters for metric
    const feet = Math.round(distance * 3280.84);
    if (feet < 1000) {
      return `${feet} ft`;
    }
    return `${(distance).toFixed(1)} mi`;
  }
  
  return `${distance.toFixed(1)} mi`;
};
