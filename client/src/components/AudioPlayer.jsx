import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Mic } from 'lucide-react';

const AudioPlayer = ({ src, isSent }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const audioRef = useRef(null);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateProgress = () => {
            if (audio.duration) {
                setProgress((audio.currentTime / audio.duration) * 100);
                setCurrentTime(audio.currentTime);
            }
        };

        const handleLoadedMetadata = () => {
            setDuration(audio.duration || 0);
        };

        const handleEnded = () => {
            setIsPlaying(false);
            setProgress(0);
            setCurrentTime(0);
        };

        audio.addEventListener('timeupdate', updateProgress);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('ended', handleEnded);

        return () => {
            audio.removeEventListener('timeupdate', updateProgress);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('ended', handleEnded);
        };
    }, []);

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }
    };

    const handleSeek = (e) => {
        if (!audioRef.current || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const newTime = (clickX / width) * duration;
        audioRef.current.currentTime = newTime;
        setProgress((newTime / duration) * 100);
    };

    const formatTime = (secs) => {
        if (isNaN(secs) || secs === 0) return "0:00";
        const m = Math.floor(secs / 60);
        const s = Math.floor(secs % 60);
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    // Simulated waveform bars
    const barHeights = [40, 70, 30, 90, 60, 40, 80, 100, 50, 70, 90, 40, 60, 80, 30, 90, 50, 70, 40, 60];

    return (
        <div className="flex items-center gap-3 py-1 px-1 min-w-[220px] max-w-[280px]">
            <audio ref={audioRef} src={src} preload="metadata" />

            {/* Play/Pause round button */}
            <button
                type="button"
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-[#00a884] text-[#111b21] flex items-center justify-center shrink-0 hover:scale-105 active:scale-95 transition shadow"
            >
                {isPlaying ? <Pause size={18} fill="#111b21" /> : <Play size={18} fill="#111b21" className="ml-0.5" />}
            </button>

            {/* Waveform and progress */}
            <div className="flex-1 flex flex-col justify-center gap-1.5">
                <div 
                    onClick={handleSeek}
                    className="flex items-center gap-[2px] h-6 cursor-pointer py-1"
                >
                    {barHeights.map((h, i) => {
                        const barPct = (i / barHeights.length) * 100;
                        const isPlayed = progress >= barPct;
                        return (
                            <span
                                key={i}
                                style={{ height: `${h}%` }}
                                className={`w-[3px] rounded-full transition-all duration-150 ${
                                    isPlayed 
                                        ? isSent ? 'bg-[#00a884]' : 'bg-[#00a884]' 
                                        : isSent ? 'bg-[#005c4b]/50 border border-white/20' : 'bg-[#8696a0]/40'
                                }`}
                            />
                        );
                    })}
                </div>

                {/* Duration & Mic indicator */}
                <div className="flex justify-between items-center text-[10px] text-[#8696a0]">
                    <span>{isPlaying ? formatTime(currentTime) : (duration ? formatTime(duration) : "0:00")}</span>
                    <Mic size={12} className={isSent ? "text-[#00a884]" : "text-[#8696a0]"} />
                </div>
            </div>
        </div>
    );
};

export default AudioPlayer;
