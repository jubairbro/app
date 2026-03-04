import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

type ToastType = "success" | "error" | "info" | "warning"

interface Toast {
  id: string
  title?: string
  description?: string
  type?: ToastType
}

interface ToastContextType {
  toast: (props: Omit<Toast, "id">) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<Toast[]>([])

  const toast = React.useCallback(({ title, description, type = "info" }: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substr(2, 9)
    setToasts((prev) => [...prev, { id, title, description, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }, [])

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-0 right-0 z-[100] flex flex-col p-4 gap-2 w-full max-w-[400px]">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20, scale: 0.9, x: 20 }}
              animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: 20 }}
              className={cn(
                "relative flex w-full items-center gap-4 overflow-hidden rounded-[1.5rem] p-4 shadow-2xl backdrop-blur-xl border border-white/20",
                t.type === "success" && "bg-green-500/90 text-white",
                t.type === "error" && "bg-red-500/90 text-white",
                t.type === "warning" && "bg-amber-500/90 text-white",
                t.type === "info" && "bg-primary/90 text-white"
              )}
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20">
                {t.type === "success" && <CheckCircle2 className="h-6 w-6" />}
                {t.type === "error" && <AlertCircle className="h-6 w-6" />}
                {t.type === "warning" && <AlertTriangle className="h-6 w-6" />}
                {t.type === "info" && <Info className="h-6 w-6" />}
              </div>
              <div className="flex-1">
                {t.title && <div className="text-sm font-black uppercase tracking-widest">{t.title}</div>}
                {t.description && <div className="text-xs font-bold opacity-90">{t.description}</div>}
              </div>
              <button
                onClick={() => setToasts((prev) => prev.filter((toast) => toast.id !== t.id))}
                className="close-button !bg-white/10 !text-white hover:!bg-white/20"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}
