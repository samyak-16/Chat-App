// ChatHeader.jsx
import { useEffect } from 'react';
import { Avatar } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getSocket } from '@/components/ui/lib/socket';
import { useChatStatus } from '@/store/useChatStatus';
import { 
  MoreVertical, 
  Users, 
  UserPlus, 
  UserMinus, 
  Shield, 
  ShieldOff, 
  LogOut,
  Archive,
  Settings,
  Crown
} from 'lucide-react';
import { 
  leaveGroupChat, 
  addUsersToGroup, 
  removeUsersFromGroup, 
  promoteUsersToAdmin, 
  demoteUsersFromAdmin,
  archiveOrUnarchiveChats
} from '@/api/chat.api';

const ChatHeader = ({ chat, authUserId }) => {
  const { activeStatuses } = useChatStatus(); // Use global Zustand store instead of local state
  const socket = getSocket();

  const isGroup = chat.isGroup;
  const isAdmin = chat.admins?.includes(authUserId);
  const isCreator = chat.createdBy === authUserId;

  // Determine chat display name
  const chatName = isGroup
    ? chat.name
    : chat.participants.find((p) => p.userId !== authUserId)?.nickname ||
      'Unknown';

  // No need for local state management - using global Zustand store
  // The useChatStatus store automatically handles all status updates via socket

  // Helper to display colored dot for status
  const StatusDot = ({ status }) => (
    <span
      className={`inline-block w-2 h-2 rounded-full mr-2 ${
        status === 'online' ? 'bg-emerald-500' : 'bg-slate-400'
      }`}
    />
  );

  // Helper to get user role badge
  const UserRoleBadge = ({ userId }) => {
    if (userId === chat.createdBy) {
      return <Crown className="w-3 h-3 text-amber-500" />;
    }
    if (chat.admins?.includes(userId)) {
      return <Shield className="w-3 h-3 text-blue-500" />;
    }
    return null;
  };

  const handleLeaveChat = async () => {
    try {
      if (isGroup) {
        await leaveGroupChat(chat._id);
        // TODO: Handle navigation or state update after leaving
        console.log('Successfully left group chat');
      } else {
        // For private chats, you might want to archive or delete
        await archiveOrUnarchiveChats([chat._id]);
        console.log('Successfully archived private chat');
      }
    } catch (error) {
      console.error('Error leaving chat:', error);
      // TODO: Show error notification
    }
  };

  const handleArchiveChat = async () => {
    try {
      await archiveOrUnarchiveChats([chat._id]);
      console.log('Successfully archived chat');
    } catch (error) {
      console.error('Error archiving chat:', error);
      // TODO: Show error notification
    }
  };

  const handleAddUsers = async () => {
    // TODO: Open modal to select users to add
    // For now, just show a placeholder
    console.log('Add users modal should open');
  };

  const handleRemoveUsers = async () => {
    // TODO: Open modal to select users to remove
    // For now, just show a placeholder
    console.log('Remove users modal should open');
  };

  const handlePromoteUsers = async () => {
    // TODO: Open modal to select users to promote
    // For now, just show a placeholder
    console.log('Promote users modal should open');
  };

  const handleDemoteUsers = async () => {
    // TODO: Open modal to select users to demote
    // For now, just show a placeholder
    console.log('Demote users modal should open');
  };

  // Get other user's status for private chats
  const getOtherUserStatus = () => {
    if (isGroup) return 'offline';
    const otherUser = chat.participants.find((p) => p.userId !== authUserId);
    return otherUser ? activeStatuses[otherUser.userId] || 'offline' : 'offline';
  };

  // Get online count for group chats
  const getGroupOnlineCount = () => {
    if (!isGroup) return 0;
    return chat.participants.filter(p => activeStatuses[p.userId] === 'online').length;
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white shadow-sm">
      {/* Left: Chat name & status */}
      <div className="flex items-center space-x-4">
        <Avatar className="w-12 h-12 ring-2 ring-white shadow-sm">
          <img
            src={
              isGroup
                ? '' // optional group avatar or leave blank
                : chat.participants.find((p) => p.userId !== authUserId)?.avatar
            }
            alt={chatName}
          />
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center space-x-2">
            <h2 className="font-bold text-slate-800 text-lg">{chatName}</h2>
            {isGroup && isCreator && (
              <Crown className="w-4 h-4 text-amber-500" />
            )}
            {isGroup && isAdmin && !isCreator && (
              <Shield className="w-4 h-4 text-blue-500" />
            )}
          </div>
          {!isGroup && (
            <span className="text-sm text-slate-500 flex items-center">
              <StatusDot status={getOtherUserStatus()} />
              {getOtherUserStatus() === 'online' ? 'Online' : 'Offline'}
            </span>
          )}
          {isGroup && (
            <span className="text-sm text-slate-500 flex items-center">
              <Users className="w-4 h-4 mr-1" />
              {chat.participants.length} members
              {getGroupOnlineCount() > 0 && (
                <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                  {getGroupOnlineCount()} online
                </span>
              )}
              {isAdmin && (
                <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                  Admin
                </span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Right: Dropdown menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <MoreVertical className="h-5 w-5 text-slate-600" />
          </button>
        </DropdownMenuTrigger>
                 <DropdownMenuContent className="w-80 p-3 max-h-96 overflow-hidden" align="end">
           {/* Participants list */}
           <div className="mb-3">
             <h3 className="text-sm font-semibold text-gray-700 mb-2">Participants ({chat.participants.length})</h3>
             <ScrollArea className="max-h-40">
               <div className="space-y-1">
                 {chat.participants.map((p) => (
                   <div
                     key={p.userId}
                     className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-50 rounded-lg"
                   >
                     <div className="flex items-center space-x-2">
                       <Avatar src={p.avatar} alt={p.nickname} className="w-6 h-6" />
                       <span className="text-sm font-medium">{p.nickname}</span>
                       <UserRoleBadge userId={p.userId} />
                     </div>
                                           <StatusDot status={activeStatuses[p.userId] || 'offline'} />
                   </div>
                 ))}
               </div>
             </ScrollArea>
           </div>

           <DropdownMenuSeparator />

           {/* Action buttons */}
           <div className="space-y-1">
             {/* Archive chat */}
             <DropdownMenuItem
               className="cursor-pointer hover:bg-gray-50 text-gray-700"
               onClick={handleArchiveChat}
             >
               <Archive className="w-4 h-4 mr-2" />
               Archive Chat
             </DropdownMenuItem>

                         {/* Group-specific actions */}
             {isGroup && (
               <>
                 {isAdmin && (
                   <>
                     <DropdownMenuItem
                       className="cursor-pointer hover:bg-blue-50 text-blue-700"
                       onClick={handleAddUsers}
                     >
                       <UserPlus className="w-4 h-4 mr-2" />
                       Add Members
                     </DropdownMenuItem>
                     <DropdownMenuItem
                       className="cursor-pointer hover:bg-orange-50 text-orange-700"
                       onClick={handleRemoveUsers}
                     >
                       <UserMinus className="w-4 h-4 mr-2" />
                       Remove Members
                     </DropdownMenuItem>
                   </>
                 )}

                 {/* Creator-only actions */}
                 {isCreator && (
                   <>
                     <DropdownMenuItem
                       className="cursor-pointer hover:bg-green-50 text-green-700"
                       onClick={handlePromoteUsers}
                     >
                       <Shield className="w-4 h-4 mr-2" />
                       Promote to Admin
                     </DropdownMenuItem>
                     <DropdownMenuItem
                       className="cursor-pointer hover:bg-yellow-50 text-yellow-700"
                       onClick={handleDemoteUsers}
                     >
                       <ShieldOff className="w-4 h-4 mr-2" />
                       Demote Admin
                     </DropdownMenuItem>
                   </>
                 )}
               </>
             )}

             {/* Settings */}
             <DropdownMenuItem
               className="cursor-pointer hover:bg-gray-50 text-gray-700"
             >
               <Settings className="w-4 h-4 mr-2" />
               Chat Settings
             </DropdownMenuItem>

             {/* Leave chat */}
             <DropdownMenuItem
               className="cursor-pointer hover:bg-red-50 text-red-600"
               onClick={handleLeaveChat}
             >
               <LogOut className="w-4 h-4 mr-2" />
               {isGroup ? 'Leave Group' : 'Delete Chat'}
             </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default ChatHeader;
