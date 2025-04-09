import { Link, useLocation } from "wouter";
import { type PageRoute } from "@/lib/types";
import { Map, MessageSquare, Star, UserCircle } from "lucide-react";

interface MobileNavigationProps {
  activePage?: PageRoute;
}

export function MobileNavigation({ activePage = 'explore' }: MobileNavigationProps) {
  const [location] = useLocation();
  
  // Determine active page based on location if not explicitly set
  const currentPage = activePage || 
    (location === '/community' ? 'community' : 
     location === '/favorites' ? 'favorites' : 
     location === '/profile' ? 'profile' : 'explore');
  
  return (
    <nav className="md:hidden bg-white shadow-lg border-t fixed bottom-0 left-0 right-0 z-10">
      <div className="flex justify-around">
        <Link href="/explore">
          <a className={`flex flex-col items-center p-3 ${
            currentPage === 'explore' 
              ? 'text-primary border-t-2 border-primary' 
              : 'text-gray-500'
          }`}>
            <Map className="h-5 w-5" />
            <span className="text-xs mt-1">Explore</span>
          </a>
        </Link>
        <Link href="/community">
          <a className={`flex flex-col items-center p-3 ${
            currentPage === 'community' 
              ? 'text-primary border-t-2 border-primary' 
              : 'text-gray-500'
          }`}>
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Community</span>
          </a>
        </Link>
        <Link href="/favorites">
          <a className={`flex flex-col items-center p-3 ${
            currentPage === 'favorites' 
              ? 'text-primary border-t-2 border-primary' 
              : 'text-gray-500'
          }`}>
            <Star className="h-5 w-5" />
            <span className="text-xs mt-1">Favorites</span>
          </a>
        </Link>
        <Link href="/profile">
          <a className={`flex flex-col items-center p-3 ${
            currentPage === 'profile' 
              ? 'text-primary border-t-2 border-primary' 
              : 'text-gray-500'
          }`}>
            <UserCircle className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </a>
        </Link>
      </div>
    </nav>
  );
}
