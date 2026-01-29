'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';

export default function EditRequestPage() {
    const router = useRouter();
    const { id } = useParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
    const [formData, setFormData] = useState({
        title: '',
        category: '', // This will hold the ID as string
        quantity: '',
        description: '',
        deliveryDate: '',
        expirationDate: '',
        budgetMin: '',
        budgetMax: '',
        latitude: '',
        longitude: '',
        city: '',
    });

    useEffect(() => {
        async function load() {
            try {
                const [cats, request] = await Promise.all([
                    api.getCategories(),
                    api.getRequestById(Number(id))
                ]);

                setCategories(cats);

                if (request) {
                    setFormData({
                        title: request.title,
                        category: request.category_id ? String(request.category_id) : '',
                        quantity: request.quantity,
                        description: request.description || '',
                        deliveryDate: request.delivery_date || '',
                        expirationDate: request.expiration_date || '',
                        budgetMin: request.budget_min ? String(request.budget_min) : '',
                        budgetMax: request.budget_max ? String(request.budget_max) : '',
                        latitude: request.latitude ? String(request.latitude) : '',
                        longitude: request.longitude ? String(request.longitude) : '',
                        city: request.city || ''
                    });
                    // Fallback for category ID if not directly on object but name is
                    if (!request.category_id && request.category) {
                        const cat = cats.find((c: { name: string; id: number }) => c.name === request.category);
                        if (cat) setFormData(prev => ({ ...prev, category: String(cat.id) }));
                    }
                }
            } catch (e) {
                console.error(e);
                alert('Failed to load request');
            } finally {
                setLoading(false);
            }
        }
        if (id) load();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await api.updateRequest(Number(id), formData);
            alert('Request updated successfully');
            router.push(`/user/requests/${id}`);
        } catch (e: any) {
            console.error(e);
            alert(`Failed to update request: ${e.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="max-w-2xl mx-auto glass-card rounded-2xl p-8 animate-in fade-in slide-in-from-bottom-5 duration-500">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Edit Request</h1>
                <p className="text-muted-foreground">Update your request details.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1.5">Request Title</label>
                        <input
                            required
                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                            placeholder="e.g. 5 Tons of Steel"
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Category</label>
                            <select
                                required
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.category} // Stores ID
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Quantity</label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                placeholder="e.g. 500 units"
                                value={formData.quantity}
                                onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Description</label>
                        <textarea
                            required
                            className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all min-h-[120px]"
                            placeholder="Detailed specifications..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Needed By</label>
                            <input
                                type="date"
                                required
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.deliveryDate}
                                onChange={e => setFormData({ ...formData, deliveryDate: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Expires On</label>
                            <input
                                type="date"
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.expirationDate}
                                onChange={e => setFormData({ ...formData, expirationDate: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Budget Range (Optional)</label>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={formData.budgetMin}
                                    onChange={e => setFormData({ ...formData, budgetMin: e.target.value })}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                    value={formData.budgetMax}
                                    onChange={e => setFormData({ ...formData, budgetMax: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Delivery City</label>
                            <input
                                required
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.city}
                                onChange={e => setFormData({ ...formData, city: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1.5">Location Coordinates (Optional)</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                type="number"
                                placeholder="Latitude"
                                step="any"
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.latitude}
                                onChange={e => setFormData({ ...formData, latitude: e.target.value })}
                            />
                            <input
                                type="number"
                                placeholder="Longitude"
                                step="any"
                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-transparent focus:bg-background focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                                value={formData.longitude}
                                onChange={e => setFormData({ ...formData, longitude: e.target.value })}
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            setFormData(prev => ({
                                                ...prev,
                                                latitude: String(pos.coords.latitude),
                                                longitude: String(pos.coords.longitude)
                                            }));
                                        },
                                        (err) => alert('Could not get location: ' + err.message)
                                    );
                                } else {
                                    alert('Geolocation is not supported by your browser');
                                }
                            }}
                            className="text-sm font-medium text-primary hover:underline flex items-center gap-1"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Use Current Location
                        </button>
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 px-4 rounded-xl border border-border font-semibold hover:bg-muted transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex-1 py-3 px-4 rounded-xl bg-primary text-white font-semibold shadow-lg shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                    >
                        {saving ? 'Saving...' : 'Update Request'}
                    </button>
                </div>
            </form>
        </div>
    );
}
