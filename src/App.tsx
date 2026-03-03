/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import Memos from "@/pages/Memos";
import DueBook from "@/pages/DueBook";
import Reports from "@/pages/Reports";

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { role, loading } = useAuth();
  if (loading) return <div className="flex h-screen items-center justify-center">লোড হচ্ছে...</div>;
  if (role !== "admin") return <Navigate to="/inventory" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/" element={<AdminRoute><Dashboard /></AdminRoute>} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<Sales />} />
            <Route path="/memos" element={<AdminRoute><Memos /></AdminRoute>} />
            <Route path="/due-book" element={<AdminRoute><DueBook /></AdminRoute>} />
            <Route path="/reports" element={<AdminRoute><Reports /></AdminRoute>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
