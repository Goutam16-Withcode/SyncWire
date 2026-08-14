import { createContext, useContext, useEffect, useState, useRef } from "react";
import { AuthContext } from "./AuthContext";
import toast from "react-hot-toast";
import { sounds } from "../lib/sounds";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const [messages, setMessages] = useState([]);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [unseenMessages, setUnseenMessages] = useState({});
    const [lastMessages, setLastMessages] = useState({});
    const [typingUsers, setTypingUsers] = useState({}); // { [userId]: boolean }
    const [showContactInfo, setShowContactInfo] = useState(false);

    const { socket, axios, authUser } = useContext(AuthContext);
    const typingTimeoutRef = useRef(null);

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

    // Get messages for selected user
    const getMessages = async (userId) => {
        try {
            const { data } = await axios.get(`/api/messages/${userId}`);
            if (data.success) {
                setMessages(data.messages);
                // Clear unseen for this user
                setUnseenMessages((prev) => ({ ...prev, [userId]: 0 }));
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Send message (text, image, audio)
    const sendMessage = async (messageData) => {
        if (!selectedUser) return;
        try {
            // Stop typing immediately when sending
            sendStopTyping();
            
            const { data } = await axios.post(`/api/messages/send/${selectedUser._id}`, messageData);
            if (data.success) {
                setMessages((prevMessages) => [...prevMessages, data.newMessage]);
                // Update last message in sidebar
                setLastMessages((prev) => ({ ...prev, [selectedUser._id]: data.newMessage }));
                // Play WhatsApp sent chime
                sounds.playSent();
                return data.newMessage;
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Typing indicator helpers
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

        const handleNewMessage = (newMessage) => {
            const isFromCurrentChat = selectedUser && newMessage.senderId === selectedUser._id;

            if (isFromCurrentChat) {
                newMessage.seen = true;
                setMessages((prevMessages) => [...prevMessages, newMessage]);
                axios.put(`/api/messages/mark/${newMessage._id}`);
                // Emit mark seen back so sender gets blue ticks
                socket.emit("markSeen", { senderId: newMessage.senderId });
            } else {
                setUnseenMessages((prev) => ({
                    ...prev,
                    [newMessage.senderId]: (prev[newMessage.senderId] || 0) + 1,
                }));
            }

            // Update last message for sidebar
            setLastMessages((prev) => ({
                ...prev,
                [newMessage.senderId]: newMessage,
            }));

            // Play incoming sound
            sounds.playReceived();
        };

        const handleUserTyping = ({ senderId }) => {
            setTypingUsers((prev) => ({ ...prev, [senderId]: true }));
        };

        const handleUserStopTyping = ({ senderId }) => {
            setTypingUsers((prev) => ({ ...prev, [senderId]: false }));
        };

        const handleMessagesSeen = ({ byUserId }) => {
            // If the user who saw the messages is the active chat partner, turn sent ticks blue
            if (selectedUser && selectedUser._id === byUserId) {
                setMessages((prev) =>
                    prev.map((msg) => (msg.senderId === authUser?._id ? { ...msg, seen: true } : msg))
                );
            }
            // Update last message status if applicable
            setLastMessages((prev) => {
                const current = prev[byUserId];
                if (current && current.senderId === authUser?._id) {
                    return { ...prev, [byUserId]: { ...current, seen: true } };
                }
                return prev;
            });
        };

        socket.on("newMessage", handleNewMessage);
        socket.on("userTyping", handleUserTyping);
        socket.on("userStopTyping", handleUserStopTyping);
        socket.on("messagesSeen", handleMessagesSeen);

        return () => {
            socket.off("newMessage", handleNewMessage);
            socket.off("userTyping", handleUserTyping);
            socket.off("userStopTyping", handleUserStopTyping);
            socket.off("messagesSeen", handleMessagesSeen);
        };
    }, [socket, selectedUser, authUser]);

    const value = {
        messages,
        users,
        selectedUser,
        setSelectedUser,
        unseenMessages,
        setUnseenMessages,
        lastMessages,
        typingUsers,
        showContactInfo,
        setShowContactInfo,
        getUsers,
        getMessages,
        sendMessage,
        sendTyping,
        sendStopTyping,
    };

    return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};