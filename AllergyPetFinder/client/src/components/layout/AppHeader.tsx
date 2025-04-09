import { Link } from "wouter";
import { type UserSession } from "@/lib/types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, ChevronDown, LogOut, Cat, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AppHeaderProps {
  user: UserSession | null;
}

export function AppHeader({ user }: AppHeaderProps) {
  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center">
          <Link href="/">
            <a className="flex items-center">
              <Cat className="text-primary mr-2" />
              <h1 className="font-bold text-xl text-primary-dark">AllergySafe</h1>
            </a>
          </Link>
        </div>
        
        {user ? (
          <div className="flex items-center">
            <Button variant="ghost" size="icon" className="mr-3 rounded-full hidden md:flex">
              <Bell className="text-gray-500" />
            </Button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2">
                  <div className="flex items-center">
                    {user.avatarUrl ? (
                      <img 
                        src={user.avatarUrl} 
                        alt={`${user.displayName}'s avatar`} 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                        {user.displayName.charAt(0)}
                      </div>
                    )}
                    <span className="hidden md:block ml-2 font-medium">{user.displayName}</span>
                    <ChevronDown className="h-4 w-4 ml-1 hidden md:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
