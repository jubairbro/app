import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  AlertTriangle, 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart, 
  Image as ImageIcon, 
  ArrowRight, 
  Zap, 
  Target, 
  Star, 
  Wallet, 
  ArrowUpRight,
  Receipt,
  UserCog,
  History,
  Shield
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashboardData, productsData] = await Promise.all([
          fetchApi('/api/dashboard'),
          fetchApi('/api/products')
        ]);
        setStats(dashboardData);
        setProducts(productsData);
      } catch (error) {
        toast({ title: "ভুল হয়েছে", description: "ড্যাশবোর্ড ডাটা লোড করা যায়নি", type: "error" });
      }
    };

    fetchData();
  }, [toast]);

  const cards = [
    { title: "মোট বিক্রয়", value: formatCurrency(stats?.totalSales || 0), icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", link: "/memos" },
    { title: "মোট বাকি", value: formatCurrency(stats?.totalDue || 0), icon: Wallet, color: "text-red-500", bg: "bg-red-500/10", link: "/due-book" },
    { title: "দোকান খরচ", value: formatCurrency(stats?.totalExpense || 0), icon: Receipt, color: "text-amber-500", bg: "bg-amber-500/10", link: "/expenses" },
    { title: "মোট পণ্য", value: stats?.totalProducts || 0, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", link: "/inventory" },
  ];

  return (
    <div className="space-y-10 pb-20 px-4 sm:px-0 text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
            <Zap className="h-10 w-10 text-accent" />
            ড্যাশবোর্ড ওভারভিউ
          </h1>
          <p className="text-muted-foreground font-medium mt-1 uppercase text-[10px] tracking-[0.2em]">Mesrs Saikat Machinery ERP</p>
        </motion.div>
        
        <div className="flex gap-3">
          <Button asChild variant="outline" className="rounded-2xl border-primary/10 h-14 px-6 font-black text-xs uppercase tracking-widest hidden sm:flex">
            <Link to="/stock-history">
              <History className="mr-2 h-4 w-4" /> স্টক হিস্ট্রি
            </Link>
          </Button>
          <Button asChild className="rounded-2xl shadow-xl bg-primary text-white hover:bg-primary/90 px-8 h-14 text-sm font-black uppercase tracking-widest">
            <Link to="/sales">
              <ShoppingCart className="mr-2 h-5 w-5 text-accent" /> বিক্রয় কেন্দ্র
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={stat.link} className="block group">
              <Card className="h-full border-none shadow-2xl bg-card overflow-hidden hover:bg-card/80 transition-all hover:-translate-y-2 duration-500 rounded-[2.5rem] border border-border">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-8">
                  <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</CardTitle>
                  <div className={cn("p-3 rounded-2xl shadow-inner", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent className="p-8 pt-0">
                  <div className="text-3xl font-black tracking-tighter text-primary">{stat.value}</div>
                  <div className="mt-4 flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors tracking-widest">
                    ম্যানেজ করুন <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Low Stock Alerts */}
        <Card className="lg:col-span-1 border-none shadow-2xl bg-danger/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-danger/10">
          <CardHeader className="p-8 border-b border-danger/10">
            <CardTitle className="text-lg font-black flex items-center gap-3 text-danger">
              <AlertTriangle className="h-5 w-5 animate-pulse" />
              স্টক সতর্কতা
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            {stats?.lowStockItems?.length > 0 ? (
              stats.lowStockItems.slice(0, 5).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-4 rounded-2xl bg-background/50 border border-danger/5 shadow-sm">
                  <div>
                    <div className="text-sm font-black text-primary">{item.name}</div>
                    <div className="text-[10px] font-bold text-danger uppercase tracking-tighter">অবশিষ্ট: {item.stock} {item.unit}</div>
                  </div>
                  <Button size="sm" asChild variant="ghost" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-danger/10 text-danger">
                    <Link to="/inventory">অর্ডার</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-10 opacity-30">
                <Package className="h-12 w-12 mx-auto mb-2" />
                <p className="text-xs font-black uppercase tracking-widest">সব স্টক পর্যাপ্ত আছে</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Staff Summary */}
        <Card className="lg:col-span-2 border-none shadow-2xl bg-card rounded-[2.5rem] overflow-hidden border border-border">
          <CardHeader className="p-8 border-b border-primary/5 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-black flex items-center gap-3">
              <UserCog className="h-5 w-5 text-accent" />
              স্টাফ অ্যাক্টিভিটি
            </CardTitle>
            <Button size="sm" variant="ghost" asChild className="rounded-xl font-black text-[10px] uppercase tracking-widest">
              <Link to="/staff">সব দেখুন</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-primary/5 border border-primary/5">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">সক্রিয় স্টাফ</div>
                  <Shield className="h-4 w-4 text-accent" />
                </div>
                <div className="text-4xl font-black text-primary">{stats?.activeStaff || 1}</div>
                <p className="text-[10px] font-medium text-muted-foreground mt-2 italic">* বর্তমানে সিস্টেম ব্যবহার করছেন</p>
              </div>
              <div className="p-6 rounded-3xl bg-accent/5 border border-accent/5">
                <div className="flex justify-between items-center mb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">আজকের এন্ট্রি</div>
                  <History className="h-4 w-4 text-primary" />
                </div>
                <div className="text-4xl font-black text-primary">--</div>
                <p className="text-[10px] font-medium text-muted-foreground mt-2 italic">* আজকের মোট কার্যক্রম</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Products Horizontal */}
      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-primary flex items-center gap-3 tracking-tight">
            <Target className="h-7 w-7 text-accent" />
            পপুলার পণ্যসমূহ
          </h2>
          <Button asChild variant="ghost" className="hover:bg-primary/5 rounded-2xl font-black text-xs uppercase tracking-widest px-6 h-12">
            <Link to="/inventory">
              সব দেখুন <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {products.slice(0, 6).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden h-full flex flex-col group hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 border-none bg-card rounded-[2.5rem] border border-border">
                <div className="h-36 w-full bg-muted flex items-center justify-center relative overflow-hidden border-b border-primary/5">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" referrerPolicy="no-referrer" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
                  )}
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight h-10 text-left" title={product.name}>{product.name}</h3>
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end border-t border-primary/5 pt-3">
                      <div className="flex flex-col text-left">
                        <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">মূল্য</span>
                        <span className="font-black text-primary text-lg tracking-tighter leading-none">{formatCurrency(product.retailPrice)}</span>
                      </div>
                    </div>
                    <Button size="sm" className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest h-10 shadow-md" onClick={() => navigate('/sales')}>সেল করুন</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
