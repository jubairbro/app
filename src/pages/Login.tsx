import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion } from "motion/react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await fetchApi('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      if (data.user.role === 'admin') {
        navigate("/");
      } else {
        navigate("/inventory");
      }
    } catch (err: any) {
      setError(err.message || "লগইন ব্যর্থ হয়েছে। সঠিক ইমেইল এবং পাসওয়ার্ড দিন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary/5 rounded-full blur-[150px]" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="z-10 w-full max-w-md px-4"
      >
        <div className="text-center mb-8 space-y-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
            className="inline-flex items-center justify-center p-4 bg-primary rounded-2xl shadow-2xl mb-4"
          >
            <ShieldCheck className="h-10 w-10 text-accent" />
          </motion.div>
          <h1 className="text-4xl font-black text-primary tracking-tight">
            মেসার্স সৈকত মেশিনারি
          </h1>
          <p className="text-muted-foreground font-medium flex items-center justify-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            আপনার প্যানেলে স্বাগতম
          </p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(0,0,0,0.1)] bg-card/60 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-primary via-accent to-primary animate-marquee" />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl font-bold text-center">লগইন করুন</CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive font-bold border border-destructive/20"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {error}
                </motion.div>
              )}
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">
                    ইমেইল এড্রেস
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      placeholder="admin@saikat.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="pl-12 h-14 bg-background/50 border-muted-foreground/10 rounded-2xl focus:ring-primary focus:border-primary transition-all text-base font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center ml-1">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">
                      পাসওয়ার্ড
                    </label>
                    <button type="button" className="text-[10px] font-black uppercase tracking-tighter text-primary/60 hover:text-primary">
                      পাসওয়ার্ড ভুলে গেছেন?
                    </button>
                  </div>
                  <div className="relative group">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="pl-12 h-14 bg-background/50 border-muted-foreground/10 rounded-2xl focus:ring-primary focus:border-primary transition-all text-base font-medium"
                    />
                  </div>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button 
                  type="submit" 
                  className="w-full h-14 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 text-base font-black shadow-xl flex items-center justify-center gap-2 group" 
                  disabled={loading}
                >
                  {loading ? (
                    <div className="h-5 w-5 border-3 border-white border-t-transparent animate-spin rounded-full" />
                  ) : (
                    <>
                      লগইন করুন
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </Button>
              </motion.div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  অ্যাকাউন্ট নেই?{" "}
                  <Link to="/register" className="text-primary hover:text-accent font-black transition-colors underline underline-offset-4">
                    নতুন অ্যাকাউন্ট তৈরি করুন
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>

        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground/40 mt-8"
        >
          Secure Access • Mesrs Saikat Machinery • © 2026
        </motion.p>
      </motion.div>
    </div>
  );
};

export default Login;
