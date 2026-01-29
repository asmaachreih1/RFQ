'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, RFQ } from '@/lib/api';

export default function CompanyRequestDetailsPage() {
  const { id } = useParams();
  const router = useRouter();

  const [request, setRequest] = useState<RFQ | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    pricePerUnit: '',
    deliveryDays: '',
    validUntil: '',
    deliveryCost: '',
    paymentTerms: '',
    notes: '',
  });

  useEffect(() => {
    async function load() {
      if (id) {
        const data = await api.getRequestById(Number(id));
        setRequest(data || null);
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!request) return;

    setSubmitting(true);
    try {
      await api.submitQuotation({
        rfqId: request.id,
        pricePerUnit: Number(formData.pricePerUnit),
        totalPrice: Number(formData.pricePerUnit) * Number(request.quantity.split(' ')[0] || 1), // Estimate total based on naive quantity parse for now, logic can be improved
        deliveryDays: Number(formData.deliveryDays),
        deliveryCost: Number(formData.deliveryCost),
        paymentTerms: formData.paymentTerms,
        validUntil: formData.validUntil,
        notes: formData.notes
      });
      alert('Quotation submitted successfully!');
      router.push('/company/dashboard');
    } catch (e) {
      alert('Failed to submit quotation');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse">Loading details...</div>;
  if (!request) return <div className="py-20 text-center text-red-500">Request not found</div>;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 animate-in fade-in duration-500">
      {/* RFQ Summary */}
      <div className="glass-card p-8 rounded-2xl border border-border/50">
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-4 mb-6">
          <div>
            <span className="text-xs font-bold text-primary uppercase tracking-wider">{request.category}</span>
            <h1 className="text-3xl font-bold mt-1">{request.title}</h1>
          </div>
          <div className={`self-start px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${request.status === 'OPEN' ? 'bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
            'bg-gray-100 text-gray-700 border-gray-200'
            }`}>
            {request.status}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-secondary/30 rounded-xl border border-border/50 mb-6">
          <div>
            <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Quantity</span>
            <span className="font-semibold">{request.quantity}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Needed By</span>
            <span className="font-semibold">{new Date(request.delivery_date).toLocaleDateString()}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Expires On</span>
            <span className="font-semibold">{request.expiration_date ? new Date(request.expiration_date).toLocaleDateString() : 'N/A'}</span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Budget</span>
            <span className="font-semibold">
              {request.budget_min || request.budget_max
                ? `${request.budget_min || 0} - ${request.budget_max || '∞'}`
                : 'Not specified'}
            </span>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Destination</span>
            <div className="flex flex-col">
              <span className="font-semibold">{request.city}</span>
              {request.latitude && request.longitude && (
                <a
                  href={`https://www.google.com/maps?q=${request.latitude},${request.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline flex items-center gap-1 mt-0.5"
                >
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  View on Map
                </a>
              )}
            </div>
          </div>
          <div>
            <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Posted</span>
            <span className="font-semibold">{new Date(request.created_at * 1000).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Description</h3>
          <p className="text-muted-foreground leading-relaxed">{request.description}</p>
        </div>
      </div>

      {/* Submit quotation */}
      {request.status === 'OPEN' ? (
        <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl border border-border/50 space-y-6">
          <h2 className="text-2xl font-bold">Submit Quotation</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Price Per Unit</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.pricePerUnit}
                  onChange={(e) => setFormData({ ...formData, pricePerUnit: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Est. Delivery Days</label>
              <input
                type="number"
                required
                min="1"
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.deliveryDays}
                onChange={(e) => setFormData({ ...formData, deliveryDays: e.target.value })}
                placeholder="e.g. 7"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5">Quote Valid Until</label>
              <input
                type="date"
                required
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1.5">Delivery Cost (Optional)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                  value={formData.deliveryCost}
                  onChange={(e) => setFormData({ ...formData, deliveryCost: e.target.value })}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5">Payment Terms</label>
              <input
                type="text"
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                value={formData.paymentTerms}
                onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                placeholder="e.g. 50% upfront, 50% on delivery"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1.5">Additional Notes</label>
            <textarea
              rows={3}
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any conditions, warranty info, etc."
            />
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="min-w-[150px] py-3 px-6 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Quotation'}
            </button>
          </div>
        </form>
      ) : (
        <div className="p-6 rounded-xl bg-muted/50 border border-border text-center text-muted-foreground">
          This request is no longer accepting quotations.
        </div>
      )}
    </div>
  );
}
