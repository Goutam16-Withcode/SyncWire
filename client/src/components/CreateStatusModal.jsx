import React, { useContext, useRef, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { X, Camera, Send, Type, Music, Upload, Link as LinkIcon, Volume2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const GRADIENT_PRESETS = [
    'from-purple-600 to-indigo-700',
    'from-pink-600 to-rose-700',
    'from-emerald-600 to-teal-800',
    'from-cyan-600 to-blue-800',
    'from-amber-600 to-orange-800',
];

const MUSIC_PRESETS = [
    { id: 'none', title: 'No Music', artist: '' },
    { id: 'lofi', title: 'Lofi Sunset Vibes', artist: 'SyncBeats', audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-chill-bro-494.mp3' },
    { id: 'cosmic', title: 'Cosmic Ambient', artist: 'Aura Sound', audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3' },
    { id: 'summer', title: 'Summer Breeze', artist: 'Solar Wave', audioUrl: 'https://assets.mixkit.co/music/preview/mixkit-serene-view-443.mp3' },
];

const CreateStatusModal = ({ isOpen, onClose }) => {
    const { createStory } = useContext(ChatContext);

    const [statusType, setStatusType] = useState('text'); // 'text' | 'image'
    const [text, setText] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [caption, setCaption] = useState('');
    const [activeGradient, setActiveGradient] = useState(GRADIENT_PRESETS[0]);
    
    // Music Selection: preset | upload | url
    const [musicMode, setMusicMode] = useState('presets'); // 'presets' | 'upload' | 'url'
    const [selectedMusic, setSelectedMusic] = useState(MUSIC_PRESETS[0]);
    const [customAudioUrl, setCustomAudioUrl] = useState('');
    const [customAudioTitle, setCustomAudioTitle] = useState('');
    const [uploadedAudioBase64, setUploadedAudioBase64] = useState('');
    const [uploadedAudioName, setUploadedAudioName] = useState('');

    const audioFileRef = useRef(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleCustomAudioFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('audio/') && !file.name.match(/\.(mp3|wav|m4a|aac|ogg)$/i)) {
            toast.error("Please select an audio file (MP3, WAV, M4A, AAC, OGG)");
            return;
        }

        const fileName = file.name.replace(/\.[^/.]+$/, "");
        setUploadedAudioName(fileName);

        const reader = new FileReader();
        reader.onloadend = () => {
            setUploadedAudioBase64(reader.result);
            setSelectedMusic({
                id: `custom_upload_${Date.now()}`,
                title: fileName,
                artist: 'Custom Upload',
                audioUrl: reader.result
            });
            toast.success(`Loaded audio: "${fileName}"`);
        };
        reader.readAsDataURL(file);
    };

    const handleApplyCustomUrl = (e) => {
        e.preventDefault();
        const trimmedUrl = customAudioUrl.trim();
        if (!trimmedUrl) {
            toast.error("Please enter an audio link");
            return;
        }

        const title = customAudioTitle.trim() || 'Online Audio Track';
        setSelectedMusic({
            id: `custom_url_${Date.now()}`,
            title,
            artist: 'Web Audio',
            audioUrl: trimmedUrl
        });
        toast.success(`Music attached: "${title}"`);
    };

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
                musicTrack: selectedMusic.id !== 'none' ? selectedMusic : null,
            });

            toast.success("Status posted for 24 hours!");
            setText('');
            setImageFile(null);
            setCaption('');
            setSelectedMusic(MUSIC_PRESETS[0]);
            setCustomAudioUrl('');
            setCustomAudioTitle('');
            setUploadedAudioBase64('');
            setUploadedAudioName('');
            onClose();
        } catch (err) {
            toast.error(err.message || "Failed to post status");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
            <div className="bg-[#282142] border border-gray-600 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden text-white flex flex-col max-h-[92vh]">
                
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

                <form onSubmit={handlePostStatus} className="p-6 space-y-4 overflow-y-auto">
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
                            <div className={`w-full h-44 rounded-2xl bg-gradient-to-br ${activeGradient} p-6 flex items-center justify-center text-center shadow-inner relative`}>
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
                            <label htmlFor="story-file-input" className="block w-full h-44 rounded-2xl border-2 border-dashed border-gray-600 hover:border-violet-400 bg-[#1e1534] flex flex-col items-center justify-center cursor-pointer overflow-hidden transition relative">
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

                    {/* ================= MUSIC SOUNDTRACK SECTION ================= */}
                    <div className="space-y-2 pt-2 border-t border-gray-700/60">
                        <div className="flex items-center justify-between">
                            <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                                <Music size={13} className="text-violet-400" /> Background Music Soundtrack
                            </label>
                            
                            {selectedMusic.id !== 'none' && (
                                <span className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                                    <Check size={11} /> {selectedMusic.title}
                                </span>
                            )}
                        </div>

                        {/* Music Source Tabs: Presets | Upload Audio | Audio URL */}
                        <div className="flex bg-[#1e1534] p-1 rounded-xl border border-gray-700 text-xs">
                            <button
                                type="button"
                                onClick={() => setMusicMode('presets')}
                                className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                                    musicMode === 'presets' ? 'bg-violet-600/80 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                Presets
                            </button>
                            <button
                                type="button"
                                onClick={() => setMusicMode('upload')}
                                className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                                    musicMode === 'upload' ? 'bg-violet-600/80 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <Upload size={11} /> Upload File
                            </button>
                            <button
                                type="button"
                                onClick={() => setMusicMode('url')}
                                className={`flex-1 py-1 rounded-lg text-[11px] font-medium transition cursor-pointer flex items-center justify-center gap-1 ${
                                    musicMode === 'url' ? 'bg-violet-600/80 text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                <LinkIcon size={11} /> Audio Link
                            </button>
                        </div>

                        {/* TAB 1: PRESETS */}
                        {musicMode === 'presets' && (
                            <div className="grid grid-cols-2 gap-2">
                                {MUSIC_PRESETS.map((m) => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setSelectedMusic(m)}
                                        className={`p-2 rounded-xl text-left border transition cursor-pointer flex flex-col justify-center ${
                                            selectedMusic.id === m.id
                                                ? 'bg-violet-600/30 border-violet-400 text-white shadow-md'
                                                : 'bg-[#1e1534] border-gray-700/80 text-gray-400 hover:text-white'
                                        }`}
                                    >
                                        <span className="text-xs font-semibold truncate">{m.title}</span>
                                        {m.artist && <span className="text-[10px] text-gray-400 truncate">{m.artist}</span>}
                                    </button>
                                ))}
                            </div>
                        )}

                        {/* TAB 2: UPLOAD FROM DEVICE */}
                        {musicMode === 'upload' && (
                            <div className="space-y-2">
                                <input
                                    type="file"
                                    ref={audioFileRef}
                                    accept="audio/*,.mp3,.wav,.m4a,.aac,.ogg"
                                    onChange={handleCustomAudioFileUpload}
                                    hidden
                                />
                                <button
                                    type="button"
                                    onClick={() => audioFileRef.current?.click()}
                                    className="w-full py-3 bg-[#1e1534] hover:bg-[#251a42] border border-dashed border-violet-400/50 rounded-xl text-xs text-violet-300 font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
                                >
                                    <Upload size={14} />
                                    <span>{uploadedAudioName ? `Selected: ${uploadedAudioName}` : "Choose MP3/WAV/Audio from Device"}</span>
                                </button>
                                <p className="text-[10px] text-gray-400 text-center">Supports MP3, WAV, AAC, M4A, OGG from phone or computer</p>
                            </div>
                        )}

                        {/* TAB 3: PASTE AUDIO URL */}
                        {musicMode === 'url' && (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={customAudioTitle}
                                    onChange={(e) => setCustomAudioTitle(e.target.value)}
                                    placeholder="Track Title (e.g. My Favorite Song)..."
                                    className="w-full bg-[#1e1534] border border-gray-600 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500"
                                />
                                <div className="flex gap-2">
                                    <input
                                        type="url"
                                        value={customAudioUrl}
                                        onChange={(e) => setCustomAudioUrl(e.target.value)}
                                        placeholder="Paste direct audio URL (https://...mp3)..."
                                        className="flex-1 bg-[#1e1534] border border-gray-600 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCustomUrl}
                                        className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-xl transition cursor-pointer"
                                    >
                                        Attach
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

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
