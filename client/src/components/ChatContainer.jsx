import React, { useContext, useEffect, useRef, useState } from 'react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import { ChatContext } from '../../context/ChatContext';
import { AuthContext } from '../../context/AuthContext';
import { CallContext } from '../../context/CallContext';
import { speechManager } from '../lib/speech';
import toast from 'react-hot-toast';
import AudioPlayer from './AudioPlayer';
import EmojiPicker from './EmojiPicker';
import MediaViewer from './MediaViewer';
import AIAssistantModal from './AIAssistantModal';
import { 
    Phone, 
    Video, 
    Search, 
    Smile, 
    Mic, 
    Send, 
    Check, 
    CheckCheck, 
    Trash2, 
    Info,
    X,
    MoreVertical,
    Users,
    Ban,
    Edit2,
    Bot,
    Sparkles,
    MicOff,
    Flame
} from 'lucide-react';

const REACTION_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🙏'];

const ChatContainer = () => {
    const { 
        messages, 
        selectedUser, 
        setSelectedUser, 
        selectedGroup,
        setSelectedGroup,
        sendMessage, 
        getMessages,
        reactToMessage,
        deleteMessage,
        typingUsers,
        sendTyping,
        sendStopTyping,
        showContactInfo,
        setShowContactInfo,
        activeTheme,
        appSettings,
        nicknames,
        updateNickname,
        smartReplies
    } = useContext(ChatContext);

    const { authUser, onlineUsers } = useContext(AuthContext);
    const { startCall } = useContext(CallContext);

    const scrollEnd = useRef(null);
    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);

    const [input, setInput] = useState('');
    const [showEmoji, setShowEmoji] = useState(false);
    const [viewingMedia, setViewingMedia] = useState(null);
    const [searchInChat, setSearchInChat] = useState('');
    const [showChatSearch, setShowChatSearch] = useState(false);
    const [hoveredMsgId, setHoveredMsgId] = useState(null);
    const [activeMsgMenuId, setActiveMsgMenuId] = useState(null);
    const [isAIOpen, setIsAIOpen] = useState(false);

    // Nickname editing state
    const [isEditingNickname, setIsEditingNickname] = useState(false);
    const [nicknameInput, setNicknameInput] = useState('');

    // Voice dictation (Speech to text) state
    const [isDictating, setIsDictating] = useState(false);

    // Voice recording states
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const recordingTimerRef = useRef(null);

    // Fetch messages on contact or group select
    useEffect(() => {
        if (selectedUser) {
            getMessages(selectedUser._id, false);
            setNicknameInput(nicknames[selectedUser._id] || '');
        } else if (selectedGroup) {
            getMessages(selectedGroup._id, true);
        }
    }, [selectedUser, selectedGroup]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (scrollEnd.current) {
            scrollEnd.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isRecording]);

    // Handle text input change & typing trigger
    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (e.target.value.trim().length > 0) {
            sendTyping();
        } else {
            sendStopTyping();
        }
    };

    // Handle sending a text message
    const handleSendMessage = async (e, customText = null) => {
        if (e) e.preventDefault();
        const textToSend = customText || input.trim();
        if (!textToSend) return;

        setInput('');
        setShowEmoji(false);
        await sendMessage({ text: textToSend, messageType: 'text' });
    };

    // Handle sending an image
    const handleSendImage = async (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = async () => {
            await sendMessage({ image: reader.result, messageType: 'image' });
            if (fileInputRef.current) fileInputRef.current.value = '';
        };
        reader.readAsDataURL(file);
    };

    // Speech-to-Text Live Dictation
    const toggleSpeechDictation = () => {
        if (isDictating) {
            speechManager.stop();
            setIsDictating(false);
        } else {
            setIsDictating(true);
            speechManager.start(
                (transcript) => {
                    setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
                    sendTyping();
                },
                () => setIsDictating(false),
                (err) => {
                    setIsDictating(false);
                    toast.error(err || "Microphone not available for speech recognition");
                }
            );
        }
    };

    // Start Voice Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            setRecordingTime(0);

            recordingTimerRef.current = setInterval(() => {
                setRecordingTime((prev) => prev + 1);
            }, 1000);
        } catch (err) {
            toast.error('Microphone access is required for voice notes');
        }
    };

    // Stop and Send Voice Recording
    const stopAndSendRecording = () => {
        if (!mediaRecorderRef.current || !isRecording) return;

        clearInterval(recordingTimerRef.current);
        setIsRecording(false);

        mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.onloadend = async () => {
                await sendMessage({ audio: reader.result, messageType: 'audio' });
            };
            reader.readAsDataURL(audioBlob);

            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
        };

        mediaRecorderRef.current.stop();
    };

    // Cancel Voice Recording
    const cancelRecording = () => {
        if (!mediaRecorderRef.current || !isRecording) return;

        clearInterval(recordingTimerRef.current);
        setIsRecording(false);
        setRecordingTime(0);

        mediaRecorderRef.current.onstop = () => {
            mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
            audioChunksRef.current = [];
        };
        mediaRecorderRef.current.stop();
        toast('Voice note discarded');
    };

    // Save custom nickname
    const handleSaveNickname = (e) => {
        e.preventDefault();
        if (selectedUser) {
            updateNickname(selectedUser._id, nicknameInput);
            setIsEditingNickname(false);
        }
    };

    const formatTimer = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const formatLastSeen = (dateStr) => {
        if (!dateStr) return "offline";
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 2) return "last seen just now";
        if (diffMins < 60) return `last seen ${diffMins} mins ago`;

        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        if (date.toDateString() === now.toDateString()) {
            return `last seen today at ${timeStr}`;
        }
        return `last seen ${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${timeStr}`;
    };

    const isUserOnline = selectedUser && onlineUsers.includes(selectedUser._id);
    const isUserTyping = selectedUser && typingUsers[selectedUser._id];
    const contactDisplayName = selectedUser ? (nicknames[selectedUser._id] || selectedUser.fullName) : '';

    // Filter messages if search in chat is active
    const displayedMessages = searchInChat.trim()
        ? messages.filter((m) => m.text && m.text.toLowerCase().includes(searchInChat.toLowerCase()))
        : messages;

    const wallpaperPattern = appSettings?.chatWallpaperPattern || 'default';

    return isChatActive ? (
        <div className={`h-full flex flex-col relative select-none w-full transition-all duration-300 wallpaper-${wallpaperPattern}`}>
            
            {/* Header */}
            <div className={`flex items-center justify-between py-3 mx-4 border-b z-20 transition-colors duration-300 ${activeTheme.chatHeaderClass || 'border-stone-500/60'}`}>
                <div className="flex items-center gap-3">

                    <img 
                        onClick={() => { setSelectedUser(null); setSelectedGroup(null); }} 
                        src={assets.arrow_icon} 
                        alt="Back" 
                        className="md:hidden max-w-6 cursor-pointer"
                    />

                    {selectedGroup ? (
                        // Group Header
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-violet-600/40 border border-violet-400/40 flex items-center justify-center overflow-hidden">
                                {selectedGroup.groupPic ? (
                                    <img src={selectedGroup.groupPic} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={18} className="text-violet-300" />
                                )}
                            </div>
                            <div>
                                <h2 className="text-white font-medium text-base leading-tight">
                                    {selectedGroup.name}
                                </h2>
                                <span className="text-xs text-gray-400">
                                    {selectedGroup.members?.length || 0} members
                                </span>
                            </div>
                        </div>
                    ) : (
                        // Direct Chat Header with Nickname
                        <>
                            <div 
                                onClick={() => setShowContactInfo(!showContactInfo)} 
                                className="relative cursor-pointer shrink-0"
                            >
                                <img 
                                    src={selectedUser.profilePic || assets.avatar_icon} 
                                    alt={contactDisplayName} 
                                    className="w-9 h-9 rounded-full object-cover border border-gray-600"
                                />
                                {isUserOnline && (
                                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border border-[#1e1534] rounded-full"></span>
                                )}
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center gap-1.5">
                                    <h2 
                                        onClick={() => setShowContactInfo(!showContactInfo)}
                                        className="text-white font-medium text-base leading-tight cursor-pointer"
                                    >
                                        {contactDisplayName}
                                    </h2>
                                    {/* Nickname pencil */}
                                    <button
                                        onClick={() => setIsEditingNickname(!isEditingNickname)}
                                        className="text-gray-400 hover:text-violet-300 p-0.5 cursor-pointer transition"
                                        title="Set Nickname"
                                    >
                                        <Edit2 size={12} />
                                    </button>
                                </div>

                                {isEditingNickname ? (
                                    <form onSubmit={handleSaveNickname} className="flex items-center gap-1 mt-0.5">
                                        <input
                                            type="text"
                                            value={nicknameInput}
                                            onChange={(e) => setNicknameInput(e.target.value)}
                                            placeholder="Nickname..."
                                            className="bg-[#1e1534] border border-violet-400/50 rounded px-1.5 py-0.5 text-[11px] text-white focus:outline-none w-28"
                                            autoFocus
                                        />
                                        <button type="submit" className="text-[10px] bg-violet-600 text-white px-1.5 py-0.5 rounded cursor-pointer">
                                            Save
                                        </button>
                                    </form>
                                ) : (
                                    <span className="text-xs">
                                        {isUserTyping ? (
                                            <span className="text-green-400 font-medium animate-pulse">typing...</span>
                                        ) : isUserOnline ? (
                                            <span className="text-green-400">online</span>
                                        ) : (
                                            <span className="text-gray-400">{formatLastSeen(selectedUser?.lastSeen)}</span>
                                        )}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>

                {/* Header Action Buttons */}
                <div className="flex items-center gap-3 text-gray-300">
                    {selectedUser && (

                        <>
                            <button 
                                onClick={() => startCall(selectedUser, false)}
                                title="Voice Call" 
                                className="p-1.5 hover:text-white transition cursor-pointer"
                            >
                                <Phone size={18} />
                            </button>
                            <button 
                                onClick={() => startCall(selectedUser, true)}
                                title="Video Call" 
                                className="p-1.5 hover:text-white transition cursor-pointer"
                            >
                                <Video size={19} />
                            </button>
                        </>
                    )}
                    <button 
                        onClick={() => setShowChatSearch(!showChatSearch)}
                        title="Search in chat" 
                        className={`p-1.5 transition cursor-pointer ${showChatSearch ? 'text-violet-400' : 'hover:text-white'}`}
                    >
                        <Search size={18} />
                    </button>
                    {selectedUser && (
                        <button 
                            onClick={() => setShowContactInfo(!showContactInfo)}
                            title="Contact info" 
                            className={`p-1.5 transition cursor-pointer ${showContactInfo ? 'text-violet-400' : 'hover:text-white'}`}
                        >
                            <Info size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* In-Chat Search Bar */}
            {showChatSearch && (
                <div className="bg-[#282142]/80 px-4 py-2 flex items-center gap-3 border-b border-gray-700/50 animate-in slide-in-from-top-2 duration-150">
                    <Search size={14} className="text-gray-400" />
                    <input 
                        type="text" 
                        value={searchInChat} 
                        onChange={(e) => setSearchInChat(e.target.value)} 
                        placeholder="Search in conversation..."
                        className="bg-transparent border-none outline-none text-white text-xs flex-1 placeholder-gray-400"
                        autoFocus
                    />
                    {searchInChat && (
                        <button onClick={() => setSearchInChat('')} className="text-gray-400 hover:text-white">
                            <X size={14} />
                        </button>
                    )}
                </div>
            )}

            {/* Chat Messages Stream */}
            <div className="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4">
                
                {displayedMessages.map((msg, idx) => {
                    const senderId = msg.senderId?._id || msg.senderId;
                    const isSent = senderId === authUser?._id;
                    const isHovered = hoveredMsgId === msg._id;
                    const isMenuOpen = activeMsgMenuId === msg._id;
                    const senderObj = msg.senderId?.fullName ? msg.senderId : selectedUser;

                    const reactionCounts = (msg.reactions || []).reduce((acc, curr) => {
                        acc[curr.emoji] = (acc[curr.emoji] || 0) + 1;
                        return acc;
                    }, {});

                    return (
                        <div 
                            key={msg._id || idx} 
                            onMouseEnter={() => setHoveredMsgId(msg._id)}
                            onMouseLeave={() => { setHoveredMsgId(null); if (!isMenuOpen) setActiveMsgMenuId(null); }}
                            className={`flex items-end gap-2 group relative ${isSent ? 'justify-end' : 'justify-start'}`}
                        >
                            {!isSent && (
                                <img 
                                    src={senderObj?.profilePic || assets.avatar_icon} 
                                    alt="" 
                                    className="w-7 h-7 rounded-full mb-1 object-cover shrink-0" 
                                />
                            )}

                            {/* Hover Reaction Bar */}
                            {isHovered && !msg.isDeleted && (
                                <div className={`absolute -top-7 ${isSent ? 'right-2' : 'left-9'} z-30 bg-[#282142] border border-gray-600 rounded-full px-2 py-1 flex items-center gap-1 shadow-2xl animate-in fade-in zoom-in-95 duration-100`}>
                                    {REACTION_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => reactToMessage(msg._id, emoji)}
                                            className="hover:scale-125 transition text-sm cursor-pointer p-0.5"
                                        >
                                            {emoji}
                                        </button>
                                    ))}

                                    {/* 3-Dot Dropdown for Delete */}
                                    {isSent && (
                                        <div className="relative border-l border-gray-600 pl-1 ml-0.5">
                                            <button
                                                type="button"
                                                onClick={() => setActiveMsgMenuId(isMenuOpen ? null : msg._id)}
                                                className="text-gray-400 hover:text-white p-0.5 cursor-pointer"
                                                title="More actions"
                                            >
                                                <MoreVertical size={13} />
                                            </button>

                                            {isMenuOpen && (
                                                <div className="absolute right-0 bottom-7 bg-[#1e1534] border border-gray-600 rounded-lg shadow-2xl py-1 w-36 z-40 text-xs">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            deleteMessage(msg._id);
                                                            setActiveMsgMenuId(null);
                                                        }}
                                                        className="w-full px-3 py-1.5 text-left text-red-400 hover:bg-red-500/20 flex items-center gap-2 cursor-pointer"
                                                    >
                                                        <Trash2 size={12} />
                                                        Delete for everyone
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div 
                                className={`relative max-w-[80%] sm:max-w-[70%] md:max-w-[60%] rounded-xl p-3 shadow-lg select-text ${
                                    isSent 
                                        ? `${activeTheme.bubbleSent} rounded-br-none` 
                                        : `${activeTheme.bubbleReceived} rounded-bl-none`
                                }`}
                            >
                                {/* Group sender name tag */}
                                {selectedGroup && !isSent && senderObj?.fullName && (
                                    <p className="text-[11px] font-semibold text-violet-300 mb-1">
                                        {senderObj.fullName}
                                    </p>
                                )}

                                {/* Deleted Message Placeholder */}
                                {msg.isDeleted ? (
                                    <div className="flex items-center gap-1.5 text-xs text-gray-400 italic py-0.5">
                                        <Ban size={13} className="text-gray-500" />
                                        <span>This message was deleted</span>
                                    </div>
                                ) : (
                                    <>
                                        {/* Image message */}
                                        {msg.image && (
                                            <div 
                                                onClick={() => setViewingMedia(msg.image)}
                                                className="mb-1.5 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition"
                                            >
                                                <img 
                                                    src={msg.image} 
                                                    alt="Attachment" 
                                                    className="max-h-64 w-full object-cover rounded-lg border border-gray-700"
                                                />
                                            </div>
                                        )}

                                        {/* Audio voice note message */}
                                        {msg.audio && (
                                            <AudioPlayer src={msg.audio} isSent={isSent} />
                                        )}

                                        {/* Text message */}
                                        {msg.text && (
                                            <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                                                {msg.text}
                                            </p>
                                        )}
                                    </>
                                )}

                                {/* Message Footer: Time and Ticks */}
                                <div className="flex items-center justify-end gap-1 text-[10px] text-gray-400 mt-1 select-none">
                                    <span>{formatMessageTime(msg.createdAt)}</span>
                                    {isSent && !selectedGroup && (
                                        msg.seen ? (
                                            <CheckCheck size={14} className="text-blue-400" />
                                        ) : (
                                            <CheckCheck size={14} className="text-gray-400" />
                                        )
                                    )}
                                </div>

                                {/* Reaction Pills Badge */}
                                {Object.keys(reactionCounts).length > 0 && (
                                    <div className={`absolute -bottom-2.5 ${isSent ? 'right-2' : 'left-2'} bg-[#282142] border border-gray-600 rounded-full px-1.5 py-0.5 flex items-center gap-1 shadow text-[10px] select-none`}>
                                        {Object.entries(reactionCounts).map(([emoji, count]) => (
                                            <span key={emoji} className="flex items-center gap-0.5">
                                                <span>{emoji}</span>
                                                {count > 1 && <span className="text-violet-300 font-semibold">{count}</span>}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {isSent && (
                                <img 
                                    src={authUser?.profilePic || assets.avatar_icon} 
                                    alt="" 
                                    className="w-7 h-7 rounded-full mb-1 object-cover shrink-0" 
                                />
                            )}
                        </div>
                    );
                })}

                <div ref={scrollEnd}></div>
            </div>

            {/* Smart Reply Suggestions Bar */}
            {smartReplies.length > 0 && !isRecording && (
                <div className="px-4 py-1.5 flex items-center gap-2 overflow-x-auto select-none bg-black/20 backdrop-blur-sm border-t border-gray-700/30">
                    <span className="text-[10px] text-cyan-300 font-medium flex items-center gap-1 shrink-0">
                        <Sparkles size={11} /> Quick Reply:
                    </span>
                    {smartReplies.map((reply, rIdx) => (
                        <button
                            key={rIdx}
                            type="button"
                            onClick={(e) => handleSendMessage(e, reply)}
                            className="px-3 py-1 rounded-full bg-[#1e1534]/90 border border-violet-400/40 hover:border-violet-300 text-xs text-violet-200 hover:text-white shrink-0 transition cursor-pointer shadow"
                        >
                            {reply}
                        </button>
                    ))}
                </div>
            )}

            {/* Bottom Bar: Input, Emoji, Voice Dictation, Attachments & Voice Recorder */}
            <div className="p-3 relative z-30">
                
                {/* Emoji Drawer Toggle */}
                {showEmoji && (
                    <EmojiPicker 
                        onSelect={(emoji) => setInput((prev) => prev + emoji)}
                        onClose={() => setShowEmoji(false)}
                    />
                )}

                {isRecording ? (
                    // Live Voice Recording Bar
                    <div className="flex items-center justify-between bg-[#282142] px-4 py-2.5 rounded-full border border-gray-600 shadow-xl">
                        <div className="flex items-center gap-3">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-ping"></span>
                            <span className="text-sm font-mono text-white font-medium">
                                {formatTimer(recordingTime)}
                            </span>
                            <span className="text-xs text-gray-300">Recording voice note...</span>
                        </div>

                        <div className="flex items-center gap-3">
                            <button 
                                onClick={cancelRecording} 
                                title="Cancel recording"
                                className="text-red-400 hover:scale-110 transition p-1 cursor-pointer"
                            >
                                <Trash2 size={18} />
                            </button>
                            <button 
                                onClick={stopAndSendRecording} 
                                title="Send voice note"
                                className="w-8 h-8 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-full flex items-center justify-center hover:scale-105 active:scale-95 transition cursor-pointer shadow"
                            >
                                <Send size={16} fill="white" className="ml-0.5" />
                            </button>
                        </div>
                    </div>
                ) : (
                    // Normal Text & Attachment Bar with Voice Dictation
                    <div className="flex items-center gap-3">
                        <div className={`flex-1 flex items-center px-3 rounded-full border transition-colors duration-300 ${activeTheme.inputBarBgClass || 'bg-gray-100/12 border-gray-600/30'}`}>
                            <button 
                                type="button"
                                onClick={() => setShowEmoji(!showEmoji)} 
                                title="Emojis"
                                className={`p-1.5 rounded-full transition text-gray-400 hover:text-white ${showEmoji ? 'text-violet-400' : ''}`}
                            >
                                <Smile size={19} />
                            </button>


                            <input 
                                value={input}
                                onChange={handleInputChange}
                                onKeyDown={(e) => {
                                    if (appSettings?.enterToSend !== false && e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSendMessage(e);
                                    }
                                }}
                                type="text" 
                                placeholder={isDictating ? "Listening... speak now" : (selectedGroup ? `Message #${selectedGroup.name}` : "Send a message")} 
                                className={`flex-1 text-sm p-2.5 border-none rounded-lg outline-none text-white placeholder-gray-400 ${isDictating ? 'placeholder-red-400 animate-pulse' : ''}`}
                            />

                            {/* Voice-to-Text Live Dictation button */}
                            <button
                                type="button"
                                onClick={toggleSpeechDictation}
                                title={isDictating ? "Stop voice dictation" : "Voice-to-Text dictation"}
                                className={`p-1.5 rounded-full transition cursor-pointer ${
                                    isDictating 
                                        ? 'text-red-400 bg-red-500/20 animate-pulse' 
                                        : 'text-gray-400 hover:text-cyan-300'
                                }`}
                            >
                                {isDictating ? <MicOff size={18} /> : <Mic size={18} />}
                            </button>

                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleSendImage} 
                                accept="image/*" 
                                hidden 
                            />
                            <button 
                                type="button"
                                onClick={() => fileInputRef.current?.click()} 
                                title="Attach Photo"
                                className="p-1.5 transition opacity-80 hover:opacity-100 cursor-pointer"
                            >
                                <img src={assets.gallery_icon} alt="Gallery" className="w-5" />
                            </button>

                            {input.trim().length === 0 && (
                                <button 
                                    onClick={startRecording} 
                                    title="Record voice note"
                                    className="p-1.5 text-gray-400 hover:text-violet-400 transition cursor-pointer"
                                >
                                    <Mic size={19} />
                                </button>
                            )}
                        </div>

                        {/* Send Button */}
                        <img 
                            onClick={handleSendMessage} 
                            src={assets.send_button} 
                            alt="Send" 
                            className="w-7 cursor-pointer hover:scale-105 active:scale-95 transition" 
                        />
                    </div>
                )}
            </div>

            {/* Fullscreen Media Viewer Lightbox */}
            {viewingMedia && (
                <MediaViewer 
                    src={viewingMedia} 
                    onClose={() => setViewingMedia(null)} 
                />
            )}
        </div>

    ) : (
        // Empty State when no chat is open
        <div className="flex flex-col items-center justify-center gap-2 text-gray-500 bg-white/5 max-md:hidden h-full">
            <img src={assets.logo_icon} className="max-w-16" alt="SyncWire" />
            <p className="text-lg font-medium text-white">Chat anytime, anywhere</p>
        </div>
    );
};

export default ChatContainer;




