import React from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SaleItem {
  productId: string;
  name: string;
  quantity: number;
  salePrice: number;
  priceType: "retail" | "wholesale";
  unit: string;
}

interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  items: SaleItem[];
  totalAmount: number;
  discount: number;
  finalAmount: number;
  paidAmount: number;
  dueAmount: number;
  createdAt: any;
}

interface InvoiceProps {
  sale: Sale;
}

export const Invoice = React.forwardRef<HTMLDivElement, InvoiceProps>(({ sale }, ref) => {
  return (
    <div ref={ref} className="p-8 bg-white text-black font-sans max-w-3xl mx-auto border shadow-sm print:shadow-none print:border-none">
      {/* Header */}
      <div className="text-center border-b-2 border-primary pb-6 mb-6">
        <h1 className="text-4xl font-black uppercase tracking-tighter text-primary">মেসার্স সৈকত মেশিনারি</h1>
        <p className="text-sm font-bold mt-1 text-gray-700 uppercase tracking-widest">প্রোঃ মোঃ বজলুর রশিদ (ভুট্ট)</p>
        <div className="flex justify-center gap-4 text-xs font-medium text-gray-500 mt-2 uppercase">
          <span>রানীর হাট, তারাশ, সিরাজগঞ্জ</span>
          <span className="opacity-30">|</span>
          <span>মোবাইল: 01700000000</span>
        </div>
      </div>

      {/* Customer & Invoice Info */}
      <div className="flex justify-between mb-6 text-sm">
        <div>
          <p><span className="font-bold">নাম:</span> {sale.customerName}</p>
          <p><span className="font-bold">মোবাইল:</span> {sale.customerPhone}</p>
          <p><span className="font-bold">ঠিকানা:</span> {sale.customerAddress || "N/A"}</p>
        </div>
        <div className="text-right">
          <p><span className="font-bold">মেমো নং:</span> {sale.id.toString().padStart(6, '0')}</p>
          <p><span className="font-bold">তারিখ:</span> {sale.createdAt ? formatDate(new Date(sale.createdAt)) : formatDate(new Date())}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full text-sm border-collapse border border-gray-300 mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-gray-300 px-2 py-1 text-left">বিবরণ</th>
            <th className="border border-gray-300 px-2 py-1 text-center">পরিমাণ</th>
            <th className="border border-gray-300 px-2 py-1 text-right">দর</th>
            <th className="border border-gray-300 px-2 py-1 text-right">মোট</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-gray-300 px-2 py-1">{item.name} <span className="text-xs text-gray-500">({item.priceType === 'wholesale' ? 'পাইকারি' : 'খুচরা'})</span></td>
              <td className="border border-gray-300 px-2 py-1 text-center">{item.quantity} {item.unit}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(item.salePrice)}</td>
              <td className="border border-gray-300 px-2 py-1 text-right">{formatCurrency(item.salePrice * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-8">
        <div className="w-48 text-sm">
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span>মোট:</span>
            <span className="font-medium">{formatCurrency(sale.totalAmount)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200 text-red-600">
            <span>ডিসকাউন্ট:</span>
            <span>- {formatCurrency(sale.discount)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200 font-bold text-lg">
            <span>নিট বিল:</span>
            <span>{formatCurrency(sale.finalAmount)}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-gray-200">
            <span>জমা:</span>
            <span>{formatCurrency(sale.paidAmount)}</span>
          </div>
          <div className="flex justify-between py-1 font-bold text-red-600">
            <span>বাকি:</span>
            <span>{formatCurrency(sale.dueAmount)}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-300 flex justify-between text-xs text-gray-500">
        <div>
          <p>ক্রেতার স্বাক্ষর</p>
        </div>
        <div className="text-right">
          <p>বিক্রেতার স্বাক্ষর</p>
        </div>
      </div>
      <div className="text-center text-[10px] text-gray-400 mt-4">
        Developed by AI Studio • Printed on {formatDate(new Date())}
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";
