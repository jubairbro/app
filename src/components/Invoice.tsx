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
    <div ref={ref} data-invoice-container="true" className="p-6 bg-white text-black mx-auto border-2 border-black shadow-none print:m-0 w-[600px] min-w-[600px] overflow-hidden" 
         style={{ 
           fontFamily: "'Noto Sans Bengali', 'Hind Siliguri', sans-serif",
           minHeight: '8.27in', // A5 height approximately in proportion
         }}>
      {/* Header Section */}
      <div className="text-center border-b-2 border-black pb-3 mb-6">
        <h1 className="text-4xl font-extrabold mb-1" style={{ color: '#000' }}>মেসার্স সৈকত মেশিনারি</h1>
        <p className="text-md font-bold">প্রোঃ মোঃ বজলুর রশিদ (ভুট্টু)</p>
        <div className="text-xs font-bold mt-1">
          রানীর হাট, তারাশ, সিরাজগঞ্জ । মোবাইল: 01740556280
        </div>
      </div>

      {/* Invoice Details */}
      <div className="flex justify-between items-start mb-6 text-sm">
        <div className="space-y-1">
          <p><strong>নাম:</strong> {sale.customerName}</p>
          <p><strong>মোবাইল:</strong> {sale.customerPhone}</p>
          <p><strong>ঠিকানা:</strong> {sale.customerAddress || "N/A"}</p>
        </div>
        <div className="text-right space-y-1">
          <p className="border border-black px-2 py-0.5 inline-block font-bold">মেমো নং: {sale.id}</p>
          <p><strong>তারিখ:</strong> {sale.createdAt ? formatDate(new Date(sale.createdAt)) : formatDate(new Date())}</p>
        </div>
      </div>

      {/* Product Table */}
      <table className="w-full text-sm border-collapse border border-black mb-6">
        <thead>
          <tr className="bg-gray-100">
            <th className="border border-black px-2 py-2 text-center w-10">নং</th>
            <th className="border border-black px-2 py-2 text-left">বিবরণ</th>
            <th className="border border-black px-2 py-2 text-center w-16">পরিমাণ</th>
            <th className="border border-black px-2 py-2 text-right w-20">দর</th>
            <th className="border border-black px-2 py-2 text-right w-24">মোট টাকা</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item, index) => (
            <tr key={index}>
              <td className="border border-black px-2 py-1.5 text-center">{index + 1}</td>
              <td className="border border-black px-2 py-1.5 font-bold">{item.name}</td>
              <td className="border border-black px-2 py-1.5 text-center">{item.quantity} {item.unit}</td>
              <td className="border border-black px-2 py-1.5 text-right">{item.salePrice.toLocaleString()}</td>
              <td className="border border-black px-2 py-1.5 text-right font-bold">{(item.salePrice * item.quantity).toLocaleString()}</td>
            </tr>
          ))}
          {/* Fill empty rows */}
          {[...Array(Math.max(0, 10 - sale.items.length))].map((_, i) => (
            <tr key={`empty-${i}`} className="h-8">
              <td className="border border-black px-2 py-1.5"></td>
              <td className="border border-black px-2 py-1.5"></td>
              <td className="border border-black px-2 py-1.5"></td>
              <td className="border border-black px-2 py-1.5"></td>
              <td className="border border-black px-2 py-1.5"></td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary Section */}
      <div className="flex justify-between items-start">
        <div className="w-1/2 mt-4">
          <div className="mt-16 flex gap-10">
            <div className="border-t border-black pt-1 text-xs font-bold w-24 text-center">গ্রহীতার স্বাক্ষর</div>
            <div className="border-t border-black pt-1 text-xs font-bold w-24 text-center">বিক্রেতার স্বাক্ষর</div>
          </div>
        </div>
        
        <div className="w-48 text-sm">
          <div className="flex justify-between py-1 border-b border-black">
            <span>মোট বিল:</span>
            <span className="font-bold">{sale.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-black">
            <span>ডিসকাউন্ট:</span>
            <span className="font-bold">(-) {sale.discount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-black bg-gray-50">
            <span>নিট বিল:</span>
            <span className="font-bold">{sale.finalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-black">
            <span>জমা:</span>
            <span className="font-bold">{sale.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 font-bold">
            <span>বাকি:</span>
            <span className="text-red-600">{sale.dueAmount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-10 text-center text-[10px] font-bold border-t border-black pt-2 italic">
        * আপনার সন্তুষ্টিই আমাদের কাম্য। আমাদের সেবায় সন্তুষ্ট থাকলে অন্যদের বলুন। ধন্যবাদ, পুনরায় আসার আমন্ত্রণ রইল। *
      </div>
    </div>
  );
});

Invoice.displayName = "Invoice";
