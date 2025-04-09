import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AppHeader } from '@/components/layout/AppHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { MobileNavigation } from '@/components/layout/MobileNavigation';
import { CommunityThreadCard } from '@/components/community/CommunityThreadCard';
import { Thread, Comment, User } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock user for demo, in a real app this would come from authentication
const DEMO_USER = {
  id: 1,
  username: 'emily',
  displayName: 'Emily',
  avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=120&h=120&q=80',
  allergies: ['Peanuts', 'Dairy', 'Pet Dander']
};

// Form schema for creating a new thread
const createThreadSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  content: z.string().min(10, "Content must be at least 10 characters").max(1000, "Content must be less than 1000 characters"),
});

// Form schema for creating a comment
const createCommentSchema = z.object({
  content: z.string().min(1, "Comment cannot be empty").max(500, "Comment must be less than 500 characters"),
});

export default function CommunityPage() {
  const [isNewThreadDialogOpen, setIsNewThreadDialogOpen] = useState(false);
  const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
  
  const { toast } = useToast();
  
  // Form for creating a new thread
  const threadForm = useForm<z.infer<typeof createThreadSchema>>({
    resolver: zodResolver(createThreadSchema),
    defaultValues: {
      title: '',
      content: '',
    },
  });
  
  // Form for commenting
  const commentForm = useForm<z.infer<typeof createCommentSchema>>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: '',
    },
  });
  
  // Fetch threads
  const { data: threads = [], isLoading: isLoadingThreads } = useQuery<Thread[]>({
    queryKey: ['/api/threads'],
  });
  
  // Fetch selected thread's comments when a thread is selected
  const { data: comments = [], isLoading: isLoadingComments } = useQuery<Comment[]>({
    queryKey: ['/api/threads', selectedThreadId, 'comments'],
    enabled: !!selectedThreadId,
  });
  
  // Prepare a map to cache user data
  const [userCache, setUserCache] = useState<Record<number, User>>({});
  
  // Function to get a user, either from cache or from API
  const getUserById = async (userId: number): Promise<User | undefined> => {
    if (userCache[userId]) {
      return userCache[userId];
    }
    
    try {
      const response = await fetch(`/api/users/${userId}`, {
        credentials: 'include',
      });
      
      if (!response.ok) return undefined;
      
      const user = await response.json();
      setUserCache(prev => ({ ...prev, [userId]: user }));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return undefined;
    }
  };
  
  // Handle creating a new thread
  const handleCreateThread = async (data: z.infer<typeof createThreadSchema>) => {
    try {
      await apiRequest("POST", "/api/threads", {
        ...data,
        userId: DEMO_USER.id,
      });
      
      // Close dialog and reset form
      setIsNewThreadDialogOpen(false);
      threadForm.reset();
      
      // Invalidate threads query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
      
      toast({
        title: "Success",
        description: "Your thread has been created!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create thread. Please try again.",
      });
    }
  };
  
  // Handle creating a comment
  const handleCreateComment = async (data: z.infer<typeof createCommentSchema>) => {
    if (!selectedThreadId) return;
    
    try {
      await apiRequest("POST", `/api/threads/${selectedThreadId}/comments`, {
        content: data.content,
        userId: DEMO_USER.id,
        threadId: selectedThreadId,
      });
      
      // Reset form
      commentForm.reset();
      
      // Invalidate comments query to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/threads', selectedThreadId, 'comments'] });
      
      toast({
        title: "Success",
        description: "Your comment has been added!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add comment. Please try again.",
      });
    }
  };
  
  // Handle liking a thread
  const handleLikeThread = async (threadId: number) => {
    try {
      await apiRequest("POST", `/api/threads/${threadId}/like`, {
        increment: true,
      });
      
      // Invalidate threads query to refresh the like count
      queryClient.invalidateQueries({ queryKey: ['/api/threads'] });
      
      toast({
        title: "Success",
        description: "You liked this thread!",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to like thread. Please try again.",
      });
    }
  };
  
  // Selected thread details
  const selectedThread = selectedThreadId ? threads.find(t => t.id === selectedThreadId) : null;
  
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppHeader user={DEMO_USER} />
      
      <main className="flex-grow flex flex-col md:flex-row">
        <Sidebar user={DEMO_USER} />
        
        <div className="flex-grow p-4 md:p-6 overflow-y-auto pb-16 md:pb-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Community Discussions</h1>
            <Button onClick={() => setIsNewThreadDialogOpen(true)}>
              New Thread
            </Button>
          </div>
          
          {isLoadingThreads ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <Card key={i} className="bg-white shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 animate-pulse"></div>
                      <div className="flex-grow">
                        <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3 mb-3 animate-pulse"></div>
                        <div className="flex justify-between">
                          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              {selectedThreadId ? (
                // Thread detail view
                <div>
                  <Button 
                    variant="ghost" 
                    onClick={() => setSelectedThreadId(null)} 
                    className="mb-4"
                  >
                    ← Back to all threads
                  </Button>
                  
                  {selectedThread && (
                    <Card className="mb-6">
                      <CardHeader>
                        <CardTitle>{selectedThread.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-gray-700 mb-4">{selectedThread.content}</p>
                        
                        <div className="flex justify-between items-center text-sm text-gray-500">
                          <span>Posted by {DEMO_USER.displayName}</span>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleLikeThread(selectedThread.id)}
                          >
                            Like ({selectedThread.likeCount})
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                  
                  <h2 className="text-xl font-semibold mb-4">Comments ({comments.length})</h2>
                  
                  {/* Comment form */}
                  <Card className="mb-6">
                    <CardContent className="pt-6">
                      <Form {...commentForm}>
                        <form onSubmit={commentForm.handleSubmit(handleCreateComment)} className="space-y-4">
                          <FormField
                            control={commentForm.control}
                            name="content"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Add a comment</FormLabel>
                                <FormControl>
                                  <Textarea 
                                    placeholder="Share your thoughts..." 
                                    {...field} 
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <Button type="submit" disabled={commentForm.formState.isSubmitting}>
                            Post Comment
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                  
                  {/* Comments list */}
                  {isLoadingComments ? (
                    <div className="space-y-4">
                      {[1, 2].map(i => (
                        <Card key={i}>
                          <CardContent className="p-4">
                            <div className="flex items-start">
                              <div className="w-8 h-8 rounded-full bg-gray-200 mr-3 animate-pulse"></div>
                              <div className="flex-grow">
                                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2 animate-pulse"></div>
                                <div className="h-3 bg-gray-200 rounded w-full mb-1 animate-pulse"></div>
                                <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {comments.length === 0 ? (
                        <p className="text-gray-500 text-center p-6">No comments yet. Be the first to comment!</p>
                      ) : (
                        comments.map(comment => (
                          <Card key={comment.id}>
                            <CardContent className="p-4">
                              <div className="flex items-start">
                                <img 
                                  src={DEMO_USER.avatarUrl} 
                                  alt="User avatar" 
                                  className="w-8 h-8 rounded-full mr-3" 
                                />
                                <div>
                                  <div className="flex items-baseline">
                                    <h4 className="font-medium text-sm">{DEMO_USER.displayName}</h4>
                                    <span className="ml-2 text-xs text-gray-500">
                                      {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 mt-1">{comment.content}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ) : (
                // Thread list view
                <div className="space-y-4">
                  {threads.length === 0 ? (
                    <div className="text-center p-12 bg-white rounded-lg shadow-sm">
                      <h2 className="text-xl font-medium mb-2">No threads yet</h2>
                      <p className="text-gray-500 mb-4">Be the first to start a discussion in the community!</p>
                      <Button onClick={() => setIsNewThreadDialogOpen(true)}>
                        Create New Thread
                      </Button>
                    </div>
                  ) : (
                    threads.map(thread => (
                      <CommunityThreadCard 
                        key={thread.id} 
                        thread={thread} 
                        onThreadClick={() => setSelectedThreadId(thread.id)} 
                      />
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      <MobileNavigation activePage="community" />
      
      {/* New Thread Dialog */}
      <Dialog open={isNewThreadDialogOpen} onOpenChange={setIsNewThreadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Thread</DialogTitle>
            <DialogDescription>
              Share your question or insight with the community.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...threadForm}>
            <form onSubmit={threadForm.handleSubmit(handleCreateThread)} className="space-y-4">
              <FormField
                control={threadForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter a title for your thread" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={threadForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Content</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe your topic or question..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsNewThreadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={threadForm.formState.isSubmitting}
                >
                  Create Thread
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
