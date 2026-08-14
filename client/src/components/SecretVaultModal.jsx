import React, { useState } from 'react';
import { X, Lock, Unlock, KeyRound, ShieldAlert, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const SecretVaultModal = ({ isOpen, onClose, isUnlocked, onUnlock, onLock, onSetPin, hasPin }) => {
    const [pinInput, setPinInput] = useState('');
    const [isSettingNewPin, setIsSettingNewPin] = useState(!hasPin);
    const [newPin, setNewPin] = useState('');
    const [confirmPin, setConfirmPin] = useState('');

    if (!isOpen) return null;

    const handleUnlockSubmit = (e) => {
        e.preventDefault();
        if (onUnlock(pinInput)) {
            toast.success("Vault Unlocked");
            setPinInput('');
            onClose();
        } else {
            toast.error("Incorrect Vault PIN");
            setPinInput('');
        }
    };

    const handleSetPinSubmit = (e) => {
        e.preventDefault();
        if (newPin.length < 4) {
            toast.error("PIN must be at least 4 digits");
            return;
        }
        if (newPin !== confirmPin) {
            toast.error("PINs do not match");
            return;
        }
        onSetPin(newPin);
        toast.success("Vault PIN configured successfully!");
        setNewPin('');
        setConfirmPin('');
        setIsSettingNewPin(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 select-none">
            <div className="bg-[#1e1534] border border-white/15 rounded-3xl p-6 max-w-sm w-full text-white shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                            <Lock size={18} />
                        </div>
                        <h3 className="text-base font-bold text-white">Private Chat Vault</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1.5 text-gray-400 hover:text-white rounded-full bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    >
                        <X size={16} />
                    </button>
                </div>

                {isUnlocked ? (
                    <div className="text-center space-y-4 py-2">
                        <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                            <Unlock size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white">Vault is Currently Unlocked</p>
                            <p className="text-xs text-gray-400 mt-1">Hidden conversations are currently visible in your sidebar.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { onLock(); toast("Vault Locked"); onClose(); }}
                            className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-2xl transition cursor-pointer"
                        >
                            Lock Vault Now
                        </button>
                    </div>
                ) : isSettingNewPin ? (
                    <form onSubmit={handleSetPinSubmit} className="space-y-4">
                        <p className="text-xs text-gray-300">Set a 4-digit security PIN to encrypt and protect private chats.</p>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Enter New PIN</label>
                            <input
                                type="password"
                                maxLength={6}
                                value={newPin}
                                onChange={(e) => setNewPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-2.5 text-center tracking-widest text-lg text-white outline-none focus:border-amber-500 transition"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-300 mb-1">Confirm PIN</label>
                            <input
                                type="password"
                                maxLength={6}
                                value={confirmPin}
                                onChange={(e) => setConfirmPin(e.target.value)}
                                placeholder="••••"
                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-2.5 text-center tracking-widest text-lg text-white outline-none focus:border-amber-500 transition"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white text-xs font-bold rounded-2xl transition cursor-pointer"
                        >
                            Save Vault PIN
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleUnlockSubmit} className="space-y-4">
                        <p className="text-xs text-gray-300 text-center">Enter your Vault PIN to reveal confidential conversations.</p>
                        <div>
                            <input
                                type="password"
                                maxLength={6}
                                value={pinInput}
                                onChange={(e) => setPinInput(e.target.value)}
                                placeholder="••••"
                                autoFocus
                                className="w-full bg-white/5 border border-white/15 rounded-2xl px-4 py-2.5 text-center tracking-widest text-xl text-white outline-none focus:border-amber-500 transition"
                                required
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 bg-white/10 hover:bg-white/15 text-gray-300 text-xs font-semibold rounded-2xl transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="flex-1 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-white text-xs font-bold rounded-2xl transition cursor-pointer"
                            >
                                Unlock Vault
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SecretVaultModal;
