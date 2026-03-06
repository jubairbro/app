import { useState } from "react";
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
  Receipt,
  Truck,
  UserCog,
  History,
  ShieldCheck,
  Building2,
  Wallet
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { motion } from "motion/react";
import ConfirmDialog from "@/components/ConfirmDialog";

const Sidebar = ({ onClose }: { onClose?: () => void }) => {
  const { user, role, setUser } = useAuth();
  const isAdmin = role === "admin";
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setIsLogoutConfirmOpen(false);
      navigate('/login');
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const navItems = [
    ...(isAdmin ? [{ to: "/", icon: LayoutDashboard, label: "ড্যাশবোর্ড" }] : []),
    { to: "/inventory", icon: Package, label: "ইনভেন্টরি" },
    ...(isAdmin ? [
      { to: "/sales", icon: ShoppingCart, label: "বিক্রয় কেন্দ্র" },
      { to: "/memos", icon: FileText, label: "মেমো তালিকা" },
      { to: "/due-book", icon: BookOpen, label: "বাকি খাতা" },
      { to: "/expenses", icon: Receipt, label: "খরচের খাতা" },
      { to: "/suppliers", icon: Truck, label: "সাপ্লায়ার" },
      { to: "/staff", icon: UserCog, label: "স্টাফ ম্যানেজমেন্ট" },
      { to: "/stock-history", icon: History, label: "স্টক হিস্ট্রি" },
      { to: "/reports", icon: BarChart3, label: "রিপোর্ট ও লাভ" },
    ] : []),
    { to: "/profile", icon: Settings, label: "সেটিংস" },
  ];

  return (
    <div className="flex h-screen w-64 flex-col bg-card border-r border-border relative shadow-2xl z-50 transition-colors duration-500">
      <div className="flex flex-col items-center justify-center h-32 border-b border-border px-4 text-center bg-muted/20 relative transition-colors duration-500">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl font-black text-primary drop-shadow-sm tracking-tight">মেসার্স সৈকত মেশিনারি</h1>
          <p className="text-[10px] text-muted-foreground mt-1 italic uppercase tracking-widest font-bold">ERP Enterprise</p>
        </motion.div>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar">
        <ul className="space-y-1.5 px-3">
          {navItems.map((item, index) => (
            <motion.li 
              key={item.to}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: index * 0.03 }}
            >
              <NavLink
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-bold transition-all duration-300 group relative overflow-hidden",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 translate-x-1"
                      : "hover:bg-muted/50 hover:translate-x-1 text-muted-foreground hover:text-primary"
                  )
                }
              >
                <item.icon className={cn(
                  "h-5 w-5 transition-all duration-300 group-hover:scale-110",
                  "group-active:scale-90"
                )} />
                {item.label}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border p-5 space-y-4 bg-muted/10 transition-colors duration-500">
        {role ? (
          <>
            <div className="flex items-center gap-3 px-2 text-left text-primary">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black uppercase text-muted-foreground leading-none tracking-widest">{isAdmin ? "Admin" : "Staff"}</span>
                <span className="text-xs font-bold truncate max-w-[120px]">{user?.name || "মোঃ বজলুর রশিদ"}</span>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsLogoutConfirmOpen(true)}
              className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-danger bg-danger/10 shadow-sm hover:bg-danger hover:text-white transition-all border border-danger/20"
            >
              <LogOut className="h-5 w-5" />
              লগআউট করুন
            </motion.button>
          </>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/login')}
            className="flex w-full items-center justify-center gap-3 rounded-xl px-4 py-3 text-sm font-black text-primary bg-primary/10 hover:bg-primary/20 transition-all border border-primary/20"
          >
            <ShieldCheck className="h-5 w-5" />
            লগইন করুন
          </motion.button>
        )}
      </div>

      <ConfirmDialog
        open={isLogoutConfirmOpen}
        onOpenChange={setIsLogoutConfirmOpen}
        title="লগআউট নিশ্চিত করুন"
        description="আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?"
        onConfirm={handleLogout}
        confirmText="হ্যাঁ, লগআউট করুন"
        variant="destructive"
      />
    </div>
  );
};

export default Sidebar;
