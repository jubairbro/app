import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
  isLoading?: boolean;
}

const ConfirmDialog = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "নিশ্চিত করুন",
  cancelText = "বাতিল",
  variant = "destructive",
  isLoading = false,
}: ConfirmDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px] rounded-[2rem] border-none shadow-2xl p-0 overflow-hidden bg-card/80 backdrop-blur-2xl">
        <div className={variant === "destructive" ? "bg-danger p-6 text-white" : "bg-primary p-6 text-white"}>
          <DialogHeader>
            <DialogTitle className="text-xl font-black tracking-tight flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              {title}
            </DialogTitle>
          </DialogHeader>
        </div>
        
        <div className="p-8">
          <DialogDescription className="text-base font-medium text-foreground leading-relaxed">
            {description}
          </DialogDescription>
        </div>

        <DialogFooter className="p-8 pt-0 flex gap-3">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="flex-1 rounded-xl font-black text-xs uppercase tracking-widest h-12"
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex-1">
            <Button
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={onConfirm}
              className="w-full rounded-xl font-black text-xs uppercase tracking-widest h-12 shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? "অপেক্ষা করুন..." : confirmText}
            </Button>
          </motion.div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ConfirmDialog;
