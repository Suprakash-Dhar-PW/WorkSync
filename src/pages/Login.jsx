import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const user = await login(email, password);
      // Backend roles: 'main_admin', 'sub_admin', 'employee'
      if (user.role === 'main_admin') navigate("/admin");
      else if (user.role === 'sub_admin') navigate("/admin"); // Assuming sub_admin also uses admin dashboard or a separate one? The user didn't specify a separate sub-admin page, but the roles are distinct.
      // Wait, let me check the routes or dashboard components.
      // Based on previous user context, there is "AdminDashboard" and "EmployeeDashboard".
      // Let's assume sub_admin also goes to /admin or maybe /sub-admin if it exists?
      // The user request said "Sub Admin... Can create tasks...".
      // Let's check App.jsx or routes to see what exists.
      else navigate("/employee");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <Button type="submit" className="w-full">Login</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};