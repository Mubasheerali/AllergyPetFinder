import { Link, useLocation } from "wouter";
import { type UserSession } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Map, 
  MessageSquare, 
  Star, 
  UserCircle, 
  Settings, 
  Plus 
} from "lucide-react";

interface SidebarProps {
  user: UserSession | null;
}

export function Sidebar({ user }: SidebarProps) {
  const [location] = useLocation();
  
  return (
    <aside className="hidden md:block w-64 bg-white shadow-md">
      <nav className="p-4">
        <ul>
          <li className="mb-2">
            <Link href="/explore">
              <a className={`flex items-center p-3 rounded-lg ${
                location === '/explore' 
                  ? 'text-primary-dark bg-primary-light bg-opacity-20 font-medium' 
                  : 'hover:bg-gray-light transition-colors duration-150'
              }`}>
                <Map className="mr-3 h-5 w-5" />
                <span>Explore Places</span>
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/community">
              <a className={`flex items-center p-3 rounded-lg ${
                location === '/community' 
                  ? 'text-primary-dark bg-primary-light bg-opacity-20 font-medium' 
                  : 'hover:bg-gray-light transition-colors duration-150'
              }`}>
                <MessageSquare className="mr-3 h-5 w-5" />
                <span>Community</span>
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/favorites">
              <a className={`flex items-center p-3 rounded-lg ${
                location === '/favorites' 
                  ? 'text-primary-dark bg-primary-light bg-opacity-20 font-medium' 
                  : 'hover:bg-gray-light transition-colors duration-150'
              }`}>
                <Star className="mr-3 h-5 w-5" />
                <span>Favorites</span>
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/profile">
              <a className={`flex items-center p-3 rounded-lg ${
                location === '/profile' 
                  ? 'text-primary-dark bg-primary-light bg-opacity-20 font-medium' 
                  : 'hover:bg-gray-light transition-colors duration-150'
              }`}>
                <UserCircle className="mr-3 h-5 w-5" />
                <span>My Profile</span>
              </a>
            </Link>
          </li>
          <li className="mb-2">
            <Link href="/settings">
              <a className={`flex items-center p-3 rounded-lg ${
                location === '/settings' 
                  ? 'text-primary-dark bg-primary-light bg-opacity-20 font-medium' 
                  : 'hover:bg-gray-light transition-colors duration-150'
              }`}>
                <Settings className="mr-3 h-5 w-5" />
                <span>Settings</span>
              </a>
            </Link>
          </li>
        </ul>
        
        {user && (
          <div className="mt-8 border-t pt-4">
            <h3 className="font-semibold text-sm uppercase text-gray-500 mb-3">Your Allergies</h3>
            <div className="flex flex-wrap gap-2">
              {user.allergies.map((allergy, index) => (
                <Badge key={index} variant="outline" className="bg-red-50 text-red-600 border-red-300 px-3 py-1">
                  {allergy}
                </Badge>
              ))}
              <Button variant="outline" size="sm" className="flex items-center px-2 py-1 h-auto text-xs">
                <Plus className="h-3 w-3 mr-1" />
                Add
              </Button>
            </div>
          </div>
        )}
      </nav>
    </aside>
  );
}
