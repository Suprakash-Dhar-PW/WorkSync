import { useState } from "react";
import { useAuth } from "@/features/auth";
import TaskList from "@/features/tasks/TaskList";
import CreateTask from "@/features/tasks/CreateTask";
import EmployeeList from "@/features/employees/EmployeeList";
import CreateEmployee from "@/features/employees/CreateEmployee";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Bell } from "lucide-react";

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState("tasks");
  const isManager = profile?.role === "manager";

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        signOut={signOut}
        user={user}
        profile={profile}
        isManager={isManager}
      />

      {/* Main Content Area */}
      <main className="flex-1 pl-64 transition-all duration-300">
        <div className="container mx-auto max-w-7xl p-8 pt-6">
          {/* Top Bar / Header */}
          <header className="mb-8 flex items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                {activeTab === "tasks" ? "Task Management" : "Team Overview"}
              </h1>
              <p className="text-muted-foreground mt-1">
                Manage your{" "}
                {activeTab === "tasks"
                  ? "assignments and progress"
                  : "team members and roles"}
                .
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="pl-9 pr-4 py-2 w-64 glass-input rounded-full focus:w-80 transition-all duration-300"
                />
              </div>
              <button className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-white">
                <Bell className="h-5 w-5" />
                <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary ring-2 ring-background animate-pulse" />
              </button>
            </div>
          </header>

          {/* Dynamic Content */}
          <div className="animate-fade-in space-y-8">
            {activeTab === "tasks" && (
              <div className="grid gap-6">
                {isManager && (
                  <div className="glass-panel p-6 rounded-2xl border-l-4 border-primary/50 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 bg-primary/20 blur-3xl rounded-full group-hover:bg-primary/30 transition-all duration-500" />
                    <h3 className="text-lg font-semibold mb-4 relative z-10">
                      Create New Task
                    </h3>
                    <CreateTask />
                  </div>
                )}
                <div className="glass-panel p-6 rounded-2xl">
                  <TaskList />
                </div>
              </div>
            )}

            {activeTab === "employees" && isManager && (
              <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
                <div className="lg:order-2 space-y-6">
                  <div className="sticky top-8 glass-panel p-6 rounded-2xl border-l-4 border-purple-500/50">
                    <h3 className="text-lg font-semibold mb-4">
                      Add Team Member
                    </h3>
                    <CreateEmployee />
                  </div>
                </div>
                <div className="lg:order-1 glass-panel p-6 rounded-2xl">
                  <EmployeeList />
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
