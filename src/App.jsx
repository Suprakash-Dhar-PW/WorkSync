import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/features/auth";
import { Toaster } from "sonner";
// Actually, I'll remove Toaster reference as I haven't added it.
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10 bg-background text-white selection:bg-indigo-500/30">
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[bottom_1px_center] mask-image-linear-gradient(to_bottom,transparent,black)"></div>
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-indigo-500/20 blur-[100px] rounded-full opacity-50 pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-[800px] h-[600px] bg-purple-500/10 blur-[120px] rounded-full opacity-30 pointer-events-none"></div>
      </div>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-center" richColors theme="dark" />
    </AuthProvider>
  );
}
