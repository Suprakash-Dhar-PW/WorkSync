import { useState, useEffect } from "react";
import { useAuth } from "@/features/auth";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router-dom";

export default function AuthPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log("AuthPage: User state changed:", user);
    if (user) {
      console.log("AuthPage: Redirecting to dashboard...");
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuth = async (e) => {
    e.preventDefault();
    console.log("AuthPage: Handle auth started. IsLogin:", isLogin);
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        console.log("AuthPage: Attempting sign in...");
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        console.log("AuthPage: Sign in result:", { data, error });

        if (error) throw error;
        // Navigation will be handled by useEffect when user state updates
      } else {
        // Sign Up (as Manager)
        console.log("AuthPage: Attempting sign up...");
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              role: "manager", // Default self-signup as manager
            },
          },
        });

        if (error) throw error;
        if (!data.user) throw new Error("Sign up failed");
        if (data.user && !data.session) {
          setError("Success! Please check your email to verify your account.");
          return;
        }
      }
    } catch (err) {
      console.error("AuthPage: Auth error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md animate-fade-in group">
        {/* Decorative elements behind the card */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>

        <div className="glass-card p-8 rounded-2xl shadow-2xl relative bg-black/40 border-white/10 ring-1 ring-white/5">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 tracking-tight mb-2">
              WorkSync_
            </h1>
            <p className="text-muted-foreground text-sm font-medium">
              {isLogin
                ? "Welcome back, Operator."
                : "Initialize your workspace."}
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            {!isLogin && (
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                  Full Name
                </label>
                <input
                  className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider ml-1">
                Password
              </label>
              <input
                type="password"
                className="w-full px-4 py-3 glass-input rounded-xl focus:ring-2 focus:ring-primary/50 transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div
                className={`p-3 rounded-lg text-sm text-center border ${error.startsWith("Success") ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-3.5 btn-primary rounded-xl font-semibold text-sm tracking-wide shadow-lg shadow-primary/20"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </span>
              ) : isLogin ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-8 flex flex-col gap-4 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-muted-foreground hover:text-white transition-colors font-medium"
            >
              {isLogin
                ? "Don't have an account? Create one"
                : "Already have an account? Sign in"}
            </button>

            {!isLogin && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs text-muted-foreground">
                  Employee account creation is restricted to Managers.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
