import Group from "../models/Group.js";
import Message from "../models/Message.js";
import cloudinary from "../lib/cloudinary.js";

// Create a new group
export const createGroup = async (req, res) => {
    try {
        const { name, description, members, groupPic } = req.body;
        const admin = req.user._id;

        let parsedMembers = Array.isArray(members) ? members : JSON.parse(members || "[]");
        if (!parsedMembers.includes(admin.toString())) {
            parsedMembers.push(admin);
        }

        let groupPicUrl = "";
        if (groupPic) {
            const uploadRes = await cloudinary.uploader.upload(groupPic);
            groupPicUrl = uploadRes.secure_url;
        }

        const newGroup = await Group.create({
            name,
            description,
            groupPic: groupPicUrl,
            admin,
            members: parsedMembers,
        });

        const populatedGroup = await Group.findById(newGroup._id)
            .populate("members", "fullName email profilePic bio")
            .populate("admin", "fullName email profilePic");

        res.json({ success: true, group: populatedGroup });
    } catch (error) {
        console.error("Create group error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get all groups for current user
export const getUserGroups = async (req, res) => {
    try {
        const userId = req.user._id;
        const groups = await Group.find({ members: userId })
            .populate("members", "fullName email profilePic bio")
            .populate("admin", "fullName email profilePic")
            .sort({ updatedAt: -1 });

        // Fetch last message for each group
        const groupsWithLastMsg = await Promise.all(
            groups.map(async (grp) => {
                const lastMsg = await Message.findOne({ groupId: grp._id })
                    .sort({ createdAt: -1 })
                    .populate("senderId", "fullName");
                return {
                    ...grp.toObject(),
                    lastMessage: lastMsg || null,
                };
            })
        );

        res.json({ success: true, groups: groupsWithLastMsg });
    } catch (error) {
        console.error("Get groups error:", error);
        res.json({ success: false, message: error.message });
    }
};

// Get single group details
export const getGroupDetails = async (req, res) => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId)
            .populate("members", "fullName email profilePic bio")
            .populate("admin", "fullName email profilePic");

        if (!group) return res.json({ success: false, message: "Group not found" });
        res.json({ success: true, group });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
