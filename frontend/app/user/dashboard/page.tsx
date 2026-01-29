'use client';

import Link from 'next/link';
import { api, RFQ } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useApp } from '../../Providers';
import StatCard from '@/app/components/StatCard';
import SubscriptionPill from '@/app/components/SubscriptionPill';

export default function UserDashboardPage() {
  const { user } = useApp();
  const [requests, setRequests] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);

  // Subscription state
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [subscriptions, setSubscriptions] = useState<number[]>([]);



  useEffect(() => {
    async function load() {
      if (user) {
        try {
          const [reqs, cats, subs] = await Promise.all([
            api.getRequests('user'),
            api.getCategories(),
            api.getSubscriptions()
          ]);
          setRequests(reqs);
          setCategories(cats);
          setSubscriptions(subs.map((s: any) => s.category_id));
        } catch (e) {
          console.error(e);
        }
      }
      setLoading(false);
    }
    load();
  }, [user]);

  // Handlers
  const handleSelectAll = async () => {
    const isAllSelected = subscriptions.length === categories.length;
    const targetIds = isAllSelected
      ? categories.map(c => c.id) // Deselect all
      : categories.filter(c => !subscriptions.includes(c.id)).map(c => c.id); // Select unselected

    // Optimistic Update
    if (isAllSelected) {
      setSubscriptions([]);
    } else {
      setSubscriptions(categories.map(c => c.id));
    }

    try {
      // Sync with backend (toggle each target)
      await Promise.all(targetIds.map(id => api.toggleSubscription(id)));
    } catch (e) {
      console.error('Failed to sync subscriptions', e);
      // Revert on failure (simplified)
      alert('Failed to sync changes. Please refresh.');
    }
  };

  const handleToggleSub = async (catId: number) => {
    try {
      await api.toggleSubscription(catId);
      setSubscriptions(prev =>
        prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
      );
    } catch (e) {
      alert('Failed to update subscription');
    }
  };

  const activeRequests = requests.filter(r => r.status === 'OPEN').length;
  // Mock data for stats - in real app, fetch from API
  const totalOffers = 0;
  const totalSavings = "$0.00";

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-in fade-in duration-500 min-h-[calc(100vh-100px)]">

      {/* Main Content */}
      <div className="flex-1 space-y-8">

        {/* Hero & Stats */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10 mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">
                Welcome back, <span className="gradient-text">{user?.name}</span>
              </h1>
              <p className="text-muted-foreground text-lg">Manage your RFQs and track quotations.</p>
            </div>

            <Link
              href="/user/requests/create"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>Post New Request</span>
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* @ts-ignore */}
            <StatCard label="Active Requests" value={activeRequests} trend="2 this week" trendUp={true} />
            {/* @ts-ignore */}
            <StatCard label="Total Offers" value="-" />
            {/* @ts-ignore */}
            <StatCard label="Total Savings" value="$0.00" />
          </div>
        </div>

        {/* Requests Grid */}
        <div id="my-requests" className="scroll-mt-24">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            Recent Requests
            <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{requests.length}</span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-medium mb-2">No requests yet</p>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Start by creating your first Request for Quotation to receive offers from suppliers.</p>
              <Link href="/user/requests/create" className="text-primary font-semibold hover:underline">Create Request</Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {requests.map((req) => (
                <Link
                  key={req.id}
                  href={`/user/requests/${req.id}`}
                  className="glass-card p-6 rounded-2xl group border border-white/40 dark:border-white/10 hover:border-primary/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-24 h-24 text-primary transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                  </div>

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-md ${req.status === 'OPEN' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
                      req.status === 'AWARDED' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' :
                        'bg-gray-100 text-gray-600 border border-gray-200'
                      }`}>
                      {req.status}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
                      {new Date(req.created_at * 1000).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="relative z-10">
                    <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">{req.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5 line-clamp-2 min-h-[40px]">{req.description}</p>

                    <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground pt-4 border-t border-border/50">
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-secondary">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                        </span>
                        {req.category}
                      </div>
                      <div className="w-px h-4 bg-border/50" />
                      <div className="flex items-center gap-1.5">
                        <span className="p-1 rounded bg-secondary">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                        </span>
                        {req.quantity}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar / Improvements */}
      <div className="w-full md:w-80 space-y-6">

        {/* Subscriptions Widget */}
        <div className="glass-panel p-6 rounded-2xl sticky top-24 md:min-h-[400px] flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-lg">Subscriptions</h3>
            <button
              onClick={handleSelectAll}
              className="text-xs font-medium text-primary hover:underline"
            >
              {subscriptions.length === categories.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mb-4">
            Select categories to receive real-time notifications for new opportunities.
          </p>

          <div className="flex flex-wrap gap-2 overflow-y-auto pr-2 pl-2 custom-scrollbar flex-1 content-start">
            {categories.map(cat => (
              /* @ts-ignore */
              <SubscriptionPill
                key={cat.id}
                label={cat.name}
                active={subscriptions.includes(cat.id)}
                onClick={() => handleToggleSub(cat.id)}
              />
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
