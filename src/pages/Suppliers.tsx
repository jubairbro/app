import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Truck, 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Wallet, 
  ExternalLink,
  Edit,
  Trash2,
  Building2,
  PhoneCall,
  History,
  CheckCircle2
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  totalBalance: number;
  createdAt: string;
}

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form State
  const [name, setName] = useState("");
  const [contactPerson, setContactPerson] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Payment State
  const [isPayOpen, setIsPayOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [payAmount, setPayAmount] = useState("");

  const fetchSuppliers = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi('/api/suppliers');
      setSuppliers(data);
    } catch (error) {
      toast({ title: "ভুল হয়েছে", description: "সাপ্লায়ার তালিকা পাওয়া যায়নি", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await fetchApi('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, contactPerson, phone, email, address })
      });
      toast({ title: "সফল", description: "নতুন সাপ্লায়ার যুক্ত হয়েছে", type: "success" });
      setIsAddOpen(false);
      setName(""); setContactPerson(""); setPhone(""); setEmail(""); setAddress("");
      fetchSuppliers();
    } catch (error) {
      toast({ title: "ব্যর্থ", description: "সেভ করা সম্ভব হয়নি", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayment = async () => {
    if (!selectedSupplier || !payAmount) return;
    setIsSubmitting(true);
    try {
      await fetchApi(`/api/suppliers/${selectedSupplier.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(payAmount) })
      });
      toast({ title: "সফল", description: "পেমেন্ট সফল হয়েছে", type: "success" });
      setIsPayOpen(false);
      setPayAmount("");
      fetchSuppliers();
    } catch (error) {
      toast({ title: "ব্যর্থ", description: "পেমেন্ট করা সম্ভব হয়নি", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-primary/5 shadow-xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
            <Truck className="h-10 w-10 text-accent" />
            সাপ্লায়ার ম্যানেজমেন্ট
          </h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Supplier & Wholesale Partners</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-14 px-8 shadow-xl bg-primary text-white hover:bg-primary/90 font-black">
            <Plus className="mr-2 h-6 w-6" />
            নতুন সাপ্লায়ার
          </Button>
        </motion.div>
      </div>

      <div className="relative group max-w-xl text-left">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="সাপ্লায়ার বা কোম্পানির নাম..."
          className="pl-12 h-14 rounded-2xl bg-card/50 backdrop-blur-md border-primary/5 focus:ring-primary shadow-inner text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
          {filteredSuppliers.map((supplier, idx) => (
            <motion.div
              key={supplier.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -10 }}
            >
              <Card className="overflow-hidden border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] border border-primary/5 h-full flex flex-col">
                <div className="p-8 pb-4 flex items-start justify-between">
                  <div className="h-16 w-16 rounded-2xl bg-primary/5 flex items-center justify-center text-primary shadow-inner border border-primary/5">
                    <Building2 className="h-8 w-8" />
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">ব্যালেন্স</div>
                    <div className={cn("text-2xl font-black tracking-tighter", supplier.totalBalance > 0 ? "text-danger" : "text-green-600")}>
                      {formatCurrency(Math.abs(supplier.totalBalance))}
                    </div>
                  </div>
                </div>

                <CardContent className="p-8 pt-4 flex-1">
                  <h3 className="text-xl font-black text-primary tracking-tight mb-4">{supplier.name}</h3>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm font-bold text-muted-foreground">
                      <div className="p-2 bg-muted/50 rounded-lg"><User className="h-3 w-3" /></div>
                      {supplier.contactPerson || "কন্টাক্ট পারসন নেই"}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-black text-primary">
                      <div className="p-2 bg-primary/5 rounded-lg text-primary"><PhoneCall className="h-3 w-3" /></div>
                      {supplier.phone}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                      <div className="p-2 bg-muted/50 rounded-lg"><MapPin className="h-3 w-3" /></div>
                      {supplier.address || "ঠিকানা দেওয়া নেই"}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-primary/5 grid grid-cols-2 gap-4">
                    <Button variant="outline" className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 border-primary/10 hover:bg-primary/5">
                      <History className="h-3.5 w-3.5 mr-2" /> হিস্ট্রি
                    </Button>
                    <Button 
                      className="rounded-xl font-black text-[10px] uppercase tracking-widest h-11 bg-primary shadow-lg"
                      onClick={() => {
                        setSelectedSupplier(supplier);
                        setIsPayOpen(true);
                      }}
                    >
                      <Wallet className="h-3.5 w-3.5 mr-2" /> পেমেন্ট
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filteredSuppliers.length === 0 && !isLoading && (
        <div className="py-32 text-center flex flex-col items-center gap-4 opacity-20 font-black">
          <Truck className="h-24 w-24" />
          <p className="uppercase tracking-[0.3em] text-sm">কোনো সাপ্লায়ার পাওয়া যায়নি</p>
        </div>
      )}

      {/* Add Supplier Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-card/80 backdrop-blur-2xl">
          <div className="bg-primary p-8 text-white flex justify-between items-center">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4 text-left">
                <Truck className="h-8 w-8 text-accent" />
                নতুন সাপ্লায়ার যোগ
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleAddSupplier} className="p-10 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">কোম্পানি বা সাপ্লায়ারের নাম</Label>
                <div className="relative group">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input 
                    className="pl-12 h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                    value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="সাপ্লায়ারের নাম লিখুন" required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">কন্টাক্ট পারসন</Label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input className="pl-12 h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                    value={contactPerson} onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="নাম"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">মোবাইল নম্বর</Label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                  <Input className="pl-12 h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                    value={phone} onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭XXXXXXXX" required
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">ঠিকানা</Label>
                <Input className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                  value={address} onChange={(e) => setAddress(e.target.value)}
                  placeholder="সাপ্লায়ারের পূর্ণ ঠিকানা"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[2rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/30">
                {isSubmitting ? "প্রসেস হচ্ছে..." : "সাপ্লায়ার সেভ করুন"}
              </Button>
            </motion.div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPayOpen} onOpenChange={setIsPayOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-card/80 backdrop-blur-2xl">
          <div className="bg-primary p-8 text-white text-left">
            <h2 className="text-2xl font-black tracking-tight flex items-center gap-3">
              <Wallet className="h-6 w-6 text-accent" />
              সাপ্লায়ার পেমেন্ট
            </h2>
          </div>
          <div className="p-10 space-y-8">
            <div className="text-center">
              <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">প্রাপক</div>
              <div className="text-2xl font-black text-primary">{selectedSupplier?.name}</div>
            </div>
            <div className="space-y-2 text-left">
              <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">পেমেন্টের পরিমাণ</Label>
              <Input 
                className="h-16 rounded-2xl bg-primary/5 border-primary/10 font-black text-3xl text-center text-primary focus:ring-primary shadow-inner"
                type="number" value={payAmount} onChange={(e) => setPayAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <Button 
              className="w-full h-16 rounded-2xl font-black text-lg bg-accent text-accent-foreground shadow-xl shadow-accent/20"
              onClick={handlePayment}
              disabled={isSubmitting}
            >
              {isSubmitting ? "প্রসেস হচ্ছে..." : "পেমেন্ট নিশ্চিত করুন"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default Suppliers;
