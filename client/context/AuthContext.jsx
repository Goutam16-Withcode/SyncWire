import { createContext, useEffect, useState } from "react";
import axios from 'axios';
import toast from "react-hot-toast";
import { io } from "socket.io-client";

const backendUrl = import.meta.env.VITE_BACKEND_URL;
axios.defaults.baseURL = backendUrl;

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem("token"));
    const [authUser, setAuthUser] = useState(null);
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    // Check if user is authenticated and if so, set the user data and connect the socket
    const checkAuth = async () => {
        try {
            const { data } = await axios.get("/api/auth/check");
            if (data.success) {
                setAuthUser(data.user);
                connectSocket(data.user);
            }
        } catch (error) {
            // Silently handle on initial load
        }
    };

    // Standard Email / Password Login
    const login = async (state, credentials) => {
        try {
            const { data } = await axios.post(`/api/auth/${state}`, credentials);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
                return { success: true };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        }
    };

    // Google Sign-in Login
    const googleLogin = async (googleUserData) => {
        try {
            const { data } = await axios.post("/api/auth/google", googleUserData);
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message || "Signed in with Google!");
                return { success: true };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            toast.error(error.message || "Google Sign-in failed");
            return { success: false, message: error.message };
        }
    };

    // 1. Send Phone OTP
    const sendPhoneOtp = async (phoneNumber) => {
        try {
            const { data } = await axios.post("/api/auth/send-otp", { phoneNumber });
            if (data.success) {
                toast.success(data.message);
                if (data.demoOtp) {
                    toast(`Dev Mode OTP: ${data.demoOtp}`, { duration: 8000 });
                }
                return { success: true, demoOtp: data.demoOtp };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        }
    };

    // 2. Verify Phone OTP
    const verifyPhoneOtp = async (phoneNumber, otp) => {
        try {
            const { data } = await axios.post("/api/auth/verify-otp", { phoneNumber, otp });
            if (data.success) {
                setAuthUser(data.userData);
                connectSocket(data.userData);
                axios.defaults.headers.common["token"] = data.token;
                setToken(data.token);
                localStorage.setItem("token", data.token);
                toast.success(data.message);
                return { success: true, isNewUser: data.isNewUser };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        }
    };

    // 3. Complete Phone Onboarding
    const completePhoneSignup = async (profileData) => {
        try {
            const { data } = await axios.post("/api/auth/complete-phone-signup", profileData);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Welcome to SyncWire!");
                return { success: true };
            } else {
                toast.error(data.message);
                return { success: false, message: data.message };
            }
        } catch (error) {
            toast.error(error.message);
            return { success: false, message: error.message };
        }
    };

    // Toggle Block User
    const toggleBlockUser = async (targetUserId) => {
        try {
            const { data } = await axios.post("/api/auth/toggle-block", { targetUserId });
            if (data.success) {
                toast.success(data.message);
                setAuthUser((prev) => ({
                    ...prev,
                    blockedUsers: data.isBlocked
                        ? [...(prev.blockedUsers || []), targetUserId]
                        : (prev.blockedUsers || []).filter((id) => id !== targetUserId),
                }));
            }
        } catch (error) {
            toast.error("Failed to update block status");
        }
    };

    // Logout
    const logout = async () => {
        localStorage.removeItem("token");
        setToken(null);
        setAuthUser(null);
        setOnlineUsers([]);
        axios.defaults.headers.common["token"] = null;
        toast.success("Logged out successfully");
        if (socket) socket.disconnect();
    };

    // Update Profile
    const updateProfile = async (body) => {
        try {
            const { data } = await axios.put("/api/auth/update-profile", body);
            if (data.success) {
                setAuthUser(data.user);
                toast.success("Profile updated successfully");
            }
        } catch (error) {
            toast.error(error.message);
        }
    };

    // Connect Socket
    const connectSocket = (userData) => {
        if (!userData || socket?.connected) return;
        const newSocket = io(backendUrl, {
            query: {
                userId: userData._id,
            }
        });
        newSocket.connect();
        setSocket(newSocket);

        newSocket.on("getOnlineUsers", (userIds) => {
            setOnlineUsers(userIds);
        });
    };

    useEffect(() => {
        if (token) {
            axios.defaults.headers.common["token"] = token;
        }
        checkAuth();
    }, []);

    const value = {
        axios,
        authUser,
        onlineUsers,
        socket,
        login,
        googleLogin,
        logout,
        updateProfile,
        sendPhoneOtp,
        verifyPhoneOtp,
        completePhoneSignup,
        toggleBlockUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};