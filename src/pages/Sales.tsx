import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingCart, Trash2, Image as ImageIcon, Plus, ArrowRight, X, User, Phone, MapPin, Download, Printer, CheckCircle2 } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ConfirmDialog";
import { Select } from "@/components/ui/select-native";
import { Invoice } from "@/components/Invoice";
import { useReactToPrint } from "react-to-print";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface Product {
  id: string;
  name: string;
  category: string;
  purchasePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  unit: string;
  imageUrl?: string;
}

interface CartItem extends Product {
  quantity: number;
  priceType: "retail" | "wholesale";
  salePrice: number;
}

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: CartItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  createdAt?: any;
}

const Sales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [lastSale, setLastSale] = useState<Sale | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const handlePrint = useReactToPrint({
    contentRef: invoiceRef,
  });

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current || !lastSale) return;
    setIsDownloading(true);
    try {
      const canvas = await (html2canvas as any)(invoiceRef.current, { 
        scale: 2, 
        useCORS: true,
        backgroundColor: "#ffffff",
        windowWidth: 800,
        onclone: (clonedDoc: Document) => {
          const el = clonedDoc.querySelector('[data-invoice-container]') as HTMLElement;
          if (el) {
            el.style.width = '600px';
            el.style.maxWidth = '600px';
          }
        }
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.95);
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a5" });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${lastSale.id}.pdf`);
    } catch (e) {
      toast({ title: "ব্যর্থ", description: "PDF তৈরি করা সম্ভব হয়নি", type: "error" });
    } finally {
      setIsDownloading(false);
    }
  };

  const [isCartMobileOpen, setIsCartMobileOpen] = useState(false);
  const [isCartClearConfirmOpen, setIsCartClearConfirmOpen] = useState(false);
  
  const [customerMode, setCustomerMode] = useState<"existing" | "new">("new");
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [customerSearch, setCustomerSearch] = useState("");
  
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState("");
  
  const navigate = useNavigate();
  const { role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  useEffect(() => {
    const loadData = async () => {
      try {
        const [prods, custs] = await Promise.all([
          fetchApi('/api/products'),
          fetchApi('/api/customers')
        ]);
        setProducts(prods);
        setCustomers(custs);
      } catch (error: any) {
        toast({ title: "ভুল হয়েছে", description: error.message || "ডাটা লোড করা যায়নি", type: "error" });
      }
    };
    loadData();
  }, [toast]);

  const addToCart = (product: Product, priceType: "retail" | "wholesale") => {
    const existingIndex = cart.findIndex(item => item.id === product.id && item.priceType === priceType);
    const salePrice = priceType === "retail" ? product.retailPrice : product.wholesalePrice;
    
    if (existingIndex > -1) {
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
    } else {
      setCart([...cart, { ...product, quantity: 1, priceType, salePrice }]);
    }
    toast({ title: "সফল", description: `${product.name} কার্টে যোগ করা হয়েছে`, type: "success" });
  };

  const removeFromCart = (id: string, priceType: "retail" | "wholesale") => {
    setCart(cart.filter(item => !(item.id === id && item.priceType === priceType)));
  };

  const updateQuantity = (id: string, priceType: "retail" | "wholesale", delta: number) => {
    const newCart = cart.map(item => {
      if (item.id === id && item.priceType === priceType) {
        const newQty = Math.max(0, item.quantity + delta);
        // Round to 2 decimal places
        return { ...item, quantity: Math.round(newQty * 100) / 100 };
      }
      return item;
    }).filter(item => item.quantity > 0);
    setCart(newCart);
  };

  const handleQuantityChange = (id: string, priceType: "retail" | "wholesale", value: string) => {
    const newQty = parseFloat(value);
    if (isNaN(newQty)) return;
    
    const newCart = cart.map(item => {
      if (item.id === id && item.priceType === priceType) {
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity >= 0);
    setCart(newCart);
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.salePrice * item.quantity), 0);
  };

  const filteredCustomers = customers.filter(c => 
    (c.name && c.name.toLowerCase().includes(customerSearch.toLowerCase())) || 
    (c.phone && c.phone.includes(customerSearch))
  );

  const selectedCustomer = customers.find(c => c.id.toString() === selectedCustomerId);

  const handleCheckout = async () => {
    if (customerMode === "new") {
      if (!customerName || !customerPhone) {
        toast({ title: "তথ্য দিন", description: "কাস্টমারের নাম এবং মোবাইল দিন", type: "warning" });
        return;
      }
    } else {
      if (!selectedCustomerId) {
        toast({ title: "তথ্য দিন", description: "কাস্টমার নির্বাচন করুন", type: "warning" });
        return;
      }
    }

    const totalAmount = calculateTotal();
    const discountAmount = Number(discount) || 0;
    const finalAmount = totalAmount - discountAmount;
    const paid = Number(paidAmount) || 0;
    const actualPaid = Math.min(paid, finalAmount);
    const due = Math.max(0, finalAmount - paid);

    try {
      const response = await fetchApi('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerId: customerMode === "existing" ? Number(selectedCustomerId) : null,
          customerName: customerMode === "new" ? customerName : null,
          customerPhone: customerMode === "new" ? customerPhone : null,
          customerAddress: customerMode === "new" ? customerAddress : null,
          items: cart.map(({ id, name, quantity, salePrice, priceType, unit }) => ({ 
            id, name, quantity, salePrice, priceType, unit 
          })),
          totalAmount,
          discount: discountAmount,
          finalAmount,
          paidAmount: actualPaid,
          dueAmount: due,
        }),
      });

      const saleData: Sale = {
        id: response.id,
        customerName: customerMode === "new" ? customerName : (selectedCustomer?.name || ""),
        customerPhone: customerMode === "new" ? customerPhone : (selectedCustomer?.phone || ""),
        customerAddress: customerMode === "new" ? customerAddress : (selectedCustomer?.address || ""),
        items: [...cart],
        totalAmount,
        discount: discountAmount,
        finalAmount,
        paidAmount: actualPaid,
        dueAmount: due,
        createdAt: new Date()
      };

      setLastSale(saleData);
      setIsCheckoutOpen(false);
      setIsSuccessOpen(true);
      
      toast({ title: "সফল", description: "বিক্রয় সম্পন্ন হয়েছে", type: "success" });
      setCart([]);
      setIsCartMobileOpen(false);
      setCustomerName(""); setCustomerPhone(""); setCustomerAddress("");
      setPaidAmount(""); setDiscount(""); setSelectedCustomerId("");
    } catch (e: any) {
      toast({ title: "ব্যর্থ হয়েছে", description: e.message || "বিক্রয় করা সম্ভব হয়নি", type: "error" });
    }
  };

  const filteredProducts = products.filter(p => 
    ((p.name && p.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
     (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase())) ||
     (p.id && p.id.toString().includes(searchTerm))) && 
    p.stock > 0
  );

  const cartContent = (
    <div className="flex flex-col h-full bg-card/60 backdrop-blur-xl border border-primary/5 shadow-2xl overflow-hidden rounded-[2.5rem]">
      <div className="p-6 border-b bg-primary/5 flex items-center justify-between">
        <h2 className="font-black flex items-center gap-3 text-primary text-xl">
          <div className="p-2 bg-primary rounded-xl">
            <ShoppingCart className="h-5 w-5 text-accent" />
          </div>
          কার্ট ({cart.length})
        </h2>
        <Button variant="ghost" size="sm" onClick={() => setIsCartClearConfirmOpen(true)} className="text-danger font-black text-[10px] uppercase tracking-widest hover:bg-danger/10">মুছে ফেলুন</Button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        <AnimatePresence initial={false}>
          {cart.map((item) => (
            <motion.div 
              key={`${item.id}-${item.priceType}`} 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, x: -50 }}
              className="flex flex-col gap-3 border-b border-primary/5 pb-4 last:border-0"
            >
              <div className="flex justify-between items-start">
                <div className="text-left">
                  <h4 className="font-bold text-sm leading-tight text-primary">{item.name}</h4>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full mt-1 inline-block border",
                    item.priceType === 'retail' ? 'bg-blue-500/10 text-blue-600 border-blue-500/10' : 'bg-amber-500/10 text-amber-600 border-amber-500/10'
                  )}>
                    {item.priceType === 'retail' ? 'খুচরা' : 'পাইকারি'}
                  </span>
                </div>
                <button onClick={() => removeFromCart(item.id, item.priceType)} className="close-button">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center bg-muted/50 rounded-xl p-1 border border-primary/5 shadow-inner">
                  <button onClick={() => updateQuantity(item.id, item.priceType, -1)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-card transition-all font-black text-primary">-</button>
                  <input 
                    type="number"
                    step="any"
                    value={item.quantity}
                    onChange={(e) => handleQuantityChange(item.id, item.priceType, e.target.value)}
                    className="w-12 text-center text-sm font-black text-primary bg-transparent border-none focus:ring-0 p-0"
                  />
                  <button onClick={() => updateQuantity(item.id, item.priceType, 1)} className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-card transition-all font-black text-primary">+</button>
                </div>
                
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground font-bold">{formatCurrency(item.salePrice)} × {item.quantity}</div>
                  <span className="font-black text-primary">{formatCurrency(item.salePrice * item.quantity)}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {cart.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4 opacity-30 font-black">
            <ShoppingCart className="h-16 w-16" />
            <p className="uppercase tracking-widest text-xs">কার্ট খালি</p>
          </div>
        )}
      </div>

      <div className="p-8 border-t bg-primary/5 space-y-6">
        <div className="flex justify-between items-end">
          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">সর্বমোট বিল</span>
          <span className="text-3xl font-black text-primary tracking-tighter">{formatCurrency(calculateTotal())}</span>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            className="w-full h-16 rounded-[1.5rem] bg-primary text-primary-foreground font-black text-lg shadow-xl shadow-primary/20 hover:bg-primary/90 flex items-center justify-center gap-3 group" 
            disabled={cart.length === 0} 
            onClick={() => setIsCheckoutOpen(true)}
          >
            বিক্রি সম্পন্ন করুন
            <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-8rem)] gap-6 relative">
      {/* Product List */}
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        <div className="flex items-center gap-3 bg-card/40 backdrop-blur-md p-4 rounded-3xl border border-primary/5 shadow-lg">
          <div className="relative flex-1 group text-left">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="পণ্য বা ক্যাটাগরি দিয়ে খুঁজুন..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl bg-background/50 border-none focus:ring-primary shadow-inner text-base"
            />
          </div>
          {isAdmin && (
            <Button variant="secondary" asChild className="h-12 rounded-2xl hidden sm:flex">
              <Link to="/inventory">
                <Plus className="mr-2 h-5 w-5" />
                নতুন পণ্য
              </Link>
            </Button>
          )}
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 overflow-y-auto pr-2 custom-scrollbar pb-24 lg:pb-10">
          <AnimatePresence>
            {filteredProducts.map(product => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -5 }}
                className="h-full"
              >
                <Card className="overflow-hidden h-full flex flex-col group hover:shadow-2xl transition-all duration-300 border-none bg-card/40 backdrop-blur-sm rounded-[2rem] border border-primary/5">
                  <div className="h-32 w-full bg-muted flex items-center justify-center overflow-hidden relative border-b border-primary/5">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.name} 
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" 
                        referrerPolicy="no-referrer" 
                      />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-muted-foreground/30" />
                    )}
                    <div className="absolute top-2 right-2 px-2.5 py-1 bg-primary/80 backdrop-blur-md text-white text-[9px] font-black rounded-full uppercase tracking-widest border border-white/5 shadow-lg">
                      {product.category}
                    </div>
                  </div>
                  <CardContent className="p-4 sm:p-5 flex flex-col justify-between flex-1">
                    <div className="text-left">
                      <h3 className="font-bold text-sm sm:text-base line-clamp-1 group-hover:text-primary transition-colors text-primary" title={product.name}>{product.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-black uppercase tracking-tighter border border-accent/10">
                          {product.unit}
                        </span>
                      </div>
                    </div>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between items-center bg-muted/30 px-3 py-1.5 rounded-xl border border-primary/5 shadow-inner">
                        <span className="text-[9px] font-black uppercase text-muted-foreground">মজুদ</span>
                        <span className={cn(
                          "font-black text-xs",
                          product.stock < 10 ? "text-danger animate-pulse" : "text-primary"
                        )}>{product.stock} {product.unit}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="w-full flex flex-col items-center py-4 sm:py-5 h-auto rounded-2xl hover:bg-primary hover:text-white border-primary/10 transition-all shadow-sm"
                          onClick={() => addToCart(product, "retail")}
                        >
                          <span className="text-[8px] font-black uppercase opacity-60">খুচরা</span>
                          <span className="font-black text-[11px] sm:text-xs text-primary group-hover:text-white">{formatCurrency(product.retailPrice)}</span>
                        </Button>
                        {isAdmin && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full flex flex-col items-center py-4 sm:py-5 h-auto rounded-2xl border-accent/20 hover:bg-accent hover:text-accent-foreground transition-all shadow-sm group"
                            onClick={() => addToCart(product, "wholesale")}
                          >
                            <span className="text-[8px] font-black uppercase opacity-60 group-hover:text-accent-foreground">পাইকারি</span>
                            <span className="font-black text-[11px] sm:text-xs text-accent group-hover:text-accent-foreground">{formatCurrency(product.wholesalePrice)}</span>
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Floating Mobile Cart Trigger */}
      <div className="fixed bottom-24 right-6 lg:hidden z-40">
        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
          <Button 
            className="h-16 w-16 rounded-full bg-primary text-white shadow-2xl border-4 border-white/10 relative"
            onClick={() => setIsCartMobileOpen(true)}
          >
            <ShoppingCart className="h-6 w-6 text-accent" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 h-6 w-6 bg-danger text-white text-[10px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-bounce">
                {cart.length}
              </span>
            )}
          </Button>
        </motion.div>
      </div>

      {/* Desktop Cart */}
      <div className="hidden lg:flex w-[400px] flex-col">
        {cartContent}
      </div>

      {/* Mobile Cart Overlay */}
      <AnimatePresence>
        {isCartMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartMobileOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 inset-x-0 h-[85vh] bg-card rounded-t-[3rem] shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="h-1.5 w-12 bg-muted rounded-full mx-auto mt-4 mb-2" />
              <div className="flex-1 overflow-hidden p-2">
                {cartContent}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-card/80 backdrop-blur-2xl">
          <div className="bg-primary p-8 text-white">
            <DialogHeader>
              <DialogTitle className="text-3xl font-black tracking-tight">চেকআউট পেমেন্ট</DialogTitle>
            </DialogHeader>
          </div>
          
          <div className="p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
            <div className="flex p-1 bg-muted rounded-2xl mb-4">
               <button 
                className={cn("flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all", customerMode === 'new' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
                onClick={() => setCustomerMode('new')}
               >
                 নতুন কাস্টমার
               </button>
               <button 
                className={cn("flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all", customerMode === 'existing' ? "bg-primary text-white shadow-lg" : "text-muted-foreground")}
                onClick={() => setCustomerMode('existing')}
               >
                 পুরাতন কাস্টমার
               </button>
            </div>

            <div className="grid grid-cols-1 gap-6 text-left">
              {customerMode === "existing" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">কাস্টমার খুঁজুন</Label>
                    <Input 
                      placeholder="নাম বা মোবাইল দিয়ে খুঁজুন..." 
                      value={customerSearch}
                      onChange={e => setCustomerSearch(e.target.value)}
                      className="mb-2 h-10 rounded-xl bg-background/50 border-primary/10"
                    />
                    <Select 
                      className="h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm"
                      value={selectedCustomerId}
                      onChange={(e) => setSelectedCustomerId(e.target.value)}
                    >
                      <option value="">কাস্টমার সিলেক্ট করুন ({filteredCustomers.length})...</option>
                      {filteredCustomers.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </Select>
                  </div>
                  {selectedCustomer && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-primary/5 rounded-2xl border border-primary/10">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black uppercase text-muted-foreground">বর্তমান পাওনা:</span>
                        <span className={cn("font-black", selectedCustomer.totalDue > 0 ? "text-danger" : "text-green-600")}>
                          {formatCurrency(selectedCustomer.totalDue)}
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">কাস্টমারের নাম</Label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input className="pl-12 h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="নাম লিখুন" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">মোবাইল নম্বর</Label>
                    <div className="relative group">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input className="pl-12 h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="017XXXXXXXX" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">ঠিকানা (ঐচ্ছিক)</Label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                      <Input className="pl-12 h-14 rounded-2xl bg-background/50 border-primary/10 font-bold focus:ring-primary shadow-sm" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="ঠিকানা লিখুন" />
                    </div>
                  </div>
                </>
              )}
              
              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-primary/5">
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2">ডিসকাউন্ট</Label>
                  <Input className="h-14 rounded-2xl bg-background/50 border-accent/20 font-bold focus:ring-accent shadow-sm" type="number" step="any" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0.00" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-2 text-primary">জমা / পেমেন্ট</Label>
                  <Input className="h-14 rounded-2xl bg-primary/5 border-primary/20 font-black focus:ring-primary text-primary shadow-inner" type="number" step="any" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="৳ 0.00" />
                </div>
              </div>
            </div>
            
            <div className="bg-primary/5 rounded-[2.5rem] p-8 space-y-4 border border-primary/5 shadow-inner">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-muted-foreground uppercase tracking-widest text-[9px]">মোট বিল:</span>
                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-danger">
                <span className="uppercase tracking-widest text-[9px]">ডিসকাউন্ট (-):</span>
                <span>{formatCurrency(Number(discount) || 0)}</span>
              </div>
              <div className="flex justify-between border-t border-primary/10 pt-4">
                <span className="text-sm font-black uppercase tracking-tighter">নিট বিল:</span>
                <span className="text-2xl font-black text-primary tracking-tighter">{formatCurrency(calculateTotal() - (Number(discount) || 0))}</span>
              </div>
              <div className="flex justify-between border-t border-primary/10 pt-4 items-center">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  {(calculateTotal() - (Number(discount) || 0) - (Number(paidAmount) || 0)) >= 0 ? "বাকি (+)" : "ফেরৎ (-)"}
                </span>
                <span className={cn(
                  "text-xl font-black tracking-tighter",
                  (calculateTotal() - (Number(discount) || 0) - (Number(paidAmount) || 0)) > 0 ? "text-danger" : "text-green-600"
                )}>
                  {formatCurrency(Math.abs((calculateTotal() - (Number(discount) || 0)) - (Number(paidAmount) || 0)))}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-10 pt-0 bg-primary/5">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button onClick={handleCheckout} className="w-full h-20 rounded-[2rem] bg-primary text-primary-foreground font-black text-xl shadow-2xl shadow-primary/30 hover:bg-primary/90 transition-all border-none">
                বিক্রয় নিশ্চিত করুন
              </Button>
            </motion.div>
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isCartClearConfirmOpen}
        onOpenChange={setIsCartClearConfirmOpen}
        title="কার্ট খালি করুন"
        description="আপনি কি নিশ্চিত যে আপনি কার্টের সকল পণ্য মুছে ফেলতে চান?"
        onConfirm={() => {
          setCart([]);
          setIsCartClearConfirmOpen(false);
          toast({ title: "সফল", description: "কার্ট খালি করা হয়েছে", type: "success" });
        }}
        confirmText="হ্যাঁ, খালি করুন"
        variant="destructive"
      />

      {/* Sale Success Dialog */}
      <Dialog open={isSuccessOpen} onOpenChange={setIsSuccessOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[95vh] overflow-y-auto rounded-[3rem] border-none shadow-2xl p-0 overflow-hidden bg-card/90 backdrop-blur-2xl">
          <div className="bg-green-600 p-8 text-white flex justify-between items-center sticky top-0 z-50">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-2xl">
                <CheckCircle2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-3xl font-black tracking-tight">বিক্রয় সফল!</DialogTitle>
                <p className="text-white/80 font-bold">মেমো নম্বর: {lastSale?.id}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="secondary" 
                onClick={handleDownloadPDF} 
                disabled={isDownloading}
                className="bg-white/10 text-white hover:bg-white/20 border-none rounded-xl font-black text-xs uppercase tracking-widest h-12 px-6"
              >
                {isDownloading ? "..." : <Download className="mr-2 h-5 w-5" />} PDF
              </Button>
              <Button 
                onClick={() => handlePrint()}
                className="bg-white text-green-600 hover:bg-white/90 rounded-xl font-black text-xs uppercase tracking-widest h-12 px-6 shadow-xl"
              >
                <Printer className="mr-2 h-5 w-5" /> প্রিন্ট
              </Button>
            </div>
          </div>
          
          <div className="p-10 bg-muted/20">
            <div className="bg-white shadow-2xl rounded-sm overflow-x-auto border border-black/5 mx-auto w-full">
              {lastSale && <Invoice ref={invoiceRef} sale={lastSale as any} />}
            </div>
            <div className="mt-10">
              <Button 
                onClick={() => {
                  setIsSuccessOpen(false);
                  navigate("/memos");
                }}
                variant="outline"
                className="w-full h-16 rounded-2xl border-green-600/20 text-green-600 font-black text-lg hover:bg-green-50"
              >
                মেমো তালিকায় যান
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
