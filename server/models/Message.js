import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    text: { type: String, default: "" },
    image: { type: String, default: "" },
    audio: { type: String, default: "" },
    messageType: { type: String, enum: ['text', 'image', 'audio', 'poll'], default: 'text' },
    seen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    
    // Self-Destructing / Burner (View-Once)
    isBurner: { type: Boolean, default: false },
    burnerOpenedAt: { type: Date, default: null },
    
    // Scheduled Message Queue
    isScheduled: { type: Boolean, default: false },
    scheduledFor: { type: Date, default: null },
    isDispatched: { type: Boolean, default: false },
    
    // Interactive Poll
    poll: {
        question: { type: String, default: "" },
        options: [
            {
                id: { type: String, required: true },
                text: { type: String, required: true },
                votes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
            }
        ],
        isAnonymous: { type: Boolean, default: false }
    },

    // AI Speech-to-Text & Live Translation Cache
    transcription: { type: String, default: "" },
    summary: { type: String, default: "" },
    translations: { type: Map, of: String, default: {} },

    replyTo: {
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: "Message" },
        text: { type: String },
        senderName: { type: String }
    },
    reactions: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            emoji: { type: String }
        }
    ]
}, { timestamps: true });

const Message = mongoose.model("Message", messageSchema);

export default Message;