import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search, ShoppingCart, Trash2, Image as ImageIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { Select } from "@/components/ui/select-native";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";

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

const Sales = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [discount, setDiscount] = useState("");
  const navigate = useNavigate();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await fetchApi('/api/products');
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1, priceType: "retail", salePrice: product.retailPrice }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        if (newQty > item.stock) {
          alert(`স্টক এ পর্যাপ্ত পণ্য নেই! বর্তমান স্টক: ${item.stock}`);
          return item;
        }
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  const updatePriceType = (id: string, type: "retail" | "wholesale") => {
    setCart(prev => prev.map(item => 
      item.id === id ? { 
        ...item, 
        priceType: type, 
        salePrice: type === "retail" ? item.retailPrice : item.wholesalePrice 
      } : item
    ));
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + (item.salePrice * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (!customerName || !customerPhone) {
      alert("কাস্টমারের নাম এবং মোবাইল নম্বর দিন!");
      return;
    }

    const totalAmount = calculateTotal();
    const discountAmount = Number(discount) || 0;
    const finalAmount = totalAmount - discountAmount;
    const paid = Number(paidAmount) || 0;
    const due = finalAmount - paid;

    try {
      await fetchApi('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerAddress,
          items: cart.map(({ id, name, quantity, salePrice, priceType, unit }) => ({ 
            id, name, quantity, salePrice, priceType, unit 
          })),
          totalAmount,
          discount: discountAmount,
          finalAmount,
          paidAmount: paid,
          dueAmount: due,
        }),
      });

      alert("বিক্রয় সফল হয়েছে!");
      setCart([]);
      setIsCheckoutOpen(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");
      setPaidAmount("");
      setDiscount("");
      navigate("/memos");
    } catch (e: any) {
      console.error("Transaction failed: ", e);
      alert(e.message || "বিক্রয় ব্যর্থ হয়েছে! স্টক চেক করুন বা আবার চেষ্টা করুন।");
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) && p.stock > 0
  );

  return (
    <div className="flex h-[calc(100vh-2rem)] gap-4">
      {/* Product List */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Input 
            placeholder="পণ্য খুঁজুন..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-1"
          />
          <Button variant="outline"><Search className="h-4 w-4" /></Button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2">
          {filteredProducts.map(product => (
            <Card key={product.id} className="cursor-pointer hover:border-primary transition-colors overflow-hidden" onClick={() => addToCart(product)}>
              <div className="h-32 w-full bg-muted flex items-center justify-center">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
              <CardContent className="p-4 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg truncate" title={product.name}>{product.name}</h3>
                  <p className="text-sm text-muted-foreground">{product.category}</p>
                </div>
                <div className="mt-2">
                  <p className="font-medium text-primary">খুচরা: {formatCurrency(product.retailPrice)}</p>
                  {isAdmin && <p className="text-sm text-muted-foreground">পাইকারি: {formatCurrency(product.wholesalePrice)}</p>}
                  <p className="text-xs text-muted-foreground">স্টক: {product.stock} {product.unit}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart */}
      <div className="w-96 flex flex-col bg-card border rounded-lg shadow-sm">
        <div className="p-4 border-b bg-muted/20">
          <h2 className="font-bold flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            কার্ট ({cart.length})
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex flex-col gap-2 border-b pb-2 last:border-0">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">{item.name}</h4>
                <button onClick={() => removeFromCart(item.id)} className="text-danger hover:bg-danger/10 p-1 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center border rounded-md">
                  <button onClick={() => updateQuantity(item.id, -1)} className="px-2 py-1 hover:bg-muted">-</button>
                  <span className="px-2 text-sm font-medium">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="px-2 py-1 hover:bg-muted">+</button>
                </div>
                
                <Select 
                  value={item.priceType} 
                  onChange={(e) => updatePriceType(item.id, e.target.value as "retail" | "wholesale")}
                  className="h-8 text-xs w-24"
                  disabled={!isAdmin}
                >
                  <option value="retail">খুচরা</option>
                  {isAdmin && <option value="wholesale">পাইকারি</option>}
                </Select>
                
                <span className="font-bold text-sm">{formatCurrency(item.salePrice * item.quantity)}</span>
              </div>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="text-center text-muted-foreground py-8">
              কার্ট খালি
            </div>
          )}
        </div>

        <div className="p-4 border-t bg-muted/20 space-y-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>মোট:</span>
            <span>{formatCurrency(calculateTotal())}</span>
          </div>
          <Button className="w-full" size="lg" disabled={cart.length === 0} onClick={() => setIsCheckoutOpen(true)}>
            বিক্রি করুন
          </Button>
        </div>
      </div>

      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>চেকআউট</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">নাম</Label>
              <Input className="col-span-3" value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="কাস্টমারের নাম" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">মোবাইল</Label>
              <Input className="col-span-3" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="017..." />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ঠিকানা</Label>
              <Input className="col-span-3" value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} placeholder="ঠিকানা (ঐচ্ছিক)" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">ডিসকাউন্ট</Label>
              <Input className="col-span-3" type="number" value={discount} onChange={e => setDiscount(e.target.value)} placeholder="0" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">পরিশোধ</Label>
              <Input className="col-span-3" type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="কত টাকা দিয়েছে?" />
            </div>
            
            <div className="border-t pt-4 mt-2 space-y-2">
              <div className="flex justify-between">
                <span>মোট বিল:</span>
                <span>{formatCurrency(calculateTotal())}</span>
              </div>
              <div className="flex justify-between text-danger">
                <span>ডিসকাউন্ট:</span>
                <span>- {formatCurrency(Number(discount) || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg">
                <span>নিট বিল:</span>
                <span>{formatCurrency(calculateTotal() - (Number(discount) || 0))}</span>
              </div>
              <div className="flex justify-between text-primary">
                <span>পরিশোধ:</span>
                <span>{formatCurrency(Number(paidAmount) || 0)}</span>
              </div>
              <div className="flex justify-between font-bold text-danger">
                <span>বাকি:</span>
                <span>{formatCurrency(Math.max(0, (calculateTotal() - (Number(discount) || 0)) - (Number(paidAmount) || 0)))}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCheckout}>নিশ্চিত করুন</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sales;
