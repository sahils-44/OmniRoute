import React from 'react';
import { useApp } from '../../context/AppContext';
import { Printer, Download, X, CheckCircle2, FileText, QrCode } from 'lucide-react';

export const InvoiceModal: React.FC = () => {
  const { activeInvoice, closeInvoice } = useApp();

  if (!activeInvoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const csvContent = [
      ['Item Name', 'Quantity', 'Unit Price', 'Total'],
      ...activeInvoice.items.map(i => [i.name, i.quantity, i.unitPrice, i.total]),
      ['Subtotal', '', '', activeInvoice.subtotal],
      ['CGST (2.5%)', '', '', activeInvoice.cgst],
      ['SGST (2.5%)', '', '', activeInvoice.sgst],
      ['Delivery Fee', '', '', activeInvoice.deliveryFee],
      ['Discount', '', '', -activeInvoice.discount],
      ['Grand Total', '', '', activeInvoice.grandTotal],
    ]
      .map(e => e.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${activeInvoice.invoiceNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-charcoal-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-charcoal-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header Action Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-charcoal-850 border-b border-white/10 no-print">
          <div className="flex items-center space-x-2 text-gold-400">
            <FileText className="w-5 h-5" />
            <span className="font-semibold text-white text-sm">Tax Invoice Preview</span>
            <span className="text-xs px-2 py-0.5 rounded bg-gold-500/20 text-gold-300 font-mono">
              {activeInvoice.invoiceNumber}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-gold-500 hover:bg-gold-600 text-charcoal-950 text-xs font-bold transition-all shadow-gold-glow"
              title="Print standard A4 invoice"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print A4</span>
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-charcoal-750 hover:bg-charcoal-700 text-slate-200 text-xs font-medium border border-white/10 transition-colors"
              title="Download CSV breakdown"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={closeInvoice}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-charcoal-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable A4 Tax Invoice Container */}
        <div id="printable-invoice" className="p-8 bg-white text-gray-900 font-sans">
          {/* Invoice Header */}
          <div className="flex items-start justify-between border-b pb-6 border-gray-200">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-black tracking-tight text-gray-900">
                  Omni<span className="text-amber-600">Route</span>™
                </span>
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded font-mono font-semibold">
                  OFFICIAL TAX INVOICE
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                OmniRoute Logistics Cloud Platform Pvt. Ltd.
              </p>
              <p className="text-xs text-gray-500 font-mono">
                CIN: U72900MH2024PTC392011 • GSTIN: 27AABCO4901K1ZV
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono uppercase text-gray-500">Invoice Number</div>
              <div className="text-sm font-bold font-mono text-gray-900">{activeInvoice.invoiceNumber}</div>
              <div className="text-xs text-gray-500 mt-1">Date: {activeInvoice.issueDate}</div>
              <div className="inline-flex items-center space-x-1 mt-1 px-2 py-0.5 rounded text-xs font-bold bg-green-100 text-green-800">
                <CheckCircle2 className="w-3 h-3 text-green-700" />
                <span>{activeInvoice.paymentStatus}</span>
              </div>
            </div>
          </div>

          {/* Billed To & Dispatched From */}
          <div className="grid grid-cols-2 gap-6 my-6 text-xs">
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Supplier / Merchant
              </span>
              <div className="font-bold text-sm text-gray-900">{activeInvoice.vendor.name}</div>
              <p className="text-gray-600 mt-1">{activeInvoice.vendor.address}</p>
              {activeInvoice.vendor.gstin && (
                <p className="text-gray-500 mt-1 font-mono">GSTIN: {activeInvoice.vendor.gstin}</p>
              )}
            </div>

            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
              <span className="font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Billed To (Customer)
              </span>
              <div className="font-bold text-sm text-gray-900">{activeInvoice.customer.name}</div>
              <p className="text-gray-600 mt-1">{activeInvoice.customer.phone}</p>
              <p className="text-gray-600 mt-0.5">{activeInvoice.customer.address}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <table className="w-full text-xs text-left border-collapse my-4">
            <thead>
              <tr className="border-b-2 border-gray-300 text-gray-600">
                <th className="py-2.5 font-bold">#</th>
                <th className="py-2.5 font-bold">Item Description</th>
                <th className="py-2.5 font-bold text-center">Qty</th>
                <th className="py-2.5 font-bold text-right">Unit Price</th>
                <th className="py-2.5 font-bold text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {activeInvoice.items.map((item, idx) => (
                <tr key={idx} className="text-gray-800">
                  <td className="py-2.5 text-gray-400 font-mono">{idx + 1}</td>
                  <td className="py-2.5 font-medium">{item.name}</td>
                  <td className="py-2.5 text-center font-mono">{item.quantity}</td>
                  <td className="py-2.5 text-right font-mono">₹{item.unitPrice.toFixed(2)}</td>
                  <td className="py-2.5 text-right font-mono font-semibold">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial Calculation Breakdown */}
          <div className="flex justify-between items-start border-t-2 border-gray-200 pt-4 mt-4 text-xs">
            <div className="max-w-xs text-gray-500">
              <div className="flex items-center space-x-2 text-gray-700">
                <QrCode className="w-8 h-8 text-gray-800" />
                <div>
                  <div className="font-semibold text-[10px] uppercase">Payment Mode: {activeInvoice.paymentMethod}</div>
                  <div className="text-[10px] text-gray-500 font-mono">Order Ref: {activeInvoice.orderNumber}</div>
                </div>
              </div>
              <p className="mt-3 text-[10px] italic">
                This is a computer-generated tax invoice. No physical signature required.
              </p>
            </div>

            <div className="w-56 space-y-1.5 text-right font-mono">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>₹{activeInvoice.subtotal.toFixed(2)}</span>
              </div>
              {activeInvoice.cgst > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>CGST (2.5%):</span>
                  <span>₹{activeInvoice.cgst.toFixed(2)}</span>
                </div>
              )}
              {activeInvoice.sgst > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>SGST (2.5%):</span>
                  <span>₹{activeInvoice.sgst.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery Charge:</span>
                <span>₹{activeInvoice.deliveryFee.toFixed(2)}</span>
              </div>
              {activeInvoice.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Coupon Discount:</span>
                  <span>-₹{activeInvoice.discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-2 mt-2">
                <span>Grand Total:</span>
                <span>₹{activeInvoice.grandTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-charcoal-850 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 no-print">
          <span>Official Invoice • Ready for download & print</span>
          <button
            onClick={closeInvoice}
            className="px-4 py-1.5 rounded-lg bg-charcoal-750 hover:bg-charcoal-700 text-slate-200 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
