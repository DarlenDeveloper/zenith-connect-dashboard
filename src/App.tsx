
import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Conversations from "./pages/Conversations";
import Subscription from "./pages/Subscription";
import Requests from "./pages/Requests";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import PaymentRequired from "./pages/PaymentRequired";
import CallHistory from "./pages/CallHistory";
import AIVoiceSettings from "./pages/AIVoiceSettings";
import Analytics from "./pages/Analytics";
import Scripts from "./pages/Scripts";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import { Toaster } from "./components/ui/sonner";
import PaymentRequiredRoute from "./components/PaymentRequiredRoute";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-dots loading-lg"></span>
      </div>
    );
  }

  const routes = [
    {
      path: "/",
      element: <Navigate to="/dashboard" replace />,
    },
    {
      path: "/login",
      element: <Login />,
    },
    {
      path: "/signup",
      element: <Signup />,
    },
    {
      path: "/forgot-password",
      element: <ForgotPassword />,
    },
    {
      path: "/payment-required",
      element: (
        <ProtectedRoute>
          <PaymentRequired />
        </ProtectedRoute>
      ),
    },
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Dashboard />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/products",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Products />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/conversations",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Conversations />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/subscription",
      element: (
        <ProtectedRoute>
          <Subscription />
        </ProtectedRoute>
      ),
    },
    {
      path: "/requests",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Requests />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/notifications",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Notifications />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/settings",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Settings />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/call-history",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <CallHistory />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/ai-voice-settings",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <AIVoiceSettings />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/analytics",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Analytics />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "/scripts",
      element: (
        <ProtectedRoute>
          <PaymentRequiredRoute>
            <Scripts />
          </PaymentRequiredRoute>
        </ProtectedRoute>
      ),
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];

  const router = createBrowserRouter(routes);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
