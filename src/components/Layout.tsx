import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, X, Calculator as CalculatorIcon, Clock, Sun, Moon, Plus, Bell, Smartphone, Monitor } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "./ui/dialog";
import Calculator from "./Calculator";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDesktopSidebarOpen, setIsDesktopSidebarOpen] = useState(true);
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const location = useLocation();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await fetchApi('/api/notifications');
        setNotifications(data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      }
    };
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden transition-colors duration-500">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div 
        layout
        className={cn(
          "fixed inset-y-0 left-0 z-50 shadow-2xl overflow-hidden md:relative",
          isMobileMenuOpen ? "translate-x-0 w-64" : "-translate-x-full w-64 md:translate-x-0",
          isDesktopSidebarOpen ? "md:w-64" : "md:w-0"
        )}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="w-64 h-full">
          <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Marquee & Header */}
        <header className="bg-card/80 backdrop-blur-md border-b border-border z-30 sticky top-0 shadow-sm transition-colors duration-500">
          {/* Marquee */}
          <div className="bg-primary dark:bg-muted/30 text-accent py-2.5 overflow-hidden whitespace-nowrap shadow-inner border-b border-border relative z-10 backdrop-blur-md transition-colors duration-500">
            <div className="animate-marquee inline-block">
               <span className="mx-12 font-black text-[15px] tracking-wide text-green-400 dark:text-yellow-400 drop-shadow-md">বিসমিল্লাহির রাহমানির রাহিম</span>
               <span className="mx-8 text-accent/50">●</span>
               <span className="mx-12 font-black text-[15px] tracking-wide text-cyan-300 dark:text-cyan-400 drop-shadow-md">আসসালামু আলাইকুম</span>
               <span className="mx-8 text-accent/50">✦</span>
               <span className="mx-12 font-black text-[15px] tracking-wide text-yellow-300 dark:text-green-400 drop-shadow-md">মেসার্স সৈকত মেশিনারি - প্রোঃ মোঃ বজলুর রশিদ (ভুট্টু)</span>
               <span className="mx-8 text-accent/50">✦</span>
               <span className="mx-12 font-black text-[15px] tracking-wide text-white dark:text-white drop-shadow-md">আমাদের ঠিকানা: রানীর হাট, তারাশ, সিরাজগঞ্জ। যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন।</span>
            </div>
          </div>

          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 h-16">
            <div className="flex items-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="hover:bg-primary/10 rounded-full relative overflow-hidden"
                  onClick={() => {
                    if (window.innerWidth < 768) {
                      setIsMobileMenuOpen(!isMobileMenuOpen);
                    } else {
                      setIsDesktopSidebarOpen(!isDesktopSidebarOpen);
                    }
                  }}
                >
                  {/* Mobile Icons */}
                  <Menu className={cn("h-6 w-6 absolute transition-all duration-500 md:hidden", isMobileMenuOpen ? "opacity-0 scale-50 rotate-180" : "opacity-100 scale-100 rotate-0")} />
                  <X className={cn("h-6 w-6 absolute transition-all duration-500 md:hidden", isMobileMenuOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-180")} />
                  
                  {/* Desktop Icons */}
                  <Menu className={cn("h-6 w-6 absolute transition-all duration-500 hidden md:block", isDesktopSidebarOpen ? "opacity-0 scale-50 rotate-180" : "opacity-100 scale-100 rotate-0")} />
                  <X className={cn("h-6 w-6 absolute transition-all duration-500 hidden md:block", isDesktopSidebarOpen ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-180")} />
                </Button>
              </motion.div>
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 bg-muted/40 rounded-full text-muted-foreground border border-muted-foreground/10">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-sm font-bold tracking-wider">
                  {time.toLocaleTimeString('bn-BD')}
                </span>
              </div>
              <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-muted-foreground/60 px-3 py-1 bg-accent/5 rounded-full uppercase tracking-tighter">
                <Monitor className="h-3 w-3" />
                <span>PC View</span>
                <span className="mx-1 opacity-20">|</span>
                <Smartphone className="h-3 w-3" />
                <span>Mobile Ready</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button variant="default" size="sm" asChild className="hidden sm:flex shadow-md bg-accent text-accent-foreground hover:bg-accent/90 rounded-full px-5">
                    <Link to="/inventory">
                      <Plus className="h-4 w-4 mr-2 stroke-[3px]" />
                      নতুন পণ্য
                    </Link>
                  </Button>
                </motion.div>
              )}
              
              <div className="flex items-center gap-1 bg-muted/20 p-1 rounded-full border border-muted-foreground/5">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full h-9 w-9 relative overflow-hidden"
                    onClick={() => setIsDarkMode(!isDarkMode)}
                    title="থিম পরিবর্তন"
                  >
                    <Sun className={cn("h-5 w-5 text-yellow-500 absolute transition-all duration-500", isDarkMode ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100")} />
                    <Moon className={cn("h-5 w-5 text-blue-500 absolute transition-all duration-500", isDarkMode ? "opacity-100 rotate-0 scale-100" : "opacity-0 -rotate-90 scale-50")} />
                  </Button>
                </motion.div>

                <Dialog>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9" title="নোটিফিকেশন">
                        <Bell className="h-5 w-5 transition-all duration-300 hover:rotate-12" />
                        {notifications.length > 0 && (
                          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[9px] font-black text-white animate-pulse border-2 border-card shadow-lg">
                            {notifications.length > 99 ? "99+" : notifications.length}
                          </span>
                        )}
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="rounded-[2rem] border-border bg-card shadow-2xl p-0 overflow-hidden sm:max-w-[400px] sm:absolute sm:top-20 sm:right-32 sm:translate-x-0 sm:translate-y-0">
                    <DialogHeader className="bg-muted/30 p-6 border-b border-border">
                      <DialogTitle className="flex items-center gap-3 text-xl font-black">
                        <div className="p-2 bg-primary/10 rounded-xl">
                          <Bell className="h-5 w-5 text-primary" />
                        </div>
                        নোটিফিকেশন
                      </DialogTitle>
                    </DialogHeader>
                    <div className="p-4 space-y-3 max-h-[60vh] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n: any, idx) => (
                          <motion.div 
                            key={n.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 border border-border rounded-2xl bg-muted/20 hover:bg-muted/40 transition-colors shadow-sm group"
                          >
                            <h4 className="font-black text-sm text-primary group-hover:text-accent transition-colors">{n.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed font-medium">{n.message}</p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                          <div className="p-4 rounded-full bg-muted/30">
                            <Bell className="h-8 w-8 opacity-20" />
                          </div>
                          <span className="font-bold text-sm">কোনো নতুন নোটিফিকেশন নেই</span>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" title="ক্যালকুলেটর">
                        <CalculatorIcon className="h-5 w-5 transition-all duration-300" />
                      </Button>
                    </motion.div>
                  </DialogTrigger>
                  <DialogContent className="w-full max-w-[90vw] sm:max-w-none sm:w-auto p-0 border-none bg-transparent shadow-none sm:absolute sm:top-20 sm:right-20 sm:translate-x-0 sm:translate-y-0 flex justify-center">
                    <Calculator />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/10 relative z-10 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 15, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.99 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="h-full"
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

// Add helper class for custom scrollbar
const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default Layout;
