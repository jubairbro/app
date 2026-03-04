import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { motion } from "motion/react";
import { TrendingUp, Calendar, PieChart as ChartIcon, ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

const Reports = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [detailed, setDetailed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const [basic, extra] = await Promise.all([
          fetchApi('/api/reports'),
          fetchApi('/api/reports/detailed')
        ]);
        setSalesData(basic.salesByDate);
        setTopProducts(basic.topProducts);
        setDetailed(extra);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  if (isLoading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
        <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">রিপোর্ট জেনারেট হচ্ছে...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-20">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
          <Activity className="h-10 w-10 text-accent" />
          ব্যবসায়িক এনালাইটিক্স
        </h1>
        <p className="text-muted-foreground font-medium mt-1">আপনার ব্যবসার লাভ-ক্ষতি ও বিক্রয় রিপোর্ট</p>
      </motion.div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="border-none shadow-2xl bg-primary text-white rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[100%] bg-white/5 rounded-full blur-3xl" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                <Calendar className="h-4 w-4" /> এই মাসের রিপোর্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="text-5xl font-black tracking-tighter">{formatCurrency(detailed?.monthly?.sales || 0)}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase opacity-60 mb-1">নগদ জমা</div>
                  <div className="text-lg font-black text-green-400">{formatCurrency(detailed?.monthly?.paid || 0)}</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                  <div className="text-[10px] font-black uppercase opacity-60 mb-1">বাকি</div>
                  <div className="text-lg font-black text-red-400">{formatCurrency(detailed?.monthly?.due || 0)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="border-none shadow-2xl bg-accent text-accent-foreground rounded-[2.5rem] overflow-hidden relative">
            <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[100%] bg-black/5 rounded-full blur-3xl" />
            <CardHeader className="p-8 pb-4">
              <CardTitle className="text-xs font-black uppercase tracking-[0.2em] opacity-60 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" /> এই বছরের রিপোর্ট
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 pt-0 space-y-6">
              <div className="text-5xl font-black tracking-tighter">{formatCurrency(detailed?.yearly?.sales || 0)}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/5 backdrop-blur-md p-4 rounded-2xl border border-black/5">
                  <div className="text-[10px] font-black uppercase opacity-60 mb-1">মোট নগদ</div>
                  <div className="text-lg font-black">{formatCurrency(detailed?.yearly?.paid || 0)}</div>
                </div>
                <div className="bg-black/5 backdrop-blur-md p-4 rounded-2xl border border-black/5">
                  <div className="text-[10px] font-black uppercase opacity-60 mb-1">মোট বাকি</div>
                  <div className="text-lg font-black text-danger">{formatCurrency(detailed?.yearly?.due || 0)}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Main Chart */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-xl text-primary"><Activity className="h-5 w-5" /></div>
              গত ৭ দিনের বিক্রয় প্রবাহ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] w-full">
              {detailed?.daily?.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={detailed.daily} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--primary)" strokeOpacity={0.05} />
                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700 }} tickFormatter={(v) => `৳${v}`} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', fontWeight: 900 }}
                      formatter={(v: any) => [formatCurrency(v), "বিক্রয়"]}
                    />
                    <Area type="monotone" dataKey="amount" stroke="var(--primary)" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground font-bold">কোনো তথ্য নেই</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden p-8">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl text-accent"><ChartIcon className="h-5 w-5" /></div>
              জনপ্রিয় পণ্যসমূহ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {topProducts.length > 0 ? (
              topProducts.map((p, i) => (
                <div key={i} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/5 flex items-center justify-center font-black text-primary text-xs group-hover:bg-accent group-hover:text-white transition-all">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-sm leading-none mb-1">{p.name}</div>
                      <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{p.totalQuantity} টি বিক্রিত</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-black text-sm text-primary">{formatCurrency(p.totalRevenue)}</div>
                    <div className="text-[9px] font-bold text-green-600 flex items-center justify-end gap-1">
                      আয় <ArrowUpRight className="h-2 w-2" />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 text-muted-foreground opacity-30">তথ্য নেই</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
