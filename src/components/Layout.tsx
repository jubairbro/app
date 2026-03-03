import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, Calculator as CalculatorIcon, Clock, Sun, Moon, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogTrigger } from "./ui/dialog";
import Calculator from "./Calculator";
import { useAuth } from "@/contexts/AuthContext";

const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [time, setTime] = useState(new Date());
  const [isDarkMode, setIsDarkMode] = useState(false);
  const { role } = useAuth();
  const isAdmin = role === "admin";

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  return (
    <div className="flex h-screen bg-background font-sans overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
      `}>
        <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Marquee & Header */}
        <header className="bg-card border-b z-30">
          {/* Marquee */}
          <div className="bg-primary text-primary-foreground py-1 overflow-hidden whitespace-nowrap">
            <div className="animate-marquee inline-block">
              <span className="mx-4">বিসমিল্লাহ স্টোর - আপনার বিশ্বস্ত প্রতিষ্ঠান</span>
              <span className="mx-4">•</span>
              <span className="mx-4">মেসার্স সৈকত মেশিনারি - প্রোঃ মোঃ বজলুর রশিদ</span>
              <span className="mx-4">•</span>
              <span className="mx-4">যেকোনো প্রয়োজনে যোগাযোগ করুন</span>
            </div>
          </div>

          {/* Top Bar */}
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="md:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div className="hidden sm:flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">
                  {time.toLocaleTimeString('bn-BD')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isAdmin && (
                <Button variant="outline" size="sm" asChild className="hidden sm:flex">
                  <Link to="/inventory">
                    <Plus className="h-4 w-4 mr-2" />
                    নতুন পণ্য
                  </Link>
                </Button>
              )}
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={() => setIsDarkMode(!isDarkMode)}
                title="থিম পরিবর্তন"
              >
                {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon" title="ক্যালকুলেটর">
                    <CalculatorIcon className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-auto p-0 border-none bg-transparent shadow-none">
                  <Calculator />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
