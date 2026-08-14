import React, { useContext, useState } from 'react';
import { CallContext } from '../../context/CallContext';
import assets from '../assets/assets';
import CallWhiteboard from './CallWhiteboard';

import { 
    Phone, 
    PhoneOff, 
    Video, 
    VideoOff, 
    Mic, 
    MicOff, 
    Maximize2,
    Minimize2,
    Repeat,
    Grid,
    User,
    Monitor,
    Edit3
} from 'lucide-react';

const CallModal = () => {
    const {
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
        acceptCall,
        rejectCall,
        endCall,
        toggleMute,
        toggleCamera,
        toggleScreenShare,
    } = useContext(CallContext);

    // View layout mode: 'pip' (normal PIP) | 'swapped' (self on main, remote in PIP) | 'split' (side by side)
    const [viewMode, setViewMode] = useState('pip');
    const [isFullscreen, setIsFullscreen] = useState(false);

    if (callState === 'idle') return null;

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(() => {});
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
                setIsFullscreen(false);
            }
        }
    };

    // Incoming Call Modal Popup
    if (callState === 'ringing') {
        return (
            <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
                <div className="bg-[#282142] border border-gray-600/80 rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center flex flex-col items-center gap-6">
                    <div className="relative">
                        <div className="absolute -inset-3 rounded-full bg-violet-500/30 animate-ping"></div>
                        <img 
                            src={callData?.callerPic || assets.avatar_icon} 
                            alt={callData?.callerName} 
                            className="w-24 h-24 rounded-full object-cover relative z-10 border-4 border-violet-400 shadow-2xl"
                        />
                    </div>

                    <div>
                        <h3 className="text-xl font-bold text-white">{callData?.callerName}</h3>
                        <p className="text-xs text-violet-300 mt-1.5 flex items-center justify-center gap-1.5 font-medium">
                            {callData?.isVideo ? <Video size={15} /> : <Phone size={15} />}
                            Incoming {callData?.isVideo ? 'HD Video' : 'Voice'} Call...
                        </p>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-8 pt-2">
                        {/* Decline */}
                        <button
                            type="button"
                            onClick={rejectCall}
                            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition cursor-pointer"
                            title="Decline"
                        >
                            <PhoneOff size={22} />
                        </button>

                        {/* Accept */}
                        <button
                            type="button"
                            onClick={acceptCall}
                            className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center shadow-xl hover:scale-110 active:scale-95 transition cursor-pointer animate-bounce"
                            title="Accept"
                        >
                            <Phone size={22} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Outgoing Calling State
    if (callState === 'calling') {
        const targetUser = callData?.user;
        return (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 animate-in fade-in duration-200 select-none">
                <div className="bg-[#282142] border border-gray-600/80 rounded-3xl shadow-2xl p-6 md:p-8 max-w-md w-full text-center flex flex-col items-center gap-5">
                    
                    {/* User info & pulsing badge */}
                    <div className="relative">
                        <div className="absolute -inset-3 rounded-full bg-violet-500/20 animate-pulse"></div>
                        <img 
                            src={targetUser?.profilePic || assets.avatar_icon} 
                            alt={targetUser?.fullName} 
                            className="w-20 h-20 rounded-full object-cover relative z-10 border-3 border-violet-400 shadow-xl"
                        />
                    </div>

                    <div>
                        <h3 className="text-lg font-bold text-white">{targetUser?.fullName}</h3>
                        <p className="text-xs text-gray-400 mt-1">Calling... (Waiting for answer)</p>
                    </div>

                    {/* Generous Large Local Camera Preview for Video Calls */}
                    {callData?.isVideo && (
                        <div className="w-full h-56 md:h-64 rounded-2xl overflow-hidden border-2 border-violet-400/80 shadow-2xl bg-black relative">
                            <video 
                                ref={localVideoRef} 
                                autoPlay 
                                playsInline 
                                muted 
                                className="w-full h-full object-cover" 
                                style={{ transform: 'scaleX(-1)' }}
                            />
                            <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[11px] text-white flex items-center gap-1.5 border border-white/10">
                                <Video size={12} className="text-violet-400" />
                                <span>Your Camera Preview</span>
                            </div>
                        </div>
                    )}

                    {/* End Call button */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={endCall}
                            className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition cursor-pointer"
                            title="Cancel Call"
                        >
                            <PhoneOff size={22} />
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Connected Active Call Modal
    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-between p-3 md:p-6 animate-in fade-in duration-200 select-none">
            
            {/* Top Header Bar */}
            <div className="w-full max-w-6xl flex items-center justify-between z-30 px-2">
                <div className="flex items-center gap-3">
                    <img 
                        src={callData?.user?.profilePic || callData?.callerPic || assets.avatar_icon} 
                        alt="" 
                        className="w-11 h-11 rounded-full object-cover border-2 border-violet-400 shadow-md"
                    />
                    <div>
                        <h3 className="text-sm md:text-base font-bold text-white">
                            {callData?.user?.fullName || callData?.callerName}
                        </h3>
                        <span className="text-xs font-mono text-emerald-400 font-semibold">{formatDuration(callDuration)}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {callData?.isVideo && (
                        <>
                            {/* Layout Switcher */}
                            <button
                                type="button"
                                onClick={() => setViewMode(viewMode === 'pip' ? 'swapped' : (viewMode === 'swapped' ? 'split' : 'pip'))}
                                className="px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs text-gray-200 border border-white/15 flex items-center gap-1.5 cursor-pointer transition"
                                title="Switch Video Layout"
                            >
                                <Repeat size={13} />
                                <span className="hidden sm:inline">
                                    {viewMode === 'pip' ? 'Swap View' : (viewMode === 'swapped' ? 'Split View' : 'Default View')}
                                </span>
                            </button>
                        </>
                    )}

                    <div className="px-3 py-1.5 bg-white/10 rounded-full text-xs text-gray-300 border border-white/15">
                        {callData?.isVideo ? 'HD Video' : 'Voice Call'}
                    </div>

                    <button
                        type="button"
                        onClick={toggleFullscreen}
                        className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white transition cursor-pointer"
                        title="Toggle Fullscreen"
                    >
                        {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                </div>
            </div>

            {/* Main Video / Voice Calling Area */}
            <div className="flex-1 w-full max-w-6xl relative flex items-center justify-center my-3 overflow-hidden rounded-3xl bg-[#110e1f] border border-gray-700/80 shadow-2xl">
                
                {/* Live Whiteboard Overlay */}
                <CallWhiteboard isOpen={isWhiteboardOpen} onClose={() => setIsWhiteboardOpen(false)} />

                {callData?.isVideo ? (
                    <>
                        {/* ================= LAYOUT 1: PIP DEFAULT ================= */}
                        {viewMode === 'pip' && (
                            <div className="w-full h-full relative flex items-center justify-center bg-black">
                                {/* Remote Stream (Main Screen) */}
                                <video 
                                    ref={remoteVideoRef} 
                                    autoPlay 
                                    playsInline 
                                    className="w-full h-full object-cover"
                                />

                                {/* Local Self Preview (Enlarged & Mirror-flipped) */}
                                <div 
                                    onClick={() => setViewMode('swapped')}
                                    className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-44 h-32 md:w-64 md:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-violet-400 bg-gray-900 cursor-pointer group hover:scale-105 transition-transform z-20"
                                    title="Click to expand your video"
                                >
                                    <video 
                                        ref={localVideoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className={`w-full h-full object-cover ${isCameraOff && !isScreenSharing ? 'hidden' : ''}`}
                                        style={!isScreenSharing ? { transform: 'scaleX(-1)' } : {}}
                                    />
                                    {isCameraOff && !isScreenSharing && (
                                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-xs text-gray-400 gap-1">
                                            <VideoOff size={18} />
                                            <span>Camera Off</span>
                                        </div>
                                    )}
                                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-md text-[10px] text-white opacity-80 group-hover:opacity-100">
                                        {isScreenSharing ? 'Sharing Screen' : 'You (Click to swap)'}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= LAYOUT 2: SWAPPED (Your Face / Screen on Main Screen) ================= */}
                        {viewMode === 'swapped' && (
                            <div className="w-full h-full relative flex items-center justify-center bg-black">
                                {/* Local Stream on Main Screen */}
                                <video 
                                    ref={localVideoRef} 
                                    autoPlay 
                                    playsInline 
                                    muted 
                                    className={`w-full h-full object-cover ${isCameraOff && !isScreenSharing ? 'hidden' : ''}`}
                                    style={!isScreenSharing ? { transform: 'scaleX(-1)' } : {}}
                                />
                                {isCameraOff && !isScreenSharing && (
                                    <div className="flex flex-col items-center justify-center text-gray-400 gap-2">
                                        <VideoOff size={32} />
                                        <span>Your Camera is Off</span>
                                    </div>
                                )}

                                {/* Remote in PIP */}
                                <div 
                                    onClick={() => setViewMode('pip')}
                                    className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-44 h-32 md:w-64 md:h-48 rounded-2xl overflow-hidden shadow-2xl border-2 border-violet-400 bg-gray-900 cursor-pointer group hover:scale-105 transition-transform z-20"
                                    title="Click to restore default view"
                                >
                                    <video 
                                        ref={remoteVideoRef} 
                                        autoPlay 
                                        playsInline 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded-md text-[10px] text-white">
                                        {callData?.user?.fullName || callData?.callerName} (Click to swap)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ================= LAYOUT 3: SPLIT (Side-by-Side 50/50) ================= */}
                        {viewMode === 'split' && (
                            <div className="w-full h-full grid grid-cols-1 md:grid-cols-2 gap-2 p-2 bg-black">
                                {/* Local Half */}
                                <div className="w-full h-full relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
                                    <video 
                                        ref={localVideoRef} 
                                        autoPlay 
                                        playsInline 
                                        muted 
                                        className={`w-full h-full object-cover ${isCameraOff && !isScreenSharing ? 'hidden' : ''}`}
                                        style={!isScreenSharing ? { transform: 'scaleX(-1)' } : {}}
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-xs text-white">
                                        {isScreenSharing ? 'Your Screen' : 'You'}
                                    </div>
                                </div>

                                {/* Remote Half */}
                                <div className="w-full h-full relative rounded-2xl overflow-hidden border border-gray-700 bg-gray-900">
                                    <video 
                                        ref={remoteVideoRef} 
                                        autoPlay 
                                        playsInline 
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 left-3 bg-black/60 px-2.5 py-1 rounded-lg text-xs text-white">
                                        {callData?.user?.fullName || callData?.callerName}
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    // Voice Call Visualizer
                    <div className="flex flex-col items-center gap-6">
                        <div className="relative">
                            <div className="absolute -inset-4 rounded-full bg-violet-500/20 animate-pulse"></div>
                            <img 
                                src={callData?.user?.profilePic || callData?.callerPic || assets.avatar_icon} 
                                alt="" 
                                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-4 border-violet-400 shadow-2xl relative z-10"
                            />
                        </div>
                        <div className="flex items-center gap-2 h-10">
                            <span className="w-2 h-6 bg-violet-400 rounded-full wave-bar"></span>
                            <span className="w-2 h-12 bg-violet-400 rounded-full wave-bar" style={{ animationDelay: '0.2s' }}></span>
                            <span className="w-2 h-5 bg-violet-400 rounded-full wave-bar" style={{ animationDelay: '0.4s' }}></span>
                            <span className="w-2 h-10 bg-violet-400 rounded-full wave-bar" style={{ animationDelay: '0.1s' }}></span>
                            <span className="w-2 h-7 bg-violet-400 rounded-full wave-bar" style={{ animationDelay: '0.3s' }}></span>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Controls Bar */}
            <div className="bg-[#282142]/90 backdrop-blur-xl border border-gray-600/80 px-6 md:px-8 py-3 rounded-full flex items-center gap-4 md:gap-6 shadow-2xl z-30">
                {/* Mute Mic */}
                <button
                    type="button"
                    onClick={toggleMute}
                    className={`p-3.5 rounded-full transition cursor-pointer ${isMuted ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
                    title={isMuted ? "Unmute Microphone" : "Mute Microphone"}
                >
                    {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
                </button>

                {/* Toggle Camera (if Video Call) */}
                {callData?.isVideo && (
                    <button
                        type="button"
                        onClick={toggleCamera}
                        className={`p-3.5 rounded-full transition cursor-pointer ${isCameraOff ? 'bg-red-500 text-white' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
                        title={isCameraOff ? "Turn Camera On" : "Turn Camera Off"}
                    >
                        {isCameraOff ? <VideoOff size={20} /> : <Video size={20} />}
                    </button>
                )}

                {/* Screen Share Button */}
                {callData?.isVideo && (
                    <button
                        type="button"
                        onClick={toggleScreenShare}
                        className={`p-3.5 rounded-full transition cursor-pointer ${isScreenSharing ? 'bg-cyan-500 text-white shadow-lg' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
                        title={isScreenSharing ? "Stop Screen Sharing" : "Share Screen"}
                    >
                        <Monitor size={20} />
                    </button>
                )}

                {/* Whiteboard Button */}
                <button
                    type="button"
                    onClick={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                    className={`p-3.5 rounded-full transition cursor-pointer ${isWhiteboardOpen ? 'bg-violet-600 text-white shadow-lg' : 'bg-white/10 text-gray-200 hover:bg-white/20'}`}
                    title={isWhiteboardOpen ? "Close Whiteboard" : "Open Whiteboard"}
                >
                    <Edit3 size={20} />
                </button>

                {/* End Call */}
                <button
                    type="button"
                    onClick={endCall}
                    className="p-3.5 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-xl hover:scale-110 active:scale-95 transition cursor-pointer"
                    title="End Call"
                >
                    <PhoneOff size={20} />
                </button>
            </div>

        </div>
    );
};

export default CallModal;
