import { useEffect, useState } from "react";
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
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (productToEdit) {
      setValue("name", productToEdit.name);
      setValue("category", productToEdit.category);
      setValue("purchasePrice", productToEdit.purchasePrice);
      setValue("wholesalePrice", productToEdit.wholesalePrice);
      setValue("retailPrice", productToEdit.retailPrice);
      setValue("stock", productToEdit.stock);
      setValue("unit", productToEdit.unit);
      setImageFile(null);
    } else {
      reset();
      setImageFile(null);
    }
  }, [productToEdit, setValue, reset, open]);

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
      } else {
        await fetchApi('/api/products', {
          method: 'POST',
          body: formData,
        });
      }
      
      onSuccess();
      onOpenChange(false);
      reset();
      setImageFile(null);
    } catch (error) {
      console.error("Error saving product:", error);
      alert("পণ্য সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{productToEdit ? "পণ্য এডিট করুন" : "নতুন পণ্য যোগ করুন"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="image" className="text-right">
              ছবি
            </Label>
            <Input 
              id="image" 
              type="file" 
              accept="image/*"
              className="col-span-3" 
              onChange={(e) => setImageFile(e.target.files?.[0] || null)} 
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              নাম
            </Label>
            <Input id="name" className="col-span-3" {...register("name", { required: true })} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              ক্যাটাগরি
            </Label>
            <Select id="category" className="col-span-3" {...register("category", { required: true })}>
              <option value="Parts">পার্টস</option>
              <option value="Belt">বেল্ট</option>
              <option value="Mobil">মবিল</option>
              <option value="Other">অন্যান্য</option>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="purchasePrice" className="text-right">
              কেনা দাম
            </Label>
            <Input
              id="purchasePrice"
              type="number"
              className="col-span-3"
              {...register("purchasePrice", { required: true, min: 0 })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="wholesalePrice" className="text-right">
              পাইকারি দাম
            </Label>
            <Input
              id="wholesalePrice"
              type="number"
              className="col-span-3"
              {...register("wholesalePrice", { required: true, min: 0 })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="retailPrice" className="text-right">
              খুচরা দাম
            </Label>
            <Input
              id="retailPrice"
              type="number"
              className="col-span-3"
              {...register("retailPrice", { required: true, min: 0 })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="stock" className="text-right">
              স্টক
            </Label>
            <Input
              id="stock"
              type="number"
              className="col-span-3"
              {...register("stock", { required: true, min: 0 })}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              ইউনিট
            </Label>
            <Select id="unit" className="col-span-3" {...register("unit", { required: true })}>
              <option value="Pcs">পিস</option>
              <option value="Litre">লিটার</option>
              <option value="Kg">কেজি</option>
              <option value="Set">সেট</option>
              <option value="Box">বক্স</option>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isUploading}>
              {isUploading ? "সংরক্ষণ হচ্ছে..." : "সংরক্ষণ করুন"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;
