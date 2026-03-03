import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, Users, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { fetchApi } from "@/lib/api";

const Dashboard = () => {
  const [lowStockItems, setLowStockItems] = useState<any[]>([]);
  const [totalSales, setTotalSales] = useState(0);
  const [totalDue, setTotalDue] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const stats = await fetchApi('/api/dashboard');
        setLowStockItems(stats.lowStockItems);
        setTotalSales(stats.totalSales);
        setTotalDue(stats.totalDue);
        setProductCount(stats.totalProducts);
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট বিক্রয়</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট বাকি</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{formatCurrency(totalDue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">মোট পণ্য</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{productCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">স্বল্প স্টক</CardTitle>
            <AlertTriangle className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-danger">{lowStockItems.length}</div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-danger/50 bg-danger/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-danger">
              <AlertTriangle className="h-5 w-5" />
              স্টক সতর্কতা (১০-এর নিচে)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs uppercase bg-danger/10 text-danger">
                  <tr>
                    <th className="px-4 py-2">পণ্যের নাম</th>
                    <th className="px-4 py-2">বর্তমান স্টক</th>
                    <th className="px-4 py-2">ইউনিট</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockItems.map((item) => (
                    <tr key={item.id} className="border-b border-danger/10">
                      <td className="px-4 py-2 font-medium">{item.name}</td>
                      <td className="px-4 py-2 font-bold text-danger">{item.stock}</td>
                      <td className="px-4 py-2">{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
