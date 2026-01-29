'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, Quotation } from '@/lib/api';

export default function CompanyQuotationsPage() {
    const [quotations, setQuotations] = useState<(Quotation & { rfq: { title: string, status: string } })[]>([]);
    const [loading, setLoading] = useState(true);

    const handleWithdraw = async (id: number) => {
        if (!confirm('Are you sure you want to withdraw this quotation?')) return;
        try {
            await api.withdrawQuotation(id);
            setQuotations(prev => prev.map(q => q.id === id ? { ...q, status: 'WITHDRAWN' as any } : q));
        } catch (e) {
            alert('Failed to withdraw quotation');
        }
    };

    useEffect(() => {
        api.getCompanyQuotations()
            .then(data => setQuotations(data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-10 text-center animate-pulse">Loading quotations...</div>;

    return (
        <div className="max-w-5xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <h1 className="text-3xl font-bold mb-8 text-foreground/90 tracking-tight">My Quotations</h1>

            <div className="grid gap-6">
                {quotations.length === 0 ? (
                    <div className="text-center py-20 bg-secondary/20 rounded-2xl border border-border/50">
                        <p className="text-muted-foreground text-lg">You haven't submitted any quotations yet.</p>
                        <Link href="/company/dashboard" className="text-primary hover:underline mt-2 inline-block font-medium">
                            Browse Requests &rarr;
                        </Link>
                    </div>
                ) : (
                    quotations.map(quote => (
                        <div key={quote.id} className="glass-card p-6 rounded-xl border border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                            <div className="flex flex-col md:flex-row justify-between gap-4">
                                <div>
                                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                                        Quote #{quote.id}
                                    </div>
                                    <h3 className="text-xl font-bold mb-1">
                                        {quote.rfq?.title || `Request #${quote.rfq_id}`}
                                    </h3>
                                    <div className="flex items-center gap-3 mt-2">
                                        <div className={`px-2.5 py-0.5 rounded-full text-xs font-semibold
                                            ${quote.status === 'ACCEPTED' ? 'bg-green-100/10 text-green-500 border border-green-500/20' :
                                                quote.status === 'REJECTED' ? 'bg-red-100/10 text-red-500 border border-red-500/20' :
                                                    quote.status === 'WITHDRAWN' ? 'bg-gray-100/10 text-gray-500 border border-gray-500/20' :
                                                        'bg-yellow-100/10 text-yellow-500 border border-yellow-500/20'}`}>
                                            {quote.status}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            Needed By: {new Date(quote.valid_until).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <div className="text-2xl font-bold text-primary">
                                        ${Number(quote.total_price).toLocaleString()}
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                        ${quote.price_per_unit} / unit
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        + ${quote.delivery_cost ?? 0} Delivery
                                    </div>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-border/40 flex justify-between items-center">
                                <div className="text-sm text-muted-foreground">
                                    <span className="font-semibold">Terms:</span> {quote.payment_terms || 'Standard'}
                                </div>
                                <div className="flex gap-3 items-center">
                                    {quote.status === 'PENDING' && (
                                        <button
                                            onClick={() => handleWithdraw(quote.id)}
                                            className="text-sm font-semibold text-red-500 hover:text-red-600 transition-colors"
                                        >
                                            Withdraw
                                        </button>
                                    )}
                                    <Link
                                        href={`/company/requests/${quote.rfq_id}`}
                                        className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
                                    >
                                        View Request &rarr;
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
