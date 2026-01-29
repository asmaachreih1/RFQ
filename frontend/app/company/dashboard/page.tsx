'use client';

import Link from 'next/link';
import { api, RFQ } from '@/lib/api';
import { useEffect, useState } from 'react';
import { useApp } from '../../Providers';
import StatCard from '@/app/components/StatCard';
import SubscriptionPill from '@/app/components/SubscriptionPill';

export default function CompanyDashboardPage() {
  const { user } = useApp();
  const [requests, setRequests] = useState<RFQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Subscription state
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [subscriptions, setSubscriptions] = useState<number[]>([]);

  // Stats state
  const [stats, setStats] = useState({ requests: 0, quotations: 0, deals: 0 });

  useEffect(() => {
    async function load() {
      if (user) {
        try {
          // Parallel fetch for dashboard data
          const [reqs, cats, subs, quotes] = await Promise.all([
            api.getRequests('company'),
            api.getCategories(),
            api.getSubscriptions(),
            api.getCompanyQuotations()
          ]);

          setRequests(reqs);
          setCategories(cats);
          setSubscriptions(subs.map((s: any) => s.category_id));

          // Calculate stats
          const activeQuotes = quotes.filter((q: any) => q.status === 'PENDING').length;
          const won = quotes.filter((q: any) => q.status === 'ACCEPTED').length;

          setStats({
            requests: reqs.length,
            quotations: activeQuotes,
            deals: won
          });

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
      await Promise.all(targetIds.map(id => api.toggleSubscription(id)));
    } catch (e) {
      console.error('Failed to sync subscriptions', e);
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



  const filteredRequests = requests.filter(req =>
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                Welcome, <span className="gradient-text">{user?.name}</span>
              </h1>
              <p className="text-muted-foreground text-lg">Browse requests and manage your quotations.</p>
            </div>

            <Link
              href="/company/quotations"
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-xl font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2 group"
            >
              <span>My Quotations</span>
              <svg className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* @ts-ignore */}
            <StatCard label="Available Requests" value={stats.requests} trend="New today" trendUp={true} />
            {/* @ts-ignore */}
            <StatCard label="Active Quotations" value={stats.quotations} />
            {/* @ts-ignore */}
            <StatCard label="Deals Won" value={stats.deals} />
          </div>
        </div>

        {/* Requests Grid */}
        <div id="available-requests" className="scroll-mt-24">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Available Requests
              <span className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full">{filteredRequests.length}</span>
            </h2>

            <div className="relative w-full sm:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search requests..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-background border border-border/50 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all text-sm shadow-sm"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-48 rounded-2xl bg-muted/50 animate-pulse" />
              ))}
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="glass-panel p-12 text-center rounded-2xl border-dashed border-2 flex flex-col items-center justify-center min-h-[300px]">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <p className="text-xl font-medium mb-2">No matching requests</p>
              <p className="text-muted-foreground mb-6 max-w-sm mx-auto">Subscribe to more categories to see relevant opportunities.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredRequests.map((req) => (
                <Link
                  key={req.id}
                  href={`/company/requests/${req.id}`}
                  className="glass-card p-6 rounded-2xl group border border-white/40 dark:border-white/10 hover:border-primary/50 relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <svg className="w-24 h-24 text-primary transform translate-x-4 -translate-y-4" fill="currentColor" viewBox="0 0 24 24"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" /></svg>
                  </div>

                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide shadow-sm backdrop-blur-md ${req.status === 'OPEN' ? 'bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20' :
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
