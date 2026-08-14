import React, { useContext, useEffect, useState } from 'react';
import assets from '../assets/assets';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { 
    X, 
    Lock, 
    Bell, 
    Star, 
    Image as ImageIcon,
    Mail
} from 'lucide-react';
import toast from 'react-hot-toast';

const RightSidebar = () => {
    const { selectedUser, messages, showContactInfo, setShowContactInfo, activeTheme } = useContext(ChatContext);
    const { logout, onlineUsers } = useContext(AuthContext);
    const [msgImages, setMsgImages] = useState([]);

    // Extract all images from message history
    useEffect(() => {
        setMsgImages(
            messages.filter((msg) => msg.image).map((msg) => msg.image)
        );
    }, [messages]);

    if (!selectedUser || !showContactInfo) return null;

    const isOnline = onlineUsers.includes(selectedUser._id);

    return (
        <div className={`border-l text-white w-full h-full overflow-y-auto flex flex-col z-20 select-none relative pb-16 transition-colors duration-300 ${activeTheme.rightSidebarBgClass || 'bg-[#1e1534]/90 border-gray-700/50'}`}>

            
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-700/30">
                <h2 className="text-white font-medium text-base">Profile details</h2>
                <button 
                    onClick={() => setShowContactInfo(false)}
                    className="text-gray-400 hover:text-white p-1 rounded-full transition cursor-pointer"
                    title="Close"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Profile Overview Card */}
            <div className="pt-8 pb-4 flex flex-col items-center text-center">
                <div className="relative mb-3">
                    <img 
                        src={selectedUser?.profilePic || assets.avatar_icon} 
                        alt={selectedUser.fullName}
                        className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-gray-600"
                    />
                    {isOnline && (
                        <span className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#1e1534] rounded-full" title="Online"></span>
                    )}
                </div>

                <h3 className="text-lg font-medium text-white mb-0.5">
                    {selectedUser.fullName}
                </h3>
                <p className="text-xs text-gray-400">
                    {isOnline ? <span className="text-green-400">Online</span> : <span>Offline</span>}
                </p>
                <p className="px-6 text-xs text-gray-300 mt-2 font-light">{selectedUser.bio || "Hi Everyone, I am Using SyncWire"}</p>
            </div>

            <hr className="border-gray-700/40 my-2 mx-4" />

            {/* Media Gallery */}
            <div className="px-5 text-xs">
                <div className="flex justify-between items-center mb-2">
                    <p className="font-medium text-gray-300 flex items-center gap-1.5">
                        <ImageIcon size={13} /> Media
                    </p>
                    <span className="text-gray-400">{msgImages.length}</span>
                </div>

                {msgImages.length === 0 ? (
                    <p className="text-gray-500 py-2">No media shared</p>
                ) : (
                    <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {msgImages.map((url, index) => (
                            <div 
                                key={index} 
                                onClick={() => window.open(url, '_blank')} 
                                className="aspect-square rounded-md overflow-hidden cursor-pointer hover:opacity-80 transition bg-[#282142]"
                            >
                                <img src={url} alt="Media" className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Encryption & Info */}
            <div className="px-5 pt-4 space-y-2 text-xs text-gray-400">
                <div className="flex items-center gap-2">
                    <Lock size={14} className="text-violet-400 shrink-0" />
                    <span>Messages are end-to-end encrypted</span>
                </div>
                {selectedUser.email && (
                    <div className="flex items-center gap-2">
                        <Mail size={14} className="text-gray-400 shrink-0" />
                        <span>{selectedUser.email}</span>
                    </div>
                )}
            </div>

            {/* Logout Button */}
            <div className="p-4 mt-auto">
                <button 
                    onClick={() => logout()} 
                    className="w-full bg-gradient-to-r from-purple-400 to-violet-600 text-white border-none text-xs font-medium py-2.5 rounded-full cursor-pointer hover:opacity-90 transition shadow"
                >
                    Logout
                </button>
            </div>

        </div>
    );
};

export default RightSidebar;


