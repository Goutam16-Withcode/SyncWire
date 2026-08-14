// QuickAI - Smart Assistant & Reply Generator

export const generateSmartReplies = async (req, res) => {
    try {
        const { lastMessageText } = req.body;
        if (!lastMessageText) {
            return res.json({ 
                success: true, 
                replies: ["Sounds good! 👍", "I'll get back to you soon.", "Sure thing! ✨"] 
            });
        }

        const lower = lastMessageText.toLowerCase();
        let replies = [];

        if (lower.includes("how are you") || lower.includes("how r u") || lower.includes("how's it going")) {
            replies = ["I'm doing great, thanks! How about you? 😊", "All good here! How are things with you?", "Pretty good! What's new?"];
        } else if (lower.includes("where are you") || lower.includes("reach") || lower.includes("when")) {
            replies = ["On my way now! 🚗", "Almost there, give me 5 minutes.", "Just leaving now."];
        } else if (lower.includes("thank") || lower.includes("thx")) {
            replies = ["You're very welcome! 🙌", "No problem at all! 😊", "Anytime! ✨"];
        } else if (lower.includes("?") || lower.includes("can you") || lower.includes("could you")) {
            replies = ["Yes, absolutely! 👍", "Let me check and get back to you.", "Sure, I can help with that."];
        } else if (lower.includes("hello") || lower.includes("hi") || lower.includes("hey")) {
            replies = ["Hey! How's it going? 👋", "Hello! Hope you're having a great day! 😊", "Hey there!"];
        } else {
            replies = ["Sounds great! 👍", "Got it, thank you! ✨", "Let's do it! 🚀"];
        }

        res.json({ success: true, replies });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};

export const askAiCopilot = async (req, res) => {
    try {
        const { prompt, mode = "assistant" } = req.body; // mode: 'assistant' | 'rewrite_pro' | 'rewrite_fun' | 'summarize'

        if (!prompt) {
            return res.json({ success: false, message: "Prompt is required" });
        }

        let reply = "";

        if (mode === "rewrite_pro") {
            reply = `Dear recipient,\n\nRegarding our conversation, ${prompt}. Please let me know if you require further clarification.\n\nBest regards,`;
        } else if (mode === "rewrite_fun") {
            reply = `Yo! 🚀 Just wanted to say: ${prompt} 😎✨ Let's catch up soon!`;
        } else if (mode === "summarize") {
            reply = `📋 **Chat Summary Key Points:**\n• ${prompt.slice(0, 100)}...\n• Action items discussed and agreed upon.\n• Follow-up scheduled.`;
        } else {
            // General AI Assistant knowledge responses
            const lower = prompt.toLowerCase();
            if (lower.includes("weather")) {
                reply = "🌤️ The weather forecast shows pleasant conditions today with mild breeze!";
            } else if (lower.includes("recipe") || lower.includes("cook") || lower.includes("food")) {
                reply = "👨‍🍳 For a quick delicious meal: toss pasta with olive oil, minced garlic, cherry tomatoes, and fresh basil!";
            } else if (lower.includes("joke")) {
                reply = "😄 Why do programmers prefer dark mode? Because light attracts bugs!";
            } else {
                reply = `🤖 **QuickAI:** I analyzed your query: "${prompt}".\nHere is what you need to know: Everything is synchronized in real-time. Let me know if you'd like me to draft a message or summarize your conversation!`;
            }
        }

        res.json({ success: true, reply });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};
