import { useState } from "react";
import { useSelector } from "react-redux";
import { Input } from "../ui/input";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import { Search, MessageSquareText } from "lucide-react";

const getOtherUser = (users, currentUser) => {
  return users?.find((u) => u._id !== currentUser?._id);
};

const ChatList = ({ selectedChat, onSelectChat, chats }) => {
  const currentUser = useSelector(selectCurrentUser);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredChats =
    chats
      ?.filter((chat) => {
        const otherUser = getOtherUser(chat.users, currentUser);
        return otherUser?.fullName
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      })
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)) || [];

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <h1 className="font-philosopher text-3xl font-bold tracking-tight mb-4">
          Messages
        </h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search conversations..."
            className="pl-10 h-12 bg-muted/60 rounded-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-grow overflow-y-auto">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => {
            const otherUser = getOtherUser(chat.users, currentUser);
            if (!otherUser) return null;

            return (
              <div
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={cn(
                  "flex items-center gap-4 p-3 m-2 rounded-xl cursor-pointer hover:bg-muted/80 transition-colors",
                  selectedChat?._id === chat._id && "bg-primary/10 text-primary-foreground"
                )}
              >
                <img
                  src={otherUser.profile?.avatar || "/placeholder.gif"}
                  alt={otherUser.fullName}
                  className="h-14 w-14 rounded-full object-cover"
                />
                <div className="flex-grow overflow-hidden">
                  <div className="flex justify-between items-center">
                    <p className="text-base font-semibold truncate">
                      {otherUser.fullName}
                    </p>
                    {chat.latestMessage && (
                      <p className="text-xs text-muted-foreground flex-shrink-0 ml-2">
                        {formatDistanceToNow(
                          new Date(chat.latestMessage.createdAt),
                          { addSuffix: true }
                        )}
                      </p>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {chat.latestMessage?.sender?._id === currentUser._id &&
                      "You: "}
                    {chat.latestMessage
                      ? chat.latestMessage.content
                      : "No messages yet."}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquareText className="h-16 w-16 mb-4" />
            <p className="text-lg font-medium">No Conversations</p>
            <p className="text-sm text-center">
              Start a new chat to see it here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatList;