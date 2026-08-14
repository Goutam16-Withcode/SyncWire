import React, { useState } from 'react';
import { X, Plus, Trash2, BarChart2, ShieldCheck, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const CreatePollModal = ({ isOpen, onClose, onCreatePoll }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);
    const [isAnonymous, setIsAnonymous] = useState(false);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleAddOption = () => {
        if (options.length >= 6) {
            toast.error('Maximum 6 options allowed per poll');
            return;
        }
        setOptions([...options, '']);
    };

    const handleRemoveOption = (index) => {
        if (options.length <= 2) {
            toast.error('Polls require at least 2 options');
            return;
        }
        setOptions(options.filter((_, i) => i !== index));
    };

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedQuestion = question.trim();
        const validOptions = options.map((opt) => opt.trim()).filter((opt) => opt.length > 0);

        if (!trimmedQuestion) {
            toast.error('Please enter a poll question');
            return;
        }

        if (validOptions.length < 2) {
            toast.error('Please provide at least 2 non-empty options');
            return;
        }

        setLoading(true);
        try {
            await onCreatePoll({
                question: trimmedQuestion,
                options: validOptions,
                isAnonymous
            });
            toast.success('Poll created!');
            setQuestion('');
            setOptions(['', '']);
            setIsAnonymous(false);
            onClose();
        } catch (err) {
            toast.error('Failed to create poll');
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
                        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
                            <BarChart2 size={18} />
                        </div>
                        <h3 className="text-base font-bold text-white">Create Interactive Poll</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Question */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                            Poll Question
                        </label>
                        <input
                            type="text"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="e.g., Which date works best for our team meetup?"
                            className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition"
                            required
                        />
                    </div>

                    {/* Options */}
                    <div className="space-y-2">
                        <label className="block text-xs font-semibold text-gray-300">
                            Poll Options
                        </label>
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={opt}
                                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                                    placeholder={`Option ${idx + 1}`}
                                    className="flex-1 bg-white/5 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-gray-500 outline-none focus:border-violet-500 transition"
                                    required
                                />
                                {options.length > 2 && (
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(idx)}
                                        className="p-2 text-red-400 hover:text-red-300 rounded-xl bg-white/5 hover:bg-red-500/20 transition cursor-pointer"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                )}
                            </div>
                        ))}

                        {options.length < 6 && (
                            <button
                                type="button"
                                onClick={handleAddOption}
                                className="w-full py-2 bg-white/5 hover:bg-white/10 text-violet-300 rounded-xl text-xs font-medium border border-dashed border-white/20 transition flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                            >
                                <Plus size={14} /> Add Option
                            </button>
                        )}
                    </div>

                    {/* Anonymous Voting Toggle */}
                    <div 
                        onClick={() => setIsAnonymous(!isAnonymous)}
                        className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
                    >
                        <div className="flex items-center gap-2.5">
                            <ShieldCheck size={16} className={isAnonymous ? "text-emerald-400" : "text-gray-400"} />
                            <div>
                                <p className="text-xs font-semibold text-white">Anonymous Voting</p>
                                <p className="text-[10px] text-gray-400">Keep participant votes confidential</p>
                            </div>
                        </div>
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center transition border ${
                            isAnonymous ? 'bg-violet-600 border-violet-500 text-white' : 'border-white/30'
                        }`}>
                            {isAnonymous && <Check size={12} />}
                        </div>
                    </div>

                    {/* Submit Button */}
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
                            className="flex-1 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold rounded-2xl transition shadow-lg cursor-pointer"
                        >
                            {loading ? 'Creating...' : 'Launch Poll'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreatePollModal;
