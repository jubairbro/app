import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Lock, Mail, ShieldAlert, ArrowRight, CheckCircle2, RefreshCcw, ArrowLeft } from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";

type Step = "email" | "password" | "confirm";

const Reset = () => {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email) {
      setError("অ্যাডমিন ইমেইল লিখুন");
      return;
    }
    setStep("password");
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!password) {
      setError("অ্যাডমিন পাসওয়ার্ড দিন");
      return;
    }
    setStep("confirm");
  };

  const handleConfirmReset = async () => {
    setError("");
    setLoading(true);
    try {
      await fetchApi('/api/admin/reset-database', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/");
        window.location.reload();
      }, 3000);
    } catch (err: any) {
      setError(err.message || "রিসেট ব্যর্থ হয়েছে। সঠিক ইমেইল ও পাসওয়ার্ড দিন।");
      setStep("email");
      setPassword("");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background font-sans">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-6"
        >
          <div className="inline-flex items-center justify-center p-6 bg-green-500/10 rounded-3xl">
            <CheckCircle2 className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-3xl font-black text-primary">রিসেট সফল হয়েছে!</h2>
          <p className="text-muted-foreground font-bold">সকল ডাটা মুছে ফেলা হয়েছে। ড্যাশবোর্ডে ফিরে যাচ্ছে...</p>
          <div className="h-8 w-8 border-4 border-primary border-t-transparent animate-spin rounded-full mx-auto" />
        </motion.div>
      </div>
    );
  }

  const stepIndicator = (
    <div className="flex items-center justify-center gap-3 mb-8">
      {["email", "password", "confirm"].map((s, i) => (
        <React.Fragment key={s}>
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center font-black text-sm transition-all duration-500 border-2",
            step === s 
              ? "bg-danger text-white border-danger shadow-lg shadow-danger/30 scale-110" 
              : ["email", "password", "confirm"].indexOf(step) > i 
                ? "bg-danger/20 text-danger border-danger/30"
                : "bg-muted/50 text-muted-foreground border-muted-foreground/20"
          )}>
            {i + 1}
          </div>
          {i < 2 && (
            <div className={cn(
              "h-1 w-8 rounded-full transition-all duration-500",
              ["email", "password", "confirm"].indexOf(step) > i ? "bg-danger/40" : "bg-muted-foreground/10"
            )} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background relative overflow-hidden font-sans">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-danger/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-danger/5 rounded-full blur-[120px]" />

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
            className="inline-flex items-center justify-center p-4 bg-danger/10 rounded-2xl shadow-xl mb-4"
          >
            <ShieldAlert className="h-10 w-10 text-danger" />
          </motion.div>
          <h1 className="text-3xl font-black text-danger tracking-tight">
            সিস্টেম রিসেট
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            সকল ডাটা মুছে ফেলতে অ্যাডমিন যাচাই প্রয়োজন
          </p>
        </div>

        <Card className="border-none shadow-[0_20px_50px_rgba(239,68,68,0.1)] bg-card/60 backdrop-blur-2xl rounded-[2rem] overflow-hidden">
          <div className="h-2 w-full bg-gradient-to-r from-danger via-danger/50 to-danger" />
          
          <CardContent className="p-8">
            {stepIndicator}

            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-3 rounded-2xl bg-danger/10 p-4 text-sm text-danger font-bold border border-danger/20 mb-6"
              >
                <AlertCircle className="h-5 w-5 shrink-0" />
                {error}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {step === "email" && (
                <motion.form
                  key="email"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  onSubmit={handleEmailSubmit}
                  className="space-y-6"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-black text-primary">ধাপ ১: ইমেইল যাচাই</h3>
                    <p className="text-xs text-muted-foreground font-bold mt-1">অ্যাডমিন ইমেইল ঠিকানা দিন</p>
                  </div>
                  <div className="space-y-2">
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-danger transition-colors" />
                      <Input
                        type="email"
                        placeholder="admin@saikat.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                        className="pl-12 h-14 bg-background/50 border-danger/10 rounded-2xl focus:ring-danger focus:border-danger transition-all text-base font-medium"
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-14 rounded-2xl bg-danger text-white hover:bg-danger/90 text-base font-black shadow-xl flex items-center justify-center gap-2 group"
                  >
                    পরবর্তী ধাপ
                    <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Button>
                </motion.form>
              )}

              {step === "password" && (
                <motion.form
                  key="password"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  onSubmit={handlePasswordSubmit}
                  className="space-y-6"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-black text-primary">ধাপ ২: পাসওয়ার্ড যাচাই</h3>
                    <p className="text-xs text-muted-foreground font-bold mt-1">অ্যাডমিন পাসওয়ার্ড দিন</p>
                  </div>
                  <div className="p-3 bg-danger/5 rounded-xl border border-danger/10 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-danger/60">ইমেইল: </span>
                    <span className="text-sm font-bold text-primary">{email}</span>
                  </div>
                  <div className="space-y-2">
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-danger transition-colors" />
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        autoFocus
                        className="pl-12 h-14 bg-background/50 border-danger/10 rounded-2xl focus:ring-danger focus:border-danger transition-all text-base font-medium"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => { setStep("email"); setError(""); }}
                      className="flex-1 h-14 rounded-2xl font-black"
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> পেছনে
                    </Button>
                    <Button 
                      type="submit" 
                      className="flex-[2] h-14 rounded-2xl bg-danger text-white hover:bg-danger/90 text-base font-black shadow-xl flex items-center justify-center gap-2 group"
                    >
                      পরবর্তী ধাপ
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </motion.form>
              )}

              {step === "confirm" && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-4">
                    <h3 className="text-lg font-black text-danger">ধাপ ৩: চূড়ান্ত নিশ্চিতকরণ</h3>
                  </div>

                  <div className="bg-danger/5 border-2 border-danger/20 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-3 text-danger">
                      <ShieldAlert className="h-8 w-8" />
                      <div>
                        <h4 className="font-black text-sm">চূড়ান্ত সতর্কতা</h4>
                        <p className="text-[10px] font-bold text-danger/70">এই কাজটি আর ফিরিয়ে আনা সম্ভব নয়!</p>
                      </div>
                    </div>
                    <ul className="text-xs font-bold text-danger/80 space-y-2 ml-2">
                      <li>- সকল পণ্য মুছে যাবে</li>
                      <li>- সকল বিক্রয় ও মেমো মুছে যাবে</li>
                      <li>- সকল কাস্টমার ডাটা মুছে যাবে</li>
                      <li>- সকল খরচ ও সাপ্লায়ার মুছে যাবে</li>
                      <li className="text-green-600">+ অ্যাডমিন ও স্টাফ অ্যাকাউন্ট থাকবে</li>
                    </ul>
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      type="button"
                      variant="ghost"
                      onClick={() => { setStep("password"); setError(""); }}
                      className="flex-1 h-14 rounded-2xl font-black"
                      disabled={loading}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" /> পেছনে
                    </Button>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex-[2]">
                      <Button 
                        onClick={handleConfirmReset}
                        disabled={loading}
                        className="w-full h-14 rounded-2xl bg-danger text-white hover:bg-danger/90 text-base font-black shadow-xl shadow-danger/20"
                      >
                        {loading ? (
                          <RefreshCcw className="h-5 w-5 animate-spin mr-2" />
                        ) : (
                          <ShieldAlert className="h-5 w-5 mr-2" />
                        )}
                        {loading ? "রিসেট হচ্ছে..." : "হ্যাঁ, সব মুছে ফেলুন"}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="mt-6 text-center">
              <button 
                onClick={() => navigate("/")}
                className="text-xs font-bold text-muted-foreground hover:text-primary transition-colors underline underline-offset-4"
              >
                ড্যাশবোর্ডে ফিরে যান
              </button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default Reset;
