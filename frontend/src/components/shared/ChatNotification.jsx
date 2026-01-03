import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Bell, Loader2, ArrowRight } from 'lucide-react';
import { selectNotifications, clearNotifications } from '@/redux/slices/chatNotificationSlice';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFetchMyChatsQuery } from '@/api/chatApi';
import { selectCurrentUser } from '@/redux/slices/userSlice';

const getOtherUser = (users, currentUser) => {
    return users?.find(u => u._id !== currentUser?._id);
};

const getInitials = (name = "") => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase() : '';
};

const ChatNotification = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const currentUser = useSelector(selectCurrentUser);

    const newNotifications = useSelector(selectNotifications);

    const { data: allChats, isLoading: isLoadingChats } = useFetchMyChatsQuery();
    
    const hasNewNotifications = newNotifications.length > 0;
    
    const displayItems = hasNewNotifications 
        ? newNotifications.slice(0, 4) 
        : (allChats || []).slice(0, 4);

    const handleNavigation = (chat) => {
        const otherUser = getOtherUser(chat.users, currentUser);
        if (otherUser) {
            navigate('/chat', { state: { userIdToChat: otherUser._id } });
        } else {
            navigate('/chat');
        }
    };
    
    const handleViewAll = () => {
        navigate('/chat');
    };

    return (
        <DropdownMenu onOpenChange={(isOpen) => { if (isOpen && hasNewNotifications) dispatch(clearNotifications()) }}>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <MessageSquare className="h-5 w-5" />
                    {hasNewNotifications && (
                        <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs rounded-full">
                            {newNotifications.length}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>{hasNewNotifications ? 'New Messages' : 'Recent Conversations'}</span>
                    {hasNewNotifications && <Badge variant="secondary">{newNotifications.length} New</Badge>}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {isLoadingChats ? (
                    <div className="flex justify-center p-6"><Loader2 className="h-6 w-6 animate-spin"/></div>
                ) : displayItems.length > 0 ? (
                    <>
                        {displayItems.map((item) => {
                            const chatData = hasNewNotifications ? item.chat : item;
                            const messageContent = hasNewNotifications ? item.content : item.latestMessage?.content;
                            const sender = hasNewNotifications ? item.sender : getOtherUser(item.users, currentUser);

                            if (!sender || !chatData) return null;

                            return (
                                <DropdownMenuItem key={chatData._id} className="cursor-pointer" onClick={() => handleNavigation(chatData)}>
                                    <div className="flex items-start gap-3 py-2">
                                        <Avatar className="h-9 w-9">
                                            <AvatarImage src={sender?.profile?.avatar} />
                                            <AvatarFallback>{getInitials(sender?.fullName)}</AvatarFallback>
                                        </Avatar>
                                        <div className="overflow-hidden">
                                            <p className="font-semibold truncate">{sender?.fullName}</p>
                                            <p className="text-sm text-muted-foreground truncate">{messageContent || 'No recent messages'}</p>
                                        </div>
                                    </div>
                                </DropdownMenuItem>
                            );
                        })}
                        <DropdownMenuSeparator />
                        {/* THE VIEW ALL BUTTON */}
                        <DropdownMenuItem asChild>
                            <Button variant="ghost" className="w-full justify-center gap-2" onClick={handleViewAll}>
                                View All Chats <ArrowRight className="h-4 w-4" />
                            </Button>
                        </DropdownMenuItem>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-muted-foreground">
                        <Bell className="h-8 w-8 mb-2" />
                        <p className="font-semibold">No conversations yet</p>
                        <p className="text-xs">Start a chat to see it here.</p>
                    </div>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default ChatNotification;