'use client';

import Link from 'next/link';
import { useApp } from '../Providers';

export default function AboutPage() {
    const { user } = useApp();

    return (
        <div className="flex flex-col gap-10 py-10">
            {/* Hero Section */}
            <section className="text-center max-w-4xl mx-auto space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Why Use <span className="text-primary">RFQ Marketplace?</span>
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed">
                    We bridge the gap between businesses and suppliers, transforming complex procurement into a seamless digital experience.
                </p>
            </section>

            {/* Main Content Grid */}
            <section className="grid md:grid-cols-2 gap-12 items-center max-w-6xl mx-auto px-4">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">The Problem</h2>
                        <p className="text-muted-foreground">
                            Traditional procurement is slow, fragmented, and opaque. Relying on endless email chains, spreadsheets, and phone calls to get quotes leads to delays and missed opportunities.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold text-foreground">Our Solution</h2>
                        <ul className="space-y-3">
                            {[
                                "Centralized Dashboard: Manage all your requests in one place.",
                                "Real-time Comparisons: Compare quotes side-by-side to find the best deal.",
                                "Verified Suppliers: Connect with trusted partners instantly.",
                                "Compliance & History: Keep a secure audit trail of all transactions."
                            ].map((item, i) => (
                                <li key={i} className="flex items-start gap-3">
                                    <div className="mt-1 h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                                        <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <span className="text-foreground/80">{item}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Visual / Card */}
                <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-tr from-primary/20 to-secondary/20 rounded-3xl blur-2xl -z-10" />
                    <div className="glass-card p-8 rounded-3xl border border-white/20 relative">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-border">
                                <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                                    1
                                </div>
                                <div>
                                    <h3 className="font-semibold">Post a Request</h3>
                                    <p className="text-xs text-muted-foreground">Describe what you need</p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-border">
                                <div className="h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                                    2
                                </div>
                                <div>
                                    <h3 className="font-semibold">Receive Quotes</h3>
                                    <p className="text-xs text-muted-foreground">Suppliers compete for your business</p>
                                </div>
                            </div>
                            <div className="flex justify-center">
                                <svg className="w-6 h-6 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </div>
                            <div className="flex items-center gap-4 p-4 rounded-xl bg-white/50 dark:bg-black/20 border border-border">
                                <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                                    3
                                </div>
                                <div>
                                    <h3 className="font-semibold">Select & Order</h3>
                                    <p className="text-xs text-muted-foreground">Award the best offer instantly</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="mt-10 text-center">
                <h2 className="text-2xl font-bold mb-6">Ready to streamline your procurement?</h2>
                {!user ? (
                    <Link
                        href="/auth/register"
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        Create Free Account
                    </Link>
                ) : (
                    <Link
                        href={user.role === 'user' ? '/user/dashboard' : '/company/dashboard'}
                        className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-base font-semibold text-white shadow-lg hover:bg-primary/90 transition-all hover:scale-105"
                    >
                        Go to Dashboard
                    </Link>
                )}
            </section>
        </div>
    );
}
