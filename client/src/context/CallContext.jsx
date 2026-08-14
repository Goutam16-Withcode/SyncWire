import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const CallContext = createContext();

const ICE_SERVERS = {
    iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
    ]
};

export const CallProvider = ({ children }) => {
    const { socket, authUser } = useContext(AuthContext);

    const [callState, setCallState] = useState('idle'); // 'idle' | 'calling' | 'ringing' | 'connected'
    const [callData, setCallData] = useState(null); // { user, isVideo, from, signal, callerName, callerPic }
    const [isMuted, setIsMuted] = useState(false);
    const [isCameraOff, setIsCameraOff] = useState(false);
    const [isScreenSharing, setIsScreenSharing] = useState(false);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [callDuration, setCallDuration] = useState(0);

    const localStreamRef = useRef(null);
    const screenStreamRef = useRef(null);
    const remoteStreamRef = useRef(null);
    const peerConnectionRef = useRef(null);
    const callTimerRef = useRef(null);

    const localVideoRef = useRef(null);
    const remoteVideoRef = useRef(null);

    // Initialize local media stream
    const getMedia = async (isVideo = false) => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: isVideo,
                audio: true,
            });
            localStreamRef.current = stream;
            if (localVideoRef.current) {
                localVideoRef.current.srcObject = stream;
            }
            return stream;
        } catch (err) {
            toast.error("Could not access camera/microphone");
            return null;
        }
    };

    // Create RTCPeerConnection
    const createPeerConnection = (targetUserId) => {
        const pc = new RTCPeerConnection(ICE_SERVERS);
        peerConnectionRef.current = pc;

        // Add local tracks to peer connection
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((track) => {
                pc.addTrack(track, localStreamRef.current);
            });
        }

        // Handle remote stream tracks
        pc.ontrack = (event) => {
            if (event.streams && event.streams[0]) {
                remoteStreamRef.current = event.streams[0];
                if (remoteVideoRef.current) {
                    remoteVideoRef.current.srcObject = event.streams[0];
                }
            }
        };

        // Send ICE candidate to peer
        pc.onicecandidate = (event) => {
            if (event.candidate && socket) {
                socket.emit("iceCandidate", {
                    target: targetUserId,
                    candidate: event.candidate,
                });
            }
        };

        return pc;
    };

    // Start outgoing call
    const startCall = async (user, isVideo = false) => {
        if (!user || !socket) return;
        setCallData({ user, isVideo });
        setCallState('calling');

        const stream = await getMedia(isVideo);
        if (!stream) {
            setCallState('idle');
            return;
        }

        const pc = createPeerConnection(user._id);
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        socket.emit("callUser", {
            userToCall: user._id,
            signalData: offer,
            from: authUser._id,
            callerName: authUser.fullName,
            callerPic: authUser.profilePic,
            isVideo,
        });
    };

    // Accept incoming call
    const acceptCall = async () => {
        if (!callData || !socket) return;

        const stream = await getMedia(callData.isVideo);
        if (!stream) {
            rejectCall();
            return;
        }

        const pc = createPeerConnection(callData.from);
        await pc.setRemoteDescription(new RTCSessionDescription(callData.signal));

        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);

        socket.emit("answerCall", {
            signal: answer,
            to: callData.from,
        });

        setCallState('connected');
        startTimer();
    };

    // Reject incoming call
    const rejectCall = () => {
        if (callData && socket) {
            socket.emit("rejectCall", { to: callData.from });
        }
        cleanupCall();
    };

    // End active call
    const endCall = () => {
        if (callData && socket) {
            const partnerId = callData.user ? callData.user._id : callData.from;
            socket.emit("endCall", { to: partnerId });
        }
        cleanupCall();
    };

    // Toggle mute mic
    const toggleMute = () => {
        if (localStreamRef.current) {
            const audioTrack = localStreamRef.current.getAudioTracks()[0];
            if (audioTrack) {
                audioTrack.enabled = !audioTrack.enabled;
                setIsMuted(!audioTrack.enabled);
            }
        }
    };

    // Toggle camera on/off
    const toggleCamera = () => {
        if (localStreamRef.current) {
            const videoTrack = localStreamRef.current.getVideoTracks()[0];
            if (videoTrack) {
                videoTrack.enabled = !videoTrack.enabled;
                setIsCameraOff(!videoTrack.enabled);
            }
        }
    };

    // Screen Sharing via WebRTC
    const toggleScreenShare = async () => {
        try {
            if (isScreenSharing) {
                // Stop screen share & revert to webcam
                if (screenStreamRef.current) {
                    screenStreamRef.current.getTracks().forEach((t) => t.stop());
                    screenStreamRef.current = null;
                }
                const stream = await getMedia(true);
                if (stream && peerConnectionRef.current) {
                    const videoTrack = stream.getVideoTracks()[0];
                    const senders = peerConnectionRef.current.getSenders();
                    const sender = senders.find((s) => s.track && s.track.kind === 'video');
                    if (sender && videoTrack) {
                        sender.replaceTrack(videoTrack);
                    }
                }
                setIsScreenSharing(false);
                toast.success("Stopped screen sharing");
            } else {
                // Start screen share
                const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
                screenStreamRef.current = screenStream;
                const screenTrack = screenStream.getVideoTracks()[0];

                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = screenStream;
                }

                if (peerConnectionRef.current) {
                    const senders = peerConnectionRef.current.getSenders();
                    const sender = senders.find((s) => s.track && s.track.kind === 'video');
                    if (sender && screenTrack) {
                        sender.replaceTrack(screenTrack);
                    }
                }

                screenTrack.onended = () => {
                    toggleScreenShare();
                };

                setIsScreenSharing(true);
                toast.success("Sharing your screen");
            }
        } catch (err) {
            if (err.name !== 'NotAllowedError') {
                toast.error("Screen sharing was cancelled or not supported");
            }
            setIsScreenSharing(false);
        }
    };

    const startTimer = () => {
        setCallDuration(0);
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        callTimerRef.current = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
    };

    const cleanupCall = () => {
        if (callTimerRef.current) clearInterval(callTimerRef.current);
        if (localStreamRef.current) {
            localStreamRef.current.getTracks().forEach((t) => t.stop());
            localStreamRef.current = null;
        }
        if (screenStreamRef.current) {
            screenStreamRef.current.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
        }
        if (peerConnectionRef.current) {
            peerConnectionRef.current.close();
            peerConnectionRef.current = null;
        }
        remoteStreamRef.current = null;
        setCallState('idle');
        setCallData(null);
        setCallDuration(0);
        setIsMuted(false);
        setIsCameraOff(false);
        setIsScreenSharing(false);
        setIsWhiteboardOpen(false);
    };

    // Socket event listeners for calling
    useEffect(() => {
        if (!socket) return;

        const handleIncomingCall = (data) => {
            if (callState !== 'idle') {
                socket.emit("rejectCall", { to: data.from });
                return;
            }
            setCallData(data);
            setCallState('ringing');
        };

        const handleCallAccepted = async ({ signal }) => {
            if (peerConnectionRef.current) {
                await peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(signal));
                setCallState('connected');
                startTimer();
            }
        };

        const handleIceCandidate = async ({ candidate }) => {
            if (peerConnectionRef.current) {
                try {
                    await peerConnectionRef.current.addIceCandidate(new RTCIceCandidate(candidate));
                } catch (e) {
                    console.error("Error adding ice candidate", e);
                }
            }
        };

        const handleCallEnded = () => {
            toast('Call ended');
            cleanupCall();
        };

        const handleCallRejected = () => {
            toast.error('Call declined');
            cleanupCall();
        };

        socket.on("incomingCall", handleIncomingCall);
        socket.on("callAccepted", handleCallAccepted);
        socket.on("iceCandidate", handleIceCandidate);
        socket.on("callEnded", handleCallEnded);
        socket.on("callRejected", handleCallRejected);

        return () => {
            socket.off("incomingCall", handleIncomingCall);
            socket.off("callAccepted", handleCallAccepted);
            socket.off("iceCandidate", handleIceCandidate);
            socket.off("callEnded", handleCallEnded);
            socket.off("callRejected", handleCallRejected);
        };
    }, [socket, callState, callData]);

    const value = {
        callState,
        callData,
        isMuted,
        isCameraOff,
        isScreenSharing,
        isWhiteboardOpen,
        setIsWhiteboardOpen,
        callDuration,
        localVideoRef,
        remoteVideoRef,
        startCall,
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
    };

    return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
};
