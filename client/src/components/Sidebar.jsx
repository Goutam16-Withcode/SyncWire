import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { formatChatListTime } from '../lib/utils';
import CreateGroupModal from './CreateGroupModal';
import ThemeModal from './ThemeModal';
import CreateStatusModal from './CreateStatusModal';
import StatusViewerModal from './StatusViewerModal';
import AIAssistantModal from './AIAssistantModal';
import SecretVaultModal from './SecretVaultModal';
import { 
    Check, 
    CheckCheck, 
    Image as ImageIcon, 
    Mic, 
    User as UserIcon, 
    LogOut,
    X,
    Users,
    Plus,
    Palette,
    Bot,
    Sparkles,
    CircleDashed,
    Lock,
    Unlock
} from 'lucide-react';

const Sidebar = () => {
    const { 
        getUsers, 
        getGroups,
        getStories,
        users, 
        groups,
        storiesByUser,
        selectedUser, 
        setSelectedUser, 
        selectedGroup,
        setSelectedGroup,
        unseenMessages, 
        setUnseenMessages,
        lastMessages,
        typingUsers,
        nicknames,
        activeTheme,
        isVaultUnlocked,
        unlockVault,
        lockVault,
        setVaultPin,
        vaultPin,
        hiddenChatIds
    } = useContext(ChatContext);


    const { authUser, logout, onlineUsers } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread' | 'groups' | 'status'
    const [showMenu, setShowMenu] = useState(false);
    
    // Modal controls
    const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);
    const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
    const [isCreateStatusOpen, setIsCreateStatusOpen] = useState(false);
    const [viewingStoryGroup, setViewingStoryGroup] = useState(null);
    const [isAIOpen, setIsAIOpen] = useState(false);
    const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        getUsers();
        getGroups();
        getStories();
    }, [onlineUsers]);

    // Filter users by search, unread, and vault privacy
    const filteredUsers = users.filter((user) => {
        if (!isVaultUnlocked && hiddenChatIds.includes(user._id)) return false;
        const displayName = nicknames[user._id] || user.fullName;
        const matchesSearch = displayName.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'unread') {
            return matchesSearch && (unseenMessages[user._id] > 0);
        }
        return matchesSearch;
    });

    const filteredGroups = groups.filter((grp) => {
        if (!isVaultUnlocked && hiddenChatIds.includes(grp._id)) return false;
        return grp.name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const totalUnread = Object.values(unseenMessages).reduce((acc, curr) => acc + (curr || 0), 0);

    return (
        <div className={`h-full flex flex-col text-white select-none overflow-hidden transition-colors duration-300 ${activeTheme.sidebarBgClass || 'bg-[#8185B2]/10 border-r border-gray-700/40'} ${selectedUser || selectedGroup ? 'max-md:hidden' : 'w-full'}`}>
            
            {/* Top Bar with Logo, Theme, and Menu */}
            <div className={`p-4 pb-2 border-b transition-colors duration-300 ${activeTheme.sidebarHeaderClass || 'border-gray-700/30'}`}>
                <div className="flex justify-between items-center">
                    <div 
                        onClick={() => { setSelectedUser(null); setSelectedGroup(null); }} 
                        className="flex items-center gap-2 cursor-pointer group"
                    >
                        <img 
                            src={assets.logo_icon} 
                            alt="SyncWire" 
                            className="w-7 h-7 object-contain group-hover:scale-105 transition-transform" 
                        />
                        <span className="text-lg font-extrabold tracking-tight text-white">
                            SyncWire
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                        {/* Private Vault Button */}
                        <button
                            onClick={() => setIsVaultModalOpen(true)}
                            className={`p-1.5 rounded-full transition cursor-pointer ${
                                isVaultUnlocked ? 'bg-amber-500/30 text-amber-300 ring-1 ring-amber-400' : 'bg-white/10 hover:bg-white/20 text-white'
                            }`}
                            title={isVaultUnlocked ? "Vault Unlocked (Click to manage)" : "Open Private Vault"}
                        >
                            {isVaultUnlocked ? <Unlock size={16} /> : <Lock size={16} />}
                        </button>

                        {/* Theme Customizer Button */}
                        <button
                            onClick={() => setIsThemeModalOpen(true)}
                            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                            title="Change Theme & Wallpaper"
                        >
                            <Palette size={16} />
                        </button>

                        {/* New Group Button */}
                        <button
                            onClick={() => setIsGroupModalOpen(true)}
                            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                            title="Create New Group"
                        >
                            <Plus size={16} />
                        </button>

                        {/* 3-Dot Menu */}
                        <div className="relative">
                            <img 
                                src={assets.menu_icon} 
                                alt="Menu" 
                                onClick={() => setShowMenu(!showMenu)}
                                className="max-h-5 cursor-pointer hover:opacity-80 transition" 
                            />

                            {showMenu && (
                                <>
                                    <div 
                                        onClick={() => setShowMenu(false)} 
                                        className="fixed inset-0 z-20"
                                    ></div>
                                    <div className="absolute right-0 top-7 z-30 w-44 py-2 bg-[#282142] rounded-md shadow-2xl border border-gray-600 text-sm text-gray-100 animate-in fade-in zoom-in-95 duration-100">
                                        <div 
                                            onClick={() => { setShowMenu(false); setIsGroupModalOpen(true); }} 
                                            className="px-4 py-2 hover:bg-[#392f5e] flex items-center gap-2.5 cursor-pointer text-xs"
                                        >
                                            <Users size={14} className="text-violet-400" />
                                            <span>New Group</span>
                                        </div>
                                        <div 
                                            onClick={() => { setShowMenu(false); setIsThemeModalOpen(true); }} 
                                            className="px-4 py-2 hover:bg-[#392f5e] flex items-center gap-2.5 cursor-pointer text-xs"
                                        >
                                            <Palette size={14} className="text-pink-400" />
                                            <span>Wallpapers & Themes</span>
                                        </div>
                                        <div 
                                            onClick={() => { setShowMenu(false); navigate('/profile'); }} 
                                            className="px-4 py-2 hover:bg-[#392f5e] flex items-center gap-2.5 cursor-pointer text-xs"
                                        >
                                            <UserIcon size={14} className="text-gray-400" />
                                            <span>Edit Profile</span>
                                        </div>
                                        <hr className="my-1 border-gray-700" />
                                        <div 
                                            onClick={() => { setShowMenu(false); logout(); }} 
                                            className="px-4 py-2 hover:bg-[#392f5e] flex items-center gap-2.5 cursor-pointer text-xs text-red-300"
                                        >
                                            <LogOut size={14} />
                                            <span>Logout</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className={`rounded-full flex items-center gap-2 py-2 px-4 mt-3 border transition-colors duration-300 ${activeTheme.searchBgClass || 'bg-[#282142] border-gray-700/50'}`}>
                    <img src={assets.search_icon} alt="Search" className="w-3.5 opacity-70" />
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        type="text" 
                        placeholder="Search chats, contacts, or groups..." 
                        className="bg-transparent border-none outline-none text-white text-xs placeholder-gray-400 flex-1"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white text-xs">
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Filter Pills with Status Tab */}
                <div className="flex items-center gap-2 pt-2.5 pb-1 text-xs">
                    <button 
                        onClick={() => setActiveFilter('all')} 
                        className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                            activeFilter === 'all' 
                                ? (activeTheme.pillActiveClass || 'bg-violet-500/40 text-white border border-violet-400/50') 
                                : 'bg-black/20 text-gray-400 hover:text-white'
                        }`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setActiveFilter('status')} 
                        className={`px-3 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 ${
                            activeFilter === 'status' 
                                ? (activeTheme.pillActiveClass || 'bg-violet-500/40 text-white border border-violet-400/50') 
                                : 'bg-black/20 text-gray-400 hover:text-white'
                        }`}
                    >
                        <CircleDashed size={12} className="text-green-400" /> Status
                        {storiesByUser.length > 0 && (
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-ping"></span>
                        )}
                    </button>
                    <button 
                        onClick={() => setActiveFilter('groups')} 
                        className={`px-3 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1 ${
                            activeFilter === 'groups' 
                                ? (activeTheme.pillActiveClass || 'bg-violet-500/40 text-white border border-violet-400/50') 
                                : 'bg-black/20 text-gray-400 hover:text-white'
                        }`}
                    >
                        <Users size={12} /> Groups
                        {groups.length > 0 && <span className="text-[10px] text-violet-300">({groups.length})</span>}
                    </button>
                    <button 
                        onClick={() => setActiveFilter('unread')} 
                        className={`px-3 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            activeFilter === 'unread' 
                                ? (activeTheme.pillActiveClass || 'bg-violet-500/40 text-white border border-violet-400/50') 
                                : 'bg-black/20 text-gray-400 hover:text-white'
                        }`}
                    >
                        Unread
                        {totalUnread > 0 && (
                            <span className="w-4 h-4 bg-violet-400 text-white rounded-full flex items-center justify-center font-bold text-[10px]">
                                {totalUnread}
                            </span>
                        )}
                    </button>
                </div>
            </div>


            {/* Chat, Group & Status List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {activeFilter === 'status' ? (
                    // 24H Status / Stories View
                    <div className="space-y-3 p-1">
                        {/* My Status Add Card */}
                        <div 
                            onClick={() => setIsCreateStatusOpen(true)}
                            className="flex items-center gap-3 p-2.5 rounded-xl bg-[#282142]/60 hover:bg-[#282142] cursor-pointer transition border border-gray-700/50"
                        >
                            <div className="relative">
                                <img
                                    src={authUser?.profilePic || assets.avatar_icon}
                                    alt="My Status"
                                    className="w-11 h-11 rounded-full object-cover border-2 border-gray-600"
                                />
                                <div className="absolute -bottom-0.5 -right-0.5 w-4.5 h-4.5 bg-violet-500 text-white rounded-full flex items-center justify-center border-2 border-[#1e1534]">
                                    <Plus size={12} />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-sm font-medium text-white">My Status</h3>
                                <p className="text-xs text-violet-300">Tap to add 24h status update</p>
                            </div>
                        </div>

                        {/* Recent Status Updates from Contacts */}
                        <div className="pt-2">
                            <span className="text-[11px] font-semibold text-gray-400 px-2 uppercase tracking-wider">
                                Recent Updates
                            </span>

                            {storiesByUser.length === 0 ? (
                                <p className="text-xs text-gray-500 py-6 text-center">No recent status updates</p>
                            ) : (
                                storiesByUser.map((grp) => (
                                    <div
                                        key={grp.user?._id}
                                        onClick={() => setViewingStoryGroup(grp)}
                                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#282142]/50 cursor-pointer transition mt-1"
                                    >
                                        <div className="relative p-0.5 rounded-full border-2 border-violet-400">
                                            <img
                                                src={grp.user?.profilePic || assets.avatar_icon}
                                                alt={grp.user?.fullName}
                                                className="w-10 h-10 rounded-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-sm font-medium text-white truncate">
                                                {nicknames[grp.user?._id] || grp.user?.fullName}
                                            </h3>
                                            <p className="text-xs text-gray-400">
                                                {grp.stories?.length} update{grp.stories?.length > 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : activeFilter === 'groups' ? (
                    filteredGroups.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-xs flex flex-col items-center gap-2">
                            <Users size={28} className="text-gray-500" />
                            <p>No groups created yet</p>
                            <button 
                                onClick={() => setIsGroupModalOpen(true)}
                                className="mt-2 text-xs text-violet-400 hover:underline cursor-pointer"
                            >
                                + Create your first group
                            </button>
                        </div>
                    ) : (
                        filteredGroups.map((grp) => {
                            const isSelected = selectedGroup?._id === grp._id;
                            const lastMsg = grp.lastMessage;

                            return (
                                <div
                                    key={grp._id}
                                    onClick={() => {
                                        setSelectedGroup(grp);
                                        setSelectedUser(null);
                                    }}
                                    className={`flex items-center gap-3 p-2.5 px-3 rounded-xl cursor-pointer transition ${
                                        isSelected ? 'bg-[#282142]' : 'hover:bg-[#282142]/50'
                                    }`}
                                >
                                    <div className="w-10 h-10 rounded-full bg-violet-600/30 border border-violet-400/40 flex items-center justify-center shrink-0 overflow-hidden">
                                        {grp.groupPic ? (
                                            <img src={grp.groupPic} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Users size={18} className="text-violet-300" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="text-sm font-medium truncate text-white">
                                                {grp.name}
                                            </h3>
                                            {lastMsg && (
                                                <span className="text-[10px] text-gray-400 shrink-0">
                                                    {formatChatListTime(lastMsg.createdAt)}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-400 truncate">
                                            {lastMsg ? (
                                                <span>{lastMsg.senderId?.fullName || "Member"}: {lastMsg.text || "Shared media"}</span>
                                            ) : (
                                                <span>{grp.members?.length || 0} members</span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )
                ) : (
                    filteredUsers.length === 0 ? (
                        <div className="py-12 text-center text-gray-400 text-xs">
                            <p>No chats found</p>
                        </div>
                    ) : (
                        filteredUsers.map((user) => {
                            const isSelected = selectedUser?._id === user._id;
                            const isOnline = onlineUsers.includes(user._id);
                            const isTyping = typingUsers[user._id];
                            const lastMsg = lastMessages[user._id];
                            const unreadCount = unseenMessages[user._id] || 0;
                            const isSentByMe = lastMsg && lastMsg.senderId === authUser?._id;
                            const displayName = nicknames[user._id] || user.fullName;

                            return (
                                <div 
                                    key={user._id}
                                    onClick={() => {
                                        setSelectedUser(user);
                                        setSelectedGroup(null);
                                        setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                                    }}
                                    className={`flex items-center gap-3 p-2.5 px-3 rounded-xl cursor-pointer transition ${
                                        isSelected ? 'bg-[#282142]' : 'hover:bg-[#282142]/50'
                                    }`}
                                >
                                    {/* User Avatar */}
                                    <div className="relative shrink-0">
                                        <img 
                                            src={user.profilePic || assets.avatar_icon} 
                                            alt={displayName} 
                                            className="w-10 h-10 rounded-full object-cover border border-gray-700/50"
                                        />
                                        {isOnline && (
                                            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-[#1e1534] rounded-full"></span>
                                        )}
                                    </div>

                                    {/* User info & last message */}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h3 className="text-sm font-medium truncate text-white">
                                                {displayName}
                                            </h3>
                                            {lastMsg && (
                                                <span className={`text-[10px] shrink-0 ${unreadCount > 0 ? 'text-violet-300 font-semibold' : 'text-gray-400'}`}>
                                                    {formatChatListTime(lastMsg.createdAt)}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between text-xs text-gray-400">
                                            <div className="flex items-center gap-1 truncate pr-2">
                                                {isTyping ? (
                                                    <span className="text-green-400 font-medium animate-pulse text-xs">
                                                        typing...
                                                    </span>
                                                ) : lastMsg ? (
                                                    <>
                                                        {isSentByMe && (
                                                            lastMsg.seen ? (
                                                                <CheckCheck size={14} className="text-blue-400 shrink-0" />
                                                            ) : (
                                                                <CheckCheck size={14} className="text-gray-400 shrink-0" />
                                                            )
                                                        )}
                                                        {lastMsg.isDeleted ? (
                                                            <span className="italic text-gray-500 text-xs">This message was deleted</span>
                                                        ) : lastMsg.messageType === 'image' || lastMsg.image ? (
                                                            <span className="flex items-center gap-1 truncate text-xs">
                                                                <ImageIcon size={12} className="shrink-0" /> Photo
                                                            </span>
                                                        ) : lastMsg.messageType === 'audio' || lastMsg.audio ? (
                                                            <span className="flex items-center gap-1 truncate text-xs text-violet-300">
                                                                <Mic size={12} className="shrink-0" /> Voice note
                                                            </span>
                                                        ) : (
                                                            <span className="truncate text-xs">{lastMsg.text || 'Shared a message'}</span>
                                                        )}
                                                    </>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">
                                                        {isOnline ? <span className="text-green-400">Online</span> : <span className="text-neutral-400">Offline</span>}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Unread Counter Badge */}
                                            {unreadCount > 0 && (
                                                <span className="min-w-4.5 h-4.5 px-1 bg-violet-500/70 text-white text-[10px] font-bold rounded-full flex items-center justify-center shrink-0">
                                                    {unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )
                )}
            </div>

            {/* Modals */}
            <CreateGroupModal 
                isOpen={isGroupModalOpen} 
                onClose={() => setIsGroupModalOpen(false)} 
            />

            <ThemeModal
                isOpen={isThemeModalOpen}
                onClose={() => setIsThemeModalOpen(false)}
            />

            <CreateStatusModal
                isOpen={isCreateStatusOpen}
                onClose={() => setIsCreateStatusOpen(false)}
            />

            <StatusViewerModal
                userStoriesGroup={viewingStoryGroup}
                onClose={() => setViewingStoryGroup(null)}
            />

            <SecretVaultModal
                isOpen={isVaultModalOpen}
                onClose={() => setIsVaultModalOpen(false)}
                isUnlocked={isVaultUnlocked}
                onUnlock={unlockVault}
                onLock={lockVault}
                onSetPin={setVaultPin}
                hasPin={Boolean(vaultPin)}
            />
        </div>
    );
};

export default Sidebar;





