import React, { useContext, useState } from 'react';
import assets from '../assets/assets';
import { AuthContext } from '../../context/AuthContext';
import { signInWithGoogle } from '../lib/firebase';
import { 
    Video, 
    MessageSquare, 
    Bot, 
    Palette, 
    ShieldCheck, 
    Sparkles, 
    Eye, 
    EyeOff, 
    ArrowRight, 
    CheckCircle2,
    Lock,
    Mail,
    User,
    FileText,
    Zap,
    CircleDashed
} from 'lucide-react';
import toast from 'react-hot-toast';

const LoginPage = () => {
    const [currState, setCurrState] = useState("Login"); // 'Login' | 'Sign up'
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [bio, setBio] = useState("Hi Everyone, I am Using SyncWire");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);

    const { login, googleLogin } = useContext(AuthContext);

    // Handle Email/Password Submit
    const onSubmitHandler = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            if (currState === 'Sign up') {
                if (!fullName.trim() || !email.trim() || !password.trim()) {
                    toast.error("Please fill in all required fields");
                    return;
                }
                await login('signup', { fullName: fullName.trim(), email: email.trim(), password, bio: bio.trim() });
            } else {
                if (!email.trim() || !password.trim()) {
                    toast.error("Please enter your email and password");
                    return;
                }
                await login('login', { email: email.trim(), password });
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle Google Sign-in
    const handleGoogleAuth = async () => {
        setGoogleLoading(true);
        try {
            const res = await signInWithGoogle();
            if (res.success && res.user) {
                await googleLogin(res.user);
            } else {
                // If popup was cancelled or failed in demo mode, offer quick demo account fallback
                if (res.message && !res.message.includes('popup-closed-by-user')) {
                    toast.error(res.message);
                }
            }
        } catch (err) {
            toast.error("Google authentication failed");
        } finally {
            setGoogleLoading(false);
        }
    };

    const FEATURES = [
        {
            icon: <Video size={18} className="text-cyan-400" />,
            title: "HD Video & Voice Calling",
            desc: "Peer-to-peer real-time calls with enlarged mirror camera and picture-in-picture view."
        },
        {
            icon: <CircleDashed size={18} className="text-emerald-400" />,
            title: "24-Hour Stories with Likes & Comments",
            desc: "Post visual updates, heart moments, and reply to friends' statuses in real time."
        },
        {
            icon: <Bot size={18} className="text-violet-400" />,
            title: "QuickAI Smart Copilot",
            desc: "Summarize chat threads, draft professional replies, and generate smart suggestions."
        },
        {
            icon: <Palette size={18} className="text-pink-400" />,
            title: "Themes Studio & Font Size Customizer",
            desc: "8 glassmorphic theme palettes with system-wide typography scaling."
        },
        {
            icon: <ShieldCheck size={18} className="text-amber-400" />,
            title: "End-to-End Encrypted & Private",
            desc: "256-bit encryption ensuring your private conversations stay strictly confidential."
        }
    ];

    return (
        <div className="min-h-screen bg-[url('/bgImage.svg')] bg-cover bg-center flex items-center justify-center p-4 md:p-8 select-none">
            <div className="w-full max-w-5xl backdrop-blur-2xl bg-[#1e1534]/85 border border-white/15 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 text-white">
                
                {/* ================= LEFT COLUMN: APP SHOWCASE & FEATURES ================= */}
                <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-between bg-gradient-to-br from-black/40 via-purple-950/20 to-black/60 border-b lg:border-b-0 lg:border-r border-white/10 relative overflow-hidden">
                    
                    {/* Ambient Glow */}
                    <div className="absolute -top-24 -left-24 w-64 h-64 bg-violet-600/25 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-cyan-600/20 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Brand Header */}
                    <div className="space-y-4 relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2.5">
                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                                    S
                                </div>
                                <span className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-gray-100 to-violet-300 bg-clip-text text-transparent">
                                    SyncWire
                                </span>
                            </div>
                        </div>
                        <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed">
                            The modern, private messaging & video calling platform designed for seamless real-time connections.
                        </p>
                    </div>

                    {/* Features List */}
                    <div className="my-8 space-y-4 relative z-10">
                        {FEATURES.map((item, idx) => (
                            <div key={idx} className="flex items-start gap-3.5 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                                <div className="p-2 rounded-xl bg-black/40 border border-white/10 shrink-0 mt-0.5">
                                    {item.icon}
                                </div>
                                <div>
                                    <h4 className="text-xs md:text-sm font-semibold text-white">{item.title}</h4>
                                    <p className="text-[11px] md:text-xs text-gray-300 mt-0.5 leading-snug">{item.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Trust / Stats Badge */}
                    <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-gray-400 relative z-10">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                            <span className="text-emerald-300 font-medium">Servers Online & Healthy</span>
                        </div>
                        <span className="font-mono text-[11px]">v2.4 Pro Edition</span>
                    </div>
                </div>

                {/* ================= RIGHT COLUMN: AUTH FORM ================= */}
                <div className="lg:col-span-6 p-8 md:p-12 flex flex-col justify-center relative">
                    
                    {/* Tab Switcher (Sign In / Sign Up) */}
                    <div className="flex p-1 bg-black/40 border border-white/15 rounded-2xl mb-6 shadow-inner">
                        <button
                            type="button"
                            onClick={() => setCurrState("Login")}
                            className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition cursor-pointer ${
                                currState === "Login"
                                    ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setCurrState("Sign up")}
                            className={`flex-1 py-2.5 rounded-xl text-xs md:text-sm font-semibold transition cursor-pointer ${
                                currState === "Sign up"
                                    ? "bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-md"
                                    : "text-gray-400 hover:text-white"
                            }`}
                        >
                            Create Account
                        </button>
                    </div>

                    {/* Google 1-Click Sign-in Button */}
                    <button
                        type="button"
                        disabled={googleLoading}
                        onClick={handleGoogleAuth}
                        className="w-full py-3 bg-white text-gray-900 hover:bg-gray-100 rounded-2xl font-semibold text-xs md:text-sm flex items-center justify-center gap-3 transition shadow-lg cursor-pointer hover:scale-[1.01] active:scale-[0.99] mb-4"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        <span>{googleLoading ? "Connecting Google..." : "Continue with Google"}</span>
                    </button>

                    {/* Or Divider */}
                    <div className="flex items-center gap-3 my-3">
                        <div className="h-px flex-1 bg-white/15"></div>
                        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-medium">
                            Or with email
                        </span>
                        <div className="h-px flex-1 bg-white/15"></div>
                    </div>

                    {/* Email / Password Form */}
                    <form onSubmit={onSubmitHandler} className="space-y-4">
                        {currState === "Sign up" && (
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                                    <User size={13} className="text-violet-400" />
                                    <span>Full Name</span>
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Enter your full name"
                                    required
                                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 transition"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                                <Mail size={13} className="text-violet-400" />
                                <span>Email Address</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@example.com"
                                required
                                className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 transition"
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                                <Lock size={13} className="text-violet-400" />
                                <span>Password</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your password"
                                    required
                                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {currState === "Sign up" && (
                            <div className="space-y-1.5">
                                <label className="text-xs text-gray-300 font-medium flex items-center gap-1.5">
                                    <FileText size={13} className="text-violet-400" />
                                    <span>Bio / Status (Optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    placeholder="Provide a short bio..."
                                    className="w-full bg-black/40 border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-400 transition"
                                />
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-2xl font-semibold text-xs md:text-sm hover:opacity-95 active:scale-[0.99] transition flex items-center justify-center gap-2 cursor-pointer shadow-lg mt-2"
                        >
                            <span>{loading ? "Processing..." : (currState === "Sign up" ? "Create Free Account" : "Sign In to SyncWire")}</span>
                            <ArrowRight size={16} />
                        </button>
                    </form>

                    {/* Footer / Alternate switch */}
                    <div className="mt-6 pt-4 border-t border-white/10 text-center space-y-2">
                        <p className="text-xs text-gray-400">
                            {currState === "Sign up" ? (
                                <>
                                    Already have an account?{" "}
                                    <span
                                        onClick={() => setCurrState("Login")}
                                        className="text-violet-400 font-medium hover:underline cursor-pointer"
                                    >
                                        Sign In
                                    </span>
                                </>
                            ) : (
                                <>
                                    Don't have an account yet?{" "}
                                    <span
                                        onClick={() => setCurrState("Sign up")}
                                        className="text-violet-400 font-medium hover:underline cursor-pointer"
                                    >
                                        Create one now
                                    </span>
                                </>
                            )}
                        </p>

                        <button
                            type="button"
                            onClick={() => window.location.href = '/phone-login'}
                            className="text-[11px] text-gray-500 hover:text-gray-300 transition"
                        >
                            Alternative: Sign in with phone number
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
};

export default LoginPage;
