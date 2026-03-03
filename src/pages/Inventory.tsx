import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Search, Edit, Trash2, AlertTriangle, Image as ImageIcon, ShoppingCart } from "lucide-react";
import ProductDialog from "@/components/ProductDialog";
import { formatCurrency } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { fetchApi } from "@/lib/api";
import { Link } from "react-router-dom";

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
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const fetchProducts = async () => {
    try {
      const data = await fetchApi('/api/products');
      setProducts(data);
    } catch (error) {
      console.error("Error fetching products:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm("আপনি কি নিশ্চিত যে আপনি এই পণ্যটি মুছে ফেলতে চান?")) {
      try {
        await fetchApi(`/api/products/${id}`, { method: 'DELETE' });
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-bold text-primary">ইনভেন্টরি</h1>
        {isAdmin && (
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/sales">
                <ShoppingCart className="mr-2 h-4 w-4" />
                বিক্রয় করুন
              </Link>
            </Button>
            <Button onClick={() => { setProductToEdit(null); setIsDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              নতুন পণ্য যোগ করুন
            </Button>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="পণ্য খুঁজুন..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>পণ্যের তালিকা ({filteredProducts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">ছবি</th>
                  <th className="px-4 py-3">নাম</th>
                  <th className="px-4 py-3">ক্যাটাগরি</th>
                  {isAdmin && <th className="px-4 py-3 text-right">কেনা দাম</th>}
                  {isAdmin && <th className="px-4 py-3 text-right">পাইকারি দাম</th>}
                  <th className="px-4 py-3 text-right">খুচরা দাম</th>
                  <th className="px-4 py-3 text-center">স্টক</th>
                  {isAdmin && <th className="px-4 py-3 text-center">অ্যাকশন</th>}
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="px-4 py-3">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded object-cover" referrerPolicy="no-referrer" />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">{product.name}</td>
                    <td className="px-4 py-3">{product.category}</td>
                    {isAdmin && <td className="px-4 py-3 text-right">{formatCurrency(product.purchasePrice)}</td>}
                    {isAdmin && <td className="px-4 py-3 text-right">{formatCurrency(product.wholesalePrice)}</td>}
                    <td className="px-4 py-3 text-right">{formatCurrency(product.retailPrice)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <span className={product.stock < 10 ? "text-danger font-bold" : ""}>
                          {product.stock} {product.unit}
                        </span>
                        {product.stock < 10 && <AlertTriangle className="h-4 w-4 text-danger" />}
                      </div>
                    </td>
                    {isAdmin && (
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProductToEdit(product);
                              setIsDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4 text-primary" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(product.id)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
                {filteredProducts.length === 0 && (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 5} className="px-4 py-8 text-center text-muted-foreground">
                      কোনো পণ্য পাওয়া যায়নি
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {isAdmin && (
        <ProductDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          productToEdit={productToEdit}
          onSuccess={fetchProducts}
        />
      )}
    </div>
  );
};

export default Inventory;
