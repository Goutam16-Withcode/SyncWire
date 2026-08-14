export function formatMessageTime(date) {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

export function formatChatListTime(date) {
    if (!date) return "";
    const msgDate = new Date(date);
    const now = new Date();

    const isToday = msgDate.toDateString() === now.toDateString();
    if (isToday) {
        return msgDate.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (msgDate.toDateString() === yesterday.toDateString()) {
        return "Yesterday";
    }

    const diffDays = Math.floor((now - msgDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 7) {
        return msgDate.toLocaleDateString("en-US", { weekday: "short" });
    }

    return msgDate.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "2-digit" });
}