import { useState } from "react";
import { useEmployees } from "@/hooks/useEmployees";
import { useTasks } from "@/hooks/useTasks";
import { Calendar, User } from "lucide-react";

export default function CreateTask() {
  const { createTask, loading: taskLoading } = useTasks();
  const { employees } = useEmployees();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) return;

    try {
      await createTask({
        title,
        description,
        deadline: deadline || null,
        employee_id: assigneeId || null,
      });
      // Reset form
      setTitle("");
      setDescription("");
      setDeadline("");
      setAssigneeId("");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <input
          className="w-full px-4 py-3 glass-input rounded-xl focus:ring-primary/50 placeholder:text-muted-foreground/50 bg-black/20"
          placeholder="Task Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          className="w-full px-4 py-3 glass-input rounded-xl focus:ring-primary/50 placeholder:text-muted-foreground/50 bg-black/20 min-h-[100px] resize-none"
          placeholder="What needs to be done? (Description)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative group">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl bg-black/20 text-sm [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:opacity-50 [&::-webkit-calendar-picker-indicator]:hover:opacity-100"
            />
          </div>

          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors pointer-events-none" />
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 glass-input rounded-xl bg-black/20 text-sm appearance-none cursor-pointer"
            >
              <option value="" className="bg-zinc-900 text-muted-foreground">
                Unassigned
              </option>
              {employees?.map((emp) => (
                <option
                  key={emp.id}
                  value={emp.id}
                  className="bg-zinc-900 text-foreground"
                >
                  {emp.full_name || emp.email}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="px-6 py-2.5 btn-primary rounded-xl font-medium text-sm w-full md:w-auto"
          disabled={taskLoading}
        >
          {taskLoading ? "Creating..." : "Create Task"}
        </button>
      </div>
    </form>
  );
}
