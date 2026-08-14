import React, { useState } from 'react';
import { X, Clock, Calendar, Send, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

const ScheduleMessageModal = ({ isOpen, onClose, onSchedule, defaultText = '' }) => {
    const [text, setText] = useState(defaultText);
    const [scheduledDateTime, setScheduledDateTime] = useState('');
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    // Quick presets
    const handleSetPreset = (minutesToAdd) => {
        const target = new Date(Date.now() + minutesToAdd * 60 * 1000);
        // Format to YYYY-MM-DDTHH:mm
        const tzOffset = target.getTimezoneOffset() * 60000;
        const localISOTime = new Date(target.getTime() - tzOffset).toISOString().slice(0, 16);
        setScheduledDateTime(localISOTime);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedText = text.trim();
        if (!trimmedText) {
            toast.error('Please enter a message to schedule');
            return;
        }

        if (!scheduledDateTime) {
            toast.error('Please pick a date and time');
            return;
        }

        const scheduledDate = new Date(scheduledDateTime);
        if (scheduledDate <= new Date()) {
            toast.error('Scheduled time must be in the future');
            return;
        }

        setLoading(true);
        try {
            await onSchedule({
                text: trimmedText,
                scheduledFor: scheduledDate.toISOString()
            });
            toast.success('Message scheduled!');
            setText('');
            setScheduledDateTime('');
            onClose();
        } catch (err) {
            toast.error('Failed to schedule message');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 select-none">
            <div className="bg-[#1e1534] border border-white/15 rounded-3xl p-6 max-w-md w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                            <Clock size={18} />
                        </div>
                        <h3 className="text-base font-bold text-white">Schedule Message</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Message content */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Message
                        </label>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Type your message to be delivered later..."
                            rows={3}
                            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-none"
                            required
                        />
                    </div>

                    {/* Quick Presets */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Quick Presets
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            <button
                                type="button"
                                onClick={() => handleSetPreset(30)}
                                className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-cyan-300 transition cursor-pointer text-center"
                            >
                                In 30 mins
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSetPreset(120)}
                                className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-cyan-300 transition cursor-pointer text-center"
                            >
                                In 2 hours
                            </button>
                            <button
                                type="button"
                                onClick={() => handleSetPreset(720)}
                                className="py-2 px-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[11px] text-cyan-300 transition cursor-pointer text-center"
                            >
                                In 12 hours
                            </button>
                        </div>
                    </div>

                    {/* Date Time Picker */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5 flex items-center gap-1.5">
                            <Calendar size={13} className="text-cyan-400" /> Exact Delivery Date & Time
                        </label>
                        <input
                            type="datetime-local"
                            value={scheduledDateTime}
                            onChange={(e) => setScheduledDateTime(e.target.value)}
                            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white outline-none focus:border-cyan-500 transition"
                            required
                        />
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-semibold rounded-2xl transition cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold rounded-2xl transition shadow-lg cursor-pointer flex items-center justify-center gap-2"
                        >
                            <Send size={13} />
                            {loading ? 'Scheduling...' : 'Set Schedule'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleMessageModal;
