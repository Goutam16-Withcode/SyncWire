import React, { useContext, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { X, Camera, Send, Type } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADIENT_PRESETS = [
    'from-purple-600 to-indigo-700',
    'from-pink-600 to-rose-700',
    'from-emerald-600 to-teal-800',
    'from-cyan-600 to-blue-800',
    'from-amber-600 to-orange-800',
];

const CreateStatusModal = ({ isOpen, onClose }) => {
    const { createStory } = useContext(ChatContext);

    const [statusType, setStatusType] = useState('text'); // 'text' | 'image'
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [activeGradient, setActiveGradient] = useState(GRADIENT_PRESETS[0]);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handlePostStatus = async (e) => {
        e.preventDefault();
        if (statusType === 'text' && !text.trim()) {
            toast.error("Please enter some text");
            return;
        }
        if (statusType === 'image' && !imageFile) {
            toast.error("Please select a photo");
            return;
        }

        setLoading(true);
        try {
            let imageBase64 = "";
            if (imageFile) {
                imageBase64 = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(imageFile);
                });
            }

            await createStory({
                text: text.trim(),
                media: imageBase64,
                caption: caption.trim(),
                bgGradient: activeGradient,
            });

            toast.success("Status posted for 24 hours!");
            setText('');
            setImageFile(null);
            setCaption('');
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to post status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
            <div className="bg-[#282142] border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white flex flex-col max-h-[90vh]">
                
                {/* Header */}
                <div className="p-4 px-6 border-b border-gray-700/50 flex items-center justify-between">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        Add to Status / Story
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-full transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handlePostStatus} className="p-6 space-y-4">
                    {/* Status Type Toggle */}
                    <div className="flex bg-[#1e1534] p-1 rounded-xl border border-gray-700">
                        <button
                            type="button"
                            onClick={() => setStatusType('text')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                statusType === 'text' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Type size={14} /> Text Status
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatusType('image')}
                            className={`flex-1 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1.5 transition cursor-pointer ${
                                statusType === 'image' ? 'bg-violet-600 text-white' : 'text-gray-400 hover:text-white'
                            }`}
                        >
                            <Camera size={14} /> Photo Status
                        </button>
                    </div>

                    {statusType === 'text' ? (
                        <>
                            {/* Text Status Preview Canvas */}
                            <div className={`w-full h-48 rounded-2xl bg-gradient-to-br ${activeGradient} p-6 flex items-center justify-center text-center shadow-inner relative`}>
                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Type a status update..."
                                    rows={4}
                                    className="bg-transparent border-none outline-none text-white text-lg font-medium text-center placeholder-white/60 resize-none w-full max-w-xs"
                                />
                            </div>

                            {/* Color Palette Selector */}
                            <div className="flex items-center justify-center gap-2 pt-1">
                                {GRADIENT_PRESETS.map((grad, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => setActiveGradient(grad)}
                                        className={`w-7 h-7 rounded-full bg-gradient-to-br ${grad} border-2 transition cursor-pointer ${
                                            activeGradient === grad ? 'border-white scale-110' : 'border-transparent'
                                        }`}
                                    />
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* Photo Upload Canvas */}
                            <label htmlFor="story-file-input" className="block w-full h-48 rounded-2xl border-2 border-dashed border-gray-600 hover:border-violet-400 bg-[#1e1534] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition relative">
                                <input
                                    type="file"
                                    id="story-file-input"
                                    accept="image/*"
                                    onChange={(e) => setImageFile(e.target.files[0])}
                                    hidden
                                />
                                {imageFile ? (
                                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="flex flex-col items-center gap-2 text-gray-400">
                                        <Camera size={32} className="text-violet-400" />
                                        <span className="text-xs">Click to select photo</span>
                                    </div>
                                )}
                            </label>

                            <input
                                type="text"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                                placeholder="Add a caption..."
                                className="w-full bg-[#1e1534] border border-gray-600 rounded-xl p-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
                            />
                        </>
                    )}

                    {/* Submit button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-400 to-violet-600 text-white rounded-xl text-sm font-semibold cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2 shadow mt-2"
                    >
                        <Send size={16} />
                        {loading ? "Posting..." : "Share to Status (24 Hours)"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateStatusModal;
