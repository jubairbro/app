import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { fetchApi } from "@/lib/api";

interface Customer {
  id: string;
  name: string;
  phone: string;
  address: string;
  totalDue: number;
}

const DueBook = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);

  const fetchCustomers = async () => {
    try {
      const data = await fetchApi('/api/customers');
      // Only show customers with due > 0
      setCustomers(data.filter((c: Customer) => c.totalDue > 0));
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handlePayment = async () => {
    if (!selectedCustomer || !paymentAmount) return;
    const amount = Number(paymentAmount);
    if (amount <= 0) {
      alert("সঠিক পরিমাণ দিন");
      return;
    }
    if (amount > selectedCustomer.totalDue) {
      alert("বাকি টাকার চেয়ে বেশি জমা দেওয়া যাবে না");
      return;
    }

    try {
      await fetchApi(`/api/customers/${selectedCustomer.id}/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount }),
      });

      alert("জমা সফল হয়েছে!");
      setIsPaymentOpen(false);
      setPaymentAmount("");
      setSelectedCustomer(null);
      fetchCustomers();
    } catch (error: any) {
      console.error("Payment failed:", error);
      alert(error.message || "জমা ব্যর্থ হয়েছে!");
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-primary">বাকি খাতা</h1>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>বাকি তালিকা ({filteredCustomers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">নাম</th>
                  <th className="px-4 py-3">মোবাইল</th>
                  <th className="px-4 py-3">ঠিকানা</th>
                  <th className="px-4 py-3 text-right">মোট বাকি</th>
                  <th className="px-4 py-3 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3 font-medium">{customer.name}</td>
                    <td className="px-4 py-3">{customer.phone}</td>
                    <td className="px-4 py-3">{customer.address || "N/A"}</td>
                    <td className="px-4 py-3 text-right font-bold text-danger">{formatCurrency(customer.totalDue)}</td>
                    <td className="px-4 py-3 text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsPaymentOpen(true);
                        }}
                      >
                        <DollarSign className="mr-2 h-4 w-4" /> জমা দিন
                      </Button>
                    </td>
                  </tr>
                ))}
                {filteredCustomers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                      কোনো বাকি পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isPaymentOpen} onOpenChange={setIsPaymentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>বাকি পরিশোধ</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>কাস্টমার: {selectedCustomer?.name}</Label>
              <p className="text-sm text-muted-foreground">বর্তমান বাকি: {selectedCustomer ? formatCurrency(selectedCustomer.totalDue) : 0}</p>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">পরিমাণ</Label>
              <Input 
                className="col-span-3" 
                type="number" 
                value={paymentAmount} 
                onChange={e => setPaymentAmount(e.target.value)} 
                placeholder="কত টাকা জমা দিচ্ছেন?" 
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handlePayment}>জমা দিন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DueBook;
