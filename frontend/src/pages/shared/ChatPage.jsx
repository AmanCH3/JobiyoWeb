import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAccessChatMutation, useFetchMyChatsQuery } from "@/api/chatApi";
import ChatList from "@/components/chat/ChatList";
import ChatBox from "@/components/chat/ChatBox";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { selectCurrentUser } from "@/redux/slices/userSlice";
import { useSelector } from "react-redux";
import { cn } from "@/lib/utils";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = useSelector(selectCurrentUser);

  const [accessChat, { isLoading: isAccessingChat }] = useAccessChatMutation();
  const {
    data: chats,
    isLoading: isLoadingChats,
    isError,
  } = useFetchMyChatsQuery(undefined, {
    pollingInterval: 15000,
    refetchOnMountOrArgChange: true,
  });

  useEffect(() => {
    const userIdToChat = location.state?.userIdToChat;
    if (userIdToChat) {
      handleAccessChat(userIdToChat);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, chats]);

  const handleAccessChat = async (userId) => {
    if (userId === currentUser?._id) return;

    const existingChat = chats?.find(
      (chat) =>
        chat.users.length === 2 && chat.users.some((u) => u._id === userId)
    );

    if (existingChat) {
      setSelectedChat(existingChat);
      return;
    }

    try {
      const newChat = await accessChat(userId).unwrap();
      setSelectedChat(newChat);
    } catch (error) {
      toast.error(error?.data?.message || "Could not start chat.");
    }
  };

  const isLoading = isLoadingChats || isAccessingChat;

  return (
    <div className="h-screen w-full flex items-center justify-center p-4 bg-muted/40">
      <div className="h-full w-full max-w-7xl flex rounded-2xl border bg-background shadow-2xl overflow-hidden">
        <div
          className={cn(
            "w-full md:w-[340px] lg:w-[400px] border-r flex flex-col bg-muted/20",
            selectedChat && "hidden md:flex" 
          )}
        >
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="p-4 text-center text-destructive">
              Failed to load conversations.
            </div>
          ) : (
            <ChatList
              selectedChat={selectedChat}
              onSelectChat={setSelectedChat}
              chats={chats}
            />
          )}
        </div>

        <div
          className={cn(
            "flex-grow",
            !selectedChat && "hidden md:flex" 
          )}
        >
          <ChatBox
            key={selectedChat?._id}
            selectedChat={selectedChat}
            onBack={() => setSelectedChat(null)} 
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;