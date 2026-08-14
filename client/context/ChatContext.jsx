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
        } catch (error) {
            toast.error("Failed to save nickname");
        }
    };

    // Get all users for sidebar
    const getUsers = async () => {
        try {
            const { data } = await axios.get('/api/messages/users');
            if (data.success) {
                setUsers(data.users);
                setUnseenMessages(data.unseenMessages || {});
                setLastMessages(data.lastMessages || {});
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Get all groups
    const getGroups = async () => {
        try {
            const { data } = await axios.get('/api/groups');
            if (data.success) {
                setGroups(data.groups);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Create a new group
    const createGroup = async ({ name, description, memberIds }) => {
        try {
            const { data } = await axios.post('/api/groups/create', { name, description, memberIds });
            if (data.success) {
                setGroups((prev) => [data.group, ...prev]);
                toast.success(`Group "${name}" created!`);
                return data.group;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Get active 24h Stories
    const getStories = async () => {
        try {
            const { data } = await axios.get('/api/stories');
            if (data.success) {
                setStoriesByUser(data.storiesByUser || []);
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Post a 24h Story
    const createStory = async ({ text, media, caption, bgGradient, musicTrack }) => {
        try {
            const { data } = await axios.post('/api/stories/create', {
                text,
                media,
                caption,
                bgGradient,
                musicTrack
            });
            if (data.success) {
                getStories();
                return data.story;
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            throw error;
        }
    };

    // Fetch AI Smart Reply suggestions
    const fetchSmartReplies = async (lastMessageText) => {
        if (!appSettings.smartRepliesEnabled) return;
        try {
            const { data } = await axios.post('/api/ai/smart-replies', { lastMessageText });
            if (data.success && data.replies) {
                setSmartReplies(data.replies);
            }
        } catch (error) {
            setSmartReplies([]);
        }
    };

    // Get messages for a user or group
    const getMessages = async (targetId, isGroup = false) => {
        try {
            const { data } = await axios.get(`/api/messages/${targetId}?isGroup=${isGroup}`);
            if (data.success) {
                setMessages(data.messages);
                if (!isGroup) {
                    setUnseenMessages((prev) => ({ ...prev, [targetId]: 0 }));
                }

                // Generate smart replies based on the last message
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

    // Send message (text, image, audio, burner) to user or group
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

    // Next-Gen Methods
    const createPoll = async ({ question, options, isAnonymous }) => {
        try {
            const targetId = selectedGroup ? selectedGroup._id : selectedUser._id;
            const isGroup = Boolean(selectedGroup);
            const { data } = await axios.post(`/api/messages/poll/${targetId}`, {
                question,
                options,
                isAnonymous,
                isGroup
            });
            if (data.success) {
                setMessages((prev) => [...prev, data.newMessage]);
                return data.newMessage;
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const votePoll = async (messageId, optionId) => {
        try {
            const { data } = await axios.put(`/api/messages/poll/vote/${messageId}`, { optionId });
            if (data.success) {
                setMessages((prev) =>
                    prev.map((msg) => (msg._id === messageId ? { ...msg, poll: data.poll } : msg))
                );
            }
        } catch (e) {
            toast.error(e.message);
        }
    };

    const scheduleMessage = async ({ text, scheduledFor }) => {
        try {
            const targetId = selectedGroup ? selectedGroup._id : selectedUser._id;
            const isGroup = Boolean(selectedGroup);
            const { data } = await axios.post(`/api/messages/schedule/${targetId}`, {
                text,
                scheduledFor,
                isGroup
            });
            return data;
        } catch (e) {
            toast.error(e.message);
        }
    };

    const getScheduledMessages = async () => {
        try {
            const { data } = await axios.get('/api/messages/schedule/list');
            if (data.success) return data.scheduledMessages;
            return [];
        } catch (e) {
            return [];
        }
    };

    const cancelScheduledMessage = async (messageId) => {
        try {
            const { data } = await axios.delete(`/api/messages/schedule/cancel/${messageId}`);
            if (data.success) toast.success("Cancelled scheduled message");
        } catch (e) {
            toast.error(e.message);
        }
    };

    const translateMessage = async (text, targetLang) => {
        try {
            const { data } = await axios.post('/api/ai/translate', { text, targetLang });
            if (data.success) return data.translatedText;
            return text;
        } catch (e) {
            return text;
        }
    };

    const transcribeAudio = async (messageId) => {
        try {
            const { data } = await axios.post('/api/ai/transcribe', { messageId });
            if (data.success) {
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === messageId
                            ? { ...msg, transcription: data.transcription, summary: data.summary }
                            : msg
                    )
                );
                return data;
            }
        } catch (e) {
            toast.error("Could not transcribe audio");
        }
    };

    const markBurnerOpened = async (messageId) => {
        try {
            await axios.put(`/api/messages/burner/open/${messageId}`);
        } catch (e) {}
    };

    // Secret Vault PIN & Hidden Chats
    const [vaultPin, setVaultPinState] = useState(() => localStorage.getItem('syncwire_vault_pin') || '');
    const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
    const [hiddenChatIds, setHiddenChatIds] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('syncwire_hidden_chats') || '[]');
        } catch (e) {
            return [];
        }
    });

    const setVaultPin = (pin) => {
        setVaultPinState(pin);
        localStorage.setItem('syncwire_vault_pin', pin);
    };

    const unlockVault = (pin) => {
        if (pin === vaultPin || (!vaultPin && pin)) {
            setIsVaultUnlocked(true);
            return true;
        }
        return false;
    };

    const lockVault = () => {
        setIsVaultUnlocked(false);
    };

    const toggleHideChat = (chatId) => {
        setHiddenChatIds((prev) => {
            const next = prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId];
            localStorage.setItem('syncwire_hidden_chats', JSON.stringify(next));
            return next;
        });
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

        const handlePollUpdated = ({ messageId, poll }) => {
            setMessages((prev) =>
                prev.map((msg) => (msg._id === messageId ? { ...msg, poll } : msg))
            );
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("newGroupMessage", handleNewGroupMessage);
        socket.on("pollUpdated", handlePollUpdated);
        socket.on("messageReaction", handleMessageReaction);
        socket.on("messageDeleted", handleMessageDeleted);
        socket.on("userTyping", handleUserTyping);
        socket.on("userStopTyping", handleUserStopTyping);
        socket.on("messagesSeen", handleMessagesSeen);
        socket.on("userLastSeenUpdated", handleUserLastSeenUpdated);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("newGroupMessage", handleNewGroupMessage);
            socket.off("pollUpdated", handlePollUpdated);
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
        createPoll,
        votePoll,
        scheduleMessage,
        getScheduledMessages,
        cancelScheduledMessage,
        translateMessage,
        transcribeAudio,
        markBurnerOpened,
        vaultPin,
        setVaultPin,
        isVaultUnlocked,
        unlockVault,
        lockVault,
        hiddenChatIds,
        toggleHideChat,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
