import { format } from "date-fns";
import { useTasks } from "@/hooks/useTasks";
import { useAuth } from "@/features/auth";
import {
  Clock,
  Calendar,
  User,
  Trash2,
  CheckCircle2,
  RotateCcw,
} from "lucide-react";

export default function TaskList() {
  const { tasks, loading, updateTaskStatus, deleteTask } = useTasks();
  const { profile } = useAuth();
  const isManager = profile?.role === "manager";

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-muted-foreground animate-pulse">
            Syncing tasks...
          </p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 mb-4 ring-1 ring-white/10">
          <CheckCircle2 className="h-10 w-10 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-medium text-foreground">All caught up!</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-xs mx-auto">
          {isManager
            ? "No tasks are currently active. Create a new one to get started."
            : "You have no assigned tasks at the moment."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-black/20 border border-white/5 p-6 hover:bg-black/40 transition-all duration-300 hover:shadow-xl hover:translate-y-[-2px] hover:border-white/10"
        >
          {/* Status Indicator Line */}
          <div
            className={`absolute top-0 left-0 w-full h-1 ${task.status === "completed" ? "bg-green-500/50" : "bg-primary/50"}`}
          />

          <div className="space-y-4">
            <div className="flex justify-between items-start gap-4">
              <h3
                className="text-lg font-semibold text-foreground line-clamp-2 leading-tight"
                title={task.title}
              >
                {task.title}
              </h3>
              <span
                className={`flex-shrink-0 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${
                  task.status === "completed"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                }`}
              >
                {task.status}
              </span>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
              {task.description || "No description provided."}
            </p>

            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                <span className="truncate">
                  {task.assignee
                    ? task.assignee.full_name || task.assignee.email
                    : "Unassigned"}
                </span>
              </div>

              {task.deadline && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5 text-purple-400" />
                  <span>
                    Due {format(new Date(task.deadline), "MMM d, yyyy")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
            {isManager && (
              <button
                onClick={() => deleteTask(task.id)}
                className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-red-500/10 -ml-2"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Delete
              </button>
            )}

            <div className="ml-auto">
              {task.status !== "completed" && (
                <button
                  onClick={() => updateTaskStatus(task.id, "completed")}
                  disabled={isManager}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isManager
                      ? "opacity-50 cursor-not-allowed text-muted-foreground"
                      : "bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20"
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {isManager ? "Pending" : "Complete"}
                </button>
              )}
              {task.status === "completed" && (
                <button
                  onClick={() => updateTaskStatus(task.id, "pending")}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reopen
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
