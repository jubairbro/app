import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users, Package, ShoppingCart, Image as ImageIcon, ArrowRight, Zap, Target, Star, Wallet, ArrowUpRight } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

const Dashboard = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await fetchApi('/api/dashboard');
        setLowStockItems(stats.lowStockItems);
        setTotalSales(stats.totalSales);
        setTotalDue(stats.totalDue);
        setProductCount(stats.totalProducts);
        
        const productsData = await fetchApi('/api/products');
        setProducts(productsData);
      } catch (error) {
        toast({ title: "ভুল হয়েছে", description: "ড্যাশবোর্ড ডাটা লোড করা যায়নি", type: "error" });
      }
    };

    fetchData();
  }, [toast]);

  return (
    <div className="space-y-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
            <Zap className="h-10 w-10 text-accent" />
            ড্যাশবোর্ড
          </h1>
          <p className="text-muted-foreground font-medium mt-1">আজকের ব্যবসায়িক সারসংক্ষেপ ও ইনভেন্টরি</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Button asChild className="rounded-2xl shadow-xl bg-primary text-white hover:bg-primary/90 px-8 py-7 text-lg font-black tracking-tight">
            <Link to="/sales">
              <ShoppingCart className="mr-3 h-6 w-6 text-accent" />
              বিক্রয় শুরু করুন
            </Link>
          </Button>
        </motion.div>
      </div>
      
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "মোট বিক্রয়", value: formatCurrency(totalSales), icon: TrendingUp, color: "text-green-500", bg: "bg-green-500/10", link: "/memos" },
          { title: "মোট বাকি", value: formatCurrency(totalDue), icon: Wallet, color: "text-red-500", bg: "bg-red-500/10", link: "/due-book" },
          { title: "মোট পণ্য", value: productCount, icon: Package, color: "text-blue-500", bg: "bg-blue-500/10", link: "/inventory" },
          { title: "স্বল্প স্টক", value: lowStockItems.length, icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-500/10", link: "/inventory" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Link to={stat.link} className="block group">
              <Card className="h-full border-none shadow-2xl bg-card/40 backdrop-blur-xl overflow-hidden hover:bg-card/60 transition-all hover:-translate-y-2 duration-500 rounded-[2rem] border border-primary/5">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 p-6">
                  <CardTitle className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.title}</CardTitle>
                  <div className={cn("p-3 rounded-2xl shadow-inner", stat.bg)}>
                    <stat.icon className={cn("h-5 w-5", stat.color)} />
                  </div>
                </CardHeader>
                <CardContent className="p-6 pt-0">
                  <div className="text-3xl font-black tracking-tighter text-primary">{stat.value}</div>
                  <div className="mt-4 flex items-center gap-1 text-[9px] font-black uppercase text-muted-foreground group-hover:text-primary transition-colors tracking-widest">
                    বিস্তারিত দেখুন <ArrowRight className="h-3 w-3 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="mt-12">
        <div className="flex items-center justify-between mb-8">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-2xl font-black text-primary flex items-center gap-3 tracking-tight"
          >
            <Target className="h-7 w-7 text-accent" />
            জনপ্রিয় পণ্যসমূহ
          </motion.h2>
          <Button asChild variant="ghost" className="hover:bg-primary/5 rounded-2xl font-black text-xs uppercase tracking-widest px-6 h-12">
            <Link to="/inventory">
              সব দেখুন <ArrowUpRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {products.slice(0, 12).map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Card className="overflow-hidden h-full flex flex-col group hover:shadow-[0_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 border-none bg-card/30 backdrop-blur-xl rounded-[2.5rem] border border-primary/5">
                <div className="h-36 w-full bg-muted flex items-center justify-center relative overflow-hidden border-b border-primary/5">
                  {product.imageUrl ? (
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" 
                      referrerPolicy="no-referrer" 
                    />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-muted-foreground/20" />
                  )}
                  {product.stock <= 10 && (
                    <div className="absolute top-3 right-3 bg-danger/90 backdrop-blur-md text-white text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-tighter shadow-lg animate-pulse">
                      Low Stock
                    </div>
                  )}
                </div>
                <CardContent className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-tight h-10" title={product.name}>{product.name}</h3>
                  <p className="text-[9px] text-muted-foreground mb-4 font-black uppercase tracking-widest opacity-60">{product.category}</p>
                  <div className="mt-auto space-y-4">
                    <div className="flex justify-between items-end border-t border-primary/5 pt-3">
                      <div className="flex flex-col">
                        <span className="text-[8px] text-muted-foreground font-black uppercase tracking-widest">মূল্য</span>
                        <span className="font-black text-primary text-lg tracking-tighter leading-none">{formatCurrency(product.retailPrice)}</span>
                      </div>
                      <span className="text-[9px] font-black bg-primary/5 px-2 py-1 rounded-full border border-primary/5">
                        {product.stock} {product.unit}
                      </span>
                    </div>
                    <Button 
                      size="sm" 
                      className="w-full rounded-2xl font-black text-[10px] uppercase tracking-widest h-10 group-hover:bg-accent group-hover:text-accent-foreground transition-all shadow-md" 
                      onClick={() => navigate('/sales')}
                      disabled={product.stock <= 0}
                    >
                      {product.stock > 0 ? "সেল করুন" : "স্টক আউট"}
                    </Button>
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
