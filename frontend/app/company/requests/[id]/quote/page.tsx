'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { api, RFQ } from "@/lib/api";

export default function SubmitQuotationPage() {
  const router = useRouter();
  // @ts-ignore
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [rfq, setRfq] = useState<RFQ | null>(null);

  const [formData, setFormData] = useState({
    pricePerUnit: '',
    deliveryDays: '',
    validUntil: '',
    notes: ''
  });

  useEffect(() => {
    if (id) {
      api.getRequestById(Number(id)).then(setRfq).catch(console.error);
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const price = parseFloat(formData.pricePerUnit);
      const quantity = parseFloat(rfq?.quantity || '0');
      // Quantity might be "500 units", so parsing might fail if not clean number.
      // For now, let's assume quantity is numeric or just calculate simple total.
      // Backend rules say total_price is required.

      // Clean parsing
      const qtyNum = parseFloat(rfq?.quantity.replace(/[^0-9.]/g, '') || '0');
      const totalPrice = price * (qtyNum || 1);

      await api.submitQuotation({
        rfqId: Number(id),
        pricePerUnit: price,
        totalPrice: totalPrice,
        deliveryDays: parseInt(formData.deliveryDays),
        validUntil: formData.validUntil,
        notes: formData.notes
      });

      alert("Quotation submitted successfully!");
      router.push('/company/dashboard');
    } catch (e: any) {
      console.error(e);
      alert(`Failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!rfq) return <div className="p-8">Loading Request Details...</div>;

  return (
    <div className="max-w-lg mx-auto p-4">
      <h1 className="text-xl font-semibold mb-4">Submit Quotation</h1>
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <h2 className="font-bold text-lg">{rfq.title}</h2>
        <p className="text-sm text-gray-600">Quantity: {rfq.quantity}</p>
        <p className="text-sm text-gray-600">Needed by: {rfq.delivery_date}</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white border rounded-lg p-6 space-y-4 shadow-sm">
        <div>
          <label className="block text-sm font-medium mb-1">Price per unit</label>
          <input
            type="number"
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={formData.pricePerUnit}
            onChange={e => setFormData({ ...formData, pricePerUnit: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Delivery time (days)</label>
          <input
            type="number"
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={formData.deliveryDays}
            onChange={e => setFormData({ ...formData, deliveryDays: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Valid Until</label>
          <input
            type="date"
            required
            className="w-full border rounded-md px-3 py-2 text-sm"
            value={formData.validUntil}
            onChange={e => setFormData({ ...formData, validUntil: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes / Payment Terms</label>
          <textarea
            required
            className="w-full border rounded-md px-3 py-2 text-sm min-h-[100px]"
            value={formData.notes}
            onChange={e => setFormData({ ...formData, notes: e.target.value })}
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Quotation"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="w-full mt-2 text-gray-500 text-sm hover:underline"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
