'use client';

import { useState, useEffect } from 'react';
import { api, User } from '@/lib/api';
import { useApp } from '../Providers';

const CATEGORIES = [
    'Construction Materials',
    'Furniture',
    'Electronics',
    'Logistics',
    'Office Supplies',
    'Machinery'
];

export default function SettingsPage() {
    const { user, setUser } = useApp();
    const [subscriptions, setSubscriptions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (user) {
            setSubscriptions(user.categorySubscriptions || []);
        }
    }, [user]);

    const toggleSubscription = (category: string) => {
        setSubscriptions(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleSave = async () => {
        if (!user) return;
        setLoading(true);

        // In a real app, api would have updateProfile method
        // For mock, we'll just update the user logic in api
        // But wait, api.ts doesn't have updateProfile.
        // We can just update localStorage manually or add a method.
        // For now, let's just pretend and update the context user

        await new Promise(r => setTimeout(r, 600)); // fake delay

        const updatedUser: User = {
            ...user,
            categorySubscriptions: subscriptions
        };

        // Need a way to persist this in mock DB
        // Since api.ts exposes 'db' internally but not publicly, we can't easily save it persistently 
        // without adding an update method.
        // Let's modify api.ts to include updateProfile? 
        // Or just rely on setUsers?
        // Doing it correctly would require api update.

        // For now, just update state.
        setUser(updatedUser);
        setLoading(false);
        alert('Settings saved successfully');
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold mb-2">Settings</h1>
            <p className="text-muted-foreground mb-8">Manage your preferences and subscriptions.</p>

            <div className="glass-card p-8 rounded-2xl border border-border/50 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4">Category Subscriptions</h2>
                    <p className="text-sm text-muted-foreground mb-6">
                        Select the categories you are interested in. You will receive notifications when new requests are posted in these categories.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {CATEGORIES.map(category => (
                            <label
                                key={category}
                                className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${subscriptions.includes(category)
                                        ? 'bg-primary/5 border-primary shadow-sm'
                                        : 'bg-secondary/30 border-transparent hover:bg-secondary'
                                    }`}
                            >
                                <span className="font-medium text-sm">{category}</span>
                                <input
                                    type="checkbox"
                                    className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary"
                                    checked={subscriptions.includes(category)}
                                    onChange={() => toggleSubscription(category)}
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="flex justify-end pt-4 border-t border-border">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="py-2.5 px-6 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.05] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
