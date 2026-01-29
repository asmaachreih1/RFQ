'use client';

import { useState } from 'react';

const CATEGORIES = [
  'Construction Materials',
  'Furniture',
  'Electronics',
  'Machinery',
  'Logistics',
];

export default function UserSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<string[]>([
    'Construction Materials',
  ]);

  const toggleCategory = (category: string) => {
    setSubscriptions((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        paddingTop: 32,
        display: 'flex',
        flexDirection: 'column',
        gap: 20,
      }}
    >
      <h1 style={{ fontSize: 22, fontWeight: 600 }}>
        Category Subscriptions
      </h1>

      <p style={{ fontSize: 14, color: '#6b7280' }}>
        You will receive notifications when new requests are posted in
        selected categories.
      </p>

      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: 14,
          padding: 16,
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}
      >
        {CATEGORIES.map((category) => (
          <label
            key={category}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              cursor: 'pointer',
            }}
          >
            <input
              type="checkbox"
              checked={subscriptions.includes(category)}
              onChange={() => toggleCategory(category)}
            />
            <span style={{ fontSize: 14 }}>{category}</span>
          </label>
        ))}
      </div>

      <button
        style={{
          marginTop: 12,
          background: '#2563eb',
          color: '#ffffff',
          padding: '10px 14px',
          borderRadius: 10,
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
        }}
        onClick={() =>
          alert(
            `Saved subscriptions:\n${subscriptions.join(', ')}`
          )
        }
      >
        Save Preferences
      </button>
    </div>
  );
}
