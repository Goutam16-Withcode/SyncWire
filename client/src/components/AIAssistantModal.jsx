import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { ChatContext } from '../../context/ChatContext';
import { 
    Bot, 
    X, 
    Sparkles, 
    Send, 
    Wand2, 
    Briefcase, 
    Smile, 
    FileText,
    Copy,
    Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const AIAssistantModal = ({ isOpen, onClose, onInsertMessage }) => {
    const { axios } = useContext(AuthContext);
    const { messages } = useContext(ChatContext);

    const [prompt, setPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const handleAskAI = async (mode = "assistant", customPrompt = null) => {
        const textToUse = customPrompt || prompt;
        if (!textToUse && mode !== "summarize") {
            toast.error("Please enter a message or prompt");
            return;
        }

        setLoading(true);
        setResponse('');
        try {
            let bodyPrompt = textToUse;
            if (mode === "summarize") {
                const historySnippet = messages.slice(-10).map((m) => m.text).filter(Boolean).join(" | ");
                bodyPrompt = historySnippet || "No recent text messages found to summarize";
            }

            const { data } = await axios.post('/api/ai/copilot', {
                prompt: bodyPrompt,
                mode,
            });

            if (data.success) {
                setResponse(data.reply);
            } else {
                toast.error(data.message || "AI failed to respond");
            }
        } catch (err) {
            toast.error("Failed to connect to QuickAI");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!response) return;
        navigator.clipboard.writeText(response);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    const insertIntoChat = () => {
        if (!response) return;
        if (onInsertMessage) {
            onInsertMessage(response);
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 select-none animate-in fade-in duration-150">
            <div className="bg-[#282142] border border-gray-600 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden text-white flex flex-col max-h-[90vh]">
                
                {/* Modal Header */}
                <div className="p-4 px-6 border-b border-gray-700/50 flex items-center justify-between">
                    <h2 className="text-lg font-medium flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-cyan-400 to-violet-500 flex items-center justify-center text-white">
                            <Bot size={16} />
                        </div>
                        QuickAI Copilot & Smart Assistant
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1 rounded-full transition cursor-pointer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto space-y-4 flex-1">
                    
                    {/* Quick Mode Buttons */}
                    <div className="flex flex-wrap gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => handleAskAI('summarize')}
                            className="px-3 py-1.5 rounded-full bg-[#1e1534] border border-violet-500/30 hover:border-violet-400 text-violet-300 flex items-center gap-1.5 cursor-pointer transition"
                        >
                            <FileText size={13} /> Summarize Chat
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAskAI('rewrite_pro')}
                            className="px-3 py-1.5 rounded-full bg-[#1e1534] border border-cyan-500/30 hover:border-cyan-400 text-cyan-300 flex items-center gap-1.5 cursor-pointer transition"
                        >
                            <Briefcase size={13} /> Professional Tone
                        </button>
                        <button
                            type="button"
                            onClick={() => handleAskAI('rewrite_fun')}
                            className="px-3 py-1.5 rounded-full bg-[#1e1534] border border-pink-500/30 hover:border-pink-400 text-pink-300 flex items-center gap-1.5 cursor-pointer transition"
                        >
                            <Smile size={13} /> Fun Tone
                        </button>
                    </div>

                    {/* Input Prompt Box */}
                    <div className="space-y-1.5">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="Ask QuickAI anything, draft a reply, or write bullet points..."
                            rows={3}
                            className="w-full bg-[#1e1534] border border-gray-600 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                        />
                        <button
                            type="button"
                            disabled={loading}
                            onClick={() => handleAskAI('assistant')}
                            className="w-full py-2.5 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl text-xs font-semibold cursor-pointer hover:opacity-90 transition flex items-center justify-center gap-2 shadow"
                        >
                            <Sparkles size={15} />
                            {loading ? "Generating Response..." : "Ask QuickAI"}
                        </button>
                    </div>

                    {/* AI Response Output Box */}
                    {response && (
                        <div className="bg-[#1e1534] border border-gray-700 rounded-xl p-4 space-y-3 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center text-xs text-gray-400">
                                <span className="flex items-center gap-1.5 font-medium text-violet-300">
                                    <Bot size={14} /> AI Response
                                </span>
                                <div className="flex items-center gap-2">
                                    <button
                                        type="button"
                                        onClick={copyToClipboard}
                                        className="p-1 hover:text-white transition cursor-pointer flex items-center gap-1 text-[11px]"
                                    >
                                        {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                                        {copied ? "Copied" : "Copy"}
                                    </button>
                                </div>
                            </div>

                            <p className="text-sm text-gray-200 leading-relaxed whitespace-pre-wrap select-text font-light">
                                {response}
                            </p>

                            <button
                                type="button"
                                onClick={insertIntoChat}
                                className="w-full py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center justify-center gap-1.5"
                            >
                                <Send size={13} /> Insert into message bar
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AIAssistantModal;
