import React, { useContext, useState } from 'react';
import { ChatContext } from '../../context/ChatContext';
import { X, Check, Palette, Image as ImageIcon, Sparkles, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';

export const WALLPAPER_PATTERNS = [
    { id: 'default', label: 'Default Translucent', category: 'Classic', desc: 'SyncWire glowing signature gradient', previewClass: 'wallpaper-default' },
    { id: 'doodle_dark', label: 'WhatsApp Dark Doodle', category: 'Doodles', desc: 'Subtle dark chat icons & stickers', previewClass: 'wallpaper-doodle_dark' },
    { id: 'doodle_light', label: 'WhatsApp Light Doodle', category: 'Doodles', desc: 'Warm day doodle parchment', previewClass: 'wallpaper-doodle_light' },
    { id: 'cosmic_stars', label: 'Cosmic Galaxy & Stars', category: 'Space', desc: 'Deep violet nebula with twinkling stars', previewClass: 'wallpaper-cosmic_stars' },
    { id: 'cyber_grid', label: 'Cyberpunk Neon Grid', category: 'Retro', desc: 'Futuristic perspective synthwave grid', previewClass: 'wallpaper-cyber_grid' },
    { id: 'sakura_floral', label: 'Sakura Japanese Blossom', category: 'Aesthetic', desc: 'Soft cherry blossom velvet aura', previewClass: 'wallpaper-sakura_floral' },
    { id: 'geometric_honeycomb', label: 'Emerald Honeycomb', category: 'Abstract', desc: 'Hexagonal tessellated emerald lattice', previewClass: 'wallpaper-geometric_honeycomb' },
    { id: 'midnight_matrix', label: 'Midnight OLED Carbon', category: 'Minimal', desc: 'Pure true-black carbon matrix', previewClass: 'wallpaper-midnight_matrix' },
    { id: 'sunset_dunes', label: 'Warm Sunset Dunes', category: 'Gradients', desc: 'Smooth radiant magenta-amber waves', previewClass: 'wallpaper-sunset_dunes' },
    { id: 'mesh_aura', label: 'Glassmorphic Mesh Aura', category: 'Gradients', desc: 'Vibrant blurred violet-cyan glow', previewClass: 'wallpaper-mesh_aura' },
    { id: 'matte_slate', label: 'Minimalist Matte Slate', category: 'Minimal', desc: 'Zero distraction midnight blue slate', previewClass: 'wallpaper-matte_slate' },
    { id: 'nature_forest', label: 'Alpine Evergreen Forest', category: 'Nature', desc: 'Misty pine mountain canopy gradient', previewClass: 'wallpaper-nature_forest' },
];

export const THEME_PRESETS = [
    {
        id: 'violet_glass',
        name: 'Purple Velvet (Default)',
        appBgClass: "bg-[url('/bgImage.svg')] bg-cover",
        containerBgClass: 'bg-[#1e1534]/70 border-gray-600/60 backdrop-blur-2xl',
        sidebarBgClass: 'bg-[#8185B2]/10 border-gray-700/40',
        sidebarHeaderClass: 'border-gray-700/30',
        activeItemBgClass: 'bg-[#282142]',
        hoverItemBgClass: 'hover:bg-[#282142]/50',
        searchBgClass: 'bg-[#282142] border-gray-700/50',
        pillActiveClass: 'bg-violet-500/40 text-white border-violet-400/50',
        chatBgClass: "bg-[url('/bgImage.svg')] backdrop-blur-xl",
        chatHeaderClass: 'border-stone-500/60',
        inputBarBgClass: 'bg-gray-100/12 border-gray-600/30',
        sendBtnGradient: 'from-purple-400 to-violet-600',
        bubbleSent: 'bg-violet-500/30 border-violet-500/20 text-white',
        bubbleReceived: 'bg-[#282142]/70 border-gray-700/40 text-white',
        rightSidebarBgClass: 'bg-[#1e1534]/90 border-gray-700/50',
        accentColor: '#8b5cf6',
        previewGradient: 'from-purple-900 via-indigo-950 to-slate-900',
    },
    {
        id: 'whatsapp_emerald',
        name: 'WhatsApp Dark Emerald',
        appBgClass: 'bg-[#0c1317]',
        containerBgClass: 'bg-[#111b21] border-[#222d34]',
        sidebarBgClass: 'bg-[#111b21] border-[#222d34]',
        sidebarHeaderClass: 'bg-[#202c33] border-[#222d34]',
        activeItemBgClass: 'bg-[#2a3942]',
        hoverItemBgClass: 'hover:bg-[#202c33]',
        searchBgClass: 'bg-[#202c33] border-[#222d34]',
        pillActiveClass: 'bg-[#00a884]/30 text-[#00a884] border-[#00a884]/50',
        chatBgClass: 'bg-[#0b141a]',
        chatHeaderClass: 'bg-[#202c33] border-[#222d34]',
        inputBarBgClass: 'bg-[#2a3942] border-[#222d34]',
        sendBtnGradient: 'from-[#00a884] to-[#008069]',
        bubbleSent: 'bg-[#005c4b] text-[#e9edef]',
        bubbleReceived: 'bg-[#202c33] text-[#e9edef]',
        rightSidebarBgClass: 'bg-[#111b21] border-[#222d34]',
        accentColor: '#00a884',
        previewGradient: 'from-emerald-950 via-teal-950 to-slate-950',
    },
    {
        id: 'whatsapp_light',
        name: 'WhatsApp Classic Day',
        appBgClass: 'bg-[#d1d7db]',
        containerBgClass: 'bg-[#ffffff] border-[#e9edef] shadow-xl',
        sidebarBgClass: 'bg-[#ffffff] border-[#e9edef]',
        sidebarHeaderClass: 'bg-[#f0f2f5] border-[#e9edef]',
        activeItemBgClass: 'bg-[#f0f2f5]',
        hoverItemBgClass: 'hover:bg-[#f5f6f6]',
        searchBgClass: 'bg-[#f0f2f5] border-transparent text-[#111b21]',
        pillActiveClass: 'bg-[#008069] text-white border-[#008069]',
        chatBgClass: 'bg-[#efeae2]',
        chatHeaderClass: 'bg-[#f0f2f5] border-[#e9edef]',
        inputBarBgClass: 'bg-[#ffffff] border-[#e9edef]',
        sendBtnGradient: 'from-[#008069] to-[#00a884]',
        bubbleSent: 'bg-[#d9fdd3] text-[#111b21] shadow-sm',
        bubbleReceived: 'bg-white text-[#111b21] shadow-sm',
        rightSidebarBgClass: 'bg-[#ffffff] border-[#e9edef]',
        accentColor: '#008069',
        previewGradient: 'from-emerald-200 via-teal-100 to-amber-50',
    },
    {
        id: 'midnight_forest',
        name: 'Midnight Forest',
        appBgClass: 'bg-gradient-to-b from-[#01140e] via-[#03231a] to-[#010e0a]',
        containerBgClass: 'bg-[#031f17]/90 border-emerald-800/40 backdrop-blur-2xl',
        sidebarBgClass: 'bg-[#04281e]/60 border-emerald-900/50',
        sidebarHeaderClass: 'border-emerald-800/40',
        activeItemBgClass: 'bg-[#06382a]',
        hoverItemBgClass: 'hover:bg-[#06382a]/50',
        searchBgClass: 'bg-[#06382a] border-emerald-800/40',
        pillActiveClass: 'bg-emerald-500/40 text-emerald-300 border-emerald-400',
        chatBgClass: 'bg-gradient-to-b from-[#021c14] via-[#052e22] to-[#01140e]',
        chatHeaderClass: 'border-emerald-800/40',
        inputBarBgClass: 'bg-[#06382a] border-emerald-800/50',
        sendBtnGradient: 'from-emerald-500 to-teal-700',
        bubbleSent: 'bg-emerald-600/35 border-emerald-500/30 text-emerald-100',
        bubbleReceived: 'bg-stone-900/60 border-stone-700/40 text-stone-200',
        rightSidebarBgClass: 'bg-[#031f17] border-emerald-800/40',
        accentColor: '#10b981',
        previewGradient: 'from-emerald-900 via-green-950 to-stone-950',
    },
    {
        id: 'celestial_galaxy',
        name: 'Celestial Galaxy',
        appBgClass: 'bg-gradient-to-b from-[#03010f] via-[#090526] to-[#02010b]',
        containerBgClass: 'bg-[#09062b]/80 border-indigo-700/40 backdrop-blur-2xl',
        sidebarBgClass: 'bg-[#0d0a3d]/50 border-indigo-800/40',
        sidebarHeaderClass: 'border-indigo-800/40',
        activeItemBgClass: 'bg-[#151052]',
        hoverItemBgClass: 'hover:bg-[#151052]/50',
        searchBgClass: 'bg-[#151052] border-indigo-700/40',
        pillActiveClass: 'bg-indigo-500/40 text-indigo-200 border-indigo-400',
        chatBgClass: 'bg-gradient-to-b from-[#060417] via-[#0f092e] to-[#03010f]',
        chatHeaderClass: 'border-indigo-800/40',
        inputBarBgClass: 'bg-[#151052] border-indigo-700/40',
        sendBtnGradient: 'from-indigo-500 to-purple-600',
        bubbleSent: 'bg-indigo-600/35 border-indigo-400/30 text-indigo-100',
        bubbleReceived: 'bg-[#18113c]/60 border-purple-800/30 text-purple-200',
        rightSidebarBgClass: 'bg-[#09062b] border-indigo-800/40',
        accentColor: '#6366f1',
        previewGradient: 'from-indigo-900 via-purple-950 to-slate-950',
    },
    {
        id: 'sakura_blossom',
        name: 'Sakura Blossom',
        appBgClass: 'bg-gradient-to-br from-[#180310] via-[#29081d] to-[#12020d]',
        containerBgClass: 'bg-[#29081e]/85 border-rose-800/40 backdrop-blur-2xl',
        sidebarBgClass: 'bg-[#360c28]/50 border-rose-900/40',
        sidebarHeaderClass: 'border-rose-800/40',
        activeItemBgClass: 'bg-[#481237]',
        hoverItemBgClass: 'hover:bg-[#481237]/50',
        searchBgClass: 'bg-[#481237] border-rose-800/40',
        pillActiveClass: 'bg-pink-500/40 text-pink-200 border-pink-400',
        chatBgClass: 'bg-gradient-to-br from-[#230919] via-[#3d0f2b] to-[#1a0512]',
        chatHeaderClass: 'border-rose-800/40',
        inputBarBgClass: 'bg-[#481237] border-rose-800/40',
        sendBtnGradient: 'from-pink-500 to-rose-600',
        bubbleSent: 'bg-pink-500/35 border-pink-400/30 text-pink-100',
        bubbleReceived: 'bg-rose-950/60 border-rose-800/30 text-rose-200',
        rightSidebarBgClass: 'bg-[#29081e] border-rose-800/40',
        accentColor: '#ec4899',
        previewGradient: 'from-pink-900 via-rose-950 to-slate-950',
    },
    {
        id: 'cyberpunk_neon',
        name: 'Cyberpunk Neon',
        appBgClass: 'bg-gradient-to-br from-[#060312] via-[#0d0520] to-[#150029]',
        containerBgClass: 'bg-[#0f0729]/90 border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.15)]',
        sidebarBgClass: 'bg-[#150a36]/60 border-cyan-500/20',
        sidebarHeaderClass: 'border-cyan-500/30',
        activeItemBgClass: 'bg-[#20104e]',
        hoverItemBgClass: 'hover:bg-[#20104e]/50',
        searchBgClass: 'bg-[#20104e] border-cyan-500/40',
        pillActiveClass: 'bg-cyan-500/40 text-cyan-200 border-cyan-400',
        chatBgClass: 'bg-gradient-to-br from-[#0a0520] via-[#140633] to-[#080214]',
        chatHeaderClass: 'border-cyan-500/30',
        inputBarBgClass: 'bg-[#20104e] border-cyan-500/30',
        sendBtnGradient: 'from-cyan-400 to-pink-500',
        bubbleSent: 'bg-cyan-600/30 border-cyan-400/40 text-cyan-100',
        bubbleReceived: 'bg-[#281452]/70 border-pink-500/30 text-pink-100',
        rightSidebarBgClass: 'bg-[#0f0729] border-cyan-500/30',
        accentColor: '#06b6d4',
        previewGradient: 'from-cyan-950 via-purple-950 to-black',
    },
    {
        id: 'midnight_oled',
        name: 'Midnight Pure Black OLED',
        appBgClass: 'bg-[#000000]',
        containerBgClass: 'bg-[#000000] border-gray-800',
        sidebarBgClass: 'bg-[#080808] border-gray-800',
        sidebarHeaderClass: 'border-gray-800',
        activeItemBgClass: 'bg-[#141414]',
        hoverItemBgClass: 'hover:bg-[#141414]/50',
        searchBgClass: 'bg-[#141414] border-gray-800 text-white',
        pillActiveClass: 'bg-white/20 text-white border-white/40',
        chatBgClass: 'bg-[#000000]',
        chatHeaderClass: 'border-gray-800',
        inputBarBgClass: 'bg-[#141414] border-gray-800',
        sendBtnGradient: 'from-gray-200 to-white text-black',
        bubbleSent: 'bg-[#222222] border-gray-700 text-white',
        bubbleReceived: 'bg-[#141414] border-gray-800 text-white',
        rightSidebarBgClass: 'bg-[#080808] border-gray-800',
        accentColor: '#ffffff',
        previewGradient: 'from-neutral-900 via-black to-zinc-950',
    }
];

const ThemeModal = ({ isOpen, onClose }) => {
    const { activeTheme, setActiveTheme, appSettings, updateSetting } = useContext(ChatContext);
    const [activeTab, setActiveTab] = useState('wallpapers'); // 'wallpapers' | 'themes'
    const [filterCategory, setFilterCategory] = useState('All');

    if (!isOpen) return null;

    const currentWallpaper = appSettings?.chatWallpaperPattern || 'default';
    const categories = ['All', 'Classic', 'Doodles', 'Space', 'Retro', 'Aesthetic', 'Abstract', 'Minimal', 'Gradients', 'Nature'];

    const filteredWallpapers = filterCategory === 'All'
        ? WALLPAPER_PATTERNS
        : WALLPAPER_PATTERNS.filter(w => w.category === filterCategory);

    const handleSelectWallpaper = (wId) => {
        updateSetting('chatWallpaperPattern', wId);
        toast.success("Chat wallpaper updated!");
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 select-none animate-in fade-in duration-150">
            <div className="bg-[#1e1534] border border-gray-700/80 rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden text-white flex flex-col max-h-[92vh]">
                
                {/* Header */}
                <div className="p-4 px-6 border-b border-white/10 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-400/40 flex items-center justify-center text-violet-300">
                            <Palette size={18} />
                        </div>
                        <div>
                            <h2 className="text-base font-bold text-white">
                                Wallpapers & Themes Studio
                            </h2>
                            <p className="text-[11px] text-gray-400">Personalize your chat background & layout aesthetic</p>
                        </div>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Tab Switcher */}
                <div className="px-6 pt-4 pb-2 flex gap-3 border-b border-white/10 bg-black/20">
                    <button
                        type="button"
                        onClick={() => setActiveTab('wallpapers')}
                        className={`pb-2.5 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'wallpapers'
                                ? 'border-violet-400 text-white'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <ImageIcon size={15} />
                        <span>Chat Wallpapers ({WALLPAPER_PATTERNS.length})</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setActiveTab('themes')}
                        className={`pb-2.5 text-xs md:text-sm font-semibold border-b-2 transition flex items-center gap-2 cursor-pointer ${
                            activeTab === 'themes'
                                ? 'border-violet-400 text-white'
                                : 'border-transparent text-gray-400 hover:text-gray-200'
                        }`}
                    >
                        <Palette size={15} />
                        <span>UI Themes & Presets ({THEME_PRESETS.length})</span>
                    </button>
                </div>

                {/* Tab 1: Wallpapers Gallery */}
                {activeTab === 'wallpapers' && (
                    <div className="p-6 overflow-y-auto space-y-4 flex-1">
                        
                        {/* Category filter pills */}
                        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFilterCategory(cat)}
                                    className={`px-3 py-1 rounded-full whitespace-nowrap transition cursor-pointer font-medium ${
                                        filterCategory === cat
                                            ? 'bg-violet-600 text-white shadow'
                                            : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10'
                                    }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        {/* Wallpapers Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3.5 pt-1">
                            {filteredWallpapers.map((wp) => {
                                const isSelected = currentWallpaper === wp.id;
                                return (
                                    <div
                                        key={wp.id}
                                        onClick={() => handleSelectWallpaper(wp.id)}
                                        className={`relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-200 group flex flex-col justify-between h-40 shadow-lg ${
                                            isSelected 
                                                ? 'border-2 border-violet-400 ring-2 ring-violet-500/40 scale-[1.02]' 
                                                : 'border-white/15 hover:border-white/40'
                                        }`}
                                    >
                                        {/* Background pattern layer */}
                                        <div className={`absolute inset-0 ${wp.previewClass}`}></div>

                                        {/* Mock preview chat bubble */}
                                        <div className="relative z-10 p-2.5 space-y-1.5 pointer-events-none">
                                            <div className="w-16 h-3.5 bg-black/40 backdrop-blur-md rounded text-[7px] flex items-center px-1 text-white/90">
                                                Hey!
                                            </div>
                                            <div className="w-14 h-3.5 bg-violet-600/70 backdrop-blur-md rounded text-[7px] flex items-center px-1 text-white ml-auto">
                                                Hello!
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

                {/* Tab 2: Theme Presets */}
                {activeTab === 'themes' && (
                    <div className="p-6 overflow-y-auto space-y-4 flex-1">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                            {THEME_PRESETS.map((t) => {
                                const isSelected = activeTheme.id === t.id;
                                return (
                                    <div
                                        key={t.id}
                                        onClick={() => { setActiveTheme(t); toast.success(`Applied ${t.name}`); }}
                                        className={`relative p-4 rounded-2xl border cursor-pointer transition flex flex-col justify-between h-36 bg-gradient-to-br ${t.previewGradient} ${
                                            isSelected 
                                                ? 'border-2 border-violet-400 shadow-xl scale-[1.02]' 
                                                : 'border-white/15 hover:border-white/40'
                                        }`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <span className="text-xs font-bold text-white drop-shadow leading-snug">
                                                {t.name}
                                            </span>
                                            {isSelected && (
                                                <span className="w-5 h-5 rounded-full bg-violet-500 text-white flex items-center justify-center shrink-0">
                                                    <Check size={12} />
                                                </span>
                                            )}
                                        </div>

                                        {/* Mock message bubble preview */}
                                        <div className="space-y-1.5 pointer-events-none mt-2">
                                            <div className="w-24 h-4 bg-white/20 backdrop-blur-sm rounded-md text-[8px] flex items-center px-1.5 text-white/90">
                                                SyncWire theme preview
                                            </div>
                                            <div className="w-20 h-4 bg-violet-500/40 backdrop-blur-sm rounded-md text-[8px] flex items-center px-1.5 text-white ml-auto">
                                                Looks beautiful!
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div className="p-4 px-6 border-t border-white/10 flex items-center justify-between bg-black/20">
                    <span className="text-xs text-gray-400">
                        {activeTab === 'wallpapers' ? `Active: ${WALLPAPER_PATTERNS.find(w => w.id === currentWallpaper)?.label || 'Default'}` : `Active: ${activeTheme.name}`}
                    </span>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-full text-xs font-semibold cursor-pointer hover:opacity-90 transition shadow"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ThemeModal;
