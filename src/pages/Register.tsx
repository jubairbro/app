import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, Mail, UserPlus, ArrowLeft, ShieldCheck, CheckCircle2 } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion } from "motion/react";

const Register = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      return setError("পাসওয়ার্ড মিলছে না।");
    }

    setLoading(true);

    try {
      const data = await fetchApi('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      setUser(data.user);
      navigate("/inventory");
    } catch (err: any) {
      setError(err.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে। অন্য ইমেইল দিয়ে চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden font-sans">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-15%] right-[-15%] w-[50%] h-[50%] bg-accent/10 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-15%] left-[-15%] w-[50%] h-[50%] bg-primary/10 rounded-full blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="z-10 w-full max-w-lg px-4"
      >
        <Link to="/login" className="inline-flex items-center gap-2 text-primary hover:text-accent font-black uppercase tracking-tighter text-xs mb-6 group transition-colors">
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          লগইন-এ ফিরে যান
        </Link>

        <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.12)] bg-card/60 backdrop-blur-2xl rounded-[2.5rem] overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-accent via-primary to-accent animate-marquee" />
          <CardHeader className="text-center pt-10">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center p-4 bg-accent/20 rounded-2xl mb-4"
            >
              <UserPlus className="h-8 w-8 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl font-black text-primary tracking-tight">নতুন অ্যাকাউন্ট</CardTitle>
            <p className="text-muted-foreground font-medium">মেসার্স সৈকত মেশিনারি-তে আপনাকে স্বাগতম</p>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 rounded-2xl bg-destructive/10 p-4 text-sm text-destructive font-bold border border-destructive/20"
                >
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  <p>{error}</p>
                </motion.div>
              )}
              
              <div className="grid gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">ইমেইল এড্রেস</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                    <Input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="আপনার ইমেইল দিন"
                      className="pl-12 h-14 bg-background/40 border-muted-foreground/10 rounded-2xl focus:ring-primary focus:border-primary transition-all text-base font-medium"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">পাসওয়ার্ড</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="পাসওয়ার্ড"
                        className="pl-12 h-14 bg-background/40 border-muted-foreground/10 rounded-2xl focus:ring-primary focus:border-primary transition-all text-base font-medium"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black uppercase tracking-widest text-muted-foreground ml-1">কনফার্ম করুন</label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="আবার দিন"
                        className="pl-12 h-14 bg-background/40 border-muted-foreground/10 rounded-2xl focus:ring-primary focus:border-primary transition-all text-base font-medium"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-primary/5 rounded-xl border border-primary/10">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                <p className="text-[10px] font-bold text-muted-foreground leading-tight">
                  অ্যাকাউন্ট তৈরির মাধ্যমে আপনি আমাদের সকল নিয়মাবলি মেনে নিচ্ছেন।
                </p>
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
                      রেজিস্ট্রেশন করুন
                      <ShieldCheck className="h-5 w-5 transition-transform group-hover:scale-110" />
                    </>
                  )}
                </Button>
              </motion.div>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  আগে থেকে অ্যাকাউন্ট আছে?{" "}
                  <Link to="/login" className="text-primary hover:text-accent font-black transition-colors underline underline-offset-4">
                    লগইন করুন
                  </Link>
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Register;
