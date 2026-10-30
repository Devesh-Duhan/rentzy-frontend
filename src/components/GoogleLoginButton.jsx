"use client";

import { useEffect, useRef, useState } from "react";
import { auth, googleProvider } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { useDispatch } from "react-redux";
import { googleLogin } from "@/store/slices/authSlice";
import toast from "react-hot-toast";
import { runGoogleSignIn } from "@/lib/google-signin";

const GoogleLoginButton = ({ text = "signin_with", onSuccess }) => {
  const dispatch = useDispatch();
  const [isConnecting, setIsConnecting] = useState(false);
  const [stage, setStage] = useState('Connecting...');
  const attempt = useRef(null);
  useEffect(() => () => { attempt.current?.abort(); attempt.current = null; }, []);

  const handleGoogleLogin = async () => {
    if (attempt.current) return;
    if (!auth || !googleProvider) { toast.error('Google login is currently unavailable. Please use email login.'); return; }
    const controller = new AbortController();
    attempt.current = controller;
    setIsConnecting(true);
    const loadingToast = toast.loading("Connecting to Google...");

    try {
      await runGoogleSignIn({
        popup: () => signInWithPopup(auth, googleProvider),
        exchange: async token => {
          const request = dispatch(googleLogin(token));
          const abort = () => request.abort();
          controller.signal.addEventListener('abort', abort, { once: true });
          try { return await request.unwrap(); }
          finally { controller.signal.removeEventListener('abort', abort); }
        },
        onStage: value => { setStage(value); toast.loading(value, { id: loadingToast }); },
        signal: controller.signal,
      });
      if (controller.signal.aborted) return;
      toast.dismiss(loadingToast);
      toast.success("Welcome!");
      if (typeof onSuccess === "function") {
        onSuccess();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      if (controller.signal.aborted) return;
      let message;
      if (typeof error === "string") {
        message = error;
      } else if (error?.code === "auth/popup-closed-by-user") {
        message = "Login popup closed. Please try again.";
      } else if (error?.code === "auth/cancelled-popup-request") {
        message = "Authentication request cancelled.";
      } else if (error?.code === "auth/popup-blocked") {
        message = "Popup blocked by browser. Please allow popups for this site.";
      } else if (error?.code === "auth/unauthorized-domain") {
        message = "This domain is not authorized in Firebase Console.";
      } else if (error?.code === "auth/operation-not-allowed") {
        message = "Google Sign-in is not enabled in Firebase Authentication.";
      } else if (error?.code === "auth/network-request-failed") {
        message = "Network error. Please check your internet connection.";
      } else if (error?.message) {
        message = error.message;
      } else {
        message = "Authentication failed. Please try again.";
      }
      toast.error(message);
    } finally {
      controller.abort();
      toast.dismiss(loadingToast);
      if (attempt.current === controller) { attempt.current = null; setIsConnecting(false); }
    }
  };

  return (
    <div className="w-full flex justify-center py-2">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={isConnecting}
        aria-busy={isConnecting}
        className="flex items-center justify-center gap-3 w-full max-w-[360px] py-3.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all duration-300 shadow-sm group disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <div className="w-5 h-5 border-2 border-indigo-500/20 border-t-indigo-600 rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
          </svg>
        )}
        <span className="text-sm font-bold text-slate-700 dark:text-white uppercase tracking-tight">
          {isConnecting
            ? stage
            : text === "signup_with"
            ? "Sign up with Google"
            : "Sign in with Google"}
        </span>
      </button>
    </div>
  );
};

export default GoogleLoginButton;
