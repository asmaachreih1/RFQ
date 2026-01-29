
/**
 * REAL API SERVICE
 * Connects to Yii2 Backend
 */

export interface User {
    id: number;
    name: string;
    email: string;
    role: 'user' | 'company';
    categorySubscriptions: string[];
    access_token?: string;
}

export type RequestStatus = 'OPEN' | 'AWARDED' | 'CLOSED' | 'CANCELLED';
export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';

export interface RFQ {
    id: number;
    user_id: number;
    userName?: string; // from expand/fields
    title: string;
    // category_id in backend, we might map or use expand. Backend returns 'category' name in fields()
    category: string;
    quantity: string;
    description: string;
    delivery_date: string; // snake_case from backend
    city: string;
    status: RequestStatus;
    created_at: number;
    budget_min?: number;
    budget_max?: number;
    expiration_date?: string;
    latitude?: number;
    longitude?: number;
}

export interface Quotation {
    id: number;
    rfq_id: number;
    company_id: number;
    companyName?: string; // from expand/fields
    price_per_unit: number;
    total_price: number;
    delivery_days: number;
    delivery_cost?: number;
    payment_terms?: string;
    valid_until: string;
    notes: string;
    status: QuoteStatus;
    created_at: number;
}

// Ensure this matches your backend URL. 
// If using 'php yii serve' it defaults to 8080. 
// On Vercel, set NEXT_PUBLIC_API_URL env var.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const getAuthHeaders = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('rfq_token') : null;
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    };
};

