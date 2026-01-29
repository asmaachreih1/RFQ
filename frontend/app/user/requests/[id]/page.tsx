'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import QuotationCard from '@/app/QuotationCard';
import { api, RFQ, Quotation } from '@/lib/api';

export default function RequestDetailsPage() {
  const { id } = useParams();
  const [request, setRequest] = useState<RFQ | null>(null);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (id) {
        // mock fetching
        const reqData = await api.getRequestById(Number(id));
        setRequest(reqData || null);

        if (reqData) {
          const quotes = await api.getQuotations(reqData.id);
          setQuotations(quotes);
        }
      }
      setLoading(false);
    }
    load();
  }, [id]);

  const handleAccept = async (quoteId: number) => {
    if (!request) return;
    try {
      await api.acceptQuotation(quoteId, request.id);
      // Refresh state
      const updatedReq = await api.getRequestById(request.id);
      const updatedQuotes = await api.getQuotations(request.id);
      if (updatedReq) setRequest(updatedReq);
      setQuotations(updatedQuotes);
    } catch (e) {
      alert('Failed to accept quotation');
    }
  };

  const handleReject = async (quoteId: number) => {
    if (!request) return;
    try {
      await api.rejectQuotation(quoteId);
      // Refresh state
      const updatedQuotes = await api.getQuotations(request.id);
      setQuotations(updatedQuotes);
    } catch (e) {
      alert('Failed to reject quotation');
    }
  };

  /**
   * ✅ SMART SORTING
   * 1. Lowest total price first
   * 2. If tie → faster delivery
   */
  const sortedQuotations = useMemo(() => {
    return [...quotations].sort((a, b) => {
      if (a.total_price !== b.total_price) {
        return a.total_price - b.total_price;
      }
      return a.delivery_days - b.delivery_days;
    });
  }, [quotations]);

  const bestOfferId =
    request?.status === 'OPEN'
      ? sortedQuotations[0]?.id
      : null;

  if (loading) return <div className="py-20 text-center text-muted-foreground animate-pulse">Loading details...</div>;
  if (!request) return <div className="py-20 text-center text-red-500">Request not found</div>;

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-10">
      {/* Request header */}
      <div className="glass-card p-8 rounded-2xl border border-border/50">
        <div className="flex justify-between items-start mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold">{request.title}</h1>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border ${request.status === 'OPEN' ? 'bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800' :
                request.status === 'AWARDED' ? 'bg-blue-100/50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800' :
                  'bg-gray-100 text-gray-700 border-gray-200'
                }`}>
                {request.status}
              </span>
            </div>
            <p className="text-muted-foreground">{request.description}</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            Posted on {new Date(request.created_at * 1000).toLocaleDateString()}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-6 bg-secondary/30 rounded-xl border border-border/50">
          <div>
            <span className="block text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Category</span>
            <span className="font-semibold">{request.category || 'N/A'}</span>
          </div>
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
        </div>

        {request.status === 'AWARDED' && (
          <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 flex items-center gap-3">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            This request has been awarded to a supplier.
          </div>
        )}
      </div>

      {/* Actions */}
      {request.status === 'OPEN' && (
        <div className="flex justify-end gap-3">
          <Link
            href={`/user/requests/${request.id}/edit`}
            className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            Edit Request
          </Link>
          <button
            onClick={async () => {
              if (!confirm('Are you sure you want to cancel this request?')) return;
              try {
                await api.cancelRequest(request.id);
                alert('Request cancelled successfully');
                // Redirect to dashboard
                window.location.href = '/user/dashboard';
              } catch (e) {
                alert('Failed to cancel request');
              }
            }}
            className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
          >
            Cancel Request
          </button>
        </div>
      )}

      {/* Quotations */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          Received Quotations
          <span className="text-sm font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
            {quotations.length}
          </span>
        </h2>

        {quotations.length === 0 ? (
          <div className="py-12 text-center border-2 border-dashed border-border rounded-xl bg-muted/30">
            <p className="text-muted-foreground">No quotations received yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedQuotations.map((quote) => (
              <QuotationCard
                key={quote.id}
                companyName={quote.companyName || 'Supplier'}
                pricePerUnit={quote.price_per_unit}
                totalPrice={quote.total_price}
                deliveryDays={quote.delivery_days}
                validUntil={quote.valid_until}
                status={quote.status}
                requestStatus={request.status}
                isBestOffer={quote.id === bestOfferId}
                onAccept={() => handleAccept(quote.id)}
                onReject={() => handleReject(quote.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
