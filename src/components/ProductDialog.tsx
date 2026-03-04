import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select-native";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { fetchApi } from "@/lib/api";
import { motion, AnimatePresence } from "motion/react";
import { ImageIcon, Package, Tag, Banknote, Warehouse, Boxes, CheckCircle2, XCircle, UploadCloud, Edit, Plus } from "lucide-react";
import { useToast } from "@/components/ui/toast";

interface Product {
  id?: string;
  name: string;
  category: string;
  purchasePrice: number;
  wholesalePrice: number;
  retailPrice: number;
  stock: number;
  unit: string;
  imageUrl?: string;
}

interface ProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productToEdit?: Product | null;
  onSuccess: () => void;
}

const ProductDialog = ({ open, onOpenChange, productToEdit, onSuccess }: ProductDialogProps) => {
  const { register, handleSubmit, reset, setValue } = useForm<Product>();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (productToEdit) {
      setValue("name", productToEdit.name);
      setValue("category", productToEdit.category);
      setValue("purchasePrice", productToEdit.purchasePrice);
      setValue("wholesalePrice", productToEdit.wholesalePrice);
      setValue("retailPrice", productToEdit.retailPrice);
      setValue("stock", productToEdit.stock);
      setValue("unit", productToEdit.unit);
      setPreviewUrl(productToEdit.imageUrl || null);
      setImageFile(null);
    } else {
      reset();
      setPreviewUrl(null);
      setImageFile(null);
    }
  }, [productToEdit, setValue, reset, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const onSubmit = async (data: Product) => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("category", data.category);
      formData.append("purchasePrice", data.purchasePrice.toString());
      formData.append("wholesalePrice", data.wholesalePrice.toString());
      formData.append("retailPrice", data.retailPrice.toString());
      formData.append("stock", data.stock.toString());
      formData.append("unit", data.unit);
      
      if (imageFile) {
        formData.append("image", imageFile);
      }

      if (productToEdit?.id) {
        await fetchApi(`/api/products/${productToEdit.id}`, {
          method: 'PUT',
          body: formData,
        });
        toast({ title: "সফল", description: "পণ্য আপডেট করা হয়েছে", type: "success" });
      } else {
        await fetchApi('/api/products', {
          method: 'POST',
          body: formData,
        });
        toast({ title: "সফল", description: "নতুন পণ্য যোগ করা হয়েছে", type: "success" });
      }
      
      onSuccess();
      onOpenChange(false);
      reset();
      setImageFile(null);
      setPreviewUrl(null);
    } catch (error: any) {
      toast({ title: "ভুল হয়েছে", description: error.message || "পণ্য সংরক্ষণ করা সম্ভব হয়নি", type: "error" });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px] rounded-[2.5rem] border-none shadow-2xl bg-card/70 backdrop-blur-2xl p-0 overflow-hidden">
        <div className="bg-primary p-6 text-white flex justify-between items-center">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
              {productToEdit ? <Edit className="h-6 w-6 text-accent" /> : <Plus className="h-6 w-6 text-accent" />}
              {productToEdit ? "পণ্য এডিট করুন" : "নতুন পণ্য যোগ"}
            </DialogTitle>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          {/* Image Upload Area */}
          <div className="flex flex-col items-center justify-center">
             <Label htmlFor="image" className="cursor-pointer group relative">
                <div className="h-32 w-32 rounded-[2rem] bg-muted/50 border-2 border-dashed border-primary/20 flex items-center justify-center overflow-hidden transition-all group-hover:border-primary/50 group-hover:bg-primary/5 shadow-inner">
                  {previewUrl ? (
                    <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground group-hover:text-primary transition-colors">
                      <UploadCloud className="h-8 w-8 mb-1" />
                      <span className="text-[10px] font-black uppercase tracking-tighter">Upload Photo</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Edit className="h-6 w-6 text-white" />
                  </div>
                </div>
                <Input 
                  id="image" 
                  type="file" 
                  accept="image/*"
                  className="hidden" 
                  onChange={handleImageChange} 
                />
             </Label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Package className="h-3 w-3" /> নাম
              </Label>
              <Input id="name" placeholder="পণ্যের নাম দিন" className="h-12 rounded-2xl bg-background/50 border-primary/10 focus:ring-primary font-bold shadow-sm" {...register("name", { required: true })} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Tag className="h-3 w-3" /> ক্যাটাগরি
              </Label>
              <Select id="category" className="h-12 rounded-2xl bg-background/50 border-primary/10 focus:ring-primary font-bold shadow-sm" {...register("category", { required: true })}>
                <option value="Parts">পার্টস</option>
                <option value="Belt">বেল্ট</option>
                <option value="Mobil">মবিল</option>
                <option value="Other">অন্যান্য</option>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchasePrice" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-danger">
                <Banknote className="h-3 w-3" /> কেনা দাম
              </Label>
              <Input
                id="purchasePrice"
                type="number"
                placeholder="0.00"
                className="h-12 rounded-2xl bg-background/50 border-danger/10 focus:ring-danger font-bold shadow-sm"
                {...register("purchasePrice", { required: true, min: 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="wholesalePrice" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-primary">
                <Banknote className="h-3 w-3" /> পাইকারি দাম
              </Label>
              <Input
                id="wholesalePrice"
                type="number"
                placeholder="0.00"
                className="h-12 rounded-2xl bg-background/50 border-primary/10 focus:ring-primary font-bold shadow-sm"
                {...register("wholesalePrice", { required: true, min: 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="retailPrice" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 text-green-600">
                <Banknote className="h-3 w-3" /> খুচরা দাম
              </Label>
              <Input
                id="retailPrice"
                type="number"
                placeholder="0.00"
                className="h-12 rounded-2xl bg-background/50 border-green-500/10 focus:ring-green-500 font-bold shadow-sm"
                {...register("retailPrice", { required: true, min: 0 })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Warehouse className="h-3 w-3" /> মজুদ (স্টক)
              </Label>
              <Input
                id="stock"
                type="number"
                placeholder="0"
                className="h-12 rounded-2xl bg-background/50 border-primary/10 focus:ring-primary font-bold shadow-sm"
                {...register("stock", { required: true, min: 0 })}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="unit" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Boxes className="h-3 w-3" /> ইউনিট (Unit)
              </Label>
              <Select id="unit" className="h-12 rounded-2xl bg-background/50 border-primary/10 focus:ring-primary font-bold shadow-sm" {...register("unit", { required: true })}>
                <option value="Pcs">পিস (Pcs)</option>
                <option value="Litre">লিটার (Litre)</option>
                <option value="Kg">কেজি (Kg)</option>
                <option value="Set">সেট (Set)</option>
                <option value="Box">বক্স (Box)</option>
              </Select>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
              <Button type="submit" disabled={isUploading} className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-base shadow-xl hover:bg-primary/90 flex items-center justify-center gap-3 transition-all">
                {isUploading ? (
                  <div className="h-5 w-5 border-3 border-white border-t-transparent animate-spin rounded-full" />
                ) : (
                  <>
                    {productToEdit ? "আপডেট করুন" : "সংরক্ষণ করুন"}
                    <CheckCircle2 className="h-6 w-6 text-accent" />
                  </>
                )}
              </Button>
            </motion.div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
