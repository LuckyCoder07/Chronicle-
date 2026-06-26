import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../lib/firebase";
import { createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { motion } from "motion/react";

export function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      // Create user document
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: name || email.split("@")[0],
        createdAt: Date.now(),
        role: "author",
      });
      navigate("/");
    } catch (err: any) {
      setError(err.message || "Failed to register");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      setError("");
      await signInWithPopup(auth, provider);
      navigate("/");
    } catch (err: any) {
      console.error("Google sign in error:", err);
      setError(err.message || "Failed to sign in with Google. Make sure popup blocker is disabled.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-[80px]">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-editorial-panel p-[40px] border border-editorial-border"
      >
        <div className="text-center mb-[30px]">
          <h1 className="font-serif text-[32px] font-bold text-editorial-text mb-[10px] tracking-[-0.5px]">Create an account</h1>
          <p className="text-[14px] text-editorial-muted font-serif italic">Join our community of writers</p>
        </div>

        {error && <div className="mb-[20px] p-[10px] bg-red-500/10 border border-editorial-accent text-editorial-accent text-[12px]">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-[20px]">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-editorial-text mb-[8px]">Display Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-[16px] py-[12px] border border-editorial-border focus:outline-none focus:border-editorial-text transition-colors text-[14px]"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-editorial-text mb-[8px]">Email</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-[16px] py-[12px] border border-editorial-border focus:outline-none focus:border-editorial-text transition-colors text-[14px]"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-[1px] text-editorial-text mb-[8px]">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-[16px] py-[12px] border border-editorial-border focus:outline-none focus:border-editorial-text transition-colors text-[14px]"
              required
            />
          </div>
          <button 
            type="submit"
            className="w-full bg-editorial-text text-editorial-bg font-bold uppercase tracking-[1px] text-[12px] py-[14px] hover:bg-editorial-panel hover:text-editorial-text border border-editorial-text transition-colors mt-[10px]"
          >
            Sign up
          </button>
        </form>

        <div className="relative my-[24px]">
          <div className="absolute inset-0 flex items-center" aria-hidden="true">
            <div className="w-full border-t border-editorial-border" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-[1px]">
            <span className="bg-editorial-panel px-3 text-editorial-muted">Or continue with</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full bg-editorial-panel text-editorial-text font-bold uppercase tracking-[1px] text-[12px] py-[14px] hover:bg-editorial-text hover:text-editorial-bg border border-editorial-border transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Sign in with Google
        </button>

        <p className="mt-[30px] text-center text-[13px] text-editorial-muted border-t border-editorial-border pt-[20px]">
          Already have an account? <Link to="/login" className="text-editorial-text font-bold uppercase tracking-[0.5px] text-[11px] ml-[8px] hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
