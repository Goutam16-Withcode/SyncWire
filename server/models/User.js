import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, sparse: true, unique: true },
    phoneNumber: { type: String, sparse: true, unique: true },
    fullName: { type: String, default: "" },
    password: { type: String },
    profilePic: { type: String, default: "" },
    bio: { type: String, default: "Hi Everyone, I am Using SyncWire" },
    lastSeen: { type: Date, default: Date.now },
    nicknames: { type: Map, of: String, default: {} },
    blockedUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true });

const User = mongoose.model("User", userSchema);

export default User;
