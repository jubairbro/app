import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FileText, 
  BookOpen, 
  BarChart3, 
  User,
  LogOut,
  X,
  Settings,
  HelpCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { motion } from "motion/react";

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
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
    { to: "/profile", icon: User, label: "প্রোফাইল" },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-primary text-primary-foreground relative shadow-2xl">
      <div className="flex flex-col items-center justify-center h-28 border-b border-primary-foreground/10 px-4 text-center bg-primary-foreground/5">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl font-bold text-accent drop-shadow-md">মেসার্স সৈকত মেশিনারি</h1>
          <p className="text-xs text-primary-foreground/70 mt-1 italic">প্রোঃ মোঃ বজলুর রশিদ</p>
        </motion.div>
        
        {/* Mobile Close Button */}
        {onClose && (
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 close-button md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {navItems.map((item, index) => (
            <motion.li 
              key={item.to}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.05 }}
            >
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all duration-200 group",
                    isActive
                      ? "bg-accent text-accent-foreground shadow-lg scale-105"
                      : "hover:bg-primary-foreground/10 hover:translate-x-1"
                  )
                }
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-transform duration-200 group-hover:scale-110",
                  "group-active:scale-95"
                )} />
                {item.label}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-primary-foreground/10 p-4 space-y-4 bg-primary-foreground/5">
        {role ? (
          <>
            <div className="text-xs text-center text-primary-foreground/60 font-medium">
              লগইন আছেন: <span className="text-accent">{isAdmin ? "অ্যাডমিন" : "ইউজার"}</span>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold text-danger-foreground bg-danger shadow-md hover:bg-danger/90 transition-all"
            >
              <LogOut className="h-5 w-5" />
              লগআউট
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-3 rounded-lg px-4 py-2.5 text-sm font-bold text-primary-foreground bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-all border border-primary-foreground/20"
          >
            <LogOut className="h-5 w-5 rotate-180" />
            লগইন করুন
          </motion.button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
