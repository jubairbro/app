import { useState, useEffect } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, Calculator as CalculatorIcon, Clock, Sun, Moon, Plus, Bell, Smartphone, Monitor } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle } from "./ui/dialog";
import Calculator from "./Calculator";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-500 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:translate-x-0 shadow-2xl",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Marquee & Header */}
        <header className="bg-card/80 backdrop-blur-md border-b z-30 sticky top-0 shadow-sm">
          {/* Marquee */}
          <div className="bg-primary text-primary-foreground py-2 overflow-hidden whitespace-nowrap shadow-inner border-b border-white/5">
            <div className="animate-marquee inline-block">
               <span className="mx-12 font-bold text-sm tracking-wide">বিসমিল্লাহির রাহমানির রাহিম</span>
               <span className="mx-12 text-accent">●</span>
               <span className="mx-12 font-bold text-sm tracking-wide">আসসালামু আলাইকুম</span>
               <span className="mx-12 text-accent">✦</span>
               <span className="mx-12 font-bold text-sm tracking-wide">মেসার্স সৈকত মেশিনারি - প্রোঃ মোঃ বজলুর রশিদ (ভুট্টু)</span>
               <span className="mx-12 text-accent">✦</span>
               <span className="mx-12 font-bold text-sm tracking-wide">আমাদের ঠিকানা: মেসার্স সৈকত মেশিনারি এন্টারপ্রাইজ, (সৈকত বিল্ডিং), বাজার রোড, পটুয়াখালী। যেকোনো প্রয়োজনে সরাসরি যোগাযোগ করুন।</span>
            </div>

          </div>

          {/* Top Bar */}
          <div className="flex items-center justify-between p-4 h-16">
            <div className="flex items-center gap-4">
              <motion.div whileTap={{ scale: 0.9 }}>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="md:hidden hover:bg-primary/10 rounded-full"
                  onClick={() => setIsMobileMenuOpen(true)}
                >
                  <Menu className="h-6 w-6" />
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
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full h-9 w-9"
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title="থিম পরিবর্তন"
                >
                  {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-blue-500" />}
                </Button>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="relative rounded-full h-9 w-9" title="নোটিফিকেশন">
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-danger text-[9px] font-black text-white animate-pulse border-2 border-card shadow-lg">
                          {notifications.length > 99 ? "99+" : notifications.length}
                        </span>
                      )}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-primary" />
                        নোটিফিকেশন
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 mt-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((n: any, idx) => (
                          <motion.div 
                            key={n.id} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="p-4 border border-primary/10 rounded-xl bg-primary/5 hover:bg-primary/10 transition-colors"
                          >
                            <h4 className="font-bold text-sm text-primary">{n.title}</h4>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{n.message}</p>
                          </motion.div>
                        ))
                      ) : (
                        <div className="text-center py-12 text-muted-foreground flex flex-col items-center gap-3">
                          <Bell className="h-10 w-10 opacity-20" />
                          <span>কোনো নতুন নোটিফিকেশন নেই</span>
                        </div>
                      )}
                    </div>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full h-9 w-9" title="ক্যালকুলেটর">
                      <CalculatorIcon className="h-5 w-5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="w-auto p-0 border-none bg-transparent shadow-none">
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
