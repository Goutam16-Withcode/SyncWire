import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { THEME_PRESETS, WALLPAPER_PATTERNS } from '../components/ThemeModal';
import { 
    ArrowLeft, 
    Camera, 
    Edit2, 
    Check, 
    User, 
    Info, 
    Phone, 
    ShieldCheck, 
    LogOut,
    Palette,
    Type,
    Bell,
    Volume2,
    VolumeX,
    Lock,
    Eye,
    MessageSquare,
    CornerDownLeft,
    Sparkles,
    Trash2,
    Database,
    CheckCircle2,
    Sliders,
    Smartphone,
    Clock,
    Zap,
    Bot,
    Image as ImageIcon
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_PRESETS = [
    "Available",
    "Busy",
    "At school",
    "At work",
    "Battery about to die",
    "In a meeting",
    "At the gym",
    "Sleeping",
    "Urgent calls only",
    "Can't talk, SyncWire only"
];

const FONT_SIZES = [
    { id: 'small', label: 'Small', sizePx: '13.5px', desc: 'Compact view, fits more messages on screen' },
    { id: 'medium', label: 'Medium (Default)', sizePx: '15px', desc: 'Balanced standard size for all devices' },
    { id: 'large', label: 'Large', sizePx: '17px', desc: 'Relaxed reading with prominent text' },
    { id: 'xlarge', label: 'Extra Large', sizePx: '19px', desc: 'Maximum legibility and comfort' },
];

const ProfilePage = () => {
    const { authUser, updateProfile, logout } = useContext(AuthContext);
    const { 
        activeTheme, 
        setActiveTheme, 
        appSettings, 
        updateSetting 
    } = useContext(ChatContext);

    const [selectedImg, setSelectedImg] = useState(null);
    const [name, setName] = useState(authUser?.fullName || "");
    const [bio, setBio] = useState(authUser?.bio || "Hi Everyone, I am Using SyncWire");
    const [isEditingName, setIsEditingName] = useState(false);
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('all'); // 'all' | 'profile' | 'appearance' | 'chats' | 'privacy'
    const navigate = useNavigate();

    const handleSaveProfile = async (customName = null, customBio = null, customImg = null) => {
        setLoading(true);
        try {
            const nameToSave = customName !== null ? customName : name;
            const bioToSave = customBio !== null ? customBio : bio;
            const imageToProcess = customImg || selectedImg;

            if (!imageToProcess) {
                await updateProfile({ fullName: nameToSave, bio: bioToSave });
                setIsEditingName(false);
                setIsEditingBio(false);
                return;
            }

            const reader = new FileReader();
            reader.readAsDataURL(imageToProcess);
            reader.onload = async () => {
                const base64Image = reader.result;
                await updateProfile({ profilePic: base64Image, fullName: nameToSave, bio: bioToSave });
                setIsEditingName(false);
                setIsEditingBio(false);
            };
        } finally {
            setLoading(false);
        }
    };

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImg(file);
            handleSaveProfile(null, null, file);
        }
    };

    const handleThemeChange = (theme) => {
        setActiveTheme(theme);
        toast.success(`Theme switched to ${theme.name}`);
    };

    const handleFontSizeChange = (sizeId) => {
        updateSetting('fontSize', sizeId);
        toast.success(`Font size updated to ${sizeId.toUpperCase()}`);
    };

    const handleClearStorage = () => {
        if (window.confirm("Are you sure you want to clear temporary chat cache and settings? (Your account will remain safe)")) {
            localStorage.removeItem('quickchat_settings');
            localStorage.removeItem('quickchat_theme');
            toast.success("Cache & Preferences reset to default");
            setTimeout(() => window.location.reload(), 800);
        }
    };

    const currentFontSize = appSettings?.fontSize || 'medium';

    return (
        <div className={`min-h-screen ${activeTheme?.appBgClass || "bg-[url('/bgImage.svg')] bg-cover"} flex flex-col select-none text-white transition-all duration-300`}>
            
            {/* Top Navigation Bar */}
            <div className="backdrop-blur-xl bg-black/40 border-b border-white/10 px-4 md:px-8 py-3.5 flex items-center justify-between shadow-xl sticky top-0 z-20">
                <div className="flex items-center gap-3 md:gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2 rounded-xl hover:bg-white/10 transition cursor-pointer text-gray-200 hover:text-white flex items-center gap-1.5"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium hidden sm:inline">Back to Chats</span>
                    </button>
                    <div className="h-5 w-px bg-white/20"></div>
                    <div className="flex items-center gap-2">
                        <Sliders size={18} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                        <h1 className="text-base md:text-lg font-bold tracking-wide">
                            Settings & Preferences
                        </h1>
                    </div>
                </div>

                {/* Active Theme & Font Pill */}
                <div className="flex items-center gap-2">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs text-gray-300">
                        <Type size={13} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                        <span className="capitalize">{currentFontSize} Text</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-white">
                        <Palette size={13} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                        <span>{activeTheme?.name || 'Purple Velvet'}</span>
                    </div>
                </div>
            </div>

            {/* Quick Filter Tabs for Long Settings */}
            <div className="backdrop-blur-md bg-black/20 border-b border-white/5 px-4 md:px-8 py-2.5 flex items-center gap-2 overflow-x-auto scrollbar-none sticky top-[57px] z-10">
                {[
                    { id: 'all', label: 'All Settings' },
                    { id: 'profile', label: 'Profile & Bio' },
                    { id: 'font', label: 'Font & Display' },
                    { id: 'theme', label: 'Themes' },
                    { id: 'chats', label: 'Chat & Input' },
                    { id: 'notifications', label: 'Notifications' },
                    { id: 'privacy', label: 'Privacy & Security' },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                            activeTab === tab.id
                                ? 'bg-white/20 text-white font-semibold shadow-sm border border-white/20'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                        }`}
                        style={activeTab === tab.id ? { borderColor: activeTheme?.accentColor || '#8b5cf6' } : {}}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex justify-center py-6 px-4 overflow-y-auto">
                <div className="w-full max-w-2xl space-y-6 pb-12">
                    
                    {/* ================= SECTION: PROFILE IDENTITY ================= */}
                    {(activeTab === 'all' || activeTab === 'profile') && (
                        <>
                            {/* Avatar & Header Card */}
                            <div className="relative backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden">
                                <div 
                                    className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
                                    style={{ backgroundColor: activeTheme?.accentColor || '#8b5cf6' }}
                                ></div>

                                <label htmlFor="avatar-picker" className="relative cursor-pointer group mb-3">
                                    <input 
                                        onChange={handleImageSelect}
                                        type="file" 
                                        id="avatar-picker" 
                                        accept="image/*" 
                                        hidden 
                                    />
                                    <div 
                                        className="w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-4 transition-all duration-300 shadow-2xl relative"
                                        style={{ borderColor: activeTheme?.accentColor || '#8b5cf6' }}
                                    >
                                        <img 
                                            src={selectedImg ? URL.createObjectURL(selectedImg) : (authUser?.profilePic || assets.avatar_icon)} 
                                            alt="Profile" 
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-200 text-[11px] font-semibold gap-1">
                                            <Camera size={22} className="text-white" />
                                            <span>CHANGE</span>
                                        </div>
                                    </div>
                                    <div 
                                        className="absolute bottom-0 right-0 w-9 h-9 rounded-full flex items-center justify-center border-2 border-black/80 shadow-lg text-white group-hover:scale-110 transition-transform"
                                        style={{ backgroundColor: activeTheme?.accentColor || '#8b5cf6' }}
                                    >
                                        <Camera size={16} />
                                    </div>
                                </label>

                                <h2 className="text-xl font-bold tracking-tight text-white mt-1">
                                    {authUser?.fullName || "Your Name"}
                                </h2>
                                <p className="text-xs text-gray-300 mt-1 max-w-sm">
                                    {authUser?.bio || "Hi Everyone, I am Using SyncWire"}
                                </p>
                            </div>

                            {/* Display Name Card */}
                            <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                        <User size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                        <span>Display Name</span>
                                    </div>
                                    {!isEditingName ? (
                                        <button
                                            onClick={() => setIsEditingName(true)}
                                            className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-xs"
                                        >
                                            <Edit2 size={14} /> <span>Edit</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSaveProfile()}
                                            disabled={loading}
                                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 rounded-lg cursor-pointer transition flex items-center gap-1.5 text-xs font-semibold"
                                        >
                                            <Check size={14} /> Save
                                        </button>
                                    )}
                                </div>

                                {isEditingName ? (
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400 transition"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-base text-white font-medium pl-0.5">
                                        {authUser?.fullName || "Not set"}
                                    </p>
                                )}
                            </div>

                            {/* About / Bio Card */}
                            <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                        <Info size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                        <span>About & Status</span>
                                    </div>
                                    {!isEditingBio ? (
                                        <button
                                            onClick={() => setIsEditingBio(true)}
                                            className="text-gray-300 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition cursor-pointer flex items-center gap-1 text-xs"
                                        >
                                            <Edit2 size={14} /> <span>Edit</span>
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleSaveProfile()}
                                            disabled={loading}
                                            className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-400/40 text-emerald-300 rounded-lg cursor-pointer transition flex items-center gap-1.5 text-xs font-semibold"
                                        >
                                            <Check size={14} /> Save
                                        </button>
                                    )}
                                </div>

                                {isEditingBio ? (
                                    <input
                                        type="text"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400 transition"
                                        autoFocus
                                    />
                                ) : (
                                    <p className="text-sm text-gray-200 pl-0.5 leading-relaxed font-normal">
                                        {authUser?.bio || "Hi Everyone, I am Using SyncWire"}
                                    </p>
                                )}

                                {/* Status Preset Chips */}
                                <div className="pt-1">
                                    <p className="text-[11px] text-gray-400 mb-2.5 font-medium">Quick status presets:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_PRESETS.map((statusPreset, idx) => {
                                            const isSelected = authUser?.bio === statusPreset;
                                            return (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => {
                                                        setBio(statusPreset);
                                                        handleSaveProfile(null, statusPreset);
                                                    }}
                                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer border ${
                                                        isSelected
                                                            ? 'bg-white/20 text-white border-white shadow-md scale-105'
                                                            : 'bg-black/30 hover:bg-white/10 text-gray-300 border-white/10'
                                                    }`}
                                                    style={isSelected ? { borderColor: activeTheme?.accentColor || '#8b5cf6' } : {}}
                                                >
                                                    {statusPreset}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </>
                    )}

                    {/* ================= SECTION: FONT SIZE & TYPOGRAPHY ================= */}
                    {(activeTab === 'all' || activeTab === 'font') && (
                        <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                    <Type size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                    <span>Font Size & Reading Experience</span>
                                </div>
                                <span className="text-xs text-gray-400 font-mono">
                                    Current: {currentFontSize.toUpperCase()}
                                </span>
                            </div>

                            <p className="text-xs text-gray-300 leading-relaxed">
                                Adjust the system-wide font size for all chats, message bubbles, sidebar contacts, and dialogue windows.
                            </p>

                            {/* 4 Font Size Selectable Cards */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {FONT_SIZES.map((f) => {
                                    const isSelected = currentFontSize === f.id;
                                    return (
                                        <div
                                            key={f.id}
                                            onClick={() => handleFontSizeChange(f.id)}
                                            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                                                isSelected
                                                    ? 'bg-white/15 border-white shadow-lg ring-2 ring-white/20'
                                                    : 'bg-black/30 hover:bg-white/10 border-white/10'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span 
                                                    className="font-bold text-white tracking-wide"
                                                    style={{ fontSize: f.sizePx }}
                                                >
                                                    {f.label}
                                                </span>
                                                {isSelected ? (
                                                    <CheckCircle2 size={18} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                                ) : (
                                                    <span className="text-[11px] text-gray-500">{f.sizePx}</span>
                                                )}
                                            </div>
                                            <p className="text-[11px] text-gray-400 leading-normal">
                                                {f.desc}
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Live Interactive Chat Preview */}
                            <div className={`mt-4 p-4 rounded-2xl border border-white/10 space-y-2 overflow-hidden shadow-inner wallpaper-${appSettings?.chatWallpaperPattern || 'default'}`}>
                                <div className="flex items-center justify-between text-[11px] text-gray-200 font-medium pb-1 border-b border-white/15 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg">
                                    <span className="flex items-center gap-1.5"><Eye size={13} /> Live Message Bubble Preview:</span>
                                    <span>Scale: {currentFontSize}</span>
                                </div>
                                
                                <div className="space-y-2 pt-1">
                                    <div className="flex justify-start">
                                        <div className="bg-black/50 backdrop-blur-md text-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2 max-w-[80%] shadow border border-white/10">
                                            <p className="font-normal leading-relaxed">Hey there! How does this wallpaper & text size look on your screen?</p>
                                            <span className="text-[10px] text-gray-400 block text-right mt-1">10:42 AM</span>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <div 
                                            className="text-white rounded-2xl rounded-tr-sm px-3.5 py-2 max-w-[80%] shadow-lg border border-white/20"
                                            style={{ backgroundColor: activeTheme?.accentColor || '#8b5cf6' }}
                                        >
                                            <p className="font-normal leading-relaxed">It looks crisp and perfectly readable across SyncWire.</p>
                                            <span className="text-[10px] text-white/80 block text-right mt-1">10:43 AM · ✓✓</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= SECTION: CHAT WALLPAPERS GALLERY ================= */}
                    {(activeTab === 'all' || activeTab === 'theme') && (
                        <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                    <ImageIcon size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                    <span>Chat Wallpapers Gallery</span>
                                </div>
                                <span className="text-[11px] text-gray-400">
                                    {WALLPAPER_PATTERNS.length} Wallpapers
                                </span>
                            </div>

                            <p className="text-xs text-gray-300">
                                Personalize your chat background with doodles, galaxies, neon synthwave, or clean minimalist palettes.
                            </p>

                            {/* Wallpapers Grid */}
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                                {WALLPAPER_PATTERNS.map((wp) => {
                                    const isSelected = (appSettings?.chatWallpaperPattern || 'default') === wp.id;
                                    return (
                                        <div
                                            key={wp.id}
                                            onClick={() => {
                                                updateSetting('chatWallpaperPattern', wp.id);
                                                toast.success(`Wallpaper set to ${wp.label}`);
                                            }}
                                            className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 group flex flex-col justify-between h-36 shadow-lg ${
                                                isSelected 
                                                    ? 'border-2 border-violet-400 ring-2 ring-violet-500/40 scale-[1.02]' 
                                                    : 'border-white/15 hover:border-white/40'
                                            }`}
                                        >
                                            {/* Background pattern layer */}
                                            <div className={`absolute inset-0 ${wp.previewClass}`}></div>

                                            {/* Mock preview chat bubble */}
                                            <div className="relative z-10 p-2.5 space-y-1.5 pointer-events-none">
                                                <div className="w-14 h-3 bg-black/50 backdrop-blur-md rounded text-[7px] flex items-center px-1 text-white/90">
                                                    Hey!
                                                </div>
                                                <div className="w-12 h-3 bg-violet-600/70 backdrop-blur-md rounded text-[7px] flex items-center px-1 text-white ml-auto">
                                                    Hi!
                                                </div>
                                            </div>

                                            {/* Footer label */}
                                            <div className="relative z-10 p-2 bg-gradient-to-t from-black/90 via-black/60 to-transparent flex items-center justify-between">
                                                <div className="truncate pr-1">
                                                    <span className="text-[11px] font-bold text-white block truncate leading-tight">
                                                        {wp.label}
                                                    </span>
                                                    <span className="text-[9px] text-gray-300">{wp.category}</span>
                                                </div>
                                                {isSelected && (
                                                    <span className="w-4.5 h-4.5 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0 shadow">
                                                        <Check size={11} />
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ================= SECTION: THEME STUDIO ================= */}
                    {(activeTab === 'all' || activeTab === 'theme') && (
                        <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                    <Palette size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                    <span>Theme & Appearance Studio</span>
                                </div>
                                <span className="text-[11px] text-gray-400">
                                    {THEME_PRESETS.length} Themes available
                                </span>
                            </div>

                            <p className="text-xs text-gray-300">
                                Choose from curated themes to transform the entire layout, header bars, message bubbles, and sidebars.
                            </p>

                            {/* Theme Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                                {THEME_PRESETS.map((theme) => {
                                    const isCurrent = activeTheme?.id === theme.id;
                                    return (
                                        <div
                                            key={theme.id}
                                            onClick={() => handleThemeChange(theme)}
                                            className={`relative p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-center justify-between ${
                                                isCurrent
                                                    ? 'bg-white/15 border-white shadow-lg ring-2 ring-white/20'
                                                    : 'bg-black/30 hover:bg-white/10 border-white/10'
                                            }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div 
                                                    className={`w-9 h-9 rounded-xl shadow-inner border border-white/20 bg-gradient-to-br ${theme.previewGradient} flex items-center justify-center shrink-0`}
                                                >
                                                    <div 
                                                        className="w-3.5 h-3.5 rounded-full"
                                                        style={{ backgroundColor: theme.accentColor }}
                                                    ></div>
                                                </div>
                                                <div>
                                                    <h4 className="text-xs font-semibold text-white">{theme.name}</h4>
                                                    <p className="text-[10px] text-gray-400">{theme.id.replace('_', ' ')}</p>
                                                </div>
                                            </div>

                                            {isCurrent && (
                                                <CheckCircle2 size={18} className="text-white shrink-0" style={{ color: theme.accentColor }} />
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* ================= SECTION: CHAT & INPUT PREFERENCES ================= */}
                    {(activeTab === 'all' || activeTab === 'chats') && (
                        <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                <MessageSquare size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                <span>Chat & Input Preferences</span>
                            </div>

                            <div className="space-y-3 divide-y divide-white/10">
                                {/* Enter to Send */}
                                <div className="pt-2 flex items-center justify-between">
                                    <div className="space-y-0.5 pr-4">
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <CornerDownLeft size={15} className="text-gray-400" />
                                            <span>Enter is Send</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Press Enter key to instantly send message. Use Shift+Enter to add a new line.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateSetting('enterToSend', !appSettings?.enterToSend)}
                                        className={`w-12 h-6.5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                                            appSettings?.enterToSend !== false ? 'bg-emerald-500' : 'bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                                            appSettings?.enterToSend !== false ? 'translate-x-5.5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                {/* AI Smart Replies */}
                                <div className="pt-3 flex items-center justify-between">
                                    <div className="space-y-0.5 pr-4">
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Bot size={15} className="text-violet-400" />
                                            <span>AI Smart Reply Suggestions</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Display instant 1-tap contextual reply chips above the message input bar.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateSetting('smartRepliesEnabled', !appSettings?.smartRepliesEnabled)}
                                        className={`w-12 h-6.5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                                            appSettings?.smartRepliesEnabled !== false ? 'bg-emerald-500' : 'bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                                            appSettings?.smartRepliesEnabled !== false ? 'translate-x-5.5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                {/* Voice Speech-to-text Transcription */}
                                <div className="pt-3 flex items-center justify-between">
                                    <div className="space-y-0.5 pr-4">
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Zap size={15} className="text-amber-400" />
                                            <span>Live Speech Transcription</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Automatically transcribe microphone audio into text when speaking.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateSetting('voiceNoteSpeechEnabled', !appSettings?.voiceNoteSpeechEnabled)}
                                        className={`w-12 h-6.5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                                            appSettings?.voiceNoteSpeechEnabled !== false ? 'bg-emerald-500' : 'bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                                            appSettings?.voiceNoteSpeechEnabled !== false ? 'translate-x-5.5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= SECTION: NOTIFICATIONS & SOUNDS ================= */}
                    {(activeTab === 'all' || activeTab === 'notifications') && (
                        <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                <Bell size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                <span>Notifications & Sounds</span>
                            </div>

                            <div className="space-y-3 divide-y divide-white/10">
                                {/* Message Received Sound */}
                                <div className="pt-2 flex items-center justify-between">
                                    <div className="space-y-0.5 pr-4">
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Volume2 size={15} className="text-gray-400" />
                                            <span>Incoming Message Chimes</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Play gentle chime sound when new messages arrive.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateSetting('soundEnabled', !appSettings?.soundEnabled)}
                                        className={`w-12 h-6.5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                                            appSettings?.soundEnabled !== false ? 'bg-emerald-500' : 'bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                                            appSettings?.soundEnabled !== false ? 'translate-x-5.5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                {/* Message Sent Sound */}
                                <div className="pt-3 flex items-center justify-between">
                                    <div className="space-y-0.5 pr-4">
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Volume2 size={15} className="text-gray-400" />
                                            <span>Message Sent "Pop" Sound</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Play subtle confirmation click when outgoing message is sent.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateSetting('sentSoundEnabled', !appSettings?.sentSoundEnabled)}
                                        className={`w-12 h-6.5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                                            appSettings?.sentSoundEnabled !== false ? 'bg-emerald-500' : 'bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                                            appSettings?.sentSoundEnabled !== false ? 'translate-x-5.5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= SECTION: PRIVACY & SECURITY ================= */}
                    {(activeTab === 'all' || activeTab === 'privacy') && (
                        <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                <Lock size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                <span>Privacy & Security</span>
                            </div>

                            <div className="space-y-4 divide-y divide-white/10">
                                {/* Read Receipts */}
                                <div className="pt-2 flex items-center justify-between">
                                    <div className="space-y-0.5 pr-4">
                                        <p className="text-sm font-medium text-white flex items-center gap-2">
                                            <Eye size={15} className="text-gray-400" />
                                            <span>Read Receipts (Blue Ticks)</span>
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            Show double blue checkmarks when contacts read your messages.
                                        </p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => updateSetting('readReceipts', !appSettings?.readReceipts)}
                                        className={`w-12 h-6.5 rounded-full transition-colors p-0.5 cursor-pointer flex items-center shrink-0 ${
                                            appSettings?.readReceipts !== false ? 'bg-emerald-500' : 'bg-gray-700'
                                        }`}
                                    >
                                        <div className={`w-5.5 h-5.5 rounded-full bg-white transition-transform ${
                                            appSettings?.readReceipts !== false ? 'translate-x-5.5' : 'translate-x-0'
                                        }`} />
                                    </button>
                                </div>

                                {/* Last Seen Visibility */}
                                <div className="pt-3 space-y-2">
                                    <p className="text-sm font-medium text-white">Who can see my Last Seen & Online</p>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { id: 'everyone', label: 'Everyone' },
                                            { id: 'contacts', label: 'My Contacts' },
                                            { id: 'nobody', label: 'Nobody' }
                                        ].map((opt) => (
                                            <button
                                                key={opt.id}
                                                type="button"
                                                onClick={() => updateSetting('privacyLastSeen', opt.id)}
                                                className={`py-2 px-3 rounded-xl text-xs font-medium border transition cursor-pointer ${
                                                    (appSettings?.privacyLastSeen || 'everyone') === opt.id
                                                        ? 'bg-white/20 text-white border-white'
                                                        : 'bg-black/30 text-gray-400 border-white/10 hover:bg-white/5'
                                                }`}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Disappearing Messages Default */}
                                <div className="pt-3 space-y-2">
                                    <p className="text-sm font-medium text-white flex items-center gap-2">
                                        <Clock size={15} className="text-gray-400" />
                                        <span>Default Disappearing Message Timer</span>
                                    </p>
                                    <div className="grid grid-cols-4 gap-2">
                                        {[
                                            { id: 'off', label: 'Off' },
                                            { id: '24h', label: '24 Hours' },
                                            { id: '7d', label: '7 Days' },
                                            { id: '90d', label: '90 Days' }
                                        ].map((t) => (
                                            <button
                                                key={t.id}
                                                type="button"
                                                onClick={() => updateSetting('disappearingTimer', t.id)}
                                                className={`py-2 px-2 rounded-xl text-xs font-medium border transition cursor-pointer ${
                                                    (appSettings?.disappearingTimer || 'off') === t.id
                                                        ? 'bg-white/20 text-white border-white'
                                                        : 'bg-black/30 text-gray-400 border-white/10 hover:bg-white/5'
                                                }`}
                                            >
                                                {t.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* End-to-End Encryption Badge */}
                                <div className="pt-3 flex items-center gap-3 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl">
                                    <ShieldCheck size={22} className="text-emerald-400 shrink-0" />
                                    <div className="text-xs">
                                        <p className="font-semibold text-emerald-300">256-bit End-to-End Encryption Active</p>
                                        <p className="text-gray-300 mt-0.5">Your personal messages, audio notes, and media calls stay strictly between you and the recipient.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= SECTION: STORAGE & DATA ================= */}
                    {(activeTab === 'all' || activeTab === 'privacy') && (
                        <div className="backdrop-blur-2xl bg-white/5 border border-white/15 rounded-3xl p-5 md:p-6 shadow-xl space-y-4">
                            <div className="flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider text-gray-300">
                                <Database size={16} style={{ color: activeTheme?.accentColor || '#8b5cf6' }} />
                                <span>Storage & Data Management</span>
                            </div>

                            <div className="flex items-center justify-between pt-1">
                                <div className="space-y-0.5 pr-4">
                                    <p className="text-sm font-medium text-white">Clear Local Cache & Storage</p>
                                    <p className="text-xs text-gray-400">
                                        Free up local browser memory and restore default settings.
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={handleClearStorage}
                                    className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-gray-200 border border-white/20 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shrink-0"
                                >
                                    <Trash2 size={14} /> Clear Cache
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Logout Button */}
                    <div className="pt-4">
                        <button
                            type="button"
                            onClick={() => { logout(); navigate('/login'); }}
                            className="w-full py-3.5 bg-red-500/15 hover:bg-red-500/25 text-red-400 border border-red-500/30 rounded-2xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:scale-[1.01]"
                        >
                            <LogOut size={18} /> Logout from SyncWire
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
