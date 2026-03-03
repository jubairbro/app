import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users, Package, ShoppingCart, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchApi } from "@/lib/api";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Dashboard = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [productCount, setProductCount] = useState(0);
  const [products, setProducts] = useState<any[]>([]);
  const navigate = useNavigate();

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
        console.error("Error fetching dashboard stats:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">ড্যাশবোর্ড</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Link to="/memos" className="block transition-transform hover:scale-105">
          <Card className="h-full hover:border-primary/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট বিক্রয়</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
              <p className="text-xs text-muted-foreground mt-1">মেমো তালিকা দেখুন</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/due-book" className="block transition-transform hover:scale-105">
          <Card className="h-full hover:border-primary/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট বাকি</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">{formatCurrency(totalDue)}</div>
              <p className="text-xs text-muted-foreground mt-1">বাকি খাতা দেখুন</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/inventory" className="block transition-transform hover:scale-105">
          <Card className="h-full hover:border-primary/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{productCount}</div>
              <p className="text-xs text-muted-foreground mt-1">ইনভেন্টরি দেখুন</p>
            </CardContent>
          </Card>
        </Link>
        <Link to="/inventory" className="block transition-transform hover:scale-105">
          <Card className="h-full hover:border-primary/50 cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">স্বল্প স্টক</CardTitle>
              <AlertTriangle className="h-4 w-4 text-danger" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-danger">{lowStockItems.length}</div>
              <p className="text-xs text-muted-foreground mt-1">স্টক সতর্কতা</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Shopping-like Product Grid */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-primary">সকল পণ্য</h2>
          <Button asChild variant="outline">
            <Link to="/sales">
              <ShoppingCart className="mr-2 h-4 w-4" />
              বিক্রয় পেজে যান
            </Link>
          </Button>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {products.map((product) => (
            <Card key={product.id} className="overflow-hidden flex flex-col hover:shadow-md transition-shadow">
              <div className="h-32 w-full bg-muted flex items-center justify-center relative group">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
                {product.stock <= 10 && (
                  <div className="absolute top-2 right-2 bg-danger text-white text-[10px] font-bold px-2 py-1 rounded-full">
                    Low Stock
                  </div>
                )}
              </div>
              <CardContent className="p-3 flex-1 flex flex-col">
                <h3 className="font-medium text-sm line-clamp-2 mb-1" title={product.name}>{product.name}</h3>
                <p className="text-xs text-muted-foreground mb-2">{product.category}</p>
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-primary">{formatCurrency(product.retailPrice)}</span>
                    <span className="text-xs text-muted-foreground">স্টক: {product.stock} {product.unit}</span>
                  </div>
                  <Button 
                    size="sm" 
                    className="w-full" 
                    onClick={() => navigate('/sales')}
                    disabled={product.stock <= 0}
                  >
                    <ShoppingCart className="mr-2 h-3 w-3" />
                    {product.stock > 0 ? "সেল করুন" : "স্টক আউট"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
