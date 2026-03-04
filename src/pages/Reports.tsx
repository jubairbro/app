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
  Legend,
  PieChart,
  Cell,
  Pie
} from "recharts";
import { motion } from "motion/react";
import { 
  TrendingUp, 
  Calendar, 
  PieChart as ChartIcon, 
  ArrowUpRight, 
  ArrowDownRight, 
  Activity,
  DollarSign,
  Receipt,
  ShoppingCart,
  Target,
  ArrowRightLeft
} from "lucide-react";

const COLORS = ['#1e293b', '#f59e0b', '#ef4444', '#10b981', '#6366f1'];

const Reports = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [detailed, setDetailed] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReports = async () => {
      setIsLoading(true);
      try {
        const [basic, extra] = await Promise.all([
          fetchApi('/api/reports'),
          fetchApi('/api/reports/detailed')
        ]);
        setSalesData(basic?.salesByDate || []);
        setTopProducts(basic?.topProducts || []);
        setDetailed(extra);
        setError(null);
      } catch (err: any) {
        console.error("Failed to load reports", err);
        setError(err.message || "রিপোর্ট লোড করা সম্ভব হয়নি");
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
        <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">জেনারেটিং রিপোর্ট...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4 text-danger">
        <Activity className="h-12 w-12" />
        <p className="font-black uppercase tracking-widest text-sm">{error}</p>
      </div>
    );
  }

  const expenseData = [
    { name: 'ভাড়া', value: 40 },
    { name: 'বিল', value: 30 },
    { name: 'স্যালারি', value: 20 },
    { name: 'অন্যান্য', value: 10 },
  ];

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0 text-left">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-4">
          <Activity className="h-10 w-10 text-accent" />
          ব্যবসায়িক এনালাইটিক্স
        </h1>
        <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-widest">Enterprise Business Intelligence</p>
      </motion.div>

      {/* Financial Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: "এই মাসের আয়", value: detailed?.monthly?.revenue, icon: DollarSign, color: "text-green-600", bg: "bg-green-500/10" },
          { title: "এই মাসের খরচ", value: detailed?.monthly?.expense, icon: Receipt, color: "text-danger", bg: "bg-danger/10" },
          { title: "নিট লাভ (আনুমানিক)", value: detailed?.monthly?.profit, icon: TrendingUp, color: "text-primary", bg: "bg-primary/5" },
          { title: "বাকি পাওনা", value: detailed?.monthly?.due, icon: ArrowRightLeft, color: "text-amber-600", bg: "bg-amber-500/10" }
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
            <Card className="border-none shadow-xl bg-card/40 backdrop-blur-md rounded-[2rem] p-6 border border-primary/5">
              <div className="flex items-center gap-4">
                <div className={cn("p-4 rounded-2xl shadow-inner", stat.bg)}>
                  <stat.icon className={cn("h-6 w-6", stat.color)} />
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.title}</div>
                  <div className={cn("text-xl font-black tracking-tight", stat.color)}>{formatCurrency(stat.value || 0)}</div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden p-8 border border-primary/5">
          <CardHeader className="p-0 mb-8 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-xl text-primary"><Activity className="h-5 w-5" /></div>
              বিক্রয় প্রবাহ ও প্রবৃদ্ধি
            </CardTitle>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-3 py-1 bg-muted rounded-full">গত ১৫ দিন</div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={detailed?.charts?.revenue || []}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1e293b" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#1e293b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" strokeOpacity={0.05} />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 900 }} tickFormatter={(v) => `৳${v}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.15)', fontWeight: 900, backgroundColor: 'rgba(255,255,255,0.9)' }}
                    formatter={(v: any) => [formatCurrency(v), "বিক্রয়"]}
                  />
                  <Area type="monotone" dataKey="amount" stroke="#1e293b" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Expense Distribution */}
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden p-8 border border-primary/5">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl text-accent"><ChartIcon className="h-5 w-5" /></div>
              খরচের খাতসমূহ
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={8}
                    dataKey="value"
                  >
                    {expenseData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-6 space-y-3">
              {expenseData.map((entry, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-xs font-bold text-muted-foreground">{entry.name}</span>
                  </div>
                  <span className="text-xs font-black text-primary">{entry.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Popular Products */}
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden p-8 border border-primary/5">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <div className="p-2 bg-primary/5 rounded-xl text-primary"><Target className="h-5 w-5" /></div>
              টপ বিক্রিত পণ্য
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between group p-4 rounded-2xl hover:bg-primary/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-white flex items-center justify-center font-black text-primary text-sm shadow-sm group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <div>
                    <div className="font-bold text-primary leading-none mb-1.5">{p.name}</div>
                    <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{p.totalQuantity} টি সেল হয়েছে</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-primary">{formatCurrency(p.totalRevenue)}</div>
                  <div className="text-[9px] font-bold text-green-600 uppercase flex items-center justify-end gap-1">
                    Revenue <ArrowUpRight className="h-2.5 w-2.5" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Activity Log */}
        <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden p-8 border border-primary/5">
          <CardHeader className="p-0 mb-8">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-xl text-accent"><History className="h-5 w-5" /></div>
              রিসেন্ট অ্যাক্টিভিটি
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            {salesData.slice(0, 5).map((log, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl bg-muted/30">
                <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <ShoppingCart className="h-5 w-5 text-primary/40" />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-sm font-black text-primary">বিক্রয় সম্পন্ন</span>
                    <span className="text-[10px] font-bold text-muted-foreground">{log.date}</span>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground mt-1">
                    মোট {formatCurrency(log.totalSales)} টাকার পণ্য বিক্রি করা হয়েছে।
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

const cn = (...classes: any[]) => classes.filter(Boolean).join(' ');

export default Reports;
