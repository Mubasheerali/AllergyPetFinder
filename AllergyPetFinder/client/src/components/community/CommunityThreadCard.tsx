import { Card, CardContent } from "@/components/ui/card";
import { Thread, User } from "@shared/schema";
import { formatTimeAgoString } from "@/lib/types";
import { MessageSquare, ThumbsUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface CommunityThreadCardProps {
  thread: Thread;
  onThreadClick: (threadId: number) => void;
}

export function CommunityThreadCard({ thread, onThreadClick }: CommunityThreadCardProps) {
  // Fetch the user who created the thread
  const { data: user } = useQuery<User>({
    queryKey: [`/api/users/${thread.userId}`],
  });
  
  const timeAgo = thread.createdAt ? formatTimeAgoString(new Date(thread.createdAt)) : "";
  
  return (
    <Card className="bg-white shadow-sm mb-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => onThreadClick(thread.id)}>
      <CardContent className="p-4">
        <div className="flex items-start">
          {user?.avatarUrl ? (
            <img 
              src={user.avatarUrl} 
              alt={`${user.displayName || user.username}'s avatar`} 
              className="w-10 h-10 rounded-full mr-3 object-cover" 
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center mr-3">
              {user?.username.charAt(0).toUpperCase() || "?"}
            </div>
          )}
          
          <div className="flex-grow">
            <h3 className="font-medium mb-1">{thread.title}</h3>
            <p className="text-sm text-gray-700 mb-3">{thread.content}</p>
            
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-500">
                <span>Posted by {user?.displayName || user?.username || "Unknown"} • {timeAgo}</span>
              </div>
              <div className="flex items-center">
                <span className="flex items-center mr-3">
                  <MessageSquare className="h-4 w-4 mr-1" />
                  <span>{thread.commentCount} comments</span>
                </span>
                <span className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-1" />
                  <span>{thread.likeCount}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
