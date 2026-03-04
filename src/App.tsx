/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import Memos from "@/pages/Memos";
import DueBook from "@/pages/DueBook";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";

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
          <Route path="/register" element={<Register />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<RequireAuth><AdminRoute><Dashboard /></AdminRoute></RequireAuth>} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/sales" element={<RequireAuth><AdminRoute><Sales /></AdminRoute></RequireAuth>} />
            <Route path="/memos" element={<RequireAuth><AdminRoute><Memos /></AdminRoute></RequireAuth>} />
            <Route path="/due-book" element={<RequireAuth><AdminRoute><DueBook /></AdminRoute></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><AdminRoute><Reports /></AdminRoute></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          </Route>

          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
