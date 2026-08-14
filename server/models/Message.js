import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    receiverId: {type: mongoose.Schema.Types.ObjectId, ref: "User", required: true},
    text: { type: String },
    image: { type: String },
    audio: { type: String },
    messageType: { type: String, enum: ['text', 'image', 'audio'], default: 'text' },
    seen: { type: Boolean, default: false },
    reaction: { type: String, default: null }
}, {timestamps: true});

const Message = mongoose.model("Message", messageSchema);

export default Message;