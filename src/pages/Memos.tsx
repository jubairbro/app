import { useEffect, useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Printer, Eye, Plus, Download, FileText, X, AlertCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogPortal, DialogOverlay } from "@/components/ui/dialog";
import { useReactToPrint } from "react-to-print";
import { Invoice } from "@/components/Invoice";
import { fetchApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import { useToast } from "@/components/ui/toast";

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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  const { toast } = useToast();
  const componentRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
  });

  const handleDownloadPDF = async () => {
    if (!componentRef.current || !selectedSale) {
      toast({ title: "ভুল হয়েছে", description: "প্রিভিউ লোড হওয়া পর্যন্ত অপেক্ষা করুন", type: "error" });
      return;
    }
    
    setIsDownloading(true);
    try {
      const element = componentRef.current;
      
      // Load fonts or wait for them
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500)); // Just 500ms
      
      const canvas = await (html2canvas as any)(element, {
        scale: 1.5,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff"
      });
      
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a5",
        putOnlyUsedFonts: true
      });
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Memo_${selectedSale.id}.pdf`);
      toast({ title: "সফল", description: "মেমো ডাউনলোড সম্পন্ন হয়েছে", type: "success" });
    } catch (error) {
      console.error("PDF Download Error:", error);
      toast({ title: "ব্যর্থ", description: "মেমো জেনারেট করা যায়নি", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const openSaleDetails = (sale: Sale) => {
    setSelectedSale(sale);
    setIsDialogOpen(true);
  };

  const fetchSales = async () => {
    setIsLoading(true);
    try {
      const data = await fetchApi('/api/sales');
      setSales(data);
    } catch (error) {
      toast({ title: "ভুল হয়েছে", description: "বিক্রয় তালিকা লোড করা যায়নি", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, []);

  const filteredSales = sales.filter(sale => 
    (sale.customerName && sale.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.customerPhone && sale.customerPhone.includes(searchTerm)) ||
    (sale.customerAddress && sale.customerAddress.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (sale.id && sale.id.toString().toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-primary/5 shadow-xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
            <FileText className="h-10 w-10 text-accent" />
            মেমো তালিকা
          </h1>
          <p className="text-muted-foreground font-medium mt-1">আপনার সকল পুরাতন বিক্রয়ের রেকর্ড</p>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button asChild className="rounded-2xl h-12 px-6 shadow-lg bg-primary text-white hover:bg-primary/90">
            <Link to="/sales">
              <Plus className="mr-2 h-5 w-5" />
              নতুন বিক্রয়
            </Link>
          </Button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-2 max-w-xl relative group text-left"
      >
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input
          type="search"
          placeholder="নাম, মোবাইল বা মেমো নং দিয়ে খুঁজুন..."
          className="pl-12 h-14 rounded-2xl bg-card/50 backdrop-blur-sm border-primary/5 focus:ring-primary shadow-inner text-base"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </motion.div>

      <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-primary/5">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-sm text-left">
              <thead className="text-[10px] uppercase font-black tracking-widest bg-primary/5 text-primary/60 border-b border-primary/5">
                <tr>
                  <th className="px-8 py-6">তারিখ ও সময়</th>
                  <th className="px-8 py-6">মেমো নং</th>
                  <th className="px-8 py-6 text-left">কাস্টমার তথ্য</th>
                  <th className="px-8 py-6 text-right">মোট বিল</th>
                  <th className="px-8 py-6 text-right">জমা</th>
                  <th className="px-8 py-6 text-right">বাকি</th>
                  <th className="px-8 py-6 text-center">অ্যাকশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {filteredSales.map((sale, idx) => (
                  <motion.tr 
                    key={sale.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="hover:bg-primary/5 transition-all group"
                  >
                    <td className="px-8 py-6 whitespace-nowrap text-muted-foreground font-medium">{sale.createdAt ? formatDate(new Date(sale.createdAt)) : "N/A"}</td>
                    <td className="px-8 py-6 font-black text-xs text-primary">{sale.id}</td>
                    <td className="px-8 py-6 text-left">
                      <div className="font-black text-primary uppercase tracking-tight line-clamp-1">{sale.customerName}</div>
                      <div className="text-[10px] font-bold text-muted-foreground">{sale.customerPhone}</div>
                    </td>
                    <td className="px-8 py-6 text-right font-black">{formatCurrency(sale.finalAmount)}</td>
                    <td className="px-8 py-6 text-right text-green-600 font-black">{formatCurrency(sale.paidAmount)}</td>
                    <td className="px-8 py-6 text-right text-danger font-black">{formatCurrency(sale.dueAmount)}</td>
                    <td className="px-8 py-6 text-center">
                      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => openSaleDetails(sale)}
                          className="rounded-xl border-primary/10 hover:bg-primary hover:text-white transition-all font-black text-[10px] uppercase tracking-widest h-10 px-4"
                        >
                          <Eye className="mr-2 h-4 w-4" /> দেখুন
                        </Button>
                      </motion.div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredSales.length === 0 && !isLoading && (
            <div className="py-32 text-center flex flex-col items-center gap-4 opacity-30">
              <div className="p-8 bg-muted rounded-full">
                <Search className="h-16 w-16 text-primary" />
              </div>
              <p className="font-black uppercase tracking-widest text-xs">কোনো মেমো পাওয়া যায়নি</p>
            </div>
          )}
          {isLoading && (
            <div className="py-32 text-center flex flex-col items-center gap-4">
              <div className="h-12 w-12 border-4 border-primary border-t-transparent animate-spin rounded-full" />
              <p className="font-black uppercase tracking-widest text-[10px] text-muted-foreground">ডাটা লোড হচ্ছে...</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modern Memo Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto rounded-[2.5rem] border-none shadow-2xl p-0 overflow-hidden bg-card/90 backdrop-blur-2xl">
          <div className="bg-primary p-6 flex justify-between items-center text-white sticky top-0 z-[60] shadow-xl">
            <h2 className="font-black text-lg flex items-center gap-3">
              <FileText className="h-6 w-6 text-accent" />
              মেমো প্রিভিউ
            </h2>
            <div className="flex gap-3 mr-10">
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                className="bg-white/10 text-white hover:bg-white/20 border border-white/10 rounded-xl font-black text-[10px] uppercase tracking-widest h-10 px-5 shadow-inner transition-all"
              >
                {isDownloading ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin mr-2" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Download
              </Button>
              <Button 
                onClick={() => handlePrint()}
                size="sm"
                className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg h-10 px-5 transition-all"
              >
                <Printer className="mr-2 h-4 w-4" /> Print
              </Button>
            </div>
          </div>
          
          <AnimatePresence>
            {selectedSale && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-6 sm:p-10 bg-muted/20"
              >
                <div className="shadow-2xl rounded-sm overflow-x-auto bg-white border border-black/5 mx-auto w-full">
                  <Invoice ref={componentRef} sale={selectedSale} />
                </div>
                
                {/* Print Hint for Mobile */}
                <div className="mt-8 flex items-center justify-center gap-3 p-4 bg-primary/5 rounded-2xl border border-primary/10 lg:hidden">
                  <AlertCircle className="h-5 w-5 text-primary animate-pulse" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">
                    মোবাইলে সরাসরি প্রিন্ট করতে সমস্য হলে PDF ডাউনলোড করুন।
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Memos;
