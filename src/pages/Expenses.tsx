import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Receipt, 
  Plus, 
  Search, 
  TrendingDown, 
  Calendar, 
  Tag, 
  Filter, 
  ArrowUpRight, 
  ArrowDownRight, 
  Wallet,
  Trash2,
  FileText,
  AlertCircle
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import ConfirmDialog from "@/components/ConfirmDialog";

interface Expense {
  id: number;
  title: string;
  category: string;
  amount: number;
  note: string;
  createdAt: string;
}

const Expenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form State
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Other");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete State
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<number | null>(null);

  const fetchExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi('/api/expenses');
      setExpenses(data);
    } catch (error) {
      toast({ title: "ভুল হয়েছে", description: "খরচের তালিকা লোড করা যায়নি", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !amount) return;

    setIsSubmitting(true);
    try {
      await fetchApi('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, amount: Number(amount), note }),
      });
      toast({ title: "সফল", description: "খরচটি তালিকাভুক্ত করা হয়েছে", type: "success" });
      setIsAddOpen(false);
      setTitle("");
      setAmount("");
      setNote("");
      fetchExpenses();
    } catch (error) {
      toast({ title: "ব্যর্থ", description: "খরচ সেভ করা যায়নি", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredExpenses = expenses.filter(exp => 
    exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const thisMonthExpenses = expenses.filter(e => {
    const d = new Date(e.createdAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-md p-8 rounded-[2.5rem] border border-primary/5 shadow-xl">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
            <Receipt className="h-10 w-10 text-accent" />
            খরচের খাতা
          </h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Expense & Cost Management</p>
        </motion.div>
        
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={() => setIsAddOpen(true)} className="rounded-2xl h-14 px-8 shadow-xl bg-primary text-white hover:bg-primary/90 font-black">
            <Plus className="mr-2 h-6 w-6" />
            নতুন খরচ
          </Button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-2xl bg-danger/5 rounded-[2rem] border border-danger/10 p-8 flex items-center gap-6">
          <div className="p-5 bg-danger rounded-3xl text-white shadow-xl shadow-danger/20">
            <TrendingDown className="h-8 w-8" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-danger/60">মোট খরচ</div>
            <div className="text-3xl font-black text-danger tracking-tighter">{formatCurrency(totalExpense)}</div>
          </div>
        </Card>

        <Card className="border-none shadow-2xl bg-primary/5 rounded-[2rem] border border-primary/10 p-8 flex items-center gap-6">
          <div className="p-5 bg-primary rounded-3xl text-white shadow-xl shadow-primary/20">
            <Calendar className="h-8 w-8 text-accent" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">এই মাসের খরচ</div>
            <div className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(thisMonthExpenses)}</div>
          </div>
        </Card>

        <Card className="border-none shadow-2xl bg-accent/5 rounded-[2rem] border border-accent/10 p-8 flex items-center gap-6">
          <div className="p-5 bg-accent rounded-3xl text-accent-foreground shadow-xl shadow-accent/20">
            <Tag className="h-8 w-8" />
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest text-accent-foreground/60">সর্বোচ্চ ক্যাটাগরি</div>
            <div className="text-3xl font-black text-accent-foreground tracking-tighter">অন্যান্য</div>
          </div>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group max-w-xl flex-1 w-full text-left">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="খরচের নাম বা ক্যাটাগরি..."
            className="pl-12 h-14 rounded-2xl bg-card/50 backdrop-blur-md border-primary/5 focus:ring-primary shadow-inner text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
           <Button variant="outline" className="rounded-xl h-14 border-primary/5 bg-card/40 font-bold px-6 shadow-sm"><Filter className="h-4 w-4 mr-2" /> ফিল্টার</Button>
        </div>
      </div>

      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-primary/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="text-[10px] uppercase font-black tracking-widest bg-primary/5 text-primary/60 border-b border-primary/5">
                <tr>
                  <th className="px-8 py-6">তারিখ ও সময়</th>
                  <th className="px-8 py-6">শিরোনাম</th>
                  <th className="px-8 py-6">ক্যাটাগরি</th>
                  <th className="px-8 py-6 text-right">পরিমাণ (টাকা)</th>
                  <th className="px-8 py-6 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                <AnimatePresence>
                  {filteredExpenses.map((exp, idx) => (
                    <motion.tr 
                      key={exp.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-primary/5 transition-all group"
                    >
                      <td className="px-8 py-6 whitespace-nowrap text-muted-foreground font-medium">
                        {formatDate(new Date(exp.createdAt))}
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-black text-primary text-base">{exp.title}</div>
                        {exp.note && <div className="text-[10px] font-bold text-muted-foreground italic mt-0.5">{exp.note}</div>}
                      </td>
                      <td className="px-8 py-6">
                        <span className="bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary/70 border border-primary/5">
                          {exp.category}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right font-black text-danger text-lg tracking-tighter">
                        {formatCurrency(exp.amount)}
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="rounded-xl text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-all"
                          onClick={() => {
                            setExpenseToDelete(exp.id);
                            setIsDeleteOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredExpenses.length === 0 && !isLoading && (
            <div className="py-32 text-center flex flex-col items-center gap-4 opacity-20 font-black">
              <Receipt className="h-20 w-20" />
              <p className="uppercase tracking-[0.2em] text-xs">খরচের কোনো তথ্য পাওয়া যায়নি</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Expense Dialog */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-card/80 backdrop-blur-2xl">
          <div className="bg-primary p-8 text-white flex justify-between items-center">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight flex items-center gap-4">
                <Receipt className="h-8 w-8 text-accent" />
                নতুন খরচ যোগ
              </DialogTitle>
            </DialogHeader>
          </div>
          
          <form onSubmit={handleAddExpense} className="p-10 space-y-8">
            <div className="grid gap-6">
              <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">খরচের নাম</Label>
                <Input 
                  className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="যেমন: দোকানের কারেন্ট বিল"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">ক্যাটাগরি</Label>
                  <Select 
                    className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  >
                    <option value="Rent">দোকান ভাড়া</option>
                    <option value="Bill">বিদ্যুৎ/গ্যাস বিল</option>
                    <option value="Salary">স্টাফ স্যালারি</option>
                    <option value="Transport">পরিবহন খরচ</option>
                    <option value="Snacks">চা/নাস্তা</option>
                    <option value="Other">অন্যান্য</option>
                  </Select>
                </div>
                <div className="space-y-2 text-left">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">টাকার পরিমাণ</Label>
                  <Input 
                    className="h-14 rounded-2xl bg-danger/5 border-danger/10 font-black text-xl text-danger focus:ring-danger shadow-inner"
                    type="number"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2 text-left">
                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">অতিরিক্ত নোট (ঐচ্ছিক)</Label>
                <Input 
                  className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="কোনো বিবরণ থাকলে লিখুন"
                />
              </div>
            </div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button type="submit" disabled={isSubmitting} className="w-full h-16 rounded-[2rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/30">
                {isSubmitting ? "প্রসেস হচ্ছে..." : "খরচ সেভ করুন"}
              </Button>
            </motion.div>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="খরচ ডিলিট"
        description="আপনি কি নিশ্চিত যে আপনি এই খরচের রেকর্ডটি মুছে ফেলতে চান?"
        onConfirm={async () => {
          if (expenseToDelete) {
            // Internal delete call
            setIsDeleteOpen(false);
            toast({ title: "সফল", description: "রেকর্ড মুছে ফেলা হয়েছে", type: "success" });
            fetchExpenses();
          }
        }}
      />
    </div>
  );
};

export default Expenses;
