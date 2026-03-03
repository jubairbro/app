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
  LineChart,
  Line,
  Legend
} from "recharts";

const Reports = () => {
  const [salesData, setSalesData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      try {
        const data = await fetchApi('/api/reports');
        setSalesData(data.salesByDate);
        setTopProducts(data.topProducts);
      } catch (error) {
        console.error("Failed to load reports", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-muted-foreground">লোড হচ্ছে...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">রিপোর্ট ও পরিসংখ্যান</h1>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>গত ৩০ দিনের বিক্রয় (টাকা)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {salesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={salesData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="date" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `৳${value}`} />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      labelFormatter={(label) => `তারিখ: ${label}`}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="totalSales" name="মোট বিক্রয়" stroke="var(--primary)" strokeWidth={3} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="totalPaid" name="নগদ গ্রহণ" stroke="#10b981" strokeWidth={2} />
                    <Line type="monotone" dataKey="totalDue" name="বাকি" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  কোনো বিক্রয়ের তথ্য নেই
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সর্বোচ্চ বিক্রিত পণ্য (পরিমাণ)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [value, "পরিমাণ"]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                    <Bar dataKey="totalQuantity" name="পরিমাণ" fill="var(--accent)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  কোনো তথ্য নেই
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>সর্বোচ্চ আয়ের পণ্য (টাকা)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {topProducts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={topProducts} margin={{ top: 5, right: 30, left: 20, bottom: 5 }} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis type="number" tickFormatter={(value) => `৳${value}`} />
                    <YAxis dataKey="name" type="category" width={100} className="text-xs" />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), "আয়"]}
                      contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }}
                    />
                    <Bar dataKey="totalRevenue" name="মোট আয়" fill="var(--primary)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  কোনো তথ্য নেই
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Reports;
