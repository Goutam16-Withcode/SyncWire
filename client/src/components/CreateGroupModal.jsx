import React, { useContext, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import assets from '../assets/assets';
import { X, Camera, Users, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CreateGroupModal = ({ isOpen, onClose }) => {
    const { users, createGroup } = useContext(ChatContext);

    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [groupPic, setGroupPic] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const toggleMember = (userId) => {
        if (selectedMembers.includes(userId)) {
            setSelectedMembers((prev) => prev.filter((id) => id !== userId));
        } else {
            setSelectedMembers((prev) => [...prev, userId]);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            toast.error("Please enter a group name");
            return;
        }
        if (selectedMembers.length === 0) {
            toast.error("Please select at least 1 member");
            return;
        }

        setLoading(true);
        try {
            let picBase64 = null;
            if (groupPic) {
                picBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(groupPic);
                });
            }

            await createGroup({
                name: groupName.trim(),
                description: description.trim(),
                members: selectedMembers,
                groupPic: picBase64,
            });

            toast.success("Group created successfully!");
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
            <div className="bg-[#282142] border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-4 px-6 border-b border-gray-700/50 flex items-center justify-between">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        <Users size={20} className="text-violet-400" />
                        Create New Group
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-full transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleCreateGroup} className="flex-1 overflow-y-auto p-6 space-y-4">
                    {/* Group Avatar and Name */}
                    <div className="flex items-center gap-4">
                        <label htmlFor="group-pic-input" className="relative group cursor-pointer shrink-0">
                            <input 
                                type="file" 
                                id="group-pic-input" 
                                accept="image/*" 
                                onChange={(e) => setGroupPic(e.target.files[0])} 
                                hidden 
                            />
                            <div className="w-16 h-16 rounded-full bg-[#1e1534] border border-gray-600 flex items-center justify-center overflow-hidden">
                                {groupPic ? (
                                    <img src={URL.createObjectURL(groupPic)} alt="Group" className="w-full h-full object-cover" />
                                ) : (
                                    <Camera size={22} className="text-gray-400 group-hover:text-violet-400 transition" />
                                )}
                            </div>
                        </label>

                        <div className="flex-1 space-y-1">
                            <label className="text-xs text-gray-400">Group Name</label>
                            <input 
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                type="text" 
                                placeholder="Group Subject" 
                                required
                                className="w-full bg-[#1e1534] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                            />
                        </div>
                    </div>

                    {/* Group Description */}
                    <div className="space-y-1">
                        <label className="text-xs text-gray-400">Description (Optional)</label>
                        <input 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            type="text" 
                            placeholder="What is this group about?" 
                            className="w-full bg-[#1e1534] border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                        />
                    </div>

                    {/* Member Selection */}
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between items-center text-xs">
                            <label className="text-gray-400 font-medium">Select Members</label>
                            <span className="text-violet-400">{selectedMembers.length} selected</span>
                        </div>

                        <div className="max-h-48 overflow-y-auto space-y-1 pr-1 bg-[#1e1534]/60 p-2 rounded-xl border border-gray-700/50">
                            {users.length === 0 ? (
                                <p className="text-xs text-gray-500 p-2 text-center">No contacts available</p>
                            ) : (
                                users.map((user) => {
                                    const isSelected = selectedMembers.includes(user._id);
                                    return (
                                        <div 
                                            key={user._id}
                                            onClick={() => toggleMember(user._id)}
                                            className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition ${
                                                isSelected ? 'bg-violet-500/20 border border-violet-500/30' : 'hover:bg-[#282142]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={user.profilePic || assets.avatar_icon} 
                                                    alt={user.fullName} 
                                                    className="w-8 h-8 rounded-full object-cover" 
                                                />
                                                <span className="text-xs text-white font-medium">{user.fullName}</span>
                                            </div>

                                            <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition ${
                                                isSelected ? 'bg-violet-500 border-violet-500 text-white' : 'border-gray-600'
                                            }`}>
                                                {isSelected && <Check size={12} />}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {/* Submit button */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-xl text-sm font-medium cursor-pointer hover:opacity-90 transition shadow"
                        >
                            {loading ? "Creating..." : "Create Group"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
