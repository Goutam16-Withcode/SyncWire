import React from 'react';
import { X, Download } from 'lucide-react';

const MediaViewer = ({ src, onClose }) => {
    if (!src) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4 animate-in fade-in duration-150">
            {/* Header controls */}
            <div className="absolute top-4 right-4 flex items-center gap-3 text-white z-10">
                <a
                    href={src}
                    download="chat-image.jpg"
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 bg-[#282142]/80 hover:bg-[#392f5e] rounded-full transition cursor-pointer border border-gray-600/40"
                    title="Download"
                >
                    <Download size={20} />
                </a>
                <button
                    onClick={onClose}
                    className="p-2.5 bg-[#282142]/80 hover:bg-[#392f5e] rounded-full transition cursor-pointer border border-gray-600/40"
                    title="Close"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Image Preview */}
            <div className="max-w-4xl max-h-[85vh] flex items-center justify-center overflow-hidden">
                <img
                    src={src}
                    alt="Media Attachment"
                    className="max-h-[85vh] max-w-full object-contain rounded-xl shadow-2xl border border-gray-700"
                />
            </div>
        </div>
    );
};

export default MediaViewer;

