import React from 'react';

interface SubscriptionPillProps {
    label: string;
    active: boolean;
    onClick: () => void;
}

export default function SubscriptionPill({ label, active, onClick }: SubscriptionPillProps) {
    return (
        <button
            onClick={onClick}
            className={`
        px-4 py-2 rounded-full text-sm font-medium transition-all duration-300
        ${active
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                    : 'bg-secondary/50 text-secondary-foreground hover:bg-secondary border border-transparent hover:border-primary/20'
                }
      `}
        >
            {label}
            {active && <span className="ml-2 opacity-70">✓</span>}
        </button>
    );
}
