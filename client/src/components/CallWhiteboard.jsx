import React, { useRef, useState, useEffect } from 'react';
import { X, Trash2, Edit3, Eraser, Download } from 'lucide-react';

const CallWhiteboard = ({ isOpen, onClose }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#8b5cf6');
    const [brushSize, setBrushSize] = useState(4);
    const [isEraser, setIsEraser] = useState(false);

    useEffect(() => {
        if (!isOpen) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        
        // Fit canvas resolution to element
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
    }, [isOpen]);

    if (!isOpen) return null;

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.strokeStyle = isEraser ? '#110e1f' : color;
        ctx.lineWidth = isEraser ? brushSize * 3 : brushSize;
        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.closePath();
        }
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        if (canvas) {
            const ctx = canvas.getContext('2d');
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    };

    const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ffffff'];

    return (
        <div className="absolute inset-0 z-30 bg-[#110e1f]/95 backdrop-blur-xl flex flex-col rounded-3xl overflow-hidden border border-violet-500/50 shadow-2xl animate-in fade-in duration-150">
            {/* Whiteboard Controls Toolbar */}
            <div className="p-3 bg-black/60 border-b border-white/10 flex items-center justify-between z-20">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-violet-300 flex items-center gap-1.5 mr-2">
                        <Edit3 size={14} /> Live Whiteboard
                    </span>

                    {/* Colors */}
                    <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl">
                        {COLORS.map((c) => (
                            <button
                                key={c}
                                type="button"
                                onClick={() => { setColor(c); setIsEraser(false); }}
                                className={`w-5 h-5 rounded-full transition cursor-pointer ${
                                    !isEraser && color === c ? 'ring-2 ring-white scale-110' : 'opacity-80 hover:opacity-100'
                                }`}
                                style={{ backgroundColor: c }}
                            />
                        ))}
                    </div>

                    {/* Eraser */}
                    <button
                        type="button"
                        onClick={() => setIsEraser(!isEraser)}
                        className={`p-1.5 rounded-lg text-xs transition cursor-pointer ${
                            isEraser ? 'bg-violet-600 text-white' : 'bg-white/10 text-gray-300 hover:bg-white/20'
                        }`}
                        title="Eraser"
                    >
                        <Eraser size={14} />
                    </button>

                    {/* Clear Canvas */}
                    <button
                        type="button"
                        onClick={clearCanvas}
                        className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition cursor-pointer text-xs flex items-center gap-1"
                        title="Clear Canvas"
                    >
                        <Trash2 size={13} />
                    </button>
                </div>

                <button
                    type="button"
                    onClick={onClose}
                    className="p-1 text-gray-400 hover:text-white rounded-full bg-white/10 hover:bg-white/20 transition cursor-pointer"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Drawing Canvas */}
            <div className="flex-1 w-full h-full relative cursor-crosshair">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    className="w-full h-full block"
                />
            </div>
        </div>
    );
};

export default CallWhiteboard;
