import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { supabase } from "@/lib/supabase";
import { UserPlus, Mail, User } from "lucide-react";

export default function CreateEmployee() {
  const { fetchEmployees } = useEmployees();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      // Call Edge Function to invite user
      const { data, error } = await supabase.functions.invoke(
        "create-employee",
        {
          body: { email, name, password },
        },
      );

      if (error) throw error;
      if (data && data.error) throw new Error(data.error);

      setMessage({ type: "success", text: "Invitation sent successfully!" });
      setEmail("");
      setName("");
      setPassword("");
      fetchEmployees(); // Refresh list
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: err.message || "Failed to invite employee.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleCreate} className="space-y-4">
      <p className="text-sm text-muted-foreground mb-4">
        Send an invitation to a new team member to join your workspace.
      </p>

      <div className="space-y-4">
        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            className="w-full pl-10 pr-4 py-3 glass-input rounded-xl focus:ring-primary/50 bg-black/20"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className="relative group">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="email"
            className="w-full pl-10 pr-4 py-3 glass-input rounded-xl focus:ring-primary/50 bg-black/20"
            placeholder="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="relative group">
          <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
          <input
            type="password"
            className="w-full pl-10 pr-4 py-3 glass-input rounded-xl focus:ring-primary/50 bg-black/20"
            placeholder="Password (Optional - for testing)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>

      {message && (
        <div
          className={`p-3 rounded-lg text-sm flex items-center gap-2 ${message.type === "success" ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}
        >
          {message.type === "success" ? <UserPlus className="h-4 w-4" /> : null}
          {message.text}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-3 btn-primary rounded-xl font-medium text-sm flex items-center justify-center gap-2"
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            Invite Employee
          </>
        )}
      </button>
    </form>
  );
}
