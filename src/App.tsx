import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import RequireAuth from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Inventory from "@/pages/Inventory";
import Sales from "@/pages/Sales";
import Memos from "@/pages/Memos";
import DueBook from "@/pages/DueBook";
import Reports from "@/pages/Reports";
import Profile from "@/pages/Profile";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Expenses from "@/pages/Expenses";
import Suppliers from "@/pages/Suppliers";
import Staff from "@/pages/Staff";
import StockHistory from "@/pages/StockHistory";
import Reset from "@/pages/Reset";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset" element={<Reset />} />
          
          <Route element={<Layout />}>
            <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
            <Route path="/inventory" element={<RequireAuth><Inventory /></RequireAuth>} />
            <Route path="/sales" element={<RequireAuth><Sales /></RequireAuth>} />
            <Route path="/memos" element={<RequireAuth><Memos /></RequireAuth>} />
            <Route path="/due-book" element={<RequireAuth><DueBook /></RequireAuth>} />
            <Route path="/expenses" element={<RequireAuth><Expenses /></RequireAuth>} />
            <Route path="/suppliers" element={<RequireAuth><Suppliers /></RequireAuth>} />
            <Route path="/staff" element={<RequireAuth><Staff /></RequireAuth>} />
            <Route path="/stock-history" element={<RequireAuth><StockHistory /></RequireAuth>} />
            <Route path="/reports" element={<RequireAuth><Reports /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