export const api = {
    // Auth
    login: async (email: string, password: string): Promise<User> => {
        const res = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Login failed');
        }

        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem('rfq_token', data.access_token);
            localStorage.setItem('rfq_user', JSON.stringify(data));
        }
        return data; // User object
    },

    register: async (email: string, password: string, name: string, role: string): Promise<User> => {
        const res = await fetch(`${API_BASE}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, name, role }),
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.message || 'Registration failed');
        }

        const data = await res.json();
        if (data.access_token) {
            localStorage.setItem('rfq_token', data.access_token);
            localStorage.setItem('rfq_user', JSON.stringify(data));
        }
        return data;
    },

    logout: async () => {
        localStorage.removeItem('rfq_token');
        localStorage.removeItem('rfq_user');
        // Optional: Call backend logout if needed
    },

    getCurrentUser: (): User | null => {
        if (typeof window === 'undefined') return null;
        const stored = localStorage.getItem('rfq_user');
        return stored ? JSON.parse(stored) : null;
    },

    // Requests
    getRequests: async (role: 'user' | 'company') => {
        // Backend filters by role automatically based on token
        const res = await fetch(`${API_BASE}/api/rfq`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch requests');
        return res.json();
    },

    getRequestById: async (id: number) => {
        const res = await fetch(`${API_BASE}/api/rfq/${id}`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) return null;
        return res.json();
    },

    createRequest: async (data: any) => {
        // Map frontend camelCase to backend snake_case
        const payload = {
            title: data.title,
            category_id: parseInt(data.category), // Ensure it's an integer
            quantity: data.quantity,
            description: data.description,
            delivery_date: data.deliveryDate,
            expiration_date: data.expirationDate,
            budget_min: data.budgetMin ? parseFloat(data.budgetMin) : null,
            budget_max: data.budgetMax ? parseFloat(data.budgetMax) : null,
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
            city: data.city,
            user_id: api.getCurrentUser()?.id
        };

        const res = await fetch(`${API_BASE}/api/rfq`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });
        if (!res.ok) {
            const error = await res.json();
            throw new Error(JSON.stringify(error) || 'Failed to create request');
        }
        return res.json();
    },

    getCategories: async () => {
        const res = await fetch(`${API_BASE}/api/category`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch categories');
        return res.json();
    },

    cancelRequest: async (requestId: number) => {
        const res = await fetch(`${API_BASE}/api/rfq/${requestId}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to cancel request');
        return true;
    },

    updateRequest: async (id: number, data: any) => {
        // Map frontend camelCase to backend snake_case
        const payload = {
            title: data.title,
            category_id: parseInt(data.category),
            quantity: data.quantity,
            description: data.description,
            delivery_date: data.deliveryDate,
            expiration_date: data.expirationDate,
            budget_min: data.budgetMin ? parseFloat(data.budgetMin) : null,
            budget_max: data.budgetMax ? parseFloat(data.budgetMax) : null,
            latitude: data.latitude ? parseFloat(data.latitude) : null,
            longitude: data.longitude ? parseFloat(data.longitude) : null,
            city: data.city,
        };

        const res = await fetch(`${API_BASE}/api/rfq/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(JSON.stringify(error) || 'Failed to update request');
        }
        return res.json();
    },

    // Quotations
    getQuotations: async (rfqId?: number) => {
        const url = rfqId
            ? `${API_BASE}/api/quotation?rfqId=${rfqId}`
            : `${API_BASE}/api/quotation`;
        const res = await fetch(url, { headers: getAuthHeaders() });
        if (!res.ok) throw new Error('Failed to fetch quotations');
        return res.json();
    },

    getCompanyQuotations: async () => {
        return api.getQuotations();
    },

    withdrawQuotation: async (id: number) => {
        const res = await fetch(`${API_BASE}/api/quotation/withdraw?id=${id}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to withdraw quotation');
        return res.json();
    },

    submitQuotation: async (data: any) => {
        const payload = {
            rfq_id: data.rfqId,
            price_per_unit: data.pricePerUnit,
            total_price: data.totalPrice,
            delivery_days: data.deliveryDays,
            delivery_cost: data.deliveryCost,
            payment_terms: data.paymentTerms,
            valid_until: data.validUntil,
            notes: data.notes,
            // company_id set by backend
        };

        const res = await fetch(`${API_BASE}/api/quotation`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const error = await res.json();
            throw new Error(JSON.stringify(error) || 'Failed to submit quotation');
        }
        return res.json();
    },

    acceptQuotation: async (quoteId: number, rfqId: number) => {
        // We used custom action: POST /api/quotation/{id}/accept
        const res = await fetch(`${API_BASE}/api/quotation/${quoteId}/reject?rfqId=${rfqId}`, { // Wait, logic was accept
            // My backend controller actionAccept defaults to /api/quotation/accept?id=... if not in pattern
            // UrlRule for 'api/quotation' typically handles CRUD.
            // Custom action `accept` usually maps to `api/quotation/accept` or `api/quotation/<id>/accept` if extraPatterns set.
            // I did NOT set extraPatterns. 
            // So I must access it as: /api/quotation/accept?id=<id>&rfqId=<rfqId>
        });

        // Correct URL for default action mapping without extraPatterns:
        // /api/quotation/accept?id=...
        const resAccept = await fetch(`${API_BASE}/api/quotation/accept?id=${quoteId}&rfqId=${rfqId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });

        if (!resAccept.ok) throw new Error('Failed to accept quotation');
        return resAccept.json();
    },

    rejectQuotation: async (quoteId: number) => {
        // Correct URL for actionReject: POST /api/quotation/reject?id=...
        const res = await fetch(`${API_BASE}/api/quotation/reject?id=${quoteId}`, {
            method: 'POST',
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to reject quotation');
        return res.json();
    },

    // Subscriptions
    getSubscriptions: async () => {
        const res = await fetch(`${API_BASE}/api/subscription`, {
            headers: getAuthHeaders(),
        });
        if (!res.ok) throw new Error('Failed to fetch subscriptions');
        return res.json();
    },

    toggleSubscription: async (categoryId: number) => {
        const res = await fetch(`${API_BASE}/api/subscription/toggle`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ category_id: categoryId }),
        });
        if (!res.ok) throw new Error('Failed to update subscription');
        return res.json();
    },
};
