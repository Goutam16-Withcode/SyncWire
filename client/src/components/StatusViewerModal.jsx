import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Users, Music } from 'lucide-react';
import assets from '../assets/assets';
import { formatMessageTime } from '../lib/utils';
import toast from 'react-hot-toast';

const StatusViewerModal = ({ userStoriesGroup, onClose }) => {
    const { axios, authUser } = useContext(AuthContext);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [localStories, setLocalStories] = useState([]);

    const stories = localStories.length > 0 ? localStories : (userStoriesGroup?.stories || []);
    const currentStory = stories[currentIndex];
    const user = userStoriesGroup?.user;

    // Initialize stories
    useEffect(() => {
        if (userStoriesGroup?.stories) {
            setLocalStories(userStoriesGroup.stories);
        }
        setCurrentIndex(0);
        setProgress(0);
        setShowComments(false);
        setCommentText('');
    }, [userStoriesGroup]);

    // Auto-advance progress timer
    useEffect(() => {
        if (!userStoriesGroup || stories.length === 0 || isPaused || showComments) return;

        const interval = 50; // ms
        const duration = 6000; // 6s per story
        const step = (interval / duration) * 100;

        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    if (currentIndex < stories.length - 1) {
                        setCurrentIndex((c) => c + 1);
                        return 0;
                    } else {
                        clearInterval(timer);
                        onClose();
                        return 100;
                    }
                }
                return prev + step;
            });
        }, interval);

        // Mark view in backend
        if (currentStory && currentStory._id) {
            axios.put(`/api/stories/view/${currentStory._id}`).catch(() => {});
        }

        return () => clearInterval(timer);
    }, [currentIndex, userStoriesGroup, onClose, isPaused, showComments, stories.length]);

    if (!userStoriesGroup || stories.length === 0) {
        return null;
    }

    const isLiked = currentStory?.likes && currentStory.likes.some((id) => id === authUser?._id || id?._id === authUser?._id);
    const likesCount = currentStory?.likes?.length || 0;
    const commentsList = currentStory?.comments || [];

    const handlePrev = (e) => {
        if (e) e.stopPropagation();
        if (currentIndex > 0) {
            setCurrentIndex((c) => c - 1);
            setProgress(0);
            setShowComments(false);
        }
    };

    const handleNext = (e) => {
        if (e) e.stopPropagation();
        if (currentIndex < stories.length - 1) {
            setCurrentIndex((c) => c + 1);
            setProgress(0);
            setShowComments(false);
        } else {
            onClose();
        }
    };

    // Toggle Like
    const handleToggleLike = async (e) => {
        e.stopPropagation();
        if (!currentStory?._id) return;

        try {
            const { data } = await axios.put(`/api/stories/like/${currentStory._id}`);
            if (data.success) {
                setLocalStories((prev) =>
                    prev.map((s, idx) => (idx === currentIndex ? { ...s, likes: data.likes } : s))
                );
                if (data.isLiked) {
                    toast.success("Liked status");
                }
            }
        } catch (error) {
            toast.error("Failed to like status");
        }
    };

    // Post Comment
    const handleSendComment = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (!commentText.trim() || !currentStory?._id) return;

        try {
            const { data } = await axios.post(`/api/stories/comment/${currentStory._id}`, {
                text: commentText.trim(),
            });

            if (data.success) {
                setLocalStories((prev) =>
                    prev.map((s, idx) => (idx === currentIndex ? { ...s, comments: data.comments } : s))
                );
                setCommentText('');
                toast.success("Comment posted!");
            }
        } catch (error) {
            toast.error("Failed to post comment");
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-2 sm:p-4 select-none animate-in fade-in duration-150">
            <div className="w-full max-w-md h-[90vh] max-h-[700px] bg-[#1e1534] rounded-3xl overflow-hidden relative shadow-2xl flex flex-col justify-between border border-gray-700/60">
                
                {/* Top Header with Progress Bars & User Info */}
                <div className="p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent z-30 space-y-3">
                    {/* Story Progress Indicators */}
                    <div className="flex items-center gap-1.5 w-full">
                        {stories.map((s, idx) => (
                            <div key={idx} className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-white transition-all duration-75"
                                    style={{
                                        width: idx < currentIndex ? '100%' : (idx === currentIndex ? `${progress}%` : '0%')
                                    }}
                                />
                            </div>
                        ))}
                    </div>

                    {/* User profile & close */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img
                                src={user?.profilePic || assets.avatar_icon}
                                alt={user?.fullName}
                                className="w-10 h-10 rounded-full object-cover border-2 border-violet-400"
                            />
                            <div>
                                <h3 className="text-sm font-semibold text-white leading-tight">
                                    {user?.fullName}
                                </h3>
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] text-gray-300">
                                        {formatMessageTime(currentStory?.createdAt)}
                                    </span>
                                    {currentStory?.musicTrack && (
                                        <span className="flex items-center gap-1 text-[10px] text-violet-300 bg-violet-500/20 px-2 py-0.5 rounded-full border border-violet-500/30">
                                            <Music size={10} className="animate-pulse" /> {currentStory.musicTrack.title}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Hidden Audio Player for Soundtrack */}
                        {currentStory?.musicTrack?.audioUrl && (
                            <audio 
                                src={currentStory.musicTrack.audioUrl} 
                                autoPlay 
                                loop 
                                className="hidden"
                            />
                        )}

                        <button
                            onClick={onClose}
                            className="p-1.5 text-gray-300 hover:text-white rounded-full bg-black/40 hover:bg-black/60 transition cursor-pointer"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Main Story Content Display */}
                <div className="flex-1 w-full relative flex items-center justify-center overflow-hidden">
                    {/* Tap zones for Prev & Next */}
                    <div onClick={handlePrev} className="absolute left-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"></div>
                    <div onClick={handleNext} className="absolute right-0 top-0 bottom-0 w-1/3 z-10 cursor-pointer"></div>

                    {currentStory?.media ? (
                        <div className="w-full h-full relative flex items-center justify-center bg-black">
                            <img
                                src={currentStory.media}
                                alt="Story"
                                className="w-full h-full object-contain"
                            />
                            {currentStory.caption && (
                                <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md p-3 rounded-2xl text-center text-xs text-white shadow-lg border border-white/10 z-20">
                                    {currentStory.caption}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${currentStory?.bgGradient || 'from-purple-600 to-indigo-700'} p-8 flex items-center justify-center text-center`}>
                            <p className="text-xl font-medium text-white select-text leading-relaxed">
                                {currentStory?.text}
                            </p>
                        </div>
                    )}

                    {/* Comments Overlay Drawer (when open) */}
                    {showComments && (
                        <div 
                            className="absolute inset-0 bg-black/85 backdrop-blur-md z-25 p-4 flex flex-col justify-between animate-in slide-in-from-bottom duration-200"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between pb-3 border-b border-white/15">
                                <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                                    <MessageCircle size={16} className="text-violet-400" />
                                    <span>Comments ({commentsList.length})</span>
                                </h4>
                                <button
                                    onClick={() => setShowComments(false)}
                                    className="p-1 text-gray-400 hover:text-white rounded-full transition cursor-pointer"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Comment list */}
                            <div className="flex-1 overflow-y-auto py-3 space-y-3 pr-1">
                                {commentsList.length === 0 ? (
                                    <p className="text-xs text-gray-400 text-center py-8">
                                        No comments yet. Be the first to reply!
                                    </p>
                                ) : (
                                    commentsList.map((c, i) => (
                                        <div key={i} className="flex gap-2.5 items-start bg-white/5 p-2.5 rounded-xl border border-white/10">
                                            <img
                                                src={c.profilePic || assets.avatar_icon}
                                                alt=""
                                                className="w-7 h-7 rounded-full object-cover shrink-0 border border-violet-400/50"
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <span className="text-xs font-semibold text-violet-300">{c.fullName}</span>
                                                    <span className="text-[10px] text-gray-400">{formatMessageTime(c.createdAt)}</span>
                                                </div>
                                                <p className="text-xs text-gray-200 mt-0.5">{c.text}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Left and Right Nav buttons */}
                {currentIndex > 0 && (
                    <button
                        onClick={handlePrev}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition z-20 cursor-pointer shadow-lg"
                    >
                        <ChevronLeft size={18} />
                    </button>
                )}
                {currentIndex < stories.length - 1 && (
                    <button
                        onClick={handleNext}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 transition z-20 cursor-pointer shadow-lg"
                    >
                        <ChevronRight size={18} />
                    </button>
                )}

                {/* Bottom Interactive Bar: Like & Comment Input */}
                <div 
                    className="p-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-30 flex items-center gap-2 border-t border-white/10"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Comment Form */}
                    <form onSubmit={handleSendComment} className="flex-1 flex items-center bg-white/15 backdrop-blur-md rounded-full px-3.5 py-1.5 border border-white/20 shadow-inner">
                        <input
                            type="text"
                            value={commentText}
                            onFocus={() => setIsPaused(true)}
                            onBlur={() => setIsPaused(false)}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Reply to status..."
                            className="flex-1 bg-transparent text-xs text-white placeholder-gray-300 focus:outline-none"
                        />
                        {commentText.trim() && (
                            <button
                                type="submit"
                                className="p-1 text-violet-300 hover:text-white transition cursor-pointer"
                            >
                                <Send size={14} />
                            </button>
                        )}
                    </form>

                    {/* View Comments Drawer Button */}
                    <button
                        type="button"
                        onClick={() => setShowComments(!showComments)}
                        className={`p-2.5 rounded-full backdrop-blur-md border transition cursor-pointer flex items-center gap-1 text-xs ${
                            showComments || commentsList.length > 0
                                ? 'bg-violet-600/40 text-violet-200 border-violet-400/50'
                                : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                        }`}
                        title="View Comments"
                    >
                        <MessageCircle size={16} />
                        {commentsList.length > 0 && <span className="font-semibold text-[11px]">{commentsList.length}</span>}
                    </button>

                    {/* Like Button */}
                    <button
                        type="button"
                        onClick={handleToggleLike}
                        className={`p-2.5 rounded-full backdrop-blur-md border transition cursor-pointer flex items-center gap-1 text-xs ${
                            isLiked
                                ? 'bg-red-500/30 text-red-400 border-red-400/50 scale-105'
                                : 'bg-white/15 text-white border-white/20 hover:bg-white/25'
                        }`}
                        title={isLiked ? "Unlike" : "Like"}
                    >
                        <Heart size={16} className={isLiked ? "fill-red-500 text-red-500" : ""} />
                        {likesCount > 0 && <span className="font-semibold text-[11px]">{likesCount}</span>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default StatusViewerModal;
