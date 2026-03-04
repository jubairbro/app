import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, DollarSign, Plus, User, Phone, MapPin, ArrowUpRight, ArrowDownRight, Wallet, History, AlertCircle } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalDue: number;
}

const DueBook = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchCustomers = async () => {
    try {
      const data = await fetchApi('/api/customers');
      setCustomers(data);
    } catch (error) {
      toast({ title: "ভুল হয়েছে", description: "কাস্টমার লিস্ট লোড করা যায়নি", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handlePayment = async () => {
    if (!selectedCustomer || !paymentAmount) return;
    const amount = Number(paymentAmount);
    if (amount <= 0) {
      toast({ title: "সঠিক পরিমাণ দিন", type: "warning" });
      return;
    }

    try {
      await fetchApi(`/api/customers/${selectedCustomer.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      toast({ title: "সফল", description: "লেনদেন সম্পন্ন হয়েছে", type: "success" });
      setIsPaymentOpen(false);
      setPaymentAmount("");
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      toast({ title: "ব্যর্থ", description: error.message || "লেনদেন করা যায়নি", type: "error" });
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  const totalDueSum = customers.reduce((sum, c) => sum + (c.totalDue > 0 ? c.totalDue : 0), 0);
  const totalAdvanceSum = customers.reduce((sum, c) => sum + (c.totalDue < 0 ? Math.abs(c.totalDue) : 0), 0);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">ডাটা লোড হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
            <div className="h-10 w-2 bg-danger rounded-full" />
            বাকি খাতা
          </h1>
          <p className="text-muted-foreground font-medium mt-1">কাস্টমারদের দেনা-পাওনার হিসাব</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild className="rounded-2xl h-12 px-6 shadow-lg bg-primary text-white hover:bg-primary/90">
            <Link to="/sales">
              <Plus className="mr-2 h-5 w-5" />
              নতুন বিক্রয়
            </Link>
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-xl bg-danger/5 rounded-[2.5rem] border border-danger/10 p-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-danger rounded-3xl text-white shadow-xl shadow-danger/20">
              <ArrowUpRight className="h-8 w-8" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-danger/60">মোট পাওনা (বাকি)</div>
              <div className="text-4xl font-black text-danger tracking-tighter">{formatCurrency(totalDueSum)}</div>
            </div>
          </div>
        </Card>
        <Card className="border-none shadow-xl bg-green-500/5 rounded-[2.5rem] border border-green-500/10 p-8">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-green-500 rounded-3xl text-white shadow-xl shadow-green-500/20">
              <ArrowDownRight className="h-8 w-8" />
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-green-600/60">মোট অগ্রিম (এডভান্স)</div>
              <div className="text-4xl font-black text-green-600 tracking-tighter">{formatCurrency(totalAdvanceSum)}</div>
            </div>
          </div>
        </Card>
      </div>

      <div className="relative group max-w-xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="কাস্টমারের নাম বা মোবাইল দিয়ে খুঁজুন..."
          className="pl-12 h-14 rounded-2xl bg-card/50 backdrop-blur-md border-primary/5 focus:ring-primary shadow-inner text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] uppercase font-black tracking-widest bg-primary/5 text-primary/60 border-b border-primary/5">
                <tr>
                  <th className="px-8 py-6">কাস্টমার প্রোফাইল</th>
                  <th className="px-8 py-6">যোগাযোগ ও ঠিকানা</th>
                  <th className="px-8 py-6 text-right">ব্যালেন্স স্ট্যাটাস</th>
                  <th className="px-8 py-6 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredCustomers.map((customer, idx) => (
                  <motion.tr 
                    key={customer.id} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-primary/5 transition-all group"
                  >
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-inner border border-primary/5">
                          <User className="h-6 w-6" />
                        </div>
                        <div className="font-black text-base text-primary uppercase tracking-tight">{customer.name}</div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground group-hover:text-primary transition-colors">
                          <Phone className="h-3 w-3" /> {customer.phone}
                        </div>
                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {customer.address || "ঠিকানা নেই"}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex flex-col items-end">
                        <div className={cn(
                          "text-xl font-black tracking-tighter",
                          customer.totalDue > 0 ? "text-danger" : customer.totalDue < 0 ? "text-green-600" : "text-muted-foreground"
                        )}>
                          {formatCurrency(Math.abs(customer.totalDue))}
                        </div>
                        <div className={cn(
                          "text-[9px] font-black uppercase tracking-[0.1em] px-3 py-1 rounded-full mt-1.5 border shadow-sm",
                          customer.totalDue > 0 ? "bg-danger/10 text-danger border-danger/10" : customer.totalDue < 0 ? "bg-green-500/10 text-green-600 border-green-500/10" : "bg-muted text-muted-foreground border-transparent"
                        )}>
                          {customer.totalDue > 0 ? "বাকি আছে" : customer.totalDue < 0 ? "এডভান্স জমা" : "ব্যালেন্স জিরো"}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="rounded-xl border-primary/10 hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest gap-2 h-10 px-4 shadow-sm"
                          onClick={() => {
                            setSelectedCustomer(customer);
                            setIsPaymentOpen(true);
                          }}
                        >
                          <Wallet className="h-4 w-4" />
                          লেনদেন
                        </Button>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredCustomers.length === 0 && (
            <div className="py-32 text-center flex flex-col items-center gap-4">
              <div className="p-8 bg-muted rounded-full opacity-20">
                <AlertCircle className="h-16 w-16" />
              </div>
              <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">কোনো তথ্য পাওয়া যায়নি</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-card/80 backdrop-blur-2xl">
          <div className="bg-primary p-10 text-white flex justify-between items-center">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4">
                <Wallet className="h-8 w-8 text-accent" />
                লেনদেন
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-10 space-y-10">
            <div className="bg-primary/5 rounded-[2.5rem] p-8 border border-primary/5 shadow-inner">
              <div className="flex items-center gap-5 mb-6">
                <div className="h-14 w-14 rounded-2xl bg-white flex items-center justify-center text-primary shadow-md border border-primary/5">
                  <User className="h-8 w-8" />
                </div>
                <div>
                  <div className="text-2xl font-black text-primary leading-none tracking-tight">{selectedCustomer?.name}</div>
                  <div className="text-xs font-bold text-muted-foreground mt-2 flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {selectedCustomer?.phone}
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center border-t border-primary/5 pt-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">বর্তমান ব্যালেন্স</span>
                <span className={cn(
                  "text-2xl font-black tracking-tighter",
                  (selectedCustomer?.totalDue || 0) > 0 ? "text-danger" : "text-green-600"
                )}>
                  {formatCurrency(Math.abs(selectedCustomer?.totalDue || 0))}
                  <span className="text-[10px] ml-2 uppercase opacity-60 font-bold tracking-normal">
                    {(selectedCustomer?.totalDue || 0) > 0 ? "(বাকি)" : "(এডভান্স)"}
                  </span>
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-2">জমার পরিমাণ (টাকা)</Label>
              <div className="relative group">
                <DollarSign className="absolute left-5 top-1/2 -translate-y-1/2 h-8 w-8 text-primary group-focus-within:scale-110 transition-transform duration-500" />
                <Input 
                  className="pl-16 h-20 rounded-3xl bg-primary/5 border-primary/10 font-black text-4xl text-primary focus:ring-primary shadow-inner text-center pr-8" 
                  type="number" 
                  value={paymentAmount} 
                  onChange={e => setPaymentAmount(e.target.value)} 
                  placeholder="0.00" 
                />
              </div>
              <div className="flex items-center gap-2 px-2 text-muted-foreground">
                <History className="h-3 w-3" />
                <p className="text-[10px] font-bold leading-relaxed italic">
                  অতিরিক্ত জমা টাকা স্বয়ংক্রিয়ভাবে এডভান্স ব্যালেন্স হিসেবে সংরক্ষিত হবে।
                </p>
              </div>
            </div>
          </div>
          
          <div className="p-10 pt-0">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handlePayment} className="w-full h-20 rounded-[2rem] bg-primary text-primary-foreground font-black text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all border-none">
                লেনদেন সম্পন্ন করুন
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DueBook;
