import Story from "../models/Story.js";
import User from "../models/User.js";
import cloudinary from "../lib/cloudinary.js";

// Create / Post a new Story
export const createStory = async (req, res) => {
    try {
        const { media, text, caption, bgGradient, musicTrack } = req.body;
        const userId = req.user._id;

        let mediaUrl = "";
        if (media) {
            const uploadRes = await cloudinary.uploader.upload(media);
            mediaUrl = uploadRes.secure_url;
        }

        let finalMusicTrack = musicTrack;
        if (musicTrack && musicTrack.audioUrl && musicTrack.audioUrl.startsWith("data:")) {
            try {
                const audioUpload = await cloudinary.uploader.upload(musicTrack.audioUrl, {
                    resource_type: "video"
                });
                finalMusicTrack = {
                    ...musicTrack,
                    audioUrl: audioUpload.secure_url
                };
            } catch (e) {
                finalMusicTrack = musicTrack;
            }
        }

        const newStory = await Story.create({
            userId,
            media: mediaUrl,
            text: text || "",
            caption: caption || "",
            bgGradient: bgGradient || "from-purple-600 to-indigo-700",
            musicTrack: finalMusicTrack || null,
        });

        const populatedStory = await Story.findById(newStory._id)
            .populate("userId", "fullName profilePic");

        res.json({ success: true, story: populatedStory });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Get all active stories grouped by user
export const getActiveStories = async (req, res) => {
    try {
        const stories = await Story.find()
            .populate("userId", "fullName profilePic")
            .sort({ createdAt: -1 });

        // Group stories by userId
        const storiesByUser = {};
        stories.forEach((story) => {
            if (!story.userId) return;
            const uId = story.userId._id.toString();
            if (!storiesByUser[uId]) {
                storiesByUser[uId] = {
                    user: story.userId,
                    stories: [],
                };
            }
            storiesByUser[uId].stories.push(story);
        });

        res.json({ success: true, storiesByUser: Object.values(storiesByUser) });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// View a story
export const viewStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        await Story.findByIdAndUpdate(storyId, {
            $addToSet: { views: userId }
        });

        res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Toggle Like on Story
export const toggleLikeStory = async (req, res) => {
    try {
        const { storyId } = req.params;
        const userId = req.user._id;

        const story = await Story.findById(storyId);
        if (!story) {
            return res.json({ success: false, message: "Story not found" });
        }

        const isLiked = story.likes && story.likes.includes(userId);
        if (isLiked) {
            story.likes = story.likes.filter((id) => id.toString() !== userId.toString());
        } else {
            if (!story.likes) story.likes = [];
            story.likes.push(userId);
        }

        await story.save();
        res.json({ success: true, likes: story.likes, isLiked: !isLiked });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

// Add Comment on Story
export const addStoryComment = async (req, res) => {
    try {
        const { storyId } = req.params;
        const { text } = req.body;
        const user = req.user;

        if (!text || !text.trim()) {
            return res.json({ success: false, message: "Comment text cannot be empty" });
        }

        const story = await Story.findById(storyId);
        if (!story) {
            return res.json({ success: false, message: "Story not found" });
        }

        const newComment = {
            userId: user._id,
            fullName: user.fullName || "SyncWire User",
            profilePic: user.profilePic || "",
            text: text.trim(),
            createdAt: new Date(),
        };

        if (!story.comments) story.comments = [];
        story.comments.push(newComment);
        await story.save();

        res.json({ success: true, comment: newComment, comments: story.comments });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
