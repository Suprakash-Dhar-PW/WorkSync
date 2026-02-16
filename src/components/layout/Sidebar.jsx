import { LayoutDashboard, Users, LogOut, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

export function Sidebar({
  activeTab,
  setActiveTab,
  signOut,
  user,
  profile,
  isManager,
}) {
  const navItems = [
    { id: "tasks", label: "Tasks", icon: CheckSquare },
    ...(isManager
      ? [{ id: "employees", label: "Employees", icon: Users }]
      : []),
  ];

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-black/20 backdrop-blur-xl transition-transform">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center border-b border-white/5 px-6">
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
            WorkSync_
          </h1>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="grid gap-1 px-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                    activeTab === item.id
                      ? "bg-primary/10 text-primary shadow-sm shadow-primary/5 ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile */}
        <div className="border-t border-white/5 p-4">
          <div className="mb-4 flex items-center gap-3 rounded-lg bg-white/5 p-3 ring-1 ring-white/10">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 text-xs font-bold text-white shadow-lg">
              {profile?.name?.[0] || user?.email?.[0]?.toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-medium text-foreground">
                {profile?.name || "User"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </div>

          <button
            onClick={signOut}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </aside>
  );
}
