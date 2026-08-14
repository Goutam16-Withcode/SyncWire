import React, { useContext, useState, useRef, useEffect } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import assets from '../assets/assets';
import { Phone, ArrowRight, ShieldCheck, RefreshCw, User, Camera, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

const COUNTRY_CODES = [
    { code: '+91', country: 'India', flag: '🇮🇳' },
    { code: '+1', country: 'United States', flag: '🇺🇸' },
    { code: '+44', country: 'United Kingdom', flag: '🇬🇧' },
    { code: '+61', country: 'Australia', flag: '🇦🇺' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+971', country: 'UAE', flag: '🇦🇪' },
    { code: '+81', country: 'Japan', flag: '🇯🇵' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
];

import { sendFirebaseOtp } from '../lib/firebase';

const PhoneLoginPage = () => {
    const { sendPhoneOtp, verifyPhoneOtp, completePhoneSignup } = useContext(AuthContext);
    const navigate = useNavigate();

    // Step: 1 = Phone Number, 2 = Enter OTP, 3 = Profile Setup (if new user)
    const [step, setStep] = useState(1);
    
    // Step 1: Phone
    const [countryCode, setCountryCode] = useState(COUNTRY_CODES[0].code);
    const [phoneDigits, setPhoneDigits] = useState('');
    const [loading, setLoading] = useState(false);

    // Step 2: 6-Digit OTP
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [receivedDemoOtp, setReceivedDemoOtp] = useState('123456');
    const otpRefs = useRef([]);
    const [cooldown, setCooldown] = useState(0);
    const cooldownTimerRef = useRef(null);

    // Step 3: Profile Setup (New user)
    const [fullName, setFullName] = useState('');
    const [bio, setBio] = useState('Hi Everyone, I am Using SyncWire');
    const [profilePic, setProfilePic] = useState(null);

    const fullPhoneNumber = `${countryCode}${phoneDigits.trim()}`;

    // Cooldown countdown timer
    useEffect(() => {
        if (cooldown > 0) {
            cooldownTimerRef.current = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        } else {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        }
        return () => {
            if (cooldownTimerRef.current) clearInterval(cooldownTimerRef.current);
        };
    }, [cooldown]);

    // Handle Send OTP (Firebase SMS + Backend Sync)
    const handleSendOtp = async (e) => {
        if (e) e.preventDefault();
        if (phoneDigits.trim().length < 6) {
            toast.error("Please enter a valid phone number");
            return;
        }

        setLoading(true);

        // Try Firebase real SMS first with a fast timeout so demo OTP is instantaneous
        try {
            await Promise.race([
                sendFirebaseOtp(fullPhoneNumber),
                new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500))
            ]);
        } catch (e) {
            console.log("Firebase SMS attempt (fallback to built-in OTP):", e);
        }

        // Sync with backend OTP
        const res = await sendPhoneOtp(fullPhoneNumber);
        setLoading(false);

        if (res.success) {
            setStep(2);
            setCooldown(60);
            if (res.demoOtp) {
                setReceivedDemoOtp(res.demoOtp);
            }
            setTimeout(() => {
                otpRefs.current[0]?.focus();
            }, 150);
        }
    };


    // Auto-fill OTP Helper
    const handleAutoFillOtp = (codeToFill = null) => {
        const target = codeToFill || receivedDemoOtp || "123456";
        const digits = target.slice(0, 6).split('');
        setOtp(digits);
        toast.success(`Auto-filled OTP: ${target}`);
        setTimeout(() => {
            otpRefs.current[5]?.focus();
        }, 100);
    };

    // Handle OTP Box Input & Auto-focus
    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        // Auto-focus next box
        if (value && index < 5) {
            otpRefs.current[index + 1]?.focus();
        }
    };

    // Handle Backspace navigation
    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            otpRefs.current[index - 1]?.focus();
        }
    };

    // Handle Paste Full 6-digit OTP
    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').trim();
        if (/^\d{6}$/.test(pastedData)) {
            const digits = pastedData.split('');
            setOtp(digits);
            otpRefs.current[5]?.focus();
        }
    };

    // Handle Verify OTP
    const handleVerifyOtp = async (e) => {
        if (e) e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            toast.error("Please enter all 6 digits of the OTP");
            return;
        }

        setLoading(true);
        const res = await verifyPhoneOtp(fullPhoneNumber, otpCode);
        setLoading(false);

        if (res.success) {
            if (res.isNewUser) {
                setStep(3);
            } else {
                navigate('/');
            }
        }
    };


    // Handle Complete Profile Onboarding
    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        if (!fullName.trim()) {
            toast.error("Please enter your name");
            return;
        }

        setLoading(true);
        let profilePicBase64 = "";
        if (profilePic) {
            profilePicBase64 = await new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(profilePic);
            });
        }

        const res = await completePhoneSignup({
            fullName: fullName.trim(),
            bio: bio.trim(),
            profilePic: profilePicBase64,
        });
        setLoading(false);

        if (res.success) {
            navigate('/');
        }
    };

    return (
        <div className="min-h-screen bg-[url('/bgImage.svg')] bg-cover bg-no-repeat flex items-center justify-center p-4 select-none">
            <div className="bg-[#282142]/85 backdrop-blur-xl border border-gray-600/60 rounded-3xl shadow-2xl p-8 max-w-md w-full text-white flex flex-col items-center">
                
                {/* Brand Logo & WhatsApp Shield */}
                <div className="flex flex-col items-center gap-2 mb-6">
                    <img src={assets.logo} alt="QuickChat" className="w-40" />
                    <div className="flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20">
                        <ShieldCheck size={14} /> End-to-End Encrypted Verification
                    </div>
                </div>

                {step === 1 && (
                    // STEP 1: Phone Number Input
                    <form onSubmit={handleSendOtp} className="w-full space-y-5 animate-in fade-in duration-200">
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-semibold">Enter your phone number</h2>
                            <p className="text-xs text-gray-400">
                                SyncWire will verify your account with a secure 6-digit SMS code.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex gap-2">
                                {/* Country Selector */}
                                <select
                                    value={countryCode}
                                    onChange={(e) => setCountryCode(e.target.value)}
                                    className="bg-[#1e1534] border border-gray-600 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-violet-400 cursor-pointer"
                                >
                                    {COUNTRY_CODES.map((c) => (
                                        <option key={c.code} value={c.code} className="bg-[#282142]">
                                            {c.flag} {c.code} ({c.country})
                                        </option>
                                    ))}
                                </select>

                                {/* Phone Input */}
                                <div className="relative flex-1">
                                    <input
                                        type="tel"
                                        value={phoneDigits}
                                        onChange={(e) => setPhoneDigits(e.target.value)}
                                        placeholder="Phone number"
                                        className="w-full bg-[#1e1534] border border-gray-600 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-400 placeholder-gray-500"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Invisible Firebase Recaptcha Container */}
                        <div id="recaptcha-container"></div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                        >

                            {loading ? "Sending OTP..." : "Continue"}
                            <ArrowRight size={16} />
                        </button>

                        <div className="pt-2 text-center">
                            <button
                                type="button"
                                onClick={() => navigate('/login')}
                                className="text-xs text-gray-400 hover:text-violet-300 transition cursor-pointer"
                            >
                                Prefer email & password? <span className="underline font-medium">Login here</span>
                            </button>
                        </div>
                    </form>
                )}

                {step === 2 && (
                    // STEP 2: 6-Digit OTP Boxes
                    <form onSubmit={handleVerifyOtp} className="w-full space-y-6 animate-in fade-in duration-200">
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-semibold">Verify {fullPhoneNumber}</h2>
                            <p className="text-xs text-gray-400">
                                Enter the 6-digit security code sent to your phone.
                            </p>
                        </div>

                        {/* Dev / Test OTP Display Banner */}
                        <div className="bg-[#1e1534] border border-violet-500/30 rounded-xl p-3 flex items-center justify-between shadow-inner">
                            <div className="flex items-center gap-2.5">
                                <Lock size={16} className="text-violet-300 shrink-0" />
                                <div>
                                    <p className="text-[11px] text-gray-400 font-medium">Security Verification Code:</p>
                                    <p className="text-sm font-mono font-bold text-violet-300 tracking-widest">{receivedDemoOtp || "123456"}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleAutoFillOtp(receivedDemoOtp)}
                                className="px-3 py-1.5 bg-violet-600/30 hover:bg-violet-600/50 border border-violet-400/40 text-violet-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                            >
                                Auto-Fill
                            </button>
                        </div>

                        {/* 6 OTP Input Boxes */}
                        <div className="flex justify-between gap-2" onPaste={handlePaste}>
                            {otp.map((digit, idx) => (
                                <input
                                    key={idx}
                                    ref={(el) => (otpRefs.current[idx] = el)}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(idx, e)}
                                    className="w-12 h-14 bg-[#1e1534] border border-gray-600 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:border-violet-400 shadow-inner"
                                />
                            ))}
                        </div>


                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-50"
                        >
                            {loading ? "Verifying..." : "Verify & Continue"}
                            <ShieldCheck size={16} />
                        </button>

                        {/* Resend Cooldown */}
                        <div className="flex items-center justify-between text-xs text-gray-400 pt-1">
                            <button
                                type="button"
                                onClick={() => setStep(1)}
                                className="hover:text-white transition cursor-pointer"
                            >
                                Wrong number?
                            </button>

                            <button
                                type="button"
                                disabled={cooldown > 0}
                                onClick={handleSendOtp}
                                className={`flex items-center gap-1 transition ${
                                    cooldown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-violet-300 hover:text-white cursor-pointer'
                                }`}
                            >
                                <RefreshCw size={12} className={cooldown > 0 ? '' : 'hover:rotate-180 transition'} />
                                {cooldown > 0 ? `Resend code in ${cooldown}s` : 'Resend code'}
                            </button>
                        </div>
                    </form>
                )}

                {step === 3 && (
                    // STEP 3: WhatsApp Profile Onboarding
                    <form onSubmit={handleCompleteProfile} className="w-full space-y-4 animate-in fade-in duration-200">
                        <div className="text-center space-y-1">
                            <h2 className="text-xl font-semibold">Profile info</h2>
                            <p className="text-xs text-gray-400">
                                Please provide your name and an optional profile photo.
                            </p>
                        </div>

                        {/* Avatar Upload */}
                        <div className="flex justify-center py-2">
                            <label htmlFor="profile-upload" className="relative cursor-pointer group">
                                <input
                                    type="file"
                                    id="profile-upload"
                                    accept="image/*"
                                    onChange={(e) => setProfilePic(e.target.files[0])}
                                    hidden
                                />
                                <div className="w-24 h-24 rounded-full border-2 border-dashed border-violet-400/60 group-hover:border-violet-400 flex items-center justify-center overflow-hidden bg-[#1e1534] shadow-lg">
                                    {profilePic ? (
                                        <img src={URL.createObjectURL(profilePic)} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <Camera size={28} className="text-violet-300" />
                                    )}
                                </div>
                            </label>
                        </div>

                        {/* Full Name Input */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">Your Name</label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="Type your name here"
                                className="w-full bg-[#1e1534] border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400"
                                autoFocus
                                required
                            />
                        </div>

                        {/* Bio / About Status */}
                        <div className="space-y-1">
                            <label className="text-xs text-gray-300 font-medium">About / Bio</label>
                            <input
                                type="text"
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                                placeholder="Status message"
                                className="w-full bg-[#1e1534] border border-gray-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-violet-400"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
                        >
                            {loading ? "Setting up..." : "Finish & Start Chatting"}
                        </button>
                    </form>
                )}

            </div>
        </div>
    );
};

export default PhoneLoginPage;
