import mongoose from "mongoose";

const storySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    media: { type: String, default: "" }, // image url
    text: { type: String, default: "" },
    caption: { type: String, default: "" },
    bgGradient: { type: String, default: "from-purple-600 to-indigo-700" },
    views: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
            fullName: { type: String, default: "" },
            profilePic: { type: String, default: "" },
            text: { type: String, required: true },
            createdAt: { type: Date, default: Date.now }
        }
    ],
    musicTrack: {
        id: { type: String, default: "" },
        title: { type: String, default: "" },
        artist: { type: String, default: "" },
        audioUrl: { type: String, default: "" }
    },
    createdAt: { type: Date, default: Date.now, expires: 86400 } // Auto-delete after 24h (86400s)
});

const Story = mongoose.model("Story", storySchema);

export default Story;
