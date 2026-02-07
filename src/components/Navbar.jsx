import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut, LayoutDashboard } from "lucide-react";

export const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="border-b bg-background px-6 py-4 flex justify-between items-center">
      <div className="flex items-center gap-2 font-bold text-xl">
        <LayoutDashboard className="h-6 w-6 text-blue-600" />
        <span>TaskFlow</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-right">
          <p className="font-medium">{user?.name}</p>
          <p className="text-muted-foreground capitalize text-xs">{user?.role}</p>
        </div>
        <Button variant="outline" size="icon" onClick={logout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
};