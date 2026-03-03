import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  BookOpen, 
  BarChart3, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

const Sidebar = () => {
  const { role, setUser } = useAuth();
  const isAdmin = role === "admin";
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    ...(isAdmin ? [{ to: "/", icon: LayoutDashboard, label: "ড্যাশবোর্ড" }] : []),
    { to: "/inventory", icon: Package, label: "ইনভেন্টরি" },
    ...(isAdmin ? [
      { to: "/sales", icon: ShoppingCart, label: "বিক্রয়" },
      { to: "/memos", icon: FileText, label: "মেমো" },
      { to: "/due-book", icon: BookOpen, label: "বাকি খাতা" },
      { to: "/reports", icon: BarChart3, label: "রিপোর্ট" },
    ] : []),
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-primary text-primary-foreground">
      <div className="flex flex-col items-center justify-center h-24 border-b border-primary-foreground/10 px-4 text-center">
        <h1 className="text-xl font-bold text-accent">মেসার্স সৈকত মেশিনারি</h1>
        <p className="text-xs text-primary-foreground/70 mt-1">প্রোঃ মোঃ বজলুর রশিদ</p>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-accent text-accent-foreground"
                      : "hover:bg-primary-foreground/10"
                  )
                }
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-primary-foreground/10 p-4">
        {role ? (
          <>
            <div className="mb-4 text-xs text-center text-primary-foreground/70">
              লগইন আছেন: {isAdmin ? "অ্যাডমিন" : "ইউজার"}
            </div>
            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-danger-foreground bg-danger hover:bg-danger/90 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              লগআউট
            </button>
          </>
        ) : (
          <button
            onClick={() => navigate('/login')}
            className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors"
          >
            <LogOut className="h-5 w-5 rotate-180" />
            লগইন করুন
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
