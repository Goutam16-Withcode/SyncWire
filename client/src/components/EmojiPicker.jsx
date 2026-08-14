import React from 'react';

const EMOJI_CATEGORIES = [
    {
        name: "Smileys",
        emojis: ["😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣", "😊", "😇", "🙂", "😉", "😌", "😍", "🥰", "😘", "😋", "😜", "🤪", "🤨", "🧐", "🤓", "😎", "🤩", "🥳", "😏", "😒", "😞", "😔", "😟", "😕", "🙁", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🤭", "🤫", "🤥", "😶", "😐", "😑", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😵", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕"]
    },
    {
        name: "Gestures & People",
        emojis: ["👋", "🤚", "🖐", "✋", "🖖", "👌", "🤌", "🤏", "✌", "🤞", "🤟", "🤘", "🤙", "👈", "👉", "👆", "👇", "☝", "👍", "👎", "✊", "👊", "🤛", "🤜", "👏", "🙌", "👐", "🤲", "🤝", "🙏", "✍", "💅", "🤳", "💪", "🦾", "🦿", "🦵", "🦶", "👂", "🦻", "👃", "🫀", "🫁", "🧠", "👀", "👁", "👅", "👄", "💋", "🩸"]
    },
    {
        name: "Hearts & Symbols",
        emojis: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "💟", "✨", "⭐", "🌟", "💫", "🔥", "💥", "💯", "🎉", "🎊", "🎯", "🏆", "🥇", "🥈", "🥉", "👑", "💡", "💰", "💎", "⏳", "⌛", "⏰", "⚡", "☀️", "🌙", "☁️", "🌧️", "❄️", "☕", "🍕"]
    }
];

const EmojiPicker = ({ onSelect, onClose }) => {
    return (
        <div className="absolute bottom-16 left-4 z-40 w-80 max-h-72 bg-[#282142] border border-gray-600/60 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-100">
            <div className="px-3 py-2 bg-[#1e1534] border-b border-gray-700/50 flex justify-between items-center text-xs text-gray-400">
                <span className="font-semibold text-white">Emojis</span>
                <span className="text-[11px]">Click to add</span>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-3">
                {EMOJI_CATEGORIES.map((cat, idx) => (
                    <div key={idx}>
                        <div className="text-[11px] font-medium text-gray-400 px-1 mb-1">{cat.name}</div>
                        <div className="grid grid-cols-7 gap-1">
                            {cat.emojis.map((emoji, eIdx) => (
                                <button
                                    key={eIdx}
                                    type="button"
                                    onClick={() => onSelect(emoji)}
                                    className="h-9 flex items-center justify-center text-xl hover:bg-[#392f5e] rounded-md transition cursor-pointer active:scale-90"
                                >
                                    {emoji}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EmojiPicker;

