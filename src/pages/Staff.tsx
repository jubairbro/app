import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  UserCircle, 
  Mail, 
  Key, 
  Trash2, 
  Lock, 
  MoreVertical,
  Circle,
  UserCog,
  Shield,
  Activity,
  UserX,
  Calendar
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import ConfirmDialog from "@/components/ConfirmDialog";
import { cn } from "@/lib/utils";

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
}

const Staff = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form State
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("staff");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete/Suspend State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<number | null>(null);

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      // Mocking for now, would be /api/users
      const data = [
        { id: 1, name: "Md. Bazlur Rashid", email: "admin@saikat.com", role: "admin", status: "active", createdAt: "2026-03-01" },
        { id: 2, name: "Staff Member", email: "staff@saikat.com", role: "staff", status: "active", createdAt: "2026-03-02" }
      ];
      setStaff(data);
    } catch (error) {
      toast({ title: "ভুল হয়েছে", description: "স্টাফ তালিকা পাওয়া যায়নি", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      // API Call
      toast({ title: "সফল", description: "নতুন স্টাফ অ্যাকাউন্ট তৈরি হয়েছে", type: "success" });
      setIsAddOpen(false);
      setName(""); setEmail(""); setPassword("");
      fetchStaff();
    } catch (error) {
      toast({ title: "ব্যর্থ", description: "অ্যাকাউন্ট তৈরি করা যায়নি", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-primary/5 shadow-xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
            <UserCog className="h-10 w-10 text-accent" />
            স্টাফ ও ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Employees & Access Control</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-14 px-8 shadow-xl bg-primary text-white hover:bg-primary/90 font-black">
            <UserPlus className="mr-2 h-6 w-6" />
            নতুন স্টাফ
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-none shadow-xl bg-primary/5 rounded-[2rem] p-6 text-center">
          <Activity className="h-8 w-8 text-primary mx-auto mb-2" />
          <div className="text-2xl font-black text-primary">{staff.length}</div>
          <div className="text-[10px] font-black uppercase text-muted-foreground">মোট মেম্বার</div>
        </Card>
        <Card className="border-none shadow-xl bg-green-500/5 rounded-[2rem] p-6 text-center">
          <ShieldCheck className="h-8 w-8 text-green-600 mx-auto mb-2" />
          <div className="text-2xl font-black text-green-600">১</div>
          <div className="text-[10px] font-black uppercase text-muted-foreground">অ্যাডমিন</div>
        </Card>
        <Card className="border-none shadow-xl bg-accent/5 rounded-[2rem] p-6 text-center">
          <Users className="h-8 w-8 text-accent mx-auto mb-2" />
          <div className="text-2xl font-black text-accent">{staff.length - 1}</div>
          <div className="text-[10px] font-black uppercase text-muted-foreground">সাধারণ স্টাফ</div>
        </Card>
        <Card className="border-none shadow-xl bg-blue-500/5 rounded-[2rem] p-6 text-center">
          <Circle className="h-8 w-8 text-blue-600 mx-auto mb-2 fill-blue-600/20" />
          <div className="text-2xl font-black text-blue-600">{staff.length}</div>
          <div className="text-[10px] font-black uppercase text-muted-foreground">অনলাইন</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {staff.map((member, idx) => (
            <motion.div
              key={member.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-primary/5">
                <div className="p-8 text-center border-b border-primary/5 bg-primary/5">
                  <div className="relative inline-block">
                    <div className="h-24 w-24 rounded-[2rem] bg-gradient-to-tr from-primary to-accent p-1 shadow-lg">
                      <div className="h-full w-full rounded-[1.8rem] bg-card flex items-center justify-center">
                        <UserCircle className="h-16 w-16 text-primary/20" />
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-green-500 border-4 border-card shadow-sm" title="Active" />
                  </div>
                  <h3 className="mt-4 text-xl font-black text-primary tracking-tight">{member.name}</h3>
                  <div className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mt-2 border shadow-sm",
                    member.role === 'admin' ? "bg-accent/10 text-accent border-accent/20" : "bg-primary/5 text-primary border-primary/10"
                  )}>
                    <Shield className="h-2.5 w-2.5" /> {member.role}
                  </div>
                </div>

                <CardContent className="p-8 space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                      <Mail className="h-4 w-4 text-primary/40" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                      <Calendar className="h-4 w-4 text-primary/40" />
                      জয়েনিং: {member.createdAt}
                    </div>
                  </div>

                  <div className="pt-6 border-t border-primary/5 flex gap-3">
                    <Button variant="outline" className="flex-1 rounded-xl font-black text-[10px] uppercase tracking-widest h-11 border-primary/10 hover:bg-primary/5 group">
                      <Lock className="h-3.5 w-3.5 mr-2 group-hover:text-primary" /> অ্যাক্সেস
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="rounded-xl h-11 w-11 text-danger hover:bg-danger/10"
                      onClick={() => {
                        setStaffToDelete(member.id);
                        setIsDeleteOpen(true);
                      }}
                    >
                      <UserX className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-card/80 backdrop-blur-2xl">
          <div className="bg-primary p-8 text-white text-left">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4">
                <UserPlus className="h-8 w-8 text-accent" />
                নতুন মেম্বার
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleAddStaff} className="p-10 space-y-8">
            <div className="grid gap-6 text-left">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">স্টাফের নাম</Label>
                <Input 
                  className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                  value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="সম্পূর্ণ নাম" required
                />
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">ইমেইল ঠিকানা</Label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    className="pl-12 h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                    type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@saikat.com" required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">পাসওয়ার্ড</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                    type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••" required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">রোল (Role)</Label>
                  <Select 
                    className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                    value={role} onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="staff">Staff Member</option>
                    <option value="admin">Administrator</option>
                  </Select>
                </div>
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[2rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/30">
                {isSubmitting ? "তৈরি হচ্ছে..." : "অ্যাকাউন্ট তৈরি করুন"}
              </Button>
            </motion.div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="অ্যাকাউন্ট সাসপেন্ড"
        description="আপনি কি নিশ্চিত যে এই স্টাফ মেম্বারের অ্যাক্সেস বন্ধ করতে চান?"
        onConfirm={() => {
          setIsDeleteOpen(false);
          toast({ title: "সফল", description: "স্টাফ অ্যাকাউন্ট সাসপেন্ড করা হয়েছে", type: "success" });
        }}
        confirmText="হ্যাঁ, বন্ধ করুন"
      />
    </div>
  );
};

export default Staff;
