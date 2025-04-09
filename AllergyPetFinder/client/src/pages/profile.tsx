import { useState } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Bell, 
  Edit, 
  Heart, 
  LogOut, 
  MessageSquare, 
  Plus, 
  Settings, 
  Trash 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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

// Form schema for adding allergies
const allergyFormSchema = z.object({
  allergy: z.string().min(2, "Allergy name must be at least 2 characters")
});

export default function ProfilePage() {
  const [isAddAllergyDialogOpen, setIsAddAllergyDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Form for adding allergy
  const allergyForm = useForm<z.infer<typeof allergyFormSchema>>({
    resolver: zodResolver(allergyFormSchema),
    defaultValues: {
      allergy: '',
    },
  });
  
  // Mock stats for the profile
  const stats = {
    favoritePlaces: 4,
    threads: 3,
    comments: 12
  };
  
  // Handle adding a new allergy
  const handleAddAllergy = async (data: z.infer<typeof allergyFormSchema>) => {
    try {
      // In a real app, this would update the user's allergies in the database
      // For demo purposes, we'll just show a success message
      
      setIsAddAllergyDialogOpen(false);
      allergyForm.reset();
      
      toast({
        title: "Allergy Added",
        description: `${data.allergy} has been added to your allergies.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add allergy. Please try again.",
      });
    }
  };
  
  // Handle removing an allergy
  const handleRemoveAllergy = (allergy: string) => {
    toast({
      title: "Allergy Removed",
      description: `${allergy} has been removed from your allergies.`,
    });
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader user={DEMO_USER} />
      
      <main className="flex-grow flex flex-col md:flex-row">
        <Sidebar user={DEMO_USER} />
        
        <div className="flex-grow p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
          <div className="max-w-4xl mx-auto">
            {/* Profile header */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row items-center">
                  <Avatar className="h-24 w-24 mb-4 md:mb-0 md:mr-6">
                    <AvatarImage src={DEMO_USER.avatarUrl} alt={DEMO_USER.displayName} />
                    <AvatarFallback>{DEMO_USER.displayName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  
                  <div className="text-center md:text-left flex-grow">
                    <h1 className="text-2xl font-bold mb-1">{DEMO_USER.displayName}</h1>
                    <p className="text-gray-500 mb-3">@{DEMO_USER.username}</p>
                    
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Edit className="h-4 w-4" />
                        Edit Profile
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Heart className="h-8 w-8 text-primary mb-2" />
                  <span className="text-2xl font-bold">{stats.favoritePlaces}</span>
                  <span className="text-gray-500">Favorite Places</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <MessageSquare className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-2xl font-bold">{stats.threads}</span>
                  <span className="text-gray-500">Threads Created</span>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="p-4 flex flex-col items-center justify-center">
                  <Bell className="h-8 w-8 text-amber-500 mb-2" />
                  <span className="text-2xl font-bold">{stats.comments}</span>
                  <span className="text-gray-500">Comments Made</span>
                </CardContent>
              </Card>
            </div>
            
            {/* Allergies section */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>Your Allergies</span>
                  <Button
                    size="sm"
                    onClick={() => setIsAddAllergyDialogOpen(true)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-4 w-4" />
                    Add Allergy
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {DEMO_USER.allergies.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    You haven't added any allergies yet.
                  </p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {DEMO_USER.allergies.map((allergy, index) => (
                      <Badge 
                        key={index} 
                        variant="outline" 
                        className="bg-red-50 text-red-600 border-red-300 px-3 py-1 flex items-center gap-1"
                      >
                        {allergy}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 ml-1 hover:bg-red-100 rounded-full p-0"
                          onClick={() => handleRemoveAllergy(allergy)}
                        >
                          <Trash className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Account settings */}
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Email Notifications</div>
                  <div className="flex items-center mt-2">
                    <input 
                      type="checkbox" 
                      id="email-new-threads" 
                      className="mr-2" 
                      defaultChecked 
                    />
                    <label htmlFor="email-new-threads" className="text-sm">
                      Notify me about new threads in my followed topics
                    </label>
                  </div>
                  <div className="flex items-center mt-2">
                    <input 
                      type="checkbox" 
                      id="email-comments" 
                      className="mr-2" 
                      defaultChecked 
                    />
                    <label htmlFor="email-comments" className="text-sm">
                      Notify me about replies to my comments
                    </label>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <Button variant="outline" className="flex items-center gap-2 text-destructive border-destructive/30">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <MobileNavigation activePage="profile" />
      
      {/* Add Allergy Dialog */}
      <Dialog open={isAddAllergyDialogOpen} onOpenChange={setIsAddAllergyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Allergy</DialogTitle>
            <DialogDescription>
              Add an allergy to your profile to help find suitable pet-friendly places.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...allergyForm}>
            <form onSubmit={allergyForm.handleSubmit(handleAddAllergy)} className="space-y-4">
              <FormField
                control={allergyForm.control}
                name="allergy"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Allergy Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Peanuts, Gluten, Cat Dander" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsAddAllergyDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={allergyForm.formState.isSubmitting}
                >
                  Add Allergy
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
