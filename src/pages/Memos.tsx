import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Printer, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import { Invoice } from "@/components/Invoice";
import { fetchApi } from "@/lib/api";

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  createdAt: any;
  items: any[];
  customerAddress: string;
  discount: number;
}

const Memos = () => {
  const [sales, setSales] = useState<Sale[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  useEffect(() => {
    const fetchSales = async () => {
      try {
        const data = await fetchApi('/api/sales');
        setSales(data);
      } catch (error) {
        console.error("Error fetching sales:", error);
      }
    };
    fetchSales();
  }, []);

  const filteredSales = sales.filter(sale => 
    sale.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.customerPhone.includes(searchTerm) ||
    (sale.customerAddress && sale.customerAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
    sale.id.toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">মেমো তালিকা</h1>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="নাম, মোবাইল বা মেমো নং দিয়ে খুঁজুন..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>সকল মেমো ({filteredSales.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">তারিখ</th>
                  <th className="px-4 py-3">মেমো নং</th>
                  <th className="px-4 py-3">কাস্টমার</th>
                  <th className="px-4 py-3">মোবাইল</th>
                  <th className="px-4 py-3 text-right">মোট বিল</th>
                  <th className="px-4 py-3 text-right">জমা</th>
                  <th className="px-4 py-3 text-right">বাকি</th>
                  <th className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredSales.map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">{sale.createdAt ? formatDate(new Date(sale.createdAt)) : "N/A"}</td>
                    <td className="px-4 py-3 font-mono text-xs">{sale.id.toString().padStart(6, '0')}</td>
                    <td className="px-4 py-3 font-medium">{sale.customerName}</td>
                    <td className="px-4 py-3">{sale.customerPhone}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(sale.finalAmount)}</td>
                    <td className="px-4 py-3 text-right text-green-600">{formatCurrency(sale.paidAmount)}</td>
                    <td className="px-4 py-3 text-right text-danger font-bold">{formatCurrency(sale.dueAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedSale(sale)}>
                            <Eye className="mr-2 h-4 w-4" /> দেখুন
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <div className="flex justify-end mb-4">
                            <Button onClick={() => handlePrint()}>
                              <Printer className="mr-2 h-4 w-4" /> প্রিন্ট করুন
                            </Button>
                          </div>
                          {selectedSale && (
                            <div className="border p-4 rounded-lg bg-gray-50">
                              <Invoice ref={componentRef} sale={selectedSale} />
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </td>
                  </tr>
                ))}
                {filteredSales.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                      কোনো মেমো পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Memos;
