import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { sounds } from "../src/lib/sounds";
import { THEME_PRESETS } from "../src/components/ThemeModal";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [groups, setGroups] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [lastMessages, setLastMessages] = useState({});
    const [typingUsers, setTypingUsers] = useState({});
    const [showContactInfo, setShowContactInfo] = useState(false);

    // Futuristic Theme customizer state
    const [activeTheme, setActiveThemeState] = useState(() => {
        const saved = localStorage.getItem('quickchat_theme');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) {}
        }
        return THEME_PRESETS[0];
    });

    const setActiveTheme = (theme) => {
        setActiveThemeState(theme);
        localStorage.setItem('quickchat_theme', JSON.stringify(theme));
    };

    // Global App & Chat Settings (Font size, sounds, privacy, etc.)
    const defaultSettings = {
        fontSize: 'medium', // 'small' | 'medium' | 'large' | 'xlarge'
        enterToSend: true,
        soundEnabled: true,
        sentSoundEnabled: true,
        typingSoundEnabled: false,
        readReceipts: true,
        smartRepliesEnabled: true,
        voiceNoteSpeechEnabled: true,
        mediaAutoDownload: 'wifi_cellular',
        disappearingTimer: 'off',
        chatWallpaperPattern: 'default',
        privacyLastSeen: 'everyone',
    };

    const [appSettings, setAppSettings] = useState(() => {
        const saved = localStorage.getItem('quickchat_settings');
        if (saved) {
            try { return { ...defaultSettings, ...JSON.parse(saved) }; } catch (e) {}
        }
        return defaultSettings;
    });

    const updateSetting = (key, value) => {
        setAppSettings((prev) => {
            const next = { ...prev, [key]: value };
            localStorage.setItem('quickchat_settings', JSON.stringify(next));
            return next;
        });
    };

    useEffect(() => {
        document.documentElement.setAttribute('data-font-size', appSettings.fontSize || 'medium');
    }, [appSettings.fontSize]);

    // Nicknames map
    const [nicknames, setNicknames] = useState({});

    // 24h Stories state
    const [storiesByUser, setStoriesByUser] = useState([]);

    // Smart reply suggestions
    const [smartReplies, setSmartReplies] = useState([]);

    const { socket, axios, authUser } = useContext(AuthContext);
    const typingTimeoutRef = useRef(null);

    // Initialize nicknames from authUser
    useEffect(() => {
        if (authUser && authUser.nicknames) {
            setNicknames(
                authUser.nicknames instanceof Map
                    ? Object.fromEntries(authUser.nicknames)
                    : authUser.nicknames
            );
        }
    }, [authUser]);

    // Set custom nickname for a contact
    const updateNickname = async (contactUserId, nickname) => {
        try {
            setNicknames((prev) => ({ ...prev, [contactUserId]: nickname }));
            const { data } = await axios.put('/api/auth/nickname', { contactUserId, nickname });
            if (data.success) {
                toast.success("Nickname saved!");
            }
        } catch (e) {
            toast.error("Failed to save nickname");
        }
    };

    // Get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get("/api/messages/users");
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
                setLastMessages(data.lastMessages || {});
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Get 24h stories
    const getStories = async () => {
        try {
            const { data } = await axios.get("/api/stories");
            if (data.success) {
                setStoriesByUser(data.storiesByUser || []);
            }
        } catch (e) {}
    };

    // Create a story
    const createStory = async (storyData) => {
        try {
            const { data } = await axios.post("/api/stories/create", storyData);
            if (data.success) {
                getStories();
                return data.story;
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            throw err;
        }
    };

    // Fetch smart reply suggestions
    const fetchSmartReplies = async (lastMsgText) => {
        try {
            const { data } = await axios.post('/api/ai/smart-replies', {
                lastMessageText: lastMsgText,
            });
            if (data.success) {
                setSmartReplies(data.replies || []);
            }
        } catch (e) {}
    };

    // Get all groups for sidebar
    const getGroups = async () => {
        try {
            const { data } = await axios.get("/api/groups");
            if (data.success) {
                setGroups(data.groups);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Create a new group
    const createGroup = async (groupData) => {
        try {
            const { data } = await axios.post("/api/groups/create", groupData);
            if (data.success) {
                setGroups((prev) => [data.group, ...prev]);
                setSelectedGroup(data.group);
                setSelectedUser(null);
                if (socket) {
                    socket.emit("joinGroup", { groupId: data.group._id });
                }
                return data.group;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
            throw error;
        }
    };

    // Get messages for selected user or group
    const getMessages = async (targetId, isGroup = false) => {
        try {
            const { data } = await axios.get(`/api/messages/${targetId}?isGroup=${isGroup}`);
            if (data.success) {
                setMessages(data.messages);
                if (!isGroup) {
                    setUnseenMessages((prev) => ({ ...prev, [targetId]: 0 }));
                }

                // Generate smart replies based on the last message from the other person
                const lastMsg = data.messages[data.messages.length - 1];
                if (lastMsg && lastMsg.senderId !== authUser?._id && lastMsg.text) {
                    fetchSmartReplies(lastMsg.text);
                } else {
                    setSmartReplies([]);
                }
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Send message (text, image, audio) to user or group
    const sendMessage = async (messageData) => {
        const targetId = selectedGroup ? selectedGroup._id : (selectedUser ? selectedUser._id : null);
        if (!targetId) return;

        try {
            sendStopTyping();
            setSmartReplies([]);
            
            const payload = {
                ...messageData,
                isGroup: Boolean(selectedGroup),
            };

            const { data } = await axios.post(`/api/messages/send/${targetId}`, payload);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
                sounds.playSent();
                return data.newMessage;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // React to message
    const reactToMessage = async (messageId, emoji) => {
        try {
            setMessages((prev) =>
                prev.map((msg) => {
                    if (msg._id === messageId) {
                        const reactions = [...(msg.reactions || [])];
                        const idx = reactions.findIndex(
                            (r) => r.userId === authUser._id || r.userId?._id === authUser._id
                        );
                        if (idx > -1) {
                            if (reactions[idx].emoji === emoji) {
                                reactions.splice(idx, 1);
                            } else {
                                reactions[idx].emoji = emoji;
                            }
                        } else {
                            reactions.push({ userId: authUser._id, emoji });
                        }
                        return { ...msg, reactions };
                    }
                    return msg;
                })
            );

            await axios.put(`/api/messages/react/${messageId}`, { emoji });
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Delete message for everyone
    const deleteMessage = async (messageId) => {
        try {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, isDeleted: true, text: "This message was deleted", image: null, audio: null }
                        : msg
                )
            );

            const { data } = await axios.delete(`/api/messages/delete/${messageId}`);
            if (data.success) {
                toast.success("Message deleted for everyone");
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Typing indicators
    const sendTyping = () => {
        if (!socket || !selectedUser) return;
        socket.emit("typing", { receiverId: selectedUser._id });

        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
            sendStopTyping();
        }, 2500);
    };

    const sendStopTyping = () => {
        if (!socket || !selectedUser) return;
        socket.emit("stopTyping", { receiverId: selectedUser._id });
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };

    // Socket subscriptions
    useEffect(() => {
        if (!socket) return;

        if (selectedGroup) {
            socket.emit("joinGroup", { groupId: selectedGroup._id });
        }

        const handleNewMessage = (newMessage) => {
            const isFromCurrentChat = selectedUser && newMessage.senderId === selectedUser._id;

            if (isFromCurrentChat) {
                newMessage.seen = true;
                setMessages((prev) => [...prev, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
                socket.emit("markSeen", { senderId: newMessage.senderId });

                if (newMessage.text) {
                    fetchSmartReplies(newMessage.text);
                }
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }

            setLastMessages((prev) => ({
                ...prev,
                [newMessage.senderId]: newMessage,
            }));

            sounds.playReceived();
        };

        const handleNewGroupMessage = (newGroupMsg) => {
            if (selectedGroup && selectedGroup._id === newGroupMsg.groupId) {
                setMessages((prev) => [...prev, newGroupMsg]);
            }
            sounds.playReceived();
        };

        const handleMessageReaction = ({ messageId, reactions }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, reactions } : msg))
            );
        };

        const handleMessageDeleted = ({ messageId }) => {
            setMessages((prev) =>
                prev.map((msg) =>
                    msg._id === messageId
                        ? { ...msg, isDeleted: true, text: "This message was deleted", image: null, audio: null }
                        : msg
                )
            );
        };

        const handleUserTyping = ({ senderId }) => {
            setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
        };

        const handleUserStopTyping = ({ senderId }) => {
            setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
        };

        const handleMessagesSeen = ({ byUserId }) => {
            if (selectedUser && selectedUser._id === byUserId) {
                setMessages((prev) =>
                    prev.map((msg) => (msg.senderId === authUser?._id ? { ...msg, seen: true } : msg))
                );
            }
        };

        const handleUserLastSeenUpdated = ({ userId, lastSeen }) => {
            setUsers((prev) =>
                prev.map((u) => (u._id === userId ? { ...u, lastSeen } : u))
            );
            if (selectedUser && selectedUser._id === userId) {
                setSelectedUser((prev) => ({ ...prev, lastSeen }));
            }
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("newGroupMessage", handleNewGroupMessage);
        socket.on("messageReaction", handleMessageReaction);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("userTyping", handleUserTyping);
        socket.on("userStopTyping", handleUserStopTyping);
        socket.on("messagesSeen", handleMessagesSeen);
        socket.on("userLastSeenUpdated", handleUserLastSeenUpdated);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("newGroupMessage", handleNewGroupMessage);
            socket.off("messageReaction", handleMessageReaction);
            socket.off("messageDeleted", handleMessageDeleted);
            socket.off("userTyping", handleUserTyping);
            socket.off("userStopTyping", handleUserStopTyping);
            socket.off("messagesSeen", handleMessagesSeen);
            socket.off("userLastSeenUpdated", handleUserLastSeenUpdated);
        };
    }, [socket, selectedUser, selectedGroup, authUser]);

    const value = {
        messages,
        users,
        groups,
        selectedUser,
        setSelectedUser,
        selectedGroup,
        setSelectedGroup,
        unseenMessages,
        setUnseenMessages,
        lastMessages,
        typingUsers,
        showContactInfo,
        setShowContactInfo,
        activeTheme,
        setActiveTheme,
        appSettings,
        updateSetting,
        nicknames,
        updateNickname,
        storiesByUser,
        getStories,
        createStory,
        smartReplies,
        getUsers,
        getGroups,
        createGroup,
        getMessages,
        sendMessage,
        reactToMessage,
        deleteMessage,
        sendTyping,
        sendStopTyping,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
