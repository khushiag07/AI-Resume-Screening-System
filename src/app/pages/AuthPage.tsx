import React, { useState } from "react";
import { Eye, EyeOff, Lock, Mail, Sparkles } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { c, FONT } from "../../styles/theme";

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter email and password.");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    if (isLogin) {
     const { error } = await supabase.auth.signInWithPassword({
  email,
  password,
});

if (error) {
  alert(error.message);
} else {
  window.location.reload();
}

      if (error) {
        alert(error.message);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
  email,
  password,
});

if (error) {
  alert(error.message);
} else if (data.session) {
  window.location.reload();
} else {
  alert("Account created. Please login now.");
  setIsLogin(true);
}

      if (error) {
        alert(error.message);
      } else {
        alert("Account created successfully. Now login.");
        setIsLogin(true);
      }
    }

    setLoading(false);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-6"
      style={{
        background: c.bg,
        fontFamily: FONT,
      }}
    >
      <div
        className="w-full max-w-md rounded-3xl p-8"
        style={{
          background: c.surface,
          border: `1px solid ${c.border}`,
          boxShadow: "0 25px 90px rgba(0,0,0,0.35)",
        }}
      >
        <div className="mb-8 flex items-center gap-3">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-2xl"
            style={{
              background: c.amber,
              boxShadow: `0 0 25px ${c.amberGlow}`,
            }}
          >
            <Sparkles size={22} color="black" />
          </div>

          <div>
            <h1 className="text-2xl font-bold" style={{ color: c.text }}>
              ResumeAI
            </h1>
            <p className="text-sm" style={{ color: c.textDim }}>
              AI Resume Screening
            </p>
          </div>
        </div>

        <h2 className="text-xl font-bold" style={{ color: c.text }}>
          {isLogin ? "Welcome back" : "Create account"}
        </h2>

        <p className="mt-1 text-sm" style={{ color: c.textDim }}>
          {isLogin
            ? "Login to continue to your dashboard."
            : "Create an account to start screening resumes."}
        </p>

        <form onSubmit={handleAuth} className="mt-7 space-y-4">
          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
            }}
          >
            <Mail size={18} style={{ color: c.textDim }} />

            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: c.text }}
            />
          </div>

          <div
            className="flex items-center gap-3 rounded-2xl px-4 py-3"
            style={{
              background: c.bg,
              border: `1px solid ${c.border}`,
            }}
          >
            <Lock size={18} style={{ color: c.textDim }} />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent outline-none text-sm"
              style={{ color: c.text }}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{ color: c.textDim }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl py-3 text-sm font-bold transition disabled:opacity-60"
            style={{
              background: c.amber,
              color: "#050505",
              boxShadow: `0 0 25px ${c.amberGlow}`,
            }}
          >
            {loading
              ? "Please wait..."
              : isLogin
              ? "Login"
              : "Create Account"}
          </button>
        </form>

        <button
          onClick={() => setIsLogin(!isLogin)}
          className="mt-6 w-full text-sm"
          style={{ color: c.textDim }}
        >
          {isLogin
            ? "Don't have an account? Sign up"
            : "Already have an account? Login"}
        </button>
      </div>
    </div>
  );
}