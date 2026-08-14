import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "Group", default: null },
    text: { type: String },
    image: { type: String },
    audio: { type: String },
    messageType: { type: String, enum: ['text', 'image', 'audio'], default: 'text' },
    seen: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    isViewOnce: { type: Boolean, default: false },
    isViewed: { type: Boolean, default: false },
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