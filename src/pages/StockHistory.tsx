import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { formatDate, cn } from "@/lib/utils";
import { 
  History, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  RefreshCcw, 
  Package, 
  Search, 
  Filter,
  AlertCircle,
  Activity,
  ArrowRightLeft
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

interface StockLog {
  id: number;
  productId: number;
  productName?: string;
  changeAmount: number;
  reason: string;
  createdAt: string;
}

const StockHistory = () => {
  const [logs, setLogs] = useState<StockLog[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi('/api/stock-logs');
      setLogs(data);
    } catch (error) {
      console.error("Failed to load stock history", error);
      toast({ title: "ভুল হয়েছে", description: "স্টক হিস্ট্রি লোড করা যায়নি", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0 text-left">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
          <History className="h-10 w-10 text-accent" />
          স্টক হিস্ট্রি
        </h1>
        <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Inventory Audit & Movement Log</p>
      </motion.div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative group max-w-xl flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="পণ্যের নাম বা পরিবর্তনের কারণ..."
            className="pl-12 h-14 rounded-2xl bg-card/50 backdrop-blur-md border-primary/5 focus:ring-primary shadow-inner text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button onClick={fetchLogs} variant="outline" className="rounded-xl h-14 border-primary/5 bg-card/40 font-bold px-6 shadow-sm">
          <RefreshCcw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} /> রিফ্রেশ
        </Button>
      </div>

      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-primary/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="text-[10px] uppercase font-black tracking-widest bg-primary/5 text-primary/60 border-b border-primary/5">
                <tr>
                  <th className="px-8 py-6">সময়</th>
                  <th className="px-8 py-6">পণ্যের নাম</th>
                  <th className="px-8 py-6">পরিবর্তন</th>
                  <th className="px-8 py-6">কারণ (Reason)</th>
                  <th className="px-8 py-6 text-center">স্ট্যাটাস</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                <AnimatePresence>
                  {filteredLogs.map((log, idx) => (
                    <motion.tr 
                      key={log.id} 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.02 }}
                      className="hover:bg-primary/5 transition-all group"
                    >
                      <td className="px-8 py-6 whitespace-nowrap text-muted-foreground font-medium">
                        {formatDate(new Date(log.createdAt))}
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center text-primary/40 group-hover:bg-primary group-hover:text-white transition-all">
                            <Package className="h-5 w-5" />
                          </div>
                          <div className="font-black text-primary text-base">{log.productName}</div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className={cn(
                          "inline-flex items-center gap-2 font-black text-lg tracking-tighter",
                          log.changeAmount > 0 ? "text-green-600" : "text-danger"
                        )}>
                          {log.changeAmount > 0 ? "+" : ""}{log.changeAmount}
                          {log.changeAmount > 0 ? <ArrowUpCircle className="h-4 w-4" /> : <ArrowDownCircle className="h-4 w-4" />}
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="font-bold text-muted-foreground">{log.reason}</div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border",
                          log.changeAmount > 0 ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"
                        )}>
                          {log.changeAmount > 0 ? "Stock In" : "Stock Out"}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
          {filteredLogs.length === 0 && !isLoading && (
            <div className="py-32 text-center flex flex-col items-center gap-4 opacity-20 font-black">
              <Activity className="h-24 w-24" />
              <p className="uppercase tracking-[0.3em] text-sm">কোনো স্টক মুভমেন্ট রেকর্ড নেই</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StockHistory;
