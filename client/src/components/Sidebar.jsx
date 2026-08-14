import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { formatChatListTime } from '../lib/utils';
import { 
    MessageSquarePlus, 
    MoreVertical, 
    Search, 
    Filter, 
    Check, 
    CheckCheck, 
    Image as ImageIcon, 
    Mic, 
    CircleDot, 
    Users, 
    User as UserIcon, 
    LogOut,
    X
} from 'lucide-react';

const Sidebar = () => {
    const { 
        getUsers, 
        users, 
        selectedUser, 
        setSelectedUser, 
        unseenMessages, 
        setUnseenMessages,
        lastMessages,
        typingUsers
    } = useContext(ChatContext);

    const { authUser, logout, onlineUsers } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'unread'
    const [showMenu, setShowMenu] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        getUsers();
    }, [onlineUsers]);

    // Filter users by search and by unread status
    const filteredUsers = users.filter((user) => {
        const matchesSearch = user.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        if (activeFilter === 'unread') {
            return matchesSearch && (unseenMessages[user._id] > 0);
        }
        return matchesSearch;
    });

    const totalUnread = Object.values(unseenMessages).reduce((acc, curr) => acc + (curr || 0), 0);

    return (
        <div className={`bg-[#111b21] h-full flex flex-col border-r border-[#222e35] text-[#e9edef] select-none ${selectedUser ? 'max-md:hidden' : 'w-full'}`}>
            
            {/* Top WhatsApp App Bar */}
            <div className="bg-[#202c33] px-4 py-3 flex justify-between items-center z-10">
                <div 
                    onClick={() => navigate('/profile')} 
                    className="flex items-center gap-3 cursor-pointer group"
                    title="Profile & Status"
                >
                    <div className="relative">
                        <img 
                            src={authUser?.profilePic || assets.avatar_icon} 
                            alt={authUser?.fullName} 
                            className="w-10 h-10 rounded-full object-cover border border-[#2a3942] group-hover:opacity-90 transition"
                        />
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#00a884] border-2 border-[#202c33] rounded-full"></span>
                    </div>
                    <div className="hidden lg:flex flex-col">
                        <span className="text-sm font-medium text-[#e9edef] leading-tight group-hover:text-[#00a884] transition">
                            {authUser?.fullName}
                        </span>
                        <span className="text-[11px] text-[#8696a0]">My status</span>
                    </div>
                </div>

                {/* Header Action Icons */}
                <div className="flex items-center gap-1 text-[#aebac1]">
                    <button 
                        title="Status" 
                        className="p-2 hover:bg-[#374248] rounded-full transition text-[#aebac1] hover:text-[#e9edef]"
                    >
                        <CircleDot size={20} />
                    </button>
                    <button 
                        title="New Chat" 
                        className="p-2 hover:bg-[#374248] rounded-full transition text-[#aebac1] hover:text-[#e9edef]"
                    >
                        <MessageSquarePlus size={20} />
                    </button>

                    {/* 3-Dot Dropdown Menu */}
                    <div className="relative">
                        <button 
                            onClick={() => setShowMenu(!showMenu)} 
                            title="Menu" 
                            className={`p-2 rounded-full transition ${showMenu ? 'bg-[#374248] text-[#e9edef]' : 'hover:bg-[#374248] text-[#aebac1]'}`}
                        >
                            <MoreVertical size={20} />
                        </button>

                        {showMenu && (
                            <>
                                <div 
                                    onClick={() => setShowMenu(false)} 
                                    className="fixed inset-0 z-20"
                                ></div>
                                <div className="absolute right-0 top-11 z-30 w-48 py-2 bg-[#233138] rounded-md shadow-2xl border border-[#2a3942] text-sm animate-in fade-in zoom-in-95 duration-100">
                                    <div 
                                        onClick={() => { setShowMenu(false); navigate('/profile'); }} 
                                        className="px-4 py-2.5 hover:bg-[#182229] flex items-center gap-3 cursor-pointer text-[#d1d7db]"
                                    >
                                        <UserIcon size={16} className="text-[#8696a0]" />
                                        <span>Profile</span>
                                    </div>
                                    <hr className="my-1 border-[#2a3942]" />
                                    <div 
                                        onClick={() => { setShowMenu(false); logout(); }} 
                                        className="px-4 py-2.5 hover:bg-[#182229] flex items-center gap-3 cursor-pointer text-[#ea868f]"
                                    >
                                        <LogOut size={16} />
                                        <span>Log out</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Search and Filter Section */}
            <div className="px-3 pt-2 pb-2 bg-[#111b21] flex flex-col gap-2">
                <div className="bg-[#202c33] rounded-lg flex items-center px-3 py-1.5 gap-3 border border-transparent focus-within:border-[#00a884]/40 transition">
                    <Search size={16} className="text-[#8696a0] shrink-0" />
                    <input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        type="text" 
                        placeholder="Search or start new chat" 
                        className="bg-transparent border-none outline-none text-[#e9edef] text-sm placeholder-[#8696a0] flex-1 py-1"
                    />
                    {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="text-[#8696a0] hover:text-[#e9edef]">
                            <X size={16} />
                        </button>
                    )}
                </div>

                {/* WhatsApp Filter Pills */}
                <div className="flex items-center gap-2 pt-1 pb-1 overflow-x-auto text-xs">
                    <button 
                        onClick={() => setActiveFilter('all')} 
                        className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                            activeFilter === 'all' 
                                ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40' 
                                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
                        }`}
                    >
                        All
                    </button>
                    <button 
                        onClick={() => setActiveFilter('unread')} 
                        className={`px-3 py-1 rounded-full font-medium transition cursor-pointer flex items-center gap-1.5 ${
                            activeFilter === 'unread' 
                                ? 'bg-[#00a884]/20 text-[#00a884] border border-[#00a884]/40' 
                                : 'bg-[#202c33] text-[#8696a0] hover:bg-[#2a3942]'
                        }`}
                    >
                        Unread
                        {totalUnread > 0 && (
                            <span className="w-4 h-4 bg-[#00a884] text-[#111b21] rounded-full flex items-center justify-center font-bold text-[10px]">
                                {totalUnread}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Chat List Stream */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#222e35]/50">
                {filteredUsers.length === 0 ? (
                    <div className="py-12 text-center text-[#8696a0] text-sm px-4">
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

                        return (
                            <div 
                                key={user._id}
                                onClick={() => {
                                    setSelectedUser(user);
                                    setUnseenMessages((prev) => ({ ...prev, [user._id]: 0 }));
                                }}
                                className={`flex items-center gap-3 px-3 py-3 cursor-pointer transition hover:bg-[#202c33] relative ${
                                    isSelected ? 'bg-[#2a3942]' : ''
                                }`}
                            >
                                {/* User Avatar with Online Indicator */}
                                <div className="relative shrink-0">
                                    <img 
                                        src={user.profilePic || assets.avatar_icon} 
                                        alt={user.fullName} 
                                        className="w-12 h-12 rounded-full object-cover"
                                    />
                                    {isOnline && (
                                        <span className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-[#00a884] border-2 border-[#111b21] rounded-full" title="Online"></span>
                                    )}
                                </div>

                                {/* User Details and Message Preview */}
                                <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className={`text-base truncate font-normal ${isSelected ? 'text-[#e9edef]' : 'text-[#e9edef]'}`}>
                                            {user.fullName}
                                        </h3>
                                        {lastMsg && (
                                            <span className={`text-[11px] shrink-0 ${unreadCount > 0 ? 'text-[#00a884] font-medium' : 'text-[#8696a0]'}`}>
                                                {formatChatListTime(lastMsg.createdAt)}
                                            </span>
                                        )}
                                    </div>

                                    {/* Snippet / Typing status */}
                                    <div className="flex items-center justify-between text-xs text-[#8696a0]">
                                        <div className="flex items-center gap-1 truncate pr-2">
                                            {isTyping ? (
                                                <span className="text-[#00a884] font-medium animate-pulse">
                                                    typing...
                                                </span>
                                            ) : lastMsg ? (
                                                <>
                                                    {isSentByMe && (
                                                        lastMsg.seen ? (
                                                            <CheckCheck size={15} className="text-[#53bdeb] shrink-0" />
                                                        ) : (
                                                            <CheckCheck size={15} className="text-[#8696a0] shrink-0" />
                                                        )
                                                    )}
                                                    {lastMsg.messageType === 'image' || lastMsg.image ? (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <ImageIcon size={13} className="shrink-0" /> Photo
                                                        </span>
                                                    ) : lastMsg.messageType === 'audio' || lastMsg.audio ? (
                                                        <span className="flex items-center gap-1 truncate">
                                                            <Mic size={13} className="shrink-0 text-[#00a884]" /> Voice message
                                                        </span>
                                                    ) : (
                                                        <span className="truncate">{lastMsg.text || 'Shared a message'}</span>
                                                    )}
                                                </>
                                            ) : (
                                                <span className="text-[#8696a0]/70 truncate italic">
                                                    {user.bio || "Available"}
                                                </span>
                                            )}
                                        </div>

                                        {/* Unread Counter Badge */}
                                        {unreadCount > 0 && (
                                            <span className="min-w-5 h-5 px-1.5 bg-[#00a884] text-[#111b21] text-[11px] font-bold rounded-full flex items-center justify-center shrink-0">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Sidebar;

