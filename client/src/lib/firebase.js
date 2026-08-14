import { initializeApp, getApps } from "firebase/app";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

// Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// Initialize Recaptcha Verifier
export const setupRecaptcha = (buttonId = 'recaptcha-container') => {
    try {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, buttonId, {
                size: 'invisible',
                callback: () => {
                    // reCAPTCHA solved
                },
                'expired-callback': () => {
                    // Response expired. Ask user to solve reCAPTCHA again.
                }
            });
        }
        return window.recaptchaVerifier;
    } catch (e) {
        console.error("Recaptcha initialization error:", e);
        return null;
    }
};

// Send real SMS OTP with Firebase
export const sendFirebaseOtp = async (phoneNumber) => {
    try {
        const appVerifier = setupRecaptcha('recaptcha-container');
        const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
        window.confirmationResult = confirmationResult;
        return { success: true, confirmationResult };
    } catch (error) {
        console.error("Firebase phone auth error:", error);
        if (window.recaptchaVerifier) {
            try {
                window.recaptchaVerifier.clear();
                window.recaptchaVerifier = null;
            } catch (err) {}
        }
        return { success: false, message: error.message };
    }
};

// Google OAuth Sign-in
export const signInWithGoogle = async () => {
    try {
        const provider = new GoogleAuthProvider();
        provider.setCustomParameters({ prompt: 'select_account' });
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        return {
            success: true,
            user: {
                fullName: user.displayName || user.email?.split('@')[0] || "SyncWire User",
                email: user.email,
                profilePic: user.photoURL || '',
                googleId: user.uid,
            }
        };
    } catch (error) {
        console.error("Firebase Google Auth error:", error);
        return { success: false, message: error.message };
    }
};
