import { useEmployees } from "@/hooks/useEmployees";
import { format } from "date-fns";
import {
  User,
  Mail,
  Calendar,
  UserMinus,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function EmployeeList() {
  const { employees, loading, removeEmployee } = useEmployees();

  if (loading)
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="ml-3 text-muted-foreground text-sm">
          Loading team...
        </span>
      </div>
    );

  if (employees.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-2xl bg-white/5">
        <div className="p-3 bg-white/5 rounded-full mb-3">
          <UserMinus className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground font-medium">
          No team members yet.
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Invite someone to collaborate.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {employees.map((emp) => (
        <div
          key={emp.id}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-black/20 border border-white/5 p-5 hover:bg-black/40 transition-all duration-300 hover:shadow-xl hover:border-white/10"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 shrink-0 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-inner ring-2 ring-black/50">
                {emp.full_name?.[0] || emp.email[0].toUpperCase()}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                  {emp.full_name || "Unnamed"}
                  {!emp.accepted_at && (
                    <span className="flex items-center gap-1 text-[10px] bg-yellow-500/10 text-yellow-500 px-1.5 py-0.5 rounded border border-yellow-500/20 font-medium tracking-wide">
                      <Clock className="h-2.5 w-2.5" /> PENDING
                    </span>
                  )}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="h-3 w-3 text-emerald-500/80" />
                  Employee
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2 mb-4 bg-white/5 rounded-lg p-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary/70 shrink-0" />
              <span className="break-all flex-1" title={emp.email}>
                {emp.email}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-purple-400/70" />
              <span>
                Joined{" "}
                {format(new Date(emp.created_at || Date.now()), "MMM d, yyyy")}
              </span>
            </div>
          </div>

          <button
            onClick={() => removeEmployee(emp.id)}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-muted-foreground hover:text-red-400 bg-white/5 hover:bg-red-500/10 py-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0"
          >
            <UserMinus className="h-3.5 w-3.5" />
            Revoke Access
          </button>
        </div>
      ))}
    </div>
  );
}
