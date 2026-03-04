import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { AlertCircle, CheckCircle2, RefreshCcw, Download, ShieldAlert, User, Mail, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ConfirmDialog";

const Profile = () => {
  const { user, setUser, role } = useAuth();
  const isAdmin = role === "admin";
  const { toast } = useToast();
  
  const [email, setEmail] = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);
  
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password && password !== confirmPassword) {
      toast({ title: "পাসওয়ার্ড ভুল", description: "পাসওয়ার্ড মিলছে না", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const data = await fetchApi('/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          ...(password ? { password } : {})
        }),
      });
      
      setUser(data.user);
      toast({ title: "সফল", description: "প্রোফাইল আপডেট হয়েছে", type: "success" });
      setPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast({ title: "ব্যর্থ", description: err.message || "আপডেট করা যায়নি", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetLoading(true);
    try {
      await fetchApi('/api/admin/reset-database', { method: 'POST' });
      toast({ title: "রিসেট সফল", description: "সকল ডাটা মুছে ফেলা হয়েছে", type: "success" });
      setIsResetConfirmOpen(false);
      setTimeout(() => window.location.reload(), 1500);
    } catch (error: any) {
      toast({ title: "রিসেট ব্যর্থ", description: error.message, type: "error" });
    } finally {
      setResetLoading(false);
    }
  };

  const handleBackup = async () => {
    setBackupLoading(true);
    try {
      const response = await fetch('/api/admin/backup');
      if (!response.ok) throw new Error("Backup download failed");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `saikat_machinery_backup_${new Date().toISOString().split('T')[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      toast({ title: "ব্যাকআপ সফল", description: "ZIP ফাইলটি ডাউনলোড শুরু হয়েছে", type: "success" });
    } catch (error: any) {
      toast({ title: "ব্যাকআপ ব্যর্থ", description: "সার্ভার থেকে ফাইল জেনারেট করা যায়নি", type: "error" });
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20 px-4 sm:px-0">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
          <div className="h-10 w-2 bg-accent rounded-full" />
          সেটিংস ও প্রোফাইল
        </h1>
        <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">System Configuration & Profile</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left">
        {/* Profile Card */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-primary/5">
          <CardHeader className="bg-primary p-8 text-white">
            <CardTitle className="flex items-center gap-3 text-xl font-black tracking-tight">
              <User className="h-6 w-6 text-accent" />
              ব্যক্তিগত তথ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2 text-left">
                <Label htmlFor="email" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">ইমেইল ঠিকানা</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="pl-12 h-14 bg-background/50 border-primary/10 rounded-2xl focus:ring-primary font-bold shadow-sm" />
                </div>
              </div>

              <div className="pt-6 border-t border-primary/5">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="password" title="পাসওয়ার্ড পরিবর্তন করতে চাইলে নিচের ঘরগুলো পূরণ করুন" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">নতুন পাসওয়ার্ড</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="pl-12 h-14 bg-background/50 border-primary/10 rounded-2xl focus:ring-primary font-bold shadow-sm" />
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="confirmPassword" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">নিশ্চিত করুন</Label>
                    <div className="relative group">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" className="pl-12 h-14 bg-background/50 border-primary/10 rounded-2xl focus:ring-primary font-bold shadow-sm" />
                    </div>
                  </div>
                </div>
              </div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button type="submit" className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-xl" disabled={loading}>
                  {loading ? "অপেক্ষা করুন..." : "প্রোফাইল আপডেট করুন"}
                </Button>
              </motion.div>
            </form>
          </CardContent>
        </Card>

        {/* System Admin Tools */}
        {isAdmin && (
          <div className="space-y-8">
            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-primary/5">
              <CardHeader className="bg-accent/10 border-b border-accent/10 p-6 text-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary flex flex-col items-center gap-2">
                  <Download className="h-6 w-6 text-accent mb-1" /> ডাটাবেস ব্যাকআপ
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-[10px] font-bold text-muted-foreground leading-relaxed text-center">
                  আপনার সকল পণ্য, কাস্টমার এবং মেমো একটি ZIP ফাইলে ডাউনলোড করে নিরাপদে রাখুন।
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={handleBackup} disabled={backupLoading} variant="outline" className="w-full h-12 rounded-xl border-accent/20 text-accent-foreground hover:bg-accent/10 font-black text-[10px] uppercase tracking-[0.1em] shadow-sm">
                    {backupLoading ? "অপেক্ষা করুন..." : "Download Backup.zip"}
                  </Button>
                </motion.div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-xl bg-danger/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-danger/10">
              <CardHeader className="bg-danger/10 border-b border-danger/10 p-6 text-center">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-danger flex flex-col items-center gap-2">
                  <ShieldAlert className="h-6 w-6 text-danger mb-1" /> রিসেট সিস্টেম
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-center">
                <p className="text-[10px] font-black text-danger/60 uppercase leading-relaxed">
                  সতর্কতা: এটি ব্যবহারের ফলে সকল পুরাতন ডাটা চিরতরে মুছে যাবে।
                </p>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button onClick={() => setIsResetConfirmOpen(true)} disabled={resetLoading} variant="destructive" className="w-full h-12 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-danger/20">
                    <RefreshCcw className={cn("mr-2 h-4 w-4", resetLoading && "animate-spin")} />
                    Reset All Data
                  </Button>
                </motion.div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={isResetConfirmOpen}
        onOpenChange={setIsResetConfirmOpen}
        title="সিস্টেম রিসেট"
        description="আপনি কি নিশ্চিত যে আপনি সকল পণ্য, বিক্রয় এবং কাস্টমার ডাটা মুছে ফেলতে চান? এটি আর ফিরিয়ে আনা সম্ভব নয়।"
        onConfirm={handleReset}
        isLoading={resetLoading}
        confirmText="হ্যাঁ, সব মুছে ফেলুন"
      />
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default Profile;
