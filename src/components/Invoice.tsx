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
    <div ref={ref} className="p-10 bg-white text-black font-sans max-w-[800px] mx-auto border-2 border-primary/20 shadow-none print:m-0 print:p-8" style={{ minHeight: '11in' }}>
      {/* Header Section */}
      <div className="text-center border-b-4 border-double border-primary pb-4 mb-8">
        <h1 className="text-5xl font-black text-primary mb-2" style={{ fontFamily: 'SutonnyMJ, Arial, sans-serif' }}>মেসার্স সৈকত মেশিনারি</h1>
        <p className="text-lg font-bold text-gray-800">প্রোঃ মোঃ বজলুর রশিদ (ভুট্টু)</p>
        <div className="flex justify-center gap-6 text-sm font-bold text-gray-600 mt-2">
          <span>রানীর হাট, তারাশ, সিরাজগঞ্জ</span>
          <span className="text-primary">●</span>
          <span>মোবাইল: 01737-975525, 01303-912781</span>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="flex justify-between items-start mb-8 text-base">
        <div className="space-y-1">
          <p><span className="font-black border-b border-dotted">নাম:</span> <span className="ml-2 font-bold">{sale.customerName}</span></p>
          <p><span className="font-black border-b border-dotted">মোবাইল:</span> <span className="ml-2">{sale.customerPhone}</span></p>
          <p><span className="font-black border-b border-dotted">ঠিকানা:</span> <span className="ml-2">{sale.customerAddress || "N/A"}</span></p>
        </div>
        <div className="text-right space-y-1">
          <p className="bg-gray-100 px-3 py-1 rounded-lg inline-block font-black border border-gray-300">ভাউচার নং: {sale.id}</p>
          <p className="font-bold">তারিখ: {sale.createdAt ? formatDate(new Date(sale.createdAt)) : formatDate(new Date())}</p>
        </div>
      </div>

      {/* Product Table */}
      <table className="w-full text-base border-collapse border-2 border-black mb-8">
        <thead>
          <tr className="bg-primary/5 text-primary">
            <th className="border-2 border-black px-4 py-3 text-center w-12 font-black">নং</th>
            <th className="border-2 border-black px-4 py-3 text-left font-black">মালের বিবরণ</th>
            <th className="border-2 border-black px-4 py-3 text-center w-24 font-black">পরিমাণ</th>
            <th className="border-2 border-black px-4 py-3 text-right w-28 font-black">দর (৳)</th>
            <th className="border-2 border-black px-4 py-3 text-right w-32 font-black">মোট (৳)</th>
          </tr>
        </thead>
        <tbody style={{ minHeight: '400px' }}>
          {sale.items.map((item, index) => (
            <tr key={index} className="hover:bg-gray-50">
              <td className="border-2 border-black px-4 py-2 text-center font-bold">{index + 1}</td>
              <td className="border-2 border-black px-4 py-2 font-bold">{item.name} <span className="text-xs text-gray-500">({item.unit})</span></td>
              <td className="border-2 border-black px-4 py-2 text-center">{item.quantity}</td>
              <td className="border-2 border-black px-4 py-2 text-right">{item.salePrice.toLocaleString()}</td>
              <td className="border-2 border-black px-4 py-2 text-right font-bold">{(item.salePrice * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
          {/* Fill empty rows to maintain height if needed */}
          {[...Array(Math.max(0, 8 - sale.items.length))].map((_, i) => (
            <tr key={`empty-${i}`} className="h-10">
              <td className="border-2 border-black px-4 py-2"></td>
              <td className="border-2 border-black px-4 py-2"></td>
              <td className="border-2 border-black px-4 py-2"></td>
              <td className="border-2 border-black px-4 py-2"></td>
              <td className="border-2 border-black px-4 py-2"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="flex justify-between items-start">
        <div className="w-1/2">
          <p className="italic text-sm font-bold text-gray-500">কথায়: ................................................................................</p>
          <div className="mt-16 flex gap-20">
            <div className="border-t-2 border-black pt-1 px-4 text-sm font-black text-center">গ্রহীতার স্বাক্ষর</div>
            <div className="border-t-2 border-black pt-1 px-4 text-sm font-black text-center">বিক্রেতার স্বাক্ষর</div>
          </div>
        </div>
        
        <div className="w-64">
          <div className="flex justify-between py-2 border-b-2 border-black font-bold">
            <span>মোট বিল:</span>
            <span>৳ {sale.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-black text-red-600 font-bold">
            <span>ডিসকাউন্ট:</span>
            <span>- ৳ {sale.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-black bg-gray-100 font-black text-xl">
            <span>নিট বিল:</span>
            <span>৳ {sale.finalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 border-b-2 border-black font-bold text-green-700">
            <span>জমা:</span>
            <span>৳ {sale.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-2 font-black text-red-600 text-lg">
            <span>বাকি:</span>
            <span>৳ {sale.dueAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-12 text-center text-xs font-bold text-gray-400 border-t pt-4">
        বিঃ দ্রঃ- বিক্রিত মাল ফেরত নেওয়া হয় না। আমাদের এখানে যাবতীয় পার্টস ও মবিল পাইকারি ও খুচরা বিক্রয় করা হয়।
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";
