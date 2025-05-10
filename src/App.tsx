import { useState, useEffect } from "react";
import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import "./App.css";
import "./dashboard-override.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext";
import { UserProvider } from "./contexts/UserContext";
import LoadingScreen from "@/components/LoadingScreen";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Subscription from "./pages/Subscription";
import Notifications from "./pages/Notifications";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import CallHistory from "./pages/CallHistory";
import FeatureRequests from "./pages/FeatureRequests";
import Analytics from "./pages/Analytics";
import Technical from "./pages/Technical";
import StatusUpdates from "./pages/StatusUpdates";
import ContactSales from "./pages/ContactSales";
import Users from "./pages/Users";
import Activity from "./pages/Activity";
import NotificationDemo from "./pages/NotificationDemo";

// Components
import ProtectedRoute from "@/components/ProtectedRoute";
import RequireUser from "./components/RequireUser";
import RequireAdmin from "@/components/RequireAdmin";
import { Toaster } from "./components/ui/sonner";

const queryClient = new QueryClient();

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // This ensures the loading screen is shown for at least 5 seconds
    const timer = setTimeout(() => {
      setLoading(false);
    }, 5000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  const routes = [
    {
      path: "/",
      element: <Navigate to="/login" replace />,
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
      path: "/contact-sales",
      element: <ProtectedRoute><ContactSales /></ProtectedRoute>,
    },
    {
      path: "/dashboard",
      element: <ProtectedRoute><RequireUser><Dashboard /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/products",
      element: <ProtectedRoute><RequireUser><Products /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/subscription",
      element: <ProtectedRoute><RequireAdmin><Subscription /></RequireAdmin></ProtectedRoute>,
    },
    {
      path: "/notifications",
      element: <ProtectedRoute><RequireUser><Notifications /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/settings",
      element: <ProtectedRoute><RequireAdmin><Settings /></RequireAdmin></ProtectedRoute>,
    },
    {
      path: "/call-history",
      element: <ProtectedRoute><RequireUser><CallHistory /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/feature-requests",
      element: <ProtectedRoute><RequireUser><FeatureRequests /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/analytics",
      element: <ProtectedRoute><RequireUser><Analytics /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/technical",
      element: <ProtectedRoute><RequireUser><Technical /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/status-updates",
      element: <ProtectedRoute><RequireUser><StatusUpdates /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/users",
      element: <ProtectedRoute><RequireUser><Users /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/activity",
      element: <ProtectedRoute><RequireUser><Activity /></RequireUser></ProtectedRoute>,
    },
    {
      path: "/notification-demo",
      element: <ProtectedRoute><RequireUser><NotificationDemo /></RequireUser></ProtectedRoute>,
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <UserProvider>
          <RouterProvider router={createBrowserRouter(routes)} />
          <Toaster />
        </UserProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
