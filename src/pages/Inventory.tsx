import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, AlertTriangle, Image as ImageIcon, ShoppingCart, Filter, LayoutGrid, List as ListIcon } from "lucide-react";
import ProductDialog from "@/components/ProductDialog";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import ConfirmDialog from "@/components/ConfirmDialog";

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

const Inventory = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [productToEdit, setProductToEdit] = useState<Product | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const { role } = useAuth();
  const { toast } = useToast();
  const isAdmin = role === "admin";

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [isDeleteLoading, setIsDeleteLoading] = useState(false);

  const fetchProducts = async () => {
    try {
      const data = await fetchApi('/api/products');
      setProducts(data);
    } catch (error) {
      toast({ title: "ভুল হয়েছে", description: "পণ্য লোড করা সম্ভব হয়নি", type: "error" });
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (!productToDelete) return;
    setIsDeleteLoading(true);
    try {
      await fetchApi(`/api/products/${productToDelete}`, { method: 'DELETE' });
      toast({ title: "সফল", description: "পণ্যটি মুছে ফেলা হয়েছে", type: "success" });
      setIsDeleteConfirmOpen(false);
      setProductToDelete(null);
      fetchProducts();
    } catch (error) {
      toast({ title: "ব্যর্থ", description: "পণ্যটি ডিলিট করা যায়নি", type: "error" });
    } finally {
      setIsDeleteLoading(false);
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between bg-card/40 backdrop-blur-md p-6 rounded-3xl border border-primary/5 shadow-xl">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-4xl font-black text-primary tracking-tight flex items-center gap-3">
            <div className="h-10 w-2 bg-accent rounded-full" />
            ইনভেন্টরি
          </h1>
          <p className="text-muted-foreground font-medium mt-1">পণ্যের মজুদ ও ব্যবস্থাপনা</p>
        </motion.div>
        
        {isAdmin && (
          <div className="flex flex-wrap gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button variant="outline" asChild className="rounded-2xl h-12 px-6 border-primary/10 hover:bg-primary/5 shadow-sm">
                <Link to="/sales">
                  <ShoppingCart className="mr-2 h-5 w-5 text-primary" />
                  বিক্রয় করুন
                </Link>
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                onClick={() => { setProductToEdit(null); setIsDialogOpen(true); }}
                className="rounded-2xl h-12 px-6 bg-primary text-primary-foreground shadow-lg hover:shadow-primary/20"
              >
                <Plus className="mr-2 h-5 w-5" />
                নতুন পণ্য
              </Button>
            </motion.div>
          </div>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full max-w-xl group text-left">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <Input
            type="search"
            placeholder="পণ্য বা ক্যাটাগরি দিয়ে খুঁজুন..."
            className="pl-12 h-14 rounded-2xl bg-card/50 backdrop-blur-sm border-primary/5 focus:ring-primary shadow-inner text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2 p-1.5 bg-muted/30 rounded-2xl border border-primary/5 shadow-sm">
          <Button 
            variant={viewMode === 'table' ? 'default' : 'ghost'} 
            size="icon" 
            className="rounded-xl h-10 w-10"
            onClick={() => setViewMode('table')}
          >
            <ListIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant={viewMode === 'grid' ? 'default' : 'ghost'} 
            size="icon" 
            className="rounded-xl h-10 w-10"
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'table' ? (
          <motion.div
            key="table"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="border-none shadow-2xl bg-card/40 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-primary/5">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-[10px] uppercase font-black tracking-widest bg-primary/5 text-primary/60 border-b border-primary/5">
                      <tr>
                        <th className="px-6 py-5">ছবি</th>
                        <th className="px-6 py-5">নাম</th>
                        <th className="px-6 py-5">ক্যাটাগরি</th>
                        {isAdmin && <th className="px-6 py-5 text-right">কেনা দাম</th>}
                        {isAdmin && <th className="px-6 py-5 text-right">পাইকারি দাম</th>}
                        <th className="px-6 py-5 text-right">খুচরা দাম</th>
                        <th className="px-6 py-5 text-center">স্টক</th>
                        {isAdmin && <th className="px-6 py-5 text-center">অ্যাকশন</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {filteredProducts.map((product, idx) => (
                        <motion.tr 
                          key={product.id} 
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.03 }}
                          className="hover:bg-primary/5 transition-all group"
                        >
                          <td className="px-6 py-4">
                            <div className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-inner bg-muted group-hover:scale-110 transition-transform border border-primary/5">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground/40">
                                  <ImageIcon className="h-5 w-5" />
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="font-bold text-base text-primary group-hover:translate-x-1 transition-transform">{product.name}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="bg-primary/5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-primary/70 border border-primary/5">
                              {product.category}
                            </span>
                          </td>
                          {isAdmin && <td className="px-6 py-4 text-right font-medium text-muted-foreground">{formatCurrency(product.purchasePrice)}</td>}
                          {isAdmin && <td className="px-6 py-4 text-right font-medium text-primary">{formatCurrency(product.wholesalePrice)}</td>}
                          <td className="px-6 py-4 text-right">
                            <div className="font-black text-primary text-base">{formatCurrency(product.retailPrice)}</div>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className={cn(
                              "inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl border font-black text-sm",
                              product.stock < 10 
                                ? "bg-danger/10 text-danger border-danger/20 animate-pulse" 
                                : "bg-green-500/10 text-green-600 border-green-500/20"
                            )}>
                              {product.stock} {product.unit}
                              {product.stock < 10 && <AlertTriangle className="h-4 w-4" />}
                            </div>
                          </td>
                          {isAdmin && (
                            <td className="px-6 py-4 text-center">
                              <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl text-primary hover:bg-primary/10"
                                    onClick={() => {
                                      setProductToEdit(product);
                                      setIsDialogOpen(true);
                                    }}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-xl text-danger hover:bg-danger/10"
                                    onClick={() => {
                                      setProductToDelete(product.id);
                                      setIsDeleteConfirmOpen(true);
                                    }}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </motion.div>
                              </div>
                            </td>
                          )}
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredProducts.length === 0 && (
                  <div className="py-24 text-center">
                    <div className="inline-flex p-6 bg-muted rounded-full mb-4">
                      <Search className="h-10 w-10 text-muted-foreground/30" />
                    </div>
                    <p className="text-muted-foreground font-black uppercase tracking-widest text-xs">কোনো পণ্য পাওয়া যায়নি</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6"
          >
            {filteredProducts.map((product, idx) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Card className="overflow-hidden h-full flex flex-col group hover:shadow-2xl transition-all duration-300 border-none bg-card/40 backdrop-blur-md rounded-[2rem] border border-primary/5">
                  <div className="h-40 w-full bg-muted flex items-center justify-center relative overflow-hidden border-b border-primary/5">
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
                    
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                      {product.stock <= 10 && (
                        <div className="bg-danger/90 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg animate-pulse">
                          Low Stock
                        </div>
                      )}
                      <div className="bg-primary/80 backdrop-blur-md text-white text-[9px] font-black px-2 py-1 rounded-full uppercase tracking-tighter shadow-lg">
                        {product.category}
                      </div>
                    </div>
                    
                    {isAdmin && (
                      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                         <div className="flex flex-col gap-1">
                            <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full shadow-lg" onClick={() => { setProductToEdit(product); setIsDialogOpen(true); }}>
                                <Edit className="h-3.5 w-3.5" />
                            </Button>
                            <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-lg" onClick={() => { setProductToDelete(product.id); setIsDeleteConfirmOpen(true); }}>
                                <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                         </div>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors h-10 text-left" title={product.name}>{product.name}</h3>
                    <div className="mt-auto pt-4 border-t border-primary/5">
                      <div className="flex flex-col mb-3 text-left">
                        <span className="text-[10px] text-muted-foreground font-black uppercase tracking-tighter">খুচরা মূল্য</span>
                        <span className="font-black text-primary text-lg leading-none tracking-tight">{formatCurrency(product.retailPrice)}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-xl border border-primary/5 shadow-inner">
                        <span>মজুদ</span>
                        <span className={cn(product.stock < 10 ? "text-danger" : "text-primary")}>{product.stock} {product.unit}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {isAdmin && (
        <ProductDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          productToEdit={productToEdit}
          onSuccess={fetchProducts}
        />
      )}

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="পণ্য মুছে ফেলুন"
        description="আপনি কি নিশ্চিত যে আপনি এই পণ্যটি ইনভেন্টরি থেকে চিরতরে মুছে ফেলতে চান?"
        onConfirm={handleDelete}
        isLoading={isDeleteLoading}
        confirmText="হ্যাঁ, মুছে ফেলুন"
      />
    </div>
  );
};

export default Inventory;
